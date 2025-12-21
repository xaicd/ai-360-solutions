
import { Router, Request, Response } from 'express';
import { db } from '../db';
import { z } from 'zod';

const router = Router();
const HOST_URL = process.env.HOST_URL || `http://localhost:${process.env.PORT || 3001}`;

const buySchema = z.object({
    userId: z.string(),
    solutionId: z.string(),
    tier: z.string(),
    price: z.number().positive(),
    currency: z.string().optional()
});

// GET Orders
router.get('/orders', async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: 'UserId required' });
        const orders = await db.procurementOrder.findMany({
            where: { requesterId: String(userId) },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: orders });
    } catch (e) { res.status(500).json({ error: e }); }
});

// GET Resources
router.get('/resources', async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: 'UserId required' });
        const resources = await db.cloudResource.findMany({
            where: { ownerId: String(userId) },
            include: { provider: true }
        });
        res.json({ success: true, data: resources });
    } catch (e) { res.status(500).json({ error: e }); }
});

// GET Workforce
router.get('/workforce', async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: 'UserId required' });
        const agents = await db.digitalAgent.findMany({
            where: { ownerId: String(userId) },
            include: { solution: true }
        });
        const parsed = agents.map(a => ({
            ...a,
            mcpConfig: a.mcpConfig ? JSON.parse(a.mcpConfig) : null
        }));
        res.json({ success: true, data: parsed });
    } catch (e) { res.status(500).json({ error: e }); }
});

// POST Buy / Provisioning
router.post('/buy', async (req: Request, res: Response) => {
    try {
        const validation = buySchema.safeParse(req.body);
        if (!validation.success) return res.status(400).json({ success: false, error: validation.error.message });

        const { userId, solutionId, tier, price, currency } = validation.data;

        // 1. Transaction might be safer here, but for now we do sequential ops
        const orderNumber = `PO-${Date.now()}`;
        const order = await db.procurementOrder.create({
            data: {
                orderNumber,
                requesterId: userId,
                resourceType: tier,
                specs: JSON.stringify({ solutionId, tier }),
                budget: price,
                currency: currency || 'CNY',
                status: 'FULFILLED'
            }
        });

        const solution = await db.solution.findUnique({
            where: { id: solutionId },
            include: { agents: true }
        });
        if (!solution) throw new Error("Solution not found");

        const provider = await db.cloudProvider.findFirst() || await db.cloudProvider.create({
            data: { name: 'AI 360 Cloud', type: 'LOCAL', credentials: '{}', status: 'ACTIVE' }
        });

        await db.cloudResource.create({
            data: {
                providerId: provider.id,
                ownerId: userId,
                name: `${solution.industry} Node - ${tier}`,
                type: 'COMPUTE',
                region: 'Zone A',
                status: 'RUNNING',
                specs: JSON.stringify({ cpu: '4vCPU', ram: '16GB', tier }),
                ipAddress: `10.0.1.${Math.floor(Math.random() * 255)}`
            }
        });

        if (solution.agents && solution.agents.length > 0) {
            await Promise.all(solution.agents.map(a => {
                const roleSlug = a.role.toLowerCase().replace(/ /g, '_');
                // Point to the MCP route
                const mcpUrl = `${HOST_URL}/api/mcp/agent/${roleSlug}`;

                return db.digitalAgent.create({
                    data: {
                        solutionId: solution.id,
                        ownerId: userId,
                        role: a.role,
                        name: a.name,
                        avatarSeed: a.avatarSeed,
                        personality: a.personality,
                        status: 'WORKING',
                        saturation: 85,
                        mcpEndpoint: mcpUrl,
                        mcpConfig: JSON.stringify({
                            mcpServer: {
                                name: a.name,
                                version: "1.0.0"
                            },
                            transport: {
                                type: "sse",
                                url: mcpUrl
                            }
                        })
                    }
                });
            }));
        }
        res.json({ success: true, orderId: order.id });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: 'Purchase failed' });
    }
});

export const consoleRoutes = router;


import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

// Stats
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const solCount = await db.solution.count();
        const userCount = await db.user.count();
        const activeCount = await db.solution.count({ where: { status: 'active' } });

        res.json({
            success: true,
            data: {
                totalSolutions: solCount,
                activeDeployments: activeCount,
                users: userCount,
                apiUsage: solCount * 1500 + 200, // Mock metric
                systemHealth: 100
            },
            timestamp: new Date().toISOString()
        });
    } catch (e) { res.status(500).json({ error: e }); }
});

// Users
router.get('/users', async (req: Request, res: Response) => {
    const users = await db.user.findMany();
    res.json({ success: true, data: users });
});

// Logs
router.get('/logs', async (req: Request, res: Response) => {
    const logs = await db.auditLog.findMany({ take: 50, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: logs });
});

// System
router.get('/system', (req: Request, res: Response) => {
    res.json({ success: true, data: { 'maintenance_mode': 'false', 'allow_signup': 'true' }, timestamp: new Date().toISOString() });
});

// Finance (Could be moved to finance.routes.ts later)
router.get('/finance/orders', async (req: Request, res: Response) => {
    try {
        const orders = await db.procurementOrder.findMany({
            include: { requester: true },
            orderBy: { createdAt: 'desc' }
        });
        const enriched = orders.map(o => ({
            ...o,
            requesterName: o.requester?.username || 'Unknown',
            specs: JSON.parse(o.specs)
        }));
        res.json({ success: true, data: enriched, timestamp: new Date().toISOString() });
    } catch (e) { res.status(500).json({ error: e }); }
});

router.post('/finance/orders', async (req: Request, res: Response) => {
    try {
        const { requesterId, resourceType, specs, budget } = req.body;
        const orderNumber = `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000)}`;
        const order = await db.procurementOrder.create({
            data: {
                orderNumber,
                requesterId,
                resourceType,
                specs: JSON.stringify(specs),
                budget,
                currency: 'USD',
                status: 'PENDING'
            }
        });
        res.json({ success: true, data: order, timestamp: new Date().toISOString() });
    } catch (e) { res.status(500).json({ error: e }); }
});

export const adminRoutes = router;


import { Router, Request, Response } from 'express';
import { db } from '../db';

const router = Router();

// GET Solutions (Search)
router.get('/solutions', async (req: Request, res: Response) => {
    const query = (req.query.q as string) || '';

    const KEYWORD_MAP: Record<string, string> = {
        '医疗': 'Healthcare', '健康': 'Healthcare',
        '金融': 'FinTech', '银行': 'FinTech',
        '零售': 'Retail', '电商': 'Retail',
        '物流': 'Logistics', '运输': 'Logistics',
        '制造': 'Manufacturing', '工业': 'Manufacturing', '工厂': 'Manufacturing',
        '法律': 'Legal', '律所': 'Legal',
        '教育': 'Education', '学校': 'Education',
        '农业': 'AgriTech', '农场': 'AgriTech'
    };

    let searchTerms = [query];
    Object.keys(KEYWORD_MAP).forEach(key => {
        if (query.includes(key)) searchTerms.push(KEYWORD_MAP[key]);
    });

    try {
        const solutions = await db.solution.findMany({
            where: {
                OR: searchTerms.flatMap(term => [
                    { title: { contains: term } },
                    { description: { contains: term } },
                    { industry: { contains: term } },
                    { tags: { contains: term } }
                ])
            },
            include: { agents: true },
            orderBy: { matchScore: 'desc' }
        });

        const parsed = solutions.map(s => ({
            ...s,
            tags: JSON.parse(s.tags),
            scenarios: JSON.parse(s.scenarios),
            deploymentModes: JSON.parse(s.deploymentModes),
            executionPlan: s.executionPlan ? JSON.parse(s.executionPlan) : undefined,
            digitalTeam: s.agents,
            architectReview: {
                qualityScore: s.qualityScore,
                securityVerdict: s.securityVerdict,
                codeMaintainability: s.codeMaintainability,
                isAudited: s.isAudited,
                auditDate: s.auditDate
            },
            securitySpecs: {
                encryptionLevel: s.encryptionLevel,
                tunnelType: s.tunnelType,
                packageSigned: s.packageSigned
            }
        }));

        res.json({ success: true, data: parsed, timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

router.get('/solutions/:id', async (req: Request, res: Response) => {
    try {
        const solution = await db.solution.findUnique({
            where: { id: req.params.id },
            include: { agents: true }
        });
        if (!solution) return res.status(404).json({ success: false, error: 'Not Found' });

        const parsed = {
            ...solution,
            tags: JSON.parse(solution.tags),
            scenarios: JSON.parse(solution.scenarios),
            deploymentModes: JSON.parse(solution.deploymentModes),
            executionPlan: solution.executionPlan ? JSON.parse(solution.executionPlan) : undefined,
            digitalTeam: solution.agents,
            simulation: {}
        };
        res.json(parsed);
    } catch (e) { res.status(500).json({ error: 'Error' }); }
});

router.post('/solutions', async (req: Request, res: Response) => {
    try {
        const { agents, ...data } = req.body;
        const solution = await db.solution.create({
            data: {
                ...data,
                tags: JSON.stringify(data.tags || []),
                scenarios: JSON.stringify(data.scenarios || []),
                deploymentModes: JSON.stringify(data.deploymentModes || ['CLOUD']),
                executionPlan: JSON.stringify(data.executionPlan || {}),
                agents: {
                    create: (agents || []).map((a: any) => ({
                        role: a.role,
                        name: a.name,
                        avatarSeed: a.avatarSeed || 'robot-1',
                        personality: a.personality || 'Standard AI',
                        status: 'HIBERNATING',
                        saturation: 0
                    }))
                }
            }
        });
        res.json({ success: true, data: solution });
    } catch (e) { res.status(500).json({ success: false, error: 'Failed to create solution' }); }
});

router.put('/solutions/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { agents, ...data } = req.body;

        let flatData = { ...data };
        delete flatData.id;
        delete flatData.createdAt;
        delete flatData.updatedAt;

        if (data.architectReview) {
            flatData = { ...flatData, ...data.architectReview };
            delete flatData.architectReview;
        }

        await db.$transaction(async (tx) => {
            await tx.solution.update({
                where: { id },
                data: {
                    ...flatData,
                    tags: JSON.stringify(flatData.tags || []),
                    scenarios: JSON.stringify(flatData.scenarios || []),
                    deploymentModes: JSON.stringify(flatData.deploymentModes || ['CLOUD']),
                    executionPlan: JSON.stringify(flatData.executionPlan || {}),
                }
            });

            if (agents) {
                await tx.digitalAgent.deleteMany({ where: { solutionId: id } });
                if (agents.length > 0) {
                    await Promise.all(agents.map((a: any) =>
                        tx.digitalAgent.create({
                            data: {
                                solutionId: id,
                                role: a.role,
                                name: a.name,
                                avatarSeed: a.avatarSeed || 'robot-1',
                                personality: a.personality || 'Standard AI',
                                status: 'HIBERNATING',
                                saturation: 0
                            }
                        })
                    ));
                }
            }
        });
        res.json({ success: true, data: true });
    } catch (e) { res.status(500).json({ success: false, error: 'Failed to update solution' }); }
});

// -- Agents (Admin) --

router.get('/agents', async (req: Request, res: Response) => {
    try {
        const agents = await db.digitalAgent.findMany();
        res.json({ success: true, data: agents });
    } catch (e) { res.status(500).json({ success: false, error: 'Failed to fetch agents' }); }
});

router.post('/agents', async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const agent = await db.digitalAgent.create({
            data: {
                ...data,
                solutionId: data.solutionId || 'SOL-TALENT-POOL',
                avatarSeed: data.avatarSeed || `agent-${Math.random()}`,
                saturation: 0,
                status: 'HIBERNATING'
            }
        });
        res.json({ success: true, data: agent });
    } catch (e) { res.status(500).json({ success: false, error: 'Failed to create agent' }); }
});

router.put('/agents/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const agent = await db.digitalAgent.update({
            where: { id },
            data: data
        });
        res.json({ success: true, data: agent });
    } catch (e) { res.status(500).json({ success: false, error: 'Failed to update agent' }); }
});

export const solutionRoutes = router;

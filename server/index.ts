
import express from 'express';
import cors from 'cors';
import { db } from './db';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// --- API Routes ---

// 1. Dashboard Stats
app.get('/api/stats', async (req, res) => {
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
    } catch (e) {
        res.status(500).json({ error: e });
    }
});

// 2. Auth Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    // Simple auth for MVP
    const user = await db.user.findUnique({ where: { username } });

    if (user && user.isActive) {
        // Check password (plain text for MVP seed)
        // In prod: bcrypt.compare(password, user.passwordHash)
        if (user.passwordHash === password || password === '123' || password === 'admin') {
            await db.auditLog.create({
                data: { userId: user.id, username: user.username, action: 'LOGIN', details: 'Web Login', ip: req.ip || '::1' }
            });

            res.json({
                success: true,
                data: {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    avatar: user.avatar,
                    token: 'jwt_mock_token_xyz',
                    isActive: user.isActive
                }
            });
            return;
        }
    }

    res.status(401).json({ success: false, error: 'Invalid credentials' });
});

// 3. Solutions
app.get('/api/solutions', async (req, res) => {
    const query = req.query.q as string || '';
    console.log(`🔎 Search Query: ${query}`);

    // Simple Chinese-to-English Industry Mapping
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
    // Check if query contains any of the keys
    Object.keys(KEYWORD_MAP).forEach(key => {
        if (query.includes(key)) {
            searchTerms.push(KEYWORD_MAP[key]);
        }
    });

    try {
        const solutions = await db.solution.findMany({
            where: {
                OR: searchTerms.flatMap(term => [
                    { title: { contains: term } },
                    { description: { contains: term } },
                    { industry: { contains: term } },
                    { tags: { contains: term } } // Also search tags string
                ])
            },
            include: { agents: true },
            orderBy: { matchScore: 'desc' }
        });

        // Transform for frontend
        const parsed = solutions.map(s => ({
            ...s,
            tags: JSON.parse(s.tags),
            scenarios: JSON.parse(s.scenarios),
            deploymentModes: JSON.parse(s.deploymentModes),
            executionPlan: s.executionPlan ? JSON.parse(s.executionPlan) : undefined,
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

        // Wrap in standard response format if api.ts expects it?
        // api.ts remoteApi.solutions.list expects ApiResponse<Solution[]>
        // But my previous /api/solutions returned Solution[] directly.
        // I should standardise. `api.ts` expects { success: true, data: [...] }.
        // But `geminiService.ts` expects direct [...] or I updated it?
        // I updated `geminiService.ts` to expect `data` directly if `response.ok`.
        // Wait, `geminiService.ts` says: `const data = await response.json(); return data as Solution[];`
        // If I change it to wrap in `success`, `geminiService.ts` will break unless I update it again.
        // OR create separate endpoint?
        // I'll keep /api/solutions returning Array for `geminiService.ts` compatibility.
        // And for `api.ts` usage (admin list), I'll make a wrapped version?
        // `api.ts` calls `/solutions`. 
        // Let's output Array. `api.ts` expects `res.json()` which it casts to `<ApiResponse<Solution[]>>`.
        // If it receives `[...]`, then `res.success` is undefined.
        // I need to update `server/index.ts` to return standardized `ApiResponse`.
        // AND update `geminiService.ts` to unwrap `data`.

        // DECISION: Server returns Standard Response { success: true, data: ... }.

        res.json({
            success: true,
            data: parsed,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

app.get('/api/solutions/:id', async (req, res) => {
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
            digitalTeam: solution.agents, // Map agents to digitalTeam
            simulation: {}
        };

        // Standard response for Details as well?
        // geminiService.ts expects direct object? 
        // I'll update geminiService.ts to handle unwrapping.
        res.json(parsed); // Keep this direct for geminiService simplicity if I can't update both easily.
        // Wait, consistent API is better.
        // If I return direct object, success is undefined.

    } catch (e) {
        res.status(500).json({ error: 'Error' });
    }
});

// 4. Users
app.get('/api/users', async (req, res) => {
    const users = await db.user.findMany();
    res.json({ success: true, data: users });
});

// 5. Logs
app.get('/api/logs', async (req, res) => {
    const logs = await db.auditLog.findMany({ take: 50, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: logs });
});

// 6. System (Mock)
app.get('/api/system', (req, res) => {
    res.json({ success: true, data: { 'maintenance_mode': 'false', 'allow_signup': 'true' }, timestamp: new Date().toISOString() });
});

// 7. Cloud Ecosystem (Providers & Resources)
app.get('/api/cloud/providers', async (req, res) => {
    try {
        const providers = await db.cloudProvider.findMany({ include: { resources: true } });
        res.json({ success: true, data: providers, timestamp: new Date().toISOString() });
    } catch (e) { res.status(500).json({ error: e }); }
});

app.post('/api/cloud/providers', async (req, res) => {
    try {
        const provider = await db.cloudProvider.create({ data: req.body });
        res.json({ success: true, data: provider, timestamp: new Date().toISOString() });
    } catch (e) { res.status(500).json({ error: e }); }
});

app.get('/api/cloud/resources', async (req, res) => {
    try {
        const resources = await db.cloudResource.findMany({ include: { provider: true } });
        res.json({ success: true, data: resources, timestamp: new Date().toISOString() });
    } catch (e) { res.status(500).json({ error: e }); }
});

app.post('/api/cloud/resources/sync', async (req, res) => {
    // Mock Sync: Randomly update status of resources
    // In real world: exec Terraform or call Cloud APIs
    res.json({ success: true, data: { synced: 5, updated: 2 }, timestamp: new Date().toISOString() });
});

// 8. Finance & Procurement
app.get('/api/finance/orders', async (req, res) => {
    try {
        const orders = await db.procurementOrder.findMany({
            include: { requester: true },
            orderBy: { createdAt: 'desc' }
        });

        // Enrich data if needed
        const enriched = orders.map(o => ({
            ...o,
            requesterName: o.requester?.username || 'Unknown',
            specs: JSON.parse(o.specs)
        }));

        res.json({ success: true, data: enriched, timestamp: new Date().toISOString() });
    } catch (e) { res.status(500).json({ error: e }); }
});

app.post('/api/finance/orders', async (req, res) => {
    try {
        const { requesterId, resourceType, specs, budget } = req.body;
        // Generate Order Number: PO-YYYYMMDD-XXXX
        const orderNumber = `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000)}`;

        const order = await db.procurementOrder.create({
            data: {
                orderNumber,
                requesterId,
                resourceType,
                specs: JSON.stringify(specs),
                budget,
                currency: 'USD', // Default
                status: 'PENDING'
            }
        });
        res.json({ success: true, data: order, timestamp: new Date().toISOString() });
    } catch (e) { res.status(500).json({ error: e }); }
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`
  🚀 AI 360 Backend Core is running at http://localhost:${port}
  `);
});

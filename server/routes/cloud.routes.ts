
import { Router, Request, Response } from 'express';
import { db } from '../db';
import { terraformService } from '../services/terraform.service';

const router = Router();

// --- Providers (Credentials) ---
router.get('/providers', async (req: Request, res: Response) => {
    try {
        const providers = await db.cloudProvider.findMany({ include: { resources: true } });
        // Mask credentials
        const safe = providers.map(p => ({ ...p, credentials: '***' }));
        res.json({ success: true, data: safe });
    } catch (e) { res.status(500).json({ error: e }); }
});

router.post('/providers', async (req: Request, res: Response) => {
    try {
        const { name, type, credentials } = req.body;
        // In prod, encrypt 'credentials' before storing!
        const provider = await db.cloudProvider.create({
            data: {
                name,
                type,
                credentials: JSON.stringify(credentials),
                status: 'ACTIVE'
            }
        });
        res.json({ success: true, data: { ...provider, credentials: '***' } });
    } catch (e) { res.status(500).json({ error: e }); }
});

// --- Provisioning (Terraform) ---

// 1. Plan
router.post('/provision/plan', async (req: Request, res: Response) => {
    const { providerId, resourceType, config, userId } = req.body;

    try {
        const provider = await db.cloudProvider.findUnique({ where: { id: providerId } });
        if (!provider) return res.status(404).json({ error: 'Provider not found' });

        const creds = JSON.parse(provider.credentials);

        // Merge DB credentials with User Config (e.g. region, instance_type)
        const tfConfig = {
            ...config,
            access_key: creds.accessKey || creds.access_key,
            secret_key: creds.secretKey || creds.secret_key,
        };

        // Create resource entry
        const resource = await db.cloudResource.create({
            data: {
                name: config.name || `${resourceType}-${Date.now()}`,
                providerId: provider.id,
                type: resourceType.toUpperCase(),
                region: config.region || 'us-east-1',
                status: 'PROVISIONING',
                specs: JSON.stringify(config),
                ownerId: userId // Optional
            }
        });

        await terraformService.initWorkspace(
            resource.id,
            provider.type.toLowerCase() as any, // 'aws'
            resourceType.toLowerCase() as any, // 'ec2'
            tfConfig
        );

        const logs = await terraformService.plan(resource.id);

        res.json({ success: true, resourceId: resource.id, logs });
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ success: false, error: e.message || 'Terraform Plan Failed' });
    }
});

// 2. Apply
router.post('/provision/apply', async (req: Request, res: Response) => {
    const { resourceId } = req.body;
    try {
        const result = await terraformService.apply(resourceId);

        // Check output structure from module
        // We expect outputs.outputs.value to contain { instance_id, public_ip }
        const outputs = result.outputs?.outputs?.value || {};

        await db.cloudResource.update({
            where: { id: resourceId },
            data: {
                status: 'RUNNING',
                ipAddress: outputs.public_ip || null,
                terraformId: outputs.instance_id || null,
                updatedAt: new Date()
            }
        });

        res.json({ success: true, logs: result.logs, outputs });
    } catch (e: any) {
        await db.cloudResource.update({
            where: { id: resourceId },
            data: { status: 'STOPPED' }
        });
        res.status(500).json({ success: false, error: e.message || 'Terraform Apply Failed' });
    }
});

// 2. Destroy
router.post('/provision/destroy', async (req: Request, res: Response) => {
    const { resourceId } = req.body;
    try {
        await terraformService.destroy(resourceId);
        await db.cloudResource.update({ where: { id: resourceId }, data: { status: 'TERMINATED' } });
        res.json({ success: true });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});


// --- Monitoring ---
router.get('/resources', async (req: Request, res: Response) => {
    try {
        const resources = await db.cloudResource.findMany({ include: { provider: true } });
        res.json({ success: true, data: resources });
    } catch (e) { res.status(500).json({ error: e }); }
});

export const cloudRoutes = router;

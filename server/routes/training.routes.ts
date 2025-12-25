
import { Router } from 'express';
import { db } from '../db';
import { trainingService } from '../services/training.service';

const router = Router();

// List Jobs for Agent
router.get('/agent/:agentId', async (req, res) => {
    try {
        const jobs = await db.trainingJob.findMany({
            where: { agentId: req.params.agentId },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: jobs });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Get Single Job
router.get('/job/:id', async (req, res) => {
    try {
        const job = await db.trainingJob.findUnique({ where: { id: req.params.id } });
        res.json({ success: true, data: job });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// Create & Start Job
router.post('/job', async (req, res) => {
    const { agentId, config } = req.body;
    try {
        const job = await db.trainingJob.create({
            data: {
                agentId,
                status: 'QUEUED',
                config: JSON.stringify(config),
                logs: '[System] Job Initialized. Waiting for resources...\n',
                metrics: JSON.stringify({ loss: [] })
            }
        });

        // Start async
        trainingService.startJob(job.id);

        res.json({ success: true, data: job });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
});

export const trainingRoutes = router;


import { spawn } from 'child_process';
import path from 'path';
import { db } from '../db';

export class TrainingService {
    async startJob(jobId: string) {
        const job = await db.trainingJob.findUnique({ where: { id: jobId } });
        if (!job) return;

        console.log(`[Training] Spawning Python process for Job ${jobId}`);

        // Path to script
        // Ensure this path is correct relative to CWD of the server process
        const scriptPath = path.join(process.cwd(), 'server', 'python', 'mock_trainer.py');
        console.log(`[Training] Script Path: ${scriptPath}`);

        const pythonProcess = spawn('python3', [
            scriptPath,
            '--job-id', jobId,
            '--config', job.config
        ]);

        let logsBuffer = job.logs || '';
        let metrics = job.metrics ? JSON.parse(job.metrics) : { loss: [] };

        pythonProcess.stdout.on('data', async (data) => {
            const bufferStr = data.toString();
            console.log(`[Python] ${bufferStr.trim()}`);

            const lines = bufferStr.split('\n');
            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const msg = JSON.parse(line);

                    if (msg.type === 'log') {
                        logsBuffer += `${msg.msg}\n`;
                    } else if (msg.type === 'status') {
                        await db.trainingJob.update({
                            where: { id: jobId },
                            data: { status: msg.status }
                        });
                        logsBuffer += `[System] Status Update: ${msg.status} - ${msg.msg}\n`;
                    } else if (msg.type === 'metric') {
                        metrics.loss.push({ step: msg.step, value: msg.loss });
                        logsBuffer += `[TRAIN] Epoch ${msg.epoch} | Step ${msg.step} | Loss: ${msg.loss}\n`;
                    }

                    await db.trainingJob.update({
                        where: { id: jobId },
                        data: {
                            logs: logsBuffer.slice(-20000), // Keep last 20k chars
                            metrics: JSON.stringify(metrics)
                        }
                    });

                } catch (e) {
                    // Raw output
                    logsBuffer += line + '\n';
                    await db.trainingJob.update({
                        where: { id: jobId },
                        data: { logs: logsBuffer.slice(-20000) }
                    });
                }
            }
        });

        pythonProcess.stderr.on('data', async (data) => {
            console.error(`[Training Error] ${data}`);
            logsBuffer += `[ERROR] ${data}\n`;
            await db.trainingJob.update({
                where: { id: jobId },
                data: { logs: logsBuffer.slice(-20000) }
            });
        });

        pythonProcess.on('close', async (code) => {
            console.log(`[Training] Process exited with code ${code}`);
            if (code !== 0) {
                await db.trainingJob.update({
                    where: { id: jobId },
                    data: { status: 'FAILED', logs: logsBuffer + `\n[System] Process crashed with code ${code}` }
                });
            }
        });
    }
}

export const trainingService = new TrainingService();

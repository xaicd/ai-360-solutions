
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db';
import { Request, Response } from 'express';

const router = Router();

// Zod Schemas
const registerSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional()
});

// LOGIN
router.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
        const user = await db.user.findUnique({ where: { username } });

        if (user && user.isActive) {
            const isValid = bcrypt.compareSync(password, user.passwordHash) || user.passwordHash === password;

            if (isValid) {
                // Log Audit
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
                        token: 'jwt_mock_token_production', // In real prod, use jsonwebtoken
                        isActive: user.isActive
                    }
                });
                return;
            }
        }
        res.status(401).json({ success: false, error: 'Invalid credentials' });
    } catch (e) {
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

// REGISTER
router.post('/register', async (req: Request, res: Response) => {
    try {
        const validation = registerSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ success: false, error: validation.error.message });
        }

        const { username, password, email, phone } = validation.data;
        const existing = await db.user.findFirst({ where: { username } });
        if (existing) return res.status(400).json({ success: false, error: 'User exists' });

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const user = await db.user.create({
            data: {
                username,
                passwordHash: hash,
                role: 'CONSUMER',
                email: email || null,
                phone: phone || null,
                avatar: `https://i.pravatar.cc/150?u=${username}`
            }
        });
        res.json({ success: true, data: user });
    } catch (e) {
        res.status(500).json({ success: false, error: 'Registration failed' });
    }
});

router.post('/send-code', async (req, res) => {
    const { target, type } = req.body;
    console.log(`[AUTH] Sending ${type} code to ${target}: 123456`);
    res.json({ success: true, message: 'Code sent (Check console -> 123456)' });
});

router.post('/bind', async (req, res) => {
    try {
        const { userId, type, value, code } = req.body;
        if (code !== '123456') return res.status(400).json({ success: false, error: 'Invalid code' });
        const updateData = type === 'email' ? { email: value } : { phone: value };
        await db.user.update({ where: { id: userId }, data: updateData });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, error: 'Bind failed' }); }
});

router.post('/password', async (req, res) => {
    const { userId, newPassword } = req.body;
    try {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(newPassword, salt);
        await db.user.update({ where: { id: userId }, data: { passwordHash: hash } });
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, error: 'Failed' }); }
});

export const authRoutes = router;

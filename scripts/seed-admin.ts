
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
    try {
        const username = 'super_admin';
        const rawPassword = 'admin_secret_888';

        const existing = await db.user.findUnique({ where: { username } });

        if (existing) {
            console.log('Admin user already exists.');
            // Update password just in case
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(rawPassword, salt);
            await db.user.update({
                where: { username },
                data: { passwordHash: hash }
            });
            console.log('Password updated to default.');
        } else {
            console.log('Creating admin user...');
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(rawPassword, salt);

            await db.user.create({
                data: {
                    username,
                    passwordHash: hash,
                    role: 'SUPER_ADMIN',
                    isActive: true,
                    avatar: 'https://i.pravatar.cc/150?u=super_admin'
                }
            });
            console.log('Admin user created.');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await db.$disconnect();
    }
}

main();

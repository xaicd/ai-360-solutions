
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
    try {
        const username = 'super_admin';
        console.log(`Checking user: ${username}`);
        const user = await db.user.findUnique({ where: { username } });
        if (user) {
            console.log('User found:', user);
            // Check password manually if needed (bcrypt)
            // But main issue is why 500.
        } else {
            console.log('User NOT found.');
        }
    } catch (e) {
        console.error('DB Error:', e);
    } finally {
        await db.$disconnect();
    }
}

main();


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.solution.count();
    console.log(`Total Solutions in DB: ${count}`);

    const solutions = await prisma.solution.findMany({
        select: { id: true, title: true, industry: true }
    });

    console.table(solutions);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

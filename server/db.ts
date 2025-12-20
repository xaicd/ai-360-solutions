
import { PrismaClient } from '@prisma/client';

// Global instance to prevent multiple connections in dev hot-reload
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ['query', 'error', 'warn'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export * from '@prisma/client';

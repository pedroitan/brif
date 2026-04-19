import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __brifPrisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__brifPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__brifPrisma = prisma;
}

export * from '@prisma/client';

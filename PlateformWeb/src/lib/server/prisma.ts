import { PrismaClient } from '@prisma/client';

// Définir la variable d'environnement directement si elle n'existe pas
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:password@127.0.0.1:5432/scanner3d';
}

const prisma = new PrismaClient();
export { prisma };

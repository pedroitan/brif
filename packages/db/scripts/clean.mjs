import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Limpando banco de dados...');
  await prisma.$executeRawUnsafe('DELETE FROM "tasks"');
  await prisma.$executeRawUnsafe('DELETE FROM "approvals"');
  await prisma.$executeRawUnsafe('DELETE FROM "briefings"');
  await prisma.$executeRawUnsafe('DELETE FROM "meetings"');
  await prisma.$executeRawUnsafe('DELETE FROM "projects"');
  console.log('Concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

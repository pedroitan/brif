import { PrismaClient, UserRole } from '@prisma/client';
import { createHash } from 'node:crypto';

const prisma = new PrismaClient();

// Hash simples só para a demo. Trocamos por bcrypt no Sprint 2.
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

async function main() {
  const demoManager = await prisma.user.upsert({
    where: { email: 'gerente@agenciademo.com.br' },
    update: {},
    create: {
      email: 'gerente@agenciademo.com.br',
      name: 'Marina Silva',
      passwordHash: hashPassword('brif2026'),
      role: UserRole.MANAGER,
    },
  });

  console.log('✓ Seed concluído');
  console.log(`  Gerente: ${demoManager.email} / senha: brif2026`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

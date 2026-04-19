import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('brif2026', 10);

  const demoManager = await prisma.user.upsert({
    where: { email: 'gerente@agenciademo.com.br' },
    update: { passwordHash },
    create: {
      email: 'gerente@agenciademo.com.br',
      name: 'Marina Silva',
      passwordHash,
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

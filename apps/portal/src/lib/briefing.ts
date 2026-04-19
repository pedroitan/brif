import { prisma } from '@brif/db';

export async function getBriefingByToken(token: string) {
  return prisma.approval.findUnique({
    where: { magicToken: token },
    include: {
      briefing: {
        include: {
          meeting: {
            include: {
              project: {
                select: { name: true, clientName: true },
              },
            },
          },
        },
      },
    },
  });
}

export async function markViewed(token: string) {
  const approval = await prisma.approval.findUnique({
    where: { magicToken: token },
    select: { id: true, viewedAt: true },
  });
  if (!approval || approval.viewedAt) return;

  await prisma.approval.update({
    where: { id: approval.id },
    data: { viewedAt: new Date() },
  });
}

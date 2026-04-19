'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@brif/db';

const commentSchema = z
  .string()
  .max(2000, 'Comentário muito longo')
  .optional();

async function findApproval(token: string) {
  const approval = await prisma.approval.findUnique({
    where: { magicToken: token },
    include: { briefing: { include: { meeting: true } } },
  });
  if (!approval) throw new Error('Link inválido ou expirado');
  if (approval.tokenExpiresAt < new Date()) throw new Error('Link expirado');
  if (approval.decidedAt) throw new Error('Decisão já registrada');
  return approval;
}

export async function approve(token: string, comment?: string) {
  const parsed = commentSchema.parse(comment);
  const approval = await findApproval(token);

  await prisma.$transaction([
    prisma.approval.update({
      where: { id: approval.id },
      data: {
        decision: 'APPROVED',
        decidedAt: new Date(),
        clientComment: parsed?.trim() || null,
      },
    }),
    prisma.briefing.update({
      where: { id: approval.briefingId },
      data: { status: 'APPROVED' },
    }),
    prisma.project.update({
      where: { id: approval.briefing.meeting.projectId },
      data: { status: 'BRIEFING_APPROVED' },
    }),
  ]);

  revalidatePath(`/briefing/${token}`);
  return { success: true as const };
}

export async function reject(token: string, comment: string) {
  const parsed = commentSchema.parse(comment);
  if (!parsed || parsed.trim().length < 5) {
    return {
      success: false as const,
      error: 'Explique brevemente quais ajustes são necessários (mín. 5 caracteres).',
    };
  }

  const approval = await findApproval(token);

  await prisma.$transaction([
    prisma.approval.update({
      where: { id: approval.id },
      data: {
        decision: 'REJECTED',
        decidedAt: new Date(),
        clientComment: parsed.trim(),
      },
    }),
    prisma.briefing.update({
      where: { id: approval.briefingId },
      data: { status: 'REJECTED' },
    }),
    prisma.project.update({
      where: { id: approval.briefing.meeting.projectId },
      data: { status: 'BRIEFING_REJECTED' },
    }),
  ]);

  revalidatePath(`/briefing/${token}`);
  return { success: true as const };
}

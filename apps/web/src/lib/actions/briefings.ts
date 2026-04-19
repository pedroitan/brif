'use server';

import crypto from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@brif/db';
import { authOptions } from '@/lib/auth';
import { anthropic, estimateCost } from '@/lib/anthropic';
import {
  BRIEFING_SYSTEM_PROMPT,
  buildBriefingUserPrompt,
} from '@/lib/prompts/briefing';

const briefingSchema = z.object({
  objetivo: z.string().min(1),
  publicoAlvo: z.string().min(1),
  tomEComunicacao: z.string().min(1),
  entregas: z.string().min(1),
  prazos: z.string().min(1),
  orcamento: z.string().min(1),
  observacoes: z.string().optional().nullable(),
});

export type GenerateResult =
  | { success: true; briefingId: string }
  | { success: false; error: string };

export async function generateBriefing(meetingId: string): Promise<GenerateResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: 'Não autenticado' };

  const meeting = await prisma.meeting.findFirst({
    where: {
      id: meetingId,
      project: { managerId: session.user.id },
    },
    include: {
      project: { select: { id: true, name: true, clientName: true } },
      briefing: true,
    },
  });

  if (!meeting) return { success: false, error: 'Reunião não encontrada' };
  if (meeting.transcriptionStatus !== 'COMPLETED') {
    return { success: false, error: 'Transcrição ainda não está pronta' };
  }

  const transcription =
    meeting.transcriptionEdited ?? meeting.transcriptionRaw ?? '';
  if (transcription.trim().length < 50) {
    return {
      success: false,
      error: 'Transcrição muito curta para gerar briefing.',
    };
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2000,
      system: BRIEFING_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: buildBriefingUserPrompt({
            projectName: meeting.project.name,
            clientName: meeting.project.clientName,
            transcription,
          }),
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('Resposta da IA vazia');
    }

    const raw = textBlock.text.trim();
    // Remove cercas markdown se o modelo insistir em usá-las
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error(`JSON inválido retornado pela IA: ${cleaned.slice(0, 200)}`);
    }

    const data = briefingSchema.parse(parsed);
    const cost = estimateCost(response.usage.input_tokens, response.usage.output_tokens);

    const briefing = await prisma.briefing.upsert({
      where: { meetingId: meeting.id },
      create: {
        meetingId: meeting.id,
        objetivo: data.objetivo,
        publicoAlvo: data.publicoAlvo,
        tomEComunicacao: data.tomEComunicacao,
        entregas: data.entregas,
        prazos: data.prazos,
        orcamento: data.orcamento,
        observacoes: data.observacoes ?? null,
        status: 'DRAFT',
        generationCost: cost,
      },
      update: {
        objetivo: data.objetivo,
        publicoAlvo: data.publicoAlvo,
        tomEComunicacao: data.tomEComunicacao,
        entregas: data.entregas,
        prazos: data.prazos,
        orcamento: data.orcamento,
        observacoes: data.observacoes ?? null,
        status: 'DRAFT',
        generationCost: cost,
      },
    });

    await prisma.project.update({
      where: { id: meeting.projectId },
      data: { status: 'BRIEFING_REVIEW' },
    });

    revalidatePath(`/projetos/${meeting.projectId}/reuniao/${meeting.id}`);
    revalidatePath(`/projetos/${meeting.projectId}/reuniao/${meeting.id}/briefing`);
    return { success: true, briefingId: briefing.id };
  } catch (error) {
    console.error('[briefing] Generation failed:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return { success: false, error: message };
  }
}

const updateSchema = z.object({
  objetivo: z.string().min(1),
  publicoAlvo: z.string().min(1),
  tomEComunicacao: z.string().min(1),
  entregas: z.string().min(1),
  prazos: z.string().min(1),
  orcamento: z.string().min(1),
  observacoes: z.string().optional().nullable(),
});

export async function saveBriefing(
  briefingId: string,
  data: z.infer<typeof updateSchema>,
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Não autenticado');

  const briefing = await prisma.briefing.findFirst({
    where: {
      id: briefingId,
      meeting: { project: { managerId: session.user.id } },
    },
    select: { id: true, meeting: { select: { projectId: true, id: true } } },
  });
  if (!briefing) throw new Error('Briefing não encontrado');

  const parsed = updateSchema.parse(data);

  await prisma.briefing.update({
    where: { id: briefingId },
    data: {
      objetivo: parsed.objetivo,
      publicoAlvo: parsed.publicoAlvo,
      tomEComunicacao: parsed.tomEComunicacao,
      entregas: parsed.entregas,
      prazos: parsed.prazos,
      orcamento: parsed.orcamento,
      observacoes: parsed.observacoes ?? null,
    },
  });

  revalidatePath(
    `/projetos/${briefing.meeting.projectId}/reuniao/${briefing.meeting.id}/briefing`,
  );
  return { success: true };
}

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL ?? 'http://localhost:3001';
const APPROVAL_TTL_DAYS = 30;

export async function sendBriefingForApproval(
  briefingId: string,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { success: false, error: 'Não autenticado' };

  const briefing = await prisma.briefing.findFirst({
    where: {
      id: briefingId,
      meeting: { project: { managerId: session.user.id } },
    },
    include: {
      approval: true,
      meeting: { select: { projectId: true, id: true } },
    },
  });
  if (!briefing) return { success: false, error: 'Briefing não encontrado' };

  // Se já existe aprovação ainda válida, reaproveita o token
  if (briefing.approval && briefing.approval.tokenExpiresAt > new Date()) {
    return {
      success: true,
      url: `${PORTAL_URL}/briefing/${briefing.approval.magicToken}`,
    };
  }

  const magicToken = crypto.randomBytes(32).toString('base64url');
  const tokenExpiresAt = new Date(
    Date.now() + APPROVAL_TTL_DAYS * 24 * 60 * 60 * 1000,
  );

  await prisma.$transaction([
    prisma.approval.upsert({
      where: { briefingId },
      create: {
        briefingId,
        magicToken,
        tokenExpiresAt,
      },
      update: {
        magicToken,
        tokenExpiresAt,
        sentAt: new Date(),
        viewedAt: null,
        decidedAt: null,
        decision: null,
        clientComment: null,
      },
    }),
    prisma.briefing.update({
      where: { id: briefingId },
      data: { status: 'SENT' },
    }),
    prisma.project.update({
      where: { id: briefing.meeting.projectId },
      data: { status: 'BRIEFING_SENT' },
    }),
  ]);

  revalidatePath(
    `/projetos/${briefing.meeting.projectId}/reuniao/${briefing.meeting.id}/briefing`,
  );

  return {
    success: true,
    url: `${PORTAL_URL}/briefing/${magicToken}`,
  };
}

export async function getBriefingByMeeting(meetingId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Não autenticado');

  return prisma.briefing.findFirst({
    where: {
      meetingId,
      meeting: { project: { managerId: session.user.id } },
    },
    include: {
      approval: true,
      meeting: {
        include: {
          project: { select: { id: true, name: true, clientName: true } },
        },
      },
    },
  });
}

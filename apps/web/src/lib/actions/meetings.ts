'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { put } from '@vercel/blob';
import { prisma } from '@brif/db';
import { authOptions } from '@/lib/auth';

async function transcribeWithWhisper(audioFile: File): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY não configurada');

  const body = new FormData();
  body.append('file', audioFile);
  body.append('model', 'whisper-1');
  body.append('language', 'pt');
  body.append('response_format', 'text');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Whisper API ${response.status}: ${errorText}`);
  }

  return response.text();
}

export async function uploadAndTranscribe(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Não autenticado');
  }

  const projectId = formData.get('projectId') as string | null;
  const audioFile = formData.get('audio') as File | null;

  if (!projectId || !audioFile || audioFile.size === 0) {
    throw new Error('Parâmetros inválidos');
  }

  // 1. Verifica que o projeto é do gerente
  const project = await prisma.project.findFirst({
    where: { id: projectId, managerId: session.user.id },
    select: { id: true },
  });
  if (!project) {
    throw new Error('Projeto não encontrado');
  }

  // 2. Upload para o Vercel Blob (server-side)
  const blob = await put(audioFile.name, audioFile, {
    access: 'public',
    addRandomSuffix: true,
    contentType: audioFile.type || 'audio/mpeg',
  });

  const audioUrl = blob.url;
  const audioFileName = audioFile.name;

  // 3. Cria a reunião com status PROCESSING
  const meeting = await prisma.meeting.create({
    data: {
      projectId,
      audioUrl,
      audioFileName,
      transcriptionStatus: 'PROCESSING',
    },
  });

  await prisma.project.update({
    where: { id: projectId },
    data: { status: 'BRIEFING_PENDING' },
  });

  // 4. Envia direto ao Whisper (já temos o File em memória)
  try {
    const transcription = await transcribeWithWhisper(audioFile);

    await prisma.meeting.update({
      where: { id: meeting.id },
      data: {
        transcriptionRaw: transcription,
        transcriptionEdited: transcription,
        transcriptionStatus: 'COMPLETED',
      },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'BRIEFING_REVIEW' },
    });

    revalidatePath(`/projetos/${projectId}`);
    return { meetingId: meeting.id, success: true as const };
  } catch (error) {
    console.error('[whisper] Transcription failed:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    await prisma.meeting.update({
      where: { id: meeting.id },
      data: {
        transcriptionStatus: 'FAILED',
        transcriptionError: message,
      },
    });
    revalidatePath(`/projetos/${projectId}`);
    return { meetingId: meeting.id, success: false as const, error: message };
  }
}

export async function saveTranscription(meetingId: string, transcriptionEdited: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Não autenticado');

  const meeting = await prisma.meeting.findFirst({
    where: {
      id: meetingId,
      project: { managerId: session.user.id },
    },
    select: { id: true, projectId: true },
  });
  if (!meeting) throw new Error('Reunião não encontrada');

  await prisma.meeting.update({
    where: { id: meetingId },
    data: { transcriptionEdited },
  });

  revalidatePath(`/projetos/${meeting.projectId}`);
  revalidatePath(`/projetos/${meeting.projectId}/reuniao/${meetingId}`);
  return { success: true };
}

export async function getMeeting(meetingId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Não autenticado');

  return prisma.meeting.findFirst({
    where: {
      id: meetingId,
      project: { managerId: session.user.id },
    },
    include: {
      project: { select: { id: true, name: true, clientName: true } },
      briefing: true,
    },
  });
}

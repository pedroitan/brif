'use server';

import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { put } from '@vercel/blob';
import { toFile } from 'openai/uploads';
import { prisma } from '@brif/db';
import { authOptions } from '@/lib/auth';
import { openai } from '@/lib/openai';
import { normalizeAudioForWhisper } from '@/lib/audio-normalize';

async function transcribeWithWhisper(
  buffer: Buffer,
  filename: string,
  mime: string,
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY não configurada');
  }

  const file = await toFile(buffer, filename, { type: mime });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    language: 'pt',
    response_format: 'text',
  });

  return typeof transcription === 'string'
    ? transcription
    : (transcription as { text: string }).text;
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

  // 2. Normaliza o áudio (detecta formato real por magic bytes, remuxa AAC cru se necessário)
  const originalBuffer = Buffer.from(await audioFile.arrayBuffer());
  let normalized;
  try {
    normalized = await normalizeAudioForWhisper(audioFile.name, originalBuffer);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Não foi possível processar o arquivo de áudio.';
    return { meetingId: '', success: false as const, error: message };
  }

  const { buffer: normalizedBuffer, filename, mime } = normalized;

  // 3. Upload para o Vercel Blob (server-side) usando o buffer normalizado
  const uploaded = await put(filename, normalizedBuffer, {
    access: 'public',
    addRandomSuffix: true,
    contentType: mime,
  });

  const audioUrl = uploaded.url;
  const audioFileName = audioFile.name;

  // 4. Cria a reunião com status PROCESSING
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

  // 5. Envia ao Whisper
  try {
    const transcription = await transcribeWithWhisper(normalizedBuffer, filename, mime);

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

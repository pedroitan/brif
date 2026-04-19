import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tag,
} from '@brif/ui';
import { authOptions } from '@/lib/auth';
import { getMeeting } from '@/lib/actions/meetings';
import { TranscriptionEditor } from './editor';
import { FlowSteps, computeFlowSteps } from '@/components/flow-steps';
import { AudioPlayer } from '@/components/audio-player';

export default async function ReuniaoPage({
  params,
}: {
  params: { id: string; meetingId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const meeting = await getMeeting(params.meetingId);
  if (!meeting || meeting.projectId !== params.id) notFound();

  const flowSteps = computeFlowSteps({
    transcriptionStatus: meeting.transcriptionStatus,
    briefingStatus: meeting.briefing?.status,
    approvalDecision: null,
  });

  const transcriptionTag = (() => {
    switch (meeting.transcriptionStatus) {
      case 'COMPLETED':
        return { variant: 'teal' as const, label: 'Transcrito' };
      case 'PROCESSING':
        return { variant: 'amber' as const, label: 'Transcrevendo…' };
      case 'FAILED':
        return { variant: 'red' as const, label: 'Falhou' };
      default:
        return { variant: 'gray' as const, label: 'Aguardando' };
    }
  })();

  return (
    <div className="mx-auto max-w-[1400px] p-6">
      {/* Cabeçalho */}
      <div className="mb-4">
        <Link
          href={`/projetos/${params.id}`}
          className="text-xs text-brif-muted hover:text-brif-ink"
        >
          ← Voltar para {meeting.project.name}
        </Link>
        <div className="mt-1.5 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Reunião de briefing
            </h1>
            <p className="text-sm text-muted-foreground">
              {meeting.audioFileName} · {meeting.project.clientName}
            </p>
          </div>
          <Tag variant={transcriptionTag.variant}>{transcriptionTag.label}</Tag>
        </div>
      </div>

      {/* Flow steps */}
      <div className="mb-5">
        <FlowSteps steps={flowSteps} />
      </div>

      {/* Player de áudio */}
      <Card className="mb-5">
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          <CardTitle>Gravação da reunião</CardTitle>
          <Tag variant={transcriptionTag.variant}>{transcriptionTag.label}</Tag>
        </CardHeader>
        <CardContent>
          <AudioPlayer src={meeting.audioUrl} fileName={meeting.audioFileName} />
        </CardContent>
      </Card>

      {/* Transcrição */}
      {meeting.transcriptionStatus === 'FAILED' && (
        <Card className="border-brif-red/30">
          <CardHeader>
            <CardTitle>Transcrição falhou</CardTitle>
            <CardDescription>
              Ocorreu um erro ao processar o áudio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-brif-red">
              {meeting.transcriptionError ?? 'Erro desconhecido'}
            </p>
          </CardContent>
        </Card>
      )}

      {meeting.transcriptionStatus === 'PROCESSING' && (
        <Card>
          <CardHeader>
            <CardTitle>Transcrevendo…</CardTitle>
            <CardDescription>
              Isso pode levar alguns segundos. Atualize a página se demorar.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {meeting.transcriptionStatus === 'COMPLETED' && (
        <Card>
          <CardHeader>
            <CardTitle>Transcrição</CardTitle>
            <CardDescription>
              Revise e edite o texto antes de gerar o briefing com IA.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TranscriptionEditor
              projectId={params.id}
              meetingId={meeting.id}
              initialText={
                meeting.transcriptionEdited ?? meeting.transcriptionRaw ?? ''
              }
              hasBriefing={Boolean(meeting.briefing)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@brif/ui';
import { Nav } from '@/components/nav';
import { authOptions } from '@/lib/auth';
import { getMeeting } from '@/lib/actions/meetings';
import { TranscriptionEditor } from './editor';

export default async function ReuniaoPage({
  params,
}: {
  params: { id: string; meetingId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const meeting = await getMeeting(params.meetingId);
  if (!meeting || meeting.projectId !== params.id) notFound();

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="container max-w-4xl py-8">
        <div className="mb-6">
          <Link
            href={`/projetos/${params.id}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Voltar para {meeting.project.name}
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Reunião de briefing
          </h1>
          <p className="text-muted-foreground">
            {meeting.audioFileName} · {meeting.project.clientName}
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Áudio original</CardTitle>
          </CardHeader>
          <CardContent>
            <audio controls src={meeting.audioUrl} className="w-full">
              Seu navegador não suporta áudio HTML5.
            </audio>
          </CardContent>
        </Card>

        {meeting.transcriptionStatus === 'FAILED' && (
          <Card>
            <CardHeader>
              <CardTitle>Transcrição falhou</CardTitle>
              <CardDescription>
                Ocorreu um erro ao processar o áudio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-destructive">
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
                initialText={meeting.transcriptionEdited ?? meeting.transcriptionRaw ?? ''}
                hasBriefing={Boolean(meeting.briefing)}
              />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

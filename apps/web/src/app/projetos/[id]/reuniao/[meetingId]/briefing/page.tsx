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
import { getBriefingByMeeting } from '@/lib/actions/briefings';
import { BriefingEditor } from './editor';

export default async function BriefingPage({
  params,
}: {
  params: { id: string; meetingId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const briefing = await getBriefingByMeeting(params.meetingId);
  if (!briefing || briefing.meeting.projectId !== params.id) notFound();

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="container max-w-4xl py-8">
        <div className="mb-6">
          <Link
            href={`/projetos/${params.id}/reuniao/${params.meetingId}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Voltar para transcrição
          </Link>
          <div className="mt-2 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Briefing</h1>
              <p className="text-muted-foreground">
                {briefing.meeting.project.name} ·{' '}
                {briefing.meeting.project.clientName}
              </p>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-sm">
              {briefing.status === 'DRAFT' && 'Rascunho'}
              {briefing.status === 'SENT' && 'Enviado ao cliente'}
              {briefing.status === 'APPROVED' && 'Aprovado'}
              {briefing.status === 'REJECTED' && 'Ajustes solicitados'}
            </span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Campos do briefing</CardTitle>
            <CardDescription>
              Revise e edite os campos gerados pela IA. O cliente receberá exatamente este conteúdo.
              {briefing.generationCost !== null &&
                ` · Geração custou $${briefing.generationCost?.toFixed(4)} USD.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BriefingEditor
              briefingId={briefing.id}
              initial={{
                objetivo: briefing.objetivo,
                publicoAlvo: briefing.publicoAlvo,
                tomEComunicacao: briefing.tomEComunicacao,
                entregas: briefing.entregas,
                prazos: briefing.prazos,
                orcamento: briefing.orcamento,
                observacoes: briefing.observacoes ?? '',
              }}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

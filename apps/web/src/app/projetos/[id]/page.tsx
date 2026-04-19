import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@brif/ui';
import { Nav } from '@/components/nav';
import { authOptions } from '@/lib/auth';
import { getProject } from '@/lib/actions/projetos';
import { UploadAudio } from './upload-audio';

const transcriptionLabel: Record<string, string> = {
  PENDING: 'Aguardando',
  PROCESSING: 'Transcrevendo…',
  COMPLETED: 'Transcrito',
  FAILED: 'Falhou',
};

const statusLabel: Record<string, string> = {
  DRAFT: 'Rascunho',
  BRIEFING_PENDING: 'Briefing pendente',
  BRIEFING_REVIEW: 'Em revisão',
  BRIEFING_SENT: 'Enviado ao cliente',
  BRIEFING_APPROVED: 'Aprovado',
  BRIEFING_REJECTED: 'Com ajustes',
};

export default async function ProjetoDetalhePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const project = await getProject(params.id, session.user.id);
  if (!project) notFound();

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="container max-w-4xl py-8">
        <div className="mb-6">
          <Link
            href="/projetos"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Voltar para projetos
          </Link>
          <div className="mt-2 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
              <p className="text-muted-foreground">
                Cliente: {project.clientName} · {project.clientEmail}
              </p>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-sm">
              {statusLabel[project.status] ?? project.status}
            </span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nova reunião de briefing</CardTitle>
            <CardDescription>
              Envie o áudio da reunião com o cliente para transcrição automática.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadAudio projectId={project.id} />
          </CardContent>
        </Card>

        {project.meetings.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Reuniões</CardTitle>
              <CardDescription>
                {project.meetings.length} reunião(ões) registrada(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {project.meetings.map((m) => (
                  <li key={m.id}>
                    <Link
                      href={`/projetos/${project.id}/reuniao/${m.id}`}
                      className="flex items-center justify-between py-3 text-sm hover:bg-accent/30 -mx-2 px-2 rounded"
                    >
                      <span className="truncate max-w-md">{m.audioFileName}</span>
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                        {transcriptionLabel[m.transcriptionStatus] ?? m.transcriptionStatus}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

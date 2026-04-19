import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tag,
} from '@brif/ui';
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
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {project.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Cliente: {project.clientName} · {project.clientEmail}
          </p>
        </div>
        <Tag
          variant={project.status === 'BRIEFING_APPROVED' ? 'teal' : 'gray'}
        >
          {statusLabel[project.status] ?? project.status}
        </Tag>
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
                    className="-mx-2 flex items-center justify-between rounded px-2 py-3 text-sm transition-colors hover:bg-accent/40"
                  >
                    <span className="max-w-md truncate">{m.audioFileName}</span>
                    <Tag
                      variant={
                        m.transcriptionStatus === 'COMPLETED'
                          ? 'teal'
                          : m.transcriptionStatus === 'FAILED'
                            ? 'red'
                            : 'amber'
                      }
                    >
                      {transcriptionLabel[m.transcriptionStatus] ??
                        m.transcriptionStatus}
                    </Tag>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

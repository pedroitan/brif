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
            <CardTitle>Reuniões de briefing</CardTitle>
            <CardDescription>
              Upload de áudio, transcrição e briefing serão implementados no Sprint 3.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {project.meetings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma reunião gravada ainda.
              </p>
            ) : (
              <ul className="space-y-2">
                {project.meetings.map((m) => (
                  <li key={m.id} className="rounded border p-3 text-sm">
                    {m.audioFileName} · {m.transcriptionStatus}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

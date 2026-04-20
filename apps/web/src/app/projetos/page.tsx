import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tag,
} from '@brif/ui';
import { authOptions } from '@/lib/auth';
import { listProjects } from '@/lib/actions/projetos';

const statusLabel: Record<string, string> = {
  DRAFT: 'Rascunho',
  BRIEFING_PENDING: 'Briefing pendente',
  BRIEFING_REVIEW: 'Em revisão',
  BRIEFING_SENT: 'Enviado ao cliente',
  BRIEFING_APPROVED: 'Aprovado',
  BRIEFING_REJECTED: 'Com ajustes',
};

export default async function ProjetosPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const projects = await listProjects(session.user.id);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight md:text-2xl">Projetos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os briefings e entregas dos seus clientes.
          </p>
        </div>
        <Link href="/projetos/novo" className="self-start md:self-auto">
          <Button>+ Novo projeto</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum projeto ainda</CardTitle>
            <CardDescription>
              Clique em “+ Novo projeto” para criar o primeiro.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projetos/${project.id}`}>
              <Card className="h-full transition-colors hover:border-brif-teal/40 hover:shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">{project.name}</CardTitle>
                  <CardDescription>Cliente: {project.clientName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <Tag variant={project.status === 'BRIEFING_APPROVED' ? 'teal' : 'gray'}>
                      {statusLabel[project.status] ?? project.status}
                    </Tag>
                    <span className="font-mono text-xs text-brif-muted">
                      {project.meetings.length} reunião(ões)
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

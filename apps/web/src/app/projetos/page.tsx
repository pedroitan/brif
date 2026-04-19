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
} from '@brif/ui';
import { Nav } from '@/components/nav';
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
    <div className="min-h-screen">
      <Nav />
      <main className="container py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
            <p className="text-muted-foreground">
              Gerencie os briefings e entregas dos seus clientes.
            </p>
          </div>
          <Link href="/projetos/novo">
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
                <Card className="h-full transition-colors hover:bg-accent/30">
                  <CardHeader>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription>
                      Cliente: {project.clientName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                        {statusLabel[project.status] ?? project.status}
                      </span>
                      <span className="text-muted-foreground">
                        {project.meetings.length} reunião(ões)
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

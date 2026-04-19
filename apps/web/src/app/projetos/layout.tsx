import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { listProjects } from '@/lib/actions/projetos';
import { AppShell } from '@/components/app-shell';
import type { SidebarProject } from '@/components/app-sidebar';

/**
 * Layout compartilhado para todas as rotas /projetos/*.
 * Busca a lista de projetos do usuário e, se o pathname contiver
 * um id de projeto, também carrega esse projeto para o card lateral.
 */
export default async function ProjetosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const projects = await listProjects(session.user.id);

  const sidebarProjects: SidebarProject[] = projects.map((p) => ({
    id: p.id,
    name: p.name,
    clientName: p.clientName,
    status: p.status,
  }));

  return (
    <AppShell
      projects={sidebarProjects}
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
    >
      {children}
    </AppShell>
  );
}

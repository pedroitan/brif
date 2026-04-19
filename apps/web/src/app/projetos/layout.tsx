import { headers } from 'next/headers';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { listProjects, getProject } from '@/lib/actions/projetos';
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

  const pathname = headers().get('x-pathname') ?? '/projetos';
  const activeId = extractProjectId(pathname);

  const [projects, activeProject] = await Promise.all([
    listProjects(session.user.id),
    activeId ? getProject(activeId, session.user.id) : Promise.resolve(null),
  ]);

  const sidebarProjects: SidebarProject[] = projects.map((p) => ({
    id: p.id,
    name: p.name,
    clientName: p.clientName,
    status: p.status,
  }));

  const sidebarActive: SidebarProject | null = activeProject
    ? {
        id: activeProject.id,
        name: activeProject.name,
        clientName: activeProject.clientName,
        status: activeProject.status,
      }
    : null;

  return (
    <AppShell
      projects={sidebarProjects}
      activeProject={sidebarActive}
      pathname={pathname}
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

function extractProjectId(pathname: string): string | null {
  // /projetos/:id  ou  /projetos/:id/...
  const match = pathname.match(/^\/projetos\/([^/]+)/);
  const id = match?.[1];
  if (!id || id === 'novo') return null;
  return id;
}

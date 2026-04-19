'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@brif/ui';
import { SidebarSignOut } from './app-sidebar-signout';

export type SidebarProject = {
  id: string;
  name: string;
  clientName: string;
  status: string;
};

type AppSidebarProps = {
  projects: SidebarProject[];
  user: { name?: string | null; email?: string | null; role?: string | null };
};

function isActive(pathname: string, href: string, exact = false): boolean {
  if (exact) return pathname === href;
  if (pathname === href) return true;
  return pathname.startsWith(href + '/');
}

const statusPhase: Record<string, string> = {
  DRAFT: 'Rascunho',
  BRIEFING_PENDING: 'Briefing pendente',
  BRIEFING_REVIEW: 'Em revisão',
  BRIEFING_SENT: 'Aguardando cliente',
  BRIEFING_APPROVED: 'Aprovado',
  BRIEFING_REJECTED: 'Ajustes pedidos',
};

function initials(name?: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

export function AppSidebar({ projects, user }: AppSidebarProps) {
  const pathname = usePathname();
  
  // Derive active project from pathname
  const activeProject = (() => {
    const match = pathname.match(/^\/projetos\/([^/]+)/);
    const id = match?.[1];
    if (!id || id === 'novo') return null;
    return projects.find((p) => p.id === id) ?? null;
  })();
  return (
    <aside className="flex w-[220px] min-w-[220px] flex-col overflow-y-auto border-r border-white/5 bg-brif-navy-2">
      {/* Card do projeto ativo */}
      {activeProject ? (
        <div className="p-3.5 pt-3.5">
          <div className="rounded-lg bg-white/5 px-2.5 py-2.5">
            <div className="mb-1 font-mono text-[9px] uppercase tracking-wider text-white/30">
              Projeto ativo
            </div>
            <div className="text-[12.5px] font-semibold leading-snug text-white/90">
              {activeProject.name}
            </div>
            <div className="mt-1 text-[11px] text-brif-teal">
              ● Fase: {phaseLabel(activeProject.status)}
            </div>
          </div>
        </div>
      ) : (
        <div className="px-3.5 py-4">
          <div className="font-mono text-[9px] uppercase tracking-wider text-white/30">
            Nenhum projeto selecionado
          </div>
        </div>
      )}

      {/* Menu principal (apenas quando dentro de um projeto) */}
      {activeProject ? (
        <>
          <div className="px-3.5 pb-1.5 pt-4 font-mono text-[9px] font-medium uppercase tracking-wider text-white/25">
            Menu
          </div>
          <SidebarLink
            href={`/projetos/${activeProject.id}`}
            icon="briefing"
            active={
              isActive(pathname, `/projetos/${activeProject.id}`, true) ||
              pathname.startsWith(`/projetos/${activeProject.id}/reuniao`)
            }
          >
            Briefing
          </SidebarLink>
          <SidebarLink
            href={`/projetos/${activeProject.id}/tarefas`}
            icon="tasks"
            active={isActive(pathname, `/projetos/${activeProject.id}/tarefas`)}
          >
            Tarefas
          </SidebarLink>
          <SidebarLink
            href={`/projetos/${activeProject.id}/calendario`}
            icon="calendar"
            active={isActive(
              pathname,
              `/projetos/${activeProject.id}/calendario`,
            )}
          >
            Calendário
          </SidebarLink>
          <SidebarLink
            href={`/projetos/${activeProject.id}/proposta`}
            icon="proposal"
            active={isActive(
              pathname,
              `/projetos/${activeProject.id}/proposta`,
            )}
          >
            Proposta
          </SidebarLink>
          <SidebarLink
            href={`/projetos/${activeProject.id}/documentos`}
            icon="docs"
            active={isActive(
              pathname,
              `/projetos/${activeProject.id}/documentos`,
            )}
          >
            Documentos
          </SidebarLink>
        </>
      ) : null}

      {/* Lista de projetos */}
      <div className="mt-2 px-3.5 pb-1.5 pt-2 font-mono text-[9px] font-medium uppercase tracking-wider text-white/25">
        Projetos
      </div>
      {projects.length === 0 ? (
        <div className="px-3.5 text-xs text-white/40">Nenhum ainda.</div>
      ) : (
        projects.map((p) => (
          <SidebarLink
            key={p.id}
            href={`/projetos/${p.id}`}
            icon="project"
            active={p.id === activeProject?.id}
          >
            {p.name}
          </SidebarLink>
        ))
      )}
      <div className="px-3.5 pb-3 pt-3">
        <Link
          href="/projetos/novo"
          className="block rounded-md border border-dashed border-white/15 px-2.5 py-1.5 text-center text-[11px] text-white/50 hover:border-brif-teal hover:text-brif-teal"
        >
          + Novo projeto
        </Link>
      </div>

      {/* Avatar */}
      <div className="mt-auto flex items-center gap-2.5 border-t border-white/5 px-3.5 py-3.5">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brif-teal text-[11px] font-semibold text-white">
          {initials(user.name || user.email)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12.5px] font-medium text-white/85">
            {user.name ?? 'Usuário'}
          </div>
          <div className="truncate text-[10.5px] text-white/35">
            {user.role ?? user.email}
          </div>
        </div>
        <SidebarSignOut />
      </div>
    </aside>
  );
}

type IconKind =
  | 'briefing'
  | 'tasks'
  | 'project'
  | 'calendar'
  | 'proposal'
  | 'docs';

const phaseLabels: Record<string, string> = {
  DRAFT: 'Rascunho',
  BRIEFING_PENDING: 'Briefing',
  BRIEFING_REVIEW: 'Briefing',
  BRIEFING_SENT: 'Aprovação',
  BRIEFING_APPROVED: 'Criação',
  BRIEFING_REJECTED: 'Briefing',
};

function phaseLabel(status: string): string {
  return phaseLabels[status] ?? status;
}

function SidebarLink({
  href,
  icon,
  active,
  children,
}: {
  href: string;
  icon: IconKind;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 border-l-2 border-transparent px-3.5 py-[7px] text-[13px] transition-colors',
        active
          ? 'border-l-brif-teal bg-brif-teal/15 text-white'
          : 'text-white/55 hover:bg-white/5 hover:text-white/85',
      )}
    >
      <SidebarIcon kind={icon} className="h-4 w-4 flex-shrink-0 opacity-70" />
      <span className="truncate">{children}</span>
    </Link>
  );
}

function SidebarIcon({ kind, className }: { kind: IconKind; className?: string }) {
  if (kind === 'briefing') {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={className}>
        <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M5 5.5h6M5 8h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'tasks') {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={className}>
        <rect x="2" y="3" width="3" height="10" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <rect x="6.5" y="5" width="3" height="8" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <rect x="11" y="1" width="3" height="12" rx="1" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    );
  }
  if (kind === 'calendar') {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={className}>
        <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M5 2v2M11 2v2M2 7h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'proposal') {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={className}>
        <path d="M2 13l4-4 3 3 5-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === 'docs') {
    return (
      <svg viewBox="0 0 16 16" fill="none" className={className}>
        <path d="M4 8h8M4 5h8M4 11h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="8" r="2" fill="currentColor" />
    </svg>
  );
}

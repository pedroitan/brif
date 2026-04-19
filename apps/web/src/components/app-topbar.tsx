import { headers } from 'next/headers';

/**
 * Topbar com breadcrumbs dinâmicas baseadas no pathname.
 * Pathname vem do header `x-pathname` injetado pelo middleware.
 */
export function AppTopbar() {
  const pathname = headers().get('x-pathname') ?? '/projetos';
  const crumbs = buildCrumbs(pathname);

  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-brif-border bg-white px-6 py-3.5">
      <nav className="text-xs text-brif-muted">
        {crumbs.map((crumb, i) => (
          <span key={i}>
            {i > 0 ? <span className="mx-1.5 opacity-40">/</span> : null}
            <span
              className={
                i === crumbs.length - 1
                  ? 'font-medium text-brif-ink'
                  : 'text-brif-muted'
              }
            >
              {crumb}
            </span>
          </span>
        ))}
      </nav>
    </header>
  );
}

function buildCrumbs(pathname: string): string[] {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return ['Projetos'];

  const crumbs: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p === 'projetos') crumbs.push('Projetos');
    else if (p === 'novo') crumbs.push('Novo projeto');
    else if (p === 'reuniao') crumbs.push('Reunião');
    else if (p === 'briefing') crumbs.push('Briefing');
    else if (p === 'tarefas') crumbs.push('Tarefas');
    else {
      // IDs — mostrar apenas como "…" quando seguidos de outro segmento
      if (i < parts.length - 1) continue;
      crumbs.push('…');
    }
  }
  return crumbs;
}

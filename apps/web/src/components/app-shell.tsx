import Link from 'next/link';
import Image from 'next/image';
import { AppSidebar, type SidebarProject } from './app-sidebar';
import { AppTopbar } from './app-topbar';

type AppShellProps = {
  projects: SidebarProject[];
  user: { name?: string | null; email?: string | null; role?: string | null };
  children: React.ReactNode;
};

/**
 * Casca visual das telas autenticadas (apps/web).
 * Inclui: tab-bar navy (brand BRIF) + sidebar + topbar + conteúdo.
 * Toda a área /projetos/* é envolvida por este shell.
 */
export function AppShell({ projects, user, children }: AppShellProps) {
  return (
    <div className="flex h-screen flex-col bg-neutral-50">
      {/* Tab bar superior (brand + logout) */}
      <header className="sticky top-0 z-50 flex items-center gap-2 bg-brif-navy px-4 py-2.5">
        <Link
          href="/projetos"
          className="mr-6 flex items-center gap-3 font-display text-[16px] font-extrabold tracking-wide text-white"
        >
          {process.env.NEXT_PUBLIC_COMPANY_LOGO && (
            <Image
              src={process.env.NEXT_PUBLIC_COMPANY_LOGO}
              alt={process.env.NEXT_PUBLIC_COMPANY_NAME || 'Company'}
              width={32}
              height={32}
              className="rounded"
            />
          )}
          <div className="flex flex-col">
            <span className="text-[15px] font-semibold leading-none">
              {process.env.NEXT_PUBLIC_COMPANY_NAME || 'BRIF'}
            </span>
            <span className="text-[11px] font-normal text-white/50 leading-none mt-0.5">
              powered by BRIF
            </span>
          </div>
        </Link>
        <span className="ml-auto font-mono text-[11px] uppercase tracking-wider text-white/30">
          {user.email}
        </span>
      </header>

      {/* Layout principal: sidebar + conteúdo */}
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar
          projects={projects}
          user={user}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AppTopbar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}

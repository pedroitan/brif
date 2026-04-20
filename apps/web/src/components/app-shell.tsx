'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-neutral-50">
      {/* Tab bar superior (brand + logout) */}
      <header className="sticky top-0 z-50 flex items-center gap-2 bg-brif-navy px-3 py-2 md:px-4 md:py-2.5">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mr-2 flex items-center justify-center rounded p-1 text-white md:hidden"
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {sidebarOpen ? (
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </button>
        <Link
          href="/projetos"
          className="mr-2 flex items-center gap-2 font-display text-[14px] font-extrabold tracking-wide text-white md:mr-6 md:gap-3 md:text-[16px]"
        >
          {process.env.NEXT_PUBLIC_COMPANY_LOGO && (
            <Image
              src={process.env.NEXT_PUBLIC_COMPANY_LOGO}
              alt={process.env.NEXT_PUBLIC_COMPANY_NAME || 'Company'}
              width={28}
              height={28}
              className="rounded md:h-8 md:w-8"
            />
          )}
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold leading-none md:text-[15px]">
              {process.env.NEXT_PUBLIC_COMPANY_NAME || 'BRIF'}
            </span>
            <span className="text-[10px] font-normal text-white/50 leading-none mt-0.5 md:text-[11px]">
              powered by BRIF
            </span>
          </div>
        </Link>
        <span className="ml-auto hidden font-mono text-[11px] uppercase tracking-wider text-white/30 md:block">
          {user.email}
        </span>
      </header>

      {/* Layout principal: sidebar + conteúdo */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile drawer overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <AppSidebar
          projects={projects}
          user={user}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AppTopbar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}

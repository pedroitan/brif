'use client';

import { signOut } from 'next-auth/react';

export function SidebarSignOut() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="rounded p-1 text-white/40 transition-colors hover:bg-white/5 hover:text-white/80"
      aria-label="Sair"
      title="Sair"
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path
          d="M6 3H3.5A.5.5 0 003 3.5v9a.5.5 0 00.5.5H6"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M11 5l3 3-3 3M14 8H7"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

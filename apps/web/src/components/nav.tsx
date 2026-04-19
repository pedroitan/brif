'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@brif/ui';

export function Nav() {
  const { data: session } = useSession();

  return (
    <header className="border-b bg-background">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/projetos" className="font-semibold tracking-tight">
          BRIF · Agência Demo
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/projetos"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Projetos
          </Link>
          {session?.user && (
            <>
              <span className="text-sm text-muted-foreground">{session.user.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                Sair
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

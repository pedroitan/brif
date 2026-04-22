import { Button } from '@brif/ui';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">BRIF</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Plataforma de Gestão de Projetos
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/login">
          <Button>Entrar</Button>
        </Link>
        <Link href="/projetos">
          <Button variant="outline">Ver projetos</Button>
        </Link>
      </div>
    </main>
  );
}

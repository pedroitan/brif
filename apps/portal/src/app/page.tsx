export default function PortalHome() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Portal do Cliente</h1>
        <p className="mt-3 text-muted-foreground">
          Acesse via link enviado por e-mail para visualizar seu projeto.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Sprint 1 · Fundação instalada ✓</p>
      </div>
    </main>
  );
}

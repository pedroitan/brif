import Link from 'next/link';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@brif/ui';

export default function ProjetosPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Projetos</CardTitle>
          <CardDescription>Em construção — Sprint 2</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            O CRUD de projetos (listar, criar, ver detalhes) será implementado no próximo sprint.
          </p>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Voltar
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}

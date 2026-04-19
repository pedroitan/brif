import Link from 'next/link';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@brif/ui';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Em construção — Sprint 2</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            A tela de login com NextAuth será implementada no próximo sprint.
          </p>
          <p className="text-sm text-muted-foreground">
            Credenciais de demo (já no banco):
            <br />
            <code className="text-xs">gerente@agenciademo.com.br</code>
            <br />
            <code className="text-xs">brif2026</code>
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

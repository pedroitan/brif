import { Card, CardDescription, CardHeader, CardTitle } from '@brif/ui';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Link inválido</CardTitle>
          <CardDescription>
            Este link de aprovação não existe ou já foi revogado. Entre em
            contato com a equipe da agência para receber um novo link.
          </CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}

import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@brif/ui';
import { Nav } from '@/components/nav';
import { authOptions } from '@/lib/auth';
import { NewProjectForm } from './form';

export default async function NovoProjetoPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="container max-w-2xl py-8">
        <div className="mb-6">
          <Link
            href="/projetos"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Voltar para projetos
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Novo projeto</h1>
          <p className="text-muted-foreground">
            Crie um projeto para começar a gravar reuniões e gerar briefings.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados do projeto</CardTitle>
            <CardDescription>
              O cliente receberá um link para aprovar o briefing final.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <NewProjectForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

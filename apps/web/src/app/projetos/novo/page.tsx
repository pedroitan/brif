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
import { authOptions } from '@/lib/auth';
import { NewProjectForm } from './form';

export default async function NovoProjetoPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <Link
          href="/projetos"
          className="text-sm text-brif-muted hover:text-brif-ink"
        >
          ← Voltar para projetos
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">
          Novo projeto
        </h1>
        <p className="text-sm text-muted-foreground">
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
    </div>
  );
}

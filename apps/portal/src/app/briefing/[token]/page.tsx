import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@brif/ui';
import { getBriefingByToken, markViewed } from '@/lib/briefing';
import { DecisionForm } from './decision-form';

const FIELDS = [
  { key: 'objetivo', label: 'Objetivo' },
  { key: 'publicoAlvo', label: 'Público-alvo' },
  { key: 'tomEComunicacao', label: 'Tom e comunicação' },
  { key: 'entregas', label: 'Entregas' },
  { key: 'prazos', label: 'Prazos' },
  { key: 'orcamento', label: 'Orçamento' },
  { key: 'observacoes', label: 'Observações' },
] as const;

export default async function PortalBriefingPage({
  params,
}: {
  params: { token: string };
}) {
  const approval = await getBriefingByToken(params.token);
  if (!approval) notFound();

  const expired = approval.tokenExpiresAt < new Date();
  await markViewed(params.token);

  const { briefing } = approval;
  const project = briefing.meeting.project;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <span className="font-semibold tracking-tight">
            Agência Demo · Briefing
          </span>
          <span className="text-xs text-muted-foreground">
            Link seguro enviado por {project.clientName}
          </span>
        </div>
      </header>

      <main className="container max-w-3xl py-10">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Projeto
          </p>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <p className="mt-1 text-muted-foreground">
            Cliente: {project.clientName}
          </p>
        </div>

        {expired && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle>Link expirado</CardTitle>
              <CardDescription>
                Solicite um novo link à equipe da agência.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {approval.decidedAt && (
          <Card
            className={
              approval.decision === 'APPROVED'
                ? 'mb-6 border-green-500/50 bg-green-500/5'
                : 'mb-6 border-amber-500/50 bg-amber-500/5'
            }
          >
            <CardHeader>
              <CardTitle>
                {approval.decision === 'APPROVED'
                  ? '✓ Briefing aprovado'
                  : 'Ajustes solicitados'}
              </CardTitle>
              <CardDescription>
                Decisão registrada em{' '}
                {new Date(approval.decidedAt).toLocaleString('pt-BR')}.
              </CardDescription>
            </CardHeader>
            {approval.clientComment && (
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">
                  {approval.clientComment}
                </p>
              </CardContent>
            )}
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Briefing proposto</CardTitle>
            <CardDescription>
              Leia com atenção. Abaixo você poderá aprovar ou solicitar ajustes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {FIELDS.map((f) => {
              const value = briefing[f.key as keyof typeof briefing];
              if (f.key === 'observacoes' && !value) return null;
              return (
                <section key={f.key}>
                  <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {f.label}
                  </h3>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {String(value)}
                  </p>
                </section>
              );
            })}
          </CardContent>
        </Card>

        {!expired && !approval.decidedAt && (
          <DecisionForm token={params.token} />
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Este é um ambiente seguro. Sua decisão será registrada automaticamente
          para a equipe da agência.
        </p>
      </main>
    </div>
  );
}

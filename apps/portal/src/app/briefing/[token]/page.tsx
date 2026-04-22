import { notFound } from 'next/navigation';
import { ClientHeader } from '@/components/client-header';
import { StatusCard } from '@/components/status-card';
import { Timeline } from '@/components/timeline';
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

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

function firstName(name: string): string {
  return name.split(' ')[0] ?? name;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

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
  const agencyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'BRIF';
  const decided = !!approval.decidedAt;
  const approved = approval.decision === 'APPROVED';

  // Fase atual baseada no status
  const phaseTag = (() => {
    if (approved) return 'Criação';
    if (decided) return 'Ajustes';
    return 'Briefing';
  })();

  const phases = [
    { label: 'Briefing', state: (decided ? 'done' : 'active') as 'done' | 'active' | 'pending' },
    { label: 'Criação', state: (approved ? 'active' : 'pending') as 'done' | 'active' | 'pending' },
    { label: 'Aprovação', state: 'pending' as const },
    { label: 'Produção', state: 'pending' as const },
    { label: 'Entrega', state: 'pending' as const },
  ];

  const progressPercent = approved ? 28 : decided ? 20 : 15;

  // Timeline events
  const timelineItems = [
    {
      date: formatDate(briefing.meeting.createdAt),
      title: 'Reunião de briefing registrada',
      subtitle: 'Áudio enviado para transcrição',
    },
    {
      date: formatDate(briefing.createdAt),
      title: 'Briefing consolidado gerado',
      subtitle: 'IA processou a transcrição',
    },
    ...(approval.sentAt
      ? [
          {
            date: formatDate(approval.sentAt),
            title: 'Enviado ao cliente para aprovação',
            subtitle: 'Link seguro gerado',
          },
        ]
      : []),
    ...(approval.decidedAt
      ? [
          {
            date: formatDate(approval.decidedAt),
            title: approved ? 'Briefing aprovado' : 'Ajustes solicitados',
            subtitle: approved
              ? 'Equipe iniciando a próxima fase'
              : 'Aguardando ajustes da agência',
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientHeader
        agencyName={agencyName}
        projectName={project.name}
        clientName={project.clientName}
        clientCompany={project.clientName}
        clientInitials={initials(project.clientName)}
      />

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-6 md:px-6 md:py-8">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 md:text-2xl">
            Olá, {firstName(project.clientName)}!
          </h1>
          <p className="text-sm text-gray-600">
            {!decided && !expired
              ? 'Aqui está o status atualizado do seu projeto. Uma ação aguarda sua revisão.'
              : decided && approved
                ? 'Briefing aprovado — acompanhe o andamento do projeto abaixo.'
                : decided
                  ? 'Sua solicitação de ajustes foi registrada. A agência entrará em contato.'
                  : 'Este link expirou. Solicite um novo à equipe da agência.'}
          </p>
        </div>

        <StatusCard
          title="Status do Projeto"
          phaseTag={phaseTag}
          phases={phases}
          progressPercent={progressPercent}
        />

        {expired && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5">
            <div className="text-sm font-semibold text-red-900">
              Link expirado
            </div>
            <div className="mt-1 text-sm text-red-700">
              Solicite um novo link à equipe da agência.
            </div>
          </div>
        )}

        {decided && (
          <div
            className={`rounded-lg border p-5 ${
              approved
                ? 'border-green-200 bg-green-50'
                : 'border-amber-200 bg-amber-50'
            }`}
          >
            <div
              className={`text-base font-semibold ${
                approved ? 'text-green-900' : 'text-amber-900'
              }`}
            >
              {approved ? '✓ Briefing aprovado' : 'Ajustes solicitados'}
            </div>
            <div
              className={`mt-1 text-xs ${
                approved ? 'text-green-700' : 'text-amber-700'
              }`}
            >
              Decisão registrada em{' '}
              {new Date(approval.decidedAt!).toLocaleString('pt-BR')}.
            </div>
            {approval.clientComment && (
              <p className="mt-3 whitespace-pre-wrap text-sm text-gray-800">
                {approval.clientComment}
              </p>
            )}
          </div>
        )}

        {/* Briefing consolidado */}
        <div
          className={`overflow-hidden rounded-lg border bg-white ${
            !decided && !expired ? 'border-amber-200' : 'border-gray-200'
          }`}
        >
          {!decided && !expired && (
            <div className="bg-amber-50 px-5 py-3 text-xs font-medium text-amber-800">
              ✦ Ação necessária — Aprovação de briefing pendente
            </div>
          )}
          <div className="p-5">
            <div className="mb-4 text-base font-semibold text-gray-900">
              Briefing Consolidado — {project.name}
            </div>

            <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-3">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-gray-500">
                  Gerado em
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {formatDate(briefing.createdAt)}
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-gray-500">
                  Enviado em
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {formatDate(approval.sentAt)}
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-gray-500">
                  Versão
                </div>
                <div className="text-sm font-medium text-gray-900">v1.0</div>
              </div>
            </div>

            <div className="space-y-3 rounded-lg bg-gray-50 p-4">
              {FIELDS.map((f) => {
                const value = briefing[f.key as keyof typeof briefing];
                if (!value) return null;
                return (
                  <div
                    key={f.key}
                    className="grid grid-cols-1 gap-1 text-sm md:grid-cols-[140px_1fr] md:gap-3"
                  >
                    <div className="text-xs font-semibold text-gray-600 md:text-sm">
                      {f.label}
                    </div>
                    <div className="whitespace-pre-wrap text-sm text-gray-900">
                      {String(value)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {!expired && !decided && <DecisionForm token={params.token} />}

        {/* Histórico */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-5">
          <div className="mb-4 text-sm font-semibold text-gray-900">
            Histórico do Projeto
          </div>
          <Timeline items={timelineItems} />
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          Este é um ambiente seguro. Sua decisão será registrada automaticamente
          para a equipe da agência.
        </p>
      </main>
    </div>
  );
}

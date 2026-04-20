import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { notFound, redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tag,
} from '@brif/ui';
import { authOptions } from '@/lib/auth';
import { getBriefingByMeeting } from '@/lib/actions/briefings';
import { BriefingEditor } from './editor';
import { FlowSteps, computeFlowSteps } from '@/components/flow-steps';
import { ApprovalStatus } from '@/components/approval-status';
import { AudioPlayer } from '@/components/audio-player';

const PORTAL_URL = process.env.NEXT_PUBLIC_PORTAL_URL ?? 'http://localhost:3001';

export default async function BriefingPage({
  params,
}: {
  params: { id: string; meetingId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const briefing = await getBriefingByMeeting(params.meetingId);
  if (!briefing || briefing.meeting.projectId !== params.id) notFound();

  const statusTag = (() => {
    switch (briefing.status) {
      case 'APPROVED':
        return { variant: 'teal' as const, label: 'Aprovado' };
      case 'REJECTED':
        return { variant: 'red' as const, label: 'Ajustes solicitados' };
      case 'SENT':
        return { variant: 'blue' as const, label: 'Enviado ao cliente' };
      default:
        return { variant: 'gray' as const, label: 'Rascunho' };
    }
  })();

  const flowSteps = computeFlowSteps({
    transcriptionStatus: briefing.meeting.transcriptionStatus,
    briefingStatus: briefing.status,
    approvalDecision: briefing.approval?.decision,
  });

  return (
    <div className="mx-auto max-w-[1400px] p-4 md:p-6">
      {/* Cabeçalho */}
      <div className="mb-4">
        <Link
          href={`/projetos/${params.id}/reuniao/${params.meetingId}`}
          className="text-xs text-brif-muted hover:text-brif-ink"
        >
          ← Voltar para transcrição
        </Link>
        <div className="mt-1.5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight md:text-2xl">
              Briefing · {briefing.meeting.project.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Cliente: {briefing.meeting.project.clientName}
            </p>
          </div>
          <div className="self-start">
            <Tag variant={statusTag.variant}>{statusTag.label}</Tag>
          </div>
        </div>
      </div>

      {/* Flow steps */}
      <div className="mb-5 -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <FlowSteps steps={flowSteps} />
      </div>

      {/* Layout 2 colunas — igual wireframe: esquerda=gravação+transcrição, direita=briefing+aprovação */}
      <div className="grid gap-5 lg:grid-cols-[1fr_460px]">
        {/* Coluna esquerda: gravação + transcrição */}
        <div className="space-y-5">
          {/* Card da gravação */}
          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0">
              <CardTitle>Gravação da reunião</CardTitle>
              <Tag
                variant={
                  briefing.meeting.transcriptionStatus === 'COMPLETED'
                    ? 'teal'
                    : 'amber'
                }
              >
                {briefing.meeting.transcriptionStatus === 'COMPLETED'
                  ? 'Transcrita'
                  : 'Processando'}
              </Tag>
            </CardHeader>
            <CardContent className="space-y-4">
              <AudioPlayer
                src={briefing.meeting.audioUrl}
                fileName={briefing.meeting.audioFileName}
              />

              {briefing.meeting.transcriptionStatus === 'COMPLETED' && (
                <div className="max-h-[380px] overflow-y-auto rounded-md border border-brif-border bg-brif-surf p-4">
                  <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-brif-muted">
                    Transcrição
                  </div>
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-brif-ink">
                    {briefing.meeting.transcriptionEdited ??
                      briefing.meeting.transcriptionRaw ??
                      'Sem transcrição disponível.'}
                  </p>
                </div>
              )}

              <Link
                href={`/projetos/${params.id}/reuniao/${params.meetingId}`}
                className="inline-block text-xs text-brif-teal hover:text-brif-teal-d"
              >
                Editar transcrição →
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Coluna direita: briefing + status de aprovação */}
        <div className="space-y-5">
          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0">
              <CardTitle>Briefing consolidado</CardTitle>
              <Tag variant="amber">IA gerado</Tag>
            </CardHeader>
            <CardContent>
              <BriefingEditor
                briefingId={briefing.id}
                initial={{
                  objetivo: briefing.objetivo,
                  publicoAlvo: briefing.publicoAlvo,
                  tomEComunicacao: briefing.tomEComunicacao,
                  entregas: briefing.entregas,
                  prazos: briefing.prazos,
                  orcamento: briefing.orcamento,
                  observacoes: briefing.observacoes ?? '',
                }}
                approvalUrl={
                  briefing.approval &&
                  briefing.approval.tokenExpiresAt > new Date()
                    ? `${PORTAL_URL}/briefing/${briefing.approval.magicToken}`
                    : null
                }
                readOnly={briefing.status === 'APPROVED'}
              />
              {briefing.generationCost !== null && (
                <div className="mt-3 font-mono text-[10px] text-brif-muted">
                  Geração custou $
                  {briefing.generationCost?.toFixed(4)} USD
                </div>
              )}
            </CardContent>
          </Card>

          <ApprovalStatus
            briefingStatus={briefing.status}
            clientName={briefing.meeting.project.clientName}
            approvalDecision={briefing.approval?.decision}
            approvalDecidedAt={briefing.approval?.decidedAt ?? null}
          />

          {briefing.approval?.decidedAt &&
            briefing.approval.decision === 'APPROVED' && (
              <div className="rounded-lg border border-brif-teal/30 bg-brif-teal-l p-4">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-brif-teal-d">
                  Aprovado ✓
                </div>
                {briefing.approval.clientComment && (
                  <p className="mt-1.5 whitespace-pre-wrap text-[13px] text-brif-ink">
                    “{briefing.approval.clientComment}”
                  </p>
                )}
              </div>
            )}

          {briefing.approval?.decidedAt &&
            briefing.approval.decision === 'REJECTED' && (
              <div className="rounded-lg border border-brif-amber/30 bg-brif-amber-l p-4">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#92520A]">
                  Ajustes solicitados
                </div>
                {briefing.approval.clientComment && (
                  <p className="mt-1.5 whitespace-pre-wrap text-[13px] text-brif-ink">
                    {briefing.approval.clientComment}
                  </p>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

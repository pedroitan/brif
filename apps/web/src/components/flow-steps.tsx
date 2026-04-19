import { cn } from '@brif/ui';

export type FlowStepState = 'done' | 'active' | 'pending';

export type FlowStep = {
  label: string;
  state: FlowStepState;
};

/**
 * Componente visual dos 5 passos do fluxo de briefing, estilo wireframe:
 * barra horizontal dividida em células com border-right, célula ativa com
 * fundo teal-l e sublinhado teal.
 */
export function FlowSteps({ steps }: { steps: FlowStep[] }) {
  return (
    <div className="flex items-stretch overflow-hidden rounded-lg border border-brif-border bg-white">
      {steps.map((step, i) => (
        <Step
          key={i}
          step={step}
          index={i}
          isLast={i === steps.length - 1}
        />
      ))}
    </div>
  );
}

function Step({
  step,
  index,
  isLast,
}: {
  step: FlowStep;
  index: number;
  isLast: boolean;
}) {
  const isDone = step.state === 'done';
  const isActive = step.state === 'active';

  return (
    <div
      className={cn(
        'relative flex flex-1 items-center gap-2.5 px-4 py-3.5 text-[13px] font-medium',
        !isLast && 'border-r border-brif-border',
        isDone && 'text-brif-teal-d',
        isActive && 'bg-brif-teal-l text-brif-ink',
        !isDone && !isActive && 'text-brif-muted',
      )}
    >
      {/* Bolha numerada */}
      <div
        className={cn(
          'flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-semibold',
          isDone && 'bg-brif-teal text-white',
          isActive && 'bg-brif-teal text-white',
          !isDone && !isActive && 'bg-brif-surf-2 text-brif-muted',
        )}
      >
        {isDone ? (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 5.5L4 7.5L8 3"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          index + 1
        )}
      </div>
      <span className="truncate">{step.label}</span>

      {/* Sublinhado teal no ativo */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brif-teal" />
      )}
    </div>
  );
}

/**
 * Deriva o estado dos 5 passos a partir dos dados de reunião/briefing/aprovação.
 */
export function computeFlowSteps(input: {
  transcriptionStatus?: string | null;
  briefingStatus?: string | null;
  approvalDecision?: string | null;
}): FlowStep[] {
  const { transcriptionStatus, briefingStatus, approvalDecision } = input;

  // 1. Gravação (sempre done se chegamos aqui — áudio foi enviado)
  const step1: FlowStepState = 'done';

  // 2. Transcrição
  const step2: FlowStepState =
    transcriptionStatus === 'COMPLETED'
      ? 'done'
      : transcriptionStatus === 'PROCESSING' || transcriptionStatus === 'PENDING'
        ? 'active'
        : 'pending';

  // 3. Revisão Planner (briefing criado e editável)
  const step3: FlowStepState = !briefingStatus
    ? step2 === 'done'
      ? 'active'
      : 'pending'
    : briefingStatus === 'DRAFT'
      ? 'active'
      : 'done';

  // 4. Aprovação Gerente (briefing enviado ao cliente = gerente já aprovou internamente)
  const step4: FlowStepState =
    briefingStatus === 'SENT' ||
    briefingStatus === 'APPROVED' ||
    briefingStatus === 'REJECTED'
      ? briefingStatus === 'SENT'
        ? 'done'
        : 'done'
      : step3 === 'done'
        ? 'active'
        : 'pending';

  // 5. Confirmação Cliente
  const step5: FlowStepState =
    approvalDecision === 'APPROVED'
      ? 'done'
      : approvalDecision === 'REJECTED'
        ? 'active'
        : briefingStatus === 'SENT'
          ? 'active'
          : 'pending';

  return [
    { label: 'Gravação', state: step1 },
    { label: 'Transcrição', state: step2 },
    { label: 'Revisão Planner', state: step3 },
    { label: 'Aprovação Gerente', state: step4 },
    { label: 'Confirmação Cliente', state: step5 },
  ];
}

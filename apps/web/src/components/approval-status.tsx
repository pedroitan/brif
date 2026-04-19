import { cn } from '@brif/ui';

type ApprovalStatusProps = {
  briefingStatus: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED';
  approvalDecision?: 'APPROVED' | 'REJECTED' | null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  approvalDecidedAt?: Date | null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  clientName?: string;
  actionSlot?: React.ReactNode;
};

/**
 * Widget horizontal com 3 steps (Planner / Gerente / Cliente) + botão de ação
 * opcional. Mirror do componente .approval-steps do wireframe.
 */
export function ApprovalStatus({
  briefingStatus,
  approvalDecision,
  actionSlot,
}: ApprovalStatusProps) {
  // Planner: assim que o briefing é criado, o Planner já revisou
  const plannerState: StageState = 'done';

  // Gerente: aprovou internamente quando briefing foi enviado ao cliente
  const managerState: StageState =
    briefingStatus === 'SENT' ||
    briefingStatus === 'APPROVED' ||
    briefingStatus === 'REJECTED'
      ? 'done'
      : 'active';

  // Cliente
  const clientState: StageState =
    approvalDecision === 'APPROVED'
      ? 'done'
      : approvalDecision === 'REJECTED'
        ? 'rejected'
        : briefingStatus === 'SENT'
          ? 'active'
          : 'pending';

  return (
    <div className="rounded-lg border border-brif-border bg-white shadow-sm">
      <div className="border-b border-brif-border px-4 py-3">
        <h3 className="font-display text-sm font-bold">Status de aprovação</h3>
      </div>
      <div className="p-4">
        <div className="flex items-start">
          <Step
            index={1}
            label={
              <>
                Planner
                <br />
                revisou
              </>
            }
            state={plannerState}
            isLast={false}
          />
          <Step
            index={2}
            label={
              <>
                Gerente
                <br />
                {managerState === 'done' ? 'aprovou' : 'aprovando'}
              </>
            }
            state={managerState}
            isLast={false}
          />
          <Step
            index={3}
            label={
              <>
                Cliente
                <br />
                {clientState === 'done'
                  ? 'aprovou'
                  : clientState === 'rejected'
                    ? 'pediu ajuste'
                    : clientState === 'active'
                      ? 'confirmando'
                      : 'confirma'}
              </>
            }
            state={clientState}
            isLast={true}
          />
        </div>
        {actionSlot && <div className="mt-4">{actionSlot}</div>}
      </div>
    </div>
  );
}

type StageState = 'done' | 'active' | 'pending' | 'rejected';

function Step({
  index,
  label,
  state,
  isLast,
}: {
  index: number;
  label: React.ReactNode;
  state: StageState;
  isLast: boolean;
}) {
  return (
    <div className="relative flex flex-1 flex-col items-center gap-1.5">
      {/* Linha conectora (exceto último) */}
      {!isLast && (
        <div
          className={cn(
            'absolute left-[calc(50%+14px)] top-[13px] h-px w-[calc(100%-28px)]',
            state === 'done' ? 'bg-brif-teal' : 'bg-brif-border',
          )}
        />
      )}

      <StageCircle state={state} index={index} />

      <div
        className={cn(
          'whitespace-pre text-center text-[11px] leading-tight',
          state === 'pending' && 'text-brif-muted',
          state === 'done' && 'font-medium text-brif-teal-d',
          state === 'active' && 'font-semibold text-brif-ink',
          state === 'rejected' && 'font-semibold text-brif-red',
        )}
      >
        {label}
      </div>
    </div>
  );
}

function StageCircle({ state, index }: { state: StageState; index: number }) {
  const base =
    'relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white text-[10px] font-mono font-semibold';

  if (state === 'done') {
    return (
      <div className={cn(base, 'border-brif-teal bg-brif-teal text-white')}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M2 5.5L4 7.5L8 3"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }
  if (state === 'rejected') {
    return (
      <div className={cn(base, 'border-brif-red bg-brif-red text-white')}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M3 3L7 7M7 3L3 7"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }
  if (state === 'active') {
    return (
      <div className={cn(base, 'border-brif-teal text-brif-teal')}>→</div>
    );
  }
  return <div className={cn(base, 'border-brif-border text-brif-muted')}>{index}</div>;
}

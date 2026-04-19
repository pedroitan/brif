import { PhasePills, type PhasePill } from './phase-pills';

export type StatusCardProps = {
  title: string;
  phaseTag: string;
  phases: PhasePill[];
  progressPercent: number;
  nextDelivery?: string;
};

export function StatusCard({
  title,
  phaseTag,
  phases,
  progressPercent,
  nextDelivery,
}: StatusCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-gray-900">{title}</div>
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
          Fase: {phaseTag}
        </span>
      </div>
      
      <PhasePills phases={phases} />
      
      <div className="mt-4 px-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-purple-600"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-600">
          Progresso geral: <span className="font-semibold text-purple-600">{progressPercent}%</span>
          {nextDelivery && (
            <>
              {' · '}Próxima entrega: <span className="font-medium">{nextDelivery}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

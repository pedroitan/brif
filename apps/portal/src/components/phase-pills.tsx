export type PhasePillState = 'done' | 'active' | 'pending';

export type PhasePill = {
  label: string;
  state: PhasePillState;
};

export function PhasePills({ phases }: { phases: PhasePill[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {phases.map((phase, i) => (
        <div
          key={i}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            phase.state === 'done'
              ? 'bg-purple-100 text-purple-700'
              : phase.state === 'active'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {phase.label}
        </div>
      ))}
    </div>
  );
}

export type ActionCardProps = {
  banner: string;
  title: string;
  meta: {
    label: string;
    value: string;
  }[];
  briefingPreview?: {
    key: string;
    value: string;
  }[];
  onApprove?: () => void;
  onComment?: () => void;
};

export function ActionCard({
  banner,
  title,
  meta,
  briefingPreview,
  onApprove,
  onComment,
}: ActionCardProps) {
  return (
    <div className="rounded-lg border border-amber-200 bg-white">
      <div className="rounded-t-lg bg-amber-50 px-5 py-3 text-xs font-medium text-amber-800">
        {banner}
      </div>
      <div className="p-5">
        <div className="mb-4 text-base font-semibold text-gray-900">{title}</div>
        
        <div className="mb-5 grid grid-cols-3 gap-4">
          {meta.map((item, i) => (
            <div key={i}>
              <div className="text-xs text-gray-500">{item.label}</div>
              <div className="text-sm font-medium text-gray-900">{item.value}</div>
            </div>
          ))}
        </div>

        {briefingPreview && (
          <div className="mb-5 space-y-2 rounded-lg bg-gray-50 p-4">
            {briefingPreview.map((item, i) => (
              <div key={i} className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                <div className="text-xs font-medium text-gray-600">{item.key}</div>
                <div className="text-sm text-gray-900">{item.value}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onApprove}
            className="flex-1 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700"
          >
            Confirmar briefing
          </button>
          <button
            onClick={onComment}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Solicitar ajuste
          </button>
        </div>
      </div>
    </div>
  );
}

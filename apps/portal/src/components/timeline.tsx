export type TimelineItem = {
  date: string;
  title: string;
  subtitle?: string;
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="space-y-0">
      {items.map((item, i) => (
        <div key={i} className="flex gap-4 py-4">
          <div className="flex flex-col items-center">
            <div className="h-3 w-3 rounded-full bg-purple-600" />
            {i < items.length - 1 && <div className="w-0.5 flex-1 bg-gray-200" />}
          </div>
          <div className="flex-1 pb-4">
            <div className="text-xs text-gray-500">{item.date}</div>
            <div className="text-sm font-medium text-gray-900">{item.title}</div>
            {item.subtitle && (
              <div className="text-xs text-gray-600">{item.subtitle}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

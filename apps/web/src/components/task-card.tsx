export type TaskCardProps = {
  id: string;
  title: string;
  description?: string;
  tag?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: Date;
  assigneeName?: string;
  assigneeInitials?: string;
  assigneeColor?: string;
  fileCount?: number;
  isUrgent?: boolean;
  onDragStart?: (taskId: string) => void;
  onClick?: () => void;
};

export function TaskCard({
  id,
  title,
  description,
  tag,
  priority,
  dueDate,
  assigneeName,
  assigneeInitials,
  assigneeColor,
  fileCount,
  isUrgent,
  onDragStart,
  onClick,
}: TaskCardProps) {
  const getPriorityColor = (p: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') => {
    switch (p) {
      case 'URGENT': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-gray-400';
    }
  };

  const getTagColor = (tag?: string) => {
    if (!tag) return 'bg-gray-100 text-gray-700';
    const lower = tag.toLowerCase();
    if (lower.includes('criação')) return 'bg-teal-100 text-teal-700';
    if (lower.includes('estratégia')) return 'bg-blue-100 text-blue-700';
    if (lower.includes('financeiro')) return 'bg-gray-100 text-gray-700';
    if (lower.includes('deck')) return 'bg-amber-100 text-amber-700';
    if (lower.includes('briefing')) return 'bg-teal-100 text-teal-700';
    if (lower.includes('setup')) return 'bg-gray-100 text-gray-700';
    return 'bg-gray-100 text-gray-700';
  };

  const formatDueDate = (date?: Date) => {
    if (!date) return '';
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Atrasado';
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Amanhã';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const isLate = dueDate && dueDate < new Date();

  return (
    <div
      draggable
      onDragStart={() => onDragStart?.(id)}
      onClick={onClick}
      className={`min-h-[88px] cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md md:min-h-0 ${
        isUrgent ? 'border-red-300' : 'border-gray-200'
      }`}
    >
      {tag && (
        <div className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${getTagColor(tag)}`}>
          {tag}
        </div>
      )}
      
      <div className="mt-2 font-medium text-gray-900">{title}</div>
      
      {description && (
        <div className="mt-1 text-sm text-gray-600 line-clamp-2">{description}</div>
      )}
      
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {assigneeInitials && (
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: assigneeColor || '#6366f1' }}
              title={assigneeName}
            >
              {assigneeInitials}
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {fileCount !== undefined && <span>📎 {fileCount}</span>}
          </div>
        </div>
        
        {dueDate && (
          <div className={`text-xs ${isLate ? 'text-red-600' : 'text-gray-500'}`}>
            {formatDueDate(dueDate)}
          </div>
        )}
      </div>
    </div>
  );
}

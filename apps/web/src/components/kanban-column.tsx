import { TaskCard } from './task-card';

export type KanbanColumnProps = {
  title: string;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  tasks: Array<{
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
  }>;
  color: string;
  onDragStart?: (taskId: string) => void;
  onDrop?: (taskId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE') => void;
  onAddTask?: () => void;
};

export function KanbanColumn({
  title,
  status,
  tasks,
  color,
  onDragStart,
  onDrop,
  onAddTask,
}: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId && onDrop) {
      onDrop(taskId, status);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex min-w-[280px] max-w-[320px] flex-1 flex-col gap-3"
    >
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        <div className="text-sm font-semibold text-gray-900">{title}</div>
        <div className="text-sm text-gray-500">{tasks.length}</div>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            {...task}
            onDragStart={onDragStart}
          />
        ))}
      </div>

      {onAddTask && (
        <button
          onClick={onAddTask}
          className="rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-gray-400 hover:bg-gray-50"
        >
          + Adicionar tarefa
        </button>
      )}
    </div>
  );
}

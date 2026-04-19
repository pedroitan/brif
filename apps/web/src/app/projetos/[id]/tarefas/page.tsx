import { KanbanBoard } from '@/components/kanban-board';
import { getTasksByProject } from '@/lib/actions/tasks';

export default async function TarefasPage({ params }: { params: { id: string } }) {
  const tasks = await getTasksByProject(params.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Kanban de Tarefas</h1>
          <p className="text-sm text-gray-600">Gerencie as tarefas do projeto</p>
        </div>
        <button className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700">
          + Nova tarefa
        </button>
      </div>

      <KanbanBoard
        tasks={tasks.map((task: any) => ({
          id: task.id,
          title: task.title,
          description: task.description || undefined,
          tag: task.tag || undefined,
          priority: task.priority,
          dueDate: task.dueDate || undefined,
          assigneeName: task.assignee?.name || undefined,
          assigneeInitials: task.assignee?.name
            ? task.assignee.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
            : undefined,
          assigneeColor: '#6366f1',
          fileCount: task.fileCount,
          status: task.status,
        }))}
      />
    </div>
  );
}

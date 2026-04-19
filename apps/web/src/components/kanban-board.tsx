'use client';

import { useState } from 'react';
import { KanbanColumn } from './kanban-column';

export type KanbanBoardProps = {
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
    status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  }>;
  onMoveTask?: (taskId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE') => void;
  onAddTask?: (status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE') => void;
};

export function KanbanBoard({ tasks, onMoveTask, onAddTask }: KanbanBoardProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDrop = (taskId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE') => {
    if (onMoveTask) {
      onMoveTask(taskId, newStatus);
    }
    setDraggedTaskId(null);
  };

  const columns = [
    { title: 'A fazer', status: 'TODO' as const, color: '#94A3B8' },
    { title: 'Em progresso', status: 'IN_PROGRESS' as const, color: '#E09B2A' },
    { title: 'Em revisão', status: 'REVIEW' as const, color: '#2D7DD2' },
    { title: 'Concluído', status: 'DONE' as const, color: '#0D9E78' },
  ];

  const tasksByStatus = (status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE') => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <KanbanColumn
          key={column.status}
          title={column.title}
          status={column.status}
          tasks={tasksByStatus(column.status)}
          color={column.color}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onAddTask={onAddTask ? () => onAddTask(column.status) : undefined}
        />
      ))}
    </div>
  );
}

'use server';

import { prisma } from '@brif/db';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function getTasksByProject(projectId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Não autenticado');

  return prisma.task.findMany({
    where: {
      projectId,
      project: { managerId: session.user.id },
    },
    include: {
      assignee: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createTask(data: {
  projectId: string;
  title: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  tag?: string;
  dueDate?: Date;
  assigneeId?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Não autenticado');

  const task = await prisma.task.create({
    data: {
      projectId: data.projectId,
      title: data.title,
      description: data.description,
      status: data.status || 'TODO',
      priority: data.priority || 'MEDIUM',
      tag: data.tag,
      dueDate: data.dueDate,
      assigneeId: data.assigneeId,
    },
    include: {
      assignee: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  revalidatePath(`/projetos/${data.projectId}/tarefas`);
  return task;
}

export async function updateTask(
  taskId: string,
  data: {
    title?: string;
    description?: string;
    status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    tag?: string;
    dueDate?: Date;
    assigneeId?: string;
    fileCount?: number;
  }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Não autenticado');

  const task = await prisma.task.update({
    where: { id: taskId },
    data,
    include: {
      assignee: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  revalidatePath(`/projetos/${task.projectId}/tarefas`);
  return task;
}

export async function deleteTask(taskId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Não autenticado');

  const task = await prisma.task.delete({
    where: { id: taskId },
  });

  revalidatePath(`/projetos/${task.projectId}/tarefas`);
  return task;
}

export async function moveTask(taskId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE') {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error('Não autenticado');

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus },
    include: {
      assignee: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  revalidatePath(`/projetos/${task.projectId}/tarefas`);
  return task;
}

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@brif/db';
import { authOptions } from '@/lib/auth';

const createProjectSchema = z.object({
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres').max(120),
  clientName: z.string().min(2, 'Informe o nome do cliente').max(120),
  clientEmail: z.string().email('E-mail inválido'),
});

export type CreateProjectState = {
  errors?: {
    name?: string[];
    clientName?: string[];
    clientEmail?: string[];
    _form?: string[];
  };
};

export async function createProject(
  _prevState: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { errors: { _form: ['Sessão expirada. Faça login novamente.'] } };
  }

  const parsed = createProjectSchema.safeParse({
    name: formData.get('name'),
    clientName: formData.get('clientName'),
    clientEmail: formData.get('clientEmail'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      clientName: parsed.data.clientName,
      clientEmail: parsed.data.clientEmail.toLowerCase().trim(),
      managerId: session.user.id,
    },
  });

  revalidatePath('/projetos');
  redirect(`/projetos/${project.id}`);
}

export async function listProjects(managerId: string) {
  return prisma.project.findMany({
    where: { managerId },
    orderBy: { createdAt: 'desc' },
    include: {
      meetings: { select: { id: true } },
    },
  });
}

export async function getProject(id: string, managerId: string) {
  return prisma.project.findFirst({
    where: { id, managerId },
    include: {
      manager: { select: { id: true, name: true, email: true } },
      meetings: {
        orderBy: { createdAt: 'desc' },
        include: { briefing: true },
      },
    },
  });
}

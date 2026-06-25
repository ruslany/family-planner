'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  return session;
}

export async function createProject(data: { title: string; description?: string }) {
  await requireAuth();
  if (!data.title?.trim()) throw new Error('Title is required');
  await prisma.project.create({
    data: {
      title: data.title.trim(),
      description: data.description?.trim() || null,
      status: 'active',
    },
  });
  revalidatePath('/projects');
}

export async function updateProject(
  id: string,
  data: { title?: string; description?: string; status?: string },
) {
  await requireAuth();
  const updates: Record<string, unknown> = {};
  if (data.title !== undefined) updates.title = data.title.trim();
  if (data.description !== undefined) updates.description = data.description?.trim() || null;
  if (data.status !== undefined) {
    updates.status = data.status;
    if (data.status === 'completed') updates.completedAt = new Date();
    else updates.completedAt = null;
  }
  await prisma.project.update({ where: { id }, data: updates });
  revalidatePath('/projects');
}

export async function deleteProject(id: string) {
  await requireAuth();
  await prisma.project.update({ where: { id }, data: { status: 'dropped' } });
  revalidatePath('/projects');
}

export async function createBacklogTask(data: {
  projectId: string;
  title: string;
  description?: string;
}) {
  await requireAuth();
  if (!data.title?.trim()) throw new Error('Title is required');
  await prisma.task.create({
    data: {
      projectId: data.projectId,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      status: 'todo',
      weekId: null,
    },
  });
  revalidatePath('/projects');
}

export async function deleteBacklogTask(taskId: string) {
  await requireAuth();
  await prisma.task.delete({ where: { id: taskId } });
  revalidatePath('/projects');
  revalidatePath('/week');
}

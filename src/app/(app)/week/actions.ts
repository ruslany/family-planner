'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  return session;
}

export async function toggleTaskStatus(id: string, currentStatus: string) {
  await requireAuth();
  const newStatus = currentStatus === 'done' ? 'todo' : 'done';
  await prisma.task.update({
    where: { id },
    data: {
      status: newStatus,
      completedAt: newStatus === 'done' ? new Date() : null,
    },
  });
  revalidatePath('/week');
}

export async function createTask(formData: {
  weekId: string;
  title: string;
  description?: string;
  dayOfWeek?: number | null;
}) {
  await requireAuth();
  const { weekId, title, description, dayOfWeek } = formData;

  if (!weekId || !title?.trim()) throw new Error('weekId and title are required');

  await prisma.task.create({
    data: {
      weekId,
      title: title.trim(),
      description: description?.trim() || null,
      dayOfWeek: dayOfWeek ?? null,
      status: 'todo',
    },
  });
  revalidatePath('/week');
}

export async function updateTask(
  id: string,
  data: { title?: string; description?: string; dayOfWeek?: number | null },
) {
  await requireAuth();
  const updates: Record<string, unknown> = {};
  if (data.title !== undefined) updates.title = data.title.trim();
  if (data.description !== undefined) updates.description = data.description?.trim() || null;
  if (data.dayOfWeek !== undefined) updates.dayOfWeek = data.dayOfWeek;

  await prisma.task.update({ where: { id }, data: updates });
  revalidatePath('/week');
}

export async function deleteTask(id: string) {
  await requireAuth();
  await prisma.task.delete({ where: { id } });
  revalidatePath('/week');
}

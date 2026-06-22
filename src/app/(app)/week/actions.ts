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
  assigneeUserId?: string | null;
  assigneeMemberId?: string | null;
}) {
  await requireAuth();
  const { weekId, title, description, dayOfWeek, assigneeUserId, assigneeMemberId } = formData;

  if (!weekId || !title?.trim()) throw new Error('weekId and title are required');

  await prisma.task.create({
    data: {
      weekId,
      title: title.trim(),
      description: description?.trim() || null,
      dayOfWeek: dayOfWeek ?? null,
      status: 'todo',
      assigneeUserId: assigneeUserId ?? null,
      assigneeMemberId: assigneeMemberId ?? null,
    },
  });
  revalidatePath('/week');
}

export async function updateTask(
  id: string,
  data: {
    title?: string;
    description?: string;
    dayOfWeek?: number | null;
    assigneeUserId?: string | null;
  },
) {
  await requireAuth();
  const updates: Record<string, unknown> = {};
  if (data.title !== undefined) updates.title = data.title.trim();
  if (data.description !== undefined) updates.description = data.description?.trim() || null;
  if (data.dayOfWeek !== undefined) updates.dayOfWeek = data.dayOfWeek;
  if (data.assigneeUserId !== undefined) {
    updates.assigneeUserId = data.assigneeUserId;
    updates.assigneeMemberId = null;
  }

  await prisma.task.update({ where: { id }, data: updates });
  revalidatePath('/week');
}

export async function deleteTask(id: string) {
  await requireAuth();
  await prisma.task.delete({ where: { id } });
  revalidatePath('/week');
}

export async function startWeek(weekId: string) {
  await requireAuth();
  await prisma.week.update({ where: { id: weekId }, data: { state: 'in-progress' } });
  revalidatePath('/week');
}

export async function beginReview(weekId: string) {
  await requireAuth();
  await prisma.week.update({ where: { id: weekId }, data: { state: 'review' } });
  revalidatePath('/week');
}

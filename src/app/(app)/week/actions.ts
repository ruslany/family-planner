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
  projectId?: string | null;
}) {
  await requireAuth();
  const { weekId, title, description, dayOfWeek, assigneeUserId, assigneeMemberId, projectId } =
    formData;

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
      projectId: projectId ?? null,
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
    projectId?: string | null;
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
  if (data.projectId !== undefined) updates.projectId = data.projectId;

  await prisma.task.update({ where: { id }, data: updates });
  revalidatePath('/week');
}

export async function deleteTask(id: string) {
  await requireAuth();
  await prisma.task.delete({ where: { id } });
  revalidatePath('/week');
  revalidatePath('/projects');
}

export async function scheduleBacklogTask(
  taskId: string,
  weekId: string,
  dayOfWeek?: number | null,
) {
  await requireAuth();
  await prisma.task.update({
    where: { id: taskId },
    data: {
      weekId,
      dayOfWeek: dayOfWeek ?? null,
      status: 'todo',
    },
  });
  revalidatePath('/week');
  revalidatePath('/projects');
}

export async function unscheduleTask(taskId: string) {
  await requireAuth();
  await prisma.task.update({
    where: { id: taskId },
    data: { weekId: null, dayOfWeek: null },
  });
  revalidatePath('/week');
  revalidatePath('/projects');
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

export async function carryForwardTask(taskId: string, newWeekId: string) {
  await requireAuth();

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error('Task not found');

  await prisma.$transaction([
    prisma.task.update({ where: { id: taskId }, data: { status: 'skipped' } }),
    prisma.task.create({
      data: {
        weekId: newWeekId,
        title: task.title,
        description: task.description,
        status: 'todo',
        dayOfWeek: null,
        assigneeUserId: task.assigneeUserId,
        assigneeMemberId: task.assigneeMemberId,
        projectId: task.projectId,
      },
    }),
  ]);

  revalidatePath('/week');
}

export async function carryForwardAllTasks(taskIds: string[], newWeekId: string) {
  await requireAuth();

  const tasks = await prisma.task.findMany({ where: { id: { in: taskIds } } });

  await prisma.$transaction([
    prisma.task.updateMany({ where: { id: { in: taskIds } }, data: { status: 'skipped' } }),
    ...tasks.map((task) =>
      prisma.task.create({
        data: {
          weekId: newWeekId,
          title: task.title,
          description: task.description,
          status: 'todo',
          dayOfWeek: null,
          assigneeUserId: task.assigneeUserId,
          assigneeMemberId: task.assigneeMemberId,
          projectId: task.projectId,
        },
      }),
    ),
  ]);

  revalidatePath('/week');
}

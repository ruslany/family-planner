import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status, title, description, dayOfWeek } = body as {
    status?: string;
    title?: string;
    description?: string;
    dayOfWeek?: number | null;
  };

  const updates: Record<string, unknown> = {};
  if (status !== undefined) {
    updates.status = status;
    updates.completedAt = status === 'done' ? new Date() : null;
  }
  if (title !== undefined) updates.title = title.trim();
  if (description !== undefined) updates.description = description?.trim() || null;
  if (dayOfWeek !== undefined) updates.dayOfWeek = dayOfWeek;

  const task = await prisma.task.update({
    where: { id },
    data: updates,
    include: {
      assigneeUser: { select: { id: true, name: true, image: true } },
      assigneeMember: { select: { id: true, name: true, color: true } },
      goalProject: { select: { id: true, title: true } },
    },
  });

  return NextResponse.json(task);
}

export async function DELETE(_request: Request, { params }: Context) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  await prisma.task.delete({ where: { id } });
  return new Response(null, { status: 204 });
}

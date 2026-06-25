import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { weekId, title, description, dayOfWeek } = body as {
    weekId: string;
    title: string;
    description?: string;
    dayOfWeek?: number | null;
  };

  if (!weekId || !title?.trim()) {
    return NextResponse.json({ error: 'weekId and title are required' }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      weekId,
      title: title.trim(),
      description: description?.trim() || null,
      dayOfWeek: dayOfWeek ?? null,
      status: 'todo',
    },
    include: {
      assigneeUser: { select: { id: true, name: true, image: true } },
      assigneeMember: { select: { id: true, name: true, color: true } },
      project: { select: { id: true, title: true } },
    },
  });

  return NextResponse.json(task, { status: 201 });
}

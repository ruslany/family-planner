import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCurrentWeekRange } from '@/lib/week-utils';

const taskInclude = {
  assigneeUser: { select: { id: true, name: true, image: true } },
  assigneeMember: { select: { id: true, name: true, color: true } },
  goalProject: { select: { id: true, title: true } },
} as const;

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { startDate, endDate } = getCurrentWeekRange();

  let week = await prisma.week.findFirst({
    where: { startDate },
    include: {
      tasks: {
        orderBy: [{ dayOfWeek: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: taskInclude,
      },
      retrospective: true,
    },
  });

  if (!week) {
    week = await prisma.week.create({
      data: { startDate, endDate, state: 'planning' },
      include: {
        tasks: { include: taskInclude },
        retrospective: true,
      },
    });
  }

  return NextResponse.json(week);
}

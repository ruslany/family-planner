import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCurrentWeekRange } from '@/lib/week-utils';
import { WeekView } from './WeekView';
import type { WeekWithTasks } from '@/lib/types';

async function getCurrentWeek(): Promise<{ week: WeekWithTasks; prevNotes: string | null }> {
  const { startDate, endDate } = getCurrentWeekRange();

  const taskInclude = {
    assigneeUser: { select: { id: true, name: true, image: true } },
    assigneeMember: { select: { id: true, name: true, color: true } },
    goalProject: { select: { id: true, title: true } },
  } as const;

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

  let prevNotes: string | null = null;
  if (week.state === 'planning') {
    const prevWeek = await prisma.week.findFirst({
      where: { state: 'archived', endDate: { lt: week.startDate } },
      orderBy: { endDate: 'desc' },
      include: { retrospective: { select: { notesForNext: true } } },
    });
    prevNotes = prevWeek?.retrospective?.notesForNext ?? null;
  }

  return { week: week as WeekWithTasks, prevNotes };
}

export default async function WeekPage() {
  await auth();
  const { week, prevNotes } = await getCurrentWeek();
  return <WeekView week={week} prevNotes={prevNotes} />;
}

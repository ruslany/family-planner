import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCurrentWeekRange } from '@/lib/week-utils';
import { WeekView } from './WeekView';
import type { WeekWithTasks, Member } from '@/lib/types';

async function getCurrentWeek(): Promise<{ week: WeekWithTasks; prevNotes: string | null }> {
  const { startDate, endDate } = getCurrentWeekRange();

  const taskInclude = {
    assigneeUser: { select: { id: true, name: true, image: true } },
    assigneeMember: { select: { id: true, name: true, color: true } },
    goalProject: { select: { id: true, title: true } },
  } as const;

  const taskOrderBy = [
    { dayOfWeek: 'asc' as const },
    { sortOrder: 'asc' as const },
    { createdAt: 'asc' as const },
  ];

  let week = await prisma.week.findFirst({
    where: { startDate },
    include: {
      tasks: { orderBy: taskOrderBy, include: taskInclude },
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

  // If the current UTC week is already archived (user completed the retrospective before
  // midnight UTC), show the next planning week so the planning banner appears immediately.
  if (week.state === 'archived') {
    const nextWeek = await prisma.week.findFirst({
      where: { startDate: { gt: startDate }, state: { in: ['planning', 'in-progress'] } },
      orderBy: { startDate: 'asc' },
      include: {
        tasks: { orderBy: taskOrderBy, include: taskInclude },
        retrospective: true,
      },
    });
    if (nextWeek) week = nextWeek;
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

async function getMembers(): Promise<Member[]> {
  const users = await prisma.user.findMany({ select: { id: true, name: true, image: true } });
  return users.map((u) => ({ id: u.id, name: u.name ?? 'Unknown', image: u.image }));
}

export default async function WeekPage() {
  await auth();
  const [{ week, prevNotes }, members] = await Promise.all([getCurrentWeek(), getMembers()]);
  return <WeekView week={week} prevNotes={prevNotes} members={members} />;
}

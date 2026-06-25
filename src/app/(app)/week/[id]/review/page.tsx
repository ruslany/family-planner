import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ReviewView } from './ReviewView';
import type { WeekWithTasks } from '@/lib/types';

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  await auth();
  const { id } = await params;

  const taskInclude = {
    assigneeUser: { select: { id: true, name: true, image: true } },
    assigneeMember: { select: { id: true, name: true, color: true } },
    project: { select: { id: true, title: true } },
  } as const;

  const week = await prisma.week.findUnique({
    where: { id },
    include: {
      tasks: {
        orderBy: [{ dayOfWeek: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: taskInclude,
      },
      retrospective: true,
    },
  });

  if (!week || week.state === 'archived' || week.state === 'planning') {
    redirect('/week');
  }

  return <ReviewView week={week as WeekWithTasks} />;
}

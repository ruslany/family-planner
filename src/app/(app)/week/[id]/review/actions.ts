'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getNextWeekRange } from '@/lib/week-utils';

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  return session;
}

interface RetroData {
  wentWell: string;
  didntGoWell: string;
  notesForNext: string;
  moodEmoji: string;
}

export async function completeWeekAndCreateNext(weekId: string, retroData: RetroData) {
  await requireAuth();

  const week = await prisma.week.findUnique({ where: { id: weekId } });
  if (!week) throw new Error('Week not found');

  await prisma.retrospective.upsert({
    where: { weekId },
    create: {
      weekId,
      wentWell: retroData.wentWell || null,
      didntGoWell: retroData.didntGoWell || null,
      notesForNext: retroData.notesForNext || null,
      moodEmoji: retroData.moodEmoji || null,
    },
    update: {
      wentWell: retroData.wentWell || null,
      didntGoWell: retroData.didntGoWell || null,
      notesForNext: retroData.notesForNext || null,
      moodEmoji: retroData.moodEmoji || null,
    },
  });

  await prisma.week.update({ where: { id: weekId }, data: { state: 'archived' } });

  const { startDate: nextStart, endDate: nextEnd } = getNextWeekRange(week.startDate);

  const existing = await prisma.week.findFirst({ where: { startDate: nextStart } });
  if (!existing) {
    await prisma.week.create({ data: { startDate: nextStart, endDate: nextEnd, state: 'planning' } });
  }

  revalidatePath('/week');
}

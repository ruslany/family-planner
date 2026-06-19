import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const VALID_TRANSITIONS: Record<string, string[]> = {
  planning: ['in-progress'],
  'in-progress': ['review'],
  review: ['archived'],
};

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { state } = body as { state?: string };

  if (!state) return NextResponse.json({ error: 'state is required' }, { status: 400 });

  const week = await prisma.week.findUnique({ where: { id } });
  if (!week) return NextResponse.json({ error: 'Week not found' }, { status: 404 });

  const allowed = VALID_TRANSITIONS[week.state] ?? [];
  if (!allowed.includes(state)) {
    return NextResponse.json(
      { error: `Cannot transition from ${week.state} to ${state}` },
      { status: 422 },
    );
  }

  const updated = await prisma.week.update({ where: { id }, data: { state } });
  return NextResponse.json(updated);
}

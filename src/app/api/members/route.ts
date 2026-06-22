import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Member } from '@/lib/types';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await prisma.user.findMany({ select: { id: true, name: true, image: true } });

  const members: Member[] = users.map((u) => ({
    id: u.id,
    name: u.name ?? 'Unknown',
    image: u.image,
  }));

  return NextResponse.json(members);
}

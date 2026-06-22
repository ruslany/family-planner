'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  if (!session.user.isAdmin) throw new Error('Forbidden');
  return session;
}

export async function addAllowedEmail(email: string) {
  await requireAdmin();
  if (!email.trim()) throw new Error('email is required');
  try {
    await prisma.allowedEmail.create({ data: { email: email.trim().toLowerCase() } });
  } catch {
    throw new Error('Email already on allowlist');
  }
  revalidatePath('/settings');
}

export async function removeAllowedEmail(id: string) {
  await requireAdmin();
  await prisma.allowedEmail.delete({ where: { id } });
  revalidatePath('/settings');
}

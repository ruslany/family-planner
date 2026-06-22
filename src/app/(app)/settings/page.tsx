import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { AllowlistSection } from './SettingsClient';
import { SignOutButton } from './SignOutButton';

function initials(name: string | null | undefined) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const { user } = session;

  const allowlist = user.isAdmin
    ? await prisma.allowedEmail.findMany({ orderBy: { createdAt: 'asc' } })
    : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <div className="mt-6 flex flex-col gap-8">
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Account</h2>
          <div className="flex items-center gap-4 rounded-xl border border-border px-4 py-4">
            <Avatar size="lg">
              <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'User'} />
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.name}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              {user.isAdmin && (
                <p className="mt-0.5 text-xs text-primary font-medium">Admin</p>
              )}
            </div>
            <SignOutButton />
          </div>
        </section>

        {user.isAdmin && (
          <>
            <Separator />
            <AllowlistSection entries={allowlist} />
          </>
        )}
      </div>
    </div>
  );
}

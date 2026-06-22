'use client';

import { useState, useTransition } from 'react';
import { Trash2Icon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addAllowedEmail, removeAllowedEmail } from './actions';

interface AllowedEmail {
  id: string;
  email: string;
}

export function AllowlistSection({ entries }: { entries: AllowedEmail[] }) {
  const [email, setEmail] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    startTransition(async () => {
      try {
        await addAllowedEmail(email);
        setEmail('');
        toast.success(`${email} added to allowlist`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to add email');
      }
    });
  }

  function handleRemove(id: string, entryEmail: string) {
    startTransition(async () => {
      try {
        await removeAllowedEmail(id);
        toast.success(`${entryEmail} removed`);
      } catch {
        toast.error('Failed to remove email');
      }
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Access Allowlist</h2>
        <p className="text-sm text-muted-foreground">
          Only Google accounts with these email addresses can sign in.
        </p>
      </div>

      {entries.length > 0 && (
        <ul className="flex flex-col gap-1">
          {entries.map((e) => (
            <li
              key={e.id}
              className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
            >
              <span className="flex-1 truncate font-mono text-sm">{e.email}</span>
              <button
                onClick={() => handleRemove(e.id, e.email)}
                disabled={isPending}
                aria-label={`Remove ${e.email}`}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Trash2Icon className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="someone@gmail.com"
          className="flex-1"
          required
        />
        <Button type="submit" disabled={!email.trim() || isPending}>
          <PlusIcon className="size-4" />
          Add
        </Button>
      </form>

      <p className="text-xs text-muted-foreground">
        Removing an email prevents future sign-ins but does not delete existing data.
      </p>
    </section>
  );
}

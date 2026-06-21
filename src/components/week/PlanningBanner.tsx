'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { startWeek } from '@/app/(app)/week/actions';

interface PlanningBannerProps {
  weekId: string;
}

export function PlanningBanner({ weekId }: PlanningBannerProps) {
  const [isPending, startTransition] = useTransition();

  function handleStart() {
    startTransition(async () => {
      try {
        await startWeek(weekId);
        toast.success('Week started — good luck!');
      } catch {
        toast.error('Failed to start week');
      }
    });
  }

  return (
    <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-4">
      <p className="font-semibold text-primary">Plan your week</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Add your tasks for the week, then tap &ldquo;Start the Week&rdquo; when you&rsquo;re ready.
      </p>
      <Button className="mt-3" size="sm" onClick={handleStart} disabled={isPending}>
        Start the Week
      </Button>
    </div>
  );
}

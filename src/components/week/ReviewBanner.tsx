'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { beginReview } from '@/app/(app)/week/actions';

interface ReviewBannerProps {
  weekId: string;
  doneTasks: number;
  totalTasks: number;
  alreadyInReview: boolean;
}

export function ReviewBanner({
  weekId,
  doneTasks,
  totalTasks,
  alreadyInReview,
}: ReviewBannerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleReview() {
    startTransition(async () => {
      try {
        if (!alreadyInReview) {
          await beginReview(weekId);
        }
        router.push(`/week/${weekId}/review`);
      } catch {
        toast.error('Something went wrong');
      }
    });
  }

  return (
    <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-4">
      <p className="font-semibold text-amber-700 dark:text-amber-400">The week is over</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {totalTasks === 0
          ? 'Time to reflect on the week.'
          : `${doneTasks} of ${totalTasks} tasks completed. Time to reflect!`}
      </p>
      <Button
        className="mt-3"
        size="sm"
        variant="outline"
        onClick={handleReview}
        disabled={isPending}
      >
        Review This Week
      </Button>
    </div>
  );
}

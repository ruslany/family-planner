'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button, buttonVariants } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { formatWeekLabel } from '@/lib/week-utils';
import { completeWeekAndCreateNext } from './actions';
import type { WeekWithTasks } from '@/lib/types';

const MOODS = ['😩', '😐', '🙂', '🎉'] as const;

interface ReviewViewProps {
  week: WeekWithTasks;
}

export function ReviewView({ week }: ReviewViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [wentWell, setWentWell] = useState(week.retrospective?.wentWell ?? '');
  const [didntGoWell, setDidntGoWell] = useState(week.retrospective?.didntGoWell ?? '');
  const [notesForNext, setNotesForNext] = useState(week.retrospective?.notesForNext ?? '');
  const [moodEmoji, setMoodEmoji] = useState(week.retrospective?.moodEmoji ?? '');

  const doneTasks = week.tasks.filter((t) => t.status === 'done');
  const skippedTasks = week.tasks.filter((t) => t.status === 'skipped');
  const totalTasks = week.tasks.length;

  function handleComplete() {
    startTransition(async () => {
      try {
        await completeWeekAndCreateNext(week.id, {
          wentWell,
          didntGoWell,
          notesForNext,
          moodEmoji,
        });
        toast.success('Week completed!');
        router.push('/week');
      } catch {
        toast.error('Failed to complete week');
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link
        href="/week"
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2 mb-4 gap-1.5')}
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>

      <div className="mb-6">
        <p className="text-sm font-medium text-muted-foreground">Week Review</p>
        <h1 className="mt-1 text-2xl font-bold">
          {formatWeekLabel(new Date(week.startDate), new Date(week.endDate))}
        </h1>
      </div>

      {/* Summary */}
      <div className="mb-6 rounded-xl border bg-muted/30 px-4 py-4">
        <p className="text-sm font-medium text-muted-foreground">Summary</p>
        <p className="mt-1 text-3xl font-bold">
          {doneTasks.length}
          <span className="text-xl font-normal text-muted-foreground"> / {totalTasks} done</span>
        </p>
        {skippedTasks.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Skipped ({skippedTasks.length})
            </p>
            <ul className="mt-1 space-y-0.5">
              {skippedTasks.map((t) => (
                <li key={t.id} className="text-sm text-muted-foreground">
                  — {t.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Retro form */}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="went-well">What went well?</Label>
          <Textarea
            id="went-well"
            value={wentWell}
            onChange={(e) => setWentWell(e.target.value)}
            placeholder="Celebrate the wins, big and small…"
            rows={3}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="didnt-go-well">What didn&apos;t go well?</Label>
          <Textarea
            id="didnt-go-well"
            value={didntGoWell}
            onChange={(e) => setDidntGoWell(e.target.value)}
            placeholder="What was skipped or harder than expected?"
            rows={3}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notes-for-next">Notes for next week</Label>
          <Textarea
            id="notes-for-next"
            value={notesForNext}
            onChange={(e) => setNotesForNext(e.target.value)}
            placeholder="What should the family keep in mind next week?"
            rows={3}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Overall feeling</Label>
          <div className="flex gap-2">
            {MOODS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setMoodEmoji(moodEmoji === emoji ? '' : emoji)}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl border text-2xl transition-colors',
                  moodEmoji === emoji
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-background hover:bg-muted',
                )}
                aria-label={`Mood: ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <Button className="mt-2 w-full" size="lg" onClick={handleComplete} disabled={isPending}>
          {isPending ? 'Completing…' : 'Complete Week'}
        </Button>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { WeekHeader } from '@/components/week/WeekHeader';
import { DaySection } from '@/components/week/DaySection';
import { TaskSheet } from '@/components/week/TaskSheet';
import { PlanningBanner } from '@/components/week/PlanningBanner';
import { ReviewBanner } from '@/components/week/ReviewBanner';
import { Button } from '@/components/ui/button';
import { getDayFullLabel, getCurrentDayOfWeek } from '@/lib/week-utils';
import type { WeekWithTasks } from '@/lib/types';

const ORDERED_DAYS = [1, 2, 3, 4, 5, 6, 7] as const;

interface WeekViewProps {
  week: WeekWithTasks;
  prevNotes: string | null;
}

export function WeekView({ week, prevNotes }: WeekViewProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  // optimisticStatuses overrides task.status for instant UI feedback
  const [optimisticStatuses, setOptimisticStatuses] = useState<Record<string, string>>({});
  // optimisticDeleted tracks ids removed before server confirms
  const [optimisticDeleted, setOptimisticDeleted] = useState<Set<string>>(new Set());

  const todayDow = getCurrentDayOfWeek();
  const isTodayInWeek = now >= new Date(week.startDate) && now <= new Date(week.endDate);
  // Also treat Sunday (local time) as week-over so the review banner appears all day Sunday,
  // not just after midnight UTC (which is 5 PM PDT — same moment next week starts).
  // Guard with startDate check so a future week shown early doesn't falsely appear over.
  const now = new Date();
  const isWeekOver =
    now > new Date(week.endDate) ||
    (now.getDay() === 0 && now >= new Date(week.startDate));

  const visibleTasks = week.tasks.filter((t) => !optimisticDeleted.has(t.id));

  function handleOptimisticToggle(id: string, currentStatus: string) {
    const next = currentStatus === 'done' ? 'todo' : 'done';
    setOptimisticStatuses((prev) => ({ ...prev, [id]: next }));
  }

  function handleOptimisticDelete(id: string) {
    setOptimisticDeleted((prev) => new Set([...prev, id]));
  }

  const tasksByDay = Object.fromEntries(
    ORDERED_DAYS.map((d) => [d, visibleTasks.filter((t) => t.dayOfWeek === d)]),
  );
  const unscheduled = visibleTasks.filter((t) => t.dayOfWeek === null);

  const doneTasks = visibleTasks.filter(
    (t) => (optimisticStatuses[t.id] ?? t.status) === 'done',
  ).length;

  const hasTasks = visibleTasks.length > 0;

  const showPlanningBanner = week.state === 'planning';
  const showReviewBanner =
    week.state === 'review' || (week.state === 'in-progress' && isWeekOver);

  return (
    <div className="relative mx-auto max-w-2xl px-4 py-6">
      <WeekHeader
        startDate={new Date(week.startDate)}
        endDate={new Date(week.endDate)}
        totalTasks={visibleTasks.length}
        doneTasks={doneTasks}
        onAddTask={() => setSheetOpen(true)}
        reviewHref={
          week.state === 'in-progress' || week.state === 'review'
            ? `/week/${week.id}/review`
            : undefined
        }
      />

      {prevNotes && showPlanningBanner && (
        <div className="mb-4 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400">
            Notes from last week
          </p>
          <p className="mt-1 text-sm text-foreground">{prevNotes}</p>
        </div>
      )}

      {showPlanningBanner && <PlanningBanner weekId={week.id} />}

      {showReviewBanner && (
        <ReviewBanner
          weekId={week.id}
          doneTasks={doneTasks}
          totalTasks={visibleTasks.length}
          alreadyInReview={week.state === 'review'}
        />
      )}

      {!hasTasks && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-2xl">📋</p>
          <p className="font-medium">No tasks yet</p>
          <p className="text-sm text-muted-foreground">
            Tap the button below to add your first task for the week.
          </p>
          <Button onClick={() => setSheetOpen(true)} className="mt-2">
            <PlusIcon className="size-4" />
            Add a task
          </Button>
        </div>
      )}

      {hasTasks && (
        <div className="flex flex-col gap-1">
          {unscheduled.length > 0 && (
            <DaySection
              label="Unscheduled"
              tasks={unscheduled}
              optimisticStatuses={optimisticStatuses}
              onOptimisticToggle={handleOptimisticToggle}
              onOptimisticDelete={handleOptimisticDelete}
            />
          )}
          {ORDERED_DAYS.map((dow) => (
            <DaySection
              key={dow}
              label={getDayFullLabel(dow)}
              tasks={tasksByDay[dow] ?? []}
              isToday={isTodayInWeek && dow === todayDow}
              optimisticStatuses={optimisticStatuses}
              onOptimisticToggle={handleOptimisticToggle}
              onOptimisticDelete={handleOptimisticDelete}
            />
          ))}
        </div>
      )}

      {/* FAB — mobile only; desktop uses the header button */}
      {hasTasks && (
        <div className="fixed bottom-20 right-4 md:hidden">
          <Button
            onClick={() => setSheetOpen(true)}
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg"
            aria-label="Add task"
          >
            <PlusIcon className="size-5" />
          </Button>
        </div>
      )}

      <TaskSheet weekId={week.id} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}

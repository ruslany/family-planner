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
import type { WeekWithTasks, Member, TaskWithRelations } from '@/lib/types';

const ORDERED_DAYS = [1, 2, 3, 4, 5, 6, 7] as const;

interface WeekViewProps {
  week: WeekWithTasks;
  prevNotes: string | null;
  members: Member[];
}

export function WeekView({ week, prevNotes, members }: WeekViewProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null);
  // optimisticStatuses overrides task.status for instant UI feedback
  const [optimisticStatuses, setOptimisticStatuses] = useState<Record<string, string>>({});
  // optimisticDeleted tracks ids removed before server confirms
  const [optimisticDeleted, setOptimisticDeleted] = useState<Set<string>>(new Set());

  const todayDow = getCurrentDayOfWeek();
  // Also treat Sunday (UTC) as week-over so the review banner appears all day Sunday.
  // Must use getUTCDay() — getDay() uses local time, and since weekStart is UTC midnight,
  // a local Sunday afternoon would falsely satisfy now >= weekStart for the *next* week.
  const now = new Date();
  const weekStart = new Date(week.startDate);
  const weekEnd = new Date(week.endDate);
  const isTodayInWeek = now >= weekStart && now <= weekEnd;
  const isWeekOver = now > weekEnd || (now.getUTCDay() === 0 && now >= weekStart);

  const visibleTasks = week.tasks.filter((t) => !optimisticDeleted.has(t.id));

  function handleOptimisticToggle(id: string, currentStatus: string) {
    const next = currentStatus === 'done' ? 'todo' : 'done';
    setOptimisticStatuses((prev) => ({ ...prev, [id]: next }));
  }

  function handleOptimisticDelete(id: string) {
    setOptimisticDeleted((prev) => new Set([...prev, id]));
  }

  function handleEdit(task: TaskWithRelations) {
    setEditingTask(task);
  }

  function handleSheetClose(open: boolean) {
    if (!open) {
      setCreateOpen(false);
      setEditingTask(null);
    }
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
  const showReviewBanner = week.state === 'review' || (week.state === 'in-progress' && isWeekOver);

  const sheetOpen = createOpen || editingTask !== null;

  return (
    <div className="relative mx-auto max-w-2xl px-4 py-6">
      <WeekHeader
        startDate={new Date(week.startDate)}
        endDate={new Date(week.endDate)}
        totalTasks={visibleTasks.length}
        doneTasks={doneTasks}
        onAddTask={() => setCreateOpen(true)}
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
          <Button onClick={() => setCreateOpen(true)} className="mt-2">
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
              onEdit={handleEdit}
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
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* FAB — mobile only; desktop uses the header button */}
      {hasTasks && (
        <div className="fixed bottom-20 right-4 md:hidden">
          <Button
            onClick={() => setCreateOpen(true)}
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg"
            aria-label="Add task"
          >
            <PlusIcon className="size-5" />
          </Button>
        </div>
      )}

      <TaskSheet
        weekId={week.id}
        open={sheetOpen}
        onOpenChange={handleSheetClose}
        members={members}
        task={editingTask}
      />
    </div>
  );
}

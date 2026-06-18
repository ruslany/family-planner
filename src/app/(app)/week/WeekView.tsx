'use client';

import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { WeekHeader } from '@/components/week/WeekHeader';
import { DaySection } from '@/components/week/DaySection';
import { TaskSheet } from '@/components/week/TaskSheet';
import { Button } from '@/components/ui/button';
import { getDayFullLabel, getCurrentDayOfWeek } from '@/lib/week-utils';
import type { WeekWithTasks } from '@/lib/types';

const ORDERED_DAYS = [1, 2, 3, 4, 5, 6, 7] as const;

interface WeekViewProps {
  week: WeekWithTasks;
}

export function WeekView({ week }: WeekViewProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  // optimisticStatuses overrides task.status for instant UI feedback
  const [optimisticStatuses, setOptimisticStatuses] = useState<Record<string, string>>({});
  // optimisticDeleted tracks ids removed before server confirms
  const [optimisticDeleted, setOptimisticDeleted] = useState<Set<string>>(new Set());

  const todayDow = getCurrentDayOfWeek();

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

  return (
    <div className="relative mx-auto max-w-2xl px-4 py-6">
      <WeekHeader
        startDate={new Date(week.startDate)}
        endDate={new Date(week.endDate)}
        totalTasks={visibleTasks.length}
        doneTasks={doneTasks}
      />

      {!hasTasks && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-2xl">📋</p>
          <p className="font-medium">No tasks yet</p>
          <p className="text-sm text-muted-foreground">Tap the button below to add your first task for the week.</p>
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
              isToday={dow === todayDow}
              optimisticStatuses={optimisticStatuses}
              onOptimisticToggle={handleOptimisticToggle}
              onOptimisticDelete={handleOptimisticDelete}
            />
          ))}
        </div>
      )}

      {/* FAB — always visible, shown below content */}
      {hasTasks && (
        <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8">
          <Button
            onClick={() => setSheetOpen(true)}
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg md:h-auto md:w-auto md:rounded-lg md:px-4"
            aria-label="Add task"
          >
            <PlusIcon className="size-5 md:size-4" />
            <span className="sr-only md:not-sr-only md:ml-1">Add Task</span>
          </Button>
        </div>
      )}

      <TaskSheet weekId={week.id} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}

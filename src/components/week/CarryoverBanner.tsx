'use client';

import { useState, useTransition } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { MemberAvatar } from './MemberAvatar';
import { carryForwardTask, carryForwardAllTasks } from '@/app/(app)/week/actions';
import type { TaskWithRelations } from '@/lib/types';

interface CarryoverBannerProps {
  weekId: string;
  tasks: TaskWithRelations[];
}

export function CarryoverBanner({ weekId, tasks: initialTasks }: CarryoverBannerProps) {
  const [remaining, setRemaining] = useState<TaskWithRelations[]>(initialTasks);
  const [isPending, startTransition] = useTransition();

  if (remaining.length === 0) return null;

  function dismiss(taskId: string) {
    setRemaining((prev) => prev.filter((t) => t.id !== taskId));
  }

  function handleCarryOne(task: TaskWithRelations) {
    setRemaining((prev) => prev.filter((t) => t.id !== task.id));
    startTransition(async () => {
      try {
        await carryForwardTask(task.id, weekId);
        toast.success(`"${task.title}" added to this week`);
      } catch {
        toast.error('Failed to carry task forward');
      }
    });
  }

  function handleCarryAll() {
    const taskIds = remaining.map((t) => t.id);
    setRemaining([]);
    startTransition(async () => {
      try {
        await carryForwardAllTasks(taskIds, weekId);
        toast.success(`${taskIds.length} tasks added to this week`);
      } catch {
        toast.error('Failed to carry tasks forward');
      }
    });
  }

  return (
    <div className="mb-4 rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-4">
      <p className="font-semibold text-orange-700 dark:text-orange-400">
        {remaining.length} unfinished {remaining.length === 1 ? 'task' : 'tasks'} from last week
      </p>
      <ul className="mt-3 space-y-2">
        {remaining.map((task) => {
          const assignee = task.assigneeUser
            ? { name: task.assigneeUser.name ?? 'Unknown', image: task.assigneeUser.image }
            : task.assigneeMember
              ? { name: task.assigneeMember.name, image: null }
              : null;

          return (
            <li key={task.id} className="flex items-center gap-2">
              <span className="flex-1 text-sm">{task.title}</span>
              {assignee && <MemberAvatar member={assignee} size="sm" />}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCarryOne(task)}
                disabled={isPending}
                className="h-7 px-2 text-xs"
              >
                Add
              </Button>
              <button
                onClick={() => dismiss(task.id)}
                aria-label={`Dismiss "${task.title}"`}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </li>
          );
        })}
      </ul>
      {remaining.length > 1 && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleCarryAll}
          disabled={isPending}
          className="mt-3"
        >
          Add all to this week
        </Button>
      )}
    </div>
  );
}

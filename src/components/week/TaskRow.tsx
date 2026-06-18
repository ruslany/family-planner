'use client';

import { useTransition } from 'react';
import { Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { toggleTaskStatus, deleteTask } from '@/app/(app)/week/actions';
import type { TaskWithRelations } from '@/lib/types';

interface TaskRowProps {
  task: TaskWithRelations;
  optimisticStatus: string;
  onOptimisticToggle: (id: string, currentStatus: string) => void;
  onOptimisticDelete: (id: string) => void;
}

export function TaskRow({ task, optimisticStatus, onOptimisticToggle, onOptimisticDelete }: TaskRowProps) {
  const [isPending, startTransition] = useTransition();
  const isDone = optimisticStatus === 'done';
  const isSkipped = optimisticStatus === 'skipped';

  function handleToggle() {
    onOptimisticToggle(task.id, optimisticStatus);
    startTransition(async () => {
      try {
        await toggleTaskStatus(task.id, optimisticStatus);
      } catch {
        toast.error('Failed to update task');
      }
    });
  }

  function handleDelete() {
    onOptimisticDelete(task.id);
    startTransition(async () => {
      try {
        await deleteTask(task.id);
      } catch {
        toast.error('Failed to delete task');
      }
    });
  }

  return (
    <div
      className={cn(
        'group flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50',
        isPending && 'opacity-60',
      )}
    >
      <Checkbox
        checked={isDone}
        onCheckedChange={handleToggle}
        aria-label={`Mark "${task.title}" as ${isDone ? 'todo' : 'done'}`}
        className="mt-px shrink-0"
      />
      <span
        className={cn(
          'flex-1 text-sm leading-snug',
          (isDone || isSkipped) && 'text-muted-foreground line-through',
        )}
      >
        {task.title}
        {task.description && (
          <span className="ml-1 text-xs text-muted-foreground/70 no-underline" style={{ textDecoration: 'none' }}>
            — {task.description}
          </span>
        )}
      </span>
      <button
        onClick={handleDelete}
        aria-label={`Delete "${task.title}"`}
        className="shrink-0 rounded-md p-1 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground hover:text-destructive focus-visible:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Trash2Icon className="size-3.5" />
      </button>
    </div>
  );
}

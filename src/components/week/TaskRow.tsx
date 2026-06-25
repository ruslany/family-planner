'use client';

import { useTransition } from 'react';
import { Trash2Icon } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { MemberAvatar } from './MemberAvatar';
import { cn } from '@/lib/utils';
import { toggleTaskStatus, deleteTask } from '@/app/(app)/week/actions';
import type { TaskWithRelations } from '@/lib/types';

interface TaskRowProps {
  task: TaskWithRelations;
  optimisticStatus: string;
  onOptimisticToggle: (id: string, currentStatus: string) => void;
  onOptimisticDelete: (id: string) => void;
  onEdit: (task: TaskWithRelations) => void;
}

export function TaskRow({
  task,
  optimisticStatus,
  onOptimisticToggle,
  onOptimisticDelete,
  onEdit,
}: TaskRowProps) {
  const [isPending, startTransition] = useTransition();
  const isDone = optimisticStatus === 'done';
  const isSkipped = optimisticStatus === 'skipped';

  const assignee = task.assigneeUser
    ? { name: task.assigneeUser.name ?? 'Unknown', image: task.assigneeUser.image }
    : task.assigneeMember
      ? { name: task.assigneeMember.name, image: null }
      : null;

  function handleToggle() {
    const nextStatus = optimisticStatus === 'done' ? 'todo' : 'done';
    onOptimisticToggle(task.id, optimisticStatus);
    startTransition(async () => {
      try {
        await toggleTaskStatus(task.id, optimisticStatus);
        if (nextStatus === 'done') toast.success('Task completed');
        else toast.info('Task marked as to-do');
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
        toast.success('Task deleted');
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
      <button
        type="button"
        onClick={() => onEdit(task)}
        className={cn(
          'flex min-w-0 flex-1 flex-col text-left',
          (isDone || isSkipped) && 'text-muted-foreground',
        )}
      >
        <span className="flex flex-wrap items-baseline gap-x-1.5">
          <span className={cn('text-sm leading-snug', (isDone || isSkipped) && 'line-through')}>
            {task.title}
          </span>
          {task.project && (
            <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary leading-none">
              {task.project.title}
            </span>
          )}
        </span>
        {task.description && (
          <span className="text-xs text-muted-foreground/70">{task.description}</span>
        )}
      </button>
      {assignee && <MemberAvatar member={assignee} size="sm" />}
      <button
        onClick={handleDelete}
        aria-label={`Delete "${task.title}"`}
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-muted-foreground/0 md:group-hover:text-muted-foreground md:focus-visible:text-muted-foreground"
      >
        <Trash2Icon className="size-3.5" />
      </button>
    </div>
  );
}

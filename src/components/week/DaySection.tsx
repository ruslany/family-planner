import { cn } from '@/lib/utils';
import { TaskRow } from './TaskRow';
import type { TaskWithRelations } from '@/lib/types';

interface DaySectionProps {
  label: string;
  tasks: TaskWithRelations[];
  isToday?: boolean;
  optimisticStatuses: Record<string, string>;
  onOptimisticToggle: (id: string, currentStatus: string) => void;
  onOptimisticDelete: (id: string) => void;
  onEdit: (task: TaskWithRelations) => void;
}

export function DaySection({
  label,
  tasks,
  isToday,
  optimisticStatuses,
  onOptimisticToggle,
  onOptimisticDelete,
  onEdit,
}: DaySectionProps) {
  return (
    <section className="mb-4">
      <div className={cn('mb-1 flex items-center gap-2 px-3 py-1')}>
        <span
          className={cn(
            'text-xs font-semibold uppercase tracking-wider',
            isToday ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          {label}
        </span>
        {isToday && (
          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium leading-none text-primary-foreground">
            Today
          </span>
        )}
      </div>
      {tasks.length === 0 ? (
        <p className="px-3 py-2 text-sm text-muted-foreground/60 italic">No tasks</p>
      ) : (
        <div className="flex flex-col">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              optimisticStatus={optimisticStatuses[task.id] ?? task.status}
              onOptimisticToggle={onOptimisticToggle}
              onOptimisticDelete={onOptimisticDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </section>
  );
}

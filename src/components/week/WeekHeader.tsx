import { formatWeekLabel } from '@/lib/week-utils';

interface WeekHeaderProps {
  startDate: Date;
  endDate: Date;
  totalTasks: number;
  doneTasks: number;
}

export function WeekHeader({ startDate, endDate, totalTasks, doneTasks }: WeekHeaderProps) {
  const label = formatWeekLabel(startDate, endDate);
  const percent = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{label}</h1>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
          {doneTasks}/{totalTasks}
        </span>
      </div>
    </div>
  );
}

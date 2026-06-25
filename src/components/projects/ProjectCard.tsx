'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  CalendarPlusIcon,
  Trash2Icon,
  PencilIcon,
  MoreHorizontalIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MemberAvatar } from '@/components/week/MemberAvatar';
import { BacklogTaskSheet } from './BacklogTaskSheet';
import { ProjectSheet } from './ProjectSheet';
import { cn } from '@/lib/utils';
import { scheduleBacklogTask } from '@/app/(app)/week/actions';
import { deleteProject, deleteBacklogTask } from '@/app/(app)/projects/actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: string;
  weekId: string | null;
  dayOfWeek: number | null;
  assigneeUser: { id: string; name: string | null; image: string | null } | null;
  assigneeMember: { id: string; name: string; color: string } | null;
  week: { id: string; startDate: Date; endDate: Date } | null;
}

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    tasks: TaskRow[];
  };
  currentWeekId: string;
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  'on-hold': 'On Hold',
  completed: 'Completed',
  dropped: 'Dropped',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/10 text-green-700 dark:text-green-400',
  'on-hold': 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  completed: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  dropped: 'bg-muted text-muted-foreground',
};

function formatWeekRange(startDate: Date, endDate: Date) {
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(new Date(startDate))} – ${fmt(new Date(endDate))}`;
}

export function ProjectCard({ project, currentWeekId }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const backlogTasks = project.tasks.filter((t) => t.weekId === null);
  const scheduledTasks = project.tasks.filter((t) => t.weekId !== null);

  // Group scheduled tasks by week
  const byWeek = new Map<string, { week: NonNullable<TaskRow['week']>; tasks: TaskRow[] }>();
  for (const t of scheduledTasks) {
    if (!t.week) continue;
    const key = t.weekId!;
    if (!byWeek.has(key)) byWeek.set(key, { week: t.week, tasks: [] });
    byWeek.get(key)!.tasks.push(t);
  }
  const weekGroups = [...byWeek.values()].sort(
    (a, b) => new Date(b.week.startDate).getTime() - new Date(a.week.startDate).getTime(),
  );

  function handleSchedule(taskId: string) {
    startTransition(async () => {
      try {
        await scheduleBacklogTask(taskId, currentWeekId);
        toast.success('Task scheduled for this week');
      } catch {
        toast.error('Failed to schedule task');
      }
    });
  }

  function handleDeleteTask(taskId: string) {
    startTransition(async () => {
      try {
        await deleteBacklogTask(taskId);
        toast.success('Task deleted');
      } catch {
        toast.error('Failed to delete task');
      }
    });
  }

  function handleDeleteProject() {
    startTransition(async () => {
      try {
        await deleteProject(project.id);
        toast.success('Project removed');
      } catch {
        toast.error('Failed to remove project');
      }
    });
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-card">
        {/* Card header — div instead of button to avoid nesting buttons inside (dropdown trigger is a button) */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setExpanded((e) => !e)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setExpanded((prev) => !prev);
            }
          }}
          className="flex w-full cursor-pointer items-start gap-3 px-4 py-4 text-left"
        >
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold leading-tight">{project.title}</span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium',
                  STATUS_COLORS[project.status] ?? STATUS_COLORS.active,
                )}
              >
                {STATUS_LABELS[project.status] ?? project.status}
              </span>
            </div>
            {project.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            )}
            <p className="mt-1.5 text-xs text-muted-foreground">
              {backlogTasks.length} in backlog · {scheduledTasks.length} scheduled
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger
                onClick={(e) => e.stopPropagation()}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Project options"
              >
                <MoreHorizontalIcon className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditOpen(true);
                    }}
                  >
                    <PencilIcon className="mr-2 size-3.5" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject();
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2Icon className="mr-2 size-3.5" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            {expanded ? (
              <ChevronUpIcon className="size-4 text-muted-foreground" />
            ) : (
              <ChevronDownIcon className="size-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="border-t border-border px-4 pb-4 pt-3">
            {/* Backlog section */}
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Backlog
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setAddTaskOpen(true)}
                  className="h-7 gap-1 px-2 text-xs"
                >
                  <PlusIcon className="size-3" />
                  Add task
                </Button>
              </div>

              {backlogTasks.length === 0 ? (
                <p className="py-3 text-center text-sm text-muted-foreground">
                  No backlog tasks. Add one to get started.
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  {backlogTasks.map((t) => {
                    const assignee = t.assigneeUser
                      ? { name: t.assigneeUser.name ?? 'Unknown', image: t.assigneeUser.image }
                      : t.assigneeMember
                        ? { name: t.assigneeMember.name, image: null }
                        : null;
                    return (
                      <div
                        key={t.id}
                        className="group flex min-h-10 items-center gap-2 rounded-lg px-2 py-2 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-snug">{t.title}</p>
                          {t.description && (
                            <p className="text-xs text-muted-foreground truncate">{t.description}</p>
                          )}
                        </div>
                        {assignee && <MemberAvatar member={assignee} size="sm" />}
                        <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleSchedule(t.id)}
                            aria-label="Schedule for this week"
                            title="Schedule for this week"
                            className="rounded-md p-1 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                          >
                            <CalendarPlusIcon className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleDeleteTask(t.id)}
                            aria-label="Delete task"
                            className="rounded-md p-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                          >
                            <Trash2Icon className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Scheduled / history section */}
            {weekGroups.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Scheduled
                </p>
                <div className="flex flex-col gap-3">
                  {weekGroups.map(({ week, tasks }) => (
                    <div key={week.id}>
                      <p className="mb-1 text-xs text-muted-foreground">
                        {formatWeekRange(week.startDate, week.endDate)}
                        {week.id === currentWeekId && (
                          <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                            this week
                          </span>
                        )}
                      </p>
                      <div className="flex flex-col gap-0.5">
                        {tasks.map((t) => (
                          <div key={t.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                            <span
                              className={cn(
                                'h-1.5 w-1.5 rounded-full shrink-0',
                                t.status === 'done'
                                  ? 'bg-green-500'
                                  : t.status === 'skipped'
                                    ? 'bg-muted-foreground'
                                    : 'bg-border',
                              )}
                            />
                            <span
                              className={cn(
                                'text-sm',
                                t.status === 'done' && 'text-muted-foreground line-through',
                                t.status === 'skipped' && 'text-muted-foreground line-through',
                              )}
                            >
                              {t.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <BacklogTaskSheet
        projectId={project.id}
        projectTitle={project.title}
        open={addTaskOpen}
        onOpenChange={setAddTaskOpen}
      />

      <ProjectSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        project={project}
      />
    </>
  );
}

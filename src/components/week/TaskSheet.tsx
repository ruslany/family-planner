'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  PlusIcon,
  ChevronDownIcon,
  XIcon,
  CheckIcon,
  FolderKanbanIcon,
  ArrowLeftIcon,
} from 'lucide-react';
import { Dialog, DialogCloseButton, DialogPopup, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MemberAvatar } from './MemberAvatar';
import { cn } from '@/lib/utils';
import { createTask, updateTask, scheduleBacklogTask } from '@/app/(app)/week/actions';
import type { Member, TaskWithRelations, ProjectSummary, BacklogTask } from '@/lib/types';

const DAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
];

interface BacklogProject {
  id: string;
  title: string;
  tasks: BacklogTask[];
}

interface TaskSheetProps {
  weekId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: Member[];
  projects: ProjectSummary[];
  backlogProjects: BacklogProject[];
  task?: TaskWithRelations | null;
}

type SheetMode = 'form' | 'backlog';

export function TaskSheet({
  weekId,
  open,
  onOpenChange,
  members,
  projects,
  backlogProjects,
  task,
}: TaskSheetProps) {
  const isEditing = !!task;

  const [mode, setMode] = useState<SheetMode>('form');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<number | null>(null);
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setMode('form');
      setTitle(task?.title ?? '');
      setDescription(task?.description ?? '');
      setDayOfWeek(task?.dayOfWeek ?? null);
      setAssigneeId(task?.assigneeUserId ?? null);
      setProjectId(task?.projectId ?? null);
    }
  }, [open, task]);

  const selectedMember = assigneeId ? (members.find((m) => m.id === assigneeId) ?? null) : null;
  const selectedProject = projectId ? (projects.find((p) => p.id === projectId) ?? null) : null;

  function handleClose() {
    onOpenChange(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    startTransition(async () => {
      try {
        if (isEditing) {
          await updateTask(task.id, {
            title,
            description,
            dayOfWeek,
            assigneeUserId: assigneeId,
            projectId,
          });
          toast.success('Task updated');
        } else {
          await createTask({
            weekId,
            title,
            description,
            dayOfWeek,
            assigneeUserId: assigneeId,
            projectId,
          });
          toast.success('Task added');
        }
        handleClose();
      } catch {
        toast.error(isEditing ? 'Failed to update task' : 'Failed to add task');
      }
    });
  }

  function handleScheduleBacklog(backlogTaskId: string) {
    startTransition(async () => {
      try {
        await scheduleBacklogTask(backlogTaskId, weekId);
        toast.success('Task added to this week');
        handleClose();
      } catch {
        toast.error('Failed to schedule task');
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
        else onOpenChange(true);
      }}
    >
      <DialogPopup>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted md:hidden" />

        {mode === 'form' ? (
          <>
            <div className="relative mb-5">
              <DialogTitle>{isEditing ? 'Edit Task' : 'Add Task'}</DialogTitle>
              <DialogCloseButton />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="task-title">Title</Label>
                <Input
                  id="task-title"
                  ref={titleRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to get done?"
                  autoFocus
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="task-description">
                  Description <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="task-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any notes or context…"
                  rows={2}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>
                  Day <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => setDayOfWeek(dayOfWeek === day.value ? null : day.value)}
                      className={cn(
                        'min-w-11 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                        dayOfWeek === day.value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-foreground hover:bg-muted',
                      )}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>
                  Assignee <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                {members.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No family members have signed in yet.
                  </p>
                ) : (
                  <DropdownMenu open={assigneeOpen} onOpenChange={setAssigneeOpen}>
                    <DropdownMenuTrigger className="flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {selectedMember ? (
                        <>
                          <MemberAvatar member={selectedMember} size="sm" />
                          <span className="flex-1 text-left">{selectedMember.name}</span>
                          <XIcon
                            className="size-3.5 text-muted-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAssigneeId(null);
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-left text-muted-foreground">Anyone</span>
                          <ChevronDownIcon className="size-3.5 text-muted-foreground" />
                        </>
                      )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuRadioGroup
                        value={assigneeId ?? ''}
                        onValueChange={(v) => {
                          setAssigneeId(v || null);
                          setAssigneeOpen(false);
                        }}
                      >
                        <DropdownMenuGroup>
                          <DropdownMenuRadioItem value="">
                            <span className="text-muted-foreground">Anyone</span>
                          </DropdownMenuRadioItem>
                          {members.map((m) => (
                            <DropdownMenuRadioItem key={m.id} value={m.id}>
                              <MemberAvatar member={m} size="sm" />
                              {m.name}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuGroup>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>
                  Project <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                {projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No projects yet.</p>
                ) : (
                  <DropdownMenu open={projectOpen} onOpenChange={setProjectOpen}>
                    <DropdownMenuTrigger className="flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {selectedProject ? (
                        <>
                          <FolderKanbanIcon className="size-3.5 text-muted-foreground shrink-0" />
                          <span className="flex-1 text-left">{selectedProject.title}</span>
                          <XIcon
                            className="size-3.5 text-muted-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              setProjectId(null);
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-left text-muted-foreground">No project</span>
                          <ChevronDownIcon className="size-3.5 text-muted-foreground" />
                        </>
                      )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuRadioGroup
                        value={projectId ?? ''}
                        onValueChange={(v) => {
                          setProjectId(v || null);
                          setProjectOpen(false);
                        }}
                      >
                        <DropdownMenuGroup>
                          <DropdownMenuRadioItem value="">
                            <span className="text-muted-foreground">No project</span>
                          </DropdownMenuRadioItem>
                          {projects.map((p) => (
                            <DropdownMenuRadioItem key={p.id} value={p.id}>
                              {p.title}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuGroup>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div className="mt-2 flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={!title.trim() || isPending}>
                  {isEditing ? (
                    <>
                      <CheckIcon className="size-4" />
                      Save
                    </>
                  ) : (
                    <>
                      <PlusIcon className="size-4" />
                      Add Task
                    </>
                  )}
                </Button>
              </div>

              {!isEditing && backlogProjects.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMode('backlog')}
                  className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <FolderKanbanIcon className="size-3.5" />
                  Pick from project backlog
                </button>
              )}
            </form>
          </>
        ) : (
          <>
            <div className="relative mb-5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode('form')}
                className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Back"
              >
                <ArrowLeftIcon className="size-4" />
              </button>
              <DialogTitle>Pick from Backlog</DialogTitle>
              <DialogCloseButton />
            </div>

            <div className="flex flex-col gap-4">
              {backlogProjects.map((proj) => (
                <div key={proj.id}>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {proj.title}
                  </p>
                  <div className="flex flex-col gap-1">
                    {proj.tasks.map((bt) => (
                      <button
                        key={bt.id}
                        type="button"
                        disabled={isPending}
                        onClick={() => handleScheduleBacklog(bt.id)}
                        className="flex items-start gap-3 rounded-lg border border-border px-3 py-2.5 text-left text-sm hover:bg-muted/50 transition-colors disabled:opacity-60"
                      >
                        <PlusIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{bt.title}</span>
                          {bt.description && (
                            <span className="block truncate text-xs text-muted-foreground">
                              {bt.description}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </DialogPopup>
    </Dialog>
  );
}

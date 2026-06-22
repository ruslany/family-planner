'use client';

import { useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { PlusIcon, ChevronDownIcon, XIcon } from 'lucide-react';
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
import { createTask } from '@/app/(app)/week/actions';
import type { Member } from '@/lib/types';

const DAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
];

interface TaskSheetProps {
  weekId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: Member[];
}

export function TaskSheet({ weekId, open, onOpenChange, members }: TaskSheetProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<number | null>(null);
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const titleRef = useRef<HTMLInputElement>(null);

  const selectedMember = assigneeId ? (members.find((m) => m.id === assigneeId) ?? null) : null;

  function reset() {
    setTitle('');
    setDescription('');
    setDayOfWeek(null);
    setAssigneeId(null);
  }

  function handleClose() {
    onOpenChange(false);
    reset();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    startTransition(async () => {
      try {
        await createTask({
          weekId,
          title,
          description,
          dayOfWeek,
          assigneeUserId: assigneeId,
        });
        handleClose();
        toast.success('Task added');
      } catch {
        toast.error('Failed to add task');
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
        <div className="relative mb-5">
          <DialogTitle>Add Task</DialogTitle>
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
              <p className="text-sm text-muted-foreground">No family members have signed in yet.</p>
            ) : (
              <DropdownMenu>
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
                    onValueChange={(v) => setAssigneeId(v || null)}
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

          <div className="flex flex-col gap-1.5 opacity-50">
            <Label>
              Goal / Project{' '}
              <span className="font-normal text-muted-foreground">(coming in Stage 5)</span>
            </Label>
            <div className="h-9 rounded-lg border border-dashed border-border bg-muted/30" />
          </div>

          <div className="mt-2 flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={!title.trim() || isPending}>
              <PlusIcon className="size-4" />
              Add Task
            </Button>
          </div>
        </form>
      </DialogPopup>
    </Dialog>
  );
}

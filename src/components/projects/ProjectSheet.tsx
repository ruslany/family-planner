'use client';

import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { PlusIcon, CheckIcon, ChevronDownIcon } from 'lucide-react';
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
import { createProject, updateProject } from '@/app/(app)/projects/actions';

const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
];

interface ProjectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: { id: string; title: string; description: string | null; status: string } | null;
}

export function ProjectSheet({ open, onOpenChange, project }: ProjectSheetProps) {
  const isEditing = !!project;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [statusOpen, setStatusOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setTitle(project?.title ?? '');
      setDescription(project?.description ?? '');
      setStatus(project?.status ?? 'active');
    }
  }, [open, project]);

  function handleClose() {
    onOpenChange(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    startTransition(async () => {
      try {
        if (isEditing) {
          await updateProject(project.id, { title, description, status });
          toast.success('Project updated');
        } else {
          await createProject({ title, description });
          toast.success('Project created');
        }
        handleClose();
      } catch {
        toast.error(isEditing ? 'Failed to update project' : 'Failed to create project');
      }
    });
  }

  const selectedStatus = STATUSES.find((s) => s.value === status);

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
          <DialogTitle>{isEditing ? 'Edit Project' : 'New Project'}</DialogTitle>
          <DialogCloseButton />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-title">Title</Label>
            <Input
              id="project-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project name"
              autoFocus
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project-description">
              Description <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={2}
            />
          </div>

          {isEditing && (
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <DropdownMenu open={statusOpen} onOpenChange={setStatusOpen}>
                <DropdownMenuTrigger className="flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="flex-1 text-left">{selectedStatus?.label ?? status}</span>
                  <ChevronDownIcon className="size-3.5 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuRadioGroup
                    value={status}
                    onValueChange={(v) => {
                      setStatus(v);
                      setStatusOpen(false);
                    }}
                  >
                    <DropdownMenuGroup>
                      {STATUSES.map((s) => (
                        <DropdownMenuRadioItem key={s.value} value={s.value}>
                          {s.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

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
                  Create
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogPopup>
    </Dialog>
  );
}

'use client';

import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { PlusIcon } from 'lucide-react';
import { Dialog, DialogCloseButton, DialogPopup, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createBacklogTask } from '@/app/(app)/projects/actions';

interface BacklogTaskSheetProps {
  projectId: string;
  projectTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BacklogTaskSheet({
  projectId,
  projectTitle,
  open,
  onOpenChange,
}: BacklogTaskSheetProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
    }
  }, [open]);

  function handleClose() {
    onOpenChange(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    startTransition(async () => {
      try {
        await createBacklogTask({ projectId, title, description });
        toast.success('Task added to backlog');
        handleClose();
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
        <div className="relative mb-1">
          <DialogTitle>Add to Backlog</DialogTitle>
          <DialogCloseButton />
        </div>
        <p className="mb-4 text-sm text-muted-foreground">{projectTitle}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="backlog-title">Title</Label>
            <Input
              id="backlog-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to get done?"
              autoFocus
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="backlog-description">
              Description <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="backlog-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any notes or context…"
              rows={2}
            />
          </div>

          <div className="mt-2 flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={!title.trim() || isPending}>
              <PlusIcon className="size-4" />
              Add to Backlog
            </Button>
          </div>
        </form>
      </DialogPopup>
    </Dialog>
  );
}

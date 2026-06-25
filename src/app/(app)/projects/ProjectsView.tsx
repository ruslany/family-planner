'use client';

import { useState } from 'react';
import { PlusIcon, FolderKanbanIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectSheet } from '@/components/projects/ProjectSheet';

interface Task {
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

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  tasks: Task[];
}

interface ProjectsViewProps {
  projects: Project[];
  currentWeekId: string;
}

export function ProjectsView({ projects, currentWeekId }: ProjectsViewProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [showDropped, setShowDropped] = useState(false);

  const activeProjects = projects.filter((p) => p.status !== 'dropped');
  const droppedProjects = projects.filter((p) => p.status === 'dropped');

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Plan long-running work and pull tasks into weekly planning.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <PlusIcon className="size-4" />
          New Project
        </Button>
      </div>

      {activeProjects.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <FolderKanbanIcon className="size-10 text-muted-foreground/40" />
          <p className="font-medium">No projects yet</p>
          <p className="text-sm text-muted-foreground">
            Create a project to organize longer-running work and build up a task backlog.
          </p>
          <Button onClick={() => setCreateOpen(true)} className="mt-2">
            <PlusIcon className="size-4" />
            New Project
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {activeProjects.map((p) => (
            <ProjectCard key={p.id} project={p} currentWeekId={currentWeekId} />
          ))}
        </div>
      )}

      {droppedProjects.length > 0 && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowDropped((s) => !s)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showDropped ? 'Hide' : 'Show'} {droppedProjects.length} dropped project
            {droppedProjects.length !== 1 ? 's' : ''}
          </button>
          {showDropped && (
            <div className="mt-3 flex flex-col gap-3 opacity-60">
              {droppedProjects.map((p) => (
                <ProjectCard key={p.id} project={p} currentWeekId={currentWeekId} />
              ))}
            </div>
          )}
        </div>
      )}

      <ProjectSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

import type { Task, Week, Retrospective } from '@/generated/prisma/client';

export interface TaskWithRelations extends Task {
  assigneeUser: { id: string; name: string | null; image: string | null } | null;
  assigneeMember: { id: string; name: string; color: string } | null;
  goalProject: { id: string; title: string } | null;
}

export interface WeekWithTasks extends Week {
  tasks: TaskWithRelations[];
  retrospective: Retrospective | null;
}

export interface Member {
  id: string;
  name: string;
  image?: string | null;
}

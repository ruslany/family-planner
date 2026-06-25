import type { Task, Week, Retrospective, Project } from '@/generated/prisma/client';

export interface TaskWithRelations extends Task {
  assigneeUser: { id: string; name: string | null; image: string | null } | null;
  assigneeMember: { id: string; name: string; color: string } | null;
  project: { id: string; title: string } | null;
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

export interface BacklogTask {
  id: string;
  title: string;
  description: string | null;
  assigneeUser: { id: string; name: string | null; image: string | null } | null;
  assigneeMember: { id: string; name: string; color: string } | null;
}

export interface ProjectWithTasks extends Project {
  tasks: (TaskWithRelations & {
    week: { id: string; startDate: Date; endDate: Date } | null;
  })[];
}

export interface ProjectSummary {
  id: string;
  title: string;
}

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCurrentWeekRange } from '@/lib/week-utils';
import { ProjectsView } from './ProjectsView';

async function getProjects() {
  return prisma.project.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'asc' }],
    include: {
      tasks: {
        include: {
          assigneeUser: { select: { id: true, name: true, image: true } },
          assigneeMember: { select: { id: true, name: true, color: true } },
          week: { select: { id: true, startDate: true, endDate: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}

async function getCurrentWeekId(): Promise<string> {
  const { startDate, endDate } = getCurrentWeekRange();
  let week = await prisma.week.findFirst({ where: { startDate } });
  if (!week) {
    week = await prisma.week.create({ data: { startDate, endDate, state: 'planning' } });
  }
  return week.id;
}

export default async function ProjectsPage() {
  await auth();
  const [projects, currentWeekId] = await Promise.all([getProjects(), getCurrentWeekId()]);
  return <ProjectsView projects={projects} currentWeekId={currentWeekId} />;
}

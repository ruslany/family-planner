-- Rename GoalProject table to Project
ALTER TABLE "GoalProject" RENAME TO "Project";

-- Rename primary key constraint to match new model name
ALTER TABLE "Project" RENAME CONSTRAINT "GoalProject_pkey" TO "Project_pkey";

-- Drop the type column (no longer needed)
ALTER TABLE "Project" DROP COLUMN "type";

-- Make Task.weekId nullable (backlog tasks have no week assignment)
ALTER TABLE "Task" ALTER COLUMN "weekId" DROP NOT NULL;

-- Rename goalProjectId column to projectId in Task
ALTER TABLE "Task" RENAME COLUMN "goalProjectId" TO "projectId";

-- Drop old FK constraint and add renamed one pointing to the new table name
ALTER TABLE "Task" DROP CONSTRAINT "Task_goalProjectId_fkey";
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

# Family Weekly Planner — Requirements Document

## Overview

A family-focused web app for weekly task planning, progress tracking, and retrospectives. Each week, the family sits down together (typically Sunday), defines actionable tasks for the week ahead, executes them, and then reviews progress at week's end before planning again. The app is designed to feel lightweight and frictionless — easy enough to use on a phone while watching TV, thorough enough for meaningful weekly review sessions.

---

## Core Concepts & Data Model

### Week

The central unit of the app. A week runs Monday–Sunday. Each week has:

- A **planning state** (planning, in-progress, review, archived)
- A set of **tasks**
- An optional **retrospective note** written at week's end
- A creation date and a week label (e.g. "Jun 16 – Jun 22")

### Task

An atomic unit of work planned for a specific week. A task has:

- **Title** (required) — short, actionable description
- **Description** (optional) — more detail, notes, context
- **Assignee** (optional) — family member name (free text or selected from a family member list)
- **Day assignment** (optional) — a specific day of the week (Mon–Sun), or left unassigned
- **Status** — `todo` | `done` | `skipped`
- **Parent** (optional) — a reference to a Goal or Project this task contributes to
- **Completion date** (optional) — auto-set when marked done
- **Created at** timestamp
- **Week** — which week this task belongs to

### Goal / Project

A larger objective that tasks can roll up into. Goals/Projects span multiple weeks. Each has:

- **Title**
- **Description** (optional)
- **Type** — `goal` (outcome-oriented) or `project` (deliverable-oriented); both behave the same in MVP
- **Status** — `active` | `completed` | `on-hold` | `dropped`
- **Created at** / **Completed at**

### Family Members

Each family member signs in with their own Google account. On first sign-in, a `User` record is automatically created from their Google profile (name, email, profile photo). An admin (you) maintains an **allowlist** of permitted Google email addresses — only those emails can access the app. Family members who haven't yet signed in (e.g. young children without their own device) can still be referenced in tasks via a manually created `FamilyMember` entry that is not linked to any Google account.

### Retrospective

A structured end-of-week note attached to a week. Contains:

- **What went well** (free text)
- **What didn't go well / what was skipped and why** (free text)
- **Notes for next week** (free text, carries into next week's planning session)
- **Overall feeling** — a simple emoji rating (😩 😐 🙂 🎉)

---

## User Flows

### Flow 1 — Sunday Planning Session

1. Open app → see current week dashboard
2. Tap "Plan This Week" button (or it auto-shows if week is in planning state)
3. Add tasks one by one:
   - Task title (required)
   - Optionally assign to a family member
   - Optionally assign to a day
   - Optionally link to a goal/project
4. Review task list together; reorder or delete as needed
5. Tap "Start the Week" to move week into `in-progress` state

### Flow 2 — Daily Task Execution

1. Open app → current week dashboard shows all tasks
2. Default view: tasks grouped by day (unassigned tasks shown at top or bottom)
3. Tap a task to toggle it `done` (shows checkmark, strikes through title)
4. Tap again or long-press to revert to `todo`, or mark as `skipped`
5. Optionally add/edit task description inline

### Flow 3 — End-of-Week Review

1. Open app → if all days have passed, a "Review This Week" prompt appears
2. Tap "Review" → see week summary:
   - Tasks done vs. total
   - Tasks by assignee
   - Any tasks linked to goals/projects (with goal progress)
3. Fill in retrospective fields (what went well, didn't, notes for next week)
4. Tap "Complete Week" → week moves to `archived` state
5. App prompts: "Plan next week?" → goes to Flow 1 for next week with notes from retrospective pre-loaded

### Flow 4 — Goals & Projects View

1. Dedicated "Goals" tab/page
2. See all active goals/projects
3. For each: see linked tasks across all weeks, overall completion %
4. Add new goal/project
5. Mark goal/project complete or change status

### Flow 5 — History

1. "History" tab shows past archived weeks in reverse chronological order
2. Tap a week to expand and see its tasks, completion rate, and retrospective

---

## UI & UX Requirements

### General

- Mobile-first design with a clean, warm, family-friendly aesthetic (not corporate)
- Simple color palette: one primary accent color, light background, clear typography
- Minimum tap target size: 44×44px for all interactive elements
- No dense tables or complex layouts on mobile
- Loading states for all async actions (optimistic UI preferred where safe)
- Toast/snackbar notifications for actions (task marked done, week completed, etc.)

### Navigation

- Bottom navigation bar on mobile with 3–4 tabs: **This Week**, **Goals**, **History**, **Settings**
- Top nav / sidebar on desktop
- Active week is always one tap away from any screen

### This Week View (Primary Screen)

- Header: week date range + current day highlighted
- Progress bar or ring showing tasks done / total
- Task list grouped by day (Mon → Sun), with an "Unscheduled" section
- Each task row: checkbox | title | assignee avatar/initial | (optional) goal tag
- Completed tasks visually de-emphasized (strikethrough, muted color) but still visible
- Floating action button (FAB) for "Add Task" on mobile
- "Review" or "Plan" call-to-action banner when appropriate

### Task Add / Edit

- Modal sheet on mobile (slides up from bottom)
- Full page or side panel on desktop
- Fields: title (auto-focus), description, assignee (dropdown/chips from family members list), day (day-of-week picker), goal/project (searchable dropdown)
- Save with single tap; keyboard-friendly

### Goals View

- Card-based layout per goal/project
- Each card: title, status badge, progress bar (tasks done this week + all-time), description snippet
- Tap to expand and see linked tasks by week

### History View

- Accordion list of past weeks
- Each week: date range, completion rate (e.g. "8/10 tasks done"), retrospective mood emoji
- Tap to expand full details

### Settings

- **Account:** Shows current signed-in Google account (name, photo, email); Sign Out button
- **Family Members (admin only):** Manage the Google email allowlist (add/remove permitted emails); manage manual family member entries for people without Google accounts
- **App preferences:** Week start day is always Monday (not configurable in MVP)
- Optional: light/dark mode toggle

---

## Technical Requirements

### Stack

- **Framework:** Next.js (App Router) with React
- **Language:** TypeScript throughout
- **Database:** PostgreSQL (hosted on Neon, Supabase, or Railway — all have free tiers compatible with Vercel)
- **ORM:** Prisma
- **Hosting:** Vercel (free tier)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (built on Radix UI primitives) for accessible, composable components
- **Authentication:** NextAuth.js v5 (Auth.js) with Google OAuth provider

### Database Schema (Prisma)

```prisma
// Google-authenticated family member
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  image         String?  // Google profile photo URL
  isAdmin       Boolean  @default(false)
  createdAt     DateTime @default(now())
  // NextAuth.js required relations
  accounts      Account[]
  sessions      Session[]
  tasks         Task[]   // tasks assigned to this user
}

// NextAuth.js Account model (OAuth tokens)
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

// NextAuth.js Session model
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// NextAuth.js VerificationToken model (not used for OAuth but required by adapter)
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// Allowlist of permitted Google email addresses
model AllowedEmail {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now())
}

// Manual family member entry for people without Google accounts (e.g. young children)
model FamilyMember {
  id        String   @id @default(cuid())
  name      String
  color     String   // hex color for avatar
  createdAt DateTime @default(now())
  tasks     Task[]
}

model GoalProject {
  id          String   @id @default(cuid())
  title       String
  description String?
  type        String   // "goal" | "project"
  status      String   @default("active") // "active" | "completed" | "on-hold" | "dropped"
  createdAt   DateTime @default(now())
  completedAt DateTime?
  tasks       Task[]
}

model Week {
  id             String          @id @default(cuid())
  startDate      DateTime        // Monday 00:00:00 UTC
  endDate        DateTime        // Sunday 23:59:59 UTC
  state          String          @default("planning") // "planning" | "in-progress" | "review" | "archived"
  createdAt      DateTime        @default(now())
  tasks          Task[]
  retrospective  Retrospective?
}

model Task {
  id                String        @id @default(cuid())
  title             String
  description       String?
  status            String        @default("todo") // "todo" | "done" | "skipped"
  dayOfWeek         Int?          // 1=Mon ... 7=Sun, null = unscheduled
  sortOrder         Int           @default(0)
  createdAt         DateTime      @default(now())
  completedAt       DateTime?
  week              Week          @relation(fields: [weekId], references: [id])
  weekId            String
  // Assignee is either a Google-authenticated User OR a manual FamilyMember (not both)
  assigneeUser      User?         @relation(fields: [assigneeUserId], references: [id])
  assigneeUserId    String?
  assigneeMember    FamilyMember? @relation(fields: [assigneeMemberId], references: [id])
  assigneeMemberId  String?
  goalProject       GoalProject?  @relation(fields: [goalProjectId], references: [id])
  goalProjectId     String?
}

model Retrospective {
  id             String   @id @default(cuid())
  wentWell       String?
  didntGoWell    String?
  notesForNext   String?
  moodEmoji      String?  // "😩" | "😐" | "🙂" | "🎉"
  createdAt      DateTime @default(now())
  week           Week     @relation(fields: [weekId], references: [id])
  weekId         String   @unique
}
```

### API Routes (Next.js Route Handlers)

All routes under `/api/`:

**Auth**

- `GET/POST /api/auth/[...nextauth]` — NextAuth.js catch-all handler (sign in, sign out, callback)

**Weeks**

- `GET /api/weeks/current` — get or auto-create the current week
- `GET /api/weeks` — list all weeks (paginated, for history)
- `GET /api/weeks/[id]` — get a single week with tasks and retrospective
- `PATCH /api/weeks/[id]` — update week state (e.g. start, complete)

**Tasks**

- `POST /api/tasks` — create a task
- `PATCH /api/tasks/[id]` — update task (status, title, assignee, day, etc.)
- `DELETE /api/tasks/[id]` — delete a task
- `PATCH /api/tasks/reorder` — bulk update sortOrder for drag-and-drop

**Goals & Projects**

- `GET /api/goals` — list all goals/projects
- `POST /api/goals` — create goal/project
- `PATCH /api/goals/[id]` — update
- `DELETE /api/goals/[id]` — delete (soft delete preferred)

**Retrospectives**

- `POST /api/retrospectives` — create or update retrospective for a week

**Family Members**

- `GET /api/members` — list all assignable people (Google Users + manual FamilyMembers)
- `POST /api/members` — add a manual family member (admin only)
- `DELETE /api/members/[id]` — remove a manual family member (admin only)

**Allowlist (admin only)**

- `GET /api/allowlist` — list permitted email addresses
- `POST /api/allowlist` — add an email address
- `DELETE /api/allowlist/[id]` — remove an email address

### Architecture Notes

- Use **Server Components** for data fetching where possible; Client Components only for interactive elements
- Use **Server Actions** for form submissions and mutations (simpler than API routes for many cases — use whichever is cleaner per use case)
- All database access via **Prisma Client** singleton pattern
- **Authentication:** NextAuth.js v5 with Google OAuth. All routes except `/api/auth/*` and the sign-in page are protected — unauthenticated users are redirected to sign in. Enforce the allowlist in the NextAuth `signIn` callback: reject any Google account whose email is not in the `AllowedEmail` table.
- **Session access:** Use NextAuth `auth()` helper in Server Components and `useSession()` in Client Components. Never trust client-sent user IDs — always resolve the current user from the server session.
- **Admin role:** The first user to sign in (or a manually flagged `isAdmin: true` user) can manage the allowlist and manual family members from the Settings page. Non-admin family members see Settings but cannot change the allowlist.
- **Optimistic UI** for task status toggles (mark done feels instant)
- Environment variables: `DATABASE_URL`, `DIRECT_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET` (random string for NextAuth session signing)

### Vercel Deployment

- Connect GitHub repo to Vercel
- Set `DATABASE_URL`, `DIRECT_URL`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `AUTH_SECRET` in Vercel environment variables
- Add your Vercel production URL to the Google Cloud Console OAuth 2.0 authorized redirect URIs: `https://your-app.vercel.app/api/auth/callback/google`
- Run `prisma migrate deploy` as part of build: add `"postinstall": "prisma generate"` and configure build command as `prisma migrate deploy && next build`
- Use Neon (neon.tech) as the PostgreSQL provider — free tier, Vercel-native integration available

---

## File Structure

```bash
/
├── app/
│   ├── layout.tsx              # Root layout with nav
│   ├── page.tsx                # Redirects to /week/current
│   ├── week/
│   │   ├── page.tsx            # This Week view
│   │   └── [id]/
│   │       └── page.tsx        # Specific week (for history)
│   ├── goals/
│   │   └── page.tsx            # Goals & Projects view
│   ├── history/
│   │   └── page.tsx            # History view
│   ├── settings/
│   │   └── page.tsx            # Settings view
│   ├── auth/
│   │   └── signin/
│   │       └── page.tsx        # Custom sign-in page with Google button
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts    # NextAuth catch-all handler
│       ├── weeks/...
│       ├── tasks/...
│       ├── goals/...
│       ├── retrospectives/...
│       ├── allowlist/...
│       └── members/...
├── components/
│   ├── layout/
│   │   ├── BottomNav.tsx       # Mobile bottom navigation
│   │   ├── TopNav.tsx          # Desktop navigation
│   │   └── AppShell.tsx        # Responsive nav wrapper
│   ├── week/
│   │   ├── WeekHeader.tsx      # Week title + progress bar
│   │   ├── DaySection.tsx      # Tasks grouped by day
│   │   ├── TaskRow.tsx         # Individual task with checkbox
│   │   ├── TaskSheet.tsx       # Add/edit task modal
│   │   └── ReviewBanner.tsx    # Prompt to review or plan
│   ├── goals/
│   │   ├── GoalCard.tsx
│   │   └── GoalSheet.tsx
│   ├── retro/
│   │   └── RetroForm.tsx
│   └── ui/                     # shadcn/ui components (auto-generated)
├── lib/
│   ├── prisma.ts               # Prisma client singleton
│   ├── auth.ts                 # NextAuth config (Google provider, Prisma adapter, allowlist callback)
│   ├── week-utils.ts           # Date helpers (current week, week label, etc.)
│   └── types.ts                # Shared TypeScript types
├── proxy.ts                    # Protects all routes; redirects unauthenticated users to /auth/signin
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── .env.local
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## MVP Scope (Ship First)

The following are **in scope** for the initial version:

- [ ] Current week view with tasks grouped by day
- [ ] Add / edit / delete tasks with all fields
- [ ] Mark tasks done / skipped / todo (tap to toggle)
- [ ] Week state transitions (planning → in-progress → review → archived)
- [ ] End-of-week retrospective form
- [ ] Goals & Projects with task linkage
- [ ] Family members management (Settings)
- [ ] History view (past weeks, read-only)
- [ ] Google OAuth sign-in (NextAuth.js) with email allowlist
- [ ] User profile (name + Google avatar) shown in nav and on assigned tasks
- [ ] Admin settings: manage allowlist and manual family members
- [ ] Mobile-first responsive design
- [ ] Vercel + Neon deployment

**Out of scope for MVP (future iterations):**

- Push notifications or reminders
- Calendar sync (Google Calendar, etc.)
- Per-user task privacy (all tasks visible to all family members)
- Recurring tasks
- Photo attachments
- Comments on tasks
- Drag-and-drop reordering (add sort controls instead)
- Multiple families / multi-tenant

---

## Non-Functional Requirements

- **Performance:** Initial page load < 2s on mobile LTE; task status toggle feels instant (optimistic)
- **Accessibility:** Keyboard navigable, ARIA labels on interactive elements, sufficient color contrast (WCAG AA)
- **Error handling:** Network errors show user-friendly messages; forms preserve input on failure
- **Empty states:** Thoughtful empty state UI for new weeks, no tasks, no goals
- **Data safety:** No hard deletes for tasks in archived weeks; soft-delete or archive pattern preferred

---

## Key Design Decisions & Rationale

**Why Google OAuth?** Every family member already has a Google account, so there are no passwords to manage and sign-in is one tap on a phone that's already signed into Google. It also keeps the app private — only the email addresses you explicitly allowlist can get in — without building any custom auth infrastructure. NextAuth.js with the Prisma adapter handles all the OAuth plumbing, session management, and token storage automatically.

**Why an allowlist instead of open registration?** The app is for one family. Rather than relying on Google's authentication alone (anyone with a Google account could potentially reach the app URL), the allowlist ensures that only your specific family members' email addresses can create sessions, even if the Vercel URL is discovered by someone else.

**Why PostgreSQL over SQLite?** Vercel's serverless functions don't have a persistent filesystem, so SQLite won't work. PostgreSQL on Neon gives a real database with a free tier and a first-class Vercel integration.

**Why shadcn/ui?** It gives accessible, customizable components (dialogs, sheets, checkboxes, dropdowns) without locking into a heavy component library. Components are copied into the project and fully owned.

**Why Tasks have a `dayOfWeek` instead of a full `DateTime`?** The family explicitly doesn't want to commit tasks to specific times or exact dates — just rough day-of-week guidance. A simple 1–7 integer is sufficient and avoids timezone complexity.

**Why Prisma?** Type-safe database access, great migration workflow, and excellent Vercel/Neon compatibility.

---

## Build Stages

Each stage should be **deployable to Vercel and usable end-to-end** before the next stage begins. Do not start a stage until the previous one is working in production.

---

### Stage 1 — Project Scaffold & Auth

**Goal:** A live Vercel URL that requires Google sign-in. Nothing useful yet, but the foundation is correct and every family member can authenticate.

#### Deliverables

- Initialize Next.js (App Router) project with TypeScript, Tailwind CSS, and shadcn/ui
- Set up Prisma with the full schema (all models from the requirements — build the complete schema now so no migrations need to add columns later)
- Provision Neon PostgreSQL database and run initial migration
- Implement NextAuth.js v5 with Google OAuth provider and Prisma adapter
- Implement the email allowlist check in the `signIn` callback — reject emails not in `AllowedEmail`
- `proxy.ts` protecting all routes except `/auth/signin` and `/api/auth/*` — exports a named `proxy` function (Next.js 16+ convention; previously called `middleware.ts`)
- Custom sign-in page (`/auth/signin`) with a "Sign in with Google" button, app name/logo placeholder, and a friendly message for unauthorized users
- Seed script (`prisma/seed.ts`) that inserts the admin's email into `AllowedEmail` and sets `isAdmin: true` on their `User` record after first sign-in (or inserts it pre-emptively)
- Basic app shell: responsive layout with bottom nav (mobile) and top nav (desktop) showing the signed-in user's Google avatar and name; nav tabs are present but lead to placeholder pages
- Deploy to Vercel with all environment variables configured

#### Verification checklist

- [x] Unauthenticated visit to `/` redirects to `/auth/signin`
- [x] Signing in with an allowlisted Google account lands on the app shell
- [x] Signing in with a non-allowlisted account shows an "access denied" message on the sign-in page
- [x] User's Google name and avatar appear in the nav
- [x] Sign out works and redirects to sign-in
- [x] Deployed and working on Vercel production URL

---

### Stage 2 — Core Task Management (This Week)

**Goal:** The family can use the app for its primary daily purpose: adding tasks for the week and marking them done. This is the highest-value slice — everything else is secondary.

#### Deliverables

- `GET /api/weeks/current` — auto-creates a Week record for the current Mon–Sun if one doesn't exist
- `POST /api/tasks`, `PATCH /api/tasks/[id]`, `DELETE /api/tasks/[id]` API routes
- **This Week page** (`/week`):
  - Week header with date range and progress bar (done / total)
  - Task list grouped by day of week (Mon → Sun) with an "Unscheduled" section
  - Each task row: tap-to-toggle checkbox (todo → done → todo), task title, strikethrough + muted styling when done
  - Current day's section visually highlighted
  - Floating action button (FAB) on mobile to add a task
- **Add Task sheet** (bottom sheet on mobile, dialog on desktop):
  - Fields: title (required, auto-focus), description (optional), day-of-week picker (optional)
  - Assignee and goal fields are present in the UI but can show "coming in next stage" placeholder state — do not wire them up yet
  - Save and cancel
- Optimistic UI for checkbox toggle — status change feels instant
- Empty state for weeks with no tasks

#### Verification checklist

- [ ] Opening the app shows the current week
- [ ] Can add a task with just a title; it appears under the correct day or Unscheduled
- [ ] Tapping the checkbox marks it done (strikethrough) immediately; persists on refresh
- [ ] Can delete a task (swipe or long-press on mobile; button on desktop)
- [ ] Progress bar updates as tasks are completed
- [ ] Works well on a phone screen (375px wide)

---

### Stage 3 — Week Lifecycle & Retrospective

**Goal:** The full weekly loop works — plan, execute, review, repeat. After this stage the app is complete enough for real weekly use.

#### Deliverables

- Week state machine transitions via `PATCH /api/weeks/[id]`:
  - `planning` → `in-progress` (triggered by "Start the Week" button)
  - `in-progress` → `review` (triggered by "Review This Week" banner, shown when current date is past the week's end)
  - `review` → `archived` (triggered by "Complete Week" after filling in retrospective)
- **Planning banner**: shown on This Week page when week state is `planning` — prompts family to add tasks and tap "Start the Week"
- **Review banner**: shown when week state is `in-progress` and today is after Sunday — prompts "Review This Week"
- **Retrospective form** (`/week/[id]/review`):
  - Week summary: tasks done vs. total, list of skipped tasks
  - Four fields: What went well, What didn't go well, Notes for next week, Mood emoji picker (😩 😐 🙂 🎉)
  - "Complete Week" button → archives week, then prompts "Plan next week?"
  - "Plan next week" creates the next week and pre-populates a notes banner from `notesForNext`
- `POST /api/retrospectives` — upsert retrospective for a week
- After completing a week, auto-create the next week in `planning` state

#### Verification checklist

- [ ] New week starts in `planning` state with a visible banner
- [ ] "Start the Week" moves it to `in-progress` and banner disappears
- [ ] After Sunday, review banner appears
- [ ] Retrospective form saves all four fields
- [ ] "Complete Week" archives the week and offers to plan next week
- [ ] Next week is created with notes from retrospective visible

---

### Stage 4 — Family Members & Task Assignment

**Goal:** Tasks can be assigned to specific family members, with their Google avatar shown on each task. The admin can manage who has access.

#### Deliverables

- **Settings page** (`/settings`):
  - Account section: signed-in user's name, email, Google photo, Sign Out button
  - Family Members section (admin only):
    - List of allowlisted emails with "Remove" per row and "Add email" form
    - List of manual `FamilyMember` entries (for kids without Google accounts) with add/remove
  - Non-admins see Settings but the allowlist management section is hidden
- `GET/POST/DELETE /api/allowlist` — admin-only allowlist management
- `GET /api/members` — returns merged list of Google `User`s (who have signed in) and manual `FamilyMember`s, normalized to `{ id, name, image, type }` shape for use in the task assignee picker
- `POST/DELETE /api/members` — manage manual family members (admin only)
- **Wire up the assignee field in the Add/Edit Task sheet**:
  - Dropdown/chip picker populated from `/api/members`
  - Selected assignee's avatar (Google photo or colored initial) shown on the task row
  - Assignee avatar visible in the task list alongside the task title

#### Verification checklist

- [ ] Admin can add a new Google email to the allowlist; that person can now sign in
- [ ] Admin can add a manual family member (e.g. a child's name); they appear in the assignee picker
- [ ] Assigning a task to a family member shows their avatar on the task row
- [ ] Non-admin family members cannot see or access allowlist management
- [ ] Removing someone from the allowlist does not delete their existing tasks

---

### Stage 5 — Goals & Projects

**Goal:** The family can track progress toward larger multi-week objectives and link individual tasks to them.

#### Deliverables

- `GET/POST /api/goals`, `PATCH/DELETE /api/goals/[id]` API routes
- **Goals page** (`/goals`):
  - Card per goal/project: title, type badge (Goal / Project), status badge, description snippet
  - Progress bar: tasks linked to this goal that are done / total linked tasks (all-time)
  - "This week" count: how many linked tasks are planned for the current week
  - Tap card to expand and see linked tasks grouped by week
  - FAB / button to add new goal or project
- **Add/Edit Goal sheet**: title, type (goal/project), description, status
- **Wire up the goal field in the Add/Edit Task sheet**:
  - Searchable dropdown of active goals/projects
  - Selected goal shown as a small tag/chip on the task row in This Week view
- Soft-delete for goals: `status = 'dropped'` rather than hard delete; dropped goals hidden by default with a "Show dropped" toggle

#### Verification checklist

- [ ] Can create a goal and a project
- [ ] Can link a task to a goal when adding/editing it
- [ ] Goal card shows correct done/total count across all weeks
- [ ] Tapping a goal card shows its linked tasks by week
- [ ] Goal tag appears on task rows in This Week view
- [ ] Dropped goals are hidden by default

---

### Stage 6 — History View & Polish

**Goal:** The app feels complete and production-quality. Past weeks are browsable, and the experience is polished on both mobile and desktop.

#### Deliverables

- **History page** (`/history`):
  - Reverse-chronological list of archived weeks
  - Each row: date range, completion rate (e.g. "8 / 10 tasks done"), mood emoji from retrospective
  - Tap to expand: full task list (done/skipped/todo), retrospective text fields
  - Read-only — no editing of archived weeks
- `GET /api/weeks` — paginated list of archived weeks with task counts and retrospective
- **Polish pass across all screens**:
  - Consistent empty states (no tasks, no goals, no history yet)
  - Error states and network failure messages (toast on failed save, retry option)
  - Loading skeletons for async data
  - Smooth transitions on task toggle and sheet open/close
  - Verify all tap targets are ≥ 44×44px on mobile
  - Test and fix layout on narrow (375px) and wide (1280px+) viewports
  - Confirm WCAG AA color contrast on key text/background combinations
- **Progressive Web App (PWA) config** (optional but recommended):
  - `manifest.json` with app name, icons, `display: standalone`
  - Allows family members to "Add to Home Screen" on iOS/Android for a native-app feel

#### Verification checklist

- [ ] History page shows all past weeks in reverse order
- [ ] Expanding a past week shows its full task list and retrospective
- [ ] Empty states are present on all pages
- [ ] App works and looks good at 375px (iPhone SE) and 390px (iPhone 14) widths
- [ ] App works and looks good at 1280px desktop width
- [ ] "Add to Home Screen" on iOS opens the app in standalone mode (if PWA implemented)
- [ ] No console errors in production build

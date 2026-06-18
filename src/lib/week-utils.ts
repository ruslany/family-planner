const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function getCurrentWeekRange(): { startDate: Date; endDate: Date } {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Sun, 1=Mon...6=Sat
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysFromMonday, 0, 0, 0, 0),
  );
  const sunday = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - daysFromMonday + 6,
      23,
      59,
      59,
      999,
    ),
  );
  return { startDate: monday, endDate: sunday };
}

export function formatWeekLabel(startDate: Date, endDate: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  return `${fmt(startDate)} – ${fmt(endDate)}`;
}

export function getDayLabel(dayOfWeek: number): string {
  return DAY_LABELS[dayOfWeek - 1] ?? '';
}

export function getDayFullLabel(dayOfWeek: number): string {
  return DAY_FULL_LABELS[dayOfWeek - 1] ?? '';
}

/** Returns 1 (Mon) – 7 (Sun) for today in UTC. */
export function getCurrentDayOfWeek(): number {
  const d = new Date().getUTCDay(); // 0=Sun
  return d === 0 ? 7 : d;
}

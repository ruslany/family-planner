const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL_LABELS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function getCurrentWeekRange(): { startDate: Date; endDate: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...6=Sat (local time)
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const monday = new Date(
    Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - daysFromMonday,
      0,
      0,
      0,
      0,
    ),
  );
  const sunday = new Date(
    Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - daysFromMonday + 6,
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

/** Returns 1 (Mon) – 7 (Sun) for today in local time. */
export function getCurrentDayOfWeek(): number {
  const d = new Date().getDay(); // 0=Sun (local time)
  return d === 0 ? 7 : d;
}

/** Returns the Mon–Sun range for the week after the given week's startDate. */
export function getNextWeekRange(currentStartDate: Date): { startDate: Date; endDate: Date } {
  const d = new Date(currentStartDate);
  const nextMonday = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 7, 0, 0, 0, 0),
  );
  const nextSunday = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 13, 23, 59, 59, 999),
  );
  return { startDate: nextMonday, endDate: nextSunday };
}

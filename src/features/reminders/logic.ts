import { parseQuickAdd } from '@/features/tasks/parseQuickAdd';
import { combine, formatDay, formatTime, toKey, timeFromDate, todayKey } from '@/lib/dates';
import type { ReminderItem } from '@/store/types';

/** "Call dentist tomorrow 9am" → title + alert time. A day without a time alerts at 9am. */
export function parseReminder(text: string, now = new Date()) {
  const p = parseQuickAdd(text, toKey(now));
  if (!p.date && !p.time) return { title: p.title, remindAt: null as number | null };
  let at = combine(p.date ?? todayKey(), p.time ?? '09:00').getTime();
  // "6pm" when it's already past 6pm today means tomorrow.
  if (!p.date && at <= now.getTime()) at += 86_400_000;
  return { title: p.title, remindAt: at };
}

export function whenLabel(ms: number, use24h: boolean) {
  const d = new Date(ms);
  return `${formatDay(toKey(d))} · ${formatTime(timeFromDate(d), use24h)}`;
}

/** Due now (and not snoozed into the future). */
export function isDue(r: ReminderItem, now = Date.now()) {
  if (r.done || r.deletedAt || !r.remindAt) return false;
  if (r.snoozedUntil && r.snoozedUntil > now) return false;
  return (r.snoozedUntil ?? r.remindAt) <= now;
}

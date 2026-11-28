import {
  addDays,
  daysInMonth,
  diffDays,
  fromKey,
  nowTime,
  todayKey,
  weekday,
  type DayKey,
} from '@/lib/dates';
import type { Repeat, Task } from '@/store/types';
import { t } from '@/lib/i18n';

export const REPEAT_LABELS: Record<Repeat, string> = {
  none: 'Never',
  daily: 'Every day',
  weekdays: 'Weekdays',
  weekly: 'Every week',
  monthly: 'Every month',
};

export const REMINDER_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: 'None' },
  { value: 0, label: 'At time' },
  { value: 10, label: '10 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 1440, label: '1 day' },
];

export function reminderLabel(r: number | null) {
  if (r == null) return t('No reminder');
  if (r === 0) return t('At time');
  const o = REMINDER_OPTIONS.find((x) => x.value === r);
  return t('{time} before', { time: o ? t(o.label) : t('{m} min', { m: r }) });
}

/** Does the task have an occurrence on `day`? */
export function occursOn(task: Task, day: DayKey): boolean {
  if (task.deletedAt) return false;
  if (day < task.date) return false;
  if (task.skippedDates?.includes(day)) return false;
  switch (task.repeat) {
    case 'none':
      return day === task.date;
    case 'daily':
      return true;
    case 'weekdays': {
      const wd = weekday(day);
      return wd >= 1 && wd <= 5;
    }
    case 'weekly':
      return weekday(day) === weekday(task.date);
    case 'monthly': {
      const want = fromKey(task.date).getDate();
      const d = fromKey(day).getDate();
      return d === Math.min(want, daysInMonth(day));
    }
  }
}

export function isDone(task: Task, day: DayKey): boolean {
  return task.completedDates.includes(task.repeat === 'none' ? task.date : day);
}

export interface Occurrence {
  task: Task;
  day: DayKey;
  done: boolean;
}

export function sortOccurrences(a: Occurrence, b: Occurrence) {
  if (a.day !== b.day) return a.day < b.day ? -1 : 1;
  if (a.done !== b.done) return a.done ? 1 : -1;
  const at = a.task.time ?? '';
  const bt = b.task.time ?? '';
  if (at !== bt) return at === '' ? -1 : bt === '' ? 1 : at < bt ? -1 : 1;
  return a.task.createdAt - b.task.createdAt;
}

export function occurrencesOn(tasks: Task[], day: DayKey): Occurrence[] {
  return tasks
    .filter((t) => occursOn(t, day))
    .map((task) => ({ task, day, done: isDone(task, day) }))
    .sort(sortOccurrences);
}

export function occurrencesInRange(tasks: Task[], start: DayKey, days: number): Occurrence[] {
  const out: Occurrence[] = [];
  for (let i = 0; i < days; i++) out.push(...occurrencesOn(tasks, addDays(start, i)));
  return out;
}

/** Next occurrence on/after `from` (within a year), or null. */
export function nextOccurrence(task: Task, from: DayKey = todayKey()): DayKey | null {
  if (task.repeat === 'none') return task.date >= from ? task.date : null;
  let d = from < task.date ? task.date : from;
  for (let i = 0; i < 400; i++, d = addDays(d, 1)) if (occursOn(task, d) && !isDone(task, d)) return d;
  return null;
}

/**
 * Overdue = an unfinished one-off task from a previous day, or anything due
 * today whose time has already passed. Missed repeats of earlier days are
 * not resurrected (they behave like missed habits instead).
 */
export function overdue(tasks: Task[], today = todayKey(), now = nowTime()): Occurrence[] {
  const out: Occurrence[] = [];
  for (const task of tasks) {
    if (task.deletedAt) continue;
    if (task.repeat === 'none') {
      if (isDone(task, task.date)) continue;
      if (task.date < today || (task.date === today && task.time && task.time < now)) {
        out.push({ task, day: task.date, done: false });
      }
    } else if (occursOn(task, today) && !isDone(task, today) && task.time && task.time < now) {
      out.push({ task, day: today, done: false });
    }
  }
  return out.sort(sortOccurrences);
}

export function daysOverdue(day: DayKey, today = todayKey()) {
  return Math.max(0, diffDays(day, today));
}

import type { IconName } from '@/components/ui';
import { addDays, startOfWeek, todayKey, type DayKey } from '@/lib/dates';
import type { Habit } from '@/store/types';

export const HABIT_ICONS: IconName[] = [
  'water', 'book', 'walk', 'barbell', 'bicycle', 'bed', 'leaf', 'nutrition',
  'cafe', 'fitness', 'heart', 'happy', 'musical-notes', 'pencil', 'code-slash', 'language',
  'medkit', 'sunny', 'moon', 'phone-portrait', 'wallet', 'brush', 'sparkles', 'checkmark-done',
];

export function weekCount(habit: Habit, day: DayKey = todayKey(), weekStartsOn: 0 | 1 = 1) {
  const start = startOfWeek(day, weekStartsOn);
  const end = addDays(start, 6);
  return habit.history.filter((d) => d >= start && d <= end).length;
}

/**
 * Daily: consecutive days ending today (or yesterday if today isn't ticked yet).
 * Weekly: consecutive weeks hitting the target; the current week counts once
 * met, and doesn't break the streak while still in progress.
 */
export function habitStreak(habit: Habit, today: DayKey = todayKey(), weekStartsOn: 0 | 1 = 1): number {
  const set = new Set(habit.history);
  if (habit.frequency === 'daily') {
    let d = set.has(today) ? today : addDays(today, -1);
    let n = 0;
    while (set.has(d)) {
      n++;
      d = addDays(d, -1);
    }
    return n;
  }
  const target = Math.max(1, habit.timesPerWeek);
  let week = startOfWeek(today, weekStartsOn);
  let n = 0;
  if (weekCount(habit, week, weekStartsOn) >= target) n++;
  week = addDays(week, -7);
  while (weekCount(habit, week, weekStartsOn) >= target) {
    n++;
    week = addDays(week, -7);
  }
  return n;
}

export function streakLabel(habit: Habit, streak: number) {
  const unit = habit.frequency === 'daily' ? 'day' : 'week';
  return `${streak} ${unit}${streak === 1 ? '' : 's'}`;
}

/** Is the habit still "due" today (for nudges)? */
export function isDueToday(habit: Habit, today: DayKey = todayKey(), weekStartsOn: 0 | 1 = 1) {
  if (habit.history.includes(today)) return false;
  if (habit.frequency === 'daily') return true;
  return weekCount(habit, today, weekStartsOn) < habit.timesPerWeek;
}

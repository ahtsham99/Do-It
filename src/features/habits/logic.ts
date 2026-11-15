import { addDays, diffDays, startOfWeek, toKey, todayKey, type DayKey } from '@/lib/dates';
import type { Habit } from '@/store/types';

export const HABIT_ICONS = [
  '💧', '📖', '📚', '🏃', '🏋️', '🚴', '🧘', '😴',
  '🥗', '🍎', '☕', '💊', '❤️', '🙂', '🎵', '✍️',
  '💻', '🗣️', '🌅', '🌙', '📵', '💰', '🎨', '✅',
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

/** Longest streak ever (days for daily habits, weeks for weekly ones). */
export function bestHabitStreak(habit: Habit, weekStartsOn: 0 | 1 = 1): number {
  const days = [...new Set(habit.history)].sort();
  if (days.length === 0) return 0;
  let best = 0;
  if (habit.frequency === 'daily') {
    let run = 0;
    let prev: DayKey | null = null;
    for (const d of days) {
      run = prev && addDays(prev, 1) === d ? run + 1 : 1;
      best = Math.max(best, run);
      prev = d;
    }
    return best;
  }
  const target = Math.max(1, habit.timesPerWeek);
  const counts = new Map<DayKey, number>();
  for (const d of days) {
    const w = startOfWeek(d, weekStartsOn);
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  let run = 0;
  let prev: DayKey | null = null;
  for (const w of [...counts.keys()].sort()) {
    if ((counts.get(w) ?? 0) < target) {
      run = 0;
      prev = null;
      continue;
    }
    run = prev && addDays(prev, 7) === w ? run + 1 : 1;
    best = Math.max(best, run);
    prev = w;
  }
  return best;
}

/**
 * Consistency over the last `days` days: check-ins kept vs expected.
 * Daily habits expect one per day; weekly habits expect their target per 7 days.
 * Days before a habit was created don't count against it.
 */
export function consistency(habits: Habit[], days: number, today: DayKey = todayKey()) {
  const start = addDays(today, -(days - 1));
  let expected = 0;
  let kept = 0;
  const perDay: number[] = Array.from({ length: days }, () => 0);
  for (const h of habits) {
    const created = toKey(new Date(h.createdAt));
    const firstHistory = h.history.length ? [...h.history].sort()[0] : created;
    const from = [start, created < firstHistory ? created : firstHistory].sort()[1];
    const span = Math.max(0, diffDays(from, today) + 1);
    const exp = h.frequency === 'daily' ? span : Math.round((span / 7) * h.timesPerWeek);
    const done = h.history.filter((d) => d >= from && d <= today);
    expected += exp;
    kept += Math.min(done.length, Math.max(exp, done.length));
    for (const d of done) perDay[diffDays(start, d)]++;
  }
  const max = Math.max(1, habits.length);
  return {
    expected,
    kept: Math.min(kept, Math.max(expected, kept)),
    pct: expected ? Math.min(100, Math.round((kept / expected) * 100)) : 0,
    series: perDay.map((n) => Math.min(1, n / max)),
    start,
  };
}

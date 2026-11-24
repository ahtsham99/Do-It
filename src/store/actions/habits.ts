import { todayKey, type DayKey } from '@/lib/dates';
import { uid } from '@/lib/id';

import { markActive } from './stats';
import { setState } from '../store';
import type { Habit } from '../types';

export type HabitInput = Pick<Habit, 'name' | 'icon' | 'color' | 'frequency' | 'timesPerWeek'> & Partial<Pick<Habit, 'perDay' | 'goalId'>>;

export function addHabit(input: HabitInput): Habit {
  const now = Date.now();
  const habit: Habit = { id: uid('h_'), createdAt: now, updatedAt: now, history: [], ...input };
  setState((s) => ({ habits: [...s.habits, habit] }));
  return habit;
}

export function updateHabit(id: string, patch: Partial<Habit>) {
  setState((s) => ({
    habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch, updatedAt: Date.now() } : h)),
  }));
}

export function deleteHabit(id: string) {
  updateHabit(id, { deletedAt: Date.now() });
}

/** Tick / untick a habit on a day. Returns true if it is now done. */
export function toggleHabit(habit: Habit, day: DayKey = todayKey()) {
  const done = habit.history.includes(day);
  updateHabit(habit.id, {
    history: done ? habit.history.filter((d) => d !== day) : [...habit.history, day].sort(),
  });
  if (!done && day === todayKey()) markActive(day);
  return !done;
}

/** Today's count for a habit (perDay > 1), or 0/1 for a simple habit. */
export function countFor(habit: Habit, day: DayKey = todayKey()) {
  const target = Math.max(1, habit.perDay ?? 1);
  if (target === 1) return habit.history.includes(day) ? 1 : 0;
  return habit.counts?.[day] ?? (habit.history.includes(day) ? target : 0);
}

/**
 * Tap on a habit: simple habits toggle; counted habits go up by one
 * (and back to 0 after the target). Returns true when this tap completed it.
 */
export function stepHabit(habit: Habit, day: DayKey = todayKey(), delta = 1): boolean {
  const target = Math.max(1, habit.perDay ?? 1);
  if (target === 1) {
    if (delta < 0 && !habit.history.includes(day)) return false;
    return toggleHabit(habit, day);
  }
  const current = countFor(habit, day);
  const next = delta > 0 && current >= target ? 0 : Math.max(0, Math.min(target, current + delta));
  const done = next >= target;
  const wasDone = habit.history.includes(day);
  const history = done ? (wasDone ? habit.history : [...habit.history, day].sort()) : habit.history.filter((d) => d !== day);
  updateHabit(habit.id, { counts: { ...(habit.counts ?? {}), [day]: next }, history });
  if (next > current && day === todayKey()) markActive(day);
  return done && !wasDone;
}

/** Mark a whole day done or not done (used to backfill past days). */
export function setHabitDay(habit: Habit, day: DayKey, done: boolean) {
  const target = Math.max(1, habit.perDay ?? 1);
  const has = habit.history.includes(day);
  if (done === has) return;
  updateHabit(habit.id, {
    history: done ? [...habit.history, day].sort() : habit.history.filter((d) => d !== day),
    counts: target > 1 ? { ...(habit.counts ?? {}), [day]: done ? target : 0 } : habit.counts,
  });
}

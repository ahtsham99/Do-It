import { todayKey, type DayKey } from '@/lib/dates';
import { uid } from '@/lib/id';

import { markActive } from './stats';
import { setState } from '../store';
import type { Habit } from '../types';

export type HabitInput = Pick<Habit, 'name' | 'icon' | 'color' | 'frequency' | 'timesPerWeek'>;

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

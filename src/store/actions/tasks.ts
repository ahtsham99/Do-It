import { todayKey, type DayKey } from '@/lib/dates';
import { uid } from '@/lib/id';

import { addDays } from '@/lib/dates';

import { markActive, markPlanned } from './stats';
import { setState } from '../store';
import type { Task } from '../types';

export type TaskInput = Pick<Task, 'title' | 'date' | 'repeat' | 'reminder'> &
  Partial<Pick<Task, 'notes' | 'time'>>;

export function addTask(input: TaskInput): Task {
  const now = Date.now();
  const task: Task = {
    id: uid('t_'),
    createdAt: now,
    updatedAt: now,
    completedDates: [],
    ...input,
  };
  setState((s) => ({ tasks: [...s.tasks, task] }));
  // Planning today or tomorrow counts as showing up.
  const t = todayKey();
  if (task.date === t || task.date === addDays(t, 1)) markPlanned(t);
  return task;
}

export function updateTask(id: string, patch: Partial<Task>) {
  setState((s) => ({
    tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t)),
  }));
}

/** Soft delete so a future sync layer can propagate it. */
export function deleteTask(id: string) {
  updateTask(id, { deletedAt: Date.now() });
}

/** Remove just one occurrence of a repeating task. */
export function skipOccurrence(task: Task, day: DayKey) {
  updateTask(task.id, { skippedDates: [...(task.skippedDates ?? []), day] });
}

export function toggleTask(task: Task, day: DayKey) {
  const key = task.repeat === 'none' ? task.date : day;
  const done = task.completedDates.includes(key);
  updateTask(task.id, {
    completedDates: done ? task.completedDates.filter((d) => d !== key) : [...task.completedDates, key],
    snoozedUntil: null,
  });
  if (!done) markActive(todayKey());
  return !done;
}

/** "Do it today": move an overdue one-off task to today. */
export function moveToToday(ids: string[]) {
  const t = todayKey();
  const set = new Set(ids);
  setState((s) => ({
    tasks: s.tasks.map((x) =>
      set.has(x.id) && x.repeat === 'none' ? { ...x, date: t, time: null, updatedAt: Date.now() } : x,
    ),
  }));
}

/** "Remind me later": hide the reminder now and bring it back after `minutes`. */
export function snoozeTask(id: string, minutes: number) {
  updateTask(id, { snoozedUntil: Date.now() + minutes * 60_000 });
}

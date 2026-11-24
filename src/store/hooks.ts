import { useMemo } from 'react';

import { useStore } from './store';

/** Live (non-deleted) collections. */
export function useTasks() {
  const tasks = useStore((s) => s.tasks);
  return useMemo(() => tasks.filter((t) => !t.deletedAt), [tasks]);
}

export function useHabits() {
  const habits = useStore((s) => s.habits);
  return useMemo(() => habits.filter((h) => !h.deletedAt && !h.archived), [habits]);
}

export function useCountdowns() {
  const countdowns = useStore((s) => s.countdowns);
  return useMemo(() => countdowns.filter((c) => !c.deletedAt), [countdowns]);
}

export function useSettings() {
  return useStore((s) => s.settings);
}

export function useGoals() {
  const goals = useStore((s) => s.goals);
  return useMemo(() => goals.filter((g) => !g.deletedAt), [goals]);
}

export function useLists() {
  const lists = useStore((s) => s.lists);
  return useMemo(() => lists.filter((l) => !l.deletedAt), [lists]);
}

export function useReminders() {
  const items = useStore((s) => s.reminders);
  return useMemo(() => items.filter((r) => !r.deletedAt), [items]);
}

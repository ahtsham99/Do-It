import { todayKey } from '@/lib/dates';
import { uid } from '@/lib/id';

import { markActive } from './stats';
import { getState, setState } from '../store';
import type { Goal, GoalStep } from '../types';

export type GoalInput = Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'completedAt'>;

const progressOf = (g: Goal) =>
  g.kind === 'number'
    ? (g.target ?? 0) > 0 && (g.current ?? 0) >= (g.target ?? 0)
    : g.steps.length > 0 && g.steps.every((s) => s.doneAt);

/** Sets/clears completedAt to match progress. Returns true if it just became achieved. */
function settle(g: Goal): { goal: Goal; justAchieved: boolean } {
  const full = progressOf(g);
  if (full && !g.completedAt) return { goal: { ...g, completedAt: Date.now() }, justAchieved: true };
  if (!full && g.completedAt) return { goal: { ...g, completedAt: null }, justAchieved: false };
  return { goal: g, justAchieved: false };
}

export function addGoal(input: GoalInput): Goal {
  const now = Date.now();
  const goal = settle({ ...input, id: uid('g_'), createdAt: now, updatedAt: now }).goal;
  setState((s) => ({ goals: [...s.goals, goal] }));
  return goal;
}

/** Updates a goal; returns true if this change completed it. */
export function updateGoal(id: string, patch: Partial<Goal>): boolean {
  let achieved = false;
  setState((s) => ({
    goals: s.goals.map((g) => {
      if (g.id !== id) return g;
      const r = settle({ ...g, ...patch, updatedAt: Date.now() });
      achieved = r.justAchieved;
      return r.goal;
    }),
  }));
  return achieved;
}

/** Deletes a goal and unlinks its habits. Returns the unlinked habit ids (for undo). */
export function deleteGoal(id: string): string[] {
  const linked = getState().habits.filter((h) => h.goalId === id).map((h) => h.id);
  updateGoal(id, { deletedAt: Date.now() });
  // Unlink habits so they don't point at a deleted goal.
  setState((s) => ({ habits: s.habits.map((h) => (h.goalId === id ? { ...h, goalId: null, updatedAt: Date.now() } : h)) }));
  return linked;
}

/** Undo a delete, relinking any habits that were linked. */
export function restoreGoal(id: string, habitIds: string[] = []) {
  updateGoal(id, { deletedAt: null });
  const set = new Set(habitIds);
  setState((s) => ({ habits: s.habits.map((h) => (set.has(h.id) ? { ...h, goalId: id, updatedAt: Date.now() } : h)) }));
}

const find = (id: string) => getState().goals.find((g) => g.id === id);

export function toggleStep(goalId: string, stepId: string): boolean {
  const g = find(goalId);
  if (!g) return false;
  let nowDone = false;
  const steps = g.steps.map((s) => {
    if (s.id !== stepId) return s;
    nowDone = !s.doneAt;
    return { ...s, doneAt: s.doneAt ? null : Date.now() };
  });
  if (nowDone) markActive(todayKey());
  return updateGoal(goalId, { steps });
}

export function addStep(goalId: string, title: string) {
  const g = find(goalId);
  if (!g || !title.trim()) return;
  const step: GoalStep = { id: uid('s_'), title: title.trim(), doneAt: null };
  updateGoal(goalId, { steps: [...g.steps, step] });
}

export function removeStep(goalId: string, stepId: string) {
  const g = find(goalId);
  if (!g) return;
  updateGoal(goalId, { steps: g.steps.filter((s) => s.id !== stepId) });
}

/** Number goals: add (or subtract) progress. Returns true if it completed the goal. */
export function logProgress(goalId: string, delta: number): boolean {
  const g = find(goalId);
  if (!g) return false;
  const current = Math.max(0, Math.round(((g.current ?? 0) + delta) * 100) / 100);
  if (delta > 0) markActive(todayKey());
  return updateGoal(goalId, { current });
}

export function linkHabit(habitId: string, goalId: string | null) {
  setState((s) => ({ habits: s.habits.map((h) => (h.id === habitId ? { ...h, goalId, updatedAt: Date.now() } : h)) }));
}

export const newStep = (title: string): GoalStep => ({ id: uid('s_'), title: title.trim(), doneAt: null });

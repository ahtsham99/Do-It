import { diffDays, todayKey } from '@/lib/dates';
import type { Goal, GoalKind } from '@/store/types';

export const GOAL_ICONS = [
  '🎯', '🏃', '📚', '💰', '🧠', '💪', '🥗', '✈️',
  '🎓', '💼', '🎨', '🎸', '🧘', '🏠', '❤️', '🌱',
  '✍️', '💻', '🗣️', '🚭', '😴', '🧹', '📸', '🏆',
];

/** Steps goal with no steps: nothing to measure, so no %, no bar; finished by hand. */
export const isSimple = (g: Pick<Goal, 'kind' | 'steps'>) => g.kind === 'steps' && g.steps.length === 0;

/** Share done, 0–1. */
export function goalProgress(g: Goal): number {
  if (isSimple(g)) return g.completedAt ? 1 : 0;
  if (g.kind === 'number') {
    const t = g.target ?? 0;
    return t > 0 ? Math.min(1, Math.max(0, (g.current ?? 0) / t)) : 0;
  }
  if (g.steps.length === 0) return 0;
  return g.steps.filter((s) => s.doneAt).length / g.steps.length;
}

export const isAchieved = (g: Goal) => !!g.completedAt;

export function nextStep(g: Goal) {
  return g.kind === 'steps' ? g.steps.find((s) => !s.doneAt) ?? null : null;
}

/** One-line status for cards. */
export function goalStatus(g: Goal): string {
  if (g.completedAt) return 'Achieved';
  if (g.kind === 'number') {
    const unit = g.unit?.trim() ? ` ${g.unit.trim()}` : '';
    return `${g.current ?? 0} of ${g.target ?? 0}${unit}`;
  }
  const next = nextStep(g);
  if (next) return `Next: ${next.title}`;
  return g.steps.length ? 'All steps done' : g.why?.trim() ? `“${g.why.trim()}”` : 'In progress';
}

export function daysLeftLabel(g: Goal, today = todayKey()): string | null {
  if (!g.targetDate || g.completedAt) return null;
  const d = diffDays(today, g.targetDate);
  if (d === 0) return 'Due today';
  if (d === 1) return '1 day left';
  if (d > 0) return `${d} days left`;
  return `${-d} day${d === -1 ? '' : 's'} past target`;
}

export interface GoalTemplate {
  title: string;
  icon: string;
  kind: GoalKind;
  steps?: string[];
  target?: number;
  unit?: string;
  why?: string;
}

/** Quick starts for the empty state. Steps are deliberately tiny. */
export const GOAL_TEMPLATES: GoalTemplate[] = [
  { title: 'Run a 5K', icon: '🏃', kind: 'steps', steps: ['Walk for 20 minutes', 'Run 1 minute, walk 2 — five times', 'Run 10 minutes without stopping', 'Run 3K', 'Run 5K'] },
  { title: 'Read 12 books this year', icon: '📚', kind: 'number', target: 12, unit: 'books' },
  { title: 'Save £500', icon: '💰', kind: 'number', target: 500, unit: '£' },
  { title: 'Finish my project', icon: '💼', kind: 'steps', steps: ['Write down what “finished” means', 'List the parts that are left', 'Do the smallest part', 'Ask someone to review it'] },
  { title: 'Cook 10 new meals', icon: '🥗', kind: 'number', target: 10, unit: 'meals' },
  { title: 'Sleep before midnight', icon: '😴', kind: 'steps', steps: ['Set a bedtime alarm at 11pm', 'Phone out of the bedroom', 'Do it 5 nights in a row'] },
];

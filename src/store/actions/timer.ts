import { todayKey } from '@/lib/dates';
import { uid } from '@/lib/id';

import { toggleHabit } from './habits';
import { markActive } from './stats';
import { getState, setState } from '../store';
import { DEFAULT_TIMER, type TimerMode, type TimerState } from '../types';

export interface StartTimerInput {
  minutes: number;
  mode?: TimerMode;
  label?: string;
  taskId?: string | null;
  habitId?: string | null;
}

/** Seconds left on the timer right now. */
export function remainingSec(t: TimerState, now = Date.now()) {
  if (t.status === 'running' && t.endsAt) return Math.max(0, Math.round((t.endsAt - now) / 1000));
  if (t.status === 'paused') return t.remainingSec;
  return t.durationSec;
}

export function startTimer({ minutes, mode = 'focus', label = '', taskId = null, habitId = null }: StartTimerInput) {
  const durationSec = Math.round(minutes * 60);
  const now = Date.now();
  setState(() => ({
    timer: {
      status: 'running',
      mode,
      durationSec,
      endsAt: now + durationSec * 1000,
      remainingSec: durationSec,
      startedAt: now,
      label,
      taskId,
      habitId,
    },
  }));
}

export function pauseTimer() {
  const t = getState().timer;
  if (t.status !== 'running') return;
  setState(() => ({ timer: { ...t, status: 'paused', remainingSec: remainingSec(t), endsAt: null } }));
}

export function resumeTimer() {
  const t = getState().timer;
  if (t.status !== 'paused') return;
  setState(() => ({ timer: { ...t, status: 'running', endsAt: Date.now() + t.remainingSec * 1000 } }));
}

export function addMinutes(min: number) {
  const t = getState().timer;
  const add = min * 60;
  if (t.status === 'running' && t.endsAt) {
    setState(() => ({ timer: { ...t, durationSec: t.durationSec + add, endsAt: t.endsAt! + add * 1000 } }));
  } else if (t.status === 'paused') {
    setState(() => ({ timer: { ...t, durationSec: t.durationSec + add, remainingSec: t.remainingSec + add } }));
  }
}

function record(t: TimerState, completed: boolean) {
  const focusedSec = t.durationSec - remainingSec(t);
  const minutes = Math.round(focusedSec / 60);
  // Ignore sessions abandoned within the first minute.
  if (!completed && minutes < 1) return;
  const now = Date.now();
  setState((s) => ({
    sessions: [
      ...s.sessions,
      {
        id: uid('f_'),
        createdAt: now,
        updatedAt: now,
        mode: t.mode,
        label: t.label,
        plannedMin: Math.round(t.durationSec / 60),
        minutes: completed ? Math.round(t.durationSec / 60) : minutes,
        completed,
        day: todayKey(),
        taskId: t.taskId ?? null,
        habitId: t.habitId ?? null,
      },
    ].slice(-500),
  }));
}

/** Give up early. Partial focus time still counts in your history. */
export function stopTimer() {
  const t = getState().timer;
  if (t.status === 'idle') return;
  if (t.mode === 'focus') record(t, false);
  setState(() => ({ timer: { ...DEFAULT_TIMER, durationSec: t.durationSec, remainingSec: t.durationSec, mode: 'focus' } }));
}

/**
 * Called when the end time passes. Records the session, ticks a linked habit,
 * counts toward the streak, and returns what just finished.
 */
export function completeTimer(): TimerState | null {
  const t = getState().timer;
  if (t.status !== 'running') return null;
  if (t.mode === 'focus') {
    record(t, true);
    markActive(todayKey());
    const habit = t.habitId ? getState().habits.find((h) => h.id === t.habitId && !h.deletedAt) : null;
    if (habit && !habit.history.includes(todayKey())) toggleHabit(habit, todayKey());
  }
  setState(() => ({ timer: { ...t, status: 'idle', endsAt: null, remainingSec: 0 } }));
  return t;
}

/** Return to a clean, ready-to-start timer. */
export function resetTimer(minutes?: number) {
  const sec = Math.round((minutes ?? getState().settings.focusMinutes) * 60);
  setState(() => ({ timer: { ...DEFAULT_TIMER, durationSec: sec, remainingSec: sec } }));
}

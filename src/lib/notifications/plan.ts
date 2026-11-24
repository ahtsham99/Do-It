import { pick } from '@/features/nudges/messages';
import { isDone, occurrencesOn, occursOn } from '@/features/tasks/logic';
import { addDays, combine, diffDays, formatTime, fromKey, todayKey } from '@/lib/dates';
import type { AppState } from '@/store/types';

export interface PlannedNotification {
  id: string;
  date: Date;
  title: string;
  body: string;
  url?: string;
}

const MAX = 60; // timer and snoozes are added first so they always fit // iOS keeps at most 64 pending local notifications.

/**
 * Pure function: decides which local notifications should exist for the next
 * week. Platform code just cancels everything and schedules this list.
 */
export function planNotifications(state: AppState, now = new Date()): PlannedNotification[] {
  const { settings, tasks: all, stats } = state;
  const tasks = all.filter((t) => !t.deletedAt);
  const today = todayKey();
  const out: PlannedNotification[] = [];

  for (let i = 0; i < 7; i++) {
    const day = addDays(today, i);
    const count = occurrencesOn(tasks, day).length;

    // Morning: plan your day.
    const morning = combine(day, settings.dailyPromptTime);
    if (morning > now && !(i === 0 && stats.plannedDays.includes(day))) {
      out.push({
        id: `plan-${day}`,
        date: morning,
        title: count ? `Plan your day · ${count} task${count === 1 ? '' : 's'} waiting` : 'Plan your day',
        body: pick('planPrompt', settings.tone, day),
        url: '/plan',
      });
    }

    // Evening: unfinished check.
    const evening = combine(day, settings.eveningCheckTime);
    if (evening > now) {
      const open = occurrencesOn(tasks, day).filter((o) => !o.done).length;
      if (i > 0 || open > 0) {
        out.push({
          id: `evening-${day}`,
          date: evening,
          title: i === 0 ? `${open} task${open === 1 ? '' : 's'} still open today` : 'How did today go?',
          body: pick('unfinished', settings.tone, day),
          url: '/',
        });
      }
    }
  }

  // The focus timer, if one is running.
  const { timer } = state;
  if (timer.status === 'running' && timer.endsAt && timer.endsAt > now.getTime()) {
    out.push({
      id: 'timer',
      date: new Date(timer.endsAt),
      title: timer.mode === 'focus' ? 'Focus session complete' : 'Break’s over',
      body:
        timer.mode === 'focus'
          ? `${timer.label ? `${timer.label}: ` : ''}nicely done. Take a short break, or keep going.`
          : 'Ready for another round?',
      url: '/focus',
    });
  }

  // Goals: a weekly check-in on the first day of the week, and a nudge the day before a target date.
  const goals = state.goals.filter((g) => !g.deletedAt && !g.completedAt);
  if (goals.length) {
    for (let i = 0; i < 7; i++) {
      const day = addDays(today, i);
      if (fromKey(day).getDay() !== settings.weekStartsOn) continue;
      const at = combine(day, settings.dailyPromptTime);
      at.setMinutes(at.getMinutes() + 5);
      if (at <= now) continue;
      const g = goals[0];
      const next = g.kind === 'steps' ? g.steps.find((s) => !s.doneAt)?.title : null;
      out.push({
        id: `goals-${day}`,
        date: at,
        title: `This week: ${g.title}`,
        body: next ? `Next small step: ${next}.` : 'A little progress this week is enough.',
        url: `/goal?id=${g.id}`,
      });
    }
    for (const g of goals) {
      if (!g.targetDate) continue;
      const at = combine(addDays(g.targetDate, -1), settings.dailyPromptTime);
      if (at > now && diffDays(today, g.targetDate) <= 14) {
        out.push({ id: `goal-due-${g.id}`, date: at, title: `Tomorrow: ${g.title}`, body: 'Your target date is tomorrow. One more step today?', url: `/goal?id=${g.id}` });
      }
    }
  }

  // Things to remember (Reminders tab) with an alert time.
  for (const r of state.reminders) {
    if (r.deletedAt || r.done) continue;
    const at = r.snoozedUntil && r.snoozedUntil > now.getTime() ? r.snoozedUntil : r.remindAt;
    if (!at || at <= now.getTime()) continue;
    out.push({ id: `rem-${r.id}`, date: new Date(at), title: r.title, body: `${pick('reminder', settings.tone, r.id)} you asked to remember this.`, url: `/reminder?id=${r.id}` });
  }

  // Snoozed plan items.
  for (const task of tasks) {
    if (task.snoozedUntil && task.snoozedUntil > now.getTime()) {
      out.push({
        id: `snooze-${task.id}`,
        date: new Date(task.snoozedUntil),
        title: task.title,
        body: `${pick('reminder', settings.tone, task.id)} you asked to be reminded again.`,
        url: `/task?id=${task.id}`,
      });
    }
  }

  // Task reminders over the next 14 days.
  for (let i = 0; i < 14 && out.length < MAX; i++) {
    const day = addDays(today, i);
    for (const task of tasks) {
      if (task.reminder == null || !occursOn(task, day) || isDone(task, day)) continue;
      const at = new Date(combine(day, task.time ?? '09:00').getTime() - task.reminder * 60_000);
      if (at <= now) continue;
      if (task.snoozedUntil && i === 0 && task.snoozedUntil > now.getTime()) continue;
      out.push({
        id: `task-${task.id}-${day}`,
        date: at,
        title: task.title,
        body: task.time
          ? `${task.reminder === 0 ? 'Now' : `At ${formatTime(task.time, settings.use24h)}`} · ${pick('reminder', settings.tone, task.id)} worth doing now.`
          : `${pick('reminder', settings.tone, task.id)} this is on today’s list.`,
        url: `/task?id=${task.id}&day=${day}`,
      });
      if (out.length >= MAX) break;
    }
  }

  return out.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, MAX);
}

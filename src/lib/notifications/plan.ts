import { pick } from '@/features/nudges/messages';
import { isDone, occurrencesOn, occursOn } from '@/features/tasks/logic';
import { addDays, combine, formatTime, todayKey } from '@/lib/dates';
import type { AppState } from '@/store/types';

export interface PlannedNotification {
  id: string;
  date: Date;
  title: string;
  body: string;
  url?: string;
}

const MAX = 60; // iOS keeps at most 64 pending local notifications.

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

  // Task reminders over the next 14 days.
  for (let i = 0; i < 14 && out.length < MAX; i++) {
    const day = addDays(today, i);
    for (const task of tasks) {
      if (task.reminder == null || !occursOn(task, day) || isDone(task, day)) continue;
      const at = new Date(combine(day, task.time ?? '09:00').getTime() - task.reminder * 60_000);
      if (at <= now) continue;
      out.push({
        id: `task-${task.id}-${day}`,
        date: at,
        title: task.title,
        body: task.time
          ? `${task.reminder === 0 ? 'Now' : `At ${formatTime(task.time, settings.use24h)}`} · ${pick('reminder', settings.tone, task.id)} don’t let this slide.`
          : `${pick('reminder', settings.tone, task.id)} this is on today’s list.`,
        url: `/task?id=${task.id}&day=${day}`,
      });
      if (out.length >= MAX) break;
    }
  }

  return out.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, MAX);
}

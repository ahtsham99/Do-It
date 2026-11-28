import { isDueToday } from '@/features/habits/logic';
import { pick, titleFor } from '@/features/nudges/messages';
import { isDone, occurrencesOn, occursOn } from '@/features/tasks/logic';
import { addDays, combine, diffDays, formatTime, fromKey, todayKey } from '@/lib/dates';
import { currentStreak } from '@/store/actions/stats';
import type { AppState } from '@/store/types';

export interface PlannedNotification {
  id: string;
  date: Date;
  title: string;
  body: string;
  url?: string;
}

/** "2 plans today, 2 overdue." */
function summary(planned: number, overdue: number) {
  const bits = [planned ? `${planned} plan${planned === 1 ? '' : 's'} today` : null, overdue ? `${overdue} overdue` : null].filter(Boolean);
  return bits.length ? `${bits.join(', ')}.` : '';
}

const MAX = 60; // timer and snoozes are added first so they always fit // iOS keeps at most 64 pending local notifications.

/**
 * Pure function: decides which local notifications should exist for the next
 * week. Platform code just cancels everything and schedules this list.
 */
export function planNotifications(state: AppState, now = new Date()): PlannedNotification[] {
  const { settings, tasks: all, stats } = state;
  const tasks = all.filter((t) => !t.deletedAt);
  const habits = state.habits.filter((h) => !h.deletedAt && !h.archived);
  const today = todayKey();
  const tone = settings.tone;
  const name = settings.name;
  const out: PlannedNotification[] = [];
  // Overdue: plans from before today that are still open (shown in today's morning title).
  const overdue = (() => {
    let n = 0;
    for (let d = 1; d <= 14; d++) n += occurrencesOn(tasks, addDays(today, -d)).filter((o) => !o.done && o.task.repeat === 'none').length;
    return n;
  })();

  for (let i = 0; i < 7; i++) {
    const day = addDays(today, i);
    const planned = occurrencesOn(tasks, day);

    // Morning: plan your day.
    const morning = combine(day, settings.dailyPromptTime);
    if (morning > now && !(i === 0 && stats.plannedDays.includes(day))) {
      out.push({
        id: `plan-${day}`,
        date: morning,
        title: titleFor('plan', tone, { name }),
        body: [summary(planned.length, i === 0 ? overdue : 0), pick(i === 0 && overdue ? 'overdue' : 'planPrompt', tone, day)].filter(Boolean).join(' '),
        url: '/',
      });
    }

    // Evening: what's left (plans and habits), or a quick review.
    const evening = combine(day, settings.eveningCheckTime);
    if (evening > now) {
      const openPlans = planned.filter((o) => !o.done).length;
      const openHabits = i === 0 ? habits.filter((h) => isDueToday(h, day, settings.weekStartsOn)).length : 0;
      const left = openPlans + openHabits;
      out.push(
        i === 0 && left > 0
          ? { id: `evening-${day}`, date: evening, title: titleFor('evening', tone, { n: left }), body: pick('unfinished', tone, day), url: '/' }
          : { id: `evening-${day}`, date: evening, title: titleFor('review', tone, { name }), body: pick('eveningReview', tone, day), url: '/' },
      );
    }
  }

  // Streak at risk: an hour before bedtime-ish, if you haven't shown up today.
  const streak = currentStreak(stats.activeDays, today);
  if (streak >= 2 && !stats.activeDays.includes(today)) {
    const at = combine(today, '21:30');
    if (at > now) out.push({ id: `streak-${today}`, date: at, title: titleFor('streak', tone, { streak }), body: pick('streakRisk', tone, today), url: '/' });
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
          ? `${timer.label ? `${timer.label} · ` : ''}${pick('focusDone', settings.tone, timer.endsAt)}`
          : pick('breakDone', settings.tone, timer.endsAt),
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
        body: next ? `Next small step: ${next}.` : pick('goalWeek', settings.tone, day),
        url: `/goal?id=${g.id}`,
      });
    }
    for (const g of goals) {
      if (!g.targetDate) continue;
      const at = combine(addDays(g.targetDate, -1), settings.dailyPromptTime);
      if (at > now && diffDays(today, g.targetDate) <= 14) {
        out.push({ id: `goal-due-${g.id}`, date: at, title: `Tomorrow: ${g.title}`, body: pick('goalDue', settings.tone, g.id), url: `/goal?id=${g.id}` });
      }
    }
  }

  // Things to remember (Reminders tab) with an alert time.
  for (const r of state.reminders) {
    if (r.deletedAt || r.done) continue;
    const at = r.snoozedUntil && r.snoozedUntil > now.getTime() ? r.snoozedUntil : r.remindAt;
    if (!at || at <= now.getTime()) continue;
    out.push({ id: `rem-${r.id}`, date: new Date(at), title: r.title, body: pick('remindAsked', settings.tone, r.id), url: `/reminder?id=${r.id}` });
  }

  // Snoozed plan items.
  for (const task of tasks) {
    if (task.snoozedUntil && task.snoozedUntil > now.getTime()) {
      out.push({
        id: `snooze-${task.id}`,
        date: new Date(task.snoozedUntil),
        title: task.title,
        body: pick('remindAgain', settings.tone, task.id),
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
          ? task.reminder === 0
            ? pick('remindNow', settings.tone, task.id)
            : settings.tone === 'savage'
              ? `At ${formatTime(task.time, settings.use24h)}. ${pick('remindSoon', settings.tone, task.id)}`
              : `Coming up at ${formatTime(task.time, settings.use24h)}.`
          : pick('remindToday', settings.tone, task.id),
        url: `/task?id=${task.id}&day=${day}`,
      });
      if (out.length >= MAX) break;
    }
  }

  return out.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, MAX);
}

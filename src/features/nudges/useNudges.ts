import { useMemo } from 'react';

import { isDone, occurrencesOn, overdue, type Occurrence } from '@/features/tasks/logic';
import { combine, timeFromDate, toKey } from '@/lib/dates';
import { currentStreak } from '@/store/actions/stats';
import { useSettings, useTasks } from '@/store/hooks';
import { useStore } from '@/store/store';

import { useNow } from './useNow';

export interface NudgeState {
  today: string;
  now: Date;
  todays: Occurrence[];
  open: Occurrence[];
  overdue: Occurrence[];
  /** Reminders whose time has come today (web fallback for notifications). */
  dueReminders: Occurrence[];
  planned: boolean;
  streak: number;
  bestStreak: number;
  activeToday: boolean;
  evening: boolean;
  streakAtRisk: boolean;
}

export function useNudges(): NudgeState {
  const now = useNow();
  const tasks = useTasks();
  const stats = useStore((s) => s.stats);
  const { eveningCheckTime } = useSettings();

  return useMemo(() => {
    const today = toKey(now);
    const time = timeFromDate(now);
    const todays = occurrencesOn(tasks, today);
    const open = todays.filter((o) => !o.done);
    const late = overdue(tasks, today, time);
    const nowMs = now.getTime();
    const dueReminders = open.filter((o) => {
      if (isDone(o.task, today)) return false;
      const snooze = o.task.snoozedUntil;
      // Snoozed: hidden until the snooze ends, then it comes back even without a reminder set.
      if (snooze && snooze > nowMs) return false;
      if (snooze && toKey(new Date(snooze)) === today) return true;
      if (o.task.reminder == null) return false;
      const at = combine(today, o.task.time ?? '09:00').getTime() - o.task.reminder * 60_000;
      return at <= nowMs;
    });
    const activeToday = stats.activeDays.includes(today);
    const streak = currentStreak(stats.activeDays, today);
    const evening = time >= eveningCheckTime;
    return {
      today,
      now,
      todays,
      open,
      overdue: late,
      dueReminders,
      planned: stats.plannedDays.includes(today),
      streak,
      bestStreak: Math.max(stats.bestStreak, streak),
      activeToday,
      evening,
      streakAtRisk: streak > 0 && !activeToday && time >= '18:00',
    };
  }, [now, tasks, stats, eveningCheckTime]);
}

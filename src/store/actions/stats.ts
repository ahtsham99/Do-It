import { addDays, todayKey, type DayKey } from '@/lib/dates';

import { getState, setState } from '../store';

export function markActive(day: DayKey = todayKey()) {
  const { stats } = getState();
  if (stats.activeDays.includes(day)) return;
  const activeDays = [...stats.activeDays, day].sort().slice(-400);
  const streak = currentStreak(activeDays, day);
  setState(() => ({ stats: { ...stats, activeDays, bestStreak: Math.max(stats.bestStreak, streak) } }));
}

export function markPlanned(day: DayKey = todayKey()) {
  const { stats } = getState();
  if (!stats.plannedDays.includes(day)) {
    setState(() => ({ stats: { ...stats, plannedDays: [...stats.plannedDays, day].slice(-400) } }));
  }
  markActive(day);
}

/** Consecutive active days ending today (or yesterday, if today isn't done yet). */
export function currentStreak(activeDays: DayKey[], today: DayKey = todayKey()): number {
  const set = new Set(activeDays);
  let d = set.has(today) ? today : addDays(today, -1);
  let n = 0;
  while (set.has(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

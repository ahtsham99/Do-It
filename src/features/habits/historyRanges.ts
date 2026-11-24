import { diffDays, toKey } from '@/lib/dates';
import type { Habit } from '@/store/types';

export const HISTORY_RANGES = [
  { id: '1W', weeks: 1, title: 'This week' },
  { id: '1M', weeks: 5, title: 'Last month' },
  { id: '3M', weeks: 13, title: 'Last 3 months' },
  { id: '6M', weeks: 26, title: 'Last 6 months' },
  { id: '1Y', weeks: 52, title: 'Last year' },
  { id: 'Max', weeks: 0, title: 'Since you started' },
] as const;

export type HistoryRange = (typeof HISTORY_RANGES)[number]['id'];

/** Weeks back to the first check-in (or habit creation), for Max. */
export function maxWeeksFor(habits: Habit[], today: string) {
  const firsts = habits.flatMap((h) => [h.history.length ? [...h.history].sort()[0] : today, toKey(new Date(h.createdAt))]);
  const first = firsts.filter((d) => d > '2000').sort()[0] ?? today;
  // Under a month of history still uses the 1M layout, so it doesn't look cramped.
  return Math.max(5, Math.ceil((diffDays(first, today) + 1) / 7) + 1);
}

export function weeksFor(r: HistoryRange, habits: Habit[], today: string) {
  return r === 'Max' ? maxWeeksFor(habits, today) : HISTORY_RANGES.find((x) => x.id === r)!.weeks;
}

import type { IconName } from '@/components/ui';
import { diffDays, todayKey } from '@/lib/dates';
import type { Countdown } from '@/store/types';

export const DEFAULT_CATEGORIES = ['Exams', 'Appointments', 'Holidays', 'Birthdays', 'Deadlines', 'Events'];

export const CATEGORY_DEFAULTS: Record<string, { icon: IconName; color: string }> = {
  Exams: { icon: 'school', color: '#E8613C' },
  Appointments: { icon: 'medkit', color: '#3FA3A0' },
  Holidays: { icon: 'airplane', color: '#D9A441' },
  Birthdays: { icon: 'gift', color: '#D9677F' },
  Deadlines: { icon: 'flag', color: '#8E6BBF' },
  Events: { icon: 'sparkles', color: '#5B8DEF' },
};

export const COUNTDOWN_ICONS: IconName[] = [
  'school', 'book', 'flask', 'calculator', 'medkit', 'fitness', 'airplane', 'car',
  'train', 'boat', 'gift', 'heart', 'balloon', 'musical-notes', 'ticket', 'film',
  'trophy', 'football', 'basketball', 'bicycle', 'briefcase', 'flag', 'rocket', 'home',
  'paw', 'restaurant', 'cafe', 'sunny', 'snow', 'leaf', 'star', 'sparkles',
];

/** Positive = days left, negative = days ago, 0 = today. */
export function daysUntil(c: Countdown, today = todayKey()) {
  return diffDays(today, c.date);
}

export function countdownLabel(days: number) {
  if (days === 0) return { big: 'Today', small: '' };
  if (days === 1) return { big: '1', small: 'day left' };
  if (days > 0) return { big: String(days), small: 'days left' };
  if (days === -1) return { big: '1', small: 'day ago' };
  return { big: String(-days), small: 'days ago' };
}

export interface CountdownGroup {
  category: string;
  items: Countdown[];
}

/**
 * Group by category. Sections are ordered by their soonest upcoming event;
 * inside a section upcoming events come first (soonest first), then past ones.
 */
export function groupCountdowns(items: Countdown[], today = todayKey()): CountdownGroup[] {
  const map = new Map<string, Countdown[]>();
  for (const c of items) map.set(c.category, [...(map.get(c.category) ?? []), c]);
  const groups = [...map.entries()].map(([category, list]) => {
    const upcoming = list.filter((c) => c.date >= today).sort((a, b) => (a.date < b.date ? -1 : 1));
    const past = list.filter((c) => c.date < today).sort((a, b) => (a.date > b.date ? -1 : 1));
    return { category, items: [...upcoming, ...past], next: upcoming[0]?.date ?? '9999' };
  });
  groups.sort((a, b) => (a.next < b.next ? -1 : a.next > b.next ? 1 : a.category.localeCompare(b.category)));
  return groups.map(({ category, items }) => ({ category, items }));
}

import { diffDays, todayKey } from '@/lib/dates';
import type { Countdown } from '@/store/types';

export const DEFAULT_CATEGORIES = ['Exams', 'Appointments', 'Holidays', 'Birthdays', 'Deadlines', 'Events'];

export const CATEGORY_DEFAULTS: Record<string, { icon: string; color: string }> = {
  Exams: { icon: '🎓', color: '#2F4F40' },
  Appointments: { icon: '🩺', color: '#3F7C7A' },
  Holidays: { icon: '✈️', color: '#B5873A' },
  Birthdays: { icon: '🎂', color: '#A8554B' },
  Deadlines: { icon: '🚩', color: '#7A5C8E' },
  Events: { icon: '✨', color: '#4A6B8A' },
};

export const COUNTDOWN_ICONS = [
  '🎓', '📚', '🧪', '📝', '🩺', '🦷', '✈️', '🚗',
  '🏖️', '🏔️', '🎂', '🎁', '❤️', '💍', '🎉', '🎵',
  '🎟️', '🎬', '🏆', '⚽', '🏀', '🚴', '💼', '🚩',
  '🚀', '🏠', '🐾', '🍽️', '☀️', '❄️', '⭐', '✨',
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

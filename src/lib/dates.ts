import { currentLanguage, locale, t } from '@/lib/i18n';
/**
 * Date helpers. All "day" values in the app are local calendar days stored as
 * ISO-like keys `YYYY-MM-DD` so they are timezone-safe and easy to sync later.
 */
export type DayKey = string; // YYYY-MM-DD
export type TimeKey = string; // HH:mm (24h)

const pad = (n: number) => String(n).padStart(2, '0');

export function toKey(d: Date): DayKey {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromKey(key: DayKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): DayKey {
  return toKey(new Date());
}

export function addDays(key: DayKey, n: number): DayKey {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return toKey(d);
}

export function addMonths(key: DayKey, n: number): DayKey {
  const d = fromKey(key);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return toKey(d);
}

/** Whole days from a to b (b - a). */
export function diffDays(a: DayKey, b: DayKey): number {
  const ms = fromKey(b).getTime() - fromKey(a).getTime();
  return Math.round(ms / 86_400_000);
}

export function weekday(key: DayKey): number {
  return fromKey(key).getDay();
}

export function startOfWeek(key: DayKey, weekStartsOn: 0 | 1 = 1): DayKey {
  const wd = weekday(key);
  const delta = (wd - weekStartsOn + 7) % 7;
  return addDays(key, -delta);
}

export function startOfMonth(key: DayKey): DayKey {
  return key.slice(0, 8) + '01';
}

export function daysInMonth(key: DayKey): number {
  const d = fromKey(key);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

/** 6x7 grid of day keys covering the month of `key`. */
export function monthGrid(key: DayKey, weekStartsOn: 0 | 1 = 1): DayKey[] {
  const first = startOfWeek(startOfMonth(key), weekStartsOn);
  return Array.from({ length: 42 }, (_, i) => addDays(first, i));
}

export function range(start: DayKey, count: number): DayKey[] {
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}

export function nowTime(): TimeKey {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function combine(day: DayKey, time: TimeKey = '00:00'): Date {
  const d = fromKey(day);
  const [h, m] = time.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

export function timeFromDate(d: Date): TimeKey {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Names come from Intl in the app's language (see src/lib/i18n).
const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale(), o).format(d);

export function weekdayShort(key: DayKey) {
  return fmt(fromKey(key), { weekday: 'short' }).replace(/\.$/, '');
}
/** One-letter weekday headers, starting on the first day of the week. */
export function weekdayLetters(weekStartsOn: 0 | 1 = 1) {
  // 2024-01-07 was a Sunday.
  const letters = Array.from({ length: 7 }, (_, i) => fmt(new Date(2024, 0, 7 + i), { weekday: 'narrow' }));
  return weekStartsOn === 1 ? [...letters.slice(1), letters[0]] : letters;
}
export function monthName(key: DayKey) {
  return fmt(fromKey(key), { month: 'long' });
}

export function formatTime(t?: TimeKey | null, use24h = false): string {
  if (!t) return '';
  if (use24h) return t;
  const [h, m] = t.split(':').map(Number);
  if (currentLanguage() !== 'en') return fmt(new Date(2024, 0, 1, h, m), { hour: 'numeric', minute: '2-digit', hour12: true });
  const suffix = h >= 12 ? 'pm' : 'am';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hh}${suffix}` : `${hh}:${pad(m)}${suffix}`;
}

/** "Today", "Tomorrow", "Yesterday", "Mon 12 Mar", or with year if not this year. */
export function formatDay(key: DayKey, opts: { relative?: boolean; long?: boolean } = {}): string {
  const { relative = true, long = false } = opts;
  const today = todayKey();
  if (relative) {
    const diff = diffDays(today, key);
    if (diff === 0) return t('Today');
    if (diff === 1) return t('Tomorrow');
    if (diff === -1) return t('Yesterday');
  }
  const d = fromKey(key);
  const year = d.getFullYear() === fromKey(today).getFullYear() ? {} : { year: 'numeric' as const };
  if (currentLanguage() === 'en') {
    const month = fmt(d, { month: 'long' });
    const base = long ? `${fmt(d, { weekday: 'long' })}, ${d.getDate()} ${month}` : `${fmt(d, { weekday: 'short' })} ${d.getDate()} ${month.slice(0, 3)}`;
    return year.year ? `${base} ${d.getFullYear()}` : base;
  }
  return fmt(d, long ? { weekday: 'long', day: 'numeric', month: 'long', ...year } : { weekday: 'short', day: 'numeric', month: 'short', ...year });
}

export function isoWeekId(key: DayKey, weekStartsOn: 0 | 1 = 1): DayKey {
  return startOfWeek(key, weekStartsOn);
}

/** HH:mm plus minutes (capped at 23:59). */
export function addMinutesToTime(t: TimeKey, minutes: number): TimeKey {
  const [h, m] = t.split(':').map(Number);
  const total = Math.min(23 * 60 + 59, h * 60 + m + minutes);
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

/** Minutes between two HH:mm times (b - a). */
export function minutesBetween(a: TimeKey, b: TimeKey) {
  const [ah, am] = a.split(':').map(Number);
  const [bh, bm] = b.split(':').map(Number);
  return bh * 60 + bm - (ah * 60 + am);
}

/** 90 → "1h 30m", 45 → "45m". */
export function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h ? (m ? t('{h}h {m}m', { h, m }) : t('{h}h', { h })) : t('{m}m', { m });
}

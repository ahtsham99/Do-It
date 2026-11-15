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

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function weekdayShort(key: DayKey) {
  return WEEKDAYS_SHORT[weekday(key)];
}
export function weekdayLetters(weekStartsOn: 0 | 1 = 1) {
  const l = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  return weekStartsOn === 1 ? [...l.slice(1), l[0]] : l;
}
export function monthName(key: DayKey) {
  return MONTHS[fromKey(key).getMonth()];
}

export function formatTime(t?: TimeKey | null, use24h = false): string {
  if (!t) return '';
  if (use24h) return t;
  const [h, m] = t.split(':').map(Number);
  const suffix = h >= 12 ? 'pm' : 'am';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hh}${suffix}` : `${hh}:${pad(m)}${suffix}`;
}

/** "Today", "Tomorrow", "Yesterday", "Mon 12 Mar", or with year if not this year. */
export function formatDay(key: DayKey, opts: { relative?: boolean; long?: boolean } = {}): string {
  const { relative = true, long = false } = opts;
  const t = todayKey();
  if (relative) {
    const diff = diffDays(t, key);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
  }
  const d = fromKey(key);
  const month = MONTHS[d.getMonth()];
  const base = long
    ? `${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()]}, ${d.getDate()} ${month}`
    : `${WEEKDAYS_SHORT[d.getDay()]} ${d.getDate()} ${month.slice(0, 3)}`;
  return d.getFullYear() === fromKey(t).getFullYear() ? base : `${base} ${d.getFullYear()}`;
}

export function isoWeekId(key: DayKey, weekStartsOn: 0 | 1 = 1): DayKey {
  return startOfWeek(key, weekStartsOn);
}

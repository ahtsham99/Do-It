/**
 * Dates and times. Everything in the app is UK time (Europe/London),
 * whatever time zone the phone is set to.
 *
 * - A day is a `DayKey` string: `YYYY-MM-DD`.
 * - A time of day is minutes after midnight (0–1439), UK wall-clock.
 * - Day maths is done in UTC so device time zones and DST never shift a day.
 */
export type DayKey = string;
export type Minutes = number;

const pad = (n: number) => String(n).padStart(2, '0');
const DAY_MS = 86_400_000;

function utcMs(key: DayKey) {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}
function keyFromUtc(ms: number): DayKey {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

// ---- UK time zone (GMT / BST) ----------------------------------------------

/** BST runs from 01:00 UTC on the last Sunday of March to 01:00 UTC on the last Sunday of October. */
function lastSundayAt1amUtc(year: number, month: number) {
  const last = new Date(Date.UTC(year, month + 1, 0));
  return Date.UTC(year, month, last.getUTCDate() - last.getUTCDay(), 1);
}

/** Minutes the UK is ahead of UTC at a given instant (0 in winter, 60 in summer). */
export function ukOffset(epoch: number): 0 | 60 {
  const y = new Date(epoch).getUTCFullYear();
  return epoch >= lastSundayAt1amUtc(y, 2) && epoch < lastSundayAt1amUtc(y, 9) ? 60 : 0;
}

/** UK calendar day and minutes for an instant. */
export function ukParts(epoch = Date.now()): { date: DayKey; minutes: Minutes } {
  const shifted = epoch + ukOffset(epoch) * 60_000;
  const date = keyFromUtc(shifted);
  return { date, minutes: Math.floor((shifted - utcMs(date)) / 60_000) };
}

/** The instant of a UK wall-clock time. */
export function ukEpoch(date: DayKey, minutes: Minutes): number {
  const wall = utcMs(date) + minutes * 60_000;
  const first = wall - ukOffset(wall) * 60_000;
  return wall - ukOffset(first) * 60_000;
}

export function todayKey(): DayKey {
  return ukParts().date;
}

// ---- Day maths -------------------------------------------------------------

export function addDays(key: DayKey, n: number): DayKey {
  return keyFromUtc(utcMs(key) + n * DAY_MS);
}
export function diffDays(a: DayKey, b: DayKey): number {
  return Math.round((utcMs(b) - utcMs(a)) / DAY_MS);
}
/** 0 = Sunday … 6 = Saturday */
export function weekday(key: DayKey): number {
  return new Date(utcMs(key)).getUTCDay();
}
export function startOfWeek(key: DayKey): DayKey {
  return addDays(key, -((weekday(key) + 6) % 7)); // UK weeks start on Monday
}
export function range(start: DayKey, count: number): DayKey[] {
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}
export function isValidKey(s: unknown): s is DayKey {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && keyFromUtc(utcMs(s)) === s;
}

// ---- Formatting ------------------------------------------------------------

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function weekdayShort(key: DayKey) {
  return WEEKDAYS[weekday(key)].slice(0, 3);
}
export function dayOfMonth(key: DayKey) {
  return Number(key.slice(8, 10));
}
export function monthShort(key: DayKey) {
  return MONTHS[Number(key.slice(5, 7)) - 1].slice(0, 3);
}

/** "9am", "9:30am", "12:15pm" */
export function formatTime(m: Minutes): string {
  const h = Math.floor(m / 60) % 24;
  const mm = m % 60;
  const suffix = h >= 12 ? 'pm' : 'am';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return mm === 0 ? `${hh}${suffix}` : `${hh}:${pad(mm)}${suffix}`;
}
/** "09:30" for inputs */
export function toHHMM(m: Minutes) {
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}
export function fromHHMM(s: string): Minutes {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + (m || 0);
}

/** "Today", "Tomorrow", "Thu 20 Nov"; long: "Thursday 20 November" */
export function formatDay(key: DayKey, opts: { relative?: boolean; long?: boolean } = {}): string {
  const { relative = true, long = false } = opts;
  if (relative) {
    const diff = diffDays(todayKey(), key);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
  }
  const month = MONTHS[Number(key.slice(5, 7)) - 1];
  const base = long
    ? `${WEEKDAYS[weekday(key)]} ${dayOfMonth(key)} ${month}`
    : `${weekdayShort(key)} ${dayOfMonth(key)} ${month.slice(0, 3)}`;
  return key.slice(0, 4) === todayKey().slice(0, 4) ? base : `${base} ${key.slice(0, 4)}`;
}

export function formatDuration(mins: number) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

/** Pence → "£18" or "£18.50" */
export function formatMoney(pence: number) {
  const pounds = pence / 100;
  return `£${Number.isInteger(pounds) ? pounds : pounds.toFixed(2)}`;
}

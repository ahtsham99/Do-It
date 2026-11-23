import { addDays, todayKey, weekday, type DayKey, type TimeKey } from '@/lib/dates';

export interface ParsedQuickAdd {
  title: string;
  date?: DayKey;
  time?: TimeKey;
}

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const SHORT = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Understands the little bits people type naturally:
 * "Gym tomorrow at 7am", "Call mum 18:30", "Dentist friday 3pm",
 * "Read tonight", "Pay rent next week". Anything not understood stays in the title.
 */
export function parseQuickAdd(input: string, today: DayKey = todayKey()): ParsedQuickAdd {
  let text = ` ${input.trim()} `;
  let date: DayKey | undefined;
  let time: TimeKey | undefined;

  const take = (re: RegExp, fn: (m: RegExpMatchArray) => void) => {
    const m = text.match(re);
    if (m) {
      fn(m);
      text = text.replace(m[0], ' ');
    }
  };

  // Times: "at 3pm", "3:30 pm", "15:00", "at 9", "noon", "midnight"
  take(/\s(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i, (m) => {
    let h = Number(m[1]) % 12;
    if (m[3].toLowerCase() === 'pm') h += 12;
    time = `${pad(h)}:${pad(Number(m[2] ?? 0))}`;
  });
  if (!time) take(/\s(?:at\s+)?([01]?\d|2[0-3]):([0-5]\d)\b/, (m) => (time = `${pad(Number(m[1]))}:${m[2]}`));
  if (!time)
    take(/\sat\s+(\d{1,2})\b/i, (m) => {
      const h = Number(m[1]);
      // "at 7" → 7am before 7, otherwise assume the evening for small numbers
      time = `${pad(h <= 6 ? h + 12 : h)}:00`;
    });
  if (!time) take(/\s(?:at\s+)?noon\b/i, () => (time = '12:00'));
  if (!time) take(/\s(?:at\s+)?midnight\b/i, () => (time = '23:59'));

  // Days
  take(/\s(today|tod)\b/i, () => (date = today));
  take(/\s(tomorrow|tmrw|tmr)\b/i, () => (date = addDays(today, 1)));
  take(/\snext\s+week\b/i, () => (date = addDays(today, 7)));
  take(/\s(?:on\s+)?(?:next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday|sun|mon|tue|tues|wed|thu|thur|thurs|fri|sat)\b/i, (m) => {
    const w = m[1].toLowerCase().slice(0, 3);
    const target = Math.max(DAYS.findIndex((d) => d.startsWith(w)), SHORT.indexOf(w));
    const diff = (target - weekday(today) + 7) % 7 || 7;
    date = addDays(today, diff);
  });

  // Parts of the day
  if (!time) take(/\s(?:this\s+)?morning\b/i, () => (time = '09:00'));
  if (!time) take(/\s(?:this\s+)?afternoon\b/i, () => (time = '14:00'));
  if (!time) take(/\s(?:this\s+)?evening\b/i, () => (time = '19:00'));
  if (!time)
    take(/\stonight\b/i, () => {
      time = '20:00';
      date = date ?? today;
    });

  const title = text.replace(/\s+/g, ' ').replace(/\s(on|at|by)\s*$/i, '').trim();
  return { title: title || input.trim(), date, time };
}

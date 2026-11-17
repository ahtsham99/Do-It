/**
 * Booking rules (pure functions, no React). This is the one place that decides
 * what is bookable, so the client flow, walk-ins and rescheduling all agree.
 */
import { addDays, diffDays, formatDay, formatTime, ukEpoch, ukParts, weekday, WEEKDAYS, type DayKey, type Minutes } from '@/lib/dates';
import type { AppState, Block, Booking, TimeOff } from '@/store/types';

export const SLOT_STEP = 15;

type RulesState = Pick<AppState, 'hours' | 'timeOff' | 'blocks' | 'bookings' | 'policies'>;

export const overlaps = (aS: number, aE: number, bS: number, bE: number) => aS < bE && bS < aE;

export function timeOffOn(timeOff: TimeOff[], date: DayKey): TimeOff | undefined {
  return timeOff.find((t) => !t.deletedAt && t.start <= date && date <= t.end);
}

/** Why the shop is shut that day, or null when it's open. */
export function closedReason(s: Pick<AppState, 'hours' | 'timeOff'>, date: DayKey): string | null {
  const off = timeOffOn(s.timeOff, date);
  if (off) return off.label || 'Closed';
  const h = s.hours[weekday(date)];
  if (!h.open || h.end <= h.start) return `Closed on ${WEEKDAYS[weekday(date)]}s`;
  return null;
}

export function liveBookings(bookings: Booking[]) {
  return bookings.filter((b) => !b.deletedAt && b.status === 'confirmed');
}
export function liveBlocks(blocks: Block[]) {
  return blocks.filter((b) => !b.deletedAt);
}

/** Booked and blocked time that day. */
export function busyRanges(s: Pick<RulesState, 'blocks' | 'bookings'>, date: DayKey, excludeBookingId?: string) {
  const ranges: { start: Minutes; end: Minutes }[] = [];
  for (const b of liveBookings(s.bookings)) if (b.date === date && b.id !== excludeBookingId) ranges.push(b);
  for (const b of liveBlocks(s.blocks)) if (b.date === date) ranges.push(b);
  return ranges.sort((a, b) => a.start - b.start);
}

/** True when nothing booked or blocked overlaps [start, end). */
export function isFree(s: Pick<RulesState, 'blocks' | 'bookings'>, date: DayKey, start: Minutes, end: Minutes, excludeBookingId?: string) {
  return !busyRanges(s, date, excludeBookingId).some((r) => overlaps(start, end, r.start, r.end));
}

/**
 * Start times a client can book for a service of `duration` minutes.
 * Respects working hours, days off, blocked time, existing bookings,
 * minimum notice and the booking window. Candidates are every 15 minutes
 * plus the moment each booking/block ends, so the day packs without gaps.
 */
export function availableSlots(
  s: RulesState,
  date: DayKey,
  duration: number,
  opts: { excludeBookingId?: string; now?: { date: DayKey; minutes: Minutes } } = {},
): Minutes[] {
  const now = opts.now ?? ukParts();
  const ahead = diffDays(now.date, date);
  if (ahead < 0 || ahead > s.policies.bookingWindowDays) return [];
  if (closedReason(s, date)) return [];
  const { start, end } = s.hours[weekday(date)];
  const busy = busyRanges(s, date, opts.excludeBookingId);

  const candidates = new Set<number>();
  const first = Math.ceil(start / SLOT_STEP) * SLOT_STEP;
  candidates.add(start);
  for (let t = first; t < end; t += SLOT_STEP) candidates.add(t);
  for (const r of busy) if (r.end >= start && r.end < end) candidates.add(r.end);

  const earliest = ahead === 0 ? now.minutes + s.policies.minNoticeMins : -1;
  return [...candidates]
    .sort((a, b) => a - b)
    .filter((t) => t >= earliest && t + duration <= end && !busy.some((r) => overlaps(t, t + duration, r.start, r.end)));
}

/** Next days with at least one free slot (for the client's day picker). */
export function bookableDays(s: RulesState, duration: number, excludeBookingId?: string) {
  const today = ukParts().date;
  return Array.from({ length: s.policies.bookingWindowDays + 1 }, (_, i) => addDays(today, i)).map((date) => ({
    date,
    closed: closedReason(s, date),
    free: availableSlots(s, date, duration, { excludeBookingId }).length,
  }));
}

// ---- Cancellation ----------------------------------------------------------

export function bookingEpoch(b: Pick<Booking, 'date' | 'start'>) {
  return ukEpoch(b.date, b.start);
}

export function hoursUntil(b: Pick<Booking, 'date' | 'start'>, now = Date.now()) {
  return (bookingEpoch(b) - now) / 3_600_000;
}

/** Inside the free-cancellation window? */
export function isFreeToCancel(b: Pick<Booking, 'date' | 'start' | 'cancelHours'>, now = Date.now()) {
  return hoursUntil(b, now) >= b.cancelHours;
}

/** "Wed 19 Nov at 2:30pm": last moment to cancel for free. */
export function freeCancelDeadline(b: Pick<Booking, 'date' | 'start' | 'cancelHours'>) {
  const p = ukParts(bookingEpoch(b) - b.cancelHours * 3_600_000);
  return `${formatDay(p.date, { relative: false })} at ${formatTime(p.minutes)}`;
}

export function hoursLabel(h: number) {
  if (h === 0) return 'any time before';
  if (h % 24 === 0) return h === 24 ? '24 hours' : `${h / 24} days`;
  return h === 1 ? '1 hour' : `${h} hours`;
}

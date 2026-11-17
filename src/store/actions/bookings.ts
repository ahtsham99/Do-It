import { ukEpoch, ukParts, addDays, type DayKey, type Minutes } from '@/lib/dates';
import { uid } from '@/lib/id';
import { normalisePhone } from '@/lib/phone';
import { smsBody } from '@/lib/sms';
import { availableSlots, isFree, isFreeToCancel, liveBookings, overlaps } from '@/features/booking/rules';

import { getState, setState } from '../store';
import type { AppState, Block, Booking, CancelledBy, Client, Message, MessageKind, TimeOff } from '../types';

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

// ---- Clients ---------------------------------------------------------------

function upsertClient(s: AppState, name: string, phone: string | null, now: number): { clients: Client[]; client: Client } {
  const existing = phone ? s.clients.find((c) => !c.deletedAt && c.phone === phone) : undefined;
  if (existing) {
    const client = name && name !== existing.name ? { ...existing, name, updatedAt: now } : existing;
    return { clients: s.clients.map((c) => (c.id === client.id ? client : c)), client };
  }
  const client: Client = { id: uid('cli_'), createdAt: now, updatedAt: now, name: name || 'Walk-in', phone: phone ?? '' };
  return { clients: [...s.clients, client], client };
}

export function updateClient(id: string, patch: Partial<Pick<Client, 'name' | 'notes'>>) {
  setState((s) => ({ clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c)) }));
}

// ---- Texts -----------------------------------------------------------------

function message(s: Pick<AppState, 'shop'>, booking: Booking, client: Client, kind: MessageKind, sendAt: number): Message {
  return {
    id: uid('sms_'),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    bookingId: booking.id,
    phone: client.phone,
    kind,
    sendAt,
    body: smsBody(kind, { booking, client, shop: s.shop }),
  };
}

/** Day before at 6pm UK time, and 1 hour before. Skipped when already in the past. */
function reminders(s: Pick<AppState, 'shop'>, booking: Booking, client: Client, now: number): Message[] {
  const out: Message[] = [];
  const dayBefore = ukEpoch(addDays(booking.date, -1), 18 * 60);
  const hourBefore = ukEpoch(booking.date, booking.start) - 3_600_000;
  if (dayBefore > now) out.push(message(s, booking, client, 'reminder-day', dayBefore));
  if (hourBefore > now) out.push(message(s, booking, client, 'reminder-hour', hourBefore));
  return out;
}

/** Stop any reminders for a booking that haven't gone out yet. */
function cancelPending(messages: Message[], bookingId: string, now: number) {
  return messages.map((m) =>
    m.bookingId === bookingId && !m.cancelled && m.sendAt > now && m.kind.startsWith('reminder')
      ? { ...m, cancelled: true, updatedAt: now }
      : m,
  );
}

// ---- Bookings --------------------------------------------------------------

export interface NewBooking {
  date: DayKey;
  start: Minutes;
  serviceId: string;
  name: string;
  phone: string;
  source: 'online' | 'walk-in';
}

/**
 * The single way a booking is made. Re-checks the slot at the moment of
 * saving, so two people can never end up in the same chair.
 */
export function createBooking(input: NewBooking): Result<Booking> {
  const s = getState();
  const now = Date.now();
  const service = s.services.find((x) => x.id === input.serviceId && !x.deletedAt);
  if (!service) return { ok: false, error: 'That service is no longer available.' };
  const end = input.start + service.duration;
  const name = input.name.trim();

  let phone: string | null = null;
  if (input.phone.trim()) {
    phone = normalisePhone(input.phone);
    if (!phone) return { ok: false, error: 'Please enter a UK mobile number, like 07700 900123.' };
  }

  if (input.source === 'online') {
    if (!name) return { ok: false, error: 'Please add your name.' };
    if (!phone) return { ok: false, error: 'Please add your mobile number so we can text you.' };
    if (!availableSlots(s, input.date, service.duration).includes(input.start))
      return { ok: false, error: 'Sorry, someone has just taken that time. Please pick another.' };
  } else {
    if (!isFree(s, input.date, input.start, end)) return { ok: false, error: 'That time overlaps another booking or blocked time.' };
  }

  const { clients, client } = upsertClient(s, name, phone, now);
  const depositAmount = input.source === 'online' && s.policies.depositEnabled ? s.policies.depositAmount : 0;
  const booking: Booking = {
    id: uid('bk_'),
    createdAt: now,
    updatedAt: now,
    date: input.date,
    start: input.start,
    end,
    serviceId: service.id,
    serviceName: service.name,
    price: service.price,
    clientId: client.id,
    source: input.source,
    status: 'confirmed',
    deposit: { amount: depositAmount, status: depositAmount > 0 ? 'paid' : 'none' },
    cancelHours: s.policies.cancelHours,
    token: uid() + uid(),
  };

  const texts: Message[] = [];
  if (phone && input.source === 'online') texts.push(message(s, booking, client, 'confirmation', now));
  if (phone) texts.push(...reminders(s, booking, client, now));

  setState((st) => ({ clients, bookings: [...st.bookings, booking], messages: [...st.messages, ...texts] }));
  return { ok: true, value: booking };
}

function applyCancel(s: AppState, ids: string[], by: CancelledBy, now: number): Partial<AppState> {
  const set = new Set(ids);
  let messages = s.messages;
  const bookings = s.bookings.map((b) => {
    if (!set.has(b.id) || b.status !== 'confirmed') return b;
    const late = by === 'client' && !isFreeToCancel(b, now);
    const deposit =
      b.deposit.status === 'paid' ? { ...b.deposit, status: late ? ('kept' as const) : ('refunded' as const) } : b.deposit;
    const next: Booking = { ...b, status: 'cancelled', cancelledBy: by, deposit, updatedAt: now };
    messages = cancelPending(messages, b.id, now);
    const client = s.clients.find((c) => c.id === b.clientId);
    if (client?.phone && ukEpoch(b.date, b.end) > now) messages = [...messages, message(s, next, client, 'cancellation', now)];
    return next;
  });
  return { bookings, messages };
}

export function cancelBooking(id: string, by: CancelledBy) {
  setState((s) => applyCancel(s, [id], by, Date.now()));
}

export function rescheduleBooking(id: string, date: DayKey, start: Minutes): Result<Booking> {
  const s = getState();
  const now = Date.now();
  const b = s.bookings.find((x) => x.id === id);
  if (!b || b.status !== 'confirmed') return { ok: false, error: 'This booking is no longer active.' };
  const duration = b.end - b.start;
  if (!availableSlots(s, date, duration, { excludeBookingId: id }).includes(start))
    return { ok: false, error: 'Sorry, that time has just gone. Please pick another.' };
  const next: Booking = { ...b, date, start, end: start + duration, cancelHours: s.policies.cancelHours, updatedAt: now };
  const client = s.clients.find((c) => c.id === b.clientId);
  let messages = cancelPending(s.messages, id, now);
  if (client?.phone) messages = [...messages, message(s, next, client, 'rescheduled', now), ...reminders(s, next, client, now)];
  setState((st) => ({ bookings: st.bookings.map((x) => (x.id === id ? next : x)), messages }));
  return { ok: true, value: next };
}

export function setNoShow(id: string, noShow: boolean) {
  setState((s) => ({
    bookings: s.bookings.map((b) =>
      b.id === id
        ? { ...b, noShow, deposit: b.deposit.status === 'paid' || b.deposit.status === 'kept' ? { ...b.deposit, status: noShow ? 'kept' : 'paid' } : b.deposit, updatedAt: Date.now() }
        : b,
    ),
  }));
}

// ---- Blocked time ----------------------------------------------------------

export function bookingsOverlapping(date: DayKey, start: Minutes, end: Minutes) {
  return liveBookings(getState().bookings).filter((b) => b.date === date && overlaps(start, end, b.start, b.end));
}

export function addBlock(input: { date: DayKey; start: Minutes; end: Minutes; label: string }, opts: { cancelOverlapping?: boolean } = {}) {
  const now = Date.now();
  const block: Block = { id: uid('blk_'), createdAt: now, updatedAt: now, ...input };
  const clash = opts.cancelOverlapping ? bookingsOverlapping(input.date, input.start, input.end).map((b) => b.id) : [];
  setState((s) => ({ ...applyCancel(s, clash, 'barber', now), blocks: [...s.blocks, block] }));
  return block;
}

export function removeBlock(id: string) {
  const now = Date.now();
  setState((s) => ({ blocks: s.blocks.map((b) => (b.id === id ? { ...b, deletedAt: now, updatedAt: now } : b)) }));
}

// ---- Days off & closing ----------------------------------------------------

export function bookingsOnDays(pred: (date: DayKey) => boolean) {
  const today = ukParts().date;
  return liveBookings(getState().bookings).filter((b) => b.date >= today && pred(b.date));
}

/**
 * Close the shop for a day or a range. Any bookings on those days are
 * cancelled, their deposits refunded, and each client gets a text.
 */
export function addTimeOff(input: { start: DayKey; end: DayKey; label: string }) {
  const now = Date.now();
  const t: TimeOff = { id: uid('off_'), createdAt: now, updatedAt: now, ...input };
  const affected = bookingsOnDays((d) => d >= input.start && d <= input.end).map((b) => b.id);
  setState((s) => ({ ...applyCancel(s, affected, 'closure', now), timeOff: [...s.timeOff, t] }));
  return affected.length;
}

export function removeTimeOff(id: string) {
  const now = Date.now();
  setState((s) => ({ timeOff: s.timeOff.map((t) => (t.id === id ? { ...t, deletedAt: now, updatedAt: now } : t)) }));
}

/** Used when a weekday is switched to closed or its hours shrink. */
export function cancelForClosure(ids: string[]) {
  setState((s) => applyCancel(s, ids, 'closure', Date.now()));
}

import { formatDay, formatMoney, formatTime } from '@/lib/dates';
import { freeCancelDeadline } from '@/features/booking/rules';
import type { Booking, Client, MessageKind, Shop } from '@/store/types';

import { bookingUrl, manageUrl } from '../links';

const when = (b: Booking) => `${formatDay(b.date, { relative: false })} at ${formatTime(b.start)}`;
const first = (c: Client) => c.name.trim().split(/\s+/)[0] || 'there';

/** Every text the app sends. Kept short: one SMS segment where possible. */
export function smsBody(kind: MessageKind, ctx: { booking: Booking; client: Client; shop: Shop }): string {
  const { booking: b, client: c, shop } = ctx;
  const link = manageUrl(b.token);
  switch (kind) {
    case 'confirmation': {
      const dep = b.deposit.amount > 0 ? ` ${formatMoney(b.deposit.amount)} deposit paid.` : '';
      const free = b.cancelHours > 0 ? ` Free to cancel until ${freeCancelDeadline(b)}.` : '';
      return `${shop.name}: you're booked, ${first(c)}! ${b.serviceName}, ${when(b)}.${dep}${free} Cancel or change: ${link}`;
    }
    case 'reminder-day':
      return `Reminder from ${shop.name}: ${b.serviceName} tomorrow at ${formatTime(b.start)}${shop.address ? `, ${shop.address}` : ''}. Can't make it? ${link}`;
    case 'reminder-hour':
      return `See you at ${formatTime(b.start)} at ${shop.name}, ${first(c)}. Running late or can't make it? ${link}`;
    case 'rescheduled':
      return `${shop.name}: your booking has moved to ${when(b)} (${b.serviceName}). Cancel or change: ${link}`;
    case 'cancellation': {
      const rebook = bookingUrl(shop.slug);
      const refund =
        b.deposit.status === 'refunded'
          ? ` Your ${formatMoney(b.deposit.amount)} deposit will be refunded in full.`
          : b.deposit.status === 'kept'
            ? ` As this was within ${b.cancelHours}h, the ${formatMoney(b.deposit.amount)} deposit is kept.`
            : '';
      if (b.cancelledBy === 'closure')
        return `Sorry ${first(c)}, ${shop.name} is closed on ${formatDay(b.date, { relative: false })}, so your ${formatTime(b.start)} ${b.serviceName} is cancelled.${refund} Rebook: ${rebook}`;
      if (b.cancelledBy === 'barber')
        return `Sorry ${first(c)}, ${shop.name} has had to cancel your ${b.serviceName} on ${when(b)}.${refund} Rebook: ${rebook}`;
      return `${shop.name}: your ${b.serviceName} on ${when(b)} is cancelled.${refund} Book again: ${rebook}`;
    }
  }
}

export const MESSAGE_LABEL: Record<MessageKind, string> = {
  confirmation: 'Confirmation',
  'reminder-day': 'Day-before reminder',
  'reminder-hour': '1-hour reminder',
  rescheduled: 'Moved',
  cancellation: 'Cancellation',
};

import { router } from 'expo-router';

import { showDialog, showToast } from '@/components/ui';
import { formatTime, ukParts, weekday, type DayKey } from '@/lib/dates';
import { addBlock, bookingsOverlapping } from '@/store/actions/bookings';
import { getState } from '@/store/store';

/** Block time, asking first if it would land on top of bookings. */
export function blockWithCheck(input: { date: DayKey; start: number; end: number; label: string }, after?: () => void) {
  const clash = bookingsOverlapping(input.date, input.start, input.end);
  const done = (cancel: boolean) => {
    addBlock(input, { cancelOverlapping: cancel });
    showToast(cancel ? `Blocked. ${clash.length} client${clash.length > 1 ? 's' : ''} texted` : `Blocked ${formatTime(input.start)}–${formatTime(input.end)}`, 'remove-circle');
    after?.();
  };
  if (!clash.length) return done(false);
  showDialog({
    title: `${clash.length} booking${clash.length > 1 ? 's' : ''} in that time`,
    message:
      clash.length > 1
        ? 'Cancel them and text the clients (deposits refunded), or keep them and block around them?'
        : 'Cancel it and text the client (deposit refunded), or keep it and block around it?',
    actions: [
      { label: clash.length > 1 ? 'Cancel and text clients' : 'Cancel and text client', destructive: true, onPress: () => done(true) },
      { label: clash.length > 1 ? 'Keep the bookings' : 'Keep the booking', onPress: () => done(false) },
    ],
  });
}

/** The "Block" button: one tap on a preset from right now (or from opening time on other days). */
export function quickBlock(date: DayKey) {
  const s = getState();
  const h = s.hours[weekday(date)];
  const now = ukParts();
  const from = now.date === date ? Math.ceil(now.minutes / 5) * 5 : h.start;
  const close = Math.max(h.end, from + 30);
  const preset = (label: string, mins: number | 'rest', name = 'Blocked') => ({
    label,
    onPress: () => blockWithCheck({ date, start: from, end: mins === 'rest' ? close : Math.min(from + mins, 24 * 60 - 1), label: name }),
  });
  showDialog({
    title: now.date === date ? `Block from ${formatTime(from)}` : 'Block time',
    message: now.date === date ? 'Clients won’t be able to book it.' : undefined,
    actions: [
      preset('Next 30 minutes', 30),
      preset('Next hour', 60),
      preset(`Rest of the day (until ${formatTime(close)})`, 'rest'),
      { label: 'Choose a time…', onPress: () => router.push({ pathname: '/block', params: { date, start: from } }) },
    ],
  });
}

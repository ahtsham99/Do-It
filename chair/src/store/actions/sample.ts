import { addDays, ukEpoch, ukParts, weekday, type DayKey } from '@/lib/dates';
import { uid } from '@/lib/id';
import { smsBody } from '@/lib/sms';

import { emptyState, getState, replaceAll } from '../store';
import type { AppState, Booking, Client, Message, Service } from '../types';
import { DEFAULT_HOURS } from '../types';

/**
 * A believable little shop to click around in: services, hours, a holiday,
 * a lunch break, regulars with past visits and a busy week ahead.
 */
export async function loadSampleData() {
  const now = Date.now();
  const today = ukParts().date;
  const meta = () => ({ id: uid(), createdAt: now, updatedAt: now });

  const services: Service[] = [
    { name: 'Skin fade', price: 2200, duration: 40 },
    { name: 'Classic cut', price: 1800, duration: 30 },
    { name: 'Cut & beard', price: 2800, duration: 50 },
    { name: 'Beard trim & shape', price: 1200, duration: 20 },
    { name: 'Kids cut (under 12)', price: 1400, duration: 25 },
    { name: 'Hot towel shave', price: 2000, duration: 30 },
  ].map((x, i) => ({ ...meta(), id: uid('svc_'), ...x, order: i }));

  const hours = DEFAULT_HOURS.map((h, i) => {
    if (i === 0 || i === 1) return { ...h, open: false }; // Sun, Mon
    if (i === 4) return { open: true, start: 10 * 60, end: 20 * 60 }; // late Thursday
    if (i === 6) return { open: true, start: 8 * 60 + 30, end: 16 * 60 }; // Saturday
    return { open: true, start: 9 * 60, end: 18 * 60 };
  });

  const names: [string, string][] = [
    ['Jordan Mensah', '07700900101'],
    ['Callum Reid', '07700900102'],
    ['Priya Shah', '07700900103'],
    ['Tom Hughes', '07700900104'],
    ['Marcus Bailey', '07700900105'],
    ['Aaron Okafor', '07700900106'],
    ['Liam Doyle', '07700900107'],
    ['Danny Kowalski', '07700900108'],
    ['Ethan Clarke', '07700900109'],
    ['Sami Haddad', '07700900110'],
  ];
  const clients: Client[] = names.map(([name, phone]) => ({ ...meta(), id: uid('cli_'), name, phone: '+44' + phone.slice(1) }));

  const shop = {
    slug: 'fade-and-co',
    name: 'Fade & Co.',
    address: '14 Oldham Street, Manchester M1 1JQ',
    phone: '0161 496 0000',
    bio: 'Sharp fades, proper beard work and a hot towel to finish. Independent, appointment-first, walk-ins when the chair is free.',
    photo: null,
  };
  const policies = { depositEnabled: true, depositAmount: 500, cancelHours: 24, bookingWindowDays: 28, minNoticeMins: 30 };

  const isOpen = (d: DayKey) => hours[weekday(d)].open;
  const bookings: Booking[] = [];
  const messages: Message[] = [];
  const blocks = [];

  const add = (date: DayKey, start: number, svc: Service, client: Client, source: Booking['source'] = 'online') => {
    const deposit = source === 'online' ? policies.depositAmount : 0;
    const b: Booking = {
      ...meta(),
      id: uid('bk_'),
      date,
      start,
      end: start + svc.duration,
      serviceId: svc.id,
      serviceName: svc.name,
      price: svc.price,
      clientId: client.id,
      source,
      status: 'confirmed',
      deposit: { amount: deposit, status: deposit ? 'paid' : 'none' },
      cancelHours: policies.cancelHours,
      token: uid() + uid(),
    };
    bookings.push(b);
    const ctx = { booking: b, client, shop };
    const at = ukEpoch(date, start);
    if (source === 'online') messages.push({ ...meta(), bookingId: b.id, phone: client.phone, kind: 'confirmation', sendAt: Math.min(now, at - 3 * 86_400_000), body: smsBody('confirmation', ctx) });
    const dayBefore = ukEpoch(addDays(date, -1), 18 * 60);
    messages.push({ ...meta(), bookingId: b.id, phone: client.phone, kind: 'reminder-day', sendAt: dayBefore, body: smsBody('reminder-day', ctx) });
    messages.push({ ...meta(), bookingId: b.id, phone: client.phone, kind: 'reminder-hour', sendAt: at - 3_600_000, body: smsBody('reminder-hour', ctx) });
  };

  // Past visits: a few weeks of history so the client list means something.
  let n = 0;
  for (let d = -42; d < 0; d++) {
    const date = addDays(today, d);
    if (!isOpen(date)) continue;
    for (const start of [9 * 60 + 30, 11 * 60, 14 * 60, 16 * 60 + 15]) {
      if ((n++ * 7) % 3 === 0) continue;
      add(date, start, services[n % services.length], clients[(n * 3) % clients.length]);
    }
  }

  // The week ahead: some days busy, gaps left so there is something to book.
  const ahead: [number, number, number][] = [
    // [startMinutes, serviceIndex, clientIndex]
    [9 * 60 + 15, 0, 0],
    [10 * 60, 2, 1],
    [11 * 60 + 30, 1, 2],
    [14 * 60 + 30, 3, 3],
    [15 * 60, 0, 4],
    [16 * 60 + 45, 4, 5],
  ];
  let k = 0;
  for (let d = 0; d < 10; d++) {
    const date = addDays(today, d);
    if (!isOpen(date)) continue;
    const h = hours[weekday(date)];
    ahead.forEach(([start, si, ci], i) => {
      if ((i + k) % 3 === 2) return;
      const svc = services[si];
      if (start < h.start || start + svc.duration > h.end) return;
      if (d === 0 && ukEpoch(date, start) < now) return;
      add(date, start, svc, clients[(ci + k) % clients.length], i === 3 && d < 3 ? 'walk-in' : 'online');
    });
    blocks.push({ ...meta(), id: uid('blk_'), date, start: 13 * 60, end: 13 * 60 + 30, label: 'Lunch' });
    k++;
  }

  // A holiday a few weeks out.
  const holidayStart = addDays(today, 21 + ((8 - weekday(addDays(today, 21))) % 7)); // a Monday ~3 weeks away
  const timeOff = [{ ...meta(), id: uid('off_'), start: addDays(holidayStart, 1), end: addDays(holidayStart, 3), label: 'Holiday' }];

  const next: AppState = {
    ...emptyState(),
    shop,
    services,
    hours,
    timeOff,
    blocks,
    clients,
    bookings,
    messages,
    policies,
    settings: { ...getState().settings, setupComplete: true },
  };
  await replaceAll(next);
}

/** Wipe everything (keeps the theme choice). */
export async function resetEverything() {
  await replaceAll({ ...emptyState(), settings: { ...emptyState().settings, theme: getState().settings.theme } });
}

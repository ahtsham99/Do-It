import { ukEpoch } from '@/lib/dates';
import type { Booking, Client } from '@/store/types';

export interface ClientSummary {
  client: Client;
  visits: Booking[];
  upcoming: Booking[];
  noShows: number;
  spent: number;
  lastVisit: Booking | null;
}

/** Past visits = confirmed bookings that have finished and weren't no-shows. */
export function summarise(clients: Client[], bookings: Booking[], now = Date.now()): ClientSummary[] {
  const by = new Map<string, Booking[]>();
  for (const b of bookings) {
    if (b.deletedAt || b.status !== 'confirmed') continue;
    const list = by.get(b.clientId) ?? [];
    list.push(b);
    by.set(b.clientId, list);
  }
  return clients
    .filter((c) => !c.deletedAt)
    .map((client) => {
      const all = (by.get(client.id) ?? []).sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start);
      const done = all.filter((b) => ukEpoch(b.date, b.end) <= now);
      const visits = done.filter((b) => !b.noShow).reverse();
      return {
        client,
        visits,
        upcoming: all.filter((b) => ukEpoch(b.date, b.end) > now),
        noShows: done.length - visits.length,
        spent: visits.reduce((n, b) => n + b.price, 0),
        lastVisit: visits[0] ?? null,
      };
    });
}

import { useMemo } from 'react';

import { useStore } from './store';

export function useServices() {
  const services = useStore((s) => s.services);
  return useMemo(() => services.filter((x) => !x.deletedAt).sort((a, b) => a.order - b.order), [services]);
}

export function useClientsById() {
  const clients = useStore((s) => s.clients);
  return useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);
}

export function useTimeOff() {
  const timeOff = useStore((s) => s.timeOff);
  return useMemo(() => timeOff.filter((t) => !t.deletedAt).sort((a, b) => a.start.localeCompare(b.start)), [timeOff]);
}

/** Everything the booking rules need, as one stable object. */
export function useRulesState() {
  const hours = useStore((s) => s.hours);
  const timeOff = useStore((s) => s.timeOff);
  const blocks = useStore((s) => s.blocks);
  const bookings = useStore((s) => s.bookings);
  const policies = useStore((s) => s.policies);
  return useMemo(() => ({ hours, timeOff, blocks, bookings, policies }), [hours, timeOff, blocks, bookings, policies]);
}

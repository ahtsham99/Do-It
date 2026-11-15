import { uid } from '@/lib/id';

import { setState } from '../store';
import type { Countdown } from '../types';

export type CountdownInput = Pick<Countdown, 'title' | 'date' | 'category' | 'icon' | 'color'> & { notes?: string };

export function addCountdown(input: CountdownInput): Countdown {
  const now = Date.now();
  const item: Countdown = { id: uid('c_'), createdAt: now, updatedAt: now, ...input };
  setState((s) => ({ countdowns: [...s.countdowns, item] }));
  return item;
}

export function updateCountdown(id: string, patch: Partial<Countdown>) {
  setState((s) => ({
    countdowns: s.countdowns.map((c) => (c.id === id ? { ...c, ...patch, updatedAt: Date.now() } : c)),
  }));
}

export function deleteCountdown(id: string) {
  updateCountdown(id, { deletedAt: Date.now() });
}

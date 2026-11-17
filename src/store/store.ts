import { useSyncExternalStore } from 'react';

import { storage } from '@/lib/storage';

import { DEFAULT_HOURS, DEFAULT_POLICIES, DEFAULT_SETTINGS, DEFAULT_SHOP, type AppState } from './types';

/**
 * Tiny local-first store. State lives in memory, every slice is persisted to
 * its own storage key (debounced). Screens read with `useStore(selector)` and
 * write through the action modules in `src/store/actions/*`.
 */

const SCHEMA_VERSION = 1;
type Slice = Exclude<keyof AppState, 'hydrated'>;
const SLICES: Slice[] = ['shop', 'services', 'hours', 'timeOff', 'blocks', 'clients', 'bookings', 'messages', 'policies', 'settings'];

export function emptyState(): AppState {
  return {
    hydrated: true,
    shop: DEFAULT_SHOP,
    services: [],
    hours: DEFAULT_HOURS,
    timeOff: [],
    blocks: [],
    clients: [],
    bookings: [],
    messages: [],
    policies: DEFAULT_POLICIES,
    settings: DEFAULT_SETTINGS,
  };
}

let state: AppState = { ...emptyState(), hydrated: false };

const listeners = new Set<() => void>();
const dirty = new Set<Slice>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;

export function getState() {
  return state;
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setState(updater: (s: AppState) => Partial<AppState>) {
  const patch = updater(state);
  state = { ...state, ...patch };
  for (const key of Object.keys(patch) as (keyof AppState)[]) {
    if (key !== 'hydrated') dirty.add(key);
  }
  listeners.forEach((l) => l());
  scheduleFlush();
}

function scheduleFlush() {
  if (!state.hydrated) return;
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(flush, 200);
}

export async function flush() {
  flushTimer = null;
  const slices = [...dirty];
  dirty.clear();
  await Promise.all(slices.map((s) => storage.write(s, state[s])));
}

export async function hydrate() {
  if (state.hydrated) return;
  const version = await storage.read<number>('schemaVersion', SCHEMA_VERSION);
  const base = emptyState();
  const values = await Promise.all(SLICES.map((s) => storage.read(s, base[s])));
  const loaded = Object.fromEntries(SLICES.map((s, i) => [s, values[i]])) as Omit<AppState, 'hydrated'>;
  state = migrate(version, {
    ...base,
    ...loaded,
    // Merge objects with defaults so newly added fields get sensible values.
    shop: { ...DEFAULT_SHOP, ...loaded.shop },
    policies: { ...DEFAULT_POLICIES, ...loaded.policies },
    settings: { ...DEFAULT_SETTINGS, ...loaded.settings },
    hydrated: true,
  });
  await storage.write('schemaVersion', SCHEMA_VERSION);
  listeners.forEach((l) => l());
}

/** Hook for future data shape changes. */
function migrate(_from: number, s: AppState): AppState {
  return s;
}

/** Replace everything (reset, or loading sample data). */
export async function replaceAll(next: AppState) {
  state = { ...next, hydrated: true };
  SLICES.forEach((s) => dirty.add(s));
  listeners.forEach((l) => l());
  await flush();
}

/**
 * Subscribe to a slice. Selectors must return a stable reference (a slice or a
 * primitive) — derive filtered lists with `useMemo` in the component.
 */
export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}

import { useSyncExternalStore } from 'react';

import { storage } from '@/lib/storage';

import { DEFAULT_SETTINGS, DEFAULT_STATS, type AppState } from './types';

/**
 * Tiny local-first store. State lives in memory, every slice is persisted to
 * its own storage key (debounced). Screens read with `useStore(selector)` and
 * write through the action modules in `src/store/actions/*`.
 */

const SCHEMA_VERSION = 1;
type Slice = 'tasks' | 'habits' | 'countdowns' | 'settings' | 'stats';
const SLICES: Slice[] = ['tasks', 'habits', 'countdowns', 'settings', 'stats'];

let state: AppState = {
  hydrated: false,
  tasks: [],
  habits: [],
  countdowns: [],
  settings: DEFAULT_SETTINGS,
  stats: DEFAULT_STATS,
};

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
    if (key !== 'hydrated') dirty.add(key as Slice);
  }
  listeners.forEach((l) => l());
  scheduleFlush();
}

function scheduleFlush() {
  if (!state.hydrated) return;
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(flush, 250);
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
  const [tasks, habits, countdowns, settings, stats] = await Promise.all([
    storage.read('tasks', state.tasks),
    storage.read('habits', state.habits),
    storage.read('countdowns', state.countdowns),
    storage.read('settings', state.settings),
    storage.read('stats', state.stats),
  ]);
  state = migrate(version, {
    hydrated: true,
    tasks,
    habits,
    countdowns,
    // Merge with defaults so newly added settings get sensible values.
    settings: { ...DEFAULT_SETTINGS, ...settings },
    stats: { ...DEFAULT_STATS, ...stats },
  });
  await storage.write('schemaVersion', SCHEMA_VERSION);
  listeners.forEach((l) => l());
}

/** Hook for future data shape changes. */
function migrate(_from: number, s: AppState): AppState {
  return s;
}

/** Danger zone: wipe everything (used by Settings → Reset). */
export async function resetAll() {
  await Promise.all(SLICES.map((s) => storage.remove(s)));
  state = {
    hydrated: true,
    tasks: [],
    habits: [],
    countdowns: [],
    settings: DEFAULT_SETTINGS,
    stats: DEFAULT_STATS,
  };
  listeners.forEach((l) => l());
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

import { useSyncExternalStore } from 'react';

import { storage } from '@/lib/storage';

import { DEFAULT_LISTS, DEFAULT_SETTINGS, DEFAULT_STATS, DEFAULT_TIMER, type AppState } from './types';

/**
 * Tiny local-first store. State lives in memory, every slice is persisted to
 * its own storage key (debounced). Screens read with `useStore(selector)` and
 * write through the action modules in `src/store/actions/*`.
 */

const SCHEMA_VERSION = 4;
type Slice = Exclude<keyof AppState, 'hydrated'>;
const SLICES: Slice[] = ['tasks', 'habits', 'countdowns', 'settings', 'stats', 'timer', 'sessions', 'goals', 'lists', 'reminders'];

function initialState(hydrated: boolean): AppState {
  return {
    hydrated,
    tasks: [],
    habits: [],
    countdowns: [],
    settings: DEFAULT_SETTINGS,
    stats: DEFAULT_STATS,
    timer: DEFAULT_TIMER,
    sessions: [],
    goals: [],
    lists: DEFAULT_LISTS,
    reminders: [],
  };
}

let state: AppState = initialState(false);

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
  const base = initialState(true);
  const [tasks, habits, countdowns, settings, stats, timer, sessions, goals, lists, reminders] = await Promise.all([
    storage.read('tasks', base.tasks),
    storage.read('habits', base.habits),
    storage.read('countdowns', base.countdowns),
    storage.read('settings', base.settings),
    storage.read('stats', base.stats),
    storage.read('timer', base.timer),
    storage.read('sessions', base.sessions),
    storage.read('goals', base.goals),
    storage.read('lists', base.lists),
    storage.read('reminders', base.reminders),
  ]);
  state = migrate(version, {
    hydrated: true,
    tasks,
    habits,
    countdowns,
    // Merge with defaults so newly added fields get sensible values.
    settings: { ...DEFAULT_SETTINGS, ...settings },
    stats: { ...DEFAULT_STATS, ...stats },
    timer: { ...DEFAULT_TIMER, ...timer },
    sessions,
    goals,
    lists: lists.length ? lists : DEFAULT_LISTS,
    reminders,
  });
  await storage.write('schemaVersion', SCHEMA_VERSION);
  listeners.forEach((l) => l());
}

/** Hook for future data shape changes. v2–v4 only added slices with defaults. */
function migrate(_from: number, s: AppState): AppState {
  return s;
}

/** Danger zone: wipe everything (used by Settings → Erase everything). */
export async function resetAll() {
  await Promise.all(SLICES.map((s) => storage.remove(s)));
  state = initialState(true);
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

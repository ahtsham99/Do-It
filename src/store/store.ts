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
  state = fromSaved(version, { tasks, habits, countdowns, settings, stats, timer, sessions, goals, lists, reminders });
  await storage.write('schemaVersion', SCHEMA_VERSION);
  listeners.forEach((l) => l());
}

/** Saved slices → full state, merged with defaults so newly added fields get sensible values. */
function fromSaved(version: number, saved: Partial<Record<Slice, unknown>>): AppState {
  const base = initialState(true);
  const arr = <T,>(v: unknown, d: T[]) => (Array.isArray(v) ? (v as T[]) : d);
  const obj = <T,>(v: unknown) => (v && typeof v === 'object' ? (v as Partial<T>) : {});
  const lists = arr(saved.lists, base.lists);
  return migrate(version, {
    hydrated: true,
    tasks: arr(saved.tasks, base.tasks),
    habits: arr(saved.habits, base.habits),
    countdowns: arr(saved.countdowns, base.countdowns),
    settings: { ...DEFAULT_SETTINGS, ...obj<AppState['settings']>(saved.settings) },
    stats: { ...DEFAULT_STATS, ...obj<AppState['stats']>(saved.stats) },
    timer: { ...DEFAULT_TIMER, ...obj<AppState['timer']>(saved.timer) },
    sessions: arr(saved.sessions, base.sessions),
    goals: arr(saved.goals, base.goals),
    lists: lists.length ? lists : DEFAULT_LISTS,
    reminders: arr(saved.reminders, base.reminders),
  });
}

const BACKUP_APP = 'do-it';

/** Everything, as a backup file's contents. */
export function exportAll(): string {
  const data: Partial<Record<Slice, unknown>> = {};
  for (const s of SLICES) data[s] = state[s];
  return JSON.stringify({ app: BACKUP_APP, schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), data });
}

/**
 * Replace everything with a backup. Throws if the file isn't a Do It backup.
 * Returns a short summary of what came back.
 */
export async function restoreAll(json: string) {
  let parsed: { app?: string; schemaVersion?: number; data?: Partial<Record<Slice, unknown>> };
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('That file isn’t a Do It backup.');
  }
  if (parsed?.app !== BACKUP_APP || !parsed.data || typeof parsed.data !== 'object') throw new Error('That file isn’t a Do It backup.');
  state = fromSaved(parsed.schemaVersion ?? SCHEMA_VERSION, parsed.data);
  if (flushTimer) clearTimeout(flushTimer);
  dirty.clear();
  await Promise.all(SLICES.map((s) => storage.write(s, state[s])));
  await storage.write('schemaVersion', SCHEMA_VERSION);
  listeners.forEach((l) => l());
  return { tasks: state.tasks.filter((t) => !t.deletedAt).length, habits: state.habits.filter((h) => !h.deletedAt).length };
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

/**
 * Small per-session UI memory (e.g. which list or view was last open), so a
 * screen comes back as you left it while the app stays open.
 */
const memory = new Map<string, unknown>();

export function remember<T>(key: string, value: T) {
  memory.set(key, value);
}

export function recall<T>(key: string, fallback: T): T {
  return (memory.has(key) ? memory.get(key) : fallback) as T;
}

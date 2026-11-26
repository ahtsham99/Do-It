import { useSyncExternalStore } from 'react';

import type { NightColor } from './colors';

/**
 * A premium palette being tried on in Settings (not saved). The app shows it
 * until you leave Settings, pick a colour you have, or stop the preview.
 */
let preview: NightColor | null = null;
const subs = new Set<() => void>();

export function setColorPreview(c: NightColor | null) {
  if (preview === c) return;
  preview = c;
  subs.forEach((f) => f());
}

export function useColorPreview() {
  return useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => preview,
    () => preview,
  );
}

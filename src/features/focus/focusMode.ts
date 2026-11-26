import { useSyncExternalStore } from 'react';

/** Whether the full-screen focus view is showing (vs minimised to the tab). */
let expanded = false;
const subs = new Set<() => void>();

export function setFocusExpanded(v: boolean) {
  if (expanded === v) return;
  expanded = v;
  subs.forEach((f) => f());
}

export function useFocusExpanded() {
  return useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => expanded,
    () => expanded,
  );
}

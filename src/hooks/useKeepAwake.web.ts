import { useEffect } from 'react';

type Sentinel = { release: () => Promise<void> };
type WakeLockNav = Navigator & { wakeLock?: { request: (type: 'screen') => Promise<Sentinel> } };

/**
 * Web: keep the screen on while `active`, using the Screen Wake Lock API
 * (iPhone Safari 16.4+). The lock drops when you leave the app, so it's
 * requested again on return.
 */
export function useKeepAwake(active: boolean) {
  useEffect(() => {
    const nav = navigator as WakeLockNav;
    if (!active || !nav.wakeLock) return;
    let lock: Sentinel | null = null;
    let cancelled = false;
    const request = async () => {
      try {
        lock = await nav.wakeLock!.request('screen');
        if (cancelled) lock.release().catch(() => {});
      } catch {
        // Not allowed (e.g. low battery mode) — the timer still works.
      }
    };
    const onVisible = () => document.visibilityState === 'visible' && request();
    request();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      lock?.release().catch(() => {});
    };
  }, [active]);
}

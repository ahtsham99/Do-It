import { useEffect } from 'react';
import { AppState } from 'react-native';

import { configureNotifications, rescheduleAll } from '@/lib/notifications';
import { getState, useStore } from '@/store/store';

/** Keeps scheduled local notifications in step with tasks and settings. */
export function NotificationSync() {
  const tasks = useStore((s) => s.tasks);
  const settings = useStore((s) => s.settings);
  const stats = useStore((s) => s.stats);
  const timer = useStore((s) => s.timer);

  useEffect(() => configureNotifications(), []);

  useEffect(() => {
    const id = setTimeout(() => rescheduleAll(getState()).catch((e) => console.warn('[notifications]', e)), 800);
    return () => clearTimeout(id);
  }, [tasks, settings, stats, timer]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') rescheduleAll(getState()).catch(() => {});
    });
    return () => sub.remove();
  }, []);

  return null;
}

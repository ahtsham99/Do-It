import { useEffect } from 'react';
import { AppState } from 'react-native';

import { showDialog } from '@/components/ui';
import { completeTask } from '@/features/nudges/celebrate';
import { todayKey } from '@/lib/dates';
import { completeTimer, startTimer } from '@/store/actions/timer';
import { getState, useStore } from '@/store/store';

import { chime } from './chime';

/**
 * Finishes the timer when its end time passes, including when the app was in
 * the background or closed (it checks again on return).
 */
export function TimerWatcher() {
  const status = useStore((s) => s.timer.status);

  useEffect(() => {
    const check = () => {
      const t = getState().timer;
      if (t.status !== 'running' || !t.endsAt || Date.now() < t.endsAt) return;
      const done = completeTimer();
      if (!done) return;
      chime();
      const { settings, tasks } = getState();
      if (done.mode === 'break') {
        showDialog({
          title: 'Break’s over',
          message: 'Ready for another round?',
          actions: [{ label: `Focus ${settings.focusMinutes} min`, onPress: () => startTimer({ minutes: settings.focusMinutes, label: done.label, taskId: done.taskId, habitId: done.habitId }) }],
        });
        return;
      }
      const task = done.taskId ? tasks.find((x) => x.id === done.taskId && !x.deletedAt) : null;
      const minutes = Math.round(done.durationSec / 60);
      showDialog({
        title: 'Session complete',
        message: `${minutes} focused minute${minutes === 1 ? '' : 's'}${done.label ? ` on ${done.label}` : ''}. That’s real progress.`,
        actions: [
          ...(task
            ? [{ label: 'Mark task as done', onPress: () => completeTask(task, task.repeat === 'none' ? task.date : todayKey()) }]
            : []),
          { label: `Take a ${settings.breakMinutes}-minute break`, onPress: () => startTimer({ minutes: settings.breakMinutes, mode: 'break', label: done.label, taskId: done.taskId, habitId: done.habitId }) },
          { label: 'Keep going', onPress: () => startTimer({ minutes, label: done.label, taskId: done.taskId, habitId: done.habitId }) },
        ],
      });
    };
    check();
    if (status !== 'running') return;
    const id = setInterval(check, 1000);
    const sub = AppState.addEventListener('change', (s) => s === 'active' && check());
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [status]);

  return null;
}

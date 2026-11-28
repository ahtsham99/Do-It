import { useEffect } from 'react';
import { AppState } from 'react-native';

import { showDialog, showToast } from '@/components/ui';
import { completeTask } from '@/features/nudges/celebrate';
import { useKeepAwake } from '@/hooks/useKeepAwake';
import { todayKey } from '@/lib/dates';
import { completeTimer, startTimer } from '@/store/actions/timer';
import { getState, useStore } from '@/store/store';

import { chime } from './chime';
import { playSound, stopSound, type SoundId } from './sounds';
import { t, tn } from '@/lib/i18n';

/**
 * Finishes the timer when its end time passes, including when the app was in
 * the background or closed (it checks again on return).
 */
export function TimerWatcher() {
  const status = useStore((s) => s.timer.status);
  // Keep the screen on while a session runs.
  useKeepAwake(status === 'running');

  useEffect(() => {
    const check = () => {
      const timer = getState().timer;
      if (timer.status !== 'running' || !timer.endsAt || Date.now() < timer.endsAt) return;
      const done = completeTimer();
      if (!done) return;
      stopSound();
      chime();
      const { settings, tasks } = getState();
      const rounds = done.rounds ?? 1;
      const round = done.round ?? 1;
      const roundMinutes = done.roundMinutes ?? settings.focusMinutes;
      const same = { label: done.label, taskId: done.taskId, habitId: done.habitId, rounds, roundMinutes };
      // Focus rounds run on their own: focus → break → focus, until the last one.
      if (round < rounds) {
        if (done.mode === 'focus') {
          showToast(t('Round {round} done · {breakMinutes}-minute break', { round, breakMinutes: settings.breakMinutes }), 'cafe-outline');
          startTimer({ ...same, minutes: settings.breakMinutes, mode: 'break', round });
        } else {
          showToast(t('Round {round} of {rounds} · let’s go', { round: round + 1, rounds }), 'timer-outline');
          playSound(settings.focusSound as SoundId);
          startTimer({ ...same, minutes: roundMinutes, round: round + 1 });
        }
        return;
      }
      if (done.mode === 'break') {
        showDialog({
          title: t('Break’s over'),
          message: t('Ready for another round?'),
          actions: [{ label: t('Focus {focusMinutes} min', { focusMinutes: settings.focusMinutes }), onPress: () => (playSound(settings.focusSound as SoundId), startTimer({ minutes: settings.focusMinutes, label: done.label, taskId: done.taskId, habitId: done.habitId })) }],
        });
        return;
      }
      const task = done.taskId ? tasks.find((x) => x.id === done.taskId && !x.deletedAt) : null;
      const minutes = Math.round(done.durationSec / 60);
      const all = rounds > 1 ? rounds * roundMinutes : minutes;
      showDialog({
        title: rounds > 1 ? t('All {rounds} rounds done', { rounds }) : t('Session complete'),
        message: done.label
          ? tn(all, '{n} focused minute on {label}. That’s real progress.', '{n} focused minutes on {label}. That’s real progress.', { label: done.label })
          : tn(all, '{n} focused minute. That’s real progress.', '{n} focused minutes. That’s real progress.'),
        actions: [
          ...(task
            ? [{ label: t('Mark task as done'), onPress: () => completeTask(task, task.repeat === 'none' ? task.date : todayKey()) }]
            : []),
          { label: t('Take a {breakMinutes}-minute break', { breakMinutes: settings.breakMinutes }), onPress: () => startTimer({ minutes: settings.breakMinutes, mode: 'break', label: done.label, taskId: done.taskId, habitId: done.habitId }) },
          { label: t('Keep going'), onPress: () => (playSound(settings.focusSound as SoundId), startTimer({ minutes, label: done.label, taskId: done.taskId, habitId: done.habitId })) },
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

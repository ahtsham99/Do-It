import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, Chip, Field, Glyph, Label, Press, Screen, Text, showDialog } from '@/components/ui';
import { SOUNDS, playSound, soundsSupported, stopSound, type SoundId } from '@/features/focus/sounds';
import { DurationSheet, nativeDurationWheel } from '@/features/focus/DurationSheet';
import { setFocusExpanded } from '@/features/focus/focusMode';
import { parseLength } from '@/features/focus/parseLength';
import { TimerRing } from '@/features/focus/TimerRing';
import { formatClock, useTick } from '@/features/focus/useTick';
import { isDueToday } from '@/features/habits/logic';
import { occurrencesOn } from '@/features/tasks/logic';
import { addDays, formatDuration, todayKey } from '@/lib/dates';
import { recall, remember } from '@/lib/uiMemory';
import { updateSettings } from '@/store/actions/settings';
import { addMinutes, pauseTimer, remainingSec, resumeTimer, startTimer, stopTimer } from '@/store/actions/timer';
import { useHabits, useSettings, useTasks } from '@/store/hooks';
import { getState, useStore } from '@/store/store';
import { SERIF, radius, space, useTheme } from '@/theme';
import { t, tn } from '@/lib/i18n';

const PRESETS = [5, 15, 25, 45];
const ROUNDS = [1, 2, 3, 4];

type Target = { kind: 'task' | 'habit' | 'none'; id: string | null; label: string; icon?: string };

export default function FocusScreen() {
  const { c, fonts } = useTheme();
  const timer = useStore((s) => s.timer);
  const sessions = useStore((s) => s.sessions);
  const settings = useSettings();
  const tasks = useTasks();
  const habits = useHabits();
  const today = todayKey();
  const now = useTick(timer.status === 'running');

  const [minutes, setMinutes] = useState(settings.focusMinutes);
  const [rounds, setRoundsState] = useState(() => recall('focus.rounds', 1));
  const setRounds = (n: number) => (remember('focus.rounds', n), setRoundsState(n));
  const [target, setTarget] = useState<Target>({ kind: 'none', id: null, label: '' });
  const [custom, setCustom] = useState('');
  // iPhone app: the system timer wheel. Web and Android: type the length.
  const [editing, setEditing] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typed, setTyped] = useState('');
  const openLength = () => {
    if (nativeDurationWheel) setEditing(true);
    else {
      setTyped('');
      setTyping(true);
    }
  };
  const applyTyped = () => {
    const m = parseLength(typed);
    if (m) setMinutes(m);
    setTyping(false);
  };
  const params = useLocalSearchParams<{ taskId?: string; habitId?: string }>();

  // Opened from a reminder or habit: preselect it (once per link).
  const paramKey = params.taskId ? `t:${params.taskId}` : params.habitId ? `h:${params.habitId}` : '';
  const [seenKey, setSeenKey] = useState('');
  if (paramKey && paramKey !== seenKey) {
    setSeenKey(paramKey);
    const t = params.taskId ? tasks.find((x) => x.id === params.taskId) : null;
    const h = params.habitId ? habits.find((x) => x.id === params.habitId) : null;
    if (t) {
      setTarget({ kind: 'task', id: t.id, label: t.title });
      setMinutes(5);
    } else if (h) {
      setTarget({ kind: 'habit', id: h.id, label: h.name, icon: h.icon });
    }
  }

  const idle = timer.status === 'idle';
  const left = idle ? minutes * 60 : remainingSec(timer, now);
  const total = idle ? minutes * 60 : timer.durationSec;
  const isBreak = !idle && timer.mode === 'break';

  const options = useMemo<Target[]>(() => {
    const open = occurrencesOn(tasks, today)
      .filter((o) => !o.done)
      .map((o) => ({ kind: 'task' as const, id: o.task.id, label: o.task.title }));
    const due = habits
      .filter((h) => isDueToday(h, today, settings.weekStartsOn))
      .map((h) => ({ kind: 'habit' as const, id: h.id, label: h.name, icon: h.icon }));
    const list: Target[] = [...open, ...due].slice(0, 8);
    // Keep a preselected target visible even if it isn't due today.
    if (target.id && !list.some((o) => o.id === target.id)) list.unshift(target);
    return list;
  }, [tasks, habits, today, settings.weekStartsOn, target]);

  const stats = useMemo(() => {
    const focus = sessions.filter((x) => x.mode === 'focus' && !x.deletedAt);
    const todays = focus.filter((x) => x.day === today);
    const weekStart = addDays(today, -6);
    const week = focus.filter((x) => x.day >= weekStart);
    return {
      todayCount: todays.filter((x) => x.completed).length,
      todayMin: todays.reduce((n, x) => n + x.minutes, 0),
      weekMin: week.reduce((n, x) => n + x.minutes, 0),
    };
  }, [sessions, today]);

  const sound = settings.focusSound as SoundId;
  const chooseSound = (id: SoundId) => {
    updateSettings({ focusSound: id });
    // Preview right away (and keep playing if a session is running).
    if (timer.status === 'running' || id === 'off') playSound(id);
    else {
      playSound(id);
      setTimeout(() => getState().timer.status !== 'running' && stopSound(), 2500);
    }
  };

  const start = () => {
    playSound(sound);
    const label = target.kind === 'none' ? custom.trim() : target.label;
    startTimer({
      minutes,
      label,
      taskId: target.kind === 'task' ? target.id : null,
      habitId: target.kind === 'habit' ? target.id : null,
      rounds,
      round: 1,
      roundMinutes: minutes,
    });
    setFocusExpanded(true);
  };

  const stop = () =>
    showDialog({
      title: t('End this session?'),
      message: t('The minutes you’ve already done still count.'),
      actions: [{ label: t('End session'), destructive: true, onPress: () => (stopSound(), stopTimer()) }],
    });

  // Fit the clock inside the ring whatever its length (25:00 … 10:00:00) and font.
  const clockText = formatClock(left);
  const clockSize = Math.round(Math.min(58, 158 / (clockText.length * 0.64)));

  const status = idle ? t('Ready') : timer.status === 'paused' ? t('Paused') : isBreak ? t('Break') : t('Focusing');
  const roundOf = !idle && (timer.rounds ?? 1) > 1 ? t('Round {round} of {rounds}', { round: timer.round ?? 1, rounds: timer.rounds }) : '';
  const fmt = (m: number) => (m >= 60 ? formatDuration(m) : t('{m} min', { m }));
  const plan = rounds > 1 ? t('{rounds} × {length} with {breakMinutes}-min breaks', { rounds, length: fmt(minutes), breakMinutes: settings.breakMinutes }) : minutes === 5 ? t('Just five minutes. You can keep going after.') : t('{length} of focus', { length: fmt(minutes) });
  const totalMin = rounds * minutes + (rounds - 1) * settings.breakMinutes;

  return (
    <>
    {editing && <DurationSheet visible minutes={minutes} onClose={() => setEditing(false)} onSet={setMinutes} />}
    <Screen title={t('Focus')} subtitle={t('Can’t get started? Just do five minutes.')}>
      {idle && (
        <View style={{ gap: space.md }}>
          <Label>{t('What will you work on?')}</Label>
          {options.length > 0 && (
            <View style={[styles.row, { justifyContent: 'flex-start' }]}>
              {options.map((o) => {
                const sel = target.id === o.id;
                return (
                  <Press
                    key={`${o.kind}:${o.id}`}
                    onPress={() => setTarget(sel ? { kind: 'none', id: null, label: '' } : o)}
                    accessibilityState={{ selected: sel }}
                    style={[styles.option, { backgroundColor: sel ? c.accent : c.surface, borderColor: sel ? c.accent : c.border }]}>
                    {o.icon ? <Glyph value={o.icon} size={15} color={sel ? c.accentText : c.textMuted} /> : null}
                    <Text variant="small" numberOfLines={1} color={sel ? c.accentText : c.text} style={{ fontWeight: '500', maxWidth: 220 }}>
                      {o.label}
                    </Text>
                  </Press>
                );
              })}
            </View>
          )}
          {target.kind === 'none' && <Field placeholder={options.length ? t('Or type something else (optional)') : t('Type it here (optional)')} value={custom} onChangeText={setCustom} returnKeyType="go" onSubmitEditing={start} />}
          {target.kind === 'habit' && (
            <Text variant="small" tone="muted">
              {t('Finishing the session ticks this habit for today.')}
            </Text>
          )}
        </View>
      )}

      <Card style={{ alignItems: 'center', gap: space.md, paddingVertical: space.xl }}>
        <TimerRing size={212} stroke={9} progress={total ? left / total : 0} color={isBreak ? c.warning : c.accent}>
          <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>
            {status}
          </Text>
          {typing ? (
            <TextInput
              autoFocus
              value={typed}
              onChangeText={setTyped}
              onSubmitEditing={applyTyped}
              onBlur={applyTyped}
              placeholder={t('e.g. 90 or 1:30')}
              placeholderTextColor={c.textFaint}
              keyboardType="numbers-and-punctuation"
              returnKeyType="done"
              accessibilityLabel={t('Type a length')}
              style={{ fontFamily: fonts.display, fontSize: 32, textAlign: 'center', color: c.text, width: 170, paddingVertical: 6, borderBottomWidth: 2, borderBottomColor: c.accent, outlineStyle: 'none' } as object}
            />
          ) : (
            <Press haptic={false} disabled={!idle} onPress={openLength} accessibilityRole="button" accessibilityLabel={t('Tap to change the length')}>
              <Text accessibilityRole="timer" numberOfLines={1} style={{ fontFamily: SERIF, fontSize: clockSize, lineHeight: clockSize + 8, fontVariant: ['tabular-nums'] }}>
                {formatClock(left)}
              </Text>
            </Press>
          )}
          {idle && !typing && (
            <Text variant="small" tone="faint" style={{ fontSize: 11 }}>
              {nativeDurationWheel ? t('Tap to change') : t('Tap to type')}
            </Text>
          )}
          {roundOf ? (
            <Text variant="small" tone="muted" style={{ fontSize: 12 }}>
              {roundOf}
            </Text>
          ) : null}
          {!idle && timer.label ? (
            <Text variant="small" tone="muted" numberOfLines={1} style={{ maxWidth: 190 }}>
              {timer.label}
            </Text>
          ) : null}
        </TimerRing>

        {idle ? (
          <>
            <Button label={t('Start focus')} icon="play" onPress={start} style={styles.start} />
            <Text variant="small" tone="muted" style={{ textAlign: 'center', marginTop: -4 }}>
              {plan}
              {rounds > 1 ? t(' · {total} total', { total: fmt(totalMin) }) : ''}
            </Text>
            <View style={[styles.divider, { backgroundColor: c.border }]} />
            <View style={styles.setting}>
              <Text variant="caption" tone="muted" style={styles.settingLabel}>
                {t('Length')}
              </Text>
              <View style={[styles.row, { flexWrap: 'nowrap', justifyContent: 'space-between' }]}>
                {PRESETS.map((m) => (
                  <Chip key={m} label={`${m}m`} selected={minutes === m} onPress={() => setMinutes(m)} />
                ))}
              </View>
            </View>
            <View style={styles.setting}>
              <Text variant="caption" tone="muted" style={styles.settingLabel}>
                {t('Rounds')}
              </Text>
              <View style={[styles.row, { flexWrap: 'nowrap', justifyContent: 'space-between' }]}>
                {ROUNDS.map((n) => (
                  <Chip key={n} label={n === 1 ? t('Once') : `${n}×`} selected={rounds === n} onPress={() => setRounds(n)} />
                ))}
              </View>
            </View>
            {minutes !== settings.focusMinutes && (
              <Press onPress={() => updateSettings({ focusMinutes: minutes })} style={{ alignSelf: 'center', padding: space.sm }}>
                <Text variant="small" tone="muted" style={{ textDecorationLine: 'underline' }}>
                  Make {minutes} minutes my default
                </Text>
              </Press>
            )}
          </>
        ) : (
          <View style={{ alignSelf: 'stretch', gap: space.sm }}>
          <View style={[styles.row, { flexWrap: 'nowrap' }]}>
            {timer.status === 'running' ? (
              <Button label={t('Pause')} icon="pause" onPress={() => (stopSound(), pauseTimer())} />
            ) : (
              <Button label={t('Resume')} icon="play" onPress={() => (playSound(sound), resumeTimer())} />
            )}
            <Button kind="secondary" label={t('+5 min')} onPress={() => addMinutes(5)} />
            <Button kind="ghost" label={t('End')} onPress={stop} />
          </View>
            <Button kind="ghost" label={t('Full screen')} icon="expand" onPress={() => setFocusExpanded(true)} />
          </View>
        )}
        {soundsSupported && (
          <View style={{ alignSelf: 'stretch', gap: space.sm }}>
            <Text variant="caption" tone="muted" style={styles.settingLabel}>
              {t('Sound')}
            </Text>
            <View style={styles.sounds}>
              {SOUNDS.map((x) => {
                const on = sound === x.id;
                return (
                  <Press
                    key={x.id}
                    onPress={() => chooseSound(x.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    style={[styles.sound, { backgroundColor: on ? c.accentSoft : c.surfaceAlt, borderColor: on ? c.accent : 'transparent' }]}>
                    <Text style={{ fontSize: 16 }}>{x.icon}</Text>
                    <Text variant="small" color={on ? c.accent : c.textMuted} style={{ fontSize: 11, fontWeight: '600' }}>
                      {t(x.label)}
                    </Text>
                  </Press>
                );
              })}
            </View>
          </View>
        )}
      </Card>

      <Text variant="small" tone="muted" style={{ textAlign: 'center' }}>
        {tn(stats.todayCount, 'Today: {n} session · {min} min', 'Today: {n} sessions · {min} min', { min: stats.todayMin })} · {t('Last 7 days: {min} min', { min: stats.weekMin })}
      </Text>
    </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, justifyContent: 'center' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.lg,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  sounds: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  sound: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 8, borderRadius: radius.md, borderWidth: 1.5 },
  start: { alignSelf: 'stretch', height: 60, borderRadius: radius.pill },
  divider: { alignSelf: 'stretch', height: 1, marginVertical: 2 },
  setting: { alignSelf: 'stretch', gap: space.sm },
  settingLabel: { textTransform: 'uppercase', fontSize: 11 },});

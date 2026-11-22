import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Chip, Field, Glyph, IconButton, Label, Press, Screen, Section, Text, showDialog } from '@/components/ui';
import { TimerRing } from '@/features/focus/TimerRing';
import { formatClock, useTick } from '@/features/focus/useTick';
import { isDueToday } from '@/features/habits/logic';
import { occurrencesOn } from '@/features/tasks/logic';
import { addDays, formatDay, todayKey } from '@/lib/dates';
import { updateSettings } from '@/store/actions/settings';
import { addMinutes, pauseTimer, remainingSec, resumeTimer, startTimer, stopTimer } from '@/store/actions/timer';
import { useHabits, useSettings, useTasks } from '@/store/hooks';
import { useStore } from '@/store/store';
import { SERIF, radius, space, useTheme } from '@/theme';

const PRESETS = [5, 15, 25, 45];

type Target = { kind: 'task' | 'habit' | 'none'; id: string | null; label: string; icon?: string };

export default function FocusScreen() {
  const { c } = useTheme();
  const timer = useStore((s) => s.timer);
  const sessions = useStore((s) => s.sessions);
  const settings = useSettings();
  const tasks = useTasks();
  const habits = useHabits();
  const today = todayKey();
  const now = useTick(timer.status === 'running');

  const [minutes, setMinutes] = useState(settings.focusMinutes);
  const [target, setTarget] = useState<Target>({ kind: 'none', id: null, label: '' });
  const [custom, setCustom] = useState('');
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
      recent: [...focus].reverse().slice(0, 5),
    };
  }, [sessions, today]);

  const start = () => {
    const label = target.kind === 'none' ? custom.trim() : target.label;
    startTimer({
      minutes,
      label,
      taskId: target.kind === 'task' ? target.id : null,
      habitId: target.kind === 'habit' ? target.id : null,
    });
  };

  const stop = () =>
    showDialog({
      title: 'End this session?',
      message: 'The minutes you’ve already done still count.',
      actions: [{ label: 'End session', destructive: true, onPress: stopTimer }],
    });

  const status = idle ? 'Ready when you are' : timer.status === 'paused' ? 'Paused' : isBreak ? 'Break' : 'Focusing';

  return (
    <Screen title="Focus" subtitle="Can’t get started? Just do five minutes.">
      <Card style={{ alignItems: 'center', gap: space.lg, paddingVertical: space.xxl }}>
        <TimerRing progress={total ? left / total : 0} color={isBreak ? c.warning : c.accent}>
          <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>
            {status}
          </Text>
          <Text accessibilityRole="timer" style={{ fontFamily: SERIF, fontSize: 68, lineHeight: 74, fontVariant: ['tabular-nums'] }}>
            {formatClock(left)}
          </Text>
          {!idle && timer.label ? (
            <Text variant="small" tone="muted" numberOfLines={1} style={{ maxWidth: 190 }}>
              {timer.label}
            </Text>
          ) : null}
        </TimerRing>

        {idle ? (
          <>
            <View style={styles.row}>
              {PRESETS.map((m) => (
                <Chip key={m} label={m === 5 ? '5 · just start' : `${m} min`} selected={minutes === m} onPress={() => setMinutes(m)} />
              ))}
            </View>
            <View style={[styles.row, { alignItems: 'center' }]}>
              <IconButton icon="remove" label="Less time" size={18} diameter={40} onPress={() => setMinutes(Math.max(1, minutes - 5))} />
              <Text tone="muted" style={{ minWidth: 90, textAlign: 'center' }}>
                {minutes} minutes
              </Text>
              <IconButton icon="add" label="More time" size={18} diameter={40} onPress={() => setMinutes(Math.min(180, minutes + 5))} />
            </View>
          </>
        ) : (
          <View style={styles.row}>
            {timer.status === 'running' ? (
              <Button label="Pause" icon="pause" onPress={pauseTimer} style={{ minWidth: 140 }} />
            ) : (
              <Button label="Resume" icon="play" onPress={resumeTimer} style={{ minWidth: 140 }} />
            )}
            <Button kind="secondary" label="+5 min" onPress={() => addMinutes(5)} />
            <Button kind="ghost" label="End" onPress={stop} />
          </View>
        )}
      </Card>

      {idle && (
        <View style={{ gap: space.md }}>
          <Label>What will you work on?</Label>
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
          {target.kind === 'none' && <Field placeholder="Or type it here (optional)" value={custom} onChangeText={setCustom} returnKeyType="go" onSubmitEditing={start} />}
          {target.kind === 'habit' && (
            <Text variant="small" tone="muted">
              Finishing the session ticks this habit for today.
            </Text>
          )}
          <Button label={`Start ${minutes}-minute focus`} icon="play" onPress={start} />
          {minutes !== settings.focusMinutes && (
            <Press onPress={() => updateSettings({ focusMinutes: minutes })} style={{ alignSelf: 'center', padding: space.sm }}>
              <Text variant="small" tone="muted" style={{ textDecorationLine: 'underline' }}>
                Make {minutes} minutes my default
              </Text>
            </Press>
          )}
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: space.md }}>
        <Stat label="Sessions today" value={String(stats.todayCount)} />
        <Stat label="Minutes today" value={String(stats.todayMin)} />
        <Stat label="Last 7 days" value={`${stats.weekMin}m`} />
      </View>

      {stats.recent.length > 0 && (
        <Section title="Recent sessions">
          <Card padded={false} style={{ paddingHorizontal: space.xl - 4 }}>
            {stats.recent.map((x, i) => (
              <Press
                key={x.id}
                haptic={false}
                disabled={!x.taskId}
                onPress={() => x.taskId && router.push({ pathname: '/task', params: { id: x.taskId } })}
                style={[styles.session, i < stats.recent.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border }]}>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1}>{x.label || 'Focus session'}</Text>
                  <Text variant="small" tone="muted">
                    {formatDay(x.day)}
                    {x.completed ? '' : ' · ended early'}
                  </Text>
                </View>
                <Text style={{ fontFamily: SERIF, fontSize: 24 }}>{x.minutes}m</Text>
              </Press>
            ))}
          </Card>
        </Section>
      )}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card style={{ flex: 1, alignItems: 'center', gap: 2, paddingHorizontal: space.sm }}>
      <Text style={{ fontFamily: SERIF, fontSize: 32, lineHeight: 36 }}>{value}</Text>
      <Text variant="small" tone="muted" style={{ fontSize: 12, textAlign: 'center' }}>
        {label}
      </Text>
    </Card>
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
  session: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 62 },
});

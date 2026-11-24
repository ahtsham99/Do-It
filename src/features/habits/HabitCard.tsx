import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card, Glyph, Icon, Press, SwipeToDelete, Text, showToast, tap } from '@/components/ui';
import { deleteHabitWithUndo } from '@/features/delete/deleteWithUndo';
import { TimerRing } from '@/features/focus/TimerRing';
import { randomLine } from '@/features/nudges/messages';
import { range, startOfWeek, todayKey, weekdayShort } from '@/lib/dates';
import { countFor, setHabitDay, stepHabit } from '@/store/actions/habits';
import { useSettings } from '@/store/hooks';
import type { Habit } from '@/store/types';
import { space, useTheme } from '@/theme';

import { bestHabitStreak, habitStreak, streakLabel, weekCount } from './logic';

/** Tick a habit for a day, with a cheer when it's today. */
export function tickHabit(habit: Habit, day: string, tone: Parameters<typeof randomLine>[1], weekStartsOn: 0 | 1) {
  const wasDone = habit.history.includes(day);
  tap(wasDone ? 'light' : 'success');
  if (stepHabit(habit, day) && day === todayKey()) {
    const s = habitStreak({ ...habit, history: [...habit.history, day] }, day, weekStartsOn);
    showToast(s > 1 ? `${streakLabel(habit, s)} in a row. ${randomLine('done', tone)}` : randomLine('done', tone), 'flame');
  }
}

/** Ring with the habit's emoji; fills as you go (counted habits) and when done today. */
export function HabitRing({ habit, size = 64, onPress }: { habit: Habit; size?: number; onPress?: () => void }) {
  const { c, paint } = useTheme();
  const color = paint(habit.color);
  const today = todayKey();
  const done = habit.history.includes(today);
  const target = Math.max(1, habit.perDay ?? 1);
  const count = countFor(habit, today);
  return (
    <Press
      haptic={false}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityState={{ checked: done }}
      accessibilityLabel={target > 1 ? `${habit.name}: ${count} of ${target}. Tap to add one` : `Tick ${habit.name}`}
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <TimerRing size={size} stroke={3} progress={target > 1 ? count / target : done ? 1 : 0} color={color}>
        <View style={{ width: size - 6, height: size - 6, borderRadius: size, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? c.accentSoft : c.surface }}>
          <Glyph value={habit.icon} size={size * 0.42} color={color} />
        </View>
      </TimerRing>
      {done && (
        <View style={[styles.badge, { backgroundColor: color, borderColor: c.surface }]}>
          <Icon name="checkmark" size={11} color="#fff" />
        </View>
      )}
    </Press>
  );
}

export function HabitCard({ habit }: { habit: Habit }) {
  const { c, paint } = useTheme();
  const color = paint(habit.color);
  const { weekStartsOn, tone } = useSettings();
  const today = todayKey();
  const streak = habitStreak(habit, today, weekStartsOn);
  const best = Math.max(streak, bestHabitStreak(habit, weekStartsOn));
  const days = range(startOfWeek(today, weekStartsOn), 7);
  const open = () => router.push({ pathname: '/habit', params: { id: habit.id } });

  return (
    <SwipeToDelete onDelete={() => deleteHabitWithUndo(habit)}>
    <Card style={{ gap: space.md, paddingVertical: space.lg }}>
      <View style={styles.top}>
        <HabitRing habit={habit} size={54} onPress={() => tickHabit(habit, today, tone, weekStartsOn)} />
        <Press haptic={false} onPress={open} style={{ flex: 1, gap: 3 }}>
          <Text variant="heading" numberOfLines={1} style={{ fontSize: 18 }}>
            {habit.name}
          </Text>
          <Text variant="small" tone="muted">
            {(habit.perDay ?? 1) > 1 ? `${countFor(habit, today)}/${habit.perDay} today · ` : ''}
            {streak > 0 ? `${streakLabel(habit, streak)} streak` : 'No streak yet'} · best {best}
            {habit.frequency === 'weekly' ? ` · ${weekCount(habit, today, weekStartsOn)}/${habit.timesPerWeek} this week` : ''}
          </Text>
        </Press>
        <Press onPress={open} hitSlop={12} accessibilityLabel={`Edit ${habit.name}`} style={{ padding: 4 }}>
          <Icon name="ellipsis-horizontal" size={22} color={c.textMuted} />
        </Press>
      </View>
      <View style={styles.week}>
        {days.map((d) => {
          const hit = habit.history.includes(d);
          const future = d > today;
          return (
            <Press
              key={d}
              haptic={false}
              disabled={future}
              onPress={() => (d === today ? tickHabit(habit, d, tone, weekStartsOn) : setHabitDay(habit, d, !hit))}
              accessibilityLabel={`${weekdayShort(d)} ${hit ? 'done' : 'not done'}`}
              style={[
                styles.day,
                {
                  borderColor: hit ? color : d === today ? c.textMuted : c.border,
                  backgroundColor: hit ? color : 'transparent',
                  opacity: future ? 0.4 : 1,
                },
              ]}>
              <Text style={{ fontSize: 12, fontWeight: '500' }} color={hit ? '#fff' : c.textMuted}>
                {weekdayShort(d).slice(0, 1)}
              </Text>
            </Press>
          );
        })}
      </View>
    </Card>
    </SwipeToDelete>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  week: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  day: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

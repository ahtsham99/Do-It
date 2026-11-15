import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Icon, Press, Text, showToast, tap, type IconName } from '@/components/ui';
import { randomLine } from '@/features/nudges/messages';
import { addDays, range, todayKey, weekdayShort } from '@/lib/dates';
import { toggleHabit } from '@/store/actions/habits';
import { useSettings } from '@/store/hooks';
import type { Habit } from '@/store/types';
import { radius, space, useTheme } from '@/theme';

import { habitStreak, streakLabel, weekCount } from './logic';

export function HabitCard({ habit, compact }: { habit: Habit; compact?: boolean }) {
  const { c } = useTheme();
  const { weekStartsOn, tone } = useSettings();
  const today = todayKey();
  const done = habit.history.includes(today);
  const streak = habitStreak(habit, today, weekStartsOn);
  const days = range(addDays(today, -6), 7);

  const tick = () => {
    tap(done ? 'light' : 'success');
    if (toggleHabit(habit, today)) {
      const s = habitStreak({ ...habit, history: [...habit.history, today] }, today, weekStartsOn);
      showToast(s > 1 ? `${streakLabel(habit, s)} in a row! ${randomLine('done', tone)}` : randomLine('done', tone), 'flame');
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Press haptic={false} style={styles.main} onPress={() => router.push({ pathname: '/habit', params: { id: habit.id } })}>
        <View style={[styles.icon, { backgroundColor: habit.color }]}>
          <Icon name={habit.icon as IconName} size={22} color="#fff" />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {habit.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="flame" size={14} color={streak > 0 ? c.accent : c.textFaint} />
            <Text variant="small" tone={streak > 0 ? 'accent' : 'faint'} style={{ fontWeight: '600' }}>
              {streakLabel(habit, streak)}
            </Text>
            {habit.frequency === 'weekly' && (
              <Text variant="small" tone="muted">
                · {weekCount(habit, today, weekStartsOn)}/{habit.timesPerWeek} this week
              </Text>
            )}
          </View>
        </View>
        <Press
          haptic={false}
          onPress={tick}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: done }}
          accessibilityLabel={`Tick ${habit.name}`}
          hitSlop={8}
          style={[styles.tick, { backgroundColor: done ? habit.color : 'transparent', borderColor: done ? habit.color : c.border }]}>
          <Icon name="checkmark" size={26} color={done ? '#fff' : c.textFaint} />
        </Press>
      </Press>
      {!compact && (
        <View style={styles.history}>
          {days.map((d) => {
            const hit = habit.history.includes(d);
            return (
              <Press
                key={d}
                haptic={false}
                onPress={() => toggleHabit(habit, d)}
                accessibilityLabel={`${weekdayShort(d)} ${hit ? 'done' : 'not done'}`}
                style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                <Text variant="caption" tone={d === today ? 'default' : 'faint'} style={{ fontSize: 10 }}>
                  {weekdayShort(d).slice(0, 1)}
                </Text>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: hit ? habit.color : c.surfaceAlt },
                    d === today && !hit && { borderWidth: 1.5, borderColor: habit.color },
                  ]}
                />
              </Press>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, padding: space.md, gap: space.md },
  main: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  icon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  tick: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  history: { flexDirection: 'row', paddingHorizontal: 2 },
  dot: { width: 22, height: 22, borderRadius: 11 },
});

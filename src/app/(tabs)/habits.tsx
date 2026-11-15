import { router } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { Empty, Fab, Screen, Section, Text } from '@/components/ui';
import { HabitCard } from '@/features/habits/HabitCard';
import { habitStreak } from '@/features/habits/logic';
import { todayKey } from '@/lib/dates';
import { useHabits, useSettings } from '@/store/hooks';
import { space } from '@/theme';

export default function HabitsScreen() {
  const habits = useHabits();
  const { weekStartsOn } = useSettings();
  const today = todayKey();
  const daily = habits.filter((h) => h.frequency === 'daily');
  const weekly = habits.filter((h) => h.frequency === 'weekly');
  const doneToday = habits.filter((h) => h.history.includes(today)).length;
  const best = useMemo(() => Math.max(0, ...habits.map((h) => habitStreak(h, today, weekStartsOn))), [habits, today, weekStartsOn]);

  return (
    <View style={{ flex: 1 }}>
      <Screen title="Habits">
        {habits.length === 0 ? (
          <Empty icon="flame-outline" title="No habits yet" body="Small things, every day. Add one you can do even on your worst day." />
        ) : (
          <>
            <Text tone="muted">
              {doneToday}/{habits.length} ticked today{best > 1 ? ` · longest streak ${best}` : ''}
            </Text>
            {daily.length > 0 && (
              <Section title="Daily">
                <View style={{ gap: space.sm }}>
                  {daily.map((h) => (
                    <HabitCard key={h.id} habit={h} />
                  ))}
                </View>
              </Section>
            )}
            {weekly.length > 0 && (
              <Section title="Weekly">
                <View style={{ gap: space.sm }}>
                  {weekly.map((h) => (
                    <HabitCard key={h.id} habit={h} />
                  ))}
                </View>
              </Section>
            )}
          </>
        )}
      </Screen>
      <Fab label="Add habit" onPress={() => router.push('/habit')} />
    </View>
  );
}

import { router } from 'expo-router';
import { View } from 'react-native';

import { Empty, IconButton, Screen, Section } from '@/components/ui';
import { ConsistencyCard } from '@/features/habits/ConsistencyCard';
import { HabitCard } from '@/features/habits/HabitCard';
import { todayKey } from '@/lib/dates';
import { useHabits } from '@/store/hooks';
import { space } from '@/theme';

export default function HabitsScreen() {
  const habits = useHabits();
  const today = todayKey();
  const daily = habits.filter((h) => h.frequency === 'daily');
  const weekly = habits.filter((h) => h.frequency === 'weekly');
  const doneToday = habits.filter((h) => h.history.includes(today)).length;
  const add = () => router.push('/habit');

  return (
    <Screen
      title="Habits"
      subtitle={habits.length ? `${doneToday} of ${habits.length} ticked today` : 'Small things, every day'}
      right={<IconButton icon="add" label="Add habit" onPress={add} />}>
      {habits.length === 0 ? (
        <Empty
          icon="flame-outline"
          title="No habits yet"
          body="Start with one small thing you can do on any day."
          action="Add a habit"
          onAction={add}
        />
      ) : (
        <>
          <ConsistencyCard habits={habits} />
          <View style={{ gap: space.lg }}>
            {daily.map((h) => (
              <HabitCard key={h.id} habit={h} />
            ))}
          </View>
          {weekly.length > 0 && (
            <Section title="Weekly">
              <View style={{ gap: space.lg }}>
                {weekly.map((h) => (
                  <HabitCard key={h.id} habit={h} />
                ))}
              </View>
            </Section>
          )}
        </>
      )}
    </Screen>
  );
}

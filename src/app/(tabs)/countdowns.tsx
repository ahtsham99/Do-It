import { router } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { Empty, Fab, Screen, Section } from '@/components/ui';
import { CountdownCard } from '@/features/countdowns/CountdownCard';
import { groupCountdowns } from '@/features/countdowns/logic';
import { todayKey } from '@/lib/dates';
import { useCountdowns } from '@/store/hooks';
import { space } from '@/theme';

export default function CountdownsScreen() {
  const items = useCountdowns();
  const today = todayKey();
  const groups = useMemo(() => groupCountdowns(items, today), [items, today]);
  const next = useMemo(
    () => items.filter((c) => c.date >= today).sort((a, b) => (a.date < b.date ? -1 : 1))[0],
    [items, today],
  );

  return (
    <View style={{ flex: 1 }}>
      <Screen title="Countdowns">
        {items.length === 0 ? (
          <Empty
            icon="hourglass-outline"
            title="Nothing to count down to"
            body="Add exams, appointments, trips and birthdays. Watching the days drop is weirdly motivating."
          />
        ) : (
          <>
            {next && <CountdownCard item={next} hero />}
            {groups.map((g) => (
              <Section key={g.category} title={g.category}>
                <View style={{ gap: space.sm }}>
                  {g.items.map((c) => (
                    <CountdownCard key={c.id} item={c} />
                  ))}
                </View>
              </Section>
            ))}
          </>
        )}
      </Screen>
      <Fab label="Add countdown" onPress={() => router.push('/countdown')} />
    </View>
  );
}

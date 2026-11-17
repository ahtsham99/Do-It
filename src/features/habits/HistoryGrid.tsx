import { View } from 'react-native';

import { Text } from '@/components/ui';
import { addDays, range, startOfWeek, todayKey, weekdayLetters } from '@/lib/dates';
import type { Habit } from '@/store/types';
import { useTheme } from '@/theme';

/** GitHub-style grid: 16 weeks × 7 days. */
export function HistoryGrid({ habit, weekStartsOn, weeks = 16 }: { habit: Habit; weekStartsOn: 0 | 1; weeks?: number }) {
  const { c } = useTheme();
  const today = todayKey();
  const set = new Set(habit.history);
  const first = addDays(startOfWeek(today, weekStartsOn), -(weeks - 1) * 7);
  const cols = Array.from({ length: weeks }, (_, i) => addDays(first, i * 7));
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      <View style={{ gap: 3, marginRight: 2 }}>
        {weekdayLetters(weekStartsOn).map((l, i) => (
          <View key={i} style={{ height: 14, justifyContent: 'center' }}>
            <Text variant="caption" tone="faint" style={{ fontSize: 9 }}>
              {i % 2 === 0 ? l : ''}
            </Text>
          </View>
        ))}
      </View>
      {cols.map((w) => (
        <View key={w} style={{ gap: 3, flex: 1 }}>
          {range(w, 7).map((d) => (
            <View
              key={d}
              style={{
                height: 14,
                borderRadius: 3,
                backgroundColor: d > today ? 'transparent' : set.has(d) ? habit.color : c.surfaceAlt,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

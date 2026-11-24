import { View } from 'react-native';

import { Text } from '@/components/ui';
import { addDays, range, startOfWeek, todayKey, weekdayLetters } from '@/lib/dates';
import type { Habit } from '@/store/types';
import { useTheme } from '@/theme';

/** GitHub-style grid: weeks × 7 days. */
export function HistoryGrid({ habit, weekStartsOn, weeks = 16 }: { habit: Habit; weekStartsOn: 0 | 1; weeks?: number }) {
  const { c, paint } = useTheme();
  const today = todayKey();
  const set = new Set(habit.history);
  const first = addDays(startOfWeek(today, weekStartsOn), -(weeks - 1) * 7);
  const cols = Array.from({ length: weeks }, (_, i) => addDays(first, i * 7));
  // Fewer weeks → bigger squares; a year gets thin rows so it fits.
  const h = weeks <= 1 ? 34 : weeks <= 5 ? 28 : weeks <= 13 ? 18 : weeks <= 26 ? 14 : 9;
  const gap = weeks > 26 ? 2 : 3;
  return (
    <View style={{ flexDirection: 'row', gap, justifyContent: 'center' }}>
      <View style={{ gap, marginRight: 2 }}>
        {weekdayLetters(weekStartsOn).map((l, i) => (
          <View key={i} style={{ height: h, justifyContent: 'center' }}>
            <Text variant="caption" tone="faint" style={{ fontSize: 9 }}>
              {i % 2 === 0 ? l : ''}
            </Text>
          </View>
        ))}
      </View>
      {cols.map((w) => (
        <View key={w} style={{ gap, flex: 1, maxWidth: 44 }}>
          {range(w, 7).map((d) => (
            <View
              key={d}
              style={{
                height: h,
                borderRadius: weeks <= 5 ? 6 : 3,
                backgroundColor: d > today ? 'transparent' : set.has(d) ? paint(habit.color) : c.surfaceAlt,
                borderWidth: d > today ? 1 : 0,
                borderColor: c.border,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

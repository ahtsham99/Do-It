import { useRef, type ComponentRef } from 'react';
import { ScrollView, View } from 'react-native';

import { Text } from '@/components/ui';
import { addDays, range, startOfWeek, todayKey, weekdayLetters, weekdayShort } from '@/lib/dates';
import type { Habit } from '@/store/types';
import { useTheme } from '@/theme';

/**
 * Habit history, time running left → right. One week is a single row of
 * days; longer ranges are weeks side by side (each column one week).
 * Very long ranges (Max) scroll sideways and open at today.
 */
export function HistoryGrid({ habit, weekStartsOn, weeks = 16 }: { habit: Habit; weekStartsOn: 0 | 1; weeks?: number }) {
  const { c, paint } = useTheme();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const today = todayKey();
  const set = new Set(habit.history);
  const color = paint(habit.color);
  const fill = (d: string) => ({
    backgroundColor: d > today ? 'transparent' : set.has(d) ? color : c.surfaceAlt,
    borderWidth: d > today ? 1 : 0,
    borderColor: c.border,
  });

  if (weeks <= 1) {
    const days = range(startOfWeek(today, weekStartsOn), 7);
    return (
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {days.map((d) => (
          <View key={d} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <Text variant="caption" tone={d === today ? 'default' : 'faint'} style={{ fontSize: 10 }}>
              {weekdayShort(d).slice(0, 1)}
            </Text>
            <View style={[{ width: '100%', aspectRatio: 1, maxWidth: 42, borderRadius: 8 }, fill(d)]} />
          </View>
        ))}
      </View>
    );
  }

  const first = addDays(startOfWeek(today, weekStartsOn), -(weeks - 1) * 7);
  const cols = Array.from({ length: weeks }, (_, i) => addDays(first, i * 7));
  // Fewer weeks → bigger squares; a year gets thin rows so it fits.
  const h = weeks <= 5 ? 28 : weeks <= 13 ? 18 : weeks <= 26 ? 14 : 9;
  const gap = weeks > 26 ? 2 : 3;
  const long = weeks > 53;

  const grid = (
    <View style={{ flexDirection: 'row', gap }}>
      {cols.map((w) => (
        <View key={w} style={long ? { gap, width: 7 } : { gap, flex: 1, maxWidth: 44 }}>
          {range(w, 7).map((d) => (
            <View key={d} style={[{ height: h, borderRadius: weeks <= 5 ? 6 : 3 }, fill(d)]} />
          ))}
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ flexDirection: 'row', gap }}>
      <View style={{ gap, marginRight: 2 }}>
        {weekdayLetters(weekStartsOn).map((l, i) => (
          <View key={i} style={{ height: h, justifyContent: 'center' }}>
            <Text variant="caption" tone="faint" style={{ fontSize: 9 }}>
              {i % 2 === 0 ? l : ''}
            </Text>
          </View>
        ))}
      </View>
      {long ? (
        <ScrollView ref={scroll} horizontal showsHorizontalScrollIndicator={false} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}>
          {grid}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>{grid}</View>
      )}
    </View>
  );
}

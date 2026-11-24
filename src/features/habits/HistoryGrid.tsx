import { useRef, useState, type ComponentRef } from 'react';
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
  const [width, setWidth] = useState(300);
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
      <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
        {days.map((d) => (
          <View key={d} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <Text variant="caption" tone={d === today ? 'default' : 'faint'} style={{ fontSize: 10 }}>
              {weekdayShort(d).slice(0, 1)}
            </Text>
            <View style={[{ width: '100%', aspectRatio: 1, maxWidth: 28, borderRadius: 999 }, fill(d)]} />
          </View>
        ))}
      </View>
    );
  }

  const first = addDays(startOfWeek(today, weekStartsOn), -(weeks - 1) * 7);
  const cols = Array.from({ length: weeks }, (_, i) => addDays(first, i * 7));
  // A year or more scrolls sideways (opening at today) so the dots can stay a readable size.
  const long = weeks > 26;
  const gap = long ? 3 : weeks > 13 ? 3 : 5;
  // Round dots: the size comes from the available width so every dot is a true circle.
  const fit = (width - gap * (weeks - 1)) / weeks;
  const size = long ? 9 : Math.max(4, Math.min(weeks <= 5 ? 20 : 30, fit));

  const grid = (
    <View style={{ flexDirection: 'row', gap }}>
      {cols.map((w) => (
        <View key={w} style={{ gap }}>
          {range(w, 7).map((d) => (
            <View key={d} style={[{ width: size, height: size, borderRadius: size / 2 }, fill(d)]} />
          ))}
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ flexDirection: 'row', gap }}>
      <View style={{ gap, marginRight: 2 }}>
        {weekdayLetters(weekStartsOn).map((l, i) => (
          <View key={i} style={{ height: size, justifyContent: 'center' }}>
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
        <View style={{ flex: 1 }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
          {grid}
        </View>
      )}
    </View>
  );
}

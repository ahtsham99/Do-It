import { useState } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui';
import { addDays, range, startOfWeek, todayKey, weekdayLetters, weekdayShort } from '@/lib/dates';
import type { Habit } from '@/store/types';
import { useTheme } from '@/theme';
import { t } from '@/lib/i18n';

/**
 * Habit history, time running left → right. One week is a single row of
 * days; longer ranges are weeks side by side (each column one week).
 * Every range fits the width — no scrolling.
 */
export function HistoryGrid({ habit, weekStartsOn, weeks = 16 }: { habit: Habit; weekStartsOn: 0 | 1; weeks?: number }) {
  const { c, paint } = useTheme();
  const [width, setWidth] = useState(300);
  const [yearsWidth, setYearsWidth] = useState(260);
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

  // More than a year (Max): one dot per week, one row per year, so it always fits.
  if (weeks > 53) {
    const thisWeek = startOfWeek(today, weekStartsOn);
    const years = Math.ceil(weeks / 52);
    const g = 1.5;
    const sz = Math.max(2, (yearsWidth - g * 51) / 52);
    return (
      <View key="years" style={{ gap: 6 }} onLayout={(e) => setYearsWidth(Math.max(100, e.nativeEvent.layout.width - 40))}>
        {Array.from({ length: years }, (_, yi) => {
          // Rows end at this week: the last row is the latest year.
          const rowStart = addDays(thisWeek, -((years - 1 - yi) * 52 + 51) * 7);
          return (
            <View key={yi} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text variant="caption" tone="faint" style={{ fontSize: 9, width: 34 }}>
                {rowStart.slice(0, 4)}
              </Text>
              <View style={{ flexDirection: 'row', gap: g }}>
                {Array.from({ length: 52 }, (_, wi) => {
                  const ws = addDays(rowStart, wi * 7);
                  const daysIn = range(ws, 7).filter((d) => d <= today);
                  const done = daysIn.filter((d) => set.has(d)).length;
                  const future = ws > today;
                  return (
                    <View
                      key={ws}
                      style={{
                        width: sz,
                        height: sz,
                        borderRadius: sz / 2,
                        backgroundColor: future ? 'transparent' : done ? color : c.surfaceAlt,
                        opacity: future || !done ? 1 : 0.3 + 0.7 * (done / Math.max(1, daysIn.length)),
                        borderWidth: future ? 1 : 0,
                        borderColor: c.border,
                      }}
                    />
                  );
                })}
              </View>
            </View>
          );
        })}
        <Text variant="small" tone="faint" style={{ fontSize: 11 }}>
          {t('Each dot is one week — darker means more days done.')}
        </Text>
      </View>
    );
  }

  const first = addDays(startOfWeek(today, weekStartsOn), -(weeks - 1) * 7);
  const cols = Array.from({ length: weeks }, (_, i) => addDays(first, i * 7));
  // Everything fits the width (no scrolling). Long ranges use tight gaps so dots stay as big as possible.
  const gap = weeks > 26 ? 1.5 : 3;
  // Round dots: the size comes from the available width so every dot is a true circle.
  const fit = (width - gap * (weeks - 1)) / weeks;
  // 1M and 3M share one size: the 3-month fit.
  const size = weeks <= 13 ? Math.min(20, (width - gap * 12) / 13) : Math.max(3, fit);

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
      <View style={{ flex: 1 }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {grid}
      </View>
    </View>
  );
}

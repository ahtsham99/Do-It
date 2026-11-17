import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Press, Text } from '@/components/ui';
import { dayOfMonth, range, startOfWeek, todayKey, weekdayShort, type DayKey } from '@/lib/dates';
import { closedReason, liveBookings } from '@/features/booking/rules';
import { useRulesState } from '@/store/hooks';
import { radius, useTheme } from '@/theme';

export function WeekStrip({ value, onChange }: { value: DayKey; onChange: (d: DayKey) => void }) {
  const { c } = useTheme();
  const s = useRulesState();
  const days = useMemo(() => range(startOfWeek(value), 7), [value]);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of liveBookings(s.bookings)) m.set(b.date, (m.get(b.date) ?? 0) + 1);
    return m;
  }, [s.bookings]);
  const today = todayKey();
  return (
    <View style={styles.row}>
      {days.map((d) => {
        const sel = d === value;
        const closed = !!closedReason(s, d);
        const n = counts.get(d) ?? 0;
        return (
          <Press
            key={d}
            onPress={() => onChange(d)}
            accessibilityLabel={d}
            accessibilityState={{ selected: sel }}
            style={[styles.day, { backgroundColor: sel ? c.ink : 'transparent' }]}>
            <Text variant="small" color={sel ? c.inkText : c.textMuted} style={{ fontSize: 12 }}>
              {weekdayShort(d)}
            </Text>
            <Text variant="heading" color={sel ? c.inkText : closed ? c.textFaint : c.text} style={d === today && !sel ? { color: c.accent } : undefined}>
              {dayOfMonth(d)}
            </Text>
            <View style={styles.dots}>
              {closed && !n ? (
                <Text style={{ fontSize: 9 }} color={sel ? c.inkText : c.textFaint}>
                  shut
                </Text>
              ) : (
                Array.from({ length: Math.min(n, 4) }, (_, i) => <View key={i} style={[styles.dot, { backgroundColor: sel ? c.inkText : c.accent }]} />)
              )}
            </View>
          </Press>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
  day: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: radius.md, gap: 2, minHeight: 72 },
  dots: { flexDirection: 'row', gap: 3, height: 12, alignItems: 'center' },
  dot: { width: 5, height: 5, borderRadius: 3 },
});

import { StyleSheet, View } from 'react-native';

import { Press, Text } from '@/components/ui';
import { fromKey, range, startOfWeek, todayKey, weekdayShort, type DayKey } from '@/lib/dates';
import type { Task } from '@/store/types';
import { radius, useTheme } from '@/theme';

import { occurrencesOn } from './logic';

export function WeekStrip({
  selected,
  onSelect,
  tasks,
  weekStartsOn,
}: {
  selected: DayKey;
  onSelect: (d: DayKey) => void;
  tasks: Task[];
  weekStartsOn: 0 | 1;
}) {
  const { c } = useTheme();
  const today = todayKey();
  return (
    <View style={styles.row}>
      {range(startOfWeek(selected, weekStartsOn), 7).map((d) => {
        const sel = d === selected;
        const open = occurrencesOn(tasks, d).some((o) => !o.done);
        return (
          <Press
            key={d}
            haptic={false}
            onPress={() => onSelect(d)}
            style={[styles.day, { backgroundColor: sel ? c.accent : c.surface, borderColor: c.border }]}>
            <Text variant="caption" color={sel ? c.accentText : c.textMuted}>
              {weekdayShort(d).toUpperCase()}
            </Text>
            <Text variant="heading" color={sel ? c.accentText : d === today ? c.accent : c.text}>
              {fromKey(d).getDate()}
            </Text>
            <View style={[styles.dot, { backgroundColor: open ? (sel ? c.accentText : c.flame) : 'transparent' }]} />
          </Press>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  day: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 2,
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
});

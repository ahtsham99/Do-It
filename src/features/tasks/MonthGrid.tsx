import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Press, Text } from '@/components/ui';
import { fromKey, monthGrid, todayKey, weekdayLetters, type DayKey } from '@/lib/dates';
import type { Task } from '@/store/types';
import { useTheme } from '@/theme';

import { occurrencesOn } from './logic';

export function MonthGrid({
  month,
  selected,
  onSelect,
  tasks,
  weekStartsOn,
}: {
  month: DayKey;
  selected: DayKey;
  onSelect: (d: DayKey) => void;
  tasks: Task[];
  weekStartsOn: 0 | 1;
}) {
  const { c } = useTheme();
  const days = useMemo(() => monthGrid(month, weekStartsOn), [month, weekStartsOn]);
  const counts = useMemo(() => {
    const m = new Map<DayKey, { open: number; done: number }>();
    for (const d of days) {
      const occ = occurrencesOn(tasks, d);
      m.set(d, { open: occ.filter((o) => !o.done).length, done: occ.filter((o) => o.done).length });
    }
    return m;
  }, [days, tasks]);
  const today = todayKey();
  const monthIdx = fromKey(month).getMonth();

  return (
    <View>
      <View style={styles.week}>
        {weekdayLetters(weekStartsOn).map((l, i) => (
          <View key={i} style={styles.cell}>
            <Text variant="caption" tone="faint">
              {l}
            </Text>
          </View>
        ))}
      </View>
      {Array.from({ length: 6 }, (_, r) => (
        <View key={r} style={styles.week}>
          {days.slice(r * 7, r * 7 + 7).map((d) => {
            const inMonth = fromKey(d).getMonth() === monthIdx;
            const isSel = d === selected;
            const isToday = d === today;
            const n = counts.get(d)!;
            return (
              <Press key={d} haptic={false} onPress={() => onSelect(d)} style={styles.cell}>
                <View
                  style={[
                    styles.num,
                    isSel && { backgroundColor: c.accent },
                    !isSel && isToday && { backgroundColor: c.accentSoft },
                  ]}>
                  <Text
                    style={{ fontWeight: isToday || isSel ? '600' : '400' }}
                    color={isSel ? c.accentText : isToday ? c.accent : inMonth ? c.text : c.textFaint}>
                    {fromKey(d).getDate()}
                  </Text>
                </View>
                <View style={styles.dots}>
                  {n.open > 0 && (
                    <View style={[styles.dot, { backgroundColor: d < today ? c.danger : c.flame }]} />
                  )}
                  {n.done > 0 && <View style={[styles.dot, { backgroundColor: c.success }]} />}
                </View>
              </Press>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  week: { flexDirection: 'row' },
  cell: { flex: 1, alignItems: 'center', paddingVertical: 4, minHeight: 30 },
  num: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', gap: 3, height: 6, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3 },
});

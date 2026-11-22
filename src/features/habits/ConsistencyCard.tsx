import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, Icon, Press, Text } from '@/components/ui';
import { formatDay, todayKey } from '@/lib/dates';
import type { Habit } from '@/store/types';
import { SERIF, radius, space, useTheme } from '@/theme';

import { consistency } from './logic';

const PERIODS = [
  { key: 'week', label: 'Week', days: 7 },
  { key: 'month', label: 'Month', days: 30 },
] as const;

/** "Habits / Consistency": share of check-ins kept, with a daily bar chart. */
export function ConsistencyCard({ habits }: { habits: Habit[] }) {
  const { c } = useTheme();
  const [idx, setIdx] = useState(1);
  const period = PERIODS[idx];
  const today = todayKey();
  const data = useMemo(() => consistency(habits, period.days, today), [habits, period.days, today]);

  return (
    <Card style={{ gap: space.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <Icon name="flame-outline" size={16} color={c.textMuted} />
        <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>
          Habits / Consistency
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
            <Text style={{ fontFamily: SERIF, fontSize: 52, lineHeight: 56 }}>{data.pct}</Text>
            <Text tone="muted">%</Text>
          </View>
          <Text variant="small" tone="muted">
            {data.kept} of {data.expected} check-ins kept · {period.label.toLowerCase()}
          </Text>
        </View>
        <Press
          onPress={() => setIdx((idx + 1) % PERIODS.length)}
          accessibilityLabel="Change period"
          style={[styles.period, { backgroundColor: c.surfaceAlt }]}>
          <Text variant="small" style={{ fontWeight: '500' }}>
            {period.label}
          </Text>
          <Icon name="caret-down" size={10} color={c.textMuted} />
        </Press>
      </View>

      <View style={[styles.chart, { borderBottomColor: c.accent }]}>
        {data.series.map((v, i) => (
          <View key={i} style={styles.col}>
            <View
              style={{
                width: '100%',
                maxWidth: 14,
                height: `${Math.max(v * 100, 4)}%`,
                borderRadius: 4,
                backgroundColor: v > 0 ? c.accent : c.surfaceAlt,
              }}
            />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="small" tone="muted" style={{ fontSize: 12 }}>
          {formatDay(data.start, { relative: false }).split(' ').slice(1).join(' ')}
        </Text>
        <Text variant="small" tone="muted" style={{ fontSize: 12 }}>
          Today
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  period: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
  },
  chart: { height: 64, flexDirection: 'row', alignItems: 'flex-end', gap: 3, borderBottomWidth: 2, marginTop: space.sm },
  col: { flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
});

import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Card, Glyph, Icon, IconButton, Text } from '@/components/ui';
import { addDays, diffDays, formatDay, range, startOfWeek, todayKey, weekdayShort } from '@/lib/dates';
import { countFor } from '@/store/actions/habits';
import type { Habit } from '@/store/types';
import { SERIF, hexAlpha, space, useTheme } from '@/theme';

import { bestHabitStreak } from './logic';
import { t } from '@/lib/i18n';

/** Every habit × the 7 days of a week, with the week's numbers underneath. */
export function WeekGrid({ habits, weekStartsOn }: { habits: Habit[]; weekStartsOn: 0 | 1 }) {
  const { c, paint } = useTheme();
  const today = todayKey();
  const [start, setStart] = useState(() => startOfWeek(today, weekStartsOn));
  const days = range(start, 7);
  const isThisWeek = start === startOfWeek(today, weekStartsOn);

  // Expected check-ins: daily habits every day so far; weekly ones their target.
  const pastDays = days.filter((d) => d <= today);
  let expected = 0;
  let kept = 0;
  const perDayDone = days.map(() => 0);
  for (const h of habits) {
    const done = days.map((d) => h.history.includes(d));
    done.forEach((x, i) => x && perDayDone[i]++);
    const doneCount = done.filter(Boolean).length;
    if (h.frequency === 'daily') {
      expected += pastDays.length;
      kept += done.filter((x, i) => x && days[i] <= today).length;
    } else {
      expected += h.timesPerWeek;
      kept += Math.min(doneCount, h.timesPerWeek);
    }
  }
  const pct = expected ? Math.round((kept / expected) * 100) : 0;
  const bestIdx = perDayDone.indexOf(Math.max(...perDayDone));
  const total = perDayDone.reduce((a, b) => a + b, 0);
  const bestStreak = Math.max(0, ...habits.map((h) => bestHabitStreak(h, weekStartsOn)));

  return (
    <Card style={{ gap: space.md }}>
      <View style={styles.head}>
        <IconButton icon="chevron-back" label={t('Previous week')} size={14} diameter={30} onPress={() => setStart(addDays(start, -7))} />
        <Text variant="small" style={{ flex: 1, textAlign: 'center', fontWeight: '600' }}>
          {isThisWeek ? t('This week') : diffDays(start, startOfWeek(today, weekStartsOn)) === 7 ? 'Last week' : `${formatDay(start, { relative: false })} – ${formatDay(addDays(start, 6), { relative: false })}`}
        </Text>
        <IconButton icon="chevron-forward" label={t('Next week')} size={14} diameter={30} onPress={() => !isThisWeek && setStart(addDays(start, 7))} />
      </View>

      <View style={styles.row}>
        <View style={styles.nameCol} />
        {days.map((d) => (
          <Text key={d} variant="small" tone={d === today ? 'default' : 'muted'} style={[styles.cellText, d === today && { fontWeight: '700' }]}>
            {weekdayShort(d).slice(0, 1)}
          </Text>
        ))}
        <View style={styles.endCol} />
      </View>

      {habits.map((h) => {
        const color = paint(h.color);
        const target = Math.max(1, h.perDay ?? 1);
        const weekDone = days.filter((d) => h.history.includes(d)).length;
        const perfect = h.frequency === 'daily' ? weekDone === 7 : weekDone >= h.timesPerWeek;
        return (
          <View key={h.id} style={styles.row}>
            <View style={[styles.nameCol, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
              <Glyph value={h.icon} size={15} color={color} />
              <Text variant="small" numberOfLines={1} style={{ flex: 1, fontSize: 13 }}>
                {h.name}
              </Text>
            </View>
            {days.map((d) => {
              const done = h.history.includes(d);
              const part = target > 1 && !done ? countFor(h, d) / target : 0;
              return (
                <View key={d} style={styles.cell}>
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: done ? color : part > 0 ? hexAlpha(color.startsWith('#') ? color : '#888888', 0.25 + part * 0.5) : d > today ? 'transparent' : c.surfaceAlt,
                        borderColor: d > today ? c.border : 'transparent',
                      },
                    ]}
                  />
                </View>
              );
            })}
            <View style={styles.endCol}>{perfect ? <Icon name="ribbon" size={16} color={c.flame} /> : null}</View>
          </View>
        );
      })}

      <View style={[styles.totals, { borderTopColor: c.border }]}>
        <Total value={`${pct}%`} label={t('Kept')} />
        <Total value={total ? weekdayShort(days[bestIdx]) : '—'} label={t('Best day')} />
        <Total value={String(total)} label={t('Done')} />
        <Total value={`${bestStreak}`} label={t('Best streak')} />
      </View>
    </Card>
  );
}

function Total({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ fontFamily: SERIF, fontSize: 28, lineHeight: 32 }}>{value}</Text>
      <Text variant="small" tone="muted" style={{ fontSize: 11 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 28 },
  nameCol: { width: 104, paddingRight: 6 },
  endCol: { width: 22, alignItems: 'center' },
  cell: { flex: 1, alignItems: 'center' },
  cellText: { flex: 1, textAlign: 'center', fontSize: 11 },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1 },
  totals: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: space.md, marginTop: 2 },
});

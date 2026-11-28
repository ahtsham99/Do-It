import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useSheetTopInset } from '@/hooks/useTopInset';
import { Card, Glyph, Icon, Section, SheetHeader, Text } from '@/components/ui';
import { bestHabitStreak, habitStreak, streakLabel } from '@/features/habits/logic';
import { useNudges } from '@/features/nudges/useNudges';
import { addDays, diffDays, fromKey, range, startOfWeek, weekdayLetters } from '@/lib/dates';
import { HistoryGrid } from '@/features/habits/HistoryGrid';
import { HISTORY_RANGES, type HistoryRange } from '@/features/habits/historyRanges';
import { RangePicker } from '@/features/habits/RangePicker';
import type { Habit } from '@/store/types';
import { useHabits, useSettings } from '@/store/hooks';
import { useStore } from '@/store/store';
import { SERIF, space, useTheme } from '@/theme';
import { t } from '@/lib/i18n';


/** Your streak: how many days in a row you've shown up. */
export default function StreaksScreen() {
  const { c, paint } = useTheme();
  const sheetTop = useSheetTopInset();
  const n = useNudges();
  const { weekStartsOn } = useSettings();
  const stats = useStore((s) => s.stats);
  const habits = useHabits();
  const active = new Set(stats.activeDays);
  const [r, setR] = useState<HistoryRange>('1M');
  // Max = since your first active day.
  const weeks =
    r === 'Max'
      ? Math.max(5, Math.ceil((diffDays([...stats.activeDays].sort()[0] ?? n.today, n.today) + 1) / 7) + 1)
      : HISTORY_RANGES.find((x) => x.id === r)!.weeks;
  const first = addDays(startOfWeek(n.today, weekStartsOn), -(weeks - 1) * 7);
  const inRange = useMemo(() => {
    const days = diffDays(first, n.today) + 1;
    const act = stats.activeDays.filter((d) => d >= first && d <= n.today).sort();
    let best = 0;
    let run = 0;
    let prev = '';
    for (const d of act) {
      run = prev && addDays(prev, 1) === d ? run + 1 : 1;
      best = Math.max(best, run);
      prev = d;
    }
    return { days, active: act.length, best, planned: stats.plannedDays.filter((d) => d >= first && d <= n.today).length };
  }, [first, n.today, stats.activeDays, stats.plannedDays]);
  // The compact grid draws "a habit"; active days are its history.
  const activeAsHabit = { id: 'active', name: t('Active'), icon: '', color: c.accent, frequency: 'daily', timesPerWeek: 1, history: stats.activeDays, createdAt: 0, updatedAt: 0 } as Habit;

  const line = n.activeToday
    ? t('You showed up today. Come back tomorrow to keep it going.')
    : n.streak > 0
      ? t('One reminder, one habit or one focus session keeps it going today.')
      : t('Plan your day, tick a habit or finish one reminder to begin a streak.');

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingTop: sheetTop }}>
        <SheetHeader title={t('Streak')} cancelLabel={t('Close')} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={{ alignItems: 'center', gap: space.sm, paddingVertical: space.lg }}>
          <Icon name={n.activeToday ? 'flame' : 'flame-outline'} size={34} color={c.flame} />
          <Text style={{ fontFamily: SERIF, fontSize: 88, lineHeight: 92 }}>{n.streak}</Text>
          <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>
            {n.streak === 1 ? 'day in a row' : 'days in a row'}
          </Text>
          <Text tone="muted" style={{ textAlign: 'center', maxWidth: 300, lineHeight: 23, marginTop: space.sm }}>
            {line}
          </Text>
        </View>

        <RangePicker value={r} onChange={setR} />

        <View style={{ flexDirection: 'row', gap: space.md }}>
          <Stat label={t('Days active')} value={`${inRange.active}/${inRange.days}`} />
          <Stat label={t('Best streak')} value={String(inRange.best)} />
          <Stat label={t('Days planned')} value={String(inRange.planned)} />
        </View>

        <Section title={HISTORY_RANGES.find((x) => x.id === r)!.title}>
          {weeks > 5 ? (
            <Card>
              <HistoryGrid habit={activeAsHabit} weekStartsOn={weekStartsOn} weeks={weeks} />
            </Card>
          ) : (
          <Card style={{ gap: space.sm }}>
            <View style={styles.week}>
              {weekdayLetters(weekStartsOn).map((l, i) => (
                <View key={i} style={styles.cell}>
                  <Text variant="small" tone="faint" style={{ fontSize: 12 }}>
                    {l}
                  </Text>
                </View>
              ))}
            </View>
            {Array.from({ length: weeks }, (_, w) => (
              <View key={w} style={styles.week}>
                {range(addDays(first, w * 7), 7).map((d) => {
                  const on = active.has(d);
                  const future = d > n.today;
                  return (
                    <View key={d} style={styles.cell}>
                      <View
                        accessibilityLabel={`${d}${on ? t(', active') : ''}`}
                        style={[
                          styles.dot,
                          { backgroundColor: on ? c.accent : 'transparent', borderColor: d === n.today ? c.textMuted : on ? c.accent : c.border, opacity: future ? 0.35 : 1 },
                        ]}>
                        <Text style={{ fontSize: 12 }} color={on ? c.accentText : c.textMuted}>
                          {fromKey(d).getDate()}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </Card>
          )}
        </Section>

        {habits.length > 0 && (
          <Section title={t('Habit streaks')}>
            <Card padded={false} style={{ paddingHorizontal: space.xl - 4 }}>
              {habits.map((h, i) => {
                const s = habitStreak(h, n.today, weekStartsOn);
                return (
                  <View key={h.id} style={[styles.habit, i < habits.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border }]}>
                    <Glyph value={h.icon} size={22} color={paint(h.color)} />
                    <Text style={{ flex: 1, fontSize: 17 }} numberOfLines={1}>
                      {h.name}
                    </Text>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 17 }}>{streakLabel(h, s)}</Text>
                      <Text variant="small" tone="muted" style={{ fontSize: 12 }}>
                        best {Math.max(s, bestHabitStreak(h, weekStartsOn))}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </Card>
          </Section>
        )}
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card style={{ flex: 1, alignItems: 'center', gap: 2, paddingHorizontal: space.sm }}>
      <Text style={{ fontFamily: SERIF, fontSize: 34, lineHeight: 38 }}>{value}</Text>
      <Text variant="small" tone="muted" style={{ fontSize: 12, textAlign: 'center' }}>
        {label}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.xl - 4, gap: space.xl, paddingBottom: space.xxl * 2, maxWidth: 640, width: '100%', alignSelf: 'center' },
  week: { flexDirection: 'row' },
  cell: { flex: 1, alignItems: 'center', paddingVertical: 3 },
  dot: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  habit: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 64 },
});

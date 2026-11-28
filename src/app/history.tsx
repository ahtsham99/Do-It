import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Card, Glyph, Press, Section, SheetHeader, Text } from '@/components/ui';
import { HistoryGrid } from '@/features/habits/HistoryGrid';
import { HISTORY_RANGES, weeksFor, type HistoryRange } from '@/features/habits/historyRanges';
import { bestHabitStreak, habitStreak, streakLabel } from '@/features/habits/logic';
import { RangePicker } from '@/features/habits/RangePicker';
import { useSheetTopInset } from '@/hooks/useTopInset';
import { addDays, diffDays, range, startOfWeek, todayKey, weekdayShort } from '@/lib/dates';
import { useHabits, useSettings } from '@/store/hooks';
import type { Habit } from '@/store/types';
import { SERIF, space, useTheme } from '@/theme';
import { t } from '@/lib/i18n';

interface RangeStats {
  done: number;
  expected: number;
  pct: number;
}

/** Check-ins kept vs expected in a range (daily: every day so far; weekly: its target per week). */
function statsFor(h: Habit, start: string, today: string, weekStartsOn: 0 | 1): RangeStats {
  const from = start > today ? today : start;
  const days = diffDays(from, today) + 1;
  const inRange = h.history.filter((d) => d >= from && d <= today);
  if (h.frequency === 'daily') {
    return { done: inRange.length, expected: days, pct: days ? Math.min(100, Math.round((inRange.length / days) * 100)) : 0 };
  }
  // Weekly habits: extra check-ins beyond the weekly target don't count twice.
  const perWeek = new Map<string, number>();
  for (const d of inRange) {
    const w = startOfWeek(d, weekStartsOn);
    perWeek.set(w, (perWeek.get(w) ?? 0) + 1);
  }
  const done = [...perWeek.values()].reduce((m, n) => m + Math.min(n, h.timesPerWeek), 0);
  const expected = Math.max(1, Math.round((days / 7) * h.timesPerWeek));
  return { done: Math.min(done, expected), expected, pct: Math.min(100, Math.round((done / expected) * 100)) };
}

/** All habits' history together, for any range — opened from Stats. */
export default function HistoryScreen() {
  const { c, paint } = useTheme();
  const sheetTop = useSheetTopInset();
  const habits = useHabits();
  const { weekStartsOn } = useSettings();
  const params = useLocalSearchParams<{ range?: string }>();
  const [r, setR] = useState<HistoryRange>((HISTORY_RANGES.find((x) => x.id === params.range)?.id as HistoryRange) ?? '1M');
  const today = todayKey();
  const weeks = weeksFor(r, habits, today);
  const start = r === '1W' ? startOfWeek(today, weekStartsOn) : addDays(startOfWeek(today, weekStartsOn), -(weeks - 1) * 7);

  const all = useMemo(() => {
    const per = habits.map((h) => ({ h, s: statsFor(h, start, today, weekStartsOn) }));
    const done = per.reduce((m, x) => m + x.s.done, 0);
    const expected = per.reduce((m, x) => m + x.s.expected, 0);
    // Best day of the week across the range.
    const byWeekday = Array.from({ length: 7 }, () => 0);
    for (const h of habits) for (const d of h.history) if (d >= start && d <= today) byWeekday[new Date(`${d}T12:00:00`).getDay()]++;
    const bestWd = byWeekday.indexOf(Math.max(...byWeekday));
    return { per, done, pct: expected ? Math.min(100, Math.round((done / expected) * 100)) : 0, bestDay: done ? weekdayShort(range(startOfWeek(today, 0), 7)[bestWd]) : '—' };
  }, [habits, start, today, weekStartsOn]);

  const best = Math.max(0, ...habits.map((h) => bestHabitStreak(h, weekStartsOn)));

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingTop: sheetTop }}>
        <SheetHeader title={t('Habit history')} cancelLabel={t('Close')} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <RangePicker value={r} onChange={setR} />

        <Card style={{ gap: space.md }}>
          <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>
            {t('All habits')} · {t(HISTORY_RANGES.find((x) => x.id === r)!.title).toLowerCase()}
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <Big value={`${all.pct}%`} label={t('Kept')} />
            <Big value={String(all.done)} label={t('Check-ins')} />
            <Big value={all.bestDay} label={t('Best day')} />
            <Big value={String(best)} label={t('Best streak')} />
          </View>
        </Card>

        {habits.length === 0 ? (
          <Text tone="muted" style={{ textAlign: 'center' }}>
            {t('Add a habit to see its history here.')}
          </Text>
        ) : (
          all.per.map(({ h, s }) => {
            const color = paint(h.color);
            const streak = habitStreak(h, today, weekStartsOn);
            return (
              <Section key={h.id}>
                <Press haptic={false} onPress={() => router.push({ pathname: '/habit', params: { id: h.id } })}>
                  <Card style={{ gap: space.md }}>
                    <View style={styles.head}>
                      <Glyph value={h.icon} size={20} color={color} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 17, fontWeight: '500' }} numberOfLines={1}>
                          {h.name}
                        </Text>
                        <Text variant="small" tone="muted">
                          {s.done} of {s.expected} · {streak > 0 ? t('{length} streak', { length: streakLabel(h, streak) }) : t('no streak now')}
                        </Text>
                      </View>
                      <Text style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 34 }} color={color}>
                        {s.pct}
                        <Text variant="small" tone="muted">
                          %
                        </Text>
                      </Text>
                    </View>
                    <HistoryGrid habit={h} weekStartsOn={weekStartsOn} weeks={weeks} />
                  </Card>
                </Press>
              </Section>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

function Big({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 34 }}>{value}</Text>
      <Text variant="small" tone="muted" style={{ fontSize: 11 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.lg, paddingBottom: space.xxl * 2, maxWidth: 640, width: '100%', alignSelf: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md },
});

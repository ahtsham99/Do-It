import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Card, Icon, Press, Section, Text } from '@/components/ui';
import { GoalCard } from '@/features/goals/GoalCard';
import { HistoryGrid } from '@/features/habits/HistoryGrid';
import { WeekGrid } from '@/features/habits/WeekGrid';
import { useNudges } from '@/features/nudges/useNudges';
import { occurrencesInRange } from '@/features/tasks/logic';
import { addDays, diffDays, range, toKey, weekdayShort } from '@/lib/dates';
import { useGoals, useHabits, useReminders, useSettings, useTasks } from '@/store/hooks';
import type { Habit } from '@/store/types';
import { useStore } from '@/store/store';
import { SERIF, radius, space, useTheme } from '@/theme';

const HISTORY_RANGES = [
  { id: '1W', weeks: 1, title: 'This week' },
  { id: '1M', weeks: 5, title: 'Last month' },
  { id: '3M', weeks: 13, title: 'Last 3 months' },
  { id: '6M', weeks: 26, title: 'Last 6 months' },
  { id: '1Y', weeks: 52, title: 'Last year' },
  { id: 'Max', weeks: 0, title: 'Since you started' },
] as const;

/** Your progress: streak, the last 7 days, habits, focus and goals. */
export function StatsView() {
  const { c } = useTheme();
  const n = useNudges();
  const tasks = useTasks();
  const habits = useHabits();
  const goals = useGoals();
  const reminders = useReminders();
  const sessions = useStore((s) => s.sessions);
  const activeDays = useStore((s) => s.stats.activeDays);
  const { weekStartsOn } = useSettings();
  const [yearHabit, setYearHabit] = useState<Habit | null>(null);
  // Max: from the first habit check-in (or habit creation) until today.
  const maxWeeks = useMemo(() => {
    const firsts = habits.flatMap((h) => [h.history.length ? [...h.history].sort()[0] : n.today, toKey(new Date(h.createdAt))]);
    const first = firsts.filter((d) => d > '2000').sort()[0] ?? n.today;
    return Math.max(2, Math.ceil((diffDays(first, n.today) + 1) / 7) + 1);
  }, [habits, n.today]);
  const [histRange, setHistRange] = useState<(typeof HISTORY_RANGES)[number]['id']>('6M');

  const week = useMemo(() => {
    const start = addDays(n.today, -6);
    const days = range(start, 7);
    const occ = occurrencesInRange(tasks, start, 7);
    const focus = sessions.filter((x) => x.mode === 'focus' && !x.deletedAt && x.day >= start && x.day <= n.today);
    const perDay = days.map((d) => focus.filter((x) => x.day === d).reduce((m, x) => m + x.minutes, 0));
    const startMs = new Date(`${start}T00:00:00`).getTime();
    return {
      days,
      planned: occ.length,
      planDone: occ.filter((o) => o.done).length,
      focusMin: perDay.reduce((a, b) => a + b, 0),
      perDay,
      checkIns: habits.reduce((m, h) => m + h.history.filter((d) => d >= start && d <= n.today).length, 0),
      remindersDone: reminders.filter((r) => r.done && (r.doneAt ?? 0) >= startMs).length,
    };
  }, [n.today, tasks, sessions, habits, reminders]);

  const active = new Set(activeDays);
  const last14 = range(addDays(n.today, -13), 14);
  const maxMin = Math.max(30, ...week.perDay);
  const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`);
  const achieved = goals.filter((g) => g.completedAt).length;
  const inProgress = goals.filter((g) => !g.completedAt);

  return (
    <>
      <View style={{ gap: 2 }}>
        <Text style={{ fontFamily: SERIF, fontSize: 46, lineHeight: 50, letterSpacing: -0.8 }}>Your progress</Text>
        <Text variant="small" tone="muted">
          The last 7 days
        </Text>
      </View>

      {/* Streak */}
      <Press haptic={false} onPress={() => router.push('/streaks')}>
        <Card style={{ gap: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
            <Icon name={n.activeToday ? 'flame' : 'flame-outline'} size={30} color={c.flame} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: SERIF, fontSize: 44, lineHeight: 48 }}>
                {n.streak}
                <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2 }}>
                  {'  '}day streak
                </Text>
              </Text>
              <Text variant="small" tone="muted">
                Best {n.bestStreak} · {activeDays.length} days active in total
              </Text>
            </View>
            <Icon name="chevron-forward" size={18} color={c.textFaint} />
          </View>
          <View style={styles.dots}>
            {last14.map((d) => (
              <View key={d} style={[styles.day, { backgroundColor: active.has(d) ? c.accent : c.surfaceAlt, borderColor: d === n.today ? c.textMuted : 'transparent' }]} />
            ))}
          </View>
        </Card>
      </Press>

      {/* This week */}
      <View style={styles.grid}>
        <Stat value={`${week.planDone}/${week.planned}`} label="Plans done" icon="calendar-outline" />
        <Stat value={fmtMin(week.focusMin)} label="Focused" icon="timer-outline" onPress={() => router.push('/focus')} />
        <Stat value={String(week.checkIns)} label="Habit check-ins" icon="flame-outline" onPress={() => router.push('/habits')} />
        <Stat value={String(week.remindersDone)} label="Reminders done" icon="alarm-outline" onPress={() => router.push('/reminders')} />
      </View>

      {/* Focus by day */}
      <Section title="Focus by day">
        <Card style={{ gap: space.sm }}>
          <View style={styles.bars}>
            {week.perDay.map((m, i) => (
              <View key={week.days[i]} style={styles.barCol}>
                <View style={{ height: `${Math.max(4, (m / maxMin) * 100)}%`, width: '62%', borderRadius: 6, backgroundColor: m ? c.accent : c.surfaceAlt }} />
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row' }}>
            {week.days.map((d) => (
              <Text key={d} variant="small" tone={d === n.today ? 'default' : 'muted'} style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: d === n.today ? '700' : '400' }}>
                {weekdayShort(d).slice(0, 1)}
              </Text>
            ))}
          </View>
        </Card>
      </Section>

      {habits.length > 0 && (
        <Section title="Habits">
          <WeekGrid habits={habits} weekStartsOn={weekStartsOn} />
        </Section>
      )}

      {habits.length > 0 && (
        <Section title={HISTORY_RANGES.find((r) => r.id === histRange)!.title}>
          <Card style={{ gap: space.md }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
              {habits.map((h) => {
                const on = (yearHabit ?? habits[0]).id === h.id;
                return (
                  <Press key={h.id} onPress={() => setYearHabit(h)} style={[styles.chip, { backgroundColor: on ? c.accent : c.surfaceAlt }]}>
                    <Text variant="small" color={on ? c.accentText : c.text} style={{ fontWeight: '600' }}>
                      {h.icon} {h.name}
                    </Text>
                  </Press>
                );
              })}
            </ScrollView>
            <HistoryGrid habit={habits.find((h) => h.id === (yearHabit ?? habits[0]).id) ?? habits[0]} weekStartsOn={weekStartsOn} weeks={histRange === 'Max' ? maxWeeks : HISTORY_RANGES.find((r) => r.id === histRange)!.weeks} />
            <View style={[styles.ranges, { backgroundColor: c.surfaceAlt }]}>
              {HISTORY_RANGES.map((r) => {
                const on = r.id === histRange;
                return (
                  <Press key={r.id} onPress={() => setHistRange(r.id)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={[styles.range, on && { backgroundColor: c.surface }]}>
                    <Text variant="small" color={on ? c.text : c.textMuted} style={{ fontWeight: on ? '700' : '500' }}>
                      {r.id}
                    </Text>
                  </Press>
                );
              })}
            </View>
          </Card>
        </Section>
      )}

      {goals.length > 0 && (
        <Section title={`Goals · ${inProgress.length} in progress${achieved ? ` · ${achieved} achieved` : ''}`}>
          <View style={{ gap: space.sm }}>
            {inProgress.slice(0, 3).map((g) => (
              <GoalCard key={g.id} goal={g} compact />
            ))}
          </View>
        </Section>
      )}
    </>
  );
}

function Stat({ value, label, icon, onPress }: { value: string; label: string; icon: React.ComponentProps<typeof Icon>['name']; onPress?: () => void }) {
  const { c } = useTheme();
  const body = (
    <Card style={{ gap: 2, paddingVertical: space.md, paddingHorizontal: space.lg, borderRadius: radius.lg }}>
      <Icon name={icon} size={16} color={c.accent} />
      <Text style={{ fontFamily: SERIF, fontSize: 34, lineHeight: 40 }}>{value}</Text>
      <Text variant="small" tone="muted" style={{ fontSize: 13 }}>
        {label}
      </Text>
    </Card>
  );
  return (
    <View style={{ width: '48.5%' }}>
      {onPress ? (
        <Press haptic={false} onPress={onPress}>
          {body}
        </Press>
      ) : (
        body
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  chip: { height: 32, paddingHorizontal: 12, borderRadius: 16, justifyContent: 'center' },
  ranges: { flexDirection: 'row', borderRadius: radius.pill, padding: 3 },
  range: { flex: 1, height: 34, minWidth: 0, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  bars: { height: 90, flexDirection: 'row', alignItems: 'flex-end' },
  barCol: { flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
});

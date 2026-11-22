import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Empty, Icon, Press, Screen, Section, Text } from '@/components/ui';
import { CountdownCard } from '@/features/countdowns/CountdownCard';
import { FocusNowCard } from '@/features/focus/FocusNowCard';
import { GoalCard } from '@/features/goals/GoalCard';
import { HabitRing, tickHabit } from '@/features/habits/HabitCard';
import { habitStreak, isDueToday } from '@/features/habits/logic';
import { greeting, pick } from '@/features/nudges/messages';
import { ProgressCard } from '@/features/nudges/ProgressCard';
import { ReminderCard } from '@/features/nudges/ReminderCard';
import { StreakPill } from '@/features/nudges/StreakPill';
import { useNudges } from '@/features/nudges/useNudges';
import { QuickAdd } from '@/features/tasks/QuickAdd';
import { TaskList } from '@/features/tasks/TaskList';
import { addDays, formatDay } from '@/lib/dates';
import { occurrencesOn } from '@/features/tasks/logic';
import { DayHeadline, dayHeadline } from '@/features/today/DayHeadline';
import { NudgeStrip, type Nudge } from '@/features/today/NudgeStrip';
import { StatCard } from '@/features/today/StatCard';
import { UpNext } from '@/features/today/UpNext';
import { useCountdowns, useGoals, useHabits, useSettings, useTasks } from '@/store/hooks';
import { useStore } from '@/store/store';
import { LOGO, space, useTheme } from '@/theme';

// Dismissed reminder banners, remembered until the app reloads.
const dismissed = new Set<string>();

export default function TodayScreen() {
  const { c } = useTheme();
  const n = useNudges();
  const { tone, name, weekStartsOn } = useSettings();
  const habits = useHabits();
  const countdowns = useCountdowns();
  const [, force] = useState(0);

  const habitsLeft = habits.filter((h) => h.frequency === 'daily' && isDueToday(h, n.today, weekStartsOn));
  const next = countdowns.filter((x) => x.date >= n.today).sort((a, b) => (a.date < b.date ? -1 : 1))[0];
  const done = n.todays.length - n.open.length;
  const overdueIds = new Set(n.overdue.map((o) => o.task.id));
  const reminders = n.dueReminders.filter(
    (o) => !overdueIds.has(o.task.id) && !dismissed.has(`${o.task.id}:${n.today}`),
  );
  const needsAttention = !n.planned || n.overdue.length > 0;
  const timerIdle = useStore((s) => s.timer.status === 'idle');
  const tasks = useTasks();
  const activeGoals = useGoals().filter((g) => !g.completedAt);
  const sessions = useStore((s) => s.sessions);
  const focusToday = sessions.filter((x) => x.mode === 'focus' && x.day === n.today && !x.deletedAt).reduce((m, x) => m + x.minutes, 0);
  const upNext = [...n.open, ...occurrencesOn(tasks, addDays(n.today, 1)).filter((o) => !o.done)].slice(0, 2);
  const headline = dayHeadline({
    habitsLeft: habitsLeft.length,
    remindersLeft: n.open.length,
    totalToday: n.todays.length + habits.length,
    firstHabit: habitsLeft[0]?.name,
    firstReminder: n.open[0]?.task.title,
  });
  const initials = (name.trim() || 'Me').slice(0, 2).toUpperCase();
  const addTask = () => router.push({ pathname: '/task', params: { date: n.today } });

  const plural = (k: number, word: string) => `${k} ${word}${k === 1 ? '' : 's'}`;
  // Most important first. Only the first shows at the top, as one slim line.
  const nudges: Nudge[] = [];
  for (const o of reminders) {
    nudges.push({ key: `r:${o.task.id}`, kind: 'warning', icon: 'alarm-outline', title: `Reminder: ${o.task.title}`, onPress: () => router.push({ pathname: '/task', params: { id: o.task.id, day: n.today } }) });
  }
  if (!n.planned) nudges.push({ key: 'plan', kind: 'accent', icon: 'sunny-outline', title: 'Plan your day', onPress: () => router.push('/plan') });
  if (n.overdue.length > 0) nudges.push({ key: 'overdue', kind: 'danger', icon: 'time-outline', title: `${plural(n.overdue.length, 'task')} still waiting`, onPress: () => router.push('/plan') });
  if (n.evening && n.open.length > 0 && n.planned) nudges.push({ key: 'open', kind: 'warning', icon: 'moon-outline', title: `${n.open.length} left for today`, onPress: () => router.push('/planner') });
  if (n.streakAtRisk) nudges.push({ key: 'streak', kind: 'warning', icon: 'flame-outline', title: `Keep your ${n.streak}-day streak going`, onPress: () => router.push('/streaks') });
  const timerRunning = !timerIdle;

  const progressLine =
    n.open.length === 0
      ? pick('allDone', tone, n.today)
      : n.evening
        ? pick('unfinished', tone, n.today)
        : `${n.open.length} to go. One at a time.`;

  return (
    <View style={{ flex: 1 }}>
      <Screen contentStyle={{ gap: space.md + 2 }}>
        <View style={{ paddingTop: space.sm, gap: space.sm }}>
          <View style={styles.top}>
            <Text variant="display" accessibilityRole="header" style={{ flex: 1, fontFamily: LOGO, fontSize: 36, lineHeight: 42, letterSpacing: -0.8 }}>
              Do It
            </Text>
            <Press onPress={() => router.push('/plan')} hitSlop={10} accessibilityLabel="Plan your day" style={styles.bell}>
              <Icon name="notifications-outline" size={24} color={c.textMuted} />
              {needsAttention && <View style={[styles.bellDot, { backgroundColor: c.flame, borderColor: c.bg }]} />}
            </Press>
            <StreakPill streak={n.streak} activeToday={n.activeToday} />
            <Press
              onPress={() => router.push('/settings')}
              accessibilityLabel="Settings and profile"
              style={[styles.avatar, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
              <Text variant="small" tone="muted" style={{ fontWeight: '500', letterSpacing: 0.5 }}>
                {initials}
              </Text>
            </Press>
          </View>
          <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase', letterSpacing: 2.6, fontSize: 11, marginTop: 4 }}>
            {formatDay(n.today, { relative: false, long: true }).replace(',', '')}
          </Text>
          <Text style={{ fontSize: 17, marginTop: -2 }}>
            {greeting(n.now.getHours())}
            {name.trim() ? `, ${name.trim()}` : ''}
          </Text>
        </View>

        <DayHeadline {...headline} />

        {timerRunning ? (
          <FocusNowCard compact />
        ) : nudges[0] ? (
          <NudgeStrip nudge={nudges[0]} more={nudges.length - 1} onMore={() => router.push('/plan')} />
        ) : null}

        <Section
          title="Up next"
          right={
            <Press onPress={addTask} hitSlop={10} accessibilityLabel="Add reminder" style={styles.add}>
              <Icon name="add" size={16} color={c.accent} />
              <Text variant="small" color={c.accent} style={{ fontWeight: '600' }}>
                Add
              </Text>
            </Press>
          }>
          {upNext.length > 0 ? (
            <UpNext items={upNext} />
          ) : (
            <Text variant="small" tone="muted">
              Nothing coming up. Tap Add for anything you might forget.
            </Text>
          )}
        </Section>

        <View style={{ flexDirection: 'row', gap: space.md - 2 }}>
          <StatCard value={n.streak} unit="day streak" note={`Best ${n.bestStreak}`} href="/streaks" />
          <StatCard value={focusToday} unit="min" note="Focused today" href="/focus" />
        </View>

        {habits.length === 0 && (
          <Empty
            icon="flame-outline"
            title="Start one small habit"
            body="Something you can do in two minutes, every day. Small steps add up."
            action="Add a habit"
            onAction={() => router.push('/habit')}
          />
        )}

        {habits.length > 0 && (
          <Section
            title="Habits"
            right={
              <Press onPress={() => router.push('/habits')} hitSlop={10}>
                <Text variant="small" tone="muted">
                  All
                </Text>
              </Press>
            }>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.md, paddingHorizontal: 2, paddingBottom: 2 }}>
              {habits.map((h) => {
                const streak = habitStreak(h, n.today, weekStartsOn);
                return (
                  <View key={h.id} style={{ alignItems: 'center', gap: 4, width: 72 }}>
                    <HabitRing habit={h} size={58} onPress={() => tickHabit(h, n.today, tone, weekStartsOn)} />
                    <Text variant="small" tone="muted" numberOfLines={1} style={{ marginTop: 2, fontSize: 12 }}>
                      {h.name}
                    </Text>
                    <Text variant="small" color={streak > 0 ? c.flame : c.textFaint} style={{ fontSize: 12 }}>
                      {streak > 0 ? `🔥 ${streak}` : '—'}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </Section>
        )}

        {reminders.length > 0 && (
          <Section title="Due now">
            <View style={{ gap: space.sm }}>
              {reminders.map((o) => (
                <ReminderCard
                  key={o.task.id}
                  occ={o}
                  onDismiss={() => {
                    dismissed.add(`${o.task.id}:${n.today}`);
                    force((x) => x + 1);
                  }}
                />
              ))}
            </View>
          </Section>
        )}

        <Section title="Today">
          {n.todays.length === 0 ? (
            <Empty
              icon="alarm-outline"
              title="Nothing to remember today"
              body="Add anything you might forget. We’ll remind you at the right moment."
              action="Add a reminder"
              onAction={addTask}
            />
          ) : (
            <>
              <ProgressCard done={done} total={n.todays.length} line={progressLine} />
              <TaskList items={n.todays} />
            </>
          )}
          <QuickAdd date={n.today} />
          {n.open.length > 0 && timerIdle && (
            <Press onPress={() => router.push('/focus')} style={{ alignSelf: 'center', padding: space.sm }}>
              <Text variant="small" tone="muted" style={{ textDecorationLine: 'underline' }}>
                Putting something off? Focus on it for 5 minutes
              </Text>
            </Press>
          )}
          {n.todays.length === 0 && (
            <Press onPress={() => router.push('/suggestions')} style={{ alignSelf: 'center', padding: space.sm }}>
              <Text variant="small" tone="muted" style={{ textDecorationLine: 'underline' }}>
                Need ideas? See suggestions
              </Text>
            </Press>
          )}
        </Section>

        {activeGoals.length > 0 ? (
          <Section
            title="Goals"
            right={
              <Press onPress={() => router.push({ pathname: '/habits', params: { view: 'goals' } })} hitSlop={10}>
                <Text variant="small" tone="muted">
                  All
                </Text>
              </Press>
            }>
            <View style={{ gap: space.sm }}>
              {activeGoals.slice(0, 2).map((g) => (
                <GoalCard key={g.id} goal={g} compact />
              ))}
            </View>
          </Section>
        ) : (
          <Press onPress={() => router.push('/goal')} style={{ alignSelf: 'center', padding: space.sm }}>
            <Text variant="small" tone="muted" style={{ textDecorationLine: 'underline' }}>
              Set a goal to work towards
            </Text>
          </Press>
        )}

        {next && <CountdownCard item={next} hero />}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  bell: { width: 34, height: 42, alignItems: 'center', justifyContent: 'center' },
  bellDot: { position: 'absolute', top: 8, right: 4, width: 11, height: 11, borderRadius: 6, borderWidth: 2 },
  add: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 4 },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});

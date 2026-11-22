import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Banner, Empty, Fab, Icon, Press, Screen, Section, Text } from '@/components/ui';
import { CountdownCard } from '@/features/countdowns/CountdownCard';
import { FocusNowCard } from '@/features/focus/FocusNowCard';
import { HabitRing, tickHabit } from '@/features/habits/HabitCard';
import { habitStreak, isDueToday } from '@/features/habits/logic';
import { greeting, pick } from '@/features/nudges/messages';
import { ProgressCard } from '@/features/nudges/ProgressCard';
import { ReminderCard } from '@/features/nudges/ReminderCard';
import { StreakPill } from '@/features/nudges/StreakPill';
import { useNudges } from '@/features/nudges/useNudges';
import { QuickAdd } from '@/features/tasks/QuickAdd';
import { TaskList } from '@/features/tasks/TaskList';
import { formatDay } from '@/lib/dates';
import { useCountdowns, useHabits, useSettings } from '@/store/hooks';
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
  const initials = (name.trim() || 'Me').slice(0, 2).toUpperCase();
  const addTask = () => router.push({ pathname: '/task', params: { date: n.today } });
  const timerIdle = useStore((s) => s.timer.status === 'idle');

  const plural = (k: number, word: string) => `${k} ${word}${k === 1 ? '' : 's'}`;
  const nudges: React.ReactNode[] = [];
  // On web this card is the reminder; on native it backs up the notification.
  for (const o of reminders) {
    nudges.push(
      <ReminderCard
        key={o.task.id}
        occ={o}
        onDismiss={() => {
          dismissed.add(`${o.task.id}:${n.today}`);
          force((x) => x + 1);
        }}
      />,
    );
  }
  if (!n.planned) {
    nudges.push(
      <Banner key="plan" icon="sunny-outline" title="Plan your day" body={pick('planPrompt', tone, n.today)} action="Plan my day" onPress={() => router.push('/plan')} />,
    );
  }
  if (n.overdue.length > 0) {
    nudges.push(
      <Banner
        key="overdue"
        kind="danger"
        icon="time-outline"
        title={`${plural(n.overdue.length, 'task')} still waiting`}
        body={pick('overdue', tone, n.today)}
        action="Review"
        onPress={() => router.push('/plan')}
      />,
    );
  }
  if (n.evening && n.open.length > 0 && n.planned) {
    nudges.push(<Banner key="open" kind="warning" icon="moon-outline" title={`${n.open.length} left for today`} body={pick('unfinished', tone, n.today)} />);
  }
  if (n.evening && habitsLeft.length > 0) {
    nudges.push(
      <Banner
        key="habits"
        kind="warning"
        icon="flame-outline"
        title={`${plural(habitsLeft.length, 'habit')} still open today`}
        body={habitsLeft.map((h) => h.name).join(', ')}
        onPress={() => router.push('/habits')}
      />,
    );
  }
  if (n.streakAtRisk) {
    nudges.push(
      <Banner key="streak" kind="warning" icon="flame-outline" title={`Keep your ${n.streak}-day streak going`} body={pick('streakRisk', tone, n.today)} onPress={() => router.push('/streaks')} />,
    );
  }

  const progressLine =
    n.open.length === 0
      ? pick('allDone', tone, n.today)
      : n.evening
        ? pick('unfinished', tone, n.today)
        : `${n.open.length} to go. One at a time.`;

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <View style={{ paddingTop: space.xl, gap: space.md }}>
          <View style={styles.top}>
            <Text variant="display" accessibilityRole="header" style={{ flex: 1, fontFamily: LOGO, letterSpacing: -0.8 }}>
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
          <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase', letterSpacing: 3 }}>
            {formatDay(n.today, { relative: false, long: true }).replace(',', '')}
          </Text>
          <Text style={{ fontSize: 18 }}>
            {greeting(n.now.getHours())}
            {name.trim() ? `, ${name.trim()}` : ''}
          </Text>
        </View>

        {/* One quiet nudge at a time, most important first. */}
        {nudges[0]}
        {nudges.length > 1 && (
          <Press onPress={() => router.push('/plan')} hitSlop={8} style={{ alignSelf: 'center', marginTop: -space.sm }}>
            <Text variant="small" tone="muted">
              and {nudges.length - 1} more in your plan
            </Text>
          </Press>
        )}

        <FocusNowCard />

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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.lg, paddingHorizontal: 4, paddingBottom: 4 }}>
              {habits.map((h) => {
                const streak = habitStreak(h, n.today, weekStartsOn);
                return (
                  <View key={h.id} style={{ alignItems: 'center', gap: 6, width: 84 }}>
                    <HabitRing habit={h} size={68} onPress={() => tickHabit(h, n.today, tone, weekStartsOn)} />
                    <Text variant="small" tone="muted" numberOfLines={1} style={{ marginTop: 4 }}>
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

        {next && <CountdownCard item={next} hero />}
      </Screen>
      <Fab label="Add reminder" onPress={addTask} />
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  bell: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center' },
  bellDot: { position: 'absolute', top: 8, right: 4, width: 11, height: 11, borderRadius: 6, borderWidth: 2 },
  avatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});

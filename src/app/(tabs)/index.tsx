import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Banner, Empty, Fab, Icon, Press, Screen, Section, Text } from '@/components/ui';
import { CountdownCard } from '@/features/countdowns/CountdownCard';
import { HabitRing, tickHabit } from '@/features/habits/HabitCard';
import { habitStreak, isDueToday } from '@/features/habits/logic';
import { greeting, pick } from '@/features/nudges/messages';
import { ProgressCard } from '@/features/nudges/ProgressCard';
import { StreakPill } from '@/features/nudges/StreakPill';
import { useNudges } from '@/features/nudges/useNudges';
import { QuickAdd } from '@/features/tasks/QuickAdd';
import { TaskList } from '@/features/tasks/TaskList';
import { formatDay, formatTime } from '@/lib/dates';
import { useCountdowns, useHabits, useSettings } from '@/store/hooks';
import { space, useTheme } from '@/theme';

// Dismissed reminder banners, remembered until the app reloads.
const dismissed = new Set<string>();

export default function TodayScreen() {
  const { c } = useTheme();
  const n = useNudges();
  const { tone, name, use24h, weekStartsOn } = useSettings();
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

  const progressLine =
    n.open.length === 0
      ? pick('allDone', tone, n.today)
      : n.evening
        ? pick('unfinished', tone, n.today)
        : `${n.open.length} to go. ${pick('done', tone, n.today)}`;

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <View style={{ paddingTop: space.xl, gap: space.md }}>
          <View style={styles.top}>
            <Text variant="display" style={{ flex: 1 }}>
              Do It
            </Text>
            <Press onPress={() => router.push('/plan')} hitSlop={10} accessibilityLabel="Plan your day" style={styles.bell}>
              <Icon name="notifications-outline" size={24} color={c.textMuted} />
              {needsAttention && <View style={[styles.bellDot, { backgroundColor: c.flame, borderColor: c.bg }]} />}
            </Press>
            <StreakPill streak={n.streak} best={n.bestStreak} activeToday={n.activeToday} />
            <Press
              onPress={() => router.push('/settings')}
              accessibilityLabel="Settings"
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

        {/* Nudges: big, unmissable */}
        {(!n.planned || n.overdue.length > 0 || n.streakAtRisk || n.evening || reminders.length > 0) && (
          <View style={{ gap: space.md }}>
            {!n.planned && (
              <Banner
                kind="accent"
                icon="sunny"
                title="Plan your day"
                body={pick('planPrompt', tone, n.today)}
                action="Plan my day →"
                onPress={() => router.push('/plan')}
              />
            )}
            {n.overdue.length > 0 && (
              <Banner
                kind="danger"
                icon="alert-circle"
                title={`${n.overdue.length} overdue task${n.overdue.length === 1 ? '' : 's'}`}
                body={pick('overdue', tone, n.today)}
                action="Deal with it →"
                onPress={() => router.push('/plan')}
              />
            )}
            {n.streakAtRisk && n.planned && (
              <Banner kind="warning" icon="flame" title={`Your ${n.streak}-day streak is at risk`} body={pick('streakRisk', tone, n.today)} />
            )}
            {n.evening && habitsLeft.length > 0 && (
              <Banner
                kind="warning"
                icon="flame"
                title={`${habitsLeft.length} habit${habitsLeft.length === 1 ? '' : 's'} not ticked`}
                body={habitsLeft.map((h) => h.name).join(', ')}
              />
            )}
            {n.evening && n.open.length > 0 && n.planned && (
              <Banner kind="warning" icon="moon" title={`${n.open.length} unfinished today`} body={pick('unfinished', tone, n.today)} />
            )}
            {/* On web these banners are the reminder; on native they back up the notification. */}
            {reminders.map((o) => (
              <Banner
                key={o.task.id}
                kind="warning"
                icon="notifications"
                title={o.task.title}
                body={`${pick('reminder', tone, o.task.id)} ${o.task.time ? `due ${formatTime(o.task.time, use24h)}` : 'due today'}.`}
                onPress={() => router.push({ pathname: '/task', params: { id: o.task.id, day: n.today } })}
                onDismiss={() => {
                  dismissed.add(`${o.task.id}:${n.today}`);
                  force((x) => x + 1);
                }}
              />
            ))}
          </View>
        )}

        {next && <CountdownCard item={next} hero />}

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
              icon="sunny-outline"
              title="Today is clear"
              body="Nothing is waiting on you. Add a task when the day asks for one."
              action="Add a task"
              onAction={addTask}
            />
          ) : (
            <>
              <ProgressCard done={done} total={n.todays.length} line={progressLine} />
              <TaskList items={n.todays} />
            </>
          )}
          <QuickAdd date={n.today} />
          {n.todays.length === 0 && (
            <Press onPress={() => router.push('/suggestions')} style={{ alignSelf: 'center', padding: space.sm }}>
              <Text variant="small" tone="muted" style={{ textDecorationLine: 'underline' }}>
                Need ideas? See suggestions
              </Text>
            </Press>
          )}
        </Section>
      </Screen>
      <Fab label="Add task" onPress={addTask} />
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  bell: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center' },
  bellDot: { position: 'absolute', top: 8, right: 4, width: 11, height: 11, borderRadius: 6, borderWidth: 2 },
  avatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});

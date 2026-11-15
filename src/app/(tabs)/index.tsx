import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Banner, Screen, Section } from '@/components/ui';
import { CountdownCard } from '@/features/countdowns/CountdownCard';
import { pick, greeting } from '@/features/nudges/messages';
import { ProgressCard } from '@/features/nudges/ProgressCard';
import { StreakPill } from '@/features/nudges/StreakPill';
import { useNudges } from '@/features/nudges/useNudges';
import { QuickAdd } from '@/features/tasks/QuickAdd';
import { TaskList } from '@/features/tasks/TaskList';
import { formatDay, formatTime } from '@/lib/dates';
import { useCountdowns, useSettings } from '@/store/hooks';
import { space } from '@/theme';

// Dismissed reminder banners, remembered until the app reloads.
const dismissed = new Set<string>();

export default function TodayScreen() {
  const n = useNudges();
  const countdowns = useCountdowns();
  const comingUp = countdowns
    .filter((c) => c.date >= n.today)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(0, 2);
  const { tone, name, use24h } = useSettings();
  const [, force] = useState(0);
  const done = n.todays.length - n.open.length;
  const hour = n.now.getHours();

  const progressLine =
    n.todays.length === 0
      ? 'Nothing planned yet. An empty day is how streaks die.'
      : n.open.length === 0
        ? pick('allDone', tone, n.today)
        : n.evening
          ? pick('unfinished', tone, n.today)
          : `${n.open.length} to go. ${pick('done', tone, n.today)}`;

  const overdueIds = new Set(n.overdue.map((o) => o.task.id));
  const reminders = n.dueReminders.filter(
    (o) => !overdueIds.has(o.task.id) && !dismissed.has(`${o.task.id}:${n.today}`),
  );

  return (
    <Screen
      subtitle={formatDay(n.today, { relative: false, long: true })}
      title={`${greeting(hour)}${name ? `, ${name}` : ''}`}
      right={<StreakPill streak={n.streak} best={n.bestStreak} activeToday={n.activeToday} />}>
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
          <Banner
            kind="warning"
            icon="flame"
            title={`Your ${n.streak}-day streak is at risk`}
            body={pick('streakRisk', tone, n.today)}
          />
        )}
        {n.evening && n.open.length > 0 && n.planned && (
          <Banner
            kind="warning"
            icon="moon"
            title={`${n.open.length} unfinished today`}
            body={pick('unfinished', tone, n.today)}
          />
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

      <ProgressCard done={done} total={n.todays.length} line={progressLine} />

      <Section title="Today">
        <TaskList items={n.todays} />
        <QuickAdd date={n.today} />
      </Section>

      {comingUp.length > 0 && (
        <Section title="Coming up">
          <View style={{ gap: space.sm }}>
            {comingUp.map((c) => (
              <CountdownCard key={c.id} item={c} />
            ))}
          </View>
        </Section>
      )}
    </Screen>
  );
}

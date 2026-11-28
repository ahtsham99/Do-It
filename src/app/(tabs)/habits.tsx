import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Chip, Empty, IconButton, Press, Screen, Section, Segmented, Text } from '@/components/ui';
import { CountdownCard } from '@/features/countdowns/CountdownCard';
import { GoalCard } from '@/features/goals/GoalCard';
import { GOAL_TEMPLATES } from '@/features/goals/logic';
import { ConsistencyCard } from '@/features/habits/ConsistencyCard';
import { HabitCard } from '@/features/habits/HabitCard';
import { todayKey } from '@/lib/dates';
import { useCountdowns, useGoals, useHabits } from '@/store/hooks';
import { space, useTheme } from '@/theme';
import { t } from '@/lib/i18n';

type View_ = 'habits' | 'goals';
// Remember the chosen view while the app is open.
let lastView: View_ = 'habits';

export default function HabitsScreen() {
  const params = useLocalSearchParams<{ view?: string }>();
  const [view, setViewState] = useState<View_>(params.view === 'goals' ? 'goals' : lastView);
  const [seen, setSeen] = useState(params.view);
  if (params.view !== seen) {
    setSeen(params.view);
    if (params.view === 'goals' || params.view === 'habits') setViewState(params.view);
  }
  const setView = (v: View_) => {
    lastView = v;
    setViewState(v);
  };

  const { c } = useTheme();
  const habits = useHabits();
  const goals = useGoals();
  const countdowns = useCountdowns();
  const upcoming = countdowns.filter((x) => x.date >= todayKey()).sort((a, b) => (a.date < b.date ? -1 : 1));
  const today = todayKey();
  const daily = habits.filter((h) => h.frequency === 'daily');
  const weekly = habits.filter((h) => h.frequency === 'weekly');
  const doneToday = habits.filter((h) => h.history.includes(today)).length;
  const active = goals.filter((g) => !g.completedAt);
  const achieved = goals.filter((g) => g.completedAt);

  const subtitle =
    view === 'habits'
      ? habits.length
        ? t('{doneToday} of {n} ticked today', { doneToday, n: habits.length })
        : t('Small things, every day')
      : goals.length
        ? `${t('{n} in progress', { n: active.length })}${achieved.length ? ` · ${t('{n} achieved', { n: achieved.length })}` : ''}`
        : t('Goals and the days you’re counting down to');

  return (
    <Screen
      title={view === 'habits' ? t('Habits') : t('Goals')}
      subtitle={subtitle}
      right={<IconButton icon="add" label={view === 'habits' ? t('Add habit') : t('Add goal')} onPress={() => router.push(view === 'habits' ? '/habit' : '/goal')} />}>
      <Segmented<View_>
        tone="accent"
        value={view}
        onChange={setView}
        options={[
          { value: 'habits', label: t('Habits'), icon: 'flame-outline', badge: habits.length || undefined },
          { value: 'goals', label: t('Goals'), icon: 'flag-outline', badge: active.length || undefined },
        ]}
      />

      {view === 'habits' ? (
        habits.length === 0 ? (
          <Empty icon="flame-outline" title={t('No habits yet')} body={t('Start with one small thing you can do on any day.')} action={t('Add a habit')} onAction={() => router.push('/habit')} />
        ) : (
          <>
            <ConsistencyCard habits={habits} />
            <View style={{ gap: space.md }}>
              {daily.map((h) => (
                <HabitCard key={h.id} habit={h} />
              ))}
            </View>
            {weekly.length > 0 && (
              <Section title={t('Weekly')}>
                <View style={{ gap: space.lg }}>
                  {weekly.map((h) => (
                    <HabitCard key={h.id} habit={h} />
                  ))}
                </View>
              </Section>
            )}
          </>
        )
      ) : goals.length === 0 ? (
        <>
          <Empty
            icon="flag-outline"
            title={t('Set your first goal')}
            body={t('Pick something you’d be proud of, then break it into steps small enough to start today.')}
            action={t('Set a goal')}
            onAction={() => router.push('/goal')}
          />
          <Section title={t('Ideas to start from')}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              {GOAL_TEMPLATES.map((tpl, i) => (
                <Chip key={tpl.title} label={`${tpl.icon}  ${t(tpl.title)}`} onPress={() => router.push({ pathname: '/goal', params: { template: String(i) } })} />
              ))}
            </View>
          </Section>
        </>
      ) : (
        <>
          <View style={{ gap: space.md }}>
            {active.map((g) => (
              <GoalCard key={g.id} goal={g} />
            ))}
            {active.length === 0 && (
              <Text tone="muted" style={{ textAlign: 'center', paddingVertical: space.md }}>
                Every goal achieved. Time for a new one?
              </Text>
            )}
          </View>
          {achieved.length > 0 && (
            <Section title={t('Achieved')}>
              <View style={{ gap: space.md }}>
                {achieved.map((g) => (
                  <GoalCard key={g.id} goal={g} compact />
                ))}
              </View>
            </Section>
          )}
        </>
      )}

      {view === 'goals' && (
        <Section
          title={t('Countdowns')}
          right={
            <View style={{ flexDirection: 'row', gap: space.lg }}>
              <Press onPress={() => router.push('/countdown')} hitSlop={8}>
                <Text variant="small" color={c.accent} style={{ fontWeight: '600' }}>
                  {t('+ Add')}
                </Text>
              </Press>
              {countdowns.length > 0 && (
                <Press onPress={() => router.push('/countdowns')} hitSlop={8}>
                  <Text variant="small" tone="muted">
                    {t('All ›')}
                  </Text>
                </Press>
              )}
            </View>
          }>
          {upcoming.length ? (
            <View style={{ gap: space.sm }}>
              {upcoming.slice(0, 4).map((x) => (
                <CountdownCard key={x.id} item={x} />
              ))}
            </View>
          ) : (
            <Text variant="small" tone="muted">
              {t('Exams, trips, birthdays — add the days you’re counting down to.')}
            </Text>
          )}
        </Section>
      )}
    </Screen>
  );
}

import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Empty, Icon, IconButton, Press, Section, Text, showDialog } from '@/components/ui';
import { CountdownCard } from '@/features/countdowns/CountdownCard';
import { FocusNowCard } from '@/features/focus/FocusNowCard';
import { GoalCard } from '@/features/goals/GoalCard';
import { HabitRing, tickHabit } from '@/features/habits/HabitCard';
import { habitStreak } from '@/features/habits/logic';
import { greeting } from '@/features/nudges/messages';
import { ReminderCard } from '@/features/nudges/ReminderCard';
import { DueReminderCard, useDueReminders } from '@/features/reminders/DueReminders';
import { useNudges } from '@/features/nudges/useNudges';
import { occurrencesOn } from '@/features/tasks/logic';
import { MonthGrid } from '@/features/tasks/MonthGrid';
import { QuickAdd } from '@/features/tasks/QuickAdd';
import { WeekStrip } from '@/features/tasks/WeekStrip';
import { DayPlan } from '@/features/today/DayPlan';
import { FromEarlier } from '@/features/today/FromEarlier';
import { NudgeStrip, type Nudge } from '@/features/today/NudgeStrip';
import { StatCard } from '@/features/today/StatCard';
import { addDays, addMonths, diffDays, formatDay, fromKey, monthName, range, startOfWeek, type DayKey } from '@/lib/dates';
import { useCountdowns, useGoals, useHabits, useSettings, useTasks } from '@/store/hooks';
import { recall, remember } from '@/lib/uiMemory';
import { useStore } from '@/store/store';
import { SERIF, space, useTheme } from '@/theme';

import { dismissed } from './dismissed';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Big day title: Today / Tomorrow / Yesterday, or the weekday. */
function dayTitle(day: DayKey, today: DayKey) {
  const d = diffDays(today, day);
  if (d === 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  if (d === -1) return 'Yesterday';
  return WEEKDAYS[fromKey(day).getDay()];
}

/**
 * Today is a daily planner first: pick a day, see its plan as a timeline, add
 * to it in one line. Habits, goals and countdowns follow underneath.
 */
/** The daily planner: pick a day, see its plan as a timeline, add in one line. */
export function PlannerView() {
  const { c } = useTheme();
  const n = useNudges();
  const { tone, name, weekStartsOn } = useSettings();
  const tasks = useTasks();
  const habits = useHabits();
  const countdowns = useCountdowns();
  const activeGoals = useGoals().filter((g) => !g.completedAt);
  const sessions = useStore((s) => s.sessions);
  const timerIdle = useStore((s) => s.timer.status === 'idle');
  const [, force] = useState(0);
  const dueItems = useDueReminders();

  const [day, setDay] = useState<DayKey>(n.today);
  const [monthOpen, setMonthOpen] = useState(false);
  const [span, setSpanState] = useState<'day' | 'week'>(() => recall('plan.span', 'day'));
  const setSpan = (v: 'day' | 'week') => {
    remember('plan.span', v);
    setSpanState(v);
  };
  const isToday = day === n.today;
  const items = occurrencesOn(tasks, day);
  const done = items.filter((o) => o.done).length;

  const next = countdowns.filter((x) => x.date >= n.today).sort((a, b) => (a.date < b.date ? -1 : 1))[0];
  const focusToday = sessions.filter((x) => x.mode === 'focus' && x.day === n.today && !x.deletedAt).reduce((m, x) => m + x.minutes, 0);
  const overdueIds = new Set(n.overdue.map((o) => o.task.id));
  const reminders = n.dueReminders.filter((o) => !overdueIds.has(o.task.id) && !dismissed.has(`${o.task.id}:${n.today}`));

  // Most important first; only the first shows, as one slim line, and only on today.
  const nudges: Nudge[] = [];
  const tomorrow = addDays(n.today, 1);
  const tomorrowCount = occurrencesOn(tasks, tomorrow).length;
  // In the evening, the most useful thing is to set up tomorrow.
  const planTomorrow: Nudge | null =
    n.now.getHours() >= 17
      ? { key: 'tomorrow', kind: 'accent', icon: 'moon-outline', title: tomorrowCount ? `Plan tomorrow · ${tomorrowCount} planned so far` : 'Plan tomorrow while it’s fresh', onPress: () => (setSpan('day'), pick(tomorrow)) }
      : null;
  for (const r of dueItems) {
    nudges.push({ key: `ri:${r.id}`, kind: 'warning', icon: 'notifications-outline', title: `Remember: ${r.title}`, onPress: () => router.push({ pathname: '/reminder', params: { id: r.id } }) });
  }
  for (const o of reminders) {
    nudges.push({ key: `r:${o.task.id}`, kind: 'warning', icon: 'alarm-outline', title: `Reminder: ${o.task.title}`, onPress: () => router.push({ pathname: '/task', params: { id: o.task.id, day: n.today } }) });
  }
  if (planTomorrow) nudges.push(planTomorrow);
  if (n.streakAtRisk) nudges.push({ key: 'streak', kind: 'warning', icon: 'flame-outline', title: `Keep your ${n.streak}-day streak going`, onPress: () => router.push('/streaks') });

  const pick = (d: DayKey) => {
    setDay(d);
    setMonthOpen(false);
  };
  const pickFromStrip = (d: DayKey) => {
    pick(d);
    setSpan('day');
  };
  const step = (dir: 1 | -1) => setDay(monthOpen ? addMonths(day, dir) : addDays(day, 7 * dir));
  const weekStart = startOfWeek(day, weekStartsOn);
  const weekDays = range(weekStart, 7);
  const weekLabel = (() => {
    const thisWeek = startOfWeek(n.today, weekStartsOn);
    const d = diffDays(thisWeek, weekStart);
    return d === 0 ? 'This week' : d === 7 ? 'Next week' : d === -7 ? 'Last week' : `Week of ${formatDay(weekStart, { relative: false })}`;
  })();

  return (
    <>
      {/* Day title + calendar controls */}
      <View style={{ gap: 2 }}>
        <View style={styles.titleRow}>
          <Press haptic={false} onPress={() => setMonthOpen(!monthOpen)} accessibilityRole="button" accessibilityLabel={monthOpen ? 'Hide month' : 'Show month'} style={styles.titleBtn}>
            <Text style={{ fontFamily: SERIF, fontSize: 46, lineHeight: 50, letterSpacing: -0.8, flexShrink: 1 }} numberOfLines={1}>
              {monthOpen ? monthName(day) : span === 'week' ? weekLabel : dayTitle(day, n.today)}
            </Text>
            <Icon name={monthOpen ? 'chevron-up' : 'chevron-down'} size={20} color={c.textMuted} />
          </Press>
          {!isToday && (
            <Press onPress={() => pick(n.today)} style={[styles.todayPill, { backgroundColor: c.accentSoft }]} accessibilityRole="button">
              <Text variant="small" color={c.accent} style={{ fontWeight: '600' }}>
                Today
              </Text>
            </Press>
          )}
          <IconButton icon="chevron-back" label={monthOpen ? 'Previous month' : 'Previous week'} size={16} diameter={34} onPress={() => step(-1)} />
          <IconButton icon="chevron-forward" label={monthOpen ? 'Next month' : 'Next week'} size={16} diameter={34} onPress={() => step(1)} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <Text variant="small" tone="muted" numberOfLines={1} style={{ flex: 1 }}>
            {monthOpen
              ? `${fromKey(day).getFullYear()} · tap a day`
              : span === 'week'
                ? `${formatDay(weekStart, { relative: false })} – ${formatDay(addDays(weekStart, 6), { relative: false })}`
                : `${formatDay(day, { relative: false, long: true })}${isToday ? ` · ${greeting(n.now.getHours())}${name.trim() ? `, ${name.trim()}` : ''}` : ''}`}
          </Text>
          {!monthOpen && (
            <View style={[styles.span, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
              {(['day', 'week'] as const).map((v) => (
                <Press key={v} onPress={() => setSpan(v)} accessibilityRole="tab" accessibilityState={{ selected: span === v }} style={[styles.spanOpt, span === v && { backgroundColor: c.surface }]}>
                  <Text variant="small" color={span === v ? c.text : c.textMuted} style={{ fontWeight: '600', fontSize: 12 }}>
                    {v === 'day' ? 'Day' : 'Week'}
                  </Text>
                </Press>
              ))}
            </View>
          )}
        </View>
      </View>

      {monthOpen ? (
        <MonthGrid month={day} selected={day} onSelect={pickFromStrip} tasks={tasks} weekStartsOn={weekStartsOn} />
      ) : (
        <WeekStrip selected={day} onSelect={pickFromStrip} tasks={tasks} weekStartsOn={weekStartsOn} />
      )}

      {isToday && (!timerIdle ? <FocusNowCard compact /> : nudges[0] ? <NudgeStrip nudge={nudges[0]} more={nudges.length - 1} onMore={() => showDialog({ title: 'Also waiting', actions: nudges.slice(1).map((x) => ({ label: x.title, onPress: () => x.onPress?.() })) })} /> : null)}

      {span === 'week' && !monthOpen ? (
        <>
          {weekDays.map((d) => {
            const its = occurrencesOn(tasks, d);
            return (
              <Section
                key={d}
                title={formatDay(d)}
                right={
                  <Press onPress={() => pickFromStrip(d)} hitSlop={8}>
                    <Text variant="small" tone="muted">
                      {its.length ? `${its.filter((o) => o.done).length}/${its.length}` : 'Open'} ›
                    </Text>
                  </Press>
                }>
                <DayPlan day={d} items={its} compact />
              </Section>
            );
          })}
          <QuickAdd date={day < weekStart || day > addDays(weekStart, 6) ? weekStart : day} placeholder="Add to this week… e.g. Gym friday 7am" />
        </>
      ) : (
        <>
        {isToday && <FromEarlier items={n.overdue.filter((o) => o.day < n.today)} />}
        <Section
          title={isToday ? 'Your day' : `Plan for ${formatDay(day)}`}
          right={
            items.length ? (
              <Text variant="small" tone="muted">
                {done} of {items.length} done
              </Text>
            ) : undefined
          }>
          <DayPlan day={day} items={items} />
          <QuickAdd date={day} placeholder={isToday ? 'Add to today… e.g. Gym at 7am' : `Add to ${formatDay(day)}… e.g. Call mum 6pm`} />
          {isToday && n.open.length > 0 && timerIdle && (
            <Press onPress={() => router.push('/focus')} style={{ alignSelf: 'center', padding: space.xs }}>
              <Text variant="small" tone="muted" style={{ textDecorationLine: 'underline' }}>
                Putting something off? Focus on it for 5 minutes
              </Text>
            </Press>
          )}
        </Section>
        </>
      )}

      {/* Everything else */}
      {(reminders.length > 0 || dueItems.length > 0) && (
        <Section title="Due now">
          <View style={{ gap: space.sm }}>
            {dueItems.map((r) => (
              <DueReminderCard key={r.id} item={r} />
            ))}
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

      {habits.length === 0 ? (
        <Empty icon="flame-outline" title="Start one small habit" body="Something you can do in two minutes, every day." action="Add a habit" onAction={() => router.push('/habit')} />
      ) : (
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

      <View style={{ flexDirection: 'row', gap: space.md - 2 }}>
        <StatCard value={n.streak} unit="day streak" note={`Best ${n.bestStreak}`} href="/streaks" />
        <StatCard value={focusToday} unit="min" note="Focused today" href="/focus" />
      </View>

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
    </>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  titleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  todayPill: { height: 34, paddingHorizontal: 12, borderRadius: 17, justifyContent: 'center' },
  span: { flexDirection: 'row', borderRadius: 999, borderWidth: 1, padding: 2 },
  spanOpt: { height: 26, paddingHorizontal: 12, borderRadius: 999, justifyContent: 'center' },
});

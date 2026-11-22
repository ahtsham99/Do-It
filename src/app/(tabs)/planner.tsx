import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button, Empty, IconButton, Screen, Section, Segmented, Text, type IconName } from '@/components/ui';
import { MonthGrid } from '@/features/tasks/MonthGrid';
import { TaskList } from '@/features/tasks/TaskList';
import { WeekStrip } from '@/features/tasks/WeekStrip';
import {
  isDone,
  nextOccurrence,
  occurrencesOn,
  overdue,
  sortOccurrences,
  type Occurrence,
} from '@/features/tasks/logic';
import {
  addDays,
  addMonths,
  formatDay,
  fromKey,
  monthName,
  range,
  startOfWeek,
  todayKey,
  type DayKey,
} from '@/lib/dates';
import { useSettings, useTasks } from '@/store/hooks';
import { space } from '@/theme';

type View_ = 'day' | 'week' | 'month' | 'list';
const VIEWS: { value: View_; label: string; icon: IconName }[] = [
  { value: 'list', label: 'List', icon: 'list-outline' },
  { value: 'day', label: 'Day', icon: 'time-outline' },
  { value: 'week', label: 'Week', icon: 'calendar-outline' },
  { value: 'month', label: 'Month', icon: 'calendar-clear-outline' },
];

// Remember the chosen view while the app is open.
let lastView: View_ = 'list';

export default function PlannerScreen() {
  const tasks = useTasks();
  const { weekStartsOn } = useSettings();
  const [view, setViewState] = useState<View_>(lastView);
  const [day, setDay] = useState<DayKey>(todayKey());
  const today = todayKey();

  const setView = (v: View_) => {
    lastView = v;
    setViewState(v);
  };

  const step = (dir: 1 | -1) => {
    if (view === 'day') setDay(addDays(day, dir));
    else if (view === 'week') setDay(addDays(day, 7 * dir));
    else if (view === 'month') setDay(addMonths(day, dir));
  };

  const weekStart = startOfWeek(day, weekStartsOn);
  const label =
    view === 'day'
      ? formatDay(day, { long: true })
      : view === 'week'
        ? `${formatDay(weekStart, { relative: false })} – ${formatDay(addDays(weekStart, 6), { relative: false })}`
        : `${monthName(day)} ${fromKey(day).getFullYear()}`;

  const addFor = (d: DayKey) => router.push({ pathname: '/task', params: { date: d } });
  const add = () => addFor(view === 'list' ? today : day);
  const todays = occurrencesOn(tasks, today);
  const openCount = todays.filter((o) => !o.done).length + overdue(tasks).filter((o) => o.day < today).length;
  const doneCount = todays.filter((o) => o.done).length;

  return (
    <View style={{ flex: 1 }}>
      <Screen
        title="Reminders"
        subtitle={`${openCount} open · ${doneCount} done`}
        right={
          <>
            {day !== today && view !== 'list' && <Button small kind="secondary" label="Today" onPress={() => setDay(today)} style={{ height: 46 }} />}
            <IconButton icon="add" label="Add reminder" onPress={add} />
          </>
        }>
        <Segmented options={VIEWS} value={view} onChange={setView} />

        {view !== 'list' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <IconButton icon="chevron-back" label="Previous" size={18} diameter={40} onPress={() => step(-1)} />
            <Text variant="heading" style={{ flex: 1, textAlign: 'center' }} numberOfLines={1}>
              {label}
            </Text>
            <IconButton icon="chevron-forward" label="Next" size={18} diameter={40} onPress={() => step(1)} />
          </View>
        )}

        {view === 'day' && <DayView day={day} setDay={setDay} weekStartsOn={weekStartsOn} />}
        {view === 'week' && <WeekView start={weekStart} onAdd={addFor} />}
        {view === 'month' && (
          <>
            <MonthGrid month={day} selected={day} onSelect={setDay} tasks={tasks} weekStartsOn={weekStartsOn} />
            <Section title={formatDay(day)}>
              <TaskList items={occurrencesOn(tasks, day)} emptyText="Nothing planned for this day." />
            </Section>
          </>
        )}
        {view === 'list' && <ListView onAdd={add} />}
      </Screen>
    </View>
  );
}

function DayView({ day, setDay, weekStartsOn }: { day: DayKey; setDay: (d: DayKey) => void; weekStartsOn: 0 | 1 }) {
  const tasks = useTasks();
  const items = occurrencesOn(tasks, day);
  const open = items.filter((o) => !o.done).length;
  return (
    <>
      <WeekStrip selected={day} onSelect={setDay} tasks={tasks} weekStartsOn={weekStartsOn} />
      <Section title={items.length ? `${open} to do · ${items.length - open} done` : undefined}>
        <TaskList items={items} emptyText="Nothing planned for this day." />
      </Section>
    </>
  );
}

function WeekView({ start, onAdd }: { start: DayKey; onAdd: (d: DayKey) => void }) {
  const tasks = useTasks();
  return (
    <>
      {range(start, 7).map((d) => (
        <Section
          key={d}
          title={formatDay(d)}
          right={<IconButton icon="add" label={`Add reminder on ${formatDay(d)}`} size={16} diameter={32} onPress={() => onAdd(d)} />}>
          <TaskList items={occurrencesOn(tasks, d)} emptyText="—" />
        </Section>
      ))}
    </>
  );
}

function ListView({ onAdd }: { onAdd: () => void }) {
  const tasks = useTasks();
  const [showDone, setShowDone] = useState(false);
  const today = todayKey();
  const groups = useMemo(() => {
    const late = overdue(tasks);
    const lateIds = new Set(late.map((o) => o.task.id));
    const upcoming: Occurrence[] = [];
    const done: Occurrence[] = [];
    for (const task of tasks) {
      if (task.repeat === 'none' && isDone(task, task.date)) {
        done.push({ task, day: task.date, done: true });
        continue;
      }
      if (lateIds.has(task.id) && task.repeat === 'none') continue;
      const next = nextOccurrence(task, today);
      if (next) upcoming.push({ task, day: next, done: false });
    }
    upcoming.sort(sortOccurrences);
    done.sort((a, b) => (a.day < b.day ? 1 : -1));
    const byDay = new Map<DayKey, Occurrence[]>();
    for (const o of upcoming) byDay.set(o.day, [...(byDay.get(o.day) ?? []), o]);
    return { late, byDay: [...byDay.entries()], done: done.slice(0, 50) };
  }, [tasks, today]);

  return (
    <>
      {groups.late.length > 0 && (
        <Section title={`Overdue · ${groups.late.length}`}>
          <TaskList items={groups.late} showDate overdue />
        </Section>
      )}
      {groups.byDay.length === 0 && groups.late.length === 0 && (
        <Empty
          icon="list-outline"
          title="Nothing to remember"
          body="Add anything you don’t want to forget. We’ll remind you at the right moment."
          action="Add a reminder"
          onAction={onAdd}
        />
      )}
      {groups.byDay.map(([d, items]) => (
        <Section key={d} title={formatDay(d)}>
          <TaskList items={items} />
        </Section>
      ))}
      {groups.done.length > 0 && (
        <Section
          title={`Completed · ${groups.done.length}`}
          right={<Button small kind="ghost" label={showDone ? 'Hide' : 'Show'} onPress={() => setShowDone(!showDone)} />}>
          {showDone && <TaskList items={groups.done} showDate />}
        </Section>
      )}
    </>
  );
}

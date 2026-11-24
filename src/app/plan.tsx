import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useSheetTopInset } from '@/hooks/useTopInset';
import { Button, Card, Checkbox, Icon, Press, Section, SheetHeader, Text, showToast } from '@/components/ui';
import { completeTask } from '@/features/nudges/celebrate';
import { pick } from '@/features/nudges/messages';
import { useNudges } from '@/features/nudges/useNudges';
import { daysOverdue, type Occurrence } from '@/features/tasks/logic';
import { QuickAdd } from '@/features/tasks/QuickAdd';
import { TaskList } from '@/features/tasks/TaskList';
import { formatDay } from '@/lib/dates';
import { markPlanned } from '@/store/actions/stats';
import { deleteTask, moveToToday, skipOccurrence } from '@/store/actions/tasks';
import { useSettings } from '@/store/hooks';
import { radius, space, useTheme } from '@/theme';

/** The daily "plan your day" ritual. */
export default function PlanScreen() {
  const { c } = useTheme();
  const sheetTop = useSheetTopInset();
  const n = useNudges();
  const { tone } = useSettings();

  const lockIn = () => {
    markPlanned(n.today);
    showToast(n.todays.length ? 'Your day is planned.' : 'Planned. A light day ahead.', 'lock-closed');
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const leftovers = n.overdue.filter((o) => o.day < n.today);
  const lateToday = n.overdue.filter((o) => o.day === n.today);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingTop: sheetTop }}>
        <SheetHeader title="Plan your day" />
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: space.lg, gap: space.xl, paddingBottom: space.xxl * 2, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <View style={{ gap: space.xs }}>
          <Text variant="caption" tone="accent" style={{ textTransform: 'uppercase' }}>
            {formatDay(n.today, { relative: false, long: true })}
          </Text>
          <Text variant="title">{pick('planPrompt', tone, n.today)}</Text>
        </View>

        {leftovers.length > 0 && (
          <Section
            title={`1 · Leftovers (${leftovers.length})`}
            right={
              leftovers.some((o) => o.task.repeat === 'none') ? (
                <Button small kind="secondary" label="Move all to today" onPress={() => moveToToday(leftovers.map((o) => o.task.id))} />
              ) : null
            }>
            <Card padded={false} style={{ paddingHorizontal: space.lg }}>
              {leftovers.map((o) => (
                <Leftover key={o.task.id + o.day} occ={o} />
              ))}
            </Card>
            <Text variant="small" tone="muted">
              Move each one to today, or let it go. Either is fine.
            </Text>
          </Section>
        )}

        <Section title={`${leftovers.length ? '2' : '1'} · Today’s plan`}>
          {lateToday.length > 0 && (
            <Text variant="small" tone="danger">
              {lateToday.length} of these {lateToday.length === 1 ? 'is' : 'are'} past the planned time.
            </Text>
          )}
          <TaskList items={n.todays} />
          <QuickAdd date={n.today} placeholder="What will you get done today?" />
          {n.todays.length === 0 && (
            <Text variant="small" tone="muted">
              Three tasks make a good day. Begin with the one that matters most.
            </Text>
          )}
        </Section>

        <Button icon="lock-closed" label={n.planned ? 'Update plan' : 'Set my plan'} onPress={lockIn} />
      </ScrollView>
    </View>
  );
}

function Leftover({ occ }: { occ: Occurrence }) {
  const { c } = useTheme();
  const { task, day } = occ;
  return (
    <View style={[styles.row, { borderBottomColor: c.border }]}>
      <Checkbox checked={false} onToggle={() => completeTask(task, day)} label={`Complete ${task.title}`} />
      <View style={{ flex: 1 }}>
        <Text numberOfLines={2} style={{ fontWeight: '500' }}>
          {task.title}
        </Text>
        <Text variant="small" tone="danger">
          {formatDay(day)} · {daysOverdue(day)}d overdue
        </Text>
      </View>
      {task.repeat === 'none' && (
        <Press onPress={() => moveToToday([task.id])} style={[styles.act, { backgroundColor: c.accentSoft }]} accessibilityLabel="Move to today">
          <Text variant="small" tone="accent" style={{ fontWeight: '700' }}>
            Today
          </Text>
        </Press>
      )}
      <Press
        onPress={() => (task.repeat === 'none' ? deleteTask(task.id) : skipOccurrence(task, day))}
        style={[styles.act, { backgroundColor: c.surfaceAlt }]}
        accessibilityLabel="Drop it">
        <Icon name="trash-outline" size={16} color={c.textMuted} />
      </Press>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  act: { height: 32, paddingHorizontal: 10, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
});

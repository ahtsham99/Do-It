import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Icon, Press, Text, showDialog, showToast } from '@/components/ui';
import type { Occurrence } from '@/features/tasks/logic';
import { addDays, formatTime } from '@/lib/dates';
import { snoozeTask, updateTask } from '@/store/actions/tasks';
import { useSettings } from '@/store/hooks';
import { radius, space, useTheme } from '@/theme';

import { completeTask } from './celebrate';
import { pick } from './messages';

/**
 * A reminder that's due now, with the three things a forgetful person needs:
 * do it, push it back, or start a short focus session on it.
 */
export function ReminderCard({ occ, onDismiss }: { occ: Occurrence; onDismiss: () => void }) {
  const { c } = useTheme();
  const { tone, use24h } = useSettings();
  const { task, day } = occ;

  const later = () =>
    showDialog({
      title: 'Remind me again',
      actions: [
        { label: 'In 15 minutes', onPress: () => (snoozeTask(task.id, 15), showToast('We’ll remind you in 15 minutes.', 'alarm-outline')) },
        { label: 'In 1 hour', onPress: () => (snoozeTask(task.id, 60), showToast('We’ll remind you in an hour.', 'alarm-outline')) },
        { label: 'In 3 hours', onPress: () => (snoozeTask(task.id, 180), showToast('We’ll remind you in 3 hours.', 'alarm-outline')) },
        ...(task.repeat === 'none'
          ? [{ label: 'Tomorrow', onPress: () => (updateTask(task.id, { date: addDays(day, 1), snoozedUntil: null }), showToast('Moved to tomorrow.', 'calendar-outline')) }]
          : []),
      ],
    });

  return (
    <View style={[styles.wrap, { backgroundColor: c.warningSoft }]}>
      <View style={styles.top}>
        <View style={[styles.icon, { backgroundColor: c.surface }]}>
          <Icon name="alarm-outline" size={22} color={c.warning} />
        </View>
        <Press haptic={false} style={{ flex: 1, gap: 3 }} onPress={() => router.push({ pathname: '/task', params: { id: task.id, day } })}>
          <Text variant="heading">{task.title}</Text>
          <Text variant="small" tone="muted">
            {pick('reminder', tone, task.id)} {task.time ? `planned for ${formatTime(task.time, use24h)}` : 'planned for today'}.
          </Text>
        </Press>
        <Press onPress={onDismiss} hitSlop={14} accessibilityLabel="Dismiss" style={{ padding: 4 }}>
          <Icon name="close" size={20} color={c.textMuted} />
        </Press>
      </View>
      <View style={styles.actions}>
        <Action label="Done" icon="checkmark" onPress={() => completeTask(task, day)} primary />
        <Action label="Later" icon="alarm-outline" onPress={later} />
        <Action
          label="Focus"
          icon="timer-outline"
          onPress={() => router.push({ pathname: '/focus', params: { taskId: task.id } })}
        />
      </View>
    </View>
  );
}

function Action({ label, icon, onPress, primary }: { label: string; icon: React.ComponentProps<typeof Icon>['name']; onPress: () => void; primary?: boolean }) {
  const { c } = useTheme();
  return (
    <Press
      onPress={onPress}
      accessibilityRole="button"
      style={[styles.action, { backgroundColor: primary ? c.accent : c.surface, borderColor: primary ? c.accent : c.border }]}>
      <Icon name={icon} size={16} color={primary ? c.accentText : c.text} />
      <Text variant="small" color={primary ? c.accentText : c.text} style={{ fontWeight: '600' }}>
        {label}
      </Text>
    </Press>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.xl, padding: space.xl - 4, gap: space.lg },
  top: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  icon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: space.sm },
  action: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});

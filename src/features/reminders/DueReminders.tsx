import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, Press, Text, showDialog, showToast } from '@/components/ui';
import { useNow } from '@/features/nudges/useNow';
import { addDays, combine, todayKey } from '@/lib/dates';
import { snoozeReminder, toggleReminder, updateReminder } from '@/store/actions/reminders';
import { useReminders, useSettings } from '@/store/hooks';
import type { ReminderItem } from '@/store/types';
import { radius, space, useTheme } from '@/theme';

import { isDue, whenLabel } from './logic';

/** Reminders whose time has come (re-checked every minute). */
export function useDueReminders() {
  const now = useNow();
  const items = useReminders();
  return useMemo(() => items.filter((r) => isDue(r, now.getTime())).sort((a, b) => (a.remindAt ?? 0) - (b.remindAt ?? 0)), [items, now]);
}

export function DueReminderCard({ item }: { item: ReminderItem }) {
  const { c } = useTheme();
  const { use24h } = useSettings();

  const later = () =>
    showDialog({
      title: 'Remind me again',
      actions: [
        { label: 'In 15 minutes', onPress: () => (snoozeReminder(item.id, 15), showToast('We’ll remind you in 15 minutes.', 'alarm-outline')) },
        { label: 'In 1 hour', onPress: () => (snoozeReminder(item.id, 60), showToast('We’ll remind you in an hour.', 'alarm-outline')) },
        { label: 'This evening', onPress: () => (updateReminder(item.id, { snoozedUntil: Math.max(combine(todayKey(), '18:00').getTime(), Date.now() + 15 * 60_000) }), showToast('We’ll remind you this evening.', 'alarm-outline')) },
        { label: 'Tomorrow morning', onPress: () => (updateReminder(item.id, { snoozedUntil: combine(addDays(todayKey(), 1), '09:00').getTime() }), showToast('We’ll remind you tomorrow at 9am.', 'alarm-outline')) },
      ],
    });

  return (
    <View style={[styles.wrap, { backgroundColor: c.warningSoft }]}>
      <Press haptic={false} style={styles.top} onPress={() => router.push({ pathname: '/reminder', params: { id: item.id } })}>
        <View style={[styles.icon, { backgroundColor: c.surface }]}>
          <Icon name="notifications-outline" size={20} color={c.warning} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="heading" numberOfLines={2}>
            {item.title}
          </Text>
          <Text variant="small" tone="muted">
            Reminder · {whenLabel(item.remindAt!, use24h)}
          </Text>
        </View>
      </Press>
      <View style={styles.actions}>
        <Action label="Done" icon="checkmark" primary onPress={() => toggleReminder(item)} />
        <Action label="Later" icon="alarm-outline" onPress={later} />
      </View>
    </View>
  );
}

function Action({ label, icon, onPress, primary }: { label: string; icon: React.ComponentProps<typeof Icon>['name']; onPress: () => void; primary?: boolean }) {
  const { c } = useTheme();
  return (
    <Press onPress={onPress} accessibilityRole="button" style={[styles.action, { backgroundColor: primary ? c.accent : c.surface, borderColor: primary ? c.accent : c.border }]}>
      <Icon name={icon} size={16} color={primary ? c.accentText : c.text} />
      <Text variant="small" color={primary ? c.accentText : c.text} style={{ fontWeight: '600' }}>
        {label}
      </Text>
    </Press>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.xl, padding: space.lg, gap: space.md },
  top: { flexDirection: 'row', gap: space.md, alignItems: 'center' },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: space.sm },
  action: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', height: 42, borderRadius: radius.pill, borderWidth: 1 },
});

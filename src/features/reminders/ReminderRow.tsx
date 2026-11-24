import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Checkbox, Icon, Press, SwipeToDelete, Text, showToast } from '@/components/ui';
import { deleteReminder, toggleReminder, updateReminder } from '@/store/actions/reminders';
import { useSettings } from '@/store/hooks';
import type { ReminderItem } from '@/store/types';
import { space, useTheme } from '@/theme';

import { useNow } from '@/features/nudges/useNow';

import { whenLabel } from './logic';

export function ReminderRow({ item, listName, last }: { item: ReminderItem; listName?: string; last?: boolean }) {
  const { c } = useTheme();
  const { use24h } = useSettings();
  const now = useNow().getTime();
  const late = !item.done && !!item.remindAt && item.remindAt < now;
  const meta = [item.remindAt ? whenLabel(item.snoozedUntil && item.snoozedUntil > now ? item.snoozedUntil : item.remindAt, use24h) : null, listName].filter(Boolean);
  return (
    <SwipeToDelete
      borderRadius={0}
      onDelete={() => {
        deleteReminder(item.id);
        showToast(`Deleted “${item.title.length > 28 ? `${item.title.slice(0, 27)}…` : item.title}”`, 'trash-outline', {
          label: 'Undo',
          onPress: () => updateReminder(item.id, { deletedAt: null }),
        });
      }}>
      <View style={[styles.row, { backgroundColor: c.surface }, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border }]}>
        <Checkbox checked={item.done} onToggle={() => toggleReminder(item)} label={`Done: ${item.title}`} />
        <Press haptic={false} style={{ flex: 1, gap: 2 }} onPress={() => router.push({ pathname: '/reminder', params: { id: item.id } })}>
          <Text numberOfLines={2} tone={item.done ? 'faint' : 'default'} style={[{ fontWeight: '500' }, item.done && { textDecorationLine: 'line-through' }]}>
            {item.title}
          </Text>
          {meta.length > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {item.remindAt ? <Icon name="notifications-outline" size={12} color={late ? c.danger : c.textFaint} /> : null}
              <Text variant="small" tone={late ? 'danger' : 'muted'} numberOfLines={1}>
                {meta.join(' · ')}
              </Text>
            </View>
          )}
          {item.notes ? (
            <Text variant="small" tone="faint" numberOfLines={1}>
              {item.notes}
            </Text>
          ) : null}
        </Press>
      </View>
    </SwipeToDelete>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md, minHeight: 56 },
});

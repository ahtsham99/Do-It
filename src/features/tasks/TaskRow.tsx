import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Checkbox, Icon, Press, SwipeToDelete, Text } from '@/components/ui';
import { deleteTaskWithUndo } from '@/features/delete/deleteWithUndo';
import { formatDay, formatTime, nowTime, todayKey } from '@/lib/dates';
import { completeTask } from '@/features/nudges/celebrate';
import { useSettings } from '@/store/hooks';
import { space, useTheme } from '@/theme';

import { daysOverdue, type Occurrence } from './logic';
import { t } from '@/lib/i18n';

export function TaskRow({
  occ,
  showDate,
  overdue,
}: {
  occ: Occurrence;
  showDate?: boolean;
  overdue?: boolean;
}) {
  const { c } = useTheme();
  const { use24h } = useSettings();
  const { task, day, done } = occ;
  const today = todayKey();
  const isLate = !done && (day < today || (day === today && !!task.time && task.time < nowTime()));
  const late = overdue ? daysOverdue(day) : 0;
  const meta = [
    showDate ? formatDay(day) : null,
    task.time ? formatTime(task.time, use24h) : null,
    late > 0 ? t('{late}d overdue', { late }) : null,
  ].filter(Boolean);

  return (
    <SwipeToDelete onDelete={() => deleteTaskWithUndo(task, day)} borderRadius={0}>
    <View style={[styles.row, { borderBottomColor: c.border, backgroundColor: c.surface }]}>
      <Checkbox checked={done} onToggle={() => completeTask(task, day)} label={t('Complete {title}', { title: task.title })} />
      <Press
        haptic={false}
        style={styles.body}
        onPress={() => router.push({ pathname: '/task', params: { id: task.id, day } })}>
        <Text
          numberOfLines={2}
          tone={done ? 'faint' : 'default'}
          style={[{ fontWeight: '500' }, done && { textDecorationLine: 'line-through' }]}>
          {task.title}
        </Text>
        {(meta.length > 0 || task.repeat !== 'none' || task.reminder != null) && (
          <View style={styles.meta}>
            {meta.length > 0 && (
              <Text variant="small" tone={isLate ? 'danger' : 'muted'}>
                {meta.join(' · ')}
              </Text>
            )}
            {task.repeat !== 'none' && <Icon name="repeat" size={14} color={c.textFaint} />}
            {task.reminder != null && <Icon name="notifications-outline" size={13} color={c.textFaint} />}
          </View>
        )}
      </Press>
    </View>
    </SwipeToDelete>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  body: { flex: 1, gap: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});

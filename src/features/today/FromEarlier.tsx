import { StyleSheet, View } from 'react-native';

import { Button, Card, Checkbox, Icon, Press, Section, Text } from '@/components/ui';
import { completeTask } from '@/features/nudges/celebrate';
import { daysOverdue, type Occurrence } from '@/features/tasks/logic';
import { formatDay } from '@/lib/dates';
import { deleteTask, moveToToday, skipOccurrence } from '@/store/actions/tasks';
import { useSettings } from '@/store/hooks';
import { SERIF, radius, space, useTheme } from '@/theme';
import { t } from '@/lib/i18n';

/**
 * Plans from earlier days that never got done: do them, move them to today,
 * or let them go — right on the Plan page.
 */
export function FromEarlier({ items }: { items: Occurrence[] }) {
  const { why } = useSettings();
  const { c } = useTheme();
  if (items.length === 0) return null;
  const movable = items.filter((o) => o.task.repeat === 'none');
  return (
    <Section
      title={t('From earlier · {n}', { n: items.length })}
      right={movable.length > 1 ? <Button small kind="secondary" label={t('All to today')} onPress={() => moveToToday(movable.map((o) => o.task.id))} style={{ height: 32 }} /> : undefined}>
      {/* Your why, from your profile: a reminder of what this is all for. */}
      {why.trim() ? (
        <Text style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 19, lineHeight: 25, color: c.textMuted, marginBottom: space.sm }}>
          “{why.trim()}”
        </Text>
      ) : null}
      <Card padded={false} style={{ paddingHorizontal: space.lg }}>
        {items.map((o, i) => (
          <Leftover key={o.task.id + o.day} occ={o} last={i === items.length - 1} />
        ))}
      </Card>
    </Section>
  );
}

function Leftover({ occ, last }: { occ: Occurrence; last: boolean }) {
  const { c } = useTheme();
  const { task, day } = occ;
  return (
    <View style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border }]}>
      <Checkbox checked={false} onToggle={() => completeTask(task, day)} label={t('Complete {title}', { title: task.title })} />
      <View style={{ flex: 1 }}>
        <Text numberOfLines={2} style={{ fontWeight: '500' }}>
          {task.title}
        </Text>
        <Text variant="small" tone="danger">
          {formatDay(day)} · {t('{n}d ago', { n: daysOverdue(day) })}
        </Text>
      </View>
      {task.repeat === 'none' && (
        <Press onPress={() => moveToToday([task.id])} style={[styles.act, { backgroundColor: c.accentSoft }]} accessibilityLabel={t('Move {title} to today', { title: task.title })}>
          <Text variant="small" tone="accent" style={{ fontWeight: '700' }}>
            {t('Today')}
          </Text>
        </Press>
      )}
      <Press
        onPress={() => (task.repeat === 'none' ? deleteTask(task.id) : skipOccurrence(task, day))}
        style={[styles.act, { backgroundColor: c.surfaceAlt }]}
        accessibilityLabel={t('Let {title} go', { title: task.title })}>
        <Icon name="close" size={16} color={c.textMuted} />
      </Press>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.md },
  act: { height: 32, paddingHorizontal: 10, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
});

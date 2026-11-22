import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Card, Press, Text } from '@/components/ui';
import type { Occurrence } from '@/features/tasks/logic';
import { formatDay, formatTime } from '@/lib/dates';
import { useSettings } from '@/store/hooks';
import { radius, space, useTheme } from '@/theme';

/** The next two reminders, with a "Next" tag on the one to do now. */
export function UpNext({ items }: { items: Occurrence[] }) {
  const { c } = useTheme();
  const { use24h } = useSettings();
  if (items.length === 0) return null;
  return (
    <View style={styles.row}>
      {items.slice(0, 2).map((o, i) => (
        <Press
          key={`${o.task.id}:${o.day}`}
          haptic={false}
          onPress={() => router.push({ pathname: '/task', params: { id: o.task.id, day: o.day } })}
          style={{ flex: i === 0 ? 1.3 : 1 }}>
          <Card style={styles.card}>
            <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase', fontSize: 10, letterSpacing: 1.4 }} numberOfLines={1}>
              {formatDay(o.day)}
              {o.task.time ? ` · ${formatTime(o.task.time, use24h)}` : ''}
            </Text>
            <Text style={{ fontSize: 17, lineHeight: 22, fontWeight: '500' }} numberOfLines={3}>
              {o.task.title}
            </Text>
            {i === 0 && (
              <View style={[styles.tag, { backgroundColor: c.tag }]}>
                <Text color={c.tagText} style={{ fontSize: 11, fontWeight: '700' }}>
                  Next
                </Text>
              </View>
            )}
          </Card>
        </Press>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.md - 2, alignItems: 'stretch' },
  card: { flex: 1, gap: 6, padding: space.lg, borderRadius: radius.lg },
  tag: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, marginTop: 2 },
});

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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase', fontSize: 10, letterSpacing: 1.4, flexShrink: 1 }} numberOfLines={1}>
                {formatDay(o.day)}
                {o.task.time ? ` · ${formatTime(o.task.time, use24h)}` : ''}
              </Text>
              {i === 0 && (
                <View style={[styles.tag, { backgroundColor: c.tag }]}>
                  <Text color={c.tagText} style={{ fontSize: 10, fontWeight: '700' }}>
                    Next
                  </Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: 16, lineHeight: 21, fontWeight: '500' }} numberOfLines={2}>
              {o.task.title}
            </Text>
          </Card>
        </Press>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.md - 2, alignItems: 'stretch' },
  card: { flex: 1, gap: 4, paddingVertical: space.md + 2, paddingHorizontal: space.lg, borderRadius: radius.lg },
  tag: { borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
});

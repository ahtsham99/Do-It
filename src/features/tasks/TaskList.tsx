import { View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { space } from '@/theme';

import type { Occurrence } from './logic';
import { TaskRow } from './TaskRow';

export function TaskList({
  items,
  emptyText,
  showDate,
  overdue,
}: {
  items: Occurrence[];
  emptyText?: string;
  showDate?: boolean;
  overdue?: boolean;
}) {
  if (items.length === 0) {
    return emptyText ? (
      <Text tone="faint" variant="small" style={{ paddingVertical: space.sm, paddingHorizontal: 2 }}>
        {emptyText}
      </Text>
    ) : null;
  }
  return (
    <Card padded={false} style={{ paddingHorizontal: space.lg }}>
      <View style={{ marginBottom: -1 }}>
        {items.map((o) => (
          <TaskRow key={`${o.task.id}:${o.day}`} occ={o} showDate={showDate} overdue={overdue} />
        ))}
      </View>
    </Card>
  );
}

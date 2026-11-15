import { View } from 'react-native';

import { Card, Text } from '@/components/ui';
import { radius, space, useTheme } from '@/theme';

export function ProgressCard({ done, total, line }: { done: number; total: number; line: string }) {
  const { c } = useTheme();
  const pct = total ? done / total : 0;
  return (
    <Card style={{ gap: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Text variant="title">
          {done}
          <Text variant="heading" tone="faint">
            {' '}
            / {total}
          </Text>
        </Text>
        <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>
          {Math.round(pct * 100)}% done
        </Text>
      </View>
      <View style={{ height: 8, borderRadius: radius.pill, backgroundColor: c.surfaceAlt, overflow: 'hidden' }}>
        <View
          style={{
            width: `${Math.max(pct * 100, total ? 3 : 0)}%`,
            height: '100%',
            borderRadius: radius.pill,
            backgroundColor: pct === 1 ? c.success : c.accent,
          }}
        />
      </View>
      <Text variant="small" tone="muted">
        {line}
      </Text>
    </Card>
  );
}

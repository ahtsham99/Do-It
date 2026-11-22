import { router, type Href } from 'expo-router';
import { View } from 'react-native';

import { Card, Press, Text } from '@/components/ui';
import { SERIF, radius, space } from '@/theme';

/** Big number + small unit, AHEAD-style. */
export function StatCard({ value, unit, note, href }: { value: string | number; unit: string; note?: string; href?: Href }) {
  const body = (
    <Card style={{ paddingVertical: space.md, paddingHorizontal: space.lg, borderRadius: radius.lg, gap: 2, flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
        <Text style={{ fontFamily: SERIF, fontSize: 40, lineHeight: 44 }}>{value}</Text>
        <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: 1.2, flexShrink: 1 }}>
          {unit}
        </Text>
      </View>
      {note ? (
        <Text variant="small" tone="muted" style={{ fontSize: 13 }}>
          {note}
        </Text>
      ) : null}
    </Card>
  );
  return href ? (
    <Press haptic={false} onPress={() => router.push(href)} style={{ flex: 1 }}>
      {body}
    </Press>
  ) : (
    <View style={{ flex: 1 }}>{body}</View>
  );
}

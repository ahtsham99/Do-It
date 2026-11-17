import { View } from 'react-native';

import { Text } from '@/components/ui';
import { radius, space, useTheme } from '@/theme';

/** How a text message looks on the client's phone. */
export function TextBubble({ body, meta }: { body: string; meta?: string }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 4, alignItems: 'flex-start' }}>
      <View style={{ backgroundColor: c.surfaceAlt, borderRadius: radius.lg, borderBottomLeftRadius: 6, padding: space.md, maxWidth: '92%' }}>
        <Text variant="small" style={{ lineHeight: 20 }} selectable>
          {body}
        </Text>
      </View>
      {meta && (
        <Text variant="small" tone="faint" style={{ fontSize: 12, marginLeft: 4 }}>
          {meta}
        </Text>
      )}
    </View>
  );
}

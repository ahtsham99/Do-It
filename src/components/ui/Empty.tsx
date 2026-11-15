import { View } from 'react-native';

import { space, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export function Empty({ icon, title, body }: { icon: IconName; title: string; body?: string }) {
  const { c } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: space.xxl, gap: space.sm }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: c.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: space.sm,
        }}>
        <Icon name={icon} size={28} color={c.textMuted} />
      </View>
      <Text variant="heading">{title}</Text>
      {body && (
        <Text tone="muted" style={{ textAlign: 'center', maxWidth: 280 }}>
          {body}
        </Text>
      )}
    </View>
  );
}

import Ionicons from '@expo/vector-icons/Ionicons';
import { Text } from 'react-native';

/**
 * Renders a user-chosen icon. New data stores an emoji; older data may still
 * hold an Ionicons name, so both are supported.
 */
export function Glyph({ value, size = 24, color = '#fff' }: { value: string; size?: number; color?: string }) {
  if (/^[a-z0-9-]+$/.test(value)) {
    return <Ionicons name={value as never} size={size} color={color} />;
  }
  return (
    <Text allowFontScaling={false} style={{ fontSize: size, lineHeight: size * 1.25, textAlign: 'center' }}>
      {value}
    </Text>
  );
}

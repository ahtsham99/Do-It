import { Image, View } from 'react-native';

import { useTheme } from '@/theme';

import { Text } from './Text';

export function initials(name: string) {
  const parts = name.replace(/[^\p{L}\s]/gu, '').trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '·';
}

/** Round photo, or initials on a quiet tint. */
export function Avatar({ name, photo, size = 44, strong }: { name: string; photo?: string | null; size?: number; strong?: boolean }) {
  const { c } = useTheme();
  if (photo) return <Image source={{ uri: photo }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c.surfaceAlt }} />;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: strong ? c.ink : c.accentSoft,
      }}>
      <Text
        color={strong ? c.inkText : c.accent}
        style={{ fontSize: size * 0.36, fontWeight: '600', letterSpacing: 0.5 }}>
        {initials(name)}
      </Text>
    </View>
  );
}

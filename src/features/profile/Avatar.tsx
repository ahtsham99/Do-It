import { Image, View } from 'react-native';

import { Text } from '@/components/ui';
import { useSettings } from '@/store/hooks';
import { SERIF, useTheme } from '@/theme';

export const isPhoto = (a: string) => a.startsWith('data:') || a.startsWith('file:') || a.startsWith('http') || a.startsWith('blob:');

/** Your profile picture: photo, emoji or initials. */
export function Avatar({ size, ring, small }: { size: number; ring?: boolean; small?: boolean }) {
  const { c } = useTheme();
  const { avatar, name } = useSettings();
  const initials = (name.trim() || 'Me').slice(0, 2).toUpperCase();
  const inner = ring ? size - 8 : size;
  const body = (
    <View
      style={{
        width: inner,
        height: inner,
        borderRadius: inner / 2,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: c.surfaceAlt,
        borderWidth: ring ? 0 : 1,
        borderColor: c.border,
      }}>
      {isPhoto(avatar) ? (
        <Image source={{ uri: avatar }} style={{ width: inner, height: inner }} resizeMode="cover" accessibilityLabel="Profile picture" />
      ) : avatar ? (
        <Text style={{ fontSize: inner * 0.5, lineHeight: inner * 0.62 }}>{avatar}</Text>
      ) : (
        <Text tone="muted" style={small ? { fontWeight: '500', letterSpacing: 0.5, fontSize: Math.round(inner * 0.33) } : { fontFamily: SERIF, fontSize: inner * 0.38, lineHeight: inner * 0.46 }}>
          {initials}
        </Text>
      )}
    </View>
  );
  if (!ring) return body;
  return <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 3, borderColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>{body}</View>;
}

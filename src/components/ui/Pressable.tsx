import * as Haptics from 'expo-haptics';
import { Platform, Pressable as RNPressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

export function tap(kind: 'light' | 'medium' | 'success' = 'light') {
  if (Platform.OS === 'web') return;
  if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  else Haptics.impactAsync(kind === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** Pressable with a subtle press state and optional haptic. */
export function Press({
  style,
  haptic = true,
  onPress,
  ...rest
}: Omit<PressableProps, 'style'> & { style?: StyleProp<ViewStyle>; haptic?: boolean }) {
  return (
    <RNPressable
      {...rest}
      onPress={(e) => {
        if (haptic) tap();
        onPress?.(e);
      }}
      style={({ pressed }) => [style, pressed && { opacity: 0.65, transform: [{ scale: 0.98 }] }]}
    />
  );
}

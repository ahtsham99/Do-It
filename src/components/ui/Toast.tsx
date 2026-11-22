import { useEffect, useState, useSyncExternalStore } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, space, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Press } from './Pressable';
import { Text } from './Text';

interface ToastAction {
  label: string;
  onPress: () => void;
}
interface Toast {
  id: number;
  text: string;
  icon?: IconName;
  action?: ToastAction;
}
let current: Toast | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

/** Brief message at the top. With an action (e.g. Undo) it stays a little longer. */
export function showToast(text: string, icon: IconName = 'checkmark-circle', action?: ToastAction) {
  current = { id: Date.now(), text, icon, action };
  emit();
  if (timer) clearTimeout(timer);
  timer = setTimeout(hide, action ? 5000 : 2400);
}

function hide() {
  current = null;
  emit();
}

export function ToastHost() {
  const t = useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => current,
    () => current,
  );
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.spring(anim, { toValue: t ? 1 : 0, useNativeDriver: true, friction: 8 }).start();
  }, [t, anim]);

  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { alignItems: 'center' }]}>
      <Animated.View
        pointerEvents={t?.action ? 'auto' : 'none'}
        style={[
          styles.toast,
          {
            top: insets.top + space.sm,
            backgroundColor: c.ink,
            opacity: anim,
            transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
          },
        ]}>
        {t?.icon && <Icon name={t.icon} size={20} color={c.flame} />}
        <Text variant="bodyStrong" color={c.inkText} style={{ flexShrink: 1 }}>
          {t?.text ?? ''}
        </Text>
        {t?.action && (
          <Press
            onPress={() => {
              const a = t.action!;
              hide();
              a.onPress();
            }}
            hitSlop={10}
            accessibilityRole="button"
            style={{ marginLeft: space.sm, paddingHorizontal: space.md, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: 'rgba(127,127,127,0.25)' }}>
            <Text variant="bodyStrong" color={c.inkText}>
              {t.action.label}
            </Text>
          </Press>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.pill,
    maxWidth: 420,
    marginHorizontal: space.lg,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});

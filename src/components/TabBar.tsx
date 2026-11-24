import { BlurView } from 'expo-blur';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { Icon, Press, Text, type IconName } from '@/components/ui';
import { useTabBarBottom } from '@/hooks/useTopInset';
import { radius, useTheme } from '@/theme';

export const TAB_META: Record<string, { title: string; icon: IconName }> = {
  index: { title: 'Today', icon: 'sunny-outline' },
  habits: { title: 'Habits', icon: 'flame-outline' },
  reminders: { title: 'Reminders', icon: 'alarm-outline' },
  focus: { title: 'Focus', icon: 'timer-outline' },
};

/** Floating, pill-shaped tab bar. */
export function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const { c, dark } = useTheme();
  const tabBottom = useTabBarBottom();
  const active = c.accent;
  // A single highlight that slides between tabs.
  const visible = state.routes.map((r, i) => ({ r, i })).filter(({ r }) => TAB_META[r.name]);
  const at = visible.findIndex(({ i }) => i === state.index);
  const [barW, setBarW] = useState(0);
  const [pillY, setPillY] = useState(12);
  const [x] = useState(() => new Animated.Value(0));
  const itemW = barW ? (barW - 2 - 8) / visible.length : 0;
  const target = 4 + Math.max(0, at) * itemW + (itemW - 46) / 2;
  const placed = useRef(false);
  useEffect(() => {
    if (!itemW) return;
    // First time: jump into place; afterwards, slide.
    if (!placed.current) {
      x.setValue(target);
      placed.current = true;
      return;
    }
    Animated.spring(x, { toValue: target, useNativeDriver: true, friction: 9, tension: 90 }).start();
  }, [target, itemW, x]);

  return (
    <View pointerEvents="box-none" style={[styles.outer, { paddingBottom: tabBottom }]}>
      <View onLayout={(e) => setBarW(e.nativeEvent.layout.width)} style={[styles.bar, { borderColor: c.border, boxShadow: `0px 10px 30px ${c.shadow}` }]}>
        {/* Frosted glass: blurred content behind a translucent tint. */}
        <BlurView intensity={60} tint={dark ? 'dark' : 'light'} style={[StyleSheet.absoluteFill, styles.glass, { backgroundColor: c.tabBar }]} />
        {itemW > 0 && at >= 0 && (
          <Animated.View pointerEvents="none" style={[styles.slider, { top: pillY, backgroundColor: c.accentSoft, transform: [{ translateX: x }] }]} />
        )}
        {state.routes.map((route, i) => {
          const meta = TAB_META[route.name];
          if (!meta) return null;
          const focused = state.index === i;
          const onPress = () => {
            const e = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !e.defaultPrevented) navigateToTab(route.key);
          };
          return (
            <Press
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={meta.title}
              style={styles.item}>
              <View style={styles.iconPill} onLayout={i === visible[0]?.i ? (e) => setPillY(e.nativeEvent.layout.y) : undefined}>
                <Icon name={meta.icon} size={22} color={focused ? active : c.textMuted} />
              </View>
              <Text
                numberOfLines={1}
                color={focused ? active : c.textMuted}
                style={{ fontSize: 10.5, fontWeight: focused ? '600' : '400' }}>
                {meta.title}
              </Text>
            </Press>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 520,
    height: 76,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  glass: { borderRadius: radius.pill, overflow: 'hidden' },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, height: '100%' },
  slider: { position: 'absolute', left: 0, width: 46, height: 34, borderRadius: 17 },
  iconPill: { width: 46, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});

import { BlurView } from 'expo-blur';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { StyleSheet, View } from 'react-native';

import { Icon, Press, Text, type IconName } from '@/components/ui';
import { useTabBarBottom } from '@/hooks/useTopInset';
import { radius, useTheme } from '@/theme';

export const TAB_META: Record<string, { title: string; icon: IconName }> = {
  index: { title: 'Today', icon: 'sunny-outline' },
  habits: { title: 'Habits', icon: 'flame-outline' },
  planner: { title: 'Reminders', icon: 'alarm-outline' },
  focus: { title: 'Focus', icon: 'timer-outline' },
  countdowns: { title: 'Countdowns', icon: 'hourglass-outline' },
};

/** Floating, pill-shaped tab bar. */
export function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const { c, dark } = useTheme();
  const tabBottom = useTabBarBottom();
  const active = c.accent;
  return (
    <View pointerEvents="box-none" style={[styles.outer, { paddingBottom: tabBottom }]}>
      <View style={[styles.bar, { borderColor: c.border, boxShadow: `0px 10px 30px ${c.shadow}` }]}>
        {/* Frosted glass: blurred content behind a translucent tint. */}
        <BlurView intensity={60} tint={dark ? 'dark' : 'light'} style={[StyleSheet.absoluteFill, styles.glass, { backgroundColor: c.tabBar }]} />
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
              <View style={[styles.iconPill, focused && { backgroundColor: c.accentSoft }]}>
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
  iconPill: { width: 46, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});

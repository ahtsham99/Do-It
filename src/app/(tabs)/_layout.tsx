import { Tabs } from 'expo-router/tabs';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui';
import { useTheme } from '@/theme';

const TABS: { name: string; title: string; icon: IconName; iconActive: IconName }[] = [
  { name: 'index', title: 'Today', icon: 'sunny-outline', iconActive: 'sunny' },
  { name: 'planner', title: 'Planner', icon: 'calendar-outline', iconActive: 'calendar' },
  { name: 'habits', title: 'Habits', icon: 'flame-outline', iconActive: 'flame' },
  { name: 'countdowns', title: 'Countdowns', icon: 'hourglass-outline', iconActive: 'hourglass' },
  { name: 'settings', title: 'Settings', icon: 'settings-outline', iconActive: 'settings' },
];

export default function TabLayout() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  // On iOS home-screen web apps the home indicator inset comes from CSS env().
  const bottom = Math.max(insets.bottom, Platform.OS === 'web' ? 8 : 0);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.text,
        tabBarInactiveTintColor: c.textFaint,
        tabBarStyle: {
          backgroundColor: c.tabBar,
          borderTopColor: c.border,
          height: 60 + bottom,
          paddingBottom: bottom,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', lineHeight: 15 },
        sceneStyle: { backgroundColor: c.bg },
      }}>
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color, focused }) => (
              <Icon name={focused ? t.iconActive : t.icon} size={24} color={String(color)} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

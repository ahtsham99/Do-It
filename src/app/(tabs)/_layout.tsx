import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/tabs';

import { TAB_META, TabBar } from '@/components/TabBar';
import { useSettings } from '@/store/hooks';
import { useTheme } from '@/theme';
import { t } from '@/lib/i18n';

export default function TabLayout() {
  const { c } = useTheme();
  const { onboarded } = useSettings();
  if (!onboarded) return <Redirect href="/onboarding" />;
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg }, animation: 'shift' }}>
      {Object.entries(TAB_META).map(([name, meta]) => (
        <Tabs.Screen key={name} name={name} options={{ title: meta.title }} />
      ))}
      {/* Not in the tab bar; opened from your avatar on Today. */}
      <Tabs.Screen name="settings" options={{ title: t('Settings') }} />
      {/* All countdowns; opened from Goals. */}
      <Tabs.Screen name="countdowns" options={{ title: t('Countdowns') }} />
    </Tabs>
  );
}

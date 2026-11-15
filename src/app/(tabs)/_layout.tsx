import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/tabs';

import { TAB_META, TabBar } from '@/components/TabBar';
import { useSettings } from '@/store/hooks';
import { useTheme } from '@/theme';

export default function TabLayout() {
  const { c } = useTheme();
  const { onboarded } = useSettings();
  if (!onboarded) return <Redirect href="/onboarding" />;
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg } }}>
      {Object.entries(TAB_META).map(([name, meta]) => (
        <Tabs.Screen key={name} name={name} options={{ title: meta.title }} />
      ))}
    </Tabs>
  );
}

import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/tabs';

import { TAB_META, TabBar } from '@/components/TabBar';
import { useStore } from '@/store/store';
import { useTheme } from '@/theme';

export default function BarberLayout() {
  const { c } = useTheme();
  const setupComplete = useStore((s) => s.settings.setupComplete);
  if (!setupComplete) return <Redirect href="/" />;
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg } }}>
      {Object.entries(TAB_META).map(([name, meta]) => (
        <Tabs.Screen key={name} name={name} options={{ title: meta.title }} />
      ))}
    </Tabs>
  );
}

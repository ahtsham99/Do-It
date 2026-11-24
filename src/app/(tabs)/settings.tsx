import { router } from 'expo-router';

import { IconButton, Screen } from '@/components/ui';
import { SettingsBody } from '@/features/settings/SettingsBody';

export default function SettingsScreen() {
  return (
    <Screen
      title="Settings"
      subtitle="Just enough, nothing more."
      right={<IconButton icon="close" label="Close settings" size={20} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />}>
      <SettingsBody />
    </Screen>
  );
}

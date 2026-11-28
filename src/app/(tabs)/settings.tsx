import { router } from 'expo-router';

import { IconButton, Screen } from '@/components/ui';
import { SettingsBody } from '@/features/settings/SettingsBody';
import { t } from '@/lib/i18n';

export default function SettingsScreen() {
  return (
    <Screen
      title={t('Settings')}
      subtitle={t('Just enough, nothing more.')}
      right={<IconButton icon="close" label={t('Close settings')} size={20} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />}>
      <SettingsBody />
    </Screen>
  );
}

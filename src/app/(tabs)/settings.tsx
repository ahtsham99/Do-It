import { Platform, View } from 'react-native';

import { DateTimeField } from '@/components/pickers';
import { Card, Field, ListRow, Screen, Section, Segmented, Text, Toggle, showDialog, showToast } from '@/components/ui';
import { pick } from '@/features/nudges/messages';
import { requestNotificationPermission, supportsLocalNotifications } from '@/lib/notifications';
import { updateSettings } from '@/store/actions/settings';
import { useSettings } from '@/store/hooks';
import { resetAll } from '@/store/store';
import type { ThemePreference, Tone } from '@/store/types';
import { space } from '@/theme';

const TONES: { value: Tone; label: string }[] = [
  { value: 'gentle', label: 'Gentle' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'savage', label: 'Savage' },
];
const THEMES: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function SettingsScreen() {
  const s = useSettings();

  const toggleNotifications = async (on: boolean) => {
    if (!on) return updateSettings({ notificationsEnabled: false });
    const ok = await requestNotificationPermission();
    updateSettings({ notificationsEnabled: ok });
    if (!ok) showToast('Notifications are blocked in system settings', 'notifications-off');
  };

  return (
    <Screen title="Settings">
      <Section title="You">
        <Field placeholder="Your first name" value={s.name} onChangeText={(name) => updateSettings({ name })} />
      </Section>

      <Section title="Nudges">
        <Card style={{ gap: space.md }}>
          <Text variant="bodyStrong">How pushy should we be?</Text>
          <Segmented options={TONES} value={s.tone} onChange={(tone) => updateSettings({ tone })} />
          <Text variant="small" tone="muted" style={{ fontStyle: 'italic' }}>
            “{pick('overdue', s.tone, 'preview')}”
          </Text>
        </Card>
        <Card padded={false} style={{ paddingHorizontal: space.lg }}>
          <ListRow
            icon="notifications-outline"
            label="Notifications"
            detail={
              supportsLocalNotifications
                ? 'Daily plan prompt, evening check-in and task reminders'
                : 'Web app: nudges and reminders show as banners on Today. Push notifications arrive with the native app.'
            }
            right={supportsLocalNotifications ? <Toggle value={s.notificationsEnabled} onValueChange={toggleNotifications} /> : undefined}
          />
          <ListRow
            icon="sunny-outline"
            label="Plan-your-day prompt"
            right={<DateTimeField mode="time" value={s.dailyPromptTime} onChange={(dailyPromptTime) => updateSettings({ dailyPromptTime })} use24h={s.use24h} />}
          />
          <ListRow
            icon="moon-outline"
            label="Evening check-in"
            detail="Unfinished tasks get called out from this time"
            last
            right={<DateTimeField mode="time" value={s.eveningCheckTime} onChange={(eveningCheckTime) => updateSettings({ eveningCheckTime })} use24h={s.use24h} />}
          />
        </Card>
      </Section>

      <Section title="Appearance">
        <Card style={{ gap: space.md }}>
          <Segmented options={THEMES} value={s.theme} onChange={(theme) => updateSettings({ theme })} />
        </Card>
        <Card padded={false} style={{ paddingHorizontal: space.lg }}>
          <ListRow
            icon="calendar-outline"
            label="Week starts on Monday"
            right={<Toggle value={s.weekStartsOn === 1} onValueChange={(v) => updateSettings({ weekStartsOn: v ? 1 : 0 })} />}
          />
          <ListRow
            icon="time-outline"
            label="24-hour time"
            last
            right={<Toggle value={s.use24h} onValueChange={(use24h) => updateSettings({ use24h })} />}
          />
        </Card>
      </Section>

      <Section title="Data">
        <Card padded={false} style={{ paddingHorizontal: space.lg }}>
          <ListRow
            icon="phone-portrait-outline"
            label="Stored on this device"
            detail={
              Platform.OS === 'web'
                ? 'Your data lives in this browser. Removing the home-screen app or clearing Safari data deletes it.'
                : 'Your data lives on this device. Accounts and sync are coming.'
            }
          />
          <ListRow
            icon="trash-outline"
            label="Erase everything"
            danger
            last
            onPress={() =>
              showDialog({
                title: 'Erase everything?',
                message: 'All tasks, habits, countdowns and streaks will be deleted. This can’t be undone.',
                actions: [{ label: 'Erase all data', destructive: true, onPress: () => resetAll() }],
              })
            }
          />
        </Card>
      </Section>

      <View style={{ alignItems: 'center', paddingTop: space.md }}>
        <Text variant="small" tone="faint">
          Do It · v1.0
        </Text>
      </View>
    </Screen>
  );
}

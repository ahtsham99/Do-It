import { router } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import { DateTimeField } from '@/components/pickers';
import { Button, Card, Icon, IconButton, ListRow, Press, Screen, Segmented, Text, Toggle, showDialog, showToast } from '@/components/ui';
import { pick } from '@/features/nudges/messages';
import { PERSONAS } from '@/features/onboarding/suggestions';
import { requestNotificationPermission, supportsLocalNotifications } from '@/lib/notifications';
import { useEntitlements } from '@/lib/premium';
import { updateSettings } from '@/store/actions/settings';
import { useSettings } from '@/store/hooks';
import { resetAll } from '@/store/store';
import type { ThemePreference, Tone } from '@/store/types';
import { radius, space, useTheme } from '@/theme';

const TONES: { value: Tone; label: string; blurb: string }[] = [
  { value: 'gentle', label: 'Gentle', blurb: 'Soft reminders, no pressure.' },
  { value: 'balanced', label: 'Firm', blurb: 'Clear and steady. The default.' },
  { value: 'savage', label: 'Relentless', blurb: 'Direct reminders that keep you moving.' },
];
const THEMES: { value: ThemePreference; label: string; icon?: 'sunny-outline' | 'moon-outline' }[] = [
  { value: 'system', label: 'Auto' },
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export default function SettingsScreen() {
  const { c } = useTheme();
  const s = useSettings();
  const { isPremium } = useEntitlements();

  const toggleNotifications = async (on: boolean) => {
    if (!on) return updateSettings({ notificationsEnabled: false });
    const ok = await requestNotificationPermission();
    updateSettings({ notificationsEnabled: ok });
    if (!ok) showToast('Notifications are blocked in system settings', 'notifications-off');
  };

  return (
    <Screen
      title="Settings"
      subtitle="Just enough, nothing more."
      right={<IconButton icon="close" label="Close settings" size={20} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />}>
      <Press onPress={() => router.push('/profile')} accessibilityLabel="Profile">
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
          <View style={[styles.avatar, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
            <Text tone="muted" style={{ fontWeight: '500', letterSpacing: 0.5 }}>
              {(s.name.trim() || 'Me').slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.label}>{s.name.trim() || 'Your profile'}</Text>
            <Text variant="small" tone="muted">
              {PERSONAS.find((p) => p.value === s.persona)?.label ?? 'Tell us who you are'}
            </Text>
          </View>
          <Icon name="chevron-forward" size={18} color={c.textFaint} />
        </Card>
      </Press>

      <Card style={{ gap: space.md }}>
        <Text style={styles.label}>Appearance</Text>
        <Segmented tone="accent" options={THEMES} value={s.theme} onChange={(theme) => updateSettings({ theme })} />
      </Card>

      <Card style={{ gap: space.md }}>
        <Text style={styles.label}>Nudges</Text>
        <Text tone="muted" style={{ lineHeight: 23 }}>
          How firmly should the app remind you? “{pick('overdue', s.tone, 'preview')}”
        </Text>
        {TONES.map((t) => {
          const on = s.tone === t.value;
          return (
            <Press
              key={t.value}
              onPress={() => updateSettings({ tone: t.value })}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              style={[
                styles.option,
                { borderColor: on ? c.accent : c.border, backgroundColor: on ? c.accentSoft : c.bg },
              ]}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.label}>{t.label}</Text>
                <Text variant="small" tone="muted">
                  {t.blurb}
                </Text>
              </View>
              <View style={[styles.radio, { backgroundColor: on ? c.accent : c.border }]} />
            </Press>
          );
        })}
      </Card>

      <Card padded={false} style={styles.group}>
        <ListRow
          label="Notifications"
          detail={
            supportsLocalNotifications
              ? 'Morning prompt, evening check-in, reminders and focus timer'
              : 'In the web app, nudges show as banners on Today. Push notifications come with the native app.'
          }
          right={supportsLocalNotifications ? <Toggle value={s.notificationsEnabled} onValueChange={toggleNotifications} /> : undefined}
        />
        <ListRow
          label="Plan-your-day prompt"
          right={<DateTimeField mode="time" value={s.dailyPromptTime} onChange={(dailyPromptTime) => updateSettings({ dailyPromptTime })} use24h={s.use24h} />}
        />
        <ListRow
          label="Evening check-in"
          detail="When we check in on what’s left"
          last
          right={<DateTimeField mode="time" value={s.eveningCheckTime} onChange={(eveningCheckTime) => updateSettings({ eveningCheckTime })} use24h={s.use24h} />}
        />
      </Card>

      <Card padded={false} style={styles.group}>
        <ListRow
          label="Focus length"
          right={<Stepper value={s.focusMinutes} min={5} max={120} step={5} onChange={(focusMinutes) => updateSettings({ focusMinutes })} />}
        />
        <ListRow
          label="Break length"
          last
          right={<Stepper value={s.breakMinutes} min={1} max={30} step={1} onChange={(breakMinutes) => updateSettings({ breakMinutes })} />}
        />
      </Card>

      <Card padded={false} style={styles.group}>
        <ListRow
          label="Week starts on Monday"
          right={<Toggle value={s.weekStartsOn === 1} onValueChange={(v) => updateSettings({ weekStartsOn: v ? 1 : 0 })} />}
        />
        <ListRow label="24-hour time" last right={<Toggle value={s.use24h} onValueChange={(use24h) => updateSettings({ use24h })} />} />
      </Card>

      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.label}>{isPremium ? 'Premium' : 'Free plan'}</Text>
          <Text variant="small" tone="muted">
            Unlimited tasks, habits and countdowns for now
          </Text>
        </View>
        {!isPremium && (
          <Button
            small
            kind="secondary"
            label="Upgrade"
            style={{ height: 44 }}
            onPress={() =>
              showDialog({
                title: 'Premium is coming',
                message: 'Sync across devices, more themes and deeper stats. Everything you use today stays free.',
                actions: [{ label: 'Sounds good', onPress: () => {} }],
              })
            }
          />
        )}
      </Card>

      <Card padded={false} style={styles.group}>
        <ListRow
          label="Stored on this device"
          detail={
            Platform.OS === 'web'
              ? 'Your data lives in this browser. Removing the home-screen app or clearing Safari data deletes it.'
              : 'Your data lives on this device. Accounts and sync are coming.'
          }
        />
        <ListRow
          label="Erase everything"
          danger
          last
          onPress={() =>
            showDialog({
              title: 'Erase everything?',
              message: 'All reminders, habits, countdowns, focus history and streaks will be deleted. This can’t be undone.',
              actions: [{ label: 'Erase all data', destructive: true, onPress: () => resetAll() }],
            })
          }
        />
      </Card>

      <Text variant="small" tone="faint" style={{ textAlign: 'center' }}>
        Do It · v1.0
      </Text>
    </Screen>
  );
}

function Stepper({ value, min, max, step, onChange }: { value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
      <IconButton icon="remove" label="Less" size={16} diameter={34} onPress={() => onChange(Math.max(min, value - step))} />
      <Text style={{ minWidth: 52, textAlign: 'center' }}>{value} min</Text>
      <IconButton icon="add" label="More" size={16} diameter={34} onPress={() => onChange(Math.min(max, value + step))} />
    </View>
  );
}

const styles = StyleSheet.create({
  group: { paddingHorizontal: space.xl - 4 },
  avatar: { width: 52, height: 52, borderRadius: 26, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 17 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.lg + 2,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  radio: { width: 10, height: 10, borderRadius: 5 },
});

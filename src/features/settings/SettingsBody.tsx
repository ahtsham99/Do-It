import { router } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { DateTimeField } from '@/components/pickers';
import { Button, Card, Icon, IconButton, ListRow, Press, Segmented, Text, Toggle, showDialog, showToast } from '@/components/ui';
import { pick } from '@/features/nudges/messages';
import { PERSONAS } from '@/features/onboarding/suggestions';
import { requestNotificationPermission, supportsLocalNotifications } from '@/lib/notifications';
import { useEntitlements } from '@/lib/premium';
import { updateSettings } from '@/store/actions/settings';
import { useSettings } from '@/store/hooks';
import { resetAll } from '@/store/store';
import type { ThemePreference, Tone } from '@/store/types';
import { DAY_BACKGROUNDS, FREE_COLORS, NIGHT_BACKGROUNDS, NIGHT_COLORS, customColor, radius, setColorPreview, space, useTheme, type DayBackground, type NightBackground } from '@/theme';
import { styleFor } from '@/theme/fonts';

import { PremiumPalettes } from './PremiumPalettes';

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

/** All settings, as cards. Used by the Settings screen (and can be embedded). */
export function SettingsBody() {
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
    <>
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
        <View style={{ gap: space.sm, marginTop: space.xs }}>
          <Text variant="small" tone="muted">
            App colour
          </Text>
          <View style={styles.swatches}>
            {FREE_COLORS.map((k) => {
              const n = NIGHT_COLORS[k];
              const on = s.nightColor === k;
              return (
                <Press
                  key={k}
                  onPress={() => (setColorPreview(null), updateSettings({ nightColor: k }))}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={`${n.label} app colour`}
                  style={{ alignItems: 'center', gap: 6 }}>
                  <View style={[styles.swatch, { borderColor: on ? c.text : 'transparent' }]}>
                    <GradientSwatch from={n.swatch[0]} to={n.swatch[1]} id={k} />
                  </View>
                  <Text variant="small" tone={on ? 'default' : 'muted'} style={{ fontSize: 12, fontWeight: on ? '600' : '400' }}>
                    {n.label}
                  </Text>
                </Press>
              );
            })}
            {/* Any colour you like */}
            <Press
              onPress={() => router.push('/color')}
              accessibilityRole="radio"
              accessibilityState={{ selected: s.nightColor === 'custom' }}
              accessibilityLabel="Custom app colour"
              style={{ alignItems: 'center', gap: 6 }}>
              <View style={[styles.swatch, { borderColor: s.nightColor === 'custom' ? c.text : 'transparent' }]}>
                {s.nightColor === 'custom' ? (
                  <GradientSwatch from={customColor(s.customColor).swatch[0]} to={customColor(s.customColor).swatch[1]} id="custom" />
                ) : (
                  <RainbowSwatch />
                )}
              </View>
              <Text variant="small" tone={s.nightColor === 'custom' ? 'default' : 'muted'} style={{ fontSize: 12, fontWeight: s.nightColor === 'custom' ? '600' : '400' }}>
                Custom
              </Text>
            </Press>
          </View>
        </View>
        <PremiumPalettes />
        <View style={{ gap: space.sm }}>
          <Text variant="small" tone="muted">
            Day background
          </Text>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            {(Object.keys(DAY_BACKGROUNDS) as DayBackground[]).map((k) => (
              <BgChoice key={k} label={DAY_BACKGROUNDS[k].label} color={DAY_BACKGROUNDS[k].bg} card={DAY_BACKGROUNDS[k].surface} on={((s.dayBackground as string) === 'linen' ? 'peach' : s.dayBackground) === k} onPress={() => updateSettings({ dayBackground: k })} />
            ))}
          </View>
          <Text variant="small" tone="muted" style={{ marginTop: space.xs }}>
            Night background
          </Text>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            {(Object.keys(NIGHT_BACKGROUNDS) as NightBackground[]).map((k) => (
              <BgChoice key={k} label={NIGHT_BACKGROUNDS[k].label} color={NIGHT_BACKGROUNDS[k].bg} card={NIGHT_BACKGROUNDS[k].surface} on={s.nightBackground === k} onPress={() => updateSettings({ nightBackground: k })} />
            ))}
          </View>
        </View>
        <Press onPress={() => router.push('/fonts')} accessibilityRole="button" style={[styles.fontsRow, { borderTopColor: c.border }]}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.label}>Fonts</Text>
            <Text variant="small" tone="muted">
              {styleFor({ logo: s.logoFont, display: s.displayFont, text: s.textFont })?.label ?? 'Custom'} style
            </Text>
          </View>
          <Icon name="chevron-forward" size={18} color={c.textFaint} />
        </Press>
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
    </>
  );
}

function RainbowSwatch() {
  const stops = ['#FF4D4D', '#FFB020', '#E8E84A', '#3CCB6E', '#3DA5FF', '#8A5CFF', '#FF4DB8'];
  return (
    <View style={styles.swatchInner}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="sw-rainbow" x1="0" y1="0" x2="1" y2="1">
            {stops.map((col, i) => (
              <Stop key={col} offset={i / (stops.length - 1)} stopColor={col} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" rx="12" fill="url(#sw-rainbow)" />
      </Svg>
    </View>
  );
}

function BgChoice({ label, color, card, on, onPress }: { label: string; color: string; card: string; on: boolean; onPress: () => void }) {
  const { c } = useTheme();
  const darkBg = color.startsWith('#0') || color.startsWith('#1');
  return (
    <Press onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[styles.bg, { backgroundColor: color, borderColor: on ? c.accent : c.border }]}>
      <View style={{ width: '70%', height: 10, borderRadius: 5, backgroundColor: card }} />
      <Text variant="small" color={darkBg ? '#F4F3EE' : '#1E1C19'} style={{ fontWeight: on ? '700' : '500', fontSize: 12 }}>
        {label}
      </Text>
    </Press>
  );
}

function GradientSwatch({ from, to, id }: { from: string; to: string; id: string }) {
  return (
    <View style={styles.swatchInner}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={`sw-${id}`} x1="0" y1="0" x2="0.4" y2="1">
            <Stop offset="0" stopColor={from} />
            <Stop offset="1" stopColor={to} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" rx="12" fill={`url(#sw-${id})`} />
      </Svg>
    </View>
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
  swatches: { flexDirection: 'row', justifyContent: 'space-between' },
  swatch: { width: 44, height: 44, borderRadius: 14, borderWidth: 2, padding: 3 },
  bg: { flex: 1, height: 64, borderRadius: radius.md, borderWidth: 2, alignItems: 'center', justifyContent: 'center', gap: 6 },
  swatchInner: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  fontsRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, borderTopWidth: 1, paddingTop: space.lg, marginTop: space.xs, minHeight: 56 },
});

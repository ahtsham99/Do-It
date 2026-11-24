import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Icon, Press, Text } from '@/components/ui';
import { StreakPill } from '@/features/nudges/StreakPill';
import { useNudges } from '@/features/nudges/useNudges';
import { useSettings } from '@/store/hooks';
import { LOGO, radius, space, useTheme } from '@/theme';

export type MainMode = 'plan' | 'home' | 'stats' | 'settings';

const META: Record<MainMode, { label: string; icon: 'calendar-outline' | 'home-outline' | 'stats-chart-outline' | 'settings-outline' }> = {
  plan: { label: 'Plan', icon: 'calendar-outline' },
  home: { label: 'Home', icon: 'home-outline' },
  stats: { label: 'Stats', icon: 'stats-chart-outline' },
  settings: { label: 'Settings', icon: 'settings-outline' },
};

/** Logo, Plan | Home switch, streak and your initials — shared by both views. */
export function BrandRow({ mode, onMode, modes }: { mode: MainMode; onMode: (m: MainMode) => void; modes: MainMode[] }) {
  const { c } = useTheme();
  const n = useNudges();
  const { name } = useSettings();
  const initials = (name.trim() || 'Me').slice(0, 2).toUpperCase();
  return (
    <View style={[styles.top, { paddingTop: space.sm }]}>
      <Text variant="display" accessibilityRole="header" style={{ fontFamily: LOGO, fontSize: 32, lineHeight: 38, letterSpacing: -0.8 }}>
        Do It
      </Text>
      <View style={{ flex: 1 }} />
      <View style={[styles.switch, { backgroundColor: c.surfaceAlt, borderColor: c.border }]} accessibilityRole="tablist">
        {modes.map((m) => {
          const on = m === mode;
          return (
            <Press
              key={m}
              onPress={() => onMode(m)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              style={[styles.option, on && { backgroundColor: c.accent }]}>
              <Icon name={META[m].icon} size={14} color={on ? c.accentText : c.textMuted} />
              <Text variant="small" color={on ? c.accentText : c.textMuted} style={{ fontWeight: '600', fontSize: 13 }}>
                {META[m].label}
              </Text>
            </Press>
          );
        })}
      </View>
      <StreakPill streak={n.streak} activeToday={n.activeToday} />
      <Press onPress={() => router.push('/settings')} accessibilityLabel="Settings and profile" style={[styles.avatar, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
        <Text variant="small" tone="muted" style={{ fontWeight: '500', letterSpacing: 0.5, fontSize: 12 }}>
          {initials}
        </Text>
      </Press>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  switch: { flexDirection: 'row', borderRadius: radius.pill, borderWidth: 1, padding: 3 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 30, paddingHorizontal: 10, borderRadius: radius.pill },
  avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});

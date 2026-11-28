import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Icon, Press, Text } from '@/components/ui';
import { StreakPill } from '@/features/nudges/StreakPill';
import { useNudges } from '@/features/nudges/useNudges';
import { Avatar } from '@/features/profile/Avatar';
import { LOGO, radius, space, useTheme } from '@/theme';
import { t } from '@/lib/i18n';

export type MainMode = 'plan' | 'stats';

const META: Record<MainMode, { label: string; icon: 'calendar-outline' | 'stats-chart-outline' }> = {
  plan: { label: t('Plan'), icon: 'calendar-outline' },
  stats: { label: t('Stats'), icon: 'stats-chart-outline' },
};

/** Logo, Plan | Stats switch, streak and your initials — shared by both views. */
export function BrandRow({ mode, onMode, modes }: { mode: MainMode; onMode: (m: MainMode) => void; modes: MainMode[] }) {
  const { c } = useTheme();
  const n = useNudges();
  return (
    <View style={[styles.top, { paddingTop: space.sm }]}>
      <Text variant="display" accessibilityRole="header" numberOfLines={1} style={{ fontFamily: LOGO, fontSize: 32, lineHeight: 38, letterSpacing: -0.8, flexShrink: 0 }}>
        {t('Do It')}
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
              <Text variant="small" numberOfLines={1} color={on ? c.accentText : c.textMuted} style={{ fontWeight: "600", fontSize: 13, flexShrink: 1 }}>
                {t(META[m].label)}
              </Text>
            </Press>
          );
        })}
      </View>
      <StreakPill streak={n.streak} activeToday={n.activeToday} />
      <Press onPress={() => router.push('/settings')} accessibilityLabel={t('Settings and profile')}>
        <Avatar size={36} small />
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

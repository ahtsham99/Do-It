import { StyleSheet } from 'react-native';

import { router } from 'expo-router';

import { Icon, Press, Text } from '@/components/ui';
import { cardShadow, radius, useTheme } from '@/theme';
import { t } from '@/lib/i18n';

export function StreakPill({ streak, activeToday }: { streak: number; activeToday: boolean }) {
  const { c } = useTheme();
  const lit = activeToday && streak > 0;
  return (
    <Press
      accessibilityLabel={t('{streak} day streak', { streak })}
      onPress={() => router.push('/streaks')}
      style={[styles.pill, { backgroundColor: c.surface, borderColor: c.border, ...cardShadow(c) }]}>
      <Icon name={lit ? 'flame' : 'flame-outline'} size={20} color={c.flame} />
      <Text variant="bodyStrong">{streak}</Text>
    </Press>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 42,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});

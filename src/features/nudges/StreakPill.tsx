import { StyleSheet } from 'react-native';

import { Icon, Press, Text, showDialog } from '@/components/ui';
import { radius, useTheme } from '@/theme';

export function StreakPill({ streak, best, activeToday }: { streak: number; best: number; activeToday: boolean }) {
  const { c } = useTheme();
  const lit = activeToday && streak > 0;
  return (
    <Press
      accessibilityLabel={`${streak} day streak`}
      onPress={() =>
        showDialog({
          title: `${streak} day streak`,
          message: lit
            ? `You showed up today. Best ever: ${best} days. Come back tomorrow to keep it going.`
            : streak > 0
              ? `Finish a task, tick a habit or plan your day before midnight — or it resets to zero. Best: ${best}.`
              : 'Plan your day or finish one task to start a streak.',
          actions: [{ label: 'Got it', onPress: () => {} }],
        })
      }
      style={[styles.pill, { backgroundColor: lit ? c.accentSoft : c.surfaceAlt }]}>
      <Icon name={lit ? 'flame' : 'flame-outline'} size={20} color={lit ? c.accent : c.textFaint} />
      <Text variant="bodyStrong" color={lit ? c.accent : c.textMuted}>
        {streak}
      </Text>
    </Press>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
  },
});

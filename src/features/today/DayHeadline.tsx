import { Text } from '@/components/ui';
import { View } from 'react-native';

import { space } from '@/theme';

/**
 * One big line that tells you where you stand today — the most useful thing
 * on the screen for someone who's putting things off.
 */
export function dayHeadline({
  habitsLeft,
  remindersLeft,
  totalToday,
  firstHabit,
  firstReminder,
}: {
  habitsLeft: number;
  remindersLeft: number;
  totalToday: number;
  firstHabit?: string;
  firstReminder?: string;
}) {
  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;
  if (habitsLeft > 0) {
    return {
      title: `${plural(habitsLeft, 'habit')} left`,
      sub: firstHabit ? `Small steps count. Start with ${firstHabit}.` : 'Small steps still count.',
    };
  }
  if (remindersLeft > 0) {
    return {
      title: `${plural(remindersLeft, 'thing')} to do`,
      sub: firstReminder ? `Begin with ${firstReminder}.` : 'Five minutes is enough to start.',
    };
  }
  if (totalToday > 0) return { title: 'All done today', sub: 'Everything’s ticked. Enjoy the quiet.' };
  return { title: 'A clear day', sub: 'Add a habit or a reminder whenever you’re ready.' };
}

export function DayHeadline({ title, sub }: { title: string; sub: string }) {
  return (
    <View style={{ gap: 6, marginTop: space.xs }}>
      <Text variant="display" accessibilityRole="header" numberOfLines={2} adjustsFontSizeToFit style={{ fontSize: 54, lineHeight: 58, letterSpacing: -1.2 }}>
        {title}
      </Text>
      <Text tone="muted" numberOfLines={1} style={{ fontSize: 15 }}>
        {sub}
      </Text>
    </View>
  );
}

import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Icon, Press, Text, type IconName } from '@/components/ui';
import { formatDay } from '@/lib/dates';
import type { Countdown } from '@/store/types';
import { radius, space, useTheme } from '@/theme';

import { countdownLabel, daysUntil } from './logic';

export function CountdownCard({ item, hero }: { item: Countdown; hero?: boolean }) {
  const { c } = useTheme();
  const days = daysUntil(item);
  const past = days < 0;
  const { big, small } = countdownLabel(days);
  const open = () => router.push({ pathname: '/countdown', params: { id: item.id } });

  if (hero) {
    return (
      <Press onPress={open} style={[styles.hero, { backgroundColor: item.color }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <Icon name={item.icon as IconName} size={18} color="#fff" />
          <Text variant="caption" color="#fff" style={{ textTransform: 'uppercase', opacity: 0.9 }}>
            Next up · {item.category}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: space.md }}>
          <View style={{ flex: 1 }}>
            <Text variant="title" color="#fff" numberOfLines={2}>
              {item.title}
            </Text>
            <Text variant="small" color="#fff" style={{ opacity: 0.85 }}>
              {formatDay(item.date, { long: true })}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text color="#fff" style={{ fontSize: 56, fontWeight: '800', letterSpacing: -2, lineHeight: 60 }}>
              {big}
            </Text>
            {small ? (
              <Text variant="caption" color="#fff" style={{ textTransform: 'uppercase' }}>
                {small}
              </Text>
            ) : null}
          </View>
        </View>
      </Press>
    );
  }

  return (
    <Press onPress={open} style={[styles.row, { backgroundColor: c.surface, borderColor: c.border, opacity: past ? 0.6 : 1 }]}>
      <View style={[styles.icon, { backgroundColor: item.color }]}>
        <Icon name={item.icon as IconName} size={22} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {item.title}
        </Text>
        <Text variant="small" tone="muted">
          {formatDay(item.date)}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', minWidth: 64 }}>
        <Text variant="title" color={past ? c.textMuted : days <= 3 ? c.accent : c.text}>
          {big}
        </Text>
        {small ? (
          <Text variant="caption" tone="muted" style={{ fontSize: 10, textTransform: 'uppercase' }}>
            {small}
          </Text>
        ) : null}
      </View>
    </Press>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.xl, padding: space.xl, gap: space.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    paddingRight: space.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  icon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
});

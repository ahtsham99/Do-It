import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, Press, Text } from '@/components/ui';
import { formatDay, formatMoney, formatTime, range, todayKey, type DayKey } from '@/lib/dates';
import { closedReason, liveBlocks, liveBookings } from '@/features/booking/rules';
import { useClientsById, useRulesState } from '@/store/hooks';
import { space, useTheme } from '@/theme';

/** The week as a readable list: each day, its bookings, its takings. */
export function WeekAgenda({ start, onPickDay }: { start: DayKey; onPickDay: (d: DayKey) => void }) {
  const { c } = useTheme();
  const s = useRulesState();
  const clients = useClientsById();
  const days = useMemo(() => range(start, 7), [start]);
  const today = todayKey();

  return (
    <View style={{ gap: space.md }}>
      {days.map((d) => {
        const list = liveBookings(s.bookings)
          .filter((b) => b.date === d)
          .sort((a, b) => a.start - b.start);
        const blocks = liveBlocks(s.blocks).filter((b) => b.date === d);
        const closed = closedReason(s, d);
        const takings = list.reduce((sum, b) => sum + b.price, 0);
        return (
          <View key={d} style={[styles.day, { backgroundColor: c.surface, borderColor: d === today ? c.accent : c.border }]}>
            <Press onPress={() => onPickDay(d)} style={styles.head} accessibilityLabel={`Open ${formatDay(d, { long: true })}`}>
              <View style={{ flex: 1 }}>
                <Text variant="heading">{formatDay(d)}</Text>
                <Text variant="small" tone="muted">
                  {closed && !list.length ? closed : `${list.length} booking${list.length === 1 ? '' : 's'}${list.length ? ` · ${formatMoney(takings)}` : ''}${blocks.length ? ` · ${blocks.length} blocked` : ''}`}
                </Text>
              </View>
              <Icon name="chevron-forward" size={18} color={c.textFaint} />
            </Press>
            {list.map((b) => (
              <Press key={b.id} onPress={() => router.push(`/booking/${b.id}`)} style={[styles.row, { borderTopColor: c.border }]}>
                <Text variant="bodyStrong" style={{ width: 70 }}>
                  {formatTime(b.start)}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1}>{clients.get(b.clientId)?.name ?? 'Client'}</Text>
                  <Text variant="small" tone="muted" numberOfLines={1}>
                    {b.serviceName}
                    {b.source === 'walk-in' ? ' · walk-in' : ''}
                  </Text>
                </View>
                <Text tone="muted">{formatMoney(b.price)}</Text>
              </Press>
            ))}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  day: { borderRadius: 24, borderWidth: 1, paddingHorizontal: space.lg },
  head: { flexDirection: 'row', alignItems: 'center', minHeight: 64 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 56, borderTopWidth: StyleSheet.hairlineWidth },
});

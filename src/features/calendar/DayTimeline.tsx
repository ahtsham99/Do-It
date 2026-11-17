import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, Press, Text, showDialog } from '@/components/ui';
import { formatTime, ukParts, weekday, type DayKey } from '@/lib/dates';
import { closedReason, liveBlocks, liveBookings } from '@/features/booking/rules';
import { useNow } from '@/lib/useNow';
import { removeBlock } from '@/store/actions/bookings';
import { useClientsById, useRulesState } from '@/store/hooks';
import { radius, space, useTheme } from '@/theme';

const HOUR = 80;
const px = (mins: number) => (mins / 60) * HOUR;

/** One day, hour by hour. Tap a gap to add a walk-in or block it out. */
export function DayTimeline({ date }: { date: DayKey }) {
  const { c } = useTheme();
  const s = useRulesState();
  const clients = useClientsById();
  const h = s.hours[weekday(date)];
  const closed = closedReason(s, date);

  const { bookings, blocks } = useMemo(
    () => ({
      bookings: liveBookings(s.bookings).filter((b) => b.date === date),
      blocks: liveBlocks(s.blocks).filter((b) => b.date === date),
    }),
    [s.bookings, s.blocks, date],
  );

  const items = [...bookings, ...blocks];
  const open = closed ? null : h;
  const firstHour = Math.floor(Math.min(open?.start ?? 9 * 60, ...items.map((i) => i.start)) / 60);
  const lastHour = Math.ceil(Math.max(open?.end ?? 18 * 60, ...items.map((i) => i.end)) / 60);
  const origin = firstHour * 60;
  const total = (lastHour - firstHour) * 60;

  const now = ukParts(useNow());
  const showNow = now.date === date && now.minutes >= origin && now.minutes <= origin + total;

  const onGap = (start: number) =>
    showDialog({
      title: formatTime(start),
      actions: [
        { label: 'Add a walk-in here', onPress: () => router.push({ pathname: '/walk-in', params: { date, start } }) },
        { label: 'Block out this time', onPress: () => router.push({ pathname: '/block', params: { date, start } }) },
      ],
    });

  return (
    <View style={{ flexDirection: 'row', height: px(total) + 12, paddingTop: 6 }}>
      <View style={{ width: 52 }}>
        {Array.from({ length: lastHour - firstHour + 1 }, (_, i) => (
          <Text key={i} variant="small" tone="faint" style={{ position: 'absolute', top: px(i * 60) - 9, fontSize: 12 }}>
            {formatTime((firstHour + i) * 60)}
          </Text>
        ))}
      </View>
      <View style={{ flex: 1 }}>
        {/* Hour lines + tappable quarter-hour gaps */}
        {Array.from({ length: total / 15 }, (_, i) => {
          const start = origin + i * 15;
          const inHours = open && start >= open.start && start < open.end;
          return (
            <Press
              key={i}
              haptic={false}
              accessibilityLabel={`Free at ${formatTime(start)}`}
              onPress={() => onGap(start)}
              style={{
                position: 'absolute',
                top: px(i * 15),
                left: 0,
                right: 0,
                height: px(15),
                backgroundColor: inHours ? 'transparent' : c.blocked,
                opacity: inHours ? 1 : 0.55,
                borderTopWidth: i % 4 === 0 ? StyleSheet.hairlineWidth : 0,
                borderTopColor: c.border,
              }}
            />
          );
        })}

        {blocks.map((b) => (
          <Press
            key={b.id}
            accessibilityLabel={`${b.label}, ${formatTime(b.start)} to ${formatTime(b.end)}`}
            onPress={() =>
              showDialog({
                title: `${b.label} · ${formatTime(b.start)}–${formatTime(b.end)}`,
                message: 'Clients cannot book this time.',
                actions: [{ label: 'Remove block', destructive: true, onPress: () => removeBlock(b.id) }],
              })
            }
            style={[styles.item, { top: px(b.start - origin), height: Math.max(px(b.end - b.start) - 2, 22), backgroundColor: c.surfaceAlt, borderColor: c.border, borderWidth: 1, borderStyle: 'dashed' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon name="remove-circle-outline" size={15} color={c.textMuted} />
              <Text variant="small" tone="muted" numberOfLines={1} style={{ fontWeight: '500' }}>
                {b.label} · {formatTime(b.start)}–{formatTime(b.end)}
              </Text>
            </View>
          </Press>
        ))}

        {bookings.map((b) => {
          const walkIn = b.source === 'walk-in';
          const bg = walkIn ? c.walkIn : c.booking;
          const fg = walkIn ? c.accentText : c.bookingText;
          const height = Math.max(px(b.end - b.start) - 2, 24);
          const name = clients.get(b.clientId)?.name ?? 'Client';
          return (
            <Press
              key={b.id}
              accessibilityLabel={`${name}, ${b.serviceName}, ${formatTime(b.start)}`}
              onPress={() => router.push(`/booking/${b.id}`)}
              style={[styles.item, { top: px(b.start - origin), height, backgroundColor: bg, opacity: b.noShow ? 0.5 : 1 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text variant="bodyStrong" color={fg} numberOfLines={1} style={{ flexShrink: 1, fontSize: height < 40 ? 14 : 16 }}>
                  {name}
                </Text>
                {walkIn && <Icon name="walk-outline" size={14} color={fg} />}
                {b.deposit.amount > 0 && <Icon name="card-outline" size={14} color={fg} />}
              </View>
              {height >= 44 && (
                <Text variant="small" color={fg} numberOfLines={1} style={{ opacity: 0.75 }}>
                  {formatTime(b.start)}–{formatTime(b.end)} · {b.serviceName}
                </Text>
              )}
            </Press>
          );
        })}

        {showNow && (
          <View pointerEvents="none" style={[styles.now, { top: px(now.minutes - origin) }]}>
            <View style={[styles.nowDot, { backgroundColor: c.danger }]} />
            <View style={{ flex: 1, height: 2, backgroundColor: c.danger }} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { position: 'absolute', left: 4, right: 0, borderRadius: radius.sm + 2, paddingHorizontal: space.md, paddingVertical: 6, overflow: 'hidden', justifyContent: 'center' },
  now: { position: 'absolute', left: -5, right: 0, height: 10, marginTop: -5, flexDirection: 'row', alignItems: 'center' },
  nowDot: { width: 10, height: 10, borderRadius: 5 },
});

import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Press, Text } from '@/components/ui';
import { dayOfMonth, formatDay, formatTime, monthShort, weekdayShort, type DayKey, type Minutes } from '@/lib/dates';
import { useRulesState } from '@/store/hooks';
import { radius, space, useTheme } from '@/theme';

import { availableSlots, bookableDays } from './rules';

export interface Slot {
  date: DayKey;
  start: Minutes | null;
}

const PARTS: [string, number, number][] = [
  ['Morning', 0, 12 * 60],
  ['Afternoon', 12 * 60, 17 * 60],
  ['Evening', 17 * 60, 24 * 60],
];

/** Day chips, then only the times that are genuinely free for this service. */
export function SlotPicker({
  duration,
  value,
  onChange,
  excludeBookingId,
}: {
  duration: number;
  value: Slot | null;
  onChange: (s: Slot) => void;
  excludeBookingId?: string;
}) {
  const { c } = useTheme();
  const s = useRulesState();
  const days = useMemo(() => bookableDays(s, duration, excludeBookingId), [s, duration, excludeBookingId]);
  const date = value?.date ?? days.find((d) => d.free > 0)?.date ?? days[0].date;
  const slots = useMemo(() => availableSlots(s, date, duration, { excludeBookingId }), [s, date, duration, excludeBookingId]);

  // Pick the first open day on first render; drop a time that is no longer free.
  useEffect(() => {
    if (!value) onChange({ date, start: null });
    else if (value.start != null && !slots.includes(value.start)) onChange({ date: value.date, start: null });
  }, [value, date, slots, onChange]);

  const day = days.find((d) => d.date === date);

  return (
    <View style={{ gap: space.lg }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm, paddingRight: space.lg }}>
        {days.map((d) => {
          const sel = d.date === date;
          const none = d.free === 0;
          return (
            <Press
              key={d.date}
              onPress={() => onChange({ date: d.date, start: null })}
              accessibilityLabel={`${formatDay(d.date, { long: true, relative: false })}${d.closed ? ', closed' : none ? ', fully booked' : ''}`}
              accessibilityState={{ selected: sel }}
              style={[
                styles.day,
                { backgroundColor: sel ? c.ink : c.surface, borderColor: sel ? c.ink : c.border, opacity: none && !sel ? 0.45 : 1 },
              ]}>
              <Text variant="small" color={sel ? c.inkText : c.textMuted}>
                {weekdayShort(d.date)}
              </Text>
              <Text style={{ fontSize: 22, fontWeight: '500' }} color={sel ? c.inkText : c.text}>
                {dayOfMonth(d.date)}
              </Text>
              <Text style={{ fontSize: 11 }} color={sel ? c.inkText : c.textFaint}>
                {d.closed ? 'Closed' : none ? 'Full' : monthShort(d.date)}
              </Text>
            </Press>
          );
        })}
      </ScrollView>

      {slots.length === 0 ? (
        <View style={[styles.empty, { borderColor: c.border }]}>
          <Text tone="muted" style={{ textAlign: 'center' }}>
            {day?.closed ? `${day.closed}. Pick another day.` : 'No times left this day. Pick another day.'}
          </Text>
        </View>
      ) : (
        PARTS.map(([label, from, to]) => {
          const list = slots.filter((t) => t >= from && t < to);
          if (!list.length) return null;
          return (
            <View key={label} style={{ gap: space.sm }}>
              <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>
                {label}
              </Text>
              <View style={styles.grid}>
                {list.map((t) => {
                  const sel = value?.start === t && value.date === date;
                  return (
                    <Press
                      key={t}
                      onPress={() => onChange({ date, start: t })}
                      accessibilityLabel={formatTime(t)}
                      accessibilityState={{ selected: sel }}
                      style={[styles.slot, { backgroundColor: sel ? c.accent : c.surface, borderColor: sel ? c.accent : c.border }]}>
                      <Text variant="bodyStrong" color={sel ? c.accentText : c.text}>
                        {formatTime(t)}
                      </Text>
                    </Press>
                  );
                })}
              </View>
            </View>
          );
        })
      )}
      <Text variant="small" tone="faint" style={{ textAlign: 'center' }}>
        All times are UK time.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  day: { width: 64, height: 84, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  slot: { width: '31.5%', flexGrow: 0, minHeight: 52, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { borderWidth: 1, borderStyle: 'dashed', borderRadius: radius.lg, padding: space.xl },
});

import { StyleSheet, View } from 'react-native';

import { TimeField } from '@/components/pickers';
import { Text, Toggle, showDialog, showToast } from '@/components/ui';
import { WEEKDAYS, weekday } from '@/lib/dates';
import { bookingsOnDays, cancelForClosure } from '@/store/actions/bookings';
import { setDayHours } from '@/store/actions/shop';
import { useStore } from '@/store/store';
import type { DayHours } from '@/store/types';
import { space, useTheme } from '@/theme';

const ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday first

/**
 * Change a weekday's hours. If upcoming bookings no longer fit (the day is
 * now closed, or the hours got shorter), ask before cancelling and texting them.
 */
function change(wd: number, current: DayHours, patch: Partial<DayHours>) {
  const next = { ...current, ...patch };
  if (next.end <= next.start) next.end = Math.min(next.start + 60, 23 * 60 + 55);
  const clash = bookingsOnDays((d) => weekday(d) === wd).filter((b) => !next.open || b.start < next.start || b.end > next.end);
  if (!clash.length) return setDayHours(wd, next);
  const n = clash.length;
  showDialog({
    title: `${n} upcoming booking${n > 1 ? 's' : ''} on ${WEEKDAYS[wd]}s`,
    message: next.open
      ? `They fall outside the new hours. Cancel them and text each client (deposits refunded), or keep them as they are?`
      : `If you close on ${WEEKDAYS[wd]}s, they'll be cancelled, deposits refunded, and each client gets a text.`,
    actions: [
      {
        label: next.open ? 'Cancel them and text clients' : `Close ${WEEKDAYS[wd]}s and text clients`,
        destructive: true,
        onPress: () => {
          setDayHours(wd, next);
          cancelForClosure(clash.map((b) => b.id));
          showToast(`${n} client${n > 1 ? 's' : ''} texted`, 'chatbubble-ellipses');
        },
      },
      ...(next.open ? [{ label: 'Keep those bookings', onPress: () => setDayHours(wd, next) }] : []),
    ],
  });
}

export function HoursEditor() {
  const hours = useStore((s) => s.hours);
  const { c } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      {ORDER.map((wd, i) => {
        const h = hours[wd];
        return (
          <View key={wd} style={[styles.row, i < 6 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border }]}>
            <View style={{ width: 92, gap: 2 }}>
              <Text variant="bodyStrong">{WEEKDAYS[wd].slice(0, 3)}</Text>
              {!h.open && (
                <Text variant="small" tone="faint">
                  Closed
                </Text>
              )}
            </View>
            <View style={styles.times}>
              {h.open && (
                <>
                  <TimeField label={`${WEEKDAYS[wd]} opening time`} value={h.start} onChange={(start) => change(wd, h, { start })} />
                  <Text tone="faint">–</Text>
                  <TimeField label={`${WEEKDAYS[wd]} closing time`} value={h.end} onChange={(end) => change(wd, h, { end })} />
                </>
              )}
            </View>
            <Toggle
              accessibilityLabel={`Open on ${WEEKDAYS[wd]}`}
              value={h.open}
              onValueChange={(open) => change(wd, h, { open })}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 28, borderWidth: 1, paddingHorizontal: space.lg },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 68, gap: space.sm },
  times: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'flex-end' },
});

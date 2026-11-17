import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Banner, Button, IconButton, Screen, Segmented, Text, showDialog, showToast } from '@/components/ui';
import { addDays, formatDay, formatMoney, startOfWeek, todayKey, type DayKey } from '@/lib/dates';
import { closedReason, liveBookings, timeOffOn } from '@/features/booking/rules';
import { DayTimeline } from '@/features/calendar/DayTimeline';
import { quickBlock } from '@/features/calendar/quickBlock';
import { WeekAgenda } from '@/features/calendar/WeekAgenda';
import { WeekStrip } from '@/features/calendar/WeekStrip';
import { addTimeOff, bookingsOnDays, removeTimeOff } from '@/store/actions/bookings';
import { useRulesState } from '@/store/hooks';
import { space } from '@/theme';

function closeDay(date: DayKey) {
  const n = bookingsOnDays((d) => d === date).length;
  const commit = () => {
    const texted = addTimeOff({ start: date, end: date, label: 'Closed' });
    showToast(texted ? `Closed. ${texted} client${texted > 1 ? 's' : ''} texted` : 'Closed for the day', 'moon');
  };
  showDialog({
    title: `Close ${formatDay(date)}?`,
    message: n
      ? `${n} booking${n > 1 ? 's' : ''} will be cancelled. Deposits are refunded in full and each client gets a text straight away.`
      : 'Nobody will be able to book this day.',
    actions: [{ label: n ? 'Close and text clients' : 'Close this day', destructive: true, onPress: commit }],
  });
}

export default function Calendar() {
  const [view, setView] = useState<'day' | 'week'>('day');
  const [date, setDate] = useState(todayKey());
  const s = useRulesState();
  const today = todayKey();

  const day = useMemo(() => {
    const list = liveBookings(s.bookings).filter((b) => b.date === date);
    return { count: list.length, takings: list.reduce((n, b) => n + b.price, 0) };
  }, [s.bookings, date]);
  const closed = closedReason(s, date);
  const off = timeOffOn(s.timeOff, date);
  const weekStart = startOfWeek(date);

  const title = view === 'day' ? formatDay(date) : weekStart === startOfWeek(today) ? 'This week' : `w/c ${formatDay(weekStart, { relative: false })}`;
  const subtitle =
    view === 'day'
      ? `${formatDay(date, { relative: false, long: true })}${closed ? ` · ${closed}` : day.count ? ` · ${day.count} booked · ${formatMoney(day.takings)}` : ''}`
      : 'Tap a day to open it';

  return (
    <Screen
      title={title}
      subtitle={subtitle}
      right={
        <>
          <IconButton icon="chevron-back" label="Previous" diameter={42} size={20} onPress={() => setDate(addDays(date, view === 'day' ? -1 : -7))} />
          <IconButton icon="chevron-forward" label="Next" diameter={42} size={20} onPress={() => setDate(addDays(date, view === 'day' ? 1 : 7))} />
        </>
      }>
      <Segmented
        value={view}
        onChange={setView}
        options={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
        ]}
      />
      {date !== today && (
        <Button small kind="ghost" label="Back to today" icon="return-up-back" onPress={() => setDate(today)} style={{ alignSelf: 'center', marginVertical: -8 }} />
      )}

      {view === 'week' ? (
        <WeekAgenda start={weekStart} onPickDay={(d) => (setDate(d), setView('day'))} />
      ) : (
        <>
          <WeekStrip value={date} onChange={setDate} />
          {date >= today && (
            <View style={styles.actions}>
              <Button small kind="secondary" icon="walk-outline" label="Walk-in" style={styles.action} onPress={() => router.push({ pathname: '/walk-in', params: { date } })} />
              <Button small kind="secondary" icon="remove-circle-outline" label="Block" style={styles.action} onPress={() => quickBlock(date)} />
              {!closed && <Button small kind="secondary" icon="moon-outline" label="Close day" style={styles.action} onPress={() => closeDay(date)} />}
            </View>
          )}
          {off && (
            <Banner
              kind="warning"
              icon="moon-outline"
              title={off.label === 'Closed' ? 'Shop closed' : `${off.label}: shop closed`}
              body="No one can book this day. Clients who had bookings were texted."
              action="Open this day again"
              onPress={() =>
                showDialog({
                  title: 'Open again?',
                  message: off.start === off.end ? undefined : `This reopens ${formatDay(off.start)} – ${formatDay(off.end)}.`,
                  actions: [{ label: 'Reopen', onPress: () => removeTimeOff(off.id) }],
                })
              }
            />
          )}
          {!off && closed && (
            <Text tone="muted" style={{ textAlign: 'center' }}>
              {closed}. Change this in Shop → Working hours.
            </Text>
          )}
          <DayTimeline date={date} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: space.sm },
  action: { flex: 1, minHeight: 48, paddingHorizontal: space.sm },
});

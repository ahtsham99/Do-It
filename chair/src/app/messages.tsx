import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { ModalScreen, Segmented, Text } from '@/components/ui';
import { formatDay, formatTime, ukParts } from '@/lib/dates';
import { formatPhone } from '@/lib/phone';
import { useNow } from '@/lib/useNow';
import { MESSAGE_LABEL, isSent } from '@/lib/sms';
import { TextBubble } from '@/features/booking/TextBubble';
import { useClientsById } from '@/store/hooks';
import { useStore } from '@/store/store';
import { space, useTheme } from '@/theme';

/** Outbox: every text the app has sent or will send. */
export default function Messages() {
  const { booking } = useLocalSearchParams<{ booking?: string }>();
  const { c } = useTheme();
  const all = useStore((s) => s.messages);
  const bookings = useStore((s) => s.bookings);
  const clients = useClientsById();
  const now = useNow();
  const [tab, setTab] = useState<'scheduled' | 'sent'>(booking ? 'sent' : 'scheduled');

  const list = useMemo(() => {
    const byBooking = new Map(bookings.map((b) => [b.id, b]));
    return all
      .filter((m) => (booking ? m.bookingId === booking : tab === 'sent' ? isSent(m, now) || m.cancelled : !m.cancelled && m.sendAt > now))
      .filter((m) => booking || !m.cancelled)
      .sort((a, b) => (tab === 'sent' && !booking ? b.sendAt - a.sendAt : a.sendAt - b.sendAt))
      .slice(0, 80)
      .map((m) => ({ m, name: clients.get(byBooking.get(m.bookingId)?.clientId ?? '')?.name ?? formatPhone(m.phone) }));
  }, [all, bookings, clients, tab, booking, now]);

  return (
    <ModalScreen title="Texts to clients">
      <View style={{ padding: space.lg, borderRadius: 20, backgroundColor: c.accentSoft, gap: 4 }}>
        <Text variant="bodyStrong">Sent automatically</Text>
        <Text variant="small" style={{ lineHeight: 20 }}>
          A confirmation when someone books, a reminder at 6pm the day before and another an hour before. Each one has a link to cancel or move. If you close a day, everyone booked on it gets a cancellation text.
        </Text>
        <Text variant="small" tone="muted" style={{ lineHeight: 20 }}>
          Test mode: texts are shown here instead of being sent to real phones.
        </Text>
      </View>
      {!booking && (
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'scheduled', label: 'Scheduled' },
            { value: 'sent', label: 'Sent' },
          ]}
        />
      )}
      {list.length === 0 && (
        <Text tone="muted" style={{ textAlign: 'center' }}>
          Nothing here yet.
        </Text>
      )}
      {list.map(({ m, name }) => {
        const p = ukParts(m.sendAt);
        const state = m.cancelled ? 'Not sent (booking changed)' : isSent(m, now) ? 'Sent' : 'Goes out';
        return (
          <View key={m.id} style={{ gap: 6 }}>
            <Text variant="small" tone="muted">
              <Text variant="small" style={{ fontWeight: '600' }}>{name}</Text> · {MESSAGE_LABEL[m.kind]}
            </Text>
            <TextBubble body={m.body} meta={`${state} ${formatDay(p.date)} at ${formatTime(p.minutes)}`} />
          </View>
        );
      })}
    </ModalScreen>
  );
}

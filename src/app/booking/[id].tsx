import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Linking, View } from 'react-native';

import { Avatar, Button, Card, ListRow, ModalScreen, Text, showDialog, showToast } from '@/components/ui';
import { formatDay, formatDuration, formatMoney, formatTime, ukEpoch, ukParts } from '@/lib/dates';
import { formatPhone } from '@/lib/phone';
import { useNow } from '@/lib/useNow';
import { MESSAGE_LABEL, isSent } from '@/lib/sms';
import { SlotPicker, type Slot } from '@/features/booking/SlotPicker';
import { cancelBooking, rescheduleBooking, setNoShow } from '@/store/actions/bookings';
import { useStore } from '@/store/store';
import { space } from '@/theme';

const DEPOSIT_LABEL = { none: 'No deposit', paid: 'Deposit paid', refunded: 'Deposit refunded', kept: 'Deposit kept' } as const;

export default function BookingDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookings = useStore((s) => s.bookings);
  const clients = useStore((s) => s.clients);
  const allMessages = useStore((s) => s.messages);
  const b = useMemo(() => bookings.find((x) => x.id === id), [bookings, id]);
  const client = useMemo(() => clients.find((x) => x.id === b?.clientId), [clients, b]);
  const texts = useMemo(() => allMessages.filter((m) => m.bookingId === id).sort((a, z) => a.sendAt - z.sendAt), [allMessages, id]);
  const now = useNow();
  const [moving, setMoving] = useState(false);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const onSlot = useCallback((s: Slot) => (setSlot(s), setError(null)), []);

  if (!b) return <ModalScreen title="Booking"><Text tone="muted">This booking no longer exists.</Text></ModalScreen>;

  const started = ukEpoch(b.date, b.start) <= now;
  const active = b.status === 'confirmed';
  const name = client?.name ?? 'Client';
  const phone = client?.phone;

  if (moving) {
    const when = slot?.start != null ? `${formatDay(slot.date)}, ${formatTime(slot.start)}` : null;
    return (
      <ModalScreen
        title={`Move ${name}`}
        doneLabel="Back"
        onDone={() => setMoving(false)}
        footer={
          <View style={{ gap: space.sm }}>
            {error && <Text tone="danger" variant="small" style={{ textAlign: 'center' }}>{error}</Text>}
            <Button
              label={when ? `Move to ${when}` : 'Pick a new time'}
              disabled={!when}
              onPress={() => {
                if (slot?.start == null) return;
                const res = rescheduleBooking(b.id, slot.date, slot.start);
                if (!res.ok) return setError(res.error);
                showToast(phone ? `Moved. ${name.split(' ')[0]} has been texted` : 'Moved');
                setMoving(false);
              }}
            />
          </View>
        }>
        <SlotPicker duration={b.end - b.start} value={slot} onChange={onSlot} excludeBookingId={b.id} />
      </ModalScreen>
    );
  }

  return (
    <ModalScreen title={b.source === 'walk-in' ? 'Walk-in' : 'Booking'}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
        <Avatar name={name} size={60} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="title" style={{ fontSize: 26 }}>{name}</Text>
          {phone ? <Text tone="muted">{formatPhone(phone)}</Text> : <Text tone="faint">No phone number</Text>}
        </View>
      </View>

      {phone && (
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Button kind="secondary" small icon="call-outline" label="Call" style={{ flex: 1, minHeight: 48 }} onPress={() => Linking.openURL(`tel:${phone}`)} />
          <Button kind="secondary" small icon="chatbubble-outline" label="Text" style={{ flex: 1, minHeight: 48 }} onPress={() => Linking.openURL(`sms:${phone}`)} />
          {client && <Button kind="secondary" small icon="person-outline" label="Client" style={{ flex: 1, minHeight: 48 }} onPress={() => router.push(`/client/${client.id}`)} />}
        </View>
      )}

      <Card style={{ gap: 2 }}>
        <Text variant="heading" style={{ fontSize: 20 }}>
          {formatDay(b.date, { long: true })}
        </Text>
        <Text tone="muted">{formatTime(b.start)}–{formatTime(b.end)} · {formatDuration(b.end - b.start)}</Text>
        <View style={{ height: space.sm }} />
        <ListRow label={b.serviceName} right={<Text>{formatMoney(b.price)}</Text>} />
        <ListRow
          label={DEPOSIT_LABEL[b.deposit.status]}
          detail={b.deposit.amount ? `${formatMoney(b.deposit.amount)}${b.deposit.status === 'paid' ? ` · ${formatMoney(b.price - b.deposit.amount)} to pay on the day` : ''}` : undefined}
        />
        <ListRow
          last
          label={b.status === 'cancelled' ? `Cancelled by ${b.cancelledBy === 'client' ? 'client' : 'you'}${b.cancelledBy === 'closure' ? ' (shop closed)' : ''}` : b.noShow ? 'No-show' : b.source === 'walk-in' ? 'Walk-in' : 'Booked online'}
          right={b.status === 'cancelled' ? <Text tone="danger">Cancelled</Text> : undefined}
        />
      </Card>

      {active && (
        <View style={{ gap: space.sm }}>
          {!started && <Button kind="secondary" icon="swap-horizontal" label="Move to another time" onPress={() => setMoving(true)} />}
          {started && (
            <Button
              kind="secondary"
              icon={b.noShow ? 'arrow-undo-outline' : 'eye-off-outline'}
              label={b.noShow ? 'Undo no-show' : `Mark as no-show${b.deposit.status === 'paid' ? ' (keep deposit)' : ''}`}
              onPress={() => setNoShow(b.id, !b.noShow)}
            />
          )}
          {!started && (
            <Button
              kind="danger"
              icon="close"
              label="Cancel booking"
              onPress={() =>
                showDialog({
                  title: `Cancel ${name.split(' ')[0]}’s booking?`,
                  message: `${phone ? 'They’ll get a text straight away' : 'No phone number, so no text will be sent'}${b.deposit.status === 'paid' ? ` and their ${formatMoney(b.deposit.amount)} deposit is refunded.` : '.'}`,
                  actions: [{ label: 'Cancel booking', destructive: true, onPress: () => (cancelBooking(b.id, 'barber'), showToast('Booking cancelled')) }],
                })
              }
            />
          )}
        </View>
      )}

      {texts.length > 0 && (
        <View style={{ gap: space.sm }}>
          <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>
            Texts to client
          </Text>
          <Card padded={false} style={{ paddingHorizontal: space.lg }}>
            {texts.map((m, i) => {
              const p = ukParts(m.sendAt);
              return (
                <ListRow
                  key={m.id}
                  last={i === texts.length - 1}
                  icon={m.cancelled ? 'close-circle-outline' : isSent(m, now) ? 'checkmark-done' : 'time-outline'}
                  label={MESSAGE_LABEL[m.kind]}
                  detail={`${m.cancelled ? 'Not sent' : isSent(m, now) ? 'Sent' : 'Scheduled'} · ${formatDay(p.date)} ${formatTime(p.minutes)}`}
                />
              );
            })}
          </Card>
          <Button small kind="ghost" label="See all texts" onPress={() => router.push({ pathname: '/messages', params: { booking: b.id } })} />
        </View>
      )}
    </ModalScreen>
  );
}

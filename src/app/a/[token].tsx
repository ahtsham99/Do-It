import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Linking, View } from 'react-native';

import { Button, Card, Icon, Text, showDialog } from '@/components/ui';
import { formatDay, formatDuration, formatMoney, formatTime, ukEpoch } from '@/lib/dates';
import { formatPhone } from '@/lib/phone';
import { useNow } from '@/lib/useNow';
import { ClientShell } from '@/features/booking/ClientShell';
import { PolicyBox } from '@/features/booking/PolicyBox';
import { freeCancelDeadline, isFreeToCancel } from '@/features/booking/rules';
import { SlotPicker, type Slot } from '@/features/booking/SlotPicker';
import { TextBubble } from '@/features/booking/TextBubble';
import { cancelBooking, rescheduleBooking } from '@/store/actions/bookings';
import { useStore } from '@/store/store';
import { space, useTheme } from '@/theme';

/** The page behind the link in every text: see, move or cancel a booking. */
export default function ManageBooking() {
  const { token, new: isNew } = useLocalSearchParams<{ token: string; new?: string }>();
  const { c } = useTheme();
  const bookings = useStore((s) => s.bookings);
  const clients = useStore((s) => s.clients);
  const messages = useStore((s) => s.messages);
  const shop = useStore((s) => s.shop);
  const b = useMemo(() => bookings.find((x) => x.token === token), [bookings, token]);
  const client = useMemo(() => clients.find((x) => x.id === b?.clientId), [clients, b]);
  const reminderKinds = useMemo(
    () => new Set(messages.filter((m) => m.bookingId === b?.id && !m.cancelled && m.kind.startsWith('reminder')).map((m) => m.kind)),
    [messages, b],
  );
  const reminderNote =
    reminderKinds.size === 2
      ? ' You’ll get a reminder the evening before and an hour before.'
      : reminderKinds.has('reminder-hour')
        ? ' You’ll get a reminder an hour before.'
        : '';
  const confirmation = useMemo(() => messages.find((m) => m.bookingId === b?.id && m.kind === 'confirmation'), [messages, b]);

  const now = useNow();
  const [moving, setMoving] = useState(false);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const onSlot = useCallback((s: Slot) => (setSlot(s), setError(null)), []);

  if (!b || !client) {
    return (
      <ClientShell>
        <View style={{ alignItems: 'center', gap: space.md, paddingTop: space.xxl }}>
          <Icon name="help-circle-outline" size={32} color={c.textFaint} />
          <Text variant="title" style={{ textAlign: 'center' }}>
            Booking not found
          </Text>
          <Text tone="muted" style={{ textAlign: 'center' }}>
            The link may be out of date. Contact the shop if you need help.
          </Text>
        </View>
      </ClientShell>
    );
  }

  const past = ukEpoch(b.date, b.end) < now;
  const active = b.status === 'confirmed' && !past;
  const free = isFreeToCancel(b, now);
  const deposit = b.deposit.amount;
  const callShop = shop.phone ? () => Linking.openURL(`tel:${shop.phone.replace(/\s/g, '')}`) : undefined;

  const confirmCancel = () => {
    const msg = !deposit
      ? 'Your slot will be released for someone else.'
      : free
        ? `Your ${formatMoney(deposit)} deposit will be refunded in full.`
        : `It’s less than ${b.cancelHours} hours to go, so the ${formatMoney(deposit)} deposit is kept by the shop.`;
    showDialog({
      title: 'Cancel this booking?',
      message: msg,
      actions: [{ label: 'Yes, cancel it', destructive: true, onPress: () => cancelBooking(b.id, 'client') }],
    });
  };

  if (moving) {
    const when = slot?.start != null ? `${formatDay(slot.date)}, ${formatTime(slot.start)}` : null;
    return (
      <ClientShell
        title="Change time"
        onBack={() => setMoving(false)}
        footer={
          <>
            {error && (
              <Text tone="danger" variant="small" style={{ textAlign: 'center' }}>
                {error}
              </Text>
            )}
            <Button
              label={when ? `Move to ${when}` : 'Pick a new time'}
              disabled={!when}
              onPress={() => {
                if (slot?.start == null) return;
                const res = rescheduleBooking(b.id, slot.date, slot.start);
                if (!res.ok) return setError(res.error);
                setMoving(false);
                setSlot(null);
              }}
            />
          </>
        }>
        <Text variant="title">Pick a new time</Text>
        <Text tone="muted">
          Now: {formatDay(b.date, { long: true })} at {formatTime(b.start)}
        </Text>
        <SlotPicker duration={b.end - b.start} value={slot} onChange={onSlot} excludeBookingId={b.id} />
      </ClientShell>
    );
  }

  const status =
    b.status === 'cancelled'
      ? { icon: 'close-circle' as const, color: c.danger, title: 'Booking cancelled' }
      : past
        ? { icon: 'time-outline' as const, color: c.textMuted, title: 'This appointment has passed' }
        : isNew
          ? { icon: 'checkmark-circle' as const, color: c.success, title: 'You’re booked' }
          : { icon: 'calendar-outline' as const, color: c.accent, title: 'Your booking' };

  return (
    <ClientShell>
      <View style={{ alignItems: 'center', gap: space.sm, paddingTop: space.md }}>
        <Icon name={status.icon} size={56} color={status.color} />
        <Text variant="title" style={{ textAlign: 'center' }}>
          {status.title}
        </Text>
        {isNew && b.status === 'confirmed' && (
          <Text tone="muted" style={{ textAlign: 'center' }}>
            We’ve texted {formatPhone(client.phone)}.{reminderNote}
          </Text>
        )}
      </View>

      <Card style={{ gap: space.sm }}>
        <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>
          {shop.name}
        </Text>
        <Text variant="heading" style={{ fontSize: 22 }}>
          {formatDay(b.date, { long: true })} at {formatTime(b.start)}
        </Text>
        <Text tone="muted">
          {b.serviceName} · {formatDuration(b.end - b.start)} · {formatMoney(b.price)}
        </Text>
        {deposit > 0 && (
          <Text tone="muted">
            Deposit {formatMoney(deposit)}:{' '}
            {{ paid: 'paid, comes off your bill', refunded: 'refunded', kept: 'kept by the shop', none: '' }[b.deposit.status]}
          </Text>
        )}
        {!!shop.address && (
          <Text variant="small" tone="muted">
            {shop.address}
          </Text>
        )}
        {b.status === 'confirmed' && !past && b.cancelHours > 0 && (
          <Text variant="small" tone={free ? 'success' : 'muted'}>
            {free ? `Free to cancel or move until ${freeCancelDeadline(b)}.` : 'The free cancellation window has passed.'}
          </Text>
        )}
      </Card>

      {active && (
        <View style={{ gap: space.sm }}>
          {free ? (
            <Button kind="secondary" icon="swap-horizontal" label="Change time" onPress={() => setMoving(true)} />
          ) : (
            callShop && <Button kind="secondary" icon="call-outline" label="Call the shop to move it" onPress={callShop} />
          )}
          <Button kind="danger" icon="close" label="Cancel booking" onPress={confirmCancel} />
        </View>
      )}

      {(b.status === 'cancelled' || past) && (
        <Button label={`Book again at ${shop.name}`} onPress={() => router.replace(`/b/${shop.slug}`)} />
      )}

      {active && <PolicyBox deposit={deposit} cancelHours={b.cancelHours} title="Cancellation rules" />}

      {isNew && confirmation && (
        <View style={{ gap: space.sm }}>
          <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>
            Your text
          </Text>
          <TextBubble body={confirmation.body} meta={`To ${formatPhone(client.phone)}`} />
        </View>
      )}
    </ClientShell>
  );
}

import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';

import { Avatar, Button, Card, Field, Icon, Press, Text } from '@/components/ui';
import { formatDay, formatDuration, formatMoney, formatTime } from '@/lib/dates';
import { useNow } from '@/lib/useNow';
import { ClientShell } from '@/features/booking/ClientShell';
import { PolicyBox } from '@/features/booking/PolicyBox';
import { hoursLabel, isFreeToCancel } from '@/features/booking/rules';
import { SlotPicker, type Slot } from '@/features/booking/SlotPicker';
import { createBooking } from '@/store/actions/bookings';
import { useServices } from '@/store/hooks';
import { useStore } from '@/store/store';
import { space, useTheme } from '@/theme';

type Step = 'service' | 'time' | 'details';

export default function BookPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const shop = useStore((s) => s.shop);
  const policies = useStore((s) => s.policies);
  const services = useServices();
  const { c } = useTheme();
  const now = useNow();

  const [step, setStep] = useState<Step>('service');
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const onSlot = useCallback((s: Slot) => (setSlot(s), setError(null)), []);

  const svc = services.find((s) => s.id === serviceId);
  const deposit = policies.depositEnabled ? policies.depositAmount : 0;

  if (!shop.slug || shop.slug !== slug || !services.length) {
    return (
      <ClientShell>
        <View style={{ alignItems: 'center', gap: space.md, paddingTop: space.xxl }}>
          <Icon name="cut-outline" size={32} color={c.textFaint} />
          <Text variant="title" style={{ textAlign: 'center' }}>
            We can’t find that shop
          </Text>
          <Text tone="muted" style={{ textAlign: 'center' }}>
            Check the link, or ask your barber for a new one.
          </Text>
        </View>
      </ClientShell>
    );
  }

  const book = () => {
    if (!svc || slot?.start == null) return;
    setBusy(true);
    const res = createBooking({ date: slot.date, start: slot.start, serviceId: svc.id, name, phone, source: 'online' });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      if (res.error.includes('taken')) setStep('time');
      return;
    }
    router.replace({ pathname: '/a/[token]', params: { token: res.value.token, new: '1' } });
  };

  // ---- Step 1: service ----
  if (step === 'service') {
    return (
      <ClientShell>
        <View style={{ alignItems: 'center', gap: space.md, paddingTop: space.md }}>
          <Avatar name={shop.name} photo={shop.photo} size={96} strong />
          <Text variant="display" style={{ textAlign: 'center', fontSize: 38, lineHeight: 42 }}>
            {shop.name}
          </Text>
          {!!shop.address && (
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <Icon name="location-outline" size={16} color={c.textMuted} />
              <Text variant="small" tone="muted" style={{ textAlign: 'center', flexShrink: 1 }}>
                {shop.address}
              </Text>
            </View>
          )}
          {!!shop.bio && (
            <Text tone="muted" style={{ textAlign: 'center', lineHeight: 22, maxWidth: 440 }}>
              {shop.bio}
            </Text>
          )}
        </View>
        <View style={{ gap: space.sm }}>
          <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase', marginLeft: 2 }}>
            Choose a service
          </Text>
          {services.map((s) => (
            <Press
              key={s.id}
              onPress={() => (setServiceId(s.id), setSlot(null), setStep('time'))}
              accessibilityLabel={`${s.name}, ${formatMoney(s.price)}, ${formatDuration(s.duration)}`}>
              <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 72, paddingHorizontal: space.lg + 2, borderRadius: 22, borderWidth: 1, backgroundColor: c.surface, borderColor: c.border, gap: space.md }}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong">{s.name}</Text>
                  <Text variant="small" tone="muted">
                    {formatDuration(s.duration)}
                  </Text>
                </View>
                <Text variant="heading">{formatMoney(s.price)}</Text>
                <Icon name="chevron-forward" size={18} color={c.textFaint} />
              </View>
            </Press>
          ))}
        </View>
        {deposit > 0 && (
          <Text variant="small" tone="muted" style={{ textAlign: 'center' }}>
            A {formatMoney(deposit)} deposit secures your booking.
          </Text>
        )}
      </ClientShell>
    );
  }

  if (!svc) return null;
  const when = slot?.start != null ? `${formatDay(slot.date)}, ${formatTime(slot.start)}` : null;

  // ---- Step 2: time ----
  if (step === 'time') {
    return (
      <ClientShell
        title={svc.name}
        onBack={() => setStep('service')}
        footer={
          <>
            {error && (
              <Text tone="danger" variant="small" style={{ textAlign: 'center' }}>
                {error}
              </Text>
            )}
            <Button label={when ? `Continue · ${when}` : 'Pick a time'} disabled={!when} onPress={() => (setError(null), setStep('details'))} />
          </>
        }>
        <Text variant="title">When suits you?</Text>
        <SlotPicker duration={svc.duration} value={slot} onChange={onSlot} />
      </ClientShell>
    );
  }

  // ---- Step 3: details ----
  return (
    <ClientShell
      title="Your details"
      onBack={() => setStep('time')}
      footer={
        <>
          {error && (
            <Text tone="danger" variant="small" style={{ textAlign: 'center' }}>
              {error}
            </Text>
          )}
          <Button
            label={deposit ? `Pay ${formatMoney(deposit)} deposit & book` : 'Confirm booking'}
            icon={deposit ? 'card-outline' : 'checkmark'}
            loading={busy}
            disabled={!name.trim() || phone.replace(/\D/g, '').length < 10}
            onPress={book}
          />
          {deposit > 0 && (
            <Text variant="small" tone="faint" style={{ textAlign: 'center' }}>
              Test mode: no card is charged yet.
            </Text>
          )}
        </>
      }>
      <Card style={{ gap: 4 }}>
        <Text variant="heading">{svc.name}</Text>
        <Text tone="muted">
          {slot && slot.start != null ? `${formatDay(slot.date, { long: true })} at ${formatTime(slot.start)}` : ''}
        </Text>
        <Text tone="muted">
          {formatDuration(svc.duration)} · {formatMoney(svc.price)}
          {deposit ? ` (${formatMoney(deposit)} now, ${formatMoney(Math.max(0, svc.price - deposit))} on the day)` : ''}
        </Text>
        <Text variant="small" tone="muted">
          {shop.name}
          {shop.address ? ` · ${shop.address}` : ''}
        </Text>
      </Card>
      <Field label="Your name" value={name} onChangeText={setName} placeholder="First and last name" autoCapitalize="words" autoComplete="name" textContentType="name" />
      <Field
        label="Mobile number"
        value={phone}
        onChangeText={(p) => (setPhone(p), setError(null))}
        placeholder="07700 900123"
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
      />
      <Text variant="small" tone="muted" style={{ marginTop: -8, marginLeft: 2 }}>
        We’ll text your confirmation and reminders here. No account needed.
      </Text>
      <PolicyBox
        deposit={deposit}
        cancelHours={policies.cancelHours}
        note={
          slot?.start != null && policies.cancelHours > 0 && !isFreeToCancel({ date: slot.date, start: slot.start, cancelHours: policies.cancelHours }, now)
            ? `Heads up: this time is less than ${hoursLabel(policies.cancelHours)} away, so ${deposit ? 'the deposit can’t be refunded if you cancel' : 'please only book if you’re sure you can make it'}.`
            : null
        }
      />
    </ClientShell>
  );
}

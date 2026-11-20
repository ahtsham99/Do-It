import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { TimeField } from '@/components/pickers';
import { Button, Chip, Field, Label, ModalScreen, Text, close, showToast } from '@/components/ui';
import { formatDay, formatDuration, formatMoney, formatTime, isValidKey, todayKey, ukParts } from '@/lib/dates';
import { createBooking } from '@/store/actions/bookings';
import { useServices } from '@/store/hooks';
import { space } from '@/theme';

export default function WalkIn() {
  const params = useLocalSearchParams<{ date?: string; start?: string }>();
  const date = isValidKey(params.date) ? params.date : todayKey();
  const now = ukParts();
  const initial = params.start ? Number(params.start) : date === now.date ? Math.floor(now.minutes / 5) * 5 : 10 * 60;
  const services = useServices();
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '');
  const [start, setStart] = useState(initial);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const svc = services.find((s) => s.id === serviceId);

  const save = () => {
    const res = createBooking({ date, start, serviceId, name, phone, source: 'walk-in' });
    if (!res.ok) return setError(res.error);
    showToast(`Walk-in added at ${formatTime(start)}`);
    close();
  };

  return (
    <ModalScreen
      title="Add a walk-in"
      doneLabel="Cancel"
      footer={
        <View style={{ gap: space.sm }}>
          {error && (
            <Text tone="danger" variant="small" style={{ textAlign: 'center' }}>
              {error}
            </Text>
          )}
          <Button label={svc ? `Add · ${formatTime(start)}–${formatTime(start + svc.duration)}` : 'Add'} disabled={!svc} onPress={save} />
        </View>
      }>
      <View style={{ gap: space.sm }}>
        <Label>Service</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {services.map((s) => (
            <Chip key={s.id} label={`${s.name} · ${formatMoney(s.price)}`} selected={s.id === serviceId} onPress={() => (setServiceId(s.id), setError(null))} />
          ))}
        </View>
        {svc && (
          <Text variant="small" tone="muted">
            Takes {formatDuration(svc.duration)}
          </Text>
        )}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Label>Starts</Label>
          <Text tone="muted">{formatDay(date)}</Text>
        </View>
        <TimeField label="Start time" value={start} onChange={(m) => (setStart(m), setError(null))} />
      </View>
      <Field label="Name (optional)" value={name} onChangeText={setName} placeholder="Walk-in" autoCapitalize="words" />
      <Field
        label="Mobile (optional)"
        value={phone}
        onChangeText={(p) => (setPhone(p), setError(null))}
        placeholder="07700 900123"
        keyboardType="phone-pad"
      />
      <Text variant="small" tone="muted">
        Add a mobile to keep them in your client list. Walk-ins don’t get a confirmation text.
      </Text>
    </ModalScreen>
  );
}

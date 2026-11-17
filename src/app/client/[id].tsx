import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Linking, View } from 'react-native';

import { Avatar, Button, Card, Field, ListRow, ModalScreen, Text } from '@/components/ui';
import { formatDay, formatMoney, formatTime } from '@/lib/dates';
import { formatPhone } from '@/lib/phone';
import { summarise } from '@/features/clients/stats';
import { updateClient } from '@/store/actions/bookings';
import { useStore } from '@/store/store';
import { space } from '@/theme';

export default function ClientDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const clients = useStore((s) => s.clients);
  const bookings = useStore((s) => s.bookings);
  const x = useMemo(() => {
    const c = clients.find((k) => k.id === id);
    return c ? summarise([c], bookings)[0] : null;
  }, [clients, bookings, id]);

  if (!x) return <ModalScreen title="Client"><Text tone="muted">Not found.</Text></ModalScreen>;
  const { client } = x;

  return (
    <ModalScreen title="Client">
      <View style={{ alignItems: 'center', gap: space.sm }}>
        <Avatar name={client.name} size={76} />
        <Text variant="title">{client.name}</Text>
        {client.phone ? <Text tone="muted">{formatPhone(client.phone)}</Text> : null}
      </View>
      {client.phone ? (
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Button kind="secondary" icon="call-outline" label="Call" style={{ flex: 1 }} onPress={() => Linking.openURL(`tel:${client.phone}`)} />
          <Button kind="secondary" icon="chatbubble-outline" label="Text" style={{ flex: 1 }} onPress={() => Linking.openURL(`sms:${client.phone}`)} />
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {[
          [String(x.visits.length), x.visits.length === 1 ? 'visit' : 'visits'],
          [formatMoney(x.spent), 'spent'],
          [String(x.noShows), x.noShows === 1 ? 'no-show' : 'no-shows'],
        ].map(([v, l]) => (
          <Card key={l} style={{ flex: 1, alignItems: 'center', paddingVertical: space.lg, paddingHorizontal: space.sm }}>
            <Text variant="heading" style={{ fontSize: 20 }}>{v}</Text>
            <Text variant="small" tone="muted">{l}</Text>
          </Card>
        ))}
      </View>

      <Field label="Notes (only you see these)" value={client.notes ?? ''} onChangeText={(notes) => updateClient(client.id, { notes })} placeholder="e.g. #2 on the sides, likes it textured on top" multiline />

      {x.upcoming.length > 0 && (
        <View style={{ gap: space.sm }}>
          <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>Coming up</Text>
          <Card padded={false} style={{ paddingHorizontal: space.lg }}>
            {x.upcoming.map((b, i) => (
              <ListRow key={b.id} last={i === x.upcoming.length - 1} label={`${formatDay(b.date)} · ${formatTime(b.start)}`} detail={b.serviceName} onPress={() => router.push(`/booking/${b.id}`)} />
            ))}
          </Card>
        </View>
      )}

      <View style={{ gap: space.sm }}>
        <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>Past visits</Text>
        {x.visits.length === 0 ? (
          <Text tone="muted">None yet.</Text>
        ) : (
          <Card padded={false} style={{ paddingHorizontal: space.lg }}>
            {x.visits.slice(0, 20).map((b, i, arr) => (
              <ListRow
                key={b.id}
                last={i === arr.length - 1}
                label={b.serviceName}
                detail={`${formatDay(b.date, { relative: false })} · ${formatTime(b.start)}`}
                right={<Text tone="muted">{formatMoney(b.price)}</Text>}
              />
            ))}
          </Card>
        )}
      </View>
    </ModalScreen>
  );
}

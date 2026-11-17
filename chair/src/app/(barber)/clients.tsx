import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar, Empty, Field, Press, Screen, Text } from '@/components/ui';
import { formatDay } from '@/lib/dates';
import { formatPhone } from '@/lib/phone';
import { summarise } from '@/features/clients/stats';
import { useStore } from '@/store/store';
import { space, useTheme } from '@/theme';

export default function Clients() {
  const { c } = useTheme();
  const clients = useStore((s) => s.clients);
  const bookings = useStore((s) => s.bookings);
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const digits = needle.replace(/\D/g, '');
    return summarise(clients, bookings)
      .filter((x) => x.client.phone || x.visits.length || x.upcoming.length)
      .filter(
        (x) =>
          !needle ||
          x.client.name.toLowerCase().includes(needle) ||
          (digits.length > 2 && ('0' + x.client.phone.slice(3)).includes(digits)),
      )
      .sort((a, b) => a.client.name.localeCompare(b.client.name));
  }, [clients, bookings, q]);

  return (
    <Screen title="Clients" subtitle={`${list.length} ${list.length === 1 ? 'person' : 'people'}`}>
      <Field value={q} onChangeText={setQ} placeholder="Search name or number" autoCorrect={false} clearButtonMode="while-editing" />
      {list.length === 0 && (
        <Empty icon="people-outline" title={q ? 'No one matches' : 'No clients yet'} body={q ? undefined : 'Everyone who books online, or walks in with a number, appears here.'} />
      )}
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }, !list.length && { display: 'none' }]}>
        {list.map((x, i) => (
          <Press key={x.client.id} onPress={() => router.push(`/client/${x.client.id}`)} accessibilityLabel={x.client.name}>
            <View style={[styles.row, i < list.length - 1 && { borderBottomColor: c.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
              <Avatar name={x.client.name} size={42} />
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong" numberOfLines={1}>
                  {x.client.name}
                </Text>
                <Text variant="small" tone="muted" numberOfLines={1}>
                  {x.client.phone ? formatPhone(x.client.phone) : 'No number'}
                  {x.lastVisit ? ` · last in ${formatDay(x.lastVisit.date)}` : ''}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text variant="bodyStrong">{x.visits.length}</Text>
                <Text variant="small" tone="faint" style={{ fontSize: 11 }}>
                  {x.visits.length === 1 ? 'visit' : 'visits'}
                </Text>
              </View>
            </View>
          </Press>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 28, borderWidth: 1, paddingHorizontal: space.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 72 },
});

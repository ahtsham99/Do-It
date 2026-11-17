import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Field, Label, Press, Stepper, Text, showDialog } from '@/components/ui';
import { formatDuration, formatMoney } from '@/lib/dates';
import { deleteService, saveService } from '@/store/actions/shop';
import { useServices } from '@/store/hooks';
import type { Service } from '@/store/types';
import { space, useTheme } from '@/theme';

function ServiceForm({ service, onDone }: { service?: Service; onDone: () => void }) {
  const [name, setName] = useState(service?.name ?? '');
  const [price, setPrice] = useState(service ? String(service.price / 100) : '');
  const [duration, setDuration] = useState(service?.duration ?? 30);
  const pence = Math.round(parseFloat(price.replace(/[£,\s]/g, '')) * 100);
  const valid = name.trim().length > 0 && Number.isFinite(pence) && pence >= 0;

  const save = () => {
    if (!valid) return;
    saveService({ id: service?.id, name: name.trim(), price: pence, duration });
    onDone();
  };

  return (
    <Card style={{ gap: space.lg }}>
      <Field label="Service" value={name} onChangeText={setName} placeholder="e.g. Skin fade" autoFocus={!service} autoCapitalize="sentences" />
      <Field label="Price (£)" value={price} onChangeText={setPrice} placeholder="20" keyboardType="decimal-pad" />
      <View style={{ gap: space.sm }}>
        <Label>Time it takes</Label>
        <Stepper label="duration" value={duration} onChange={setDuration} step={5} min={5} max={240} format={formatDuration} />
      </View>
      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {service ? (
          <Button
            kind="danger"
            label="Delete"
            style={{ flex: 1 }}
            onPress={() =>
              showDialog({
                title: `Delete ${service.name}?`,
                message: 'Existing bookings for it stay in your calendar.',
                actions: [{ label: 'Delete service', destructive: true, onPress: () => (deleteService(service.id), onDone()) }],
              })
            }
          />
        ) : (
          <Button kind="ghost" label="Cancel" style={{ flex: 1 }} onPress={onDone} />
        )}
        <Button label={service ? 'Save' : 'Add service'} onPress={save} disabled={!valid} style={{ flex: 2 }} />
      </View>
    </Card>
  );
}

/** List of services with inline add/edit. */
export function ServicesEditor() {
  const services = useServices();
  const { c } = useTheme();
  const [editing, setEditing] = useState<string | 'new' | null>(services.length ? null : 'new');

  return (
    <View style={{ gap: space.md }}>
      {services.map((s) =>
        editing === s.id ? (
          <ServiceForm key={s.id} service={s} onDone={() => setEditing(null)} />
        ) : (
          <Press key={s.id} onPress={() => setEditing(s.id)} accessibilityLabel={`Edit ${s.name}`}>
            <View style={[styles.row, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyStrong">{s.name}</Text>
                <Text variant="small" tone="muted">
                  {formatDuration(s.duration)}
                </Text>
              </View>
              <Text variant="heading">{formatMoney(s.price)}</Text>
            </View>
          </Press>
        ),
      )}
      {editing === 'new' ? (
        <ServiceForm onDone={() => setEditing(null)} />
      ) : (
        <Button kind="secondary" icon="add" label="Add a service" onPress={() => setEditing('new')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 68, paddingHorizontal: space.lg + 2, borderRadius: 20, borderWidth: 1, gap: space.md },
});

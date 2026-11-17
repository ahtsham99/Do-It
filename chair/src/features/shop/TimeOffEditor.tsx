import { useState } from 'react';
import { View } from 'react-native';

import { DateField } from '@/components/pickers';
import { Button, Card, Chip, IconButton, Label, Text, showDialog, showToast } from '@/components/ui';
import { formatDay, todayKey } from '@/lib/dates';
import { addTimeOff, bookingsOnDays, removeTimeOff } from '@/store/actions/bookings';
import { useTimeOff } from '@/store/hooks';
import { space, useTheme } from '@/theme';

const LABELS = ['Holiday', 'Day off', 'Bank holiday', 'Training'];

export function TimeOffEditor() {
  const { c } = useTheme();
  const today = todayKey();
  const list = useTimeOff().filter((t) => t.end >= today);
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);
  const [label, setLabel] = useState('Day off');

  const save = () => {
    const to = end < start ? start : end;
    const affected = bookingsOnDays((d) => d >= start && d <= to).length;
    const commit = () => {
      const n = addTimeOff({ start, end: to, label });
      showToast(n ? `Closed. ${n} client${n > 1 ? 's' : ''} texted` : 'Closed. Nobody can book those days', n ? 'chatbubble-ellipses' : 'checkmark-circle');
    };
    if (!affected) return commit();
    showDialog({
      title: `${affected} booking${affected > 1 ? 's' : ''} on ${start === to ? 'that day' : 'those days'}`,
      message: 'They will be cancelled, any deposits refunded in full, and each client gets a text straight away.',
      actions: [{ label: 'Close and text clients', destructive: true, onPress: commit }],
    });
  };

  return (
    <View style={{ gap: space.lg }}>
      <Card style={{ gap: space.lg }}>
        <Text variant="heading">Close the shop</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text tone="muted">From</Text>
          <DateField label="First day closed" value={start} min={today} onChange={(d) => (setStart(d), d > end && setEnd(d))} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text tone="muted">Until (and including)</Text>
          <DateField label="Last day closed" value={end < start ? start : end} min={start} onChange={setEnd} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {LABELS.map((l) => (
            <Chip key={l} label={l} selected={label === l} onPress={() => setLabel(l)} />
          ))}
        </View>
        <Button label={start === end || end < start ? `Close ${formatDay(start)}` : 'Close these days'} icon="moon-outline" onPress={save} />
      </Card>

      <View style={{ gap: space.sm }}>
        <Label>Coming up</Label>
        {list.length === 0 && (
          <Text tone="muted" style={{ marginLeft: 2 }}>
            No days off booked.
          </Text>
        )}
        {list.map((t) => (
          <View
            key={t.id}
            style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, borderRadius: 20, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}>
            <View style={{ flex: 1 }}>
              <Text variant="bodyStrong">{t.label}</Text>
              <Text variant="small" tone="muted">
                {t.start === t.end ? formatDay(t.start, { long: true }) : `${formatDay(t.start)} – ${formatDay(t.end)}`}
              </Text>
            </View>
            <IconButton
              icon="trash-outline"
              size={18}
              diameter={40}
              label={`Reopen ${t.label}`}
              onPress={() =>
                showDialog({
                  title: 'Open again?',
                  message: 'Clients will be able to book these days. Cancelled bookings stay cancelled.',
                  actions: [{ label: 'Reopen', onPress: () => removeTimeOff(t.id) }],
                })
              }
            />
          </View>
        ))}
      </View>
    </View>
  );
}

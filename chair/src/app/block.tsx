import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { TimeField } from '@/components/pickers';
import { Button, Chip, Label, ModalScreen, Text, close } from '@/components/ui';
import { formatDay, formatTime, isValidKey, todayKey, weekday } from '@/lib/dates';
import { blockWithCheck } from '@/features/calendar/quickBlock';
import { useStore } from '@/store/store';
import { space } from '@/theme';

const LABELS = ['Lunch', 'Break', 'Emergency', 'Personal'];
const LENGTHS = [15, 30, 45, 60, 90, 120];

export default function BlockTime() {
  const params = useLocalSearchParams<{ date?: string; start?: string }>();
  const date = isValidKey(params.date) ? params.date : todayKey();
  const hours = useStore((s) => s.hours[weekday(date)]);
  const [start, setStart] = useState(params.start ? Number(params.start) : hours.start);
  const [length, setLength] = useState<number | 'rest'>(30);
  const [label, setLabel] = useState('Lunch');
  const end = length === 'rest' ? Math.max(hours.end, start + 15) : Math.min(start + length, 24 * 60 - 1);

  return (
    <ModalScreen
      title="Block out time"
      doneLabel="Cancel"
      footer={<Button label={`Block ${formatTime(start)}–${formatTime(end)}`} onPress={() => blockWithCheck({ date, start, end, label }, close)} />}>
      <Text tone="muted">{formatDay(date, { long: true })}. Clients won’t be offered this time.</Text>
      <View style={{ gap: space.sm }}>
        <Label>Reason</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {LABELS.map((l) => (
            <Chip key={l} label={l} selected={l === label} onPress={() => setLabel(l)} />
          ))}
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Label>From</Label>
        <TimeField label="Block start" value={start} onChange={setStart} />
      </View>
      <View style={{ gap: space.sm }}>
        <Label>For</Label>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {LENGTHS.map((m) => (
            <Chip key={m} label={m < 60 ? `${m} min` : `${m / 60} hr${m > 60 ? 's' : ''}`} selected={length === m} onPress={() => setLength(m)} />
          ))}
          <Chip label="Rest of day" selected={length === 'rest'} onPress={() => setLength('rest')} />
        </View>
      </View>
    </ModalScreen>
  );
}

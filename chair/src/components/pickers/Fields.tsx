import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Platform, StyleSheet } from 'react-native';

import { Press, Text } from '@/components/ui';
import { formatDay, formatTime } from '@/lib/dates';
import { radius, useTheme } from '@/theme';

import type { DateFieldProps, TimeFieldProps } from './types';

// The native picker works with device-local Date objects; we only read the
// wall-clock parts back out, so the phone's time zone never matters.
const pad = (n: number) => String(n).padStart(2, '0');
const timeToDate = (m: number) => new Date(2000, 0, 1, Math.floor(m / 60), m % 60);
const keyToDate = (k: string) => {
  const [y, mo, d] = k.split('-').map(Number);
  return new Date(y, mo - 1, d);
};
const dateToKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function Pill({ label, onPress, accessibilityLabel }: { label: string; onPress: () => void; accessibilityLabel?: string }) {
  const { c } = useTheme();
  return (
    <Press accessibilityLabel={accessibilityLabel} onPress={onPress} style={[styles.pill, { backgroundColor: c.surfaceAlt }]}>
      <Text variant="bodyStrong">{label}</Text>
    </Press>
  );
}

export function TimeField({ value, onChange, label }: TimeFieldProps) {
  const { c, dark } = useTheme();
  const emit = (d: Date) => onChange(d.getHours() * 60 + d.getMinutes());
  if (Platform.OS === 'ios') {
    return (
      <DateTimePicker
        value={timeToDate(value)}
        mode="time"
        display="compact"
        minuteInterval={5}
        themeVariant={dark ? 'dark' : 'light'}
        accentColor={c.accent}
        onValueChange={(_, d) => emit(d)}
      />
    );
  }
  return (
    <Pill
      label={formatTime(value)}
      accessibilityLabel={label}
      onPress={() => DateTimePickerAndroid.open({ value: timeToDate(value), mode: 'time', is24Hour: false, onValueChange: (_, d) => emit(d) })}
    />
  );
}

export function DateField({ value, onChange, min, label }: DateFieldProps) {
  const { c, dark } = useTheme();
  const emit = (d: Date) => onChange(dateToKey(d));
  const minimumDate = min ? keyToDate(min) : undefined;
  if (Platform.OS === 'ios') {
    return (
      <DateTimePicker
        value={keyToDate(value)}
        mode="date"
        display="compact"
        minimumDate={minimumDate}
        themeVariant={dark ? 'dark' : 'light'}
        accentColor={c.accent}
        onValueChange={(_, d) => emit(d)}
      />
    );
  }
  return (
    <Pill
      label={formatDay(value)}
      accessibilityLabel={label}
      onPress={() => DateTimePickerAndroid.open({ value: keyToDate(value), mode: 'date', minimumDate, onValueChange: (_, d) => emit(d) })}
    />
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 14, height: 44, justifyContent: 'center', borderRadius: radius.sm },
});

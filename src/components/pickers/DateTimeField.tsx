import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Platform, StyleSheet } from 'react-native';

import { Press, Text } from '@/components/ui';
import { combine, formatDay, formatTime, fromKey, timeFromDate, toKey } from '@/lib/dates';
import { radius, useTheme } from '@/theme';

import type { DateTimeFieldProps } from './types';

/** Native date/time field: iOS compact picker, Android dialog. */
export function DateTimeField({ mode, value, onChange, use24h }: DateTimeFieldProps) {
  const { c, dark } = useTheme();
  const date = mode === 'date' ? fromKey(value) : combine(toKey(new Date()), value);
  const emit = (d: Date) => onChange(mode === 'date' ? toKey(d) : timeFromDate(d));

  if (Platform.OS === 'ios') {
    return (
      <DateTimePicker
        value={date}
        mode={mode}
        display="compact"
        themeVariant={dark ? 'dark' : 'light'}
        accentColor={c.accent}
        onValueChange={(_, d) => emit(d)}
      />
    );
  }

  return (
    <Press
      style={[styles.pill, { backgroundColor: c.surfaceAlt }]}
      onPress={() =>
        DateTimePickerAndroid.open({
          value: date,
          mode,
          is24Hour: use24h,
          onValueChange: (_, d) => emit(d),
        })
      }>
      <Text variant="bodyStrong">{mode === 'date' ? formatDay(value) : formatTime(value, use24h)}</Text>
    </Press>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 14, height: 38, justifyContent: 'center', borderRadius: radius.sm },
});

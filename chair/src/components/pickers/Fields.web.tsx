import { View } from 'react-native';

import { Text } from '@/components/ui';
import { formatDay, formatTime, toHHMM, fromHHMM } from '@/lib/dates';
import { radius, useTheme } from '@/theme';

import type { DateFieldProps, TimeFieldProps } from './types';

/**
 * Web: a styled pill with an invisible native <input> on top, so tapping it
 * on a phone opens the browser's own date/time wheel.
 */
function Shell({ label, children }: { label: string; children: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <View
      style={{ position: 'relative', backgroundColor: c.surfaceAlt, borderRadius: radius.sm, height: 44, paddingHorizontal: 14, justifyContent: 'center' }}>
      <Text variant="bodyStrong">{label}</Text>
      {children}
    </View>
  );
}

const inputStyle = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  opacity: 0,
  border: 0,
  fontSize: 16,
  cursor: 'pointer',
} as const;

export function TimeField({ value, onChange, label }: TimeFieldProps) {
  return (
    <Shell label={formatTime(value)}>
      <input
        type="time"
        step={300}
        value={toHHMM(value)}
        aria-label={label ?? 'Time'}
        onChange={(e) => e.target.value && onChange(fromHHMM(e.target.value))}
        style={inputStyle}
      />
    </Shell>
  );
}

export function DateField({ value, onChange, min, label }: DateFieldProps) {
  return (
    <Shell label={formatDay(value)}>
      <input
        type="date"
        value={value}
        min={min}
        aria-label={label ?? 'Date'}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        style={inputStyle}
      />
    </Shell>
  );
}

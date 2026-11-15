import { View } from 'react-native';

import { Text } from '@/components/ui';
import { formatDay, formatTime } from '@/lib/dates';
import { radius, useTheme } from '@/theme';

import type { DateTimeFieldProps } from './types';

/**
 * Web: a styled pill with an invisible native <input> on top, so tapping it on
 * iPhone opens Safari's own date/time wheel.
 */
export function DateTimeField({ mode, value, onChange, use24h }: DateTimeFieldProps) {
  const { c } = useTheme();
  return (
    <View
      style={{
        position: 'relative',
        backgroundColor: c.surfaceAlt,
        borderRadius: radius.sm,
        height: 38,
        paddingHorizontal: 14,
        justifyContent: 'center',
      }}>
      <Text variant="bodyStrong">{mode === 'date' ? formatDay(value) : formatTime(value, use24h)}</Text>
      <input
        type={mode}
        value={value}
        aria-label={mode === 'date' ? 'Date' : 'Time'}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          border: 0,
          fontSize: 16,
          cursor: 'pointer',
        }}
      />
    </View>
  );
}

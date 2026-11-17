import { StyleSheet, View } from 'react-native';

import { radius, useTheme } from '@/theme';

import { Icon } from './Icon';
import { Press } from './Pressable';
import { Text } from './Text';

/** − value + with big targets. */
export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = Infinity,
  format = String,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
  max?: number;
  format?: (n: number) => string;
  label: string;
}) {
  const { c } = useTheme();
  const btn = (dir: -1 | 1) => {
    const next = Math.min(max, Math.max(min, value + dir * step));
    const disabled = next === value;
    return (
      <Press
        accessibilityLabel={`${dir < 0 ? 'Less' : 'More'} ${label}`}
        disabled={disabled}
        onPress={() => onChange(next)}
        style={[styles.btn, { backgroundColor: c.surfaceAlt, opacity: disabled ? 0.35 : 1 }]}>
        <Icon name={dir < 0 ? 'remove' : 'add'} size={22} />
      </Press>
    );
  };
  return (
    <View style={styles.row}>
      {btn(-1)}
      <Text variant="heading" style={styles.value} accessibilityLabel={`${label}: ${format(value)}`}>
        {format(value)}
      </Text>
      {btn(1)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btn: { width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  value: { minWidth: 76, textAlign: 'center' },
});

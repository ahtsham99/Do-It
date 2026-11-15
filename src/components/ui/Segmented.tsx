import { StyleSheet, View } from 'react-native';

import { radius, useTheme } from '@/theme';

import { Press } from './Pressable';
import { Text } from './Text';

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { c } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: c.surfaceAlt }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Press
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.item, active && { backgroundColor: c.surface, shadowOpacity: 0.08 }]}>
            <Text variant="small" color={active ? c.text : c.textMuted} style={{ fontWeight: '700' }}>
              {o.label}
            </Text>
          </Press>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', borderRadius: radius.md, padding: 3 },
  item: {
    flex: 1,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md - 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    shadowOpacity: 0,
  },
});

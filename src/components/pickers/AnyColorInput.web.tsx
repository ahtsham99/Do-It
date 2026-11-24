import { View } from 'react-native';

import { Icon, Text } from '@/components/ui';
import { radius, space, useTheme } from '@/theme';

/** Web: a button over an invisible <input type="color">, which opens iOS's own colour picker. */
export function AnyColorInput({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const { c } = useTheme();
  return (
    <View style={{ position: 'relative', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, height: 48, borderRadius: radius.pill, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface }}>
      <Icon name="color-palette-outline" size={18} color={c.text} />
      <Text style={{ fontWeight: '600' }}>Pick any colour…</Text>
      <input
        type="color"
        value={value}
        aria-label="Pick any colour"
        onChange={(e) => onChange(e.target.value)}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, border: 0, cursor: 'pointer' }}
      />
    </View>
  );
}
export const hasSystemColorPicker = true;

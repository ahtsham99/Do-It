import { StyleSheet, View } from 'react-native';

import { Icon, Press, type IconName } from '@/components/ui';
import { radius, useTheme } from '@/theme';

export function IconPicker({
  icons,
  value,
  color,
  onChange,
}: {
  icons: IconName[];
  value: string;
  color: string;
  onChange: (i: IconName) => void;
}) {
  const { c } = useTheme();
  return (
    <View style={styles.grid}>
      {icons.map((i) => {
        const sel = i === value;
        return (
          <Press
            key={i}
            onPress={() => onChange(i)}
            accessibilityLabel={i}
            accessibilityState={{ selected: sel }}
            style={[styles.cell, { backgroundColor: sel ? color : c.surfaceAlt }]}>
            <Icon name={i} size={22} color={sel ? '#fff' : c.textMuted} />
          </Press>
        );
      })}
    </View>
  );
}

export function ColorPicker({ colors, value, onChange }: { colors: string[]; value: string; onChange: (c: string) => void }) {
  const { c } = useTheme();
  return (
    <View style={styles.grid}>
      {colors.map((col) => (
        <Press
          key={col}
          onPress={() => onChange(col)}
          accessibilityLabel={`Colour ${col}`}
          style={[styles.swatch, { borderColor: col === value ? c.text : 'transparent' }]}>
          <View style={[styles.swatchInner, { backgroundColor: col }]} />
        </Press>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { width: 46, height: 46, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  swatch: { width: 44, height: 44, borderRadius: 22, borderWidth: 2.5, padding: 3 },
  swatchInner: { flex: 1, borderRadius: 20 },
});

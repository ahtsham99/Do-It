import { StyleSheet, View } from 'react-native';

import { Glyph, Press } from '@/components/ui';
import { radius, useTheme } from '@/theme';

export function IconPicker({
  icons,
  value,
  color,
  onChange,
}: {
  icons: string[];
  value: string;
  color: string;
  onChange: (i: string) => void;
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
            style={[styles.cell, { backgroundColor: c.surfaceAlt, borderColor: sel ? color : 'transparent' }]}>
            <Glyph value={i} size={22} color={c.textMuted} />
          </Press>
        );
      })}
    </View>
  );
}

export function ColorPicker({ colors, value, onChange }: { colors: string[]; value: string; onChange: (c: string) => void }) {
  const { c, paint } = useTheme();
  return (
    <View style={styles.grid}>
      {colors.map((col) => (
        <Press
          key={col}
          onPress={() => onChange(col)}
          accessibilityLabel={`Colour ${col}`}
          style={[styles.swatch, { borderColor: col === value ? c.text : 'transparent' }]}>
          <View style={[styles.swatchInner, { backgroundColor: paint(col) }]} />
        </Press>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { width: 48, height: 48, borderRadius: radius.md, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  swatch: { width: 44, height: 44, borderRadius: 22, borderWidth: 2.5, padding: 3 },
  swatchInner: { flex: 1, borderRadius: 20 },
});

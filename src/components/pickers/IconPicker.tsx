import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Glyph, Icon, Press, Text, showDialog } from '@/components/ui';
import { useEntitlements } from '@/lib/premium';
import { radius, space, useTheme } from '@/theme';
import { t } from '@/lib/i18n';

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
  const { has } = useEntitlements();
  const unlocked = has('premiumIcons');
  return (
    <View style={{ gap: space.md }}>
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
    {/* Premium set: shown locked on the free plan. */}
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Icon name="diamond-outline" size={14} color={c.flame} />
      <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase', fontSize: 11 }}>
        {t('Premium icons')}
      </Text>
    </View>
    <View style={styles.grid}>
      {PREMIUM_ICONS.map((i) => {
        const sel = i === value;
        return (
          <Press
            key={i}
            onPress={() =>
              unlocked
                ? onChange(i)
                : showDialog({
                    title: t('Premium icons'),
                    message: t('More icons are coming with Do It Premium. Everything you use today stays free.'),
                    actions: [{ label: t('Sounds good'), onPress: () => {} }],
                  })
            }
            accessibilityLabel={unlocked ? i : `${i}, premium`}
            accessibilityState={{ selected: sel }}
            style={[styles.cell, { backgroundColor: c.surfaceAlt, borderColor: sel ? color : 'transparent', opacity: unlocked ? 1 : 0.55 }]}>
            <Glyph value={i} size={22} color={c.textMuted} />
            {!unlocked && (
              <View style={[styles.lock, { backgroundColor: c.surface, borderColor: c.border }]}>
                <Icon name="lock-closed" size={9} color={c.textMuted} />
              </View>
            )}
          </Press>
        );
      })}
    </View>
    </View>
  );
}

/** Extra icons for the paid tier. */
export const PREMIUM_ICONS = ['🕌', '🌙', '🕯️', '🎄', '🎃', '🏛️', '👶', '💒', '🏝️', '🗼', '🎡', '🎤', '🎨', '🧳', '🏁', '💎', '🌸', '🦋', '🐶', '🐱', '⚡', '🔥', '🌍', '👑'];

export function ColorPicker({ colors, value, onChange, children }: { colors: string[]; value: string; onChange: (c: string) => void; children?: ReactNode }) {
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
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cell: { width: 48, height: 48, borderRadius: radius.md, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  lock: { position: 'absolute', right: -3, top: -3, width: 16, height: 16, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  swatch: { width: 44, height: 44, borderRadius: 22, borderWidth: 2.5, padding: 3 },
  swatchInner: { flex: 1, borderRadius: 20 },
});

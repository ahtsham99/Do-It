import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, Press, Text } from '@/components/ui';
import { useEntitlements } from '@/lib/premium';
import { updateSettings } from '@/store/actions/settings';
import { useSettings } from '@/store/hooks';
import { NIGHT_COLORS, PREMIUM_COLORS, radius, setColorPreview, space, useColorPreview, useTheme, type NightColor } from '@/theme';

/**
 * Premium palettes. With Premium, tap to use one. Without it, tapping tries
 * the palette on across the app until you leave Settings.
 */
export function PremiumPalettes() {
  const { c } = useTheme();
  const { nightColor } = useSettings();
  const { has } = useEntitlements();
  const unlocked = has('themes');
  const preview = useColorPreview();

  // Leaving Settings ends a preview.
  useFocusEffect(useCallback(() => () => setColorPreview(null), []));

  const choose = (k: NightColor) => {
    if (unlocked) {
      setColorPreview(null);
      updateSettings({ nightColor: k });
    } else setColorPreview(preview === k ? null : k);
  };

  return (
    <View style={{ gap: space.sm, marginTop: space.xs }}>
      <View style={styles.head}>
        <Text variant="small" tone="muted">
          Premium palettes
        </Text>
        {!unlocked && (
          <View style={[styles.badge, { backgroundColor: c.accentSoft }]}>
            <Icon name="sparkles" size={11} color={c.accent} />
            <Text variant="small" color={c.accent} style={{ fontSize: 11, fontWeight: '600' }}>
              Premium
            </Text>
          </View>
        )}
      </View>

      {preview && !unlocked ? (
        <View style={[styles.previewBar, { backgroundColor: c.accentSoft }]}>
          <Text variant="small" style={{ flex: 1 }}>
            Previewing <Text variant="small" style={{ fontWeight: '700' }}>{NIGHT_COLORS[preview].label}</Text>. Premium palettes are coming soon.
          </Text>
          <Press onPress={() => setColorPreview(null)} hitSlop={8} accessibilityLabel="Stop preview">
            <Text variant="small" color={c.accent} style={{ fontWeight: '700' }}>
              Stop
            </Text>
          </Press>
        </View>
      ) : null}

      <View style={styles.grid}>
        {PREMIUM_COLORS.map((k) => {
          const p = NIGHT_COLORS[k];
          const on = unlocked ? nightColor === k : preview === k;
          return (
            <Press
              key={k}
              onPress={() => choose(k)}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${p.label} palette${unlocked ? '' : ', premium, tap to preview'}`}
              style={[styles.card, { backgroundColor: c.surfaceAlt, borderColor: on ? c.text : 'transparent' }]}>
              <View style={styles.stack}>
                {p.shades!.map((hex, i) => (
                  <View key={hex} style={[styles.bar, { backgroundColor: hex, marginTop: i ? -5 : 0, zIndex: i, borderColor: c.surfaceAlt }]} />
                ))}
              </View>
              <View style={styles.nameRow}>
                <Text variant="small" numberOfLines={1} style={{ flex: 1, fontWeight: on ? '700' : '600', fontSize: 13 }}>
                  {p.label}
                </Text>
                {!unlocked && <Icon name={on ? 'eye-outline' : 'lock-closed'} size={12} color={c.textMuted} />}
              </View>
              <Text variant="small" tone="muted" numberOfLines={1} style={{ fontSize: 11.5 }}>
                {p.blurb}
              </Text>
            </Press>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  previewBar: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  card: { width: '48.5%', flexGrow: 1, flexBasis: '45%', padding: space.md, borderRadius: radius.lg, borderWidth: 2, gap: 3 },
  stack: { marginBottom: space.sm },
  bar: { height: 13, borderRadius: 7, borderTopWidth: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});

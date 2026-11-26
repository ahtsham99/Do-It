import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Mask, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Icon, Press, Text } from '@/components/ui';
import { useEntitlements } from '@/lib/premium';
import { updateSettings } from '@/store/actions/settings';
import { useSettings } from '@/store/hooks';
import { NIGHT_COLORS, PREMIUM_COLORS, radius, setColorPreview, space, useColorPreview, useTheme, type NightColor } from '@/theme';

/**
 * Premium palettes, tucked under "More colours". With Premium, tap to use one.
 * Without it, tapping tries the palette on across the app until you leave
 * Settings.
 */
export function PremiumPalettes() {
  const { c } = useTheme();
  const { nightColor } = useSettings();
  const { has } = useEntitlements();
  const unlocked = has('themes');
  const preview = useColorPreview();
  const usingOne = !!NIGHT_COLORS[nightColor as NightColor]?.premium && unlocked;
  const [open, setOpen] = useState(usingOne);
  const shown = open || usingOne || !!preview;

  // Leaving Settings ends a preview.
  useFocusEffect(useCallback(() => () => setColorPreview(null), []));

  const choose = (k: NightColor) => {
    if (unlocked) {
      setColorPreview(null);
      updateSettings({ nightColor: k });
    } else setColorPreview(preview === k ? null : k);
  };
  const toggle = () => {
    if (shown) setColorPreview(null);
    setOpen(!shown);
  };

  return (
    <View style={{ gap: space.sm }}>
      <Press onPress={toggle} accessibilityRole="button" accessibilityState={{ expanded: shown }} style={[styles.more, { backgroundColor: c.surfaceAlt }]}>
        <View style={styles.peek}>
          {PREMIUM_COLORS.slice(0, 3).map((k, i) => (
            <View key={k} style={[styles.peekDot, { backgroundColor: NIGHT_COLORS[k].glow[0], marginLeft: i ? -7 : 0, borderColor: c.surfaceAlt }]} />
          ))}
        </View>
        <Text numberOfLines={1} style={{ flex: 1, fontWeight: '600' }}>
          More colours
        </Text>
        {!unlocked && (
          <View style={[styles.badge, { backgroundColor: c.accentSoft }]}>
            <Icon name="sparkles" size={11} color={c.accent} />
            <Text variant="small" color={c.accent} style={{ fontSize: 11, fontWeight: '600' }}>
              Premium
            </Text>
          </View>
        )}
        <Icon name={shown ? 'chevron-up' : 'chevron-down'} size={18} color={c.textMuted} />
      </Press>

      {shown && (
        <>
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
            {PREMIUM_COLORS.map((k) => (
              <GlowTile key={k} id={k} on={unlocked ? nightColor === k : preview === k} unlocked={unlocked} onPress={() => choose(k)} ring={c.text} />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

/** A palette as its night glow, with the dot texture. */
function GlowTile({ id, on, unlocked, onPress, ring }: { id: NightColor; on: boolean; unlocked: boolean; onPress: () => void; ring: string }) {
  const p = NIGHT_COLORS[id];
  const [s900, s700, s500] = p.shades!;
  return (
    <Press
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: on }}
      accessibilityLabel={`${p.label} palette${unlocked ? '' : ', premium, tap to preview'}`}
      style={[styles.tileWrap, { borderColor: on ? ring : 'transparent' }]}>
      <View style={styles.tile}>
        <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id={`tg-${id}`} x1="0.15" y1="0" x2="0.85" y2="1">
              <Stop offset="0" stopColor={s500} />
              <Stop offset="0.45" stopColor={s700} />
              <Stop offset="0.82" stopColor={s900} />
              <Stop offset="1" stopColor="#050505" />
            </LinearGradient>
            <Pattern id={`td-${id}`} width="7" height="7" patternUnits="userSpaceOnUse">
              <Circle cx="3.5" cy="3.5" r="1" fill="#FFFFFF" />
            </Pattern>
            <RadialGradient id={`tf-${id}`} cx="0.9" cy="0.1" rx="0.9" ry="0.8">
              <Stop offset="0" stopColor="#fff" stopOpacity={1} />
              <Stop offset="1" stopColor="#fff" stopOpacity={0} />
            </RadialGradient>
            <Mask id={`tm-${id}`}>
              <Rect width="100%" height="100%" fill={`url(#tf-${id})`} />
            </Mask>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#tg-${id})`} />
          <Rect width="100%" height="100%" fill={`url(#td-${id})`} opacity={0.22} mask={`url(#tm-${id})`} />
        </Svg>
        <View style={styles.corner}>
          {on && unlocked ? (
            <View style={styles.tick}>
              <Icon name="checkmark" size={14} color="#111" />
            </View>
          ) : (
            <Icon name={on ? 'eye' : 'lock-closed'} size={13} color="rgba(255,255,255,0.85)" />
          )}
        </View>
        <Text numberOfLines={1} color="#FFFFFF" style={{ fontWeight: '700', fontSize: 15 }}>
          {p.label}
        </Text>
        <Text numberOfLines={1} color="rgba(255,255,255,0.75)" style={{ fontSize: 11.5 }}>
          {p.blurb}
        </Text>
      </View>
    </Press>
  );
}

const styles = StyleSheet.create({
  more: { flexDirection: 'row', alignItems: 'center', gap: space.sm + 2, paddingHorizontal: space.md, height: 52, borderRadius: radius.lg },
  peek: { flexDirection: 'row' },
  peekDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  previewBar: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  tileWrap: { flexBasis: '45%', flexGrow: 1, borderWidth: 2.5, borderRadius: radius.lg + 4, padding: 2 },
  tile: { height: 104, borderRadius: radius.lg, overflow: 'hidden', padding: space.md, justifyContent: 'flex-end' },
  corner: { position: 'absolute', top: 10, right: 10 },
  tick: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
});

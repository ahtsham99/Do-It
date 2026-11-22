import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Mask, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useTheme } from '@/theme';

/**
 * The colour glow at the top of a screen, with a dotted texture that fades
 * out towards the bottom-left. Strong at night, faint by day.
 */
export function Glow({ height = 460 }: { height?: number }) {
  const { c } = useTheme();
  return (
    <View pointerEvents="none" style={[styles.wrap, { height }]}>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="g" x1="0" y1="0" x2="0.25" y2="1">
            <Stop offset="0" stopColor={c.glow[0]} stopOpacity={c.glowOpacity} />
            <Stop offset="0.38" stopColor={c.glow[1]} stopOpacity={c.glowOpacity} />
            <Stop offset="0.72" stopColor={c.glow[2]} stopOpacity={c.glowOpacity} />
            <Stop offset="1" stopColor={c.bg} stopOpacity={1} />
          </LinearGradient>
          <Pattern id="dots" width="7" height="7" patternUnits="userSpaceOnUse">
            <Circle cx="3.5" cy="3.5" r="1.1" fill={c.dots} />
          </Pattern>
          <RadialGradient id="fade" cx="0.85" cy="0.22" rx="0.8" ry="0.62">
            <Stop offset="0" stopColor="#fff" stopOpacity={1} />
            <Stop offset="1" stopColor="#fff" stopOpacity={0} />
          </RadialGradient>
          <Mask id="m">
            <Rect width="100%" height="100%" fill="url(#fade)" />
          </Mask>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#g)" />
        <Rect width="100%" height="100%" fill="url(#dots)" opacity={c.dotsOpacity} mask="url(#m)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, right: 0 },
});

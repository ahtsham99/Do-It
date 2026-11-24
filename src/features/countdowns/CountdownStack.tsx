import { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, View } from 'react-native';

import { tap } from '@/components/ui';
import type { Countdown } from '@/store/types';
import { space, useTheme } from '@/theme';

import { CountdownCard } from './CountdownCard';

const PEEK = 12; // how far each card behind shows below the one in front
const SCALE = 0.05; // how much smaller each card behind is

/**
 * Upcoming countdowns as a stack, soonest on top. Drag the top card sideways:
 * the card behind grows and slides up to the front as you go. Swipe right to
 * bring the previous one back. Short drags spring back.
 */
export function CountdownStack({ items }: { items: Countdown[] }) {
  const { c } = useTheme();
  const [w, setW] = useState(0);
  const [index, setIndex] = useState(0);
  const [dx] = useState(() => new Animated.Value(0));
  const animating = useRef(false);

  // Keep the index valid if countdowns are removed.
  const i = Math.min(index, Math.max(0, items.length - 1));

  const settle = (dir: -1 | 0 | 1) => {
    if (dir === 0) {
      Animated.spring(dx, { toValue: 0, useNativeDriver: true, friction: 8, tension: 70 }).start();
      return;
    }
    animating.current = true;
    tap('light');
    Animated.timing(dx, { toValue: dir * (w + 24), duration: 230, useNativeDriver: true }).start(() => {
      setIndex((x) => x - dir);
      dx.setValue(0);
      animating.current = false;
    });
  };

  // The gesture handler is created once; it reads the latest values from here.
  const latest = useRef({ i, count: items.length, w, settle });
  useEffect(() => {
    latest.current = { i, count: items.length, w, settle };
  });

  // Refs are only read inside the gesture callbacks below, never during render.
  // eslint-disable-next-line react-hooks/refs
  const [responder] = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => !animating.current && Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.4,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, g) => {
        const { i: at, count } = latest.current;
        // Resist at the ends (nothing before the first / after the last).
        const blocked = (g.dx < 0 && at >= count - 1) || (g.dx > 0 && at <= 0);
        dx.setValue(blocked ? g.dx * 0.25 : g.dx);
      },
      onPanResponderRelease: (_, g) => {
        const { i: at, count, w: width, settle: go } = latest.current;
        const far = Math.abs(g.dx) > width * 0.28 || Math.abs(g.vx) > 0.6;
        if (far && g.dx < 0 && at < count - 1) go(-1);
        else if (far && g.dx > 0 && at > 0) go(1);
        else go(0);
      },
      onPanResponderTerminate: () => latest.current.settle(0),
    }),
  );

  if (items.length === 0) return null;
  if (items.length === 1) return <CountdownCard item={items[0]} hero />;

  const width = Math.max(1, w);
  // 0 → 1 as the top card is dragged left (next card comes forward)
  const fwd = dx.interpolate({ inputRange: [-width, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  // 0 → 1 as you drag right (previous card comes back)
  const back = dx.interpolate({ inputRange: [0, width], outputRange: [0, 1], extrapolate: 'clamp' });

  /** Style for a card that sits `depth` places behind the top (can be fractional while moving). */
  const layer = (depth: Animated.AnimatedInterpolation<number> | Animated.Value | number) => {
    const d = depth as Animated.AnimatedInterpolation<number>;
    return {
      transform: [
        { translateY: Animated.multiply(d, PEEK) },
        { scale: Animated.subtract(1, Animated.multiply(d, SCALE)) },
      ],
      opacity: Animated.subtract(1, Animated.multiply(d, 0.28)),
    };
  };

  const prev = items[i - 1];
  const front = items[i];
  const next1 = items[i + 1];
  const next2 = items[i + 2];

  return (
    <View style={{ gap: space.sm }}>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ paddingBottom: PEEK * 2 }} {...responder.panHandlers}>
        {/* Drawn back to front, so the next card is the one peeking out. */}
        {next2 && (
          <Animated.View key={next2.id} pointerEvents="none" style={[styles.behind, layer(Animated.subtract(2, fwd))]}>
            <CountdownCard item={next2} hero flat />
          </Animated.View>
        )}
        {next1 && (
          <Animated.View key={next1.id} pointerEvents="none" style={[styles.behind, layer(Animated.subtract(1, fwd))]}>
            <CountdownCard item={next1} hero flat />
          </Animated.View>
        )}
        <Animated.View
          key={front.id}
          style={[
            layer(back),
            // The top card follows your finger only when going forward.
            { transform: [{ translateX: dx.interpolate({ inputRange: [-width, 0, width], outputRange: [-width, 0, 0] }) }, { translateY: Animated.multiply(back, PEEK) }, { scale: Animated.subtract(1, Animated.multiply(back, SCALE)) }] },
          ]}>
          <CountdownCard item={front} hero flat />
        </Animated.View>
        {prev && (
          <Animated.View
            key={prev.id}
            style={[styles.behind, { bottom: PEEK * 2, transform: [{ translateX: dx.interpolate({ inputRange: [0, width], outputRange: [-width - 24, 0], extrapolate: 'clamp' }) }] }]}>
            <CountdownCard item={prev} hero flat />
          </Animated.View>
        )}
      </View>
      <View style={styles.dots} accessibilityLabel={`Countdown ${i + 1} of ${items.length}`}>
        {items.map((x, k) => (
          <View key={x.id} style={[styles.dot, { backgroundColor: k === i ? c.text : c.border, width: k === i ? 16 : 6 }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  behind: { position: 'absolute', top: 0, left: 0, right: 0, bottom: PEEK * 2 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot: { height: 6, borderRadius: 3 },
});

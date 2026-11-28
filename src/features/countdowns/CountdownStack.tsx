import { useMemo, useState } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import { tap } from '@/components/ui';
import type { Countdown } from '@/store/types';
import { space, useTheme } from '@/theme';

import { CountdownCard } from './CountdownCard';
import { t } from '@/lib/i18n';

const PEEK = 12; // how far each card behind shows below the one in front
const SCALE = 0.05; // how much smaller each card behind is

/**
 * Upcoming countdowns as a stack, soonest on top.
 *
 * Smoothness: the swipe is a real horizontal paging scroll (the phone's own
 * scrolling, with momentum and snapping), and the stacking effect is driven
 * straight from the scroll position — no per-frame gesture maths in JS.
 * Each card to the right is pinned in place behind the top one; as you swipe,
 * the top card slides away and the next grows and rises to the front.
 */
export function CountdownStack({ items }: { items: Countdown[] }) {
  const { c } = useTheme();
  const [w, setW] = useState(0);
  const [index, setIndex] = useState(0);
  const [x] = useState(() => new Animated.Value(0));

  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { x } } }], {
        useNativeDriver: Platform.OS !== 'web',
        listener: (e: { nativeEvent: { contentOffset: { x: number } } }) => {
          if (!w) return;
          const i = Math.round(e.nativeEvent.contentOffset.x / w);
          if (i !== index) {
            tap('light');
            setIndex(i);
          }
        },
      }),
    [x, w, index],
  );

  // Per-card styles, built once per width (not on every frame).
  const layers = useMemo(() => {
    if (!w) return [];
    return items.map((_, k) => {
      const at = (p: number) => (k + p) * w; // scroll offset where this card is p places "past" the top
      return {
        zIndex: items.length - k,
        transform: [
          // Cards still to come are pinned under the top card; the top card scrolls away normally.
          { translateX: x.interpolate({ inputRange: [at(-1), at(0), at(1)], outputRange: [-w, 0, 0], extrapolateLeft: 'extend', extrapolateRight: 'clamp' }) },
          { translateY: x.interpolate({ inputRange: [at(-3), at(-2), at(-1), at(0)], outputRange: [PEEK * 3, PEEK * 2, PEEK, 0], extrapolate: 'clamp' }) },
          { scale: x.interpolate({ inputRange: [at(-3), at(-2), at(-1), at(0)], outputRange: [1 - SCALE * 3, 1 - SCALE * 2, 1 - SCALE, 1], extrapolate: 'clamp' }) },
        ],
        opacity: x.interpolate({ inputRange: [at(-3), at(-2), at(-1), at(0)], outputRange: [0, 0.45, 0.75, 1], extrapolate: 'clamp' }),
      };
    });
  }, [items, w, x]);

  if (items.length === 0) return null;
  if (items.length === 1) return <CountdownCard item={items[0]} hero />;

  return (
    <View style={{ gap: space.sm }}>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        {w > 0 && (
          <Animated.ScrollView
            horizontal
            // Web: browser scroll-snap on the cards themselves (pagingEnabled would
            // wrap each card in its own layer and break the stacking order).
            pagingEnabled={Platform.OS !== 'web'}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            style={[{ width: w }, Platform.OS === 'web' && styles.snapX]}>
            {items.map((item, k) => (
              <Animated.View key={item.id} style={[{ width: w, paddingBottom: PEEK * 2, position: 'relative' }, layers[k], Platform.OS === 'web' && styles.layer, Platform.OS === 'web' && styles.snapStart]}>
                <CountdownCard item={item} hero flat />
              </Animated.View>
            ))}
          </Animated.ScrollView>
        )}
      </View>
      <View style={styles.dots} accessibilityLabel={t('Countdown {n} of {total}', { n: index + 1, total: items.length })}>
        {items.map((it, k) => (
          <View key={it.id} style={[styles.dot, { backgroundColor: k === index ? c.text : c.border, width: k === index ? 16 : 6 }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Web: give each card its own GPU layer so moving it doesn't repaint the page.
  layer: { willChange: 'transform' } as object,
  snapX: { scrollSnapType: 'x mandatory', overscrollBehaviorX: 'contain' } as object,
  snapStart: { scrollSnapAlign: 'start', scrollSnapStop: 'always' } as object,
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot: { height: 6, borderRadius: 3 },
});

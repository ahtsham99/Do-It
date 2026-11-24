import { useState } from 'react';
import { ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import type { Countdown } from '@/store/types';
import { radius, space, useTheme } from '@/theme';

import { CountdownCard } from './CountdownCard';

/**
 * Upcoming countdowns as a stack: the soonest on top, swipe left for the
 * next ones. Cards behind peek out underneath, like an iPhone widget stack.
 */
export function CountdownStack({ items }: { items: Countdown[] }) {
  const { c, paint } = useTheme();
  const [w, setW] = useState(0);
  const [index, setIndex] = useState(0);
  if (items.length === 0) return null;
  if (items.length === 1) return <CountdownCard item={items[0]} hero />;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!w) return;
    const i = Math.round(e.nativeEvent.contentOffset.x / w);
    if (i !== index) setIndex(Math.max(0, Math.min(items.length - 1, i)));
  };
  const behind = items.slice(index + 1, index + 3);

  return (
    <View style={{ gap: space.sm }}>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ paddingBottom: 16 }}>
        {/* The next cards peeking out underneath */}
        {behind.map((x, i) => (
          <View
            key={x.id}
            pointerEvents="none"
            style={[
              styles.ghost,
              {
                bottom: 8 - i * 8,
                left: 12 + i * 12,
                right: 12 + i * 12,
                backgroundColor: paint(x.color, 'fill'),
                opacity: 0.55 - i * 0.2,
                borderColor: c.bg,
              },
            ]}
          />
        ))}
        {w > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            style={{ width: w }}>
            {items.map((x) => (
              <View key={x.id} style={{ width: w }}>
                <CountdownCard item={x} hero flat />
              </View>
            ))}
          </ScrollView>
        )}
      </View>
      <View style={styles.dots} accessibilityLabel={`Countdown ${index + 1} of ${items.length}`}>
        {items.map((x, i) => (
          <View key={x.id} style={[styles.dot, { backgroundColor: i === index ? c.text : c.border, width: i === index ? 16 : 6 }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ghost: { position: 'absolute', top: 16, borderRadius: radius.xl, borderTopWidth: 0 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot: { height: 6, borderRadius: 3 },
});

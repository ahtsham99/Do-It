import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { Countdown } from '@/store/types';
import { space, useTheme } from '@/theme';

import { CountdownCard } from './CountdownCard';

const PEEK = 12;
const SCALE = 0.05;

/**
 * Web version of the countdown stack. The browser's own scroll (with snap)
 * moves the cards, and each card's stack position is written straight to the
 * DOM inside the scroll handler — the same frame as the scroll — so cards
 * that stay put behind the top one don't jitter.
 */
export function CountdownStack({ items }: { items: Countdown[] }) {
  const { c } = useTheme();
  const [w, setW] = useState(0);
  const [index, setIndex] = useState(0);
  const scroller = useRef<HTMLElement | null>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const frame = useRef(0);

  const paint = useCallback(() => {
    const el = scroller.current;
    if (!el || !w) return;
    const x = el.scrollLeft;
    cards.current.forEach((card, k) => {
      if (!card) return;
      const p = x / w - k; // > 0: this card is sliding away; < 0: it waits behind
      if (p >= 0) {
        card.style.transform = 'translate3d(0,0,0)';
        card.style.opacity = '1';
      } else {
        const depth = Math.min(3, -p);
        // Pin it under the top card (cancel the scroll), smaller and lower the further back it is.
        card.style.transform = `translate3d(${p * w}px, ${depth * PEEK}px, 0) scale(${1 - depth * SCALE})`;
        card.style.opacity = String(depth >= 3 ? 0 : 1 - depth * 0.28);
      }
    });
    const i = Math.round(x / w);
    setIndex((prev) => (prev === i ? prev : i));
  }, [w]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => paint(); // scroll events fire once per frame, before paint
    el.addEventListener('scroll', onScroll, { passive: true });
    frame.current = requestAnimationFrame(paint);
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame.current);
    };
  }, [paint, items.length]);

  if (items.length === 0) return null;
  if (items.length === 1) return <CountdownCard item={items[0]} hero />;

  return (
    <View style={{ gap: space.sm }}>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        {w > 0 && (
          <ScrollView
            ref={(r) => {
              const node = (r as unknown as { getScrollableNode?: () => HTMLElement } | null)?.getScrollableNode?.();
              scroller.current = node ?? null;
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[{ width: w }, styles.snapX]}>
            {items.map((item, k) => (
              <View
                key={item.id}
                ref={(r) => {
                  cards.current[k] = r as unknown as HTMLElement | null;
                }}
                style={[{ width: w, paddingBottom: PEEK * 2, position: 'relative', zIndex: items.length - k }, styles.card]}>
                <CountdownCard item={item} hero flat />
              </View>
            ))}
          </ScrollView>
        )}
      </View>
      <View style={styles.dots} accessibilityLabel={`Countdown ${index + 1} of ${items.length}`}>
        {items.map((it, k) => (
          <View key={it.id} style={[styles.dot, { backgroundColor: k === index ? c.text : c.border, width: k === index ? 16 : 6 }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  snapX: { scrollSnapType: 'x mandatory', overscrollBehaviorX: 'contain' } as object,
  card: { scrollSnapAlign: 'start', scrollSnapStop: 'always', willChange: 'transform, opacity', transformOrigin: 'center center' } as object,
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot: { height: 6, borderRadius: 3 },
});

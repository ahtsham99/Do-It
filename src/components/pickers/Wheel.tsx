import { useEffect, useRef, type ComponentRef } from 'react';
import { ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { Press, Text, tap } from '@/components/ui';
import { useTheme } from '@/theme';

export const ROW = 40;
const VISIBLE = 5; // rows shown; the middle one is selected

/**
 * One scrolling wheel column, like the iPhone timer. Scroll or tap a row;
 * it settles on the nearest value.
 */
export function Wheel({ values, value, onChange, unit, width = 110 }: { values: number[]; value: number; onChange: (v: number) => void; unit: string; width?: number }) {
  const { c } = useTheme();
  const ref = useRef<ComponentRef<typeof ScrollView>>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const last = useRef(value);
  const idx = Math.max(0, values.indexOf(value));

  // Start on the current value.
  useEffect(() => {
    const t = setTimeout(() => ref.current?.scrollTo({ y: idx * ROW, animated: false }), 0);
    return () => clearTimeout(t);
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (i: number, animate = true) => {
    const k = Math.max(0, Math.min(values.length - 1, i));
    ref.current?.scrollTo({ y: k * ROW, animated: animate });
    if (values[k] !== last.current) {
      last.current = values[k];
      tap('light');
      onChange(values[k]);
    }
  };

  // Settle on the nearest row once scrolling stops (works on web and native).
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => pick(Math.round(y / ROW)), 110);
  };

  return (
    <View style={{ width, height: ROW * VISIBLE }}>
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        snapToInterval={ROW}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: ROW * Math.floor(VISIBLE / 2) }}>
        {values.map((v, i) => {
          const sel = i === idx;
          return (
            <Press key={v} haptic={false} onPress={() => pick(i)} style={styles.row} accessibilityLabel={`${v} ${unit}`}>
              <Text style={{ fontSize: sel ? 24 : 20, fontWeight: sel ? '600' : '400', fontVariant: ['tabular-nums'] }} color={sel ? c.text : c.textFaint}>
                {v}
              </Text>
              {sel && (
                <Text style={{ fontSize: 17, marginLeft: 6 }} color={c.text}>
                  {unit}
                </Text>
              )}
            </Press>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { height: ROW, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});

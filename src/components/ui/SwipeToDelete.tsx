import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, PanResponder, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, useTheme } from '@/theme';

import { Icon } from './Icon';
import { Press, tap } from './Pressable';
import { t } from '@/lib/i18n';

const ACTION_W = 112;
const GAP = 10;
/** iOS system red. */
const SYSTEM_RED = { light: '#FF3B30', dark: '#FF453A' };
const FULL_SWIPE = 200;

// Only one row stays open at a time.
let closeOpen: (() => void) | null = null;

/**
 * Swipe left to reveal Delete; swipe far left to delete straight away.
 * Vertical scrolling and taps on the content keep working.
 */
export function SwipeToDelete({
  children,
  onDelete,
  borderRadius = radius.xl,
  style,
  label = t('Delete'),
}: {
  children: ReactNode;
  onDelete: () => void;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  label?: string;
}) {
  const { dark } = useTheme();
  const [x] = useState(() => new Animated.Value(0));
  const offset = useRef(0);
  const [open, setOpen] = useState(false);

  const snap = (to: number) => {
    offset.current = to;
    setOpen(to !== 0);
    Animated.spring(x, { toValue: to, useNativeDriver: true, friction: 9, tension: 80 }).start();
    if (to !== 0) {
      if (closeOpen && closeOpen !== close) closeOpen();
      closeOpen = close;
    } else if (closeOpen === close) closeOpen = null;
  };
  const close = () => snap(0);

  const remove = () => {
    tap('medium');
    Animated.timing(x, { toValue: -600, duration: 180, useNativeDriver: true }).start(() => {
      x.setValue(0);
      offset.current = 0;
      setOpen(false);
      onDelete();
    });
  };

  // The gesture handler is created once; it reads the latest snap/remove from here
  // so it never acts on an out-of-date item.
  const latest = useRef({ snap, remove });
  useEffect(() => {
    latest.current = { snap, remove };
  });

  // Refs are only read inside the gesture callbacks below, never during render.
  // eslint-disable-next-line react-hooks/refs
  const [responder] = useState(() =>
    PanResponder.create({
      // Claim only clear horizontal drags, so vertical scroll and taps still work.
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, g) => {
        const next = Math.min(0, offset.current + g.dx);
        x.setValue(next < -FULL_SWIPE ? -FULL_SWIPE + (next + FULL_SWIPE) * 0.3 : next);
      },
      onPanResponderRelease: (_, g) => {
        const end = offset.current + g.dx;
        if (end < -FULL_SWIPE || (g.vx < -1.6 && end < -ACTION_W)) latest.current.remove();
        else if (end < -ACTION_W / 2 || g.vx < -0.6) latest.current.snap(-ACTION_W);
        else latest.current.snap(0);
      },
      onPanResponderTerminate: () => latest.current.snap(offset.current),
    }),
  );

  // The red pill sits apart from the row and grows in as you swipe.
  const actionOpacity = x.interpolate({ inputRange: [-50, -12, 0], outputRange: [1, 0, 0], extrapolate: 'clamp' });
  const actionScale = x.interpolate({ inputRange: [-ACTION_W, -20, 0], outputRange: [1, 0.6, 0.6], extrapolate: 'clamp' });

  return (
    <View style={style}>
      <Animated.View pointerEvents={open ? 'box-none' : 'none'} style={[styles.under, { opacity: actionOpacity, transform: [{ scale: actionScale }] }]}>
        <Press
          onPress={remove}
          accessibilityRole="button"
          accessibilityLabel={label}
          style={[styles.action, { backgroundColor: dark ? SYSTEM_RED.dark : SYSTEM_RED.light, borderRadius: 999 }]}>
          <Icon name="trash" size={22} color="#fff" />
        </Press>
      </Animated.View>
      <Animated.View {...responder.panHandlers} style={{ transform: [{ translateX: x }] }}>
        {children}
        {/* While open, a tap on the content closes the row instead of opening it. */}
        {open && <Press haptic={false} onPress={close} style={StyleSheet.absoluteFill} accessibilityLabel={t('Close')} />}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  under: { position: 'absolute', top: 0, bottom: 0, right: 0, width: ACTION_W - GAP, alignItems: 'flex-end', justifyContent: 'center', transformOrigin: 'right' },
  action: { width: ACTION_W - GAP, height: '100%', maxHeight: 64, alignItems: 'center', justifyContent: 'center' },
});

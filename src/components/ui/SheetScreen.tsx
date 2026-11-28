import { router } from 'expo-router';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, KeyboardAvoidingView, PanResponder, Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, space, useTheme } from '@/theme';
import { t } from '@/lib/i18n';

const SheetClose = createContext<(() => void) | null>(null);

/** Inside a SheetScreen: close with the slide-down animation. */
export function useSheetClose() {
  return useContext(SheetClose);
}

const leave = () => (router.canGoBack() ? router.back() : router.replace('/'));

/**
 * A screen shown as a sheet that slides up half-way over the page behind it.
 * Drag the top up for the full height; drag it down (or tap outside, or
 * Cancel) to close.
 * The route needs `presentation: 'transparentModal'` (see app/_layout).
 */
/** How tall the top band is where a vertical swipe moves the sheet (handle + header). */
const GRAB_BAND = 84;

export function SheetScreen({ children }: { children: ReactNode }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  // The space actually available (smaller while the keyboard is up).
  const [avail, setAvail] = useState(height);
  const full = Math.max(200, avail - insets.top - 10);
  // Opens half-way up, like the reminder sheet; drag the top up for the full height.
  const mid = Math.min(full, Math.round(height * 0.62));
  const [y] = useState(() => new Animated.Value(height)); // slide (native driver)
  const [h] = useState(() => new Animated.Value(mid)); // size (JS driver)
  const closing = useRef(false);
  const size = useRef(mid);

  useEffect(() => {
    Animated.spring(y, { toValue: 0, useNativeDriver: true, damping: 24, stiffness: 240, mass: 0.9 }).start();
  }, [y]);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    Animated.timing(y, { toValue: height, duration: 220, useNativeDriver: true }).start(() => leave());
  };
  const snap = (to: number) => {
    size.current = to;
    Animated.spring(h, { toValue: to, useNativeDriver: false, damping: 26, stiffness: 260 }).start();
    Animated.spring(y, { toValue: 0, useNativeDriver: true, damping: 26, stiffness: 260 }).start();
  };
  // Keep the sheet inside the available space when it changes (keyboard, rotation).
  useEffect(() => {
    const target = size.current > Math.min(full, mid) + 1 ? full : mid;
    size.current = target;
    h.setValue(target);
  }, [full, mid, h]);

  const latest = useRef({ close, snap, full, mid, height: avail });
  useEffect(() => {
    latest.current = { close, snap, full, mid, height: avail };
  });

  // Refs are only read inside the gesture callbacks, never during render.
  // eslint-disable-next-line react-hooks/refs
  const [drag] = useState(() =>
    PanResponder.create({
      // Only vertical drags that start on the top band of the sheet, so the form below still scrolls.
      onMoveShouldSetPanResponderCapture: (_, g) => {
        const { height: H } = latest.current;
        const top = H - size.current;
        // (y0 isn't set until the gesture is granted, so work out where it started.)
        const startY = g.moveY - g.dy;
        return startY >= top - 10 && startY <= top + GRAB_BAND && Math.abs(g.dy) > 6 && Math.abs(g.dy) > Math.abs(g.dx);
      },
      onPanResponderMove: (_, g) => {
        const { full: F, mid: M } = latest.current;
        const start = size.current;
        if (g.dy < 0) h.setValue(Math.min(F, start - g.dy));
        else if (start > M) h.setValue(Math.max(M, start - g.dy));
        else y.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        const { full: F, mid: M, snap: S, close: C } = latest.current;
        const start = size.current;
        if (start > M + 1) S(g.dy > 80 || g.vy > 0.8 ? M : F);
        else if (g.dy < -50 || g.vy < -0.8) S(F);
        else if (g.dy > 110 || g.vy > 0.8) C();
        else S(M);
      },
      onPanResponderTerminate: () => latest.current.snap(size.current),
    }),
  );

  const dim = y.interpolate({ inputRange: [0, height], outputRange: [1, 0], extrapolate: 'clamp' });

  return (
    <SheetClose.Provider value={close}>
      <View style={styles.root} onLayout={(e) => setAvail(e.nativeEvent.layout.height)}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: c.overlay, opacity: dim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel={t('Close')} />
        </Animated.View>
        <KeyboardAvoidingView style={styles.place} behavior={Platform.OS === 'ios' ? 'padding' : undefined} pointerEvents="box-none">
          <Animated.View {...drag.panHandlers} style={[styles.slide, { transform: [{ translateY: y }] }]}>
            <Animated.View style={[styles.sheet, { backgroundColor: c.bg, height: h, paddingBottom: insets.bottom, boxShadow: `0px -8px 30px ${c.shadow}` }]}>
              <View style={styles.handleArea}>
                <View style={[styles.grabber, { backgroundColor: c.border }]} />
              </View>
              {children}
            </Animated.View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </SheetClose.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  place: { flex: 1, justifyContent: 'flex-end' },
  slide: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  sheet: { width: '100%', borderTopLeftRadius: radius.xl + 4, borderTopRightRadius: radius.xl + 4, overflow: 'hidden' },
  handleArea: { paddingTop: space.sm, paddingBottom: 2, alignItems: 'center' },
  grabber: { width: 40, height: 5, borderRadius: 3 },
});

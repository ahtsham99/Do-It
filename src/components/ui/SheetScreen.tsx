import { router } from 'expo-router';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, KeyboardAvoidingView, PanResponder, Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, space, useTheme } from '@/theme';

const SheetClose = createContext<(() => void) | null>(null);

/** Inside a SheetScreen: close with the slide-down animation. */
export function useSheetClose() {
  return useContext(SheetClose);
}

const leave = () => (router.canGoBack() ? router.back() : router.replace('/'));

/**
 * A screen shown as a sheet that slides up from the bottom over the page
 * behind it. Tap outside, drag the handle down, or Cancel to close.
 * The route needs `presentation: 'transparentModal'` (see app/_layout).
 */
export function SheetScreen({ children }: { children: ReactNode }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [y] = useState(() => new Animated.Value(height));
  const closing = useRef(false);

  useEffect(() => {
    Animated.spring(y, { toValue: 0, useNativeDriver: true, damping: 24, stiffness: 240, mass: 0.9 }).start();
  }, [y]);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    Animated.timing(y, { toValue: height, duration: 220, useNativeDriver: true }).start(() => leave());
  };
  const latest = useRef(close);
  useEffect(() => {
    latest.current = close;
  });

  // Refs are only read inside the gesture callbacks, never during render.
  // eslint-disable-next-line react-hooks/refs
  const [drag] = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => y.setValue(Math.max(0, g.dy)),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120 || g.vy > 0.8) latest.current();
        else Animated.spring(y, { toValue: 0, useNativeDriver: true, damping: 24, stiffness: 240 }).start();
      },
    }),
  );

  const dim = y.interpolate({ inputRange: [0, height], outputRange: [1, 0], extrapolate: 'clamp' });

  return (
    <SheetClose.Provider value={close}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: c.overlay, opacity: dim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Close" />
        </Animated.View>
        <KeyboardAvoidingView style={styles.place} behavior={Platform.OS === 'ios' ? 'padding' : undefined} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.sheet,
              { backgroundColor: c.bg, maxHeight: height - insets.top - 10, paddingBottom: insets.bottom, transform: [{ translateY: y }], boxShadow: `0px -8px 30px ${c.shadow}` },
            ]}>
            <View {...drag.panHandlers} style={styles.handleArea}>
              <View style={[styles.grabber, { backgroundColor: c.border }]} />
            </View>
            {children}
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </SheetClose.Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  place: { flex: 1, justifyContent: 'flex-end' },
  sheet: { width: '100%', maxWidth: 640, alignSelf: 'center', borderTopLeftRadius: radius.xl + 4, borderTopRightRadius: radius.xl + 4, overflow: 'hidden' },
  handleArea: { paddingTop: space.sm, paddingBottom: 2, alignItems: 'center' },
  grabber: { width: 40, height: 5, borderRadius: 3 },
});

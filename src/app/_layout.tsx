import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DialogHost, ToastHost } from '@/components/ui';
import { FocusMode } from '@/features/focus/FocusMode';
import { TimerWatcher } from '@/features/focus/TimerWatcher';
import { NotificationSync } from '@/features/nudges/NotificationSync';
import { start as fitViewport } from '@/lib/viewport';
import { hydrate, useStore } from '@/store/store';
import { AppThemeProvider, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const hydrated = useStore((s) => s.hydrated);

  useEffect(() => {
    hydrate();
    fitViewport();
  }, []);

  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <Gate hydrated={hydrated} />
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}

/** Waits for saved data and the chosen fonts, then shows the app. */
function Gate({ hydrated }: { hydrated: boolean }) {
  const { fontsReady } = useTheme();
  const ready = hydrated && fontsReady;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);
  return ready ? <Navigator /> : <Blank />;
}

function Blank() {
  const { c } = useTheme();
  return <View style={{ flex: 1, backgroundColor: c.bg }} />;
}

/** Editors slide up as sheets over the page behind (SheetScreen animates them). */
const SHEET = { presentation: 'transparentModal', animation: 'none', contentStyle: { backgroundColor: 'transparent' } } as const;

function Navigator() {
  const { dark, c } = useTheme();
  const navTheme = dark ? DarkTheme : DefaultTheme;
  return (
    <ThemeProvider
      value={{
        ...navTheme,
        colors: { ...navTheme.colors, background: c.bg, card: c.surface, text: c.text, border: c.border, primary: c.accent },
      }}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="task" options={SHEET} />
        <Stack.Screen name="reminder" options={SHEET} />
        <Stack.Screen name="countdown" options={SHEET} />
        <Stack.Screen name="habit" options={SHEET} />
        <Stack.Screen name="goal" options={SHEET} />
        <Stack.Screen name="suggestions" options={{ presentation: 'modal' }} />
        <Stack.Screen name="streaks" options={{ presentation: 'modal' }} />
        <Stack.Screen name="history" options={{ presentation: 'modal' }} />
        <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
        <Stack.Screen name="privacy-policy" options={{ presentation: 'modal' }} />
        <Stack.Screen name="fonts" options={{ presentation: 'modal' }} />
        <Stack.Screen name="color" options={{ presentation: 'modal' }} />
        <Stack.Screen name="icons" options={{ presentation: 'modal' }} />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      </Stack>
      <NotificationSync />
      <TimerWatcher />
      <FocusMode />
      <ToastHost />
      <DialogHost />
    </ThemeProvider>
  );
}

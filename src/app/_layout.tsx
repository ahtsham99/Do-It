import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DialogHost, ToastHost } from '@/components/ui';
import { TimerWatcher } from '@/features/focus/TimerWatcher';
import { NotificationSync } from '@/features/nudges/NotificationSync';
import { hydrate, useStore } from '@/store/store';
import { AppThemeProvider, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const hydrated = useStore((s) => s.hydrated);

  useEffect(() => {
    hydrate();
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
        <Stack.Screen name="task" options={{ presentation: 'modal' }} />
        <Stack.Screen name="plan" options={{ presentation: 'modal' }} />
        <Stack.Screen name="countdown" options={{ presentation: 'modal' }} />
        <Stack.Screen name="habit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="suggestions" options={{ presentation: 'modal' }} />
        <Stack.Screen name="streaks" options={{ presentation: 'modal' }} />
        <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
        <Stack.Screen name="fonts" options={{ presentation: 'modal' }} />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      </Stack>
      <NotificationSync />
      <TimerWatcher />
      <ToastHost />
      <DialogHost />
    </ThemeProvider>
  );
}

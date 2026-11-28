import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DialogHost, ToastHost, showDialog } from '@/components/ui';
import { FocusMode } from '@/features/focus/FocusMode';
import { TimerWatcher } from '@/features/focus/TimerWatcher';
import { NotificationSync } from '@/features/nudges/NotificationSync';
import { applyLanguage, resolveLanguage, t } from '@/lib/i18n';
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
  // Language: applied before anything renders; the app redraws when it changes.
  const setting = useStore((s) => s.settings.language);
  const lang = useMemo(() => {
    const code = resolveLanguage(setting);
    return { code, restart: applyLanguage(code) };
  }, [setting]);
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);
  useEffect(() => {
    // The native app flips to right-to-left (or back) after a restart.
    if (lang.restart) showDialog({ title: t('Restart Do It'), message: t('Close and reopen the app to finish switching the layout direction.'), actions: [{ label: t('OK'), onPress: () => {} }] });
  }, [lang]);
  return ready ? <Navigator key={lang.code} /> : <Blank />;
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

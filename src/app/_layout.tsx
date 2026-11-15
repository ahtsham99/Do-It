import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DialogHost, ToastHost } from '@/components/ui';
import { NotificationSync } from '@/features/nudges/NotificationSync';
import { hydrate, useStore } from '@/store/store';
import { AppThemeProvider, useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const hydrated = useStore((s) => s.hydrated);

  useEffect(() => {
    hydrate().finally(() => SplashScreen.hideAsync().catch(() => {}));
  }, []);

  return (
    <SafeAreaProvider>
      <AppThemeProvider>{hydrated ? <Navigator /> : <Blank />}</AppThemeProvider>
    </SafeAreaProvider>
  );
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
      </Stack>
      <NotificationSync />
      <ToastHost />
      <DialogHost />
    </ThemeProvider>
  );
}

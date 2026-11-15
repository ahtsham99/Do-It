import { InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif';
import { useFonts } from 'expo-font';
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

  const [fontsLoaded, fontError] = useFonts({ InstrumentSerif_400Regular });
  const ready = hydrated && (fontsLoaded || !!fontError);

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  return (
    <SafeAreaProvider>
      <AppThemeProvider>{ready ? <Navigator /> : <Blank />}</AppThemeProvider>
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
        <Stack.Screen name="habit" options={{ presentation: 'modal' }} />
        <Stack.Screen name="suggestions" options={{ presentation: 'modal' }} />
        <Stack.Screen name="streaks" options={{ presentation: 'modal' }} />
        <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      </Stack>
      <NotificationSync />
      <ToastHost />
      <DialogHost />
    </ThemeProvider>
  );
}

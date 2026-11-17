import { InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DialogHost, ToastHost } from '@/components/ui';
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

const modal = { presentation: 'modal' } as const;

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
        <Stack.Screen name="index" />
        <Stack.Screen name="setup" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(barber)" />
        <Stack.Screen name="b/[slug]" />
        <Stack.Screen name="a/[token]" />
        <Stack.Screen name="booking/[id]" options={modal} />
        <Stack.Screen name="client/[id]" options={modal} />
        <Stack.Screen name="walk-in" options={modal} />
        <Stack.Screen name="block" options={modal} />
        <Stack.Screen name="messages" options={modal} />
        <Stack.Screen name="poster" options={modal} />
        <Stack.Screen name="edit/[section]" options={modal} />
      </Stack>
      <ToastHost />
      <DialogHost />
    </ThemeProvider>
  );
}

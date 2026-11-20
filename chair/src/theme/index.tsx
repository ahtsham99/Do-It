import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { useStore } from '@/store/store';

import { dark, light, type ThemeColors } from './colors';

export type { ThemeColors } from './colors';

/** Loaded in the root layout (Instrument Serif). */
export const SERIF = 'InstrumentSerif_400Regular';

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 } as const;
export const font = {
  display: { fontFamily: SERIF, fontSize: 42, fontWeight: '400' as const, letterSpacing: -0.6, lineHeight: 46 },
  title: { fontFamily: SERIF, fontSize: 30, fontWeight: '400' as const, letterSpacing: -0.3, lineHeight: 34 },
  heading: { fontSize: 18, fontWeight: '500' as const, letterSpacing: -0.1 },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodyStrong: { fontSize: 16, fontWeight: '500' as const },
  small: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '500' as const, letterSpacing: 2.2 },
};

/** Soft card shadow, same on web and native. */
export function cardShadow(c: ThemeColors) {
  return { boxShadow: `0px 6px 22px ${c.shadow}` } as const;
}

/** Height reserved at the bottom of screens for the floating tab bar. */
export const TAB_BAR_SPACE = 104;

interface Theme {
  dark: boolean;
  c: ThemeColors;
}

const ThemeCtx = createContext<Theme>({ dark: false, c: light });

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const pref = useStore((s) => s.settings.theme);
  const isDark = pref === 'system' ? system === 'dark' : pref === 'dark';
  const value = useMemo(() => ({ dark: isDark, c: isDark ? dark : light }), [isDark]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { useStore } from '@/store/store';

import { dark, light, type ThemeColors } from './colors';

export { SWATCHES, palette } from './colors';
export type { ThemeColors } from './colors';

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 18, xl: 26, pill: 999 } as const;
export const font = {
  display: { fontSize: 34, fontWeight: '800' as const, letterSpacing: -1 },
  title: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.5 },
  heading: { fontSize: 18, fontWeight: '700' as const, letterSpacing: -0.2 },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodyStrong: { fontSize: 16, fontWeight: '600' as const },
  small: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.6 },
};

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

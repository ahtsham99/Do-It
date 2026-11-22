import * as Font from 'expo-font';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { useStore } from '@/store/store';

import { darkFor, light, vivid, type NightColor, type ThemeColors } from './colors';
import { displayFont, faceForWeight, facesFor, textFont, type FontChoice } from './fonts';

export { DEFAULT_ITEM_COLOR, NIGHT_COLORS, SWATCHES, hexAlpha } from './colors';
export type { NightColor, ThemeColors } from './colors';

/**
 * Font tokens. Put `fontFamily: SERIF` (headings) or `fontFamily: LOGO` in a
 * Text style and the Text component swaps in the user's chosen font.
 */
export const SERIF = '$display';
export const LOGO = '$logo';

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 } as const;
export const font = {
  display: { fontFamily: SERIF, fontSize: 42, fontWeight: '400' as const, letterSpacing: -0.6, lineHeight: 48 },
  title: { fontFamily: SERIF, fontSize: 30, fontWeight: '400' as const, letterSpacing: -0.3, lineHeight: 36 },
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

export interface ResolvedFonts {
  /** Family for headings, or undefined for the system font. */
  display?: string;
  logo?: string;
  /** Family for body text at a given weight, or undefined for the system font. */
  text: (weight: number) => string | undefined;
}

interface Theme {
  dark: boolean;
  c: ThemeColors;
  /** An item colour as it should appear now (brighter at night). */
  paint: (color: string, mode?: 'line' | 'fill') => string;
  fonts: ResolvedFonts;
  fontsReady: boolean;
}

const resolve = (choice: FontChoice): ResolvedFonts => {
  const t = textFont(choice.text);
  return {
    display: displayFont(choice.display).face?.family,
    logo: displayFont(choice.logo).face?.family,
    text: (w) => faceForWeight(t, w)?.family,
  };
};

const SYSTEM: ResolvedFonts = { text: () => undefined };
const ThemeCtx = createContext<Theme>({ dark: false, c: light, paint: (x) => x, fonts: SYSTEM, fontsReady: false });

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const pref = useStore((s) => s.settings.theme);
  const hydrated = useStore((s) => s.hydrated);
  const display = useStore((s) => s.settings.displayFont);
  const text = useStore((s) => s.settings.textFont);
  const logo = useStore((s) => s.settings.logoFont);
  const night = useStore((s) => s.settings.nightColor);
  // Fonts switch only once the new files have loaded, so text never flashes.
  const [applied, setApplied] = useState<FontChoice | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    const choice = { display, text, logo };
    Font.loadAsync(facesFor(choice))
      .catch((e) => console.warn('[fonts] failed to load', e))
      .finally(() => !cancelled && setApplied(choice));
    return () => {
      cancelled = true;
    };
  }, [hydrated, display, text, logo]);

  const isDark = pref === 'system' ? system === 'dark' : pref === 'dark';
  const value = useMemo(
    () => {
      const c = isDark ? darkFor(night as NightColor) : light;
      const paint = isDark ? (color: string, mode: 'line' | 'fill' = 'line') => vivid(color, mode, c.accent) : (color: string) => color;
      return { dark: isDark, c, paint, fonts: applied ? resolve(applied) : SYSTEM, fontsReady: !!applied };
    },
    [isDark, applied, night],
  );
  // Web: paint the page behind the app (e.g. under Safari's bars) the same colour,
  // so there's never a differently-coloured band at the top or bottom.
  const bg = value.c.bg;
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg;
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', bg));
  }, [bg]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}

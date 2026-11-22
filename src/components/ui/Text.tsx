import { Text as RNText, StyleSheet, type TextProps, type TextStyle } from 'react-native';

import { LOGO, SERIF, font, useTheme, type ResolvedFonts } from '@/theme';

type Variant = keyof typeof font;
type Tone = 'default' | 'muted' | 'faint' | 'accent' | 'danger' | 'success' | 'inverse';

/** Swap font tokens for the user's chosen fonts. */
export function resolveFont(style: TextStyle, fonts: ResolvedFonts): TextStyle {
  const weight = Number(style.fontWeight ?? 400) || 400;
  let family: string | undefined;
  if (style.fontFamily === SERIF) family = fonts.display;
  else if (style.fontFamily === LOGO) family = fonts.logo;
  else if (style.fontFamily) return style; // an explicit family wins
  else family = fonts.text(weight);

  if (family) {
    // Each face already has its weight built in; asking for bold again would fake-bold it.
    return { ...style, fontFamily: family, fontWeight: 'normal' };
  }
  // System font: headings that wanted a display serif get a bolder system weight instead.
  const isToken = style.fontFamily === SERIF || style.fontFamily === LOGO;
  return { ...style, fontFamily: undefined, fontWeight: isToken ? '600' : style.fontWeight };
}

export function Text({
  variant = 'body',
  tone = 'default',
  color,
  style,
  ...rest
}: TextProps & { variant?: Variant; tone?: Tone; color?: string }) {
  const { c, fonts } = useTheme();
  const toneColor = {
    default: c.text,
    muted: c.textMuted,
    faint: c.textFaint,
    accent: c.accent,
    danger: c.danger,
    success: c.success,
    inverse: c.accentText,
  }[tone];
  const flat = StyleSheet.flatten([font[variant], { color: color ?? toneColor }, style]) as TextStyle;
  return <RNText {...rest} style={resolveFont(flat, fonts)} />;
}

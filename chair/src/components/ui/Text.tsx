import { Text as RNText, type TextProps } from 'react-native';

import { font, useTheme } from '@/theme';

type Variant = keyof typeof font;
type Tone = 'default' | 'muted' | 'faint' | 'accent' | 'danger' | 'success' | 'inverse';

export function Text({
  variant = 'body',
  tone = 'default',
  color,
  style,
  ...rest
}: TextProps & { variant?: Variant; tone?: Tone; color?: string }) {
  const { c } = useTheme();
  const toneColor = {
    default: c.text,
    muted: c.textMuted,
    faint: c.textFaint,
    accent: c.accent,
    danger: c.danger,
    success: c.success,
    inverse: c.accentText,
  }[tone];
  return <RNText {...rest} style={[font[variant], { color: color ?? toneColor }, style]} />;
}

import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import { isRTL } from '@/lib/i18n';
import { useTheme } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

// Icons that point "forward" or "back" mirror in right-to-left languages.
const DIRECTIONAL = /^(chevron|arrow)-(back|forward)|^(caret|play)-(back|forward)/;

export function Icon({ name, size = 22, color }: { name: IconName; size?: number; color?: string }) {
  const { c } = useTheme();
  const flip = isRTL() && DIRECTIONAL.test(name);
  return <Ionicons name={name} size={size} color={color ?? c.text} style={flip ? { transform: [{ scaleX: -1 }] } : undefined} />;
}

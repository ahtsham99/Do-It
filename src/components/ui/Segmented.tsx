import { StyleSheet, View } from 'react-native';

import { cardShadow, radius, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Press } from './Pressable';
import { Text } from './Text';
import { t } from '@/lib/i18n';

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  tone = 'surface',
}: {
  options: { value: T; label: string; icon?: IconName; badge?: number }[];
  value: T;
  onChange: (v: T) => void;
  /** surface = white active pill · accent = green · ink = near-black */
  tone?: 'surface' | 'accent' | 'ink';
}) {
  const { c } = useTheme();
  const activeBg = { surface: c.surface, accent: c.accent, ink: c.ink }[tone];
  const activeFg = { surface: c.text, accent: c.accentText, ink: c.inkText }[tone];
  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: tone === 'surface' ? c.surfaceAlt : c.surface, borderColor: c.border },
        tone !== 'surface' && cardShadow(c),
      ]}>
      {options.map((o) => {
        const active = o.value === value;
        const fg = active ? activeFg : c.textMuted;
        return (
          <Press
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.item, active && { backgroundColor: activeBg }, active && tone === 'surface' && cardShadow(c)]}>
            {o.icon && <Icon name={o.icon} size={16} color={fg} />}
            <Text variant="small" color={fg} style={{ fontWeight: '500' }} numberOfLines={1}>
              {t(o.label)}
            </Text>
            {o.badge != null && (
              <Text variant="small" color={fg} style={{ opacity: 0.6 }}>
                {o.badge}
              </Text>
            )}
          </Press>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', borderRadius: radius.pill, padding: 4, borderWidth: 1 },
  item: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
});

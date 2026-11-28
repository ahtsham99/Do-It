import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { cardShadow, radius, space, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Press } from './Pressable';
import { Text } from './Text';
import { t } from '@/lib/i18n';

type Kind = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  label,
  onPress,
  kind = 'primary',
  icon,
  disabled,
  loading,
  small,
  style,
}: {
  label: string;
  onPress?: () => void;
  kind?: Kind;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  const bg = { primary: c.accent, secondary: c.surface, ghost: 'transparent', danger: c.dangerSoft }[kind];
  const fg = { primary: c.accentText, secondary: c.text, ghost: c.textMuted, danger: c.danger }[kind];
  return (
    <Press
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={[
        styles.base,
        small && styles.small,
        { backgroundColor: bg, opacity: disabled ? 0.4 : 1 },
        kind === 'secondary' && { borderWidth: 1, borderColor: c.border, ...cardShadow(c) },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon && <Icon name={icon} size={small ? 16 : 19} color={fg} />}
          <Text variant={small ? 'small' : 'bodyStrong'} color={fg} style={{ fontWeight: '500' }}>
            {t(label)}
          </Text>
        </View>
      )}
    </Press>
  );
}

/** Round icon button (the "+" in screen headers, chevrons, etc.). */
export function IconButton({
  icon,
  onPress,
  size = 22,
  color,
  bg,
  label,
  diameter = 46,
}: {
  icon: IconName;
  onPress?: () => void;
  size?: number;
  color?: string;
  bg?: string;
  label: string;
  diameter?: number;
}) {
  const { c } = useTheme();
  return (
    <Press
      onPress={onPress}
      accessibilityLabel={t(label)}
      accessibilityRole="button"
      hitSlop={8}
      style={[
        styles.icon,
        {
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          backgroundColor: bg ?? c.surface,
          borderColor: c.border,
          ...cardShadow(c),
        },
      ]}>
      <Icon name={icon} size={size} color={color ?? c.text} />
    </Press>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    paddingHorizontal: space.xl,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: { minHeight: 38, paddingHorizontal: space.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  icon: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
});

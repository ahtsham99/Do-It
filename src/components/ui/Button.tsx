import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { radius, space, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Press } from './Pressable';
import { Text } from './Text';

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
  const bg = { primary: c.text, secondary: c.surfaceAlt, ghost: 'transparent', danger: c.dangerSoft }[kind];
  const fg = { primary: c.bg, secondary: c.text, ghost: c.text, danger: c.danger }[kind];
  return (
    <Press
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={[
        styles.base,
        small && styles.small,
        { backgroundColor: bg, opacity: disabled ? 0.4 : 1 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon && <Icon name={icon} size={small ? 16 : 19} color={fg} />}
          <Text variant={small ? 'small' : 'bodyStrong'} color={fg} style={small && { fontWeight: '600' }}>
            {label}
          </Text>
        </View>
      )}
    </Press>
  );
}

export function IconButton({
  icon,
  onPress,
  size = 22,
  color,
  bg,
  label,
}: {
  icon: IconName;
  onPress?: () => void;
  size?: number;
  color?: string;
  bg?: string;
  label: string;
}) {
  const { c } = useTheme();
  return (
    <Press
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={8}
      style={[styles.icon, { backgroundColor: bg ?? c.surfaceAlt }]}>
      <Icon name={icon} size={size} color={color ?? c.text} />
    </Press>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: space.xl,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: { minHeight: 36, paddingHorizontal: space.lg, borderRadius: radius.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});

import { StyleSheet } from 'react-native';

import { radius, space, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Press } from './Pressable';
import { Text } from './Text';

export function Chip({
  label,
  selected,
  onPress,
  icon,
  color,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  color?: string;
}) {
  const { c } = useTheme();
  const active = color ?? c.text;
  return (
    <Press
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? active : c.surface,
          borderColor: selected ? active : c.border,
        },
      ]}>
      {icon && <Icon name={icon} size={15} color={selected ? c.bg : c.textMuted} />}
      <Text variant="small" color={selected ? c.bg : c.text} style={{ fontWeight: '600' }}>
        {label}
      </Text>
    </Press>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.md + 2,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});

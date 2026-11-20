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
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
}) {
  const { c } = useTheme();
  return (
    <Press
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.chip,
        { backgroundColor: selected ? c.accent : c.surface, borderColor: selected ? c.accent : c.border },
      ]}>
      {icon && <Icon name={icon} size={15} color={selected ? c.accentText : c.textMuted} />}
      <Text variant="small" color={selected ? c.accentText : c.text} style={{ fontWeight: '500' }}>
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
    paddingHorizontal: space.lg,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});

import { StyleSheet } from 'react-native';

import { useTheme } from '@/theme';

import { Icon } from './Icon';
import { Press, tap } from './Pressable';

export function Checkbox({
  checked,
  onToggle,
  color,
  size = 26,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  color?: string;
  size?: number;
  label?: string;
}) {
  const { c } = useTheme();
  const tint = color ?? c.accent;
  return (
    <Press
      haptic={false}
      onPress={() => {
        tap(checked ? 'light' : 'success');
        onToggle();
      }}
      hitSlop={10}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: checked ? tint : c.textFaint,
          backgroundColor: checked ? tint : 'transparent',
        },
      ]}>
      {checked && <Icon name="checkmark" size={size * 0.65} color="#fff" />}
    </Press>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});

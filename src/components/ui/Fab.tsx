import { StyleSheet } from 'react-native';

import { useTabBarBottom } from '@/hooks/useTopInset';
import { TAB_BAR_SPACE, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Press } from './Pressable';

/** Round add button, bottom right above the tab bar. `lift` raises it over other bottom controls. */
export function Fab({ onPress, icon = 'add', label, lift = 0 }: { onPress: () => void; icon?: IconName; label: string; lift?: number }) {
  const { c } = useTheme();
  const tabBottom = useTabBarBottom();
  return (
    <Press
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
      style={[
        styles.fab,
        { backgroundColor: c.accent, bottom: TAB_BAR_SPACE + tabBottom - 4 + lift, boxShadow: `0px 8px 20px ${c.shadow}` },
      ]}>
      <Icon name={icon} size={28} color={c.accentText} />
    </Press>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

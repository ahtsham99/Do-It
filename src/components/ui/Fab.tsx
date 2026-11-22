import { StyleSheet } from 'react-native';

import { useTabBarBottom } from '@/hooks/useTopInset';
import { TAB_BAR_SPACE, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Press } from './Pressable';

export function Fab({ onPress, icon = 'add', label }: { onPress: () => void; icon?: IconName; label: string }) {
  const { c } = useTheme();
  const tabBottom = useTabBarBottom();
  return (
    <Press
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
      style={[
        styles.fab,
        { backgroundColor: c.accent, bottom: TAB_BAR_SPACE + tabBottom - 4, boxShadow: `0px 8px 20px ${c.shadow}` },
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

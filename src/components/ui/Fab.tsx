import { StyleSheet } from 'react-native';

import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Press } from './Pressable';

export function Fab({ onPress, icon = 'add', label }: { onPress: () => void; icon?: IconName; label: string }) {
  const { c } = useTheme();
  return (
    <Press
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
      style={[styles.fab, { backgroundColor: c.accent, shadowColor: c.accent }]}>
      <Icon name={icon} size={30} color="#fff" />
    </Press>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});

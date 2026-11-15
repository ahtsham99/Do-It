import { StyleSheet, View } from 'react-native';

import { radius, space, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Press } from './Pressable';
import { Text } from './Text';

type Kind = 'danger' | 'warning' | 'accent' | 'success';

/** Big, unmissable nudge banner. */
export function Banner({
  kind = 'accent',
  icon,
  title,
  body,
  action,
  onPress,
  onDismiss,
}: {
  kind?: Kind;
  icon: IconName;
  title: string;
  body?: string;
  action?: string;
  onPress?: () => void;
  onDismiss?: () => void;
}) {
  const { c } = useTheme();
  const map = {
    danger: { bg: c.danger, fg: '#fff' },
    warning: { bg: c.warning, fg: '#fff' },
    accent: { bg: c.accent, fg: '#fff' },
    success: { bg: c.success, fg: '#fff' },
  }[kind];
  return (
    <Press onPress={onPress} disabled={!onPress} style={[styles.wrap, { backgroundColor: map.bg }]}>
      <View style={styles.iconWrap}>
        <Icon name={icon} size={26} color={map.fg} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="heading" color={map.fg}>
          {title}
        </Text>
        {body && (
          <Text variant="small" color={map.fg} style={{ opacity: 0.92 }}>
            {body}
          </Text>
        )}
        {action && (
          <View style={styles.action}>
            <Text variant="small" color={map.bg} style={{ fontWeight: '700' }}>
              {action}
            </Text>
          </View>
        )}
      </View>
      {onDismiss && (
        <Press onPress={onDismiss} hitSlop={12} accessibilityLabel="Dismiss" style={{ padding: 2 }}>
          <Icon name="close" size={20} color={map.fg} />
        </Press>
      )}
    </Press>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: 6,
    marginTop: space.sm,
  },
});

import { StyleSheet, View } from 'react-native';

import { radius, space, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Press } from './Pressable';
import { Text } from './Text';

type Kind = 'danger' | 'warning' | 'accent' | 'success';

/** A quiet nudge: soft tint, one line of encouragement, one clear action. */
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
    danger: { bg: c.dangerSoft, fg: c.danger },
    warning: { bg: c.warningSoft, fg: c.warning },
    accent: { bg: c.accentSoft, fg: c.accent },
    success: { bg: c.successSoft, fg: c.success },
  }[kind];
  return (
    <Press onPress={onPress} disabled={!onPress} style={[styles.wrap, { backgroundColor: map.bg }]}>
      <View style={[styles.iconWrap, { backgroundColor: c.surface }]}>
        <Icon name={icon} size={22} color={map.fg} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text variant="heading">{title}</Text>
        {body && (
          <Text variant="small" tone="muted" style={{ lineHeight: 20 }}>
            {body}
          </Text>
        )}
        {action && (
          <View style={[styles.action, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text variant="small" color={map.fg} style={{ fontWeight: '600' }}>
              {action}
            </Text>
          </View>
        )}
      </View>
      {onDismiss && (
        <Press onPress={onDismiss} hitSlop={14} accessibilityLabel="Dismiss" style={{ padding: 4 }}>
          <Icon name="close" size={20} color={c.textMuted} />
        </Press>
      )}
    </Press>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: space.md, padding: space.xl - 4, borderRadius: radius.xl, alignItems: 'flex-start' },
  iconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  action: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: space.lg,
    minHeight: 40,
    justifyContent: 'center',
    marginTop: space.sm,
  },
});

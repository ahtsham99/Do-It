import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { space, useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Press } from './Pressable';
import { Text } from './Text';
import { t } from '@/lib/i18n';

/** Settings-style row inside a Card. */
export function ListRow({
  icon,
  label,
  detail,
  right,
  onPress,
  last,
  danger,
}: {
  icon?: IconName;
  label: string;
  detail?: string;
  right?: ReactNode;
  onPress?: () => void;
  last?: boolean;
  danger?: boolean;
}) {
  const { c } = useTheme();
  const body = (
    <View style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border }]}>
      {icon && <Icon name={icon} size={20} color={danger ? c.danger : c.textMuted} />}
      <View style={{ flex: 1 }}>
        <Text tone={danger ? 'danger' : 'default'}>{t(label)}</Text>
        {detail && (
          <Text variant="small" tone="muted">
            {typeof detail === 'string' ? t(detail) : detail}
          </Text>
        )}
      </View>
      {right}
      {onPress && !right && <Icon name="chevron-forward" size={18} color={c.textFaint} />}
    </View>
  );
  return onPress ? <Press onPress={onPress}>{body}</Press> : body;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 60, paddingVertical: space.md },
});

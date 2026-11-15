import { View } from 'react-native';

import { radius, space, useTheme } from '@/theme';

import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';

/** Dashed empty-state card with an optional action. */
export function Empty({
  icon,
  title,
  body,
  action,
  onAction,
}: {
  icon: IconName;
  title: string;
  body?: string;
  action?: string;
  onAction?: () => void;
}) {
  const { c } = useTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        paddingVertical: space.xxl + 4,
        paddingHorizontal: space.xl,
        gap: space.sm,
        borderRadius: radius.xl,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: c.border,
      }}>
      <Icon name={icon} size={24} color={c.textFaint} />
      <Text variant="heading" style={{ marginTop: space.sm, textAlign: 'center' }}>
        {title}
      </Text>
      {body && (
        <Text tone="muted" style={{ textAlign: 'center', maxWidth: 290, lineHeight: 23 }}>
          {body}
        </Text>
      )}
      {action && <Button kind="secondary" label={action} onPress={onAction} style={{ marginTop: space.md, minHeight: 46 }} />}
    </View>
  );
}

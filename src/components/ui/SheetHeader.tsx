import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { space, useTheme } from '@/theme';

import { Press } from './Pressable';
import { Text } from './Text';

/** Header for modal editor screens: Cancel · Title · Save. */
export function SheetHeader({
  title,
  onSave,
  saveLabel = 'Save',
  canSave = true,
  cancelLabel = 'Cancel',
}: {
  title: string;
  onSave?: () => void;
  saveLabel?: string;
  canSave?: boolean;
  cancelLabel?: string;
}) {
  const { c } = useTheme();
  return (
    <View style={[styles.wrap, { borderBottomColor: c.border }]}>
      <Press onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} hitSlop={10} style={styles.side}>
        <Text tone="muted">{cancelLabel}</Text>
      </Press>
      <Text variant="bodyStrong">{title}</Text>
      <Press onPress={onSave} disabled={!canSave || !onSave} hitSlop={10} style={[styles.side, { alignItems: 'flex-end' }]}>
        <Text tone="accent" style={{ fontWeight: '600', opacity: canSave ? 1 : 0.35 }}>
          {onSave ? saveLabel : ''}
        </Text>
      </Press>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  side: { minWidth: 64 },
});

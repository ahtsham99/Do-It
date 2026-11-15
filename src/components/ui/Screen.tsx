import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { space, useTheme } from '@/theme';

import { Text } from './Text';

export const MAX_WIDTH = 640;

/**
 * Standard tab screen: large title, optional right action, scrolling body
 * constrained to a readable width on large screens.
 */
export function Screen({
  title,
  subtitle,
  right,
  children,
  scroll = true,
  footer,
  contentStyle,
  ...scrollProps
}: {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  scroll?: boolean;
  footer?: ReactNode;
  contentStyle?: ScrollViewProps['contentContainerStyle'];
} & ScrollViewProps) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const header = (title || right) && (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        {subtitle && (
          <Text variant="caption" tone="accent" style={{ textTransform: 'uppercase', marginBottom: 2 }}>
            {subtitle}
          </Text>
        )}
        {title && <Text variant="display">{title}</Text>}
      </View>
      {right && <View style={styles.right}>{right}</View>}
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: c.bg, paddingTop: insets.top }]}>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: space.xxl * 3 }, contentStyle]}
          {...scrollProps}>
          {header}
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, { flex: 1 }]}>
          {header}
          {children}
        </View>
      )}
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: space.lg,
    gap: space.lg,
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
  },
  header: { flexDirection: 'row', alignItems: 'flex-end', paddingTop: space.md, paddingBottom: space.xs },
  right: { flexDirection: 'row', gap: space.sm, marginLeft: space.md, paddingBottom: 4 },
});

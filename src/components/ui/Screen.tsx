import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTopInset } from '@/hooks/useTopInset';
import { TAB_BAR_SPACE, space, useTheme } from '@/theme';

import { Glow } from './Glow';
import { Text } from './Text';

export const MAX_WIDTH = 640;

/**
 * Standard tab screen: serif title with a quiet subtitle, optional round
 * actions on the right, and a scrolling body that clears the floating tab bar.
 */
export function Screen({
  title,
  subtitle,
  right,
  children,
  contentStyle,
  ...scrollProps
}: {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  contentStyle?: ScrollViewProps['contentContainerStyle'];
} & ScrollViewProps) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const top = useTopInset();
  return (
    <View style={[styles.root, { backgroundColor: c.bg, paddingTop: top }]}>
      <Glow />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: TAB_BAR_SPACE + insets.bottom + space.xxl }, contentStyle]}
        {...scrollProps}>
        {(title || right) && (
          <View style={styles.header}>
            <View style={{ flex: 1, gap: 4 }}>
              {title && <Text variant="display">{title}</Text>}
              {subtitle && <Text tone="muted">{subtitle}</Text>}
            </View>
            {right && <View style={styles.right}>{right}</View>}
          </View>
        )}
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: space.xl - 4,
    gap: space.lg,
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', paddingTop: space.md },
  right: { flexDirection: 'row', gap: space.sm, marginLeft: space.md, paddingTop: 2 },
});

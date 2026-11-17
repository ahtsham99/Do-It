import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { space, useTheme } from '@/theme';

import { Press } from './Pressable';
import { Text } from './Text';

export function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/** Sheet-style screen: title + Done, scrolling body, optional sticky footer. */
export function ModalScreen({
  title,
  children,
  footer,
  doneLabel = 'Done',
  onDone = close,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  doneLabel?: string;
  onDone?: () => void;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={[styles.header, { borderBottomColor: c.border, paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>
        <View style={styles.side} />
        <Text variant="bodyStrong" numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>
          {title}
        </Text>
        <Press onPress={onDone} hitSlop={12} style={[styles.side, { alignItems: 'flex-end' }]} accessibilityRole="button">
          <Text tone="accent" style={{ fontWeight: '600' }}>
            {doneLabel}
          </Text>
        </Press>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.body, !footer && { paddingBottom: insets.bottom + space.xxl }]}>
        {children}
      </ScrollView>
      {footer && <View style={[styles.footer, { paddingBottom: insets.bottom + space.md, borderTopColor: c.border, backgroundColor: c.bg }]}>{footer}</View>}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, minHeight: 56, borderBottomWidth: StyleSheet.hairlineWidth },
  side: { minWidth: 64 },
  body: { padding: space.xl - 4, gap: space.xl - 4, width: '100%', maxWidth: 640, alignSelf: 'center' },
  footer: { paddingHorizontal: space.xl - 4, paddingTop: space.md, borderTopWidth: StyleSheet.hairlineWidth, width: '100%', maxWidth: 640, alignSelf: 'center' },
});

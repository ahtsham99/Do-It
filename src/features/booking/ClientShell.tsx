import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, Text } from '@/components/ui';
import { space, useTheme } from '@/theme';

/** Layout for the public, no-login pages: optional back, scrolling body, sticky action. */
export function ClientShell({
  children,
  footer,
  onBack,
  title,
}: {
  children: ReactNode;
  footer?: ReactNode;
  onBack?: () => void;
  title?: string;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const back = onBack ?? (router.canGoBack() ? () => router.back() : undefined);
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={[styles.top, { paddingTop: insets.top + space.sm }]}>
        {back ? <IconButton icon="chevron-back" label="Back" diameter={42} size={20} onPress={back} /> : <View style={{ width: 42 }} />}
        <Text variant="bodyStrong" numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>
          {title ?? ''}
        </Text>
        <View style={{ width: 42 }} />
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.body, !footer && { paddingBottom: insets.bottom + space.xxl }]}>
        {children}
        {!footer && (
          <Text variant="small" tone="faint" style={{ textAlign: 'center', marginTop: space.lg }}>
            Booked with Chair
          </Text>
        )}
      </ScrollView>
      {footer && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + space.md, borderTopColor: c.border, backgroundColor: c.bg }]}>{footer}</View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, paddingBottom: space.sm, width: '100%', maxWidth: 640, alignSelf: 'center' },
  body: { padding: space.xl - 4, gap: space.xl - 4, width: '100%', maxWidth: 640, alignSelf: 'center', paddingBottom: space.xxl },
  footer: { paddingHorizontal: space.xl - 4, paddingTop: space.md, gap: space.sm, borderTopWidth: StyleSheet.hairlineWidth, width: '100%', maxWidth: 640, alignSelf: 'center' },
});

import { useEffect, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Modal, PanResponder, Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Press, Text } from '@/components/ui';
import type { ReminderItem } from '@/store/types';
import { radius, space, useTheme } from '@/theme';

import { ReminderForm } from './ReminderForm';
import { t } from '@/lib/i18n';

/**
 * Slide-up sheet for adding (or editing) a reminder: everything on one card,
 * typing starts straight away. Drag the handle down or tap outside to close.
 */
export function ReminderSheet({ visible, onClose, defaultListId, existing }: { visible: boolean; onClose: () => void; defaultListId?: string; existing?: ReminderItem }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [y] = useState(() => new Animated.Value(0));
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  // Refs are only read inside the gesture callbacks, never during render.
  // eslint-disable-next-line react-hooks/refs
  const [drag] = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => y.setValue(Math.max(0, g.dy)),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 110 || g.vy > 0.8) {
          close.current();
          y.setValue(0);
        } else Animated.spring(y, { toValue: 0, useNativeDriver: true }).start();
      },
    }),
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: c.overlay }]} onPress={onClose} accessibilityLabel={t('Close')} />
        <View style={{ flex: 1, justifyContent: 'flex-end' }} pointerEvents="box-none">
          <Animated.View style={[styles.sheet, { backgroundColor: c.bg, maxHeight: height * 0.88, paddingBottom: insets.bottom + space.md, transform: [{ translateY: y }] }]}>
            {visible && (
              <ReminderForm
                existing={existing}
                defaultListId={defaultListId}
                onDone={onClose}
                contentStyle={{ padding: space.lg, paddingTop: space.sm }}
                header={(save, canSave) => (
                  <View {...drag.panHandlers} style={styles.top}>
                    <View style={[styles.grabber, { backgroundColor: c.border }]} />
                    <View style={styles.header}>
                      <Press onPress={onClose} hitSlop={10} style={{ minWidth: 64 }}>
                        <Text tone="muted">{t('Cancel')}</Text>
                      </Press>
                      <Text variant="bodyStrong">{existing ? t('Reminder') : t('New reminder')}</Text>
                      <Press onPress={save} disabled={!canSave} hitSlop={10} style={{ minWidth: 64, alignItems: 'flex-end' }}>
                        <Text tone="accent" style={{ fontWeight: '600', opacity: canSave ? 1 : 0.35 }}>
                          {existing ? t('Save') : t('Add')}
                        </Text>
                      </Press>
                    </View>
                  </View>
                )}
              />
            )}
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, width: '100%', maxWidth: 640, alignSelf: 'center', overflow: 'hidden' },
  top: { paddingTop: space.sm },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, height: 48 },
});

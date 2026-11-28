import { useSyncExternalStore } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, space, useTheme } from '@/theme';

import { Press } from './Pressable';
import { Text } from './Text';
import { t } from '@/lib/i18n';

export interface DialogAction {
  label: string;
  destructive?: boolean;
  onPress: () => void;
}
interface DialogState {
  title: string;
  message?: string;
  actions: DialogAction[];
}

let current: DialogState | null = null;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

/** Bottom action sheet that looks the same on iOS, Android and web. */
export function showDialog(d: DialogState) {
  current = d;
  emit();
}
function close() {
  current = null;
  emit();
}

export function DialogHost() {
  const d = useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => current,
    () => current,
  );
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={!!d} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={[styles.backdrop, { backgroundColor: c.overlay }]} onPress={close}>
        <Pressable style={[styles.sheet, { backgroundColor: c.surface, paddingBottom: space.lg + insets.bottom }]}>
          {d && (
            <>
              <Text variant="heading" style={{ textAlign: 'center' }}>
                {d.title}
              </Text>
              {d.message ? (
                <Text tone="muted" style={{ textAlign: 'center' }}>
                  {d.message}
                </Text>
              ) : null}
              <View style={{ gap: space.sm, marginTop: space.sm }}>
                {d.actions.map((a) => (
                  <Press
                    key={a.label}
                    onPress={() => {
                      close();
                      a.onPress();
                    }}
                    style={[styles.btn, { backgroundColor: a.destructive ? c.dangerSoft : c.surfaceAlt }]}>
                    <Text variant="bodyStrong" color={a.destructive ? c.danger : c.text}>
                      {a.label}
                    </Text>
                  </Press>
                ))}
                <Press onPress={close} style={styles.btn}>
                  <Text variant="bodyStrong" tone="muted">
                    {t('Cancel')}
                  </Text>
                </Press>
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: space.xl,
    gap: space.sm,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  btn: { height: 52, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});

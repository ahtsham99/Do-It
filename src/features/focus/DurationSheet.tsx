import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Text } from '@/components/ui';
import { radius, space, useTheme } from '@/theme';
import { formatDuration } from '@/lib/dates';
import { t } from '@/lib/i18n';

/** True where we can show the iPhone's own hours-and-minutes timer wheel. */
export const nativeDurationWheel = Platform.OS === 'ios';

/** iPhone: the system countdown wheel (like the Clock app's Timer) in a bottom sheet. */
export function DurationSheet({ visible, minutes, onClose, onSet }: { visible: boolean; minutes: number; onClose: () => void; onSet: (m: number) => void }) {
  const { c, dark } = useTheme();
  const insets = useSafeAreaInsets();
  // The countdown wheel reads hours and minutes from a date's time of day.
  const [value, setValue] = useState(() => {
    const d = new Date();
    d.setHours(Math.min(23, Math.floor(minutes / 60)), minutes % 60, 0, 0);
    return d;
  });
  const total = value.getHours() * 60 + value.getMinutes();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: c.overlay }]} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: c.surface, paddingBottom: space.lg + insets.bottom }]}>
          <Text variant="heading" style={{ textAlign: 'center' }}>
            {t('Focus length')}
          </Text>
          <DateTimePicker
            value={value}
            mode="countdown"
            display="spinner"
            themeVariant={dark ? 'dark' : 'light'}
            onValueChange={(_, d) => setValue(d)}
          />
          <Button
            label={total ? t('Set {length}', { length: formatDuration(total) }) : t('Pick a length')}
            disabled={!total}
            onPress={() => {
              onSet(total);
              onClose();
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: space.xl, gap: space.md, width: '100%', maxWidth: 640, alignSelf: 'center' },
});

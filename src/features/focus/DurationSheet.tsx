import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ROW, Wheel } from '@/components/pickers/Wheel';
import { Button, Press, Text } from '@/components/ui';
import { radius, space, useTheme } from '@/theme';

import { parseLength } from './parseLength';

const HOURS = Array.from({ length: 10 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

/** Pick a focus length with iPhone-style hour and minute wheels (or type it). */
export function DurationSheet({ visible, minutes, onClose, onSet }: { visible: boolean; minutes: number; onClose: () => void; onSet: (m: number) => void }) {
  const { c, fonts } = useTheme();
  const insets = useSafeAreaInsets();
  const [h, setH] = useState(Math.floor(minutes / 60));
  const [m, setM] = useState(minutes % 60);
  const [typing, setTyping] = useState(false);
  const [typed, setTyped] = useState('');
  const total = h * 60 + m;

  const set = (value: number) => {
    if (value > 0) onSet(value);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: c.overlay }]} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: c.surface, paddingBottom: space.lg + insets.bottom }]}>
          <Text variant="heading" style={{ textAlign: 'center' }}>
            Focus length
          </Text>

          {typing ? (
            <TextInput
              autoFocus
              value={typed}
              onChangeText={setTyped}
              onSubmitEditing={() => set(parseLength(typed) ?? 0)}
              placeholder="e.g. 90, 1:30 or 1h 30m"
              placeholderTextColor={c.textFaint}
              keyboardType="numbers-and-punctuation"
              returnKeyType="done"
              style={[styles.input, { color: c.text, borderBottomColor: c.accent, fontFamily: fonts.text(400) }] as object}
            />
          ) : (
            <View style={styles.wheels}>
              {/* The highlight band behind the selected row, like the iPhone timer */}
              <View pointerEvents="none" style={[styles.band, { backgroundColor: c.surfaceAlt }]} />
              <Wheel values={HOURS} value={h} onChange={setH} unit={h === 1 ? 'hour' : 'hours'} width={130} />
              <Wheel values={MINUTES} value={m} onChange={setM} unit="min" width={120} />
            </View>
          )}

          <Button label={typing ? 'Set' : total ? `Set ${h ? `${h}h ` : ''}${m ? `${m}m` : ''}`.trim() : 'Pick a length'} disabled={!typing && !total} onPress={() => set(typing ? (parseLength(typed) ?? 0) : total)} />
          <Press onPress={() => setTyping(!typing)} style={{ alignSelf: 'center', padding: space.sm }}>
            <Text variant="small" tone="muted" style={{ textDecorationLine: 'underline' }}>
              {typing ? 'Use the wheel instead' : 'Type it instead'}
            </Text>
          </Press>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: space.xl, gap: space.lg, width: '100%', maxWidth: 640, alignSelf: 'center' },
  wheels: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  band: { position: 'absolute', left: 0, right: 0, height: ROW, borderRadius: radius.md },
  input: { fontSize: 22, textAlign: 'center', paddingVertical: 10, borderBottomWidth: 2, outlineStyle: 'none' } as object,
});

import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Icon, Press } from '@/components/ui';
import type { DayKey } from '@/lib/dates';
import { addTask } from '@/store/actions/tasks';
import { font, radius, space, useTheme } from '@/theme';

/** One-line task entry: type, hit return, done. */
export function QuickAdd({ date, placeholder = 'Add a task for today…' }: { date: DayKey; placeholder?: string }) {
  const { c } = useTheme();
  const [title, setTitle] = useState('');
  const submit = () => {
    const t = title.trim();
    if (!t) return;
    addTask({ title: t, date, repeat: 'none', reminder: null, time: null });
    setTitle('');
  };
  return (
    <View style={[styles.wrap, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Icon name="add" size={22} color={c.textFaint} />
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder={placeholder}
        placeholderTextColor={c.textFaint}
        onSubmitEditing={submit}
        returnKeyType="done"
        submitBehavior="submit"
        style={[font.body, styles.input, { color: c.text }]}
      />
      {title.trim().length > 0 && (
        <Press onPress={submit} style={[styles.go, { backgroundColor: c.accent }]} accessibilityLabel="Add">
          <Icon name="arrow-up" size={18} color="#fff" />
        </Press>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingLeft: space.md,
    paddingRight: 6,
    height: 52,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: { flex: 1, height: '100%', fontSize: 16, outlineStyle: 'none' } as object,
  go: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});

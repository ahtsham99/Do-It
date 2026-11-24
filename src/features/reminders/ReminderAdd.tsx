import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Icon, Press, Text } from '@/components/ui';
import { addReminder } from '@/store/actions/reminders';
import { useSettings } from '@/store/hooks';
import { font, radius, space, useTheme } from '@/theme';

import { parseReminder, whenLabel } from './logic';

/**
 * Add in one line. "Call dentist for mum tomorrow 9am" gets an alert;
 * "Milk" is just an item. Keeps focus so a shopping list goes quickly.
 */
export function ReminderAdd({ listId, placeholder }: { listId: string; placeholder: string }) {
  const { c, fonts } = useTheme();
  const { use24h } = useSettings();
  const [text, setText] = useState('');
  const parsed = parseReminder(text);

  const submit = () => {
    if (!text.trim()) return;
    // Several lines pasted at once (e.g. a shopping list) become several items.
    const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      const p = lines.length > 1 ? { title: line, remindAt: null } : parsed;
      addReminder({ title: p.title, listId, remindAt: p.remindAt });
    }
    setText('');
  };

  return (
    <View style={{ gap: 6 }}>
      <View style={[styles.wrap, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Icon name="add" size={22} color={c.textFaint} />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={c.textFaint}
          onSubmitEditing={submit}
          submitBehavior="submit"
          returnKeyType="done"
          style={[font.body, styles.input, { color: c.text, fontFamily: fonts.text(400) }]}
        />
        {text.trim().length > 0 && (
          <Press onPress={submit} style={[styles.go, { backgroundColor: c.accent }]} accessibilityLabel="Add">
            <Icon name="arrow-up" size={18} color={c.accentText} />
          </Press>
        )}
      </View>
      {text.trim() && parsed.remindAt ? (
        <View style={[styles.chip, { backgroundColor: c.accentSoft }]}>
          <Icon name="notifications-outline" size={13} color={c.accent} />
          <Text variant="small" color={c.accent} style={{ fontSize: 12, fontWeight: '600' }}>
            Remind me {whenLabel(parsed.remindAt, use24h)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingLeft: space.md, paddingRight: 6, height: 52, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, height: '100%', fontSize: 16, outlineStyle: 'none' } as object,
  go: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  chip: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, height: 26, borderRadius: radius.pill, marginLeft: 4 },
});

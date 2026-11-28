import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { HighlightInput } from '@/components/HighlightInput';
import { Icon, Press, Text, showToast } from '@/components/ui';
import { addMinutesToTime, formatDay, formatTime, type DayKey } from '@/lib/dates';
import { to24hText } from '@/lib/to24hText';
import { addTask } from '@/store/actions/tasks';
import { useSettings } from '@/store/hooks';
import { font, radius, space, useTheme } from '@/theme';

import { parseQuickAdd } from './parseQuickAdd';

/**
 * One-line planning: type "Gym tomorrow at 7am" and it lands on the right
 * day and time, with a reminder at that time. A preview shows what it understood.
 */
export function QuickAdd({ date, placeholder = 'Add to your day… e.g. Gym at 7am' }: { date: DayKey; placeholder?: string }) {
  const { c, fonts } = useTheme();
  const { use24h } = useSettings();
  const [text, setText] = useState('');
  const parsed = parseQuickAdd(text);
  const day = parsed.date ?? date;
  const understood = text.trim().length > 0 && (parsed.date || parsed.time);

  const submit = () => {
    if (!parsed.title.trim() || !text.trim()) return;
    addTask({ title: parsed.title, date: day, repeat: 'none', time: parsed.time ?? null, duration: parsed.duration ?? null, reminder: parsed.time ? 0 : null });
    if (day !== date) showToast(`Added to ${formatDay(day)}${parsed.time ? ` at ${formatTime(parsed.time, use24h)}` : ''}`, 'calendar-outline');
    setText('');
  };

  return (
    <View style={{ gap: 6 }}>
      <View style={[styles.wrap, { backgroundColor: c.surface, borderColor: c.border }]}>
        {/* + opens the full plan form for this day (whatever you've typed comes along). */}
        <Press
          onPress={() => {
            router.push({ pathname: '/task', params: { date: day, ...(parsed.title && text.trim() ? { title: parsed.title } : {}), ...(parsed.time ? { time: parsed.time } : {}), ...(parsed.duration ? { duration: String(parsed.duration) } : {}) } });
            setText('');
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Add with details"
          style={[styles.plus, { backgroundColor: c.accentSoft }]}>
          <Icon name="add" size={20} color={c.accent} />
        </Press>
        <HighlightInput
          value={text}
          spans={parsed.spans}
          highlight={{ color: c.accent, backgroundColor: c.accentSoft }}
          accessibilityLabel="Add a plan"
          onChangeText={(t) => setText(use24h ? to24hText(t) : t)}
          placeholder={placeholder}
          placeholderTextColor={c.textFaint}
          onSubmitEditing={submit}
          returnKeyType="done"
          submitBehavior="submit"
          style={[font.body, styles.input, { color: c.text, fontFamily: fonts.text(400) }]}
        />
        {text.trim().length > 0 && (
          <Press onPress={submit} style={[styles.go, { backgroundColor: c.accent }]} accessibilityLabel="Add">
            <Icon name="arrow-up" size={18} color={c.accentText} />
          </Press>
        )}
      </View>
      {understood ? (
        <View style={styles.preview}>
          <Chip icon="calendar-outline" label={formatDay(day)} />
          {parsed.time && (
            <Chip
              icon="time-outline"
              label={parsed.duration ? `${formatTime(parsed.time, use24h)}–${formatTime(addMinutesToTime(parsed.time, parsed.duration), use24h)}` : formatTime(parsed.time, use24h)}
            />
          )}
          {parsed.time && <Chip icon="notifications-outline" label="Reminder at that time" />}
        </View>
      ) : null}
    </View>
  );
}

function Chip({ icon, label }: { icon: React.ComponentProps<typeof Icon>['name']; label: string }) {
  const { c } = useTheme();
  return (
    <View style={[styles.chip, { backgroundColor: c.accentSoft }]}>
      <Icon name={icon} size={13} color={c.accent} />
      <Text variant="small" color={c.accent} style={{ fontSize: 12, fontWeight: '600' }}>
        {label}
      </Text>
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
  plus: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginLeft: -4 },
  go: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  preview: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, height: 26, borderRadius: radius.pill },
});

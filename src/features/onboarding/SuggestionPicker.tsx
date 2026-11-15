import { StyleSheet, View } from 'react-native';

import { Card, Checkbox, Glyph, Icon, Press, Section, Text } from '@/components/ui';
import { REPEAT_LABELS } from '@/features/tasks/logic';
import { formatTime } from '@/lib/dates';
import { space, useTheme } from '@/theme';

import { suggestionKey, type Suggestion } from './suggestions';

export function SuggestionPicker({
  items,
  selected,
  onToggle,
}: {
  items: Suggestion[];
  selected: Set<string>;
  onToggle: (key: string) => void;
}) {
  const habits = items.filter((s) => s.kind === 'habit');
  const tasks = items.filter((s) => s.kind === 'task');
  return (
    <>
      <Section title="Habits">
        <Card padded={false} style={{ paddingHorizontal: space.lg }}>
          {habits.map((s, i) => (
            <Row key={suggestionKey(s)} s={s} on={selected.has(suggestionKey(s))} onToggle={onToggle} last={i === habits.length - 1} />
          ))}
        </Card>
      </Section>
      <Section title="Repeating tasks">
        <Card padded={false} style={{ paddingHorizontal: space.lg }}>
          {tasks.map((s, i) => (
            <Row key={suggestionKey(s)} s={s} on={selected.has(suggestionKey(s))} onToggle={onToggle} last={i === tasks.length - 1} />
          ))}
        </Card>
      </Section>
    </>
  );
}

function Row({ s, on, onToggle, last }: { s: Suggestion; on: boolean; onToggle: (k: string) => void; last: boolean }) {
  const { c } = useTheme();
  const key = suggestionKey(s);
  return (
    <Press
      haptic={false}
      onPress={() => onToggle(key)}
      style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border }]}>
      {s.kind === 'habit' ? (
        <View style={[styles.icon, { backgroundColor: c.surfaceAlt }]}>
          <Glyph value={s.icon} size={18} />
        </View>
      ) : (
        <View style={[styles.icon, { backgroundColor: c.surfaceAlt }]}>
          <Icon name="repeat" size={18} color={c.textMuted} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '500' }}>{s.kind === 'habit' ? s.name : s.title}</Text>
        <Text variant="small" tone="muted">
          {s.kind === 'habit'
            ? s.frequency === 'daily'
              ? 'Every day'
              : `${s.timesPerWeek}× a week`
            : `${REPEAT_LABELS[s.repeat]}${s.time ? ` · ${formatTime(s.time)}` : ''}`}
        </Text>
      </View>
      <Checkbox checked={on} onToggle={() => onToggle(key)} />
    </Press>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});

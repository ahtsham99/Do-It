import { StyleSheet, View } from 'react-native';

import { Card, Checkbox, Glyph, Icon, Press, Section, Text } from '@/components/ui';
import { REPEAT_LABELS } from '@/features/tasks/logic';
import { formatTime } from '@/lib/dates';
import { useSettings } from '@/store/hooks';
import { space, useTheme } from '@/theme';

import { suggestionKey, type Suggestion } from './suggestions';
import { t } from '@/lib/i18n';

export function SuggestionPicker({
  items,
  selected,
  onToggle,
}: {
  items: Suggestion[];
  selected: Set<string>;
  onToggle: (key: string) => void;
}) {
  const goals = items.filter((s) => s.kind === 'goal');
  const habits = items.filter((s) => s.kind === 'habit');
  const tasks = items.filter((s) => s.kind === 'task');
  return (
    <>
      {goals.length > 0 && (
        <Section title={goals.length > 1 ? t('Goals') : t('A goal')}>
          <Card padded={false} style={{ paddingHorizontal: space.lg }}>
            {goals.map((s, i) => (
              <Row key={suggestionKey(s)} s={s} on={selected.has(suggestionKey(s))} onToggle={onToggle} last={i === goals.length - 1} />
            ))}
          </Card>
        </Section>
      )}
      {habits.length > 0 && (
      <Section title={t('Habits')}>
        <Card padded={false} style={{ paddingHorizontal: space.lg }}>
          {habits.map((s, i) => (
            <Row key={suggestionKey(s)} s={s} on={selected.has(suggestionKey(s))} onToggle={onToggle} last={i === habits.length - 1} />
          ))}
        </Card>
      </Section>
      )}
      {tasks.length > 0 && (
      <Section title={t('Repeating plans')}>
        <Card padded={false} style={{ paddingHorizontal: space.lg }}>
          {tasks.map((s, i) => (
            <Row key={suggestionKey(s)} s={s} on={selected.has(suggestionKey(s))} onToggle={onToggle} last={i === tasks.length - 1} />
          ))}
        </Card>
      </Section>
      )}
    </>
  );
}

function Row({ s, on, onToggle, last }: { s: Suggestion; on: boolean; onToggle: (k: string) => void; last: boolean }) {
  const { c } = useTheme();
  const { use24h } = useSettings();
  const key = suggestionKey(s);
  return (
    <Press
      haptic={false}
      onPress={() => onToggle(key)}
      style={[styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border }]}>
      {s.kind !== 'task' ? (
        <View style={[styles.icon, { backgroundColor: c.surfaceAlt }]}>
          <Glyph value={s.icon} size={18} />
        </View>
      ) : (
        <View style={[styles.icon, { backgroundColor: c.surfaceAlt }]}>
          <Icon name="repeat" size={18} color={c.textMuted} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '500' }}>{t(s.kind === 'habit' ? s.name : s.title)}</Text>
        <Text variant="small" tone="muted" numberOfLines={1}>
          {s.kind === 'goal'
            ? t('First steps: {steps}', { steps: s.steps.map((x) => t(x)).join(' · ') })
            : s.kind === 'habit'
              ? s.frequency === 'daily'
                ? t('Every day')
                : t('{timesPerWeek}× a week', { timesPerWeek: s.timesPerWeek })
              : `${t(REPEAT_LABELS[s.repeat])}${s.time ? ` · ${formatTime(s.time, use24h)}` : ''}`}
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

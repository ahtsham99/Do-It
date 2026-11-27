import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Chip, Icon, Label, Press, Text } from '@/components/ui';
import { MAIN_PERSONAS, MORE_PERSONAS } from '@/features/onboarding/suggestions';
import { updateSettings } from '@/store/actions/settings';
import { useSettings } from '@/store/hooks';
import { radius, space, useTheme } from '@/theme';

/** Who you are: the main four, more under "More", or your own words. */
export function AboutYou() {
  const { c } = useTheme();
  const { persona, personaLabel } = useSettings();
  const custom = persona === 'other' && personaLabel.trim() ? personaLabel.trim() : '';
  const inMore = !!custom || MORE_PERSONAS.some((p) => p.value === persona);
  const [open, setOpen] = useState(inMore);
  const [text, setText] = useState('');
  const shown = open || inMore;

  const add = () => {
    const t = text.trim();
    if (!t) return;
    updateSettings({ persona: 'other', personaLabel: t });
    setText('');
  };

  return (
    <View style={{ gap: space.sm }}>
      <Label>About you</Label>
      <View style={styles.wrap}>
        {MAIN_PERSONAS.map((p) => (
          <Chip key={p.value} label={p.label} icon={p.icon} selected={persona === p.value} onPress={() => updateSettings({ persona: p.value, personaLabel: '' })} />
        ))}
        <Press
          onPress={() => setOpen(!shown)}
          accessibilityRole="button"
          accessibilityState={{ expanded: shown }}
          style={[styles.more, { borderColor: c.border }]}>
          <Text variant="small" tone="muted" style={{ fontWeight: '600' }}>
            {shown ? 'Less' : 'More'}
          </Text>
          <Icon name={shown ? 'chevron-up' : 'chevron-down'} size={14} color={c.textMuted} />
        </Press>
      </View>

      {shown && (
        <>
          <View style={styles.wrap}>
            {MORE_PERSONAS.map((p) => (
              <Chip
                key={p.value}
                label={p.label}
                icon={p.icon}
                selected={persona === p.value && !(p.value === 'other' && custom)}
                onPress={() => updateSettings({ persona: p.value, personaLabel: '' })}
              />
            ))}
            {custom ? <Chip label={custom} icon="person-outline" selected onPress={() => {}} /> : null}
          </View>
          <View style={[styles.add, { backgroundColor: c.surface, borderColor: c.border }]}>
            <TextInput
              value={text}
              onChangeText={setText}
              onSubmitEditing={add}
              placeholder={custom ? 'Change it… e.g. Nurse, Musician' : 'Add your own… e.g. Nurse, Musician'}
              placeholderTextColor={c.textFaint}
              returnKeyType="done"
              maxLength={30}
              accessibilityLabel="Describe yourself"
              style={[styles.input, { color: c.text }, { outlineStyle: 'none' } as object]}
            />
            <Press onPress={add} disabled={!text.trim()} accessibilityLabel="Add" style={[styles.addBtn, { backgroundColor: text.trim() ? c.accent : c.surfaceAlt }]}>
              <Icon name="add" size={18} color={text.trim() ? c.accentText : c.textFaint} />
            </Press>
          </View>
        </>
      )}
      <Text variant="small" tone="muted">
        Only used to suggest habits and reminders.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  more: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 40, paddingHorizontal: space.lg, borderRadius: radius.pill, borderWidth: 1, borderStyle: 'dashed' },
  add: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderWidth: 1, borderRadius: radius.pill, paddingLeft: space.lg, paddingRight: 5, height: 48 },
  input: { flex: 1, fontSize: 15, paddingVertical: 0 },
  addBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});

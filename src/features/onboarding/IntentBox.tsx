import { StyleSheet, TextInput, View } from 'react-native';

import { Press, Text } from '@/components/ui';
import { radius, space, useTheme } from '@/theme';

import { INTENT_IDEAS } from './intents';
import { t } from '@/lib/i18n';

/** "What do you want to work on?": free text plus ideas to tap. */
export function IntentBox({ value, onChange, autoFocus }: { value: string; onChange: (t: string) => void; autoFocus?: boolean }) {
  const { c } = useTheme();
  const lower = value.toLowerCase();
  const ideas = INTENT_IDEAS.filter((i) => !lower.includes(i.toLowerCase())).slice(0, 6);
  const addIdea = (idea: string) => {
    const t = value.trim();
    onChange(t ? `${t.replace(/[,.]$/, '')}, ${idea.toLowerCase()}` : idea);
  };
  return (
    <View style={{ gap: space.md }}>
      <TextInput
        value={value}
        onChangeText={onChange}
        autoFocus={autoFocus}
        multiline
        maxLength={240}
        placeholder={t('e.g. Go to the gym 3 times a week, eat clean and stop scrolling at night')}
        placeholderTextColor={c.textFaint}
        accessibilityLabel={t('What do you want to work on?')}
        style={[styles.input, { backgroundColor: c.surface, borderColor: c.border, color: c.text }, { outlineStyle: 'none' } as object]}
      />
      {ideas.length > 0 && (
        <View style={styles.ideas}>
          {ideas.map((i) => (
            <Press key={i} onPress={() => addIdea(i)} accessibilityLabel={`Add ${i}`} style={[styles.idea, { backgroundColor: c.surfaceAlt }]}>
              <Text variant="small" tone="muted" style={{ fontWeight: '500' }}>
                + {i}
              </Text>
            </Press>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 96, borderWidth: 1, borderRadius: radius.lg, padding: space.lg, fontSize: 17, lineHeight: 24, textAlignVertical: 'top' },
  ideas: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  idea: { paddingHorizontal: 12, height: 34, borderRadius: radius.pill, justifyContent: 'center' },
});

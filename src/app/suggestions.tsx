import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { useSheetTopInset } from '@/hooks/useTopInset';
import { Button, Chip, SheetHeader, Text, showToast } from '@/components/ui';
import { applySuggestions } from '@/features/onboarding/applySuggestions';
import { IntentBox } from '@/features/onboarding/IntentBox';
import { SuggestionPicker } from '@/features/onboarding/SuggestionPicker';
import { useIntentPicks } from '@/features/onboarding/useIntentPicks';
import { PERSONAS, SUGGESTIONS } from '@/features/onboarding/suggestions';
import { updateSettings } from '@/store/actions/settings';
import { useSettings } from '@/store/hooks';
import type { Persona } from '@/store/types';
import { space, useTheme } from '@/theme';
import { t } from '@/lib/i18n';

/** Change persona and browse its suggestions at any time. */
export default function SuggestionsScreen() {
  const { c } = useTheme();
  const sheetTop = useSheetTopInset();
  const settings = useSettings();
  const [persona, setPersona] = useState<Persona>(settings.persona ?? 'other');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const intent = useIntentPicks(selected, setSelected);
  const toggle = (k: string) => {
    const n = new Set(selected);
    if (!n.delete(k)) n.add(k);
    setSelected(n);
  };

  const add = () => {
    const n = applySuggestions(intent.chosen(SUGGESTIONS[persona]));
    showToast(n ? t('Added {n}.', { n }) : t('You already have those.'));
    if (router.canGoBack()) router.back();
    else router.replace('/settings');
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingTop: sheetTop }}>
        <SheetHeader title={t('Suggestions')} />
      </View>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.xl, paddingBottom: space.xxl * 2, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <View style={{ gap: space.sm }}>
          <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>
            What do you want to work on?
          </Text>
          <IntentBox value={intent.text} onChange={intent.setText} />
        </View>
        {intent.matches.length > 0 && <SuggestionPicker items={intent.matches} selected={selected} onToggle={toggle} />}
        <View style={{ gap: space.sm }}>
          <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>
            {t('Or browse by who you are')}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {PERSONAS.map((p) => (
              <Chip
                key={p.value}
                label={p.label}
                icon={p.icon}
                selected={persona === p.value}
                onPress={() => {
                  setPersona(p.value);
                  updateSettings({ persona: p.value });
                }}
              />
            ))}
          </View>
        </View>
        <SuggestionPicker items={SUGGESTIONS[persona]} selected={selected} onToggle={toggle} />
        <Button label={selected.size ? t('Add {n}', { n: selected.size }) : t('Pick some to add')} disabled={!selected.size} onPress={add} />
      </ScrollView>
    </View>
  );
}

import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Chip, SheetHeader, Text, showToast } from '@/components/ui';
import { applySuggestions } from '@/features/onboarding/applySuggestions';
import { SuggestionPicker } from '@/features/onboarding/SuggestionPicker';
import { PERSONAS, SUGGESTIONS, suggestionKey } from '@/features/onboarding/suggestions';
import { updateSettings } from '@/store/actions/settings';
import { useSettings } from '@/store/hooks';
import type { Persona } from '@/store/types';
import { space, useTheme } from '@/theme';

/** Change persona and browse its suggestions at any time. */
export default function SuggestionsScreen() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const settings = useSettings();
  const [persona, setPersona] = useState<Persona>(settings.persona ?? 'other');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const add = () => {
    const n = applySuggestions(SUGGESTIONS[persona].filter((s) => selected.has(suggestionKey(s))));
    showToast(n ? `Added ${n}. Now actually do them.` : 'You already have those.');
    if (router.canGoBack()) router.back();
    else router.replace('/settings');
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingTop: Platform.OS === 'web' ? insets.top : 0 }}>
        <SheetHeader title="Suggestions" />
      </View>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.xl, paddingBottom: space.xxl * 2, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <View style={{ gap: space.sm }}>
          <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>
            I am a…
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
                  setSelected(new Set());
                  updateSettings({ persona: p.value });
                }}
              />
            ))}
          </View>
        </View>
        <SuggestionPicker
          items={SUGGESTIONS[persona]}
          selected={selected}
          onToggle={(k) => {
            const n = new Set(selected);
            if (!n.delete(k)) n.add(k);
            setSelected(n);
          }}
        />
        <Button label={selected.size ? `Add ${selected.size}` : 'Pick some to add'} disabled={!selected.size} onPress={add} />
      </ScrollView>
    </View>
  );
}

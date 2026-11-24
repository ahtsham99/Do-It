import * as Font from 'expo-font';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useSheetTopInset } from '@/hooks/useTopInset';
import { Card, Icon, Press, Section, SheetHeader, Text } from '@/components/ui';
import { updateSettings } from '@/store/actions/settings';
import { useSettings } from '@/store/hooks';
import { LOGO, radius, space, useTheme } from '@/theme';
import { DISPLAY_FONTS, FONT_STYLES, TEXT_FONTS, displayFont, faceForWeight, previewFaces, styleFor, textFont } from '@/theme/fonts';

/** Pick the logo, heading and text fonts, with a live preview. */
export default function FontsScreen() {
  const { c } = useTheme();
  const sheetTop = useSheetTopInset();
  const s = useSettings();
  const [previewsReady, setPreviewsReady] = useState(false);
  const [custom, setCustom] = useState(false);

  // Load one face of every option so each card can show itself.
  useEffect(() => {
    let alive = true;
    Font.loadAsync(previewFaces())
      .catch(() => {})
      .finally(() => alive && setPreviewsReady(true));
    return () => {
      alive = false;
    };
  }, []);

  const own = (family?: string) => (previewsReady && family ? { fontFamily: family, fontWeight: 'normal' as const } : {});

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingTop: sheetTop }}>
        <SheetHeader title="Fonts" cancelLabel="Done" />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={{ gap: space.sm }}>
          <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>
            Preview
          </Text>
          <Text variant="display" style={{ fontFamily: LOGO, letterSpacing: -0.8 }}>
            Do It
          </Text>
          <Text variant="title">Good evening</Text>
          <Text tone="muted" style={{ lineHeight: 23 }}>
            Three small habits today. A reminder at 6pm, and a 25-minute focus session when you’re ready.
          </Text>
          <Text variant="bodyStrong">Read 20 pages · 4 day streak</Text>
        </Card>

        <Section title="Style">
          <View style={styles.grid}>
            {FONT_STYLES.map((st) => {
              const d = displayFont(st.choice.display).face?.family;
              const t = faceForWeight(textFont(st.choice.text), 400)?.family;
              const on = styleFor({ logo: s.logoFont, display: s.displayFont, text: s.textFont })?.id === st.id;
              return (
                <Option key={st.id} selected={on} onPress={() => updateSettings({ logoFont: st.choice.logo, displayFont: st.choice.display, textFont: st.choice.text })}>
                  <Text style={[{ fontSize: 26, lineHeight: 32 }, own(d), !d && { fontWeight: '600' }]}>{st.label}</Text>
                  <Text variant="small" tone="muted" style={own(t)}>
                    {st.blurb}
                  </Text>
                </Option>
              );
            })}
          </View>
        </Section>

        <Press onPress={() => setCustom(!custom)} style={styles.customRow} accessibilityRole="button">
          <Text variant="small" tone="muted" style={{ fontWeight: '600' }}>
            Customise each font
          </Text>
          <Icon name={custom ? 'chevron-up' : 'chevron-down'} size={16} color={c.textMuted} />
        </Press>

        {custom && (
        <>
        <Section title="Logo">
          <View style={styles.grid}>
            {DISPLAY_FONTS.map((f) => (
              <Option key={f.id} selected={s.logoFont === f.id} onPress={() => updateSettings({ logoFont: f.id })}>
                <Text style={[{ fontSize: 30, lineHeight: 38 }, own(f.face?.family), !f.face && { fontWeight: '600' }]}>Do It</Text>
                <Text variant="small" tone="muted">
                  {f.label}
                </Text>
              </Option>
            ))}
          </View>
        </Section>

        <Section title="Headings">
          <View style={styles.grid}>
            {DISPLAY_FONTS.map((f) => (
              <Option key={f.id} selected={s.displayFont === f.id} onPress={() => updateSettings({ displayFont: f.id })}>
                <Text style={[{ fontSize: 26, lineHeight: 34 }, own(f.face?.family), !f.face && { fontWeight: '600' }]}>Habits</Text>
                <Text variant="small" tone="muted">
                  {f.label} · {f.blurb}
                </Text>
              </Option>
            ))}
          </View>
        </Section>

        <Section title="Text">
          <Card padded={false} style={{ paddingHorizontal: space.lg }}>
            {TEXT_FONTS.map((f, i) => {
              const on = s.textFont === f.id;
              return (
                <Press
                  key={f.id}
                  onPress={() => updateSettings({ textFont: f.id })}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  style={[styles.textRow, i < TEXT_FONTS.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border }]}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[{ fontSize: 17 }, own(faceForWeight(f, 400)?.family)]}>{f.label}</Text>
                    <Text variant="small" tone="muted" style={own(faceForWeight(f, 400)?.family)}>
                      {f.blurb}
                    </Text>
                  </View>
                  {on && <Icon name="checkmark-circle" size={22} color={c.accent} />}
                </Press>
              );
            })}
          </Card>
        </Section>

        </>
        )}

        <Press
          onPress={() => updateSettings({ logoFont: 'newsreader', displayFont: 'instrument', textFont: 'system' })}
          style={{ alignSelf: 'center', padding: space.sm }}>
          <Text variant="small" tone="muted" style={{ textDecorationLine: 'underline' }}>
            Back to the original fonts
          </Text>
        </Press>
      </ScrollView>
    </View>
  );
}

function Option({ selected, onPress, children }: { selected: boolean; onPress: () => void; children: React.ReactNode }) {
  const { c } = useTheme();
  return (
    <Press
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[styles.option, { backgroundColor: selected ? c.accentSoft : c.surface, borderColor: selected ? c.accent : c.border }]}>
      {children}
      {selected && (
        <View style={styles.tick}>
          <Icon name="checkmark-circle" size={20} color={c.accent} />
        </View>
      )}
    </Press>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.xl - 4, gap: space.xl, paddingBottom: space.xxl * 2, maxWidth: 640, width: '100%', alignSelf: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  option: {
    width: '47%',
    flexGrow: 1,
    minHeight: 96,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    gap: 4,
    justifyContent: 'center',
  },
  customRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: space.sm },
  tick: { position: 'absolute', top: 10, right: 10 },
  textRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 66 },
});

import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Pattern, Rect, Stop } from 'react-native-svg';

import { AnyColorInput } from '@/components/pickers';
import { Button, Card, Label, Press, SheetHeader, Text } from '@/components/ui';
import { useSheetTopInset } from '@/hooks/useTopInset';
import { updateSettings } from '@/store/actions/settings';
import { useSettings } from '@/store/hooks';
import { customColor, hslToHex, radius, space, useTheme } from '@/theme';
import { t } from '@/lib/i18n';

const HUES = [0, 25, 45, 60, 100, 145, 175, 200, 225, 260, 290, 330];
const SHADES = [0.38, 0.5, 0.62];
const GREYS = ['#1E1C19', '#4A4744', '#7A7772', '#A8A49D'];

/** Choose an app colour from the palette, or the system colour picker. */
export default function ColorScreen() {
  const { c } = useTheme();
  const sheetTop = useSheetTopInset();
  const s = useSettings();
  const [hex, setHex] = useState(s.nightColor === 'custom' ? s.customColor : '#2F8A5F');
  const valid = /^#[0-9a-f]{6}$/i.test(hex);
  const preview = customColor(valid ? hex : '#2F8A5F');

  const choose = (h: string) => setHex(h);
  const save = () => {
    if (!valid) return;
    updateSettings({ nightColor: 'custom', customColor: hex.toUpperCase() });
    if (router.canGoBack()) router.back();
    else router.replace('/settings');
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ paddingTop: sheetTop }}>
        <SheetHeader title={t('Your colour')} onSave={save} saveLabel={t('Use')} canSave={valid} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Preview: day and night side by side */}
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <Preview night={false} glow={[preview.day.glow[0], preview.day.glow[1]]} accent={preview.day.accent} />
          <Preview night glow={[preview.glow[0], preview.glow[1]]} accent={preview.accent} />
        </View>

        <AnyColorInput value={valid ? hex : '#2F8A5F'} onChange={choose} />

        <View style={{ gap: space.sm }}>
          <Label>{t('Palette')}</Label>
          <Card style={{ gap: 6 }}>
            {SHADES.map((l) => (
              <View key={l} style={styles.row}>
                {HUES.map((h) => {
                  const col = hslToHex(h, 0.72, l);
                  return <Dot key={h} color={col} on={hex.toLowerCase() === col} onPress={() => choose(col)} />;
                })}
              </View>
            ))}
            <View style={[styles.row, { justifyContent: 'flex-start', gap: 6 }]}>
              {GREYS.map((g) => (
                <Dot key={g} color={g} on={hex.toLowerCase() === g.toLowerCase()} onPress={() => choose(g)} />
              ))}
            </View>
          </Card>
        </View>


        <Button label={t('Use this colour')} onPress={save} disabled={!valid} />
        <Text variant="small" tone="muted" style={{ textAlign: 'center' }}>
          {t('Buttons and the timer use a slightly deeper shade, so text stays readable.')}
        </Text>
      </ScrollView>
    </View>
  );
}

function Dot({ color, on, onPress }: { color: string; on: boolean; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Press onPress={onPress} accessibilityLabel={t('Colour {color}', { color })} accessibilityState={{ selected: on }} style={[styles.dot, { borderColor: on ? c.text : 'transparent' }]}>
      <View style={{ flex: 1, borderRadius: 99, backgroundColor: color }} />
    </Press>
  );
}

function Preview({ night, glow, accent }: { night: boolean; glow: [string, string]; accent: string }) {
  const id = night ? 'pn' : 'pd';
  const bg = night ? '#050505' : '#F8F7F3';
  return (
    <View style={[styles.preview, { backgroundColor: bg }]}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id={`g${id}`} x1="0" y1="0" x2="0.2" y2="1">
            <Stop offset="0" stopColor={glow[0]} stopOpacity={night ? 1 : 0.55} />
            <Stop offset="0.45" stopColor={glow[1]} stopOpacity={night ? 1 : 0.55} />
            <Stop offset="1" stopColor={bg} />
          </LinearGradient>
          <Pattern id={`d${id}`} width="7" height="7" patternUnits="userSpaceOnUse">
            <Circle cx="3.5" cy="3.5" r="1" fill={night ? '#fff' : accent} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#g${id})`} />
        <Rect width="100%" height="55%" fill={`url(#d${id})`} opacity={night ? 0.18 : 0.08} />
      </Svg>
      <Text style={{ fontSize: 18, fontWeight: '600' }} color={night ? '#F4F3EE' : '#1E1C19'}>
        {night ? t('Night') : t('Day')}
      </Text>
      <View style={[styles.pill, { backgroundColor: accent }]}>
        <Text variant="small" color="#fff" style={{ fontWeight: '600' }}>
          {t('Start focus')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.lg, gap: space.xl, paddingBottom: space.xxl * 2, maxWidth: 640, width: '100%', alignSelf: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  dot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, padding: 2 },
  preview: { flex: 1, height: 150, borderRadius: radius.lg, overflow: 'hidden', padding: space.lg, justifyContent: 'space-between' },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 14, height: 34, borderRadius: 17, justifyContent: 'center' },
});

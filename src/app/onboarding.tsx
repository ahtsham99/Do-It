import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Field, Icon, Press, Segmented, Text } from '@/components/ui';
import { applySuggestions } from '@/features/onboarding/applySuggestions';
import { SuggestionPicker } from '@/features/onboarding/SuggestionPicker';
import { PERSONAS, SUGGESTIONS, suggestionKey } from '@/features/onboarding/suggestions';
import { pick } from '@/features/nudges/messages';
import { requestNotificationPermission, supportsLocalNotifications } from '@/lib/notifications';
import { updateSettings } from '@/store/actions/settings';
import { useSettings } from '@/store/hooks';
import type { Persona, Tone } from '@/store/types';
import { SERIF, radius, space, useTheme } from '@/theme';

const STEPS = ['welcome', 'name', 'persona', 'suggest', 'tone', 'finish'] as const;
type Step = (typeof STEPS)[number];

function isStandaloneWeb() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return true;
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
}

export default function Onboarding() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const settings = useSettings();
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState(settings.name);
  const [persona, setPersona] = useState<Persona | null>(settings.persona);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tone, setTone] = useState<Tone>(settings.tone);

  const idx = STEPS.indexOf(step);
  const next = () => setStep(STEPS[Math.min(idx + 1, STEPS.length - 1)]);
  const back = () => setStep(STEPS[Math.max(idx - 1, 0)]);

  const choosePersona = (p: Persona) => {
    setPersona(p);
    // Pre-tick the first two habits and the first task as a gentle start.
    const list = SUGGESTIONS[p];
    const pre = [...list.filter((s) => s.kind === 'habit').slice(0, 2), ...list.filter((s) => s.kind === 'task').slice(0, 1)];
    setSelected(new Set(pre.map(suggestionKey)));
  };

  const finish = async () => {
    if (persona) applySuggestions(SUGGESTIONS[persona].filter((s) => selected.has(suggestionKey(s))));
    let notificationsEnabled = settings.notificationsEnabled;
    if (supportsLocalNotifications) notificationsEnabled = await requestNotificationPermission().catch(() => false);
    updateSettings({ onboarded: true, name: name.trim(), persona, tone, notificationsEnabled });
    router.replace('/');
  };

  let body: React.ReactNode;
  let cta = 'Continue';
  let canNext = true;
  let onCta = next;

  switch (step) {
    case 'welcome':
      cta = 'Let’s do it';
      body = (
        <View style={{ flex: 1, justifyContent: 'center', gap: space.lg }}>
          <View style={[styles.logo, { backgroundColor: c.accent }]}>
            <Icon name="checkmark" size={44} color="#fff" />
          </View>
          <Text style={{ fontFamily: SERIF, fontSize: 56, letterSpacing: -1, lineHeight: 58 }}>
            Start it.{'\n'}Finish it.
          </Text>
          <Text variant="body" tone="muted" style={{ fontSize: 18, lineHeight: 26 }}>
            Do It is a planner for people who start things and don’t finish — or forget them entirely. It will nag you. Lovingly.
          </Text>
        </View>
      );
      break;
    case 'name':
      body = (
        <View style={{ gap: space.lg }}>
          <Heading title="What should we call you?" sub="So the nagging feels personal." />
          <Field placeholder="First name (optional)" value={name} onChangeText={setName} autoFocus returnKeyType="next" onSubmitEditing={next} />
        </View>
      );
      break;
    case 'persona':
      canNext = !!persona;
      body = (
        <View style={{ gap: space.lg }}>
          <Heading title="Who are you?" sub="We’ll suggest tasks and habits that fit. Everything else stays the same." />
          <View style={{ gap: space.sm }}>
            {PERSONAS.map((p) => {
              const sel = persona === p.value;
              return (
                <Press
                  key={p.value}
                  onPress={() => choosePersona(p.value)}
                  style={[styles.persona, { backgroundColor: sel ? c.accent : c.surface, borderColor: sel ? c.accent : c.border }]}>
                  <View style={[styles.personaIcon, { backgroundColor: sel ? 'rgba(255,255,255,0.16)' : c.surfaceAlt }]}>
                    <Icon name={p.icon} size={22} color={sel ? '#fff' : c.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyStrong" color={sel ? c.accentText : c.text}>
                      {p.label}
                    </Text>
                    <Text variant="small" color={sel ? c.accentText : c.textMuted} style={{ opacity: sel ? 0.75 : 1 }}>
                      {p.blurb}
                    </Text>
                  </View>
                  {sel && <Icon name="checkmark-circle" size={22} color={c.accentText} />}
                </Press>
              );
            })}
          </View>
        </View>
      );
      break;
    case 'suggest':
      cta = selected.size ? `Add ${selected.size} & continue` : 'Skip for now';
      body = persona && (
        <View style={{ gap: space.lg }}>
          <Heading title="A starter kit" sub="Pick a few. Start small — you can add more any time." />
          <SuggestionPicker
            items={SUGGESTIONS[persona]}
            selected={selected}
            onToggle={(k) => {
              const n = new Set(selected);
              if (!n.delete(k)) n.add(k);
              setSelected(n);
            }}
          />
        </View>
      );
      break;
    case 'tone':
      body = (
        <View style={{ gap: space.lg }}>
          <Heading title="How hard should we push?" sub="You can change this in Settings." />
          <Segmented
            tone="accent"
            options={[
              { value: 'gentle', label: 'Gentle' },
              { value: 'balanced', label: 'Firm' },
              { value: 'savage', label: 'Relentless' },
            ]}
            value={tone}
            onChange={setTone}
          />
          <Card style={{ gap: space.sm }}>
            <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>
              When you have overdue tasks
            </Text>
            <Text variant="heading">“{pick('overdue', tone, 'onboarding')}”</Text>
          </Card>
          <Card style={{ gap: space.sm }}>
            <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>
              Every morning
            </Text>
            <Text variant="heading">“{pick('planPrompt', tone, 'onboarding')}”</Text>
          </Card>
        </View>
      );
      break;
    case 'finish':
      cta = supportsLocalNotifications ? 'Allow notifications & start' : 'Start planning';
      onCta = finish;
      body = (
        <View style={{ gap: space.lg }}>
          <Heading
            title={`You’re in${name.trim() ? `, ${name.trim()}` : ''}.`}
            sub="Every morning we’ll ask you to plan your day. Every evening we’ll check you did it. Keep showing up to grow your streak."
          />
          {supportsLocalNotifications ? (
            <Tip icon="notifications" text="Turn on notifications so we can remind you — that’s the whole point." />
          ) : !isStandaloneWeb() ? (
            <Tip
              icon="share-outline"
              text="Install it: tap the Share button in Safari, then “Add to Home Screen”. It opens full-screen like a real app."
            />
          ) : (
            <Tip icon="notifications" text="Reminders show up as big banners on the Today screen whenever you open the app." />
          )}
        </View>
      );
      break;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, paddingTop: insets.top + space.md, paddingBottom: insets.bottom + space.lg, width: '100%', maxWidth: 560, alignSelf: 'center' }}>
        <View style={[styles.top, { paddingHorizontal: space.lg }]}>
          {idx > 0 ? (
            <Press onPress={back} hitSlop={12} accessibilityLabel="Back">
              <Icon name="chevron-back" size={24} color={c.textMuted} />
            </Press>
          ) : (
            <View style={{ width: 24 }} />
          )}
          <View style={styles.dots}>
            {STEPS.map((s, i) => (
              <View key={s} style={[styles.dot, { backgroundColor: i <= idx ? c.accent : c.border, width: i === idx ? 20 : 6 }]} />
            ))}
          </View>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, padding: space.lg, gap: space.lg }}>
          {body}
        </ScrollView>
        <View style={{ paddingHorizontal: space.lg }}>
          <Button label={cta} onPress={onCta} disabled={!canNext} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function Heading({ title, sub }: { title: string; sub: string }) {
  return (
    <View style={{ gap: space.sm, paddingTop: space.md }}>
      <Text variant="title" style={{ fontSize: 36, lineHeight: 40 }}>
        {title}
      </Text>
      <Text tone="muted" style={{ fontSize: 17, lineHeight: 24 }}>
        {sub}
      </Text>
    </View>
  );
}

function Tip({ icon, text }: { icon: React.ComponentProps<typeof Icon>['name']; text: string }) {
  const { c } = useTheme();
  return (
    <Card style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
      <View style={[styles.personaIcon, { backgroundColor: c.accentSoft }]}>
        <Icon name={icon} size={20} color={c.accent} />
      </View>
      <Text style={{ flex: 1 }}>{text}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 32 },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { height: 6, borderRadius: 3 },
  logo: { width: 84, height: 84, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  persona: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  personaIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});

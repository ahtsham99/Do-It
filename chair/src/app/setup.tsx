import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, IconButton, Text } from '@/components/ui';
import { BookingLinkCard } from '@/features/shop/BookingLinkCard';
import { HoursEditor } from '@/features/shop/HoursEditor';
import { PoliciesForm } from '@/features/shop/PoliciesForm';
import { ProfileForm } from '@/features/shop/ProfileForm';
import { ServicesEditor } from '@/features/shop/ServicesEditor';
import { updateSettings } from '@/store/actions/shop';
import { useServices } from '@/store/hooks';
import { useStore } from '@/store/store';
import { space, useTheme } from '@/theme';

const STEPS = [
  { title: 'Your shop', sub: 'This is what clients see when they open your link.' },
  { title: 'Services', sub: 'What you offer, what it costs and how long it takes. Slots are worked out from these.' },
  { title: 'Opening hours', sub: 'Clients can only book inside these hours. You can add days off and holidays later.' },
  { title: 'Deposits & cancellations', sub: 'Optional. Clients see these rules in plain English before they book.' },
  { title: "You're open for bookings", sub: 'Share your link or print the QR code for your window or mirror.' },
];

export default function Setup() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const shop = useStore((s) => s.shop);
  const hours = useStore((s) => s.hours);
  const services = useServices();

  const blocker = [
    !shop.name.trim() && 'Add your shop name to carry on.',
    services.length === 0 && 'Add at least one service.',
    !hours.some((h) => h.open) && 'Open at least one day a week.',
    false,
    false,
  ][step];

  const next = () => {
    if (step === 3) updateSettings({ setupComplete: true }); // link is fixed from here on
    if (step === STEPS.length - 1) return router.replace('/calendar');
    setStep(step + 1);
  };
  const back = () => (step === 0 ? (router.canGoBack() ? router.back() : router.replace('/')) : setStep(step - 1));

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={[styles.top, { paddingTop: insets.top + space.sm }]}>
        {step < STEPS.length - 1 ? <IconButton icon="chevron-back" label="Back" diameter={42} size={20} onPress={back} /> : <View style={{ width: 42 }} />}
        <View style={styles.progress}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i <= step ? c.accent : c.border }]} />
          ))}
        </View>
        <View style={{ width: 42 }} />
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.body}>
        <View style={{ gap: space.sm }}>
          <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>
            Step {step + 1} of {STEPS.length}
          </Text>
          <Text variant="title">{STEPS[step].title}</Text>
          <Text tone="muted" style={{ lineHeight: 22 }}>
            {STEPS[step].sub}
          </Text>
        </View>
        {step === 0 && <ProfileForm />}
        {step === 1 && <ServicesEditor />}
        {step === 2 && <HoursEditor />}
        {step === 3 && <PoliciesForm />}
        {step === 4 && <BookingLinkCard />}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md, borderTopColor: c.border }]}>
        {blocker ? (
          <Text variant="small" tone="muted" style={{ textAlign: 'center' }}>
            {blocker}
          </Text>
        ) : null}
        <Button label={step === STEPS.length - 1 ? 'Go to my calendar' : 'Continue'} onPress={next} disabled={!!blocker} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg, paddingBottom: space.sm },
  progress: { flexDirection: 'row', gap: 6 },
  dot: { width: 28, height: 4, borderRadius: 2 },
  body: { padding: space.xl - 4, gap: space.xl, width: '100%', maxWidth: 640, alignSelf: 'center', paddingBottom: space.xxl },
  footer: { paddingHorizontal: space.xl - 4, paddingTop: space.md, gap: space.sm, borderTopWidth: StyleSheet.hairlineWidth, width: '100%', maxWidth: 640, alignSelf: 'center' },
});

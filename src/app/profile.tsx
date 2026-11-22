import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, Chip, Field, Label, ListRow, SheetHeader, Text } from '@/components/ui';
import { PERSONAS } from '@/features/onboarding/suggestions';
import { useNudges } from '@/features/nudges/useNudges';
import { updateSettings } from '@/store/actions/settings';
import { useHabits, useSettings, useTasks } from '@/store/hooks';
import { SERIF, space, useTheme } from '@/theme';

/** Profile: who you are, and a quiet summary of what you've done. */
export default function ProfileScreen() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useSettings();
  const n = useNudges();
  const tasks = useTasks();
  const habits = useHabits();
  const tasksDone = tasks.reduce((sum, t) => sum + t.completedDates.length, 0);
  const checkIns = habits.reduce((sum, h) => sum + h.history.length, 0);
  const initials = (s.name.trim() || 'Me').slice(0, 2).toUpperCase();

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingTop: Platform.OS === 'web' ? insets.top : 0 }}>
        <SheetHeader title="Profile" cancelLabel="Close" />
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <View style={{ alignItems: 'center', gap: space.md, paddingTop: space.md }}>
          <View style={[styles.avatar, { backgroundColor: c.surfaceAlt, borderColor: c.border }]}>
            <Text style={{ fontFamily: SERIF, fontSize: 38, lineHeight: 42 }} tone="muted">
              {initials}
            </Text>
          </View>
          <Text variant="title">{s.name.trim() || 'Welcome'}</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: space.md }}>
          <Stat label="Reminders done" value={tasksDone} />
          <Stat label="Habit check-ins" value={checkIns} />
          <Stat label="Day streak" value={n.streak} />
        </View>

        <Field label="Name" placeholder="Your first name" value={s.name} onChangeText={(name) => updateSettings({ name })} />

        <View style={{ gap: space.sm }}>
          <Label>You are a</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {PERSONAS.map((p) => (
              <Chip key={p.value} label={p.label} icon={p.icon} selected={s.persona === p.value} onPress={() => updateSettings({ persona: p.value })} />
            ))}
          </View>
          <Text variant="small" tone="muted">
            Only used to suggest habits and reminders. The app works the same for everyone.
          </Text>
        </View>

        <Card padded={false} style={{ paddingHorizontal: space.xl - 4 }}>
          <ListRow label="Suggested habits and reminders" onPress={() => router.push('/suggestions')} />
          <ListRow label="Your streak" last onPress={() => router.push('/streaks')} />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card style={{ flex: 1, alignItems: 'center', gap: 2, paddingHorizontal: space.sm }}>
      <Text style={{ fontFamily: SERIF, fontSize: 34, lineHeight: 38 }}>{value}</Text>
      <Text variant="small" tone="muted" style={{ fontSize: 12, textAlign: 'center' }}>
        {label}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.xl - 4, gap: space.xl, paddingBottom: space.xxl * 2, maxWidth: 640, width: '100%', alignSelf: 'center' },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});

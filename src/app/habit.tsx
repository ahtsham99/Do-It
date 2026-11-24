import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { useSheetTopInset } from '@/hooks/useTopInset';
import { ColorPicker, IconPicker } from '@/components/pickers';
import { Button, Card, Chip, Field, Glyph, IconButton, Label, Segmented, SheetHeader, Text, showDialog } from '@/components/ui';
import { HistoryGrid } from '@/features/habits/HistoryGrid';
import { HABIT_ICONS, habitStreak, streakLabel } from '@/features/habits/logic';
import { addHabit, deleteHabit, updateHabit } from '@/store/actions/habits';
import { useGoals, useSettings } from '@/store/hooks';
import { useStore } from '@/store/store';
import type { HabitFrequency } from '@/store/types';
import { SWATCHES, space, useTheme } from '@/theme';

export default function HabitEditor() {
  const { c, paint } = useTheme();
  const sheetTop = useSheetTopInset();
  const params = useLocalSearchParams<{ id?: string; name?: string; icon?: string }>();
  const existing = useStore((s) => s.habits.find((h) => h.id === params.id));
  const { weekStartsOn } = useSettings();

  const [name, setName] = useState(existing?.name ?? params.name ?? '');
  const [icon, setIcon] = useState<string>(existing?.icon ?? params.icon ?? '✅');
  const [color, setColor] = useState(existing?.color ?? SWATCHES[0]);
  const [frequency, setFrequency] = useState<HabitFrequency>(existing?.frequency ?? 'daily');
  const [timesPerWeek, setTimes] = useState(existing?.timesPerWeek ?? 3);
  const [perDay, setPerDay] = useState(existing?.perDay ?? 1);
  const goals = useGoals().filter((g) => !g.completedAt);
  const [goalId, setGoalId] = useState<string | null>(existing?.goalId ?? null);

  const canSave = name.trim().length > 0;
  const close = () => (router.canGoBack() ? router.back() : router.replace('/habits'));
  const save = () => {
    if (!canSave) return;
    const data = { name: name.trim(), icon, color, frequency, timesPerWeek: frequency === 'weekly' ? timesPerWeek : 1, perDay: frequency === 'daily' ? perDay : 1, goalId };
    if (existing) updateHabit(existing.id, data);
    else addHabit(data);
    close();
  };

  const streak = existing ? habitStreak(existing, undefined, weekStartsOn) : 0;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingTop: sheetTop }}>
        <SheetHeader title={existing ? 'Habit' : 'New habit'} onSave={save} canSave={canSave} />
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: space.lg, gap: space.xl, paddingBottom: space.xxl * 2, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <View style={{ width: 58, height: 58, borderRadius: 29, borderWidth: 3, borderColor: paint(color), backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Glyph value={icon} size={26} color={paint(color)} />
          </View>
          <View style={{ flex: 1 }}>
            <Field placeholder="e.g. Read 20 pages" value={name} onChangeText={setName} autoFocus={!existing} />
          </View>
        </View>

        {existing && (
          <Card style={{ gap: space.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Stat label="Current streak" value={streakLabel(existing, streak)} />
              <Stat label="Total" value={`${existing.history.length}×`} />
            </View>
            <HistoryGrid habit={existing} weekStartsOn={weekStartsOn} />
          </Card>
        )}

        <View style={{ gap: space.sm }}>
          <Label>How often</Label>
          <Segmented
            options={[
              { value: 'daily', label: 'Every day' },
              { value: 'weekly', label: 'Times per week' },
            ]}
            value={frequency}
            onChange={setFrequency}
          />
          {frequency === 'daily' && (
            <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text>Times a day</Text>
                <Text variant="small" tone="muted">
                  {perDay === 1 ? 'Once is enough' : `Tap the ring ${perDay} times, e.g. glasses of water`}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <IconButton icon="remove" label="Fewer" size={18} onPress={() => setPerDay(Math.max(1, perDay - 1))} />
                <Text variant="heading" style={{ minWidth: 22, textAlign: 'center' }}>
                  {perDay}
                </Text>
                <IconButton icon="add" label="More" size={18} onPress={() => setPerDay(Math.min(30, perDay + 1))} />
              </View>
            </Card>
          )}
          {frequency === 'weekly' && (
            <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text>Target per week</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <IconButton icon="remove" label="Fewer" size={18} onPress={() => setTimes(Math.max(1, timesPerWeek - 1))} />
                <Text variant="heading" style={{ minWidth: 20, textAlign: 'center' }}>
                  {timesPerWeek}
                </Text>
                <IconButton icon="add" label="More" size={18} onPress={() => setTimes(Math.min(7, timesPerWeek + 1))} />
              </View>
            </Card>
          )}
        </View>

        {goals.length > 0 && (
          <View style={{ gap: space.sm }}>
            <Label>Helps with a goal</Label>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              <Chip label="None" selected={!goalId} onPress={() => setGoalId(null)} />
              {goals.map((g) => (
                <Chip key={g.id} label={`${g.icon}  ${g.title}`} selected={goalId === g.id} onPress={() => setGoalId(g.id)} />
              ))}
            </View>
          </View>
        )}

        <View style={{ gap: space.sm }}>
          <Label>Colour</Label>
          <ColorPicker colors={SWATCHES} value={color} onChange={setColor} />
        </View>
        <View style={{ gap: space.sm }}>
          <Label>Icon</Label>
          <IconPicker icons={HABIT_ICONS} value={icon} color={paint(color)} onChange={setIcon} />
        </View>

        <Button label={existing ? 'Save changes' : 'Add habit'} onPress={save} disabled={!canSave} />
        {existing && (
          <Button
            kind="secondary"
            icon="timer-outline"
            label="Start a focus session for this"
            onPress={() => {
              close();
              router.push({ pathname: '/focus', params: { habitId: existing.id } });
            }}
          />
        )}
        {existing && (
          <Button
            kind="danger"
            icon="trash-outline"
            label="Delete habit"
            onPress={() =>
              showDialog({
                title: 'Delete habit?',
                message: `“${existing.name}” and its history will be removed.`,
                actions: [{ label: 'Delete', destructive: true, onPress: () => (deleteHabit(existing.id), close()) }],
              })
            }
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text variant="caption" tone="muted" style={{ textTransform: 'uppercase' }}>
        {label}
      </Text>
      <Text variant="title">{value}</Text>
    </View>
  );
}

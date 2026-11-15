import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DateTimeField } from '@/components/pickers';
import { Button, Card, Chip, Field, Label, SheetHeader, Text, Toggle, showDialog } from '@/components/ui';
import { REMINDER_OPTIONS, REPEAT_LABELS } from '@/features/tasks/logic';
import { addDays, formatDay, todayKey, type DayKey } from '@/lib/dates';
import { addTask, deleteTask, skipOccurrence, updateTask } from '@/store/actions/tasks';
import { useSettings } from '@/store/hooks';
import { useStore } from '@/store/store';
import type { Repeat } from '@/store/types';
import { space, useTheme } from '@/theme';

const REPEATS = Object.keys(REPEAT_LABELS) as Repeat[];

export default function TaskEditor() {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string; date?: string; day?: string; title?: string }>();
  const existing = useStore((s) => s.tasks.find((t) => t.id === params.id));
  const { use24h, notificationsEnabled } = useSettings();

  const [title, setTitle] = useState(existing?.title ?? params.title ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [date, setDate] = useState<DayKey>(existing?.date ?? params.date ?? todayKey());
  const [time, setTime] = useState<string | null>(existing?.time ?? null);
  const [reminder, setReminder] = useState<number | null>(existing?.reminder ?? null);
  const [repeat, setRepeat] = useState<Repeat>(existing?.repeat ?? 'none');

  const canSave = title.trim().length > 0;
  const close = () => (router.canGoBack() ? router.back() : router.replace('/planner'));

  const save = () => {
    if (!canSave) return;
    const data = { title: title.trim(), notes: notes.trim() || undefined, date, time, reminder, repeat };
    if (existing) updateTask(existing.id, data);
    else addTask(data);
    close();
  };

  const remove = () => {
    if (!existing) return;
    const day = params.day ?? existing.date;
    if (existing.repeat !== 'none') {
      showDialog({ title: 'Delete repeating task', actions: [
        { label: `Delete only ${formatDay(day)}`, onPress: () => (skipOccurrence(existing, day), close()) },
        { label: 'Delete all occurrences', destructive: true, onPress: () => (deleteTask(existing.id), close()) },
      ] });
    } else {
      showDialog({
        title: 'Delete task?',
        message: `“${existing.title}” will be removed.`,
        actions: [{ label: 'Delete', destructive: true, onPress: () => (deleteTask(existing.id), close()) }],
      });
    }
  };

  const t = todayKey();
  const quickDates: { label: string; value: DayKey }[] = [
    { label: 'Today', value: t },
    { label: 'Tomorrow', value: addDays(t, 1) },
    { label: 'Next week', value: addDays(t, 7) },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingTop: Platform.OS === 'web' ? insets.top : 0 }}>
        <SheetHeader title={existing ? 'Edit task' : 'New task'} onSave={save} canSave={canSave} />
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: space.lg, gap: space.xl, paddingBottom: space.xxl * 2, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <Field
          placeholder="What needs doing?"
          value={title}
          onChangeText={setTitle}
          autoFocus={!existing}
          returnKeyType="done"
          onSubmitEditing={save}
          style={{ fontSize: 20, fontWeight: '600', minHeight: 58 }}
        />

        <View style={{ gap: space.sm }}>
          <Label>When</Label>
          <Card style={{ gap: space.md }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              {quickDates.map((q) => (
                <Chip key={q.label} label={q.label} selected={date === q.value} onPress={() => setDate(q.value)} />
              ))}
            </View>
            <Row label="Date">
              <DateTimeField mode="date" value={date} onChange={setDate} />
            </Row>
            <Row label="Time">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                {time && <DateTimeField mode="time" value={time} onChange={setTime} use24h={use24h} />}
                <Toggle value={time != null} onValueChange={(v) => setTime(v ? '09:00' : null)} />
              </View>
            </Row>
          </Card>
        </View>

        <View style={{ gap: space.sm }}>
          <Label>Remind me</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {REMINDER_OPTIONS.map((o) => (
              <Chip
                key={String(o.value)}
                label={o.label}
                icon={o.value == null ? undefined : 'notifications-outline'}
                selected={reminder === o.value}
                onPress={() => setReminder(o.value)}
              />
            ))}
          </View>
          {reminder != null && (
            <Text variant="small" tone="muted">
              {!time ? 'No time set — you’ll be reminded at 9am. ' : ''}
              {Platform.OS === 'web'
                ? 'In the web app, reminders appear as banners on the Today screen.'
                : !notificationsEnabled
                  ? 'Turn on notifications in Settings to get this reminder.'
                  : ''}
            </Text>
          )}
        </View>

        <View style={{ gap: space.sm }}>
          <Label>Repeat</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {REPEATS.map((r) => (
              <Chip key={r} label={REPEAT_LABELS[r]} selected={repeat === r} onPress={() => setRepeat(r)} />
            ))}
          </View>
        </View>

        <Field label="Notes" placeholder="Details, links, sub-steps…" value={notes} onChangeText={setNotes} multiline />

        <Button label={existing ? 'Save changes' : 'Add task'} onPress={save} disabled={!canSave} />
        {existing && <Button kind="danger" icon="trash-outline" label="Delete task" onPress={remove} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 40 }}>
      <Text>{label}</Text>
      {children}
    </View>
  );
}

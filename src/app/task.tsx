import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { useSheetTopInset } from '@/hooks/useTopInset';
import { ColorPicker, DateTimeField, PremiumColorDots } from '@/components/pickers';
import { Button, Card, Chip, Field, Icon, Label, Press, SheetHeader, Text, Toggle, showDialog } from '@/components/ui';
import { REMINDER_OPTIONS, REPEAT_LABELS } from '@/features/tasks/logic';
import { addDays, addMinutesToTime, formatDay, formatDuration, formatTime, todayKey, type DayKey } from '@/lib/dates';
import { addTask, deleteTask, skipOccurrence, updateTask } from '@/store/actions/tasks';
import { useSettings } from '@/store/hooks';
import { useStore } from '@/store/store';
import type { Repeat } from '@/store/types';
import { SWATCHES, space, useTheme } from '@/theme';

const REPEATS = Object.keys(REPEAT_LABELS) as Repeat[];

export default function TaskEditor() {
  const { c } = useTheme();
  const sheetTop = useSheetTopInset();
  const params = useLocalSearchParams<{ id?: string; date?: string; day?: string; title?: string; time?: string; duration?: string }>();
  const existing = useStore((s) => s.tasks.find((t) => t.id === params.id));
  const { use24h, notificationsEnabled } = useSettings();

  const [title, setTitle] = useState(existing?.title ?? params.title ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [date, setDate] = useState<DayKey>(existing?.date ?? params.date ?? todayKey());
  const [time, setTime] = useState<string | null>(existing?.time ?? params.time ?? null);
  const [duration, setDuration] = useState<number | null>(existing?.duration ?? (params.duration ? Number(params.duration) : null));
  const [reminder, setReminder] = useState<number | null>(existing?.reminder ?? (params.time ? 0 : null));
  const [repeat, setRepeat] = useState<Repeat>(existing?.repeat ?? 'none');
  const [color, setColor] = useState<string | null>(existing?.color ?? null);

  const canSave = title.trim().length > 0;
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const save = () => {
    if (!canSave) return;
    const data = { title: title.trim(), notes: notes.trim() || undefined, date, time, duration: time ? duration : null, reminder, repeat, color };
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
      <View style={{ paddingTop: sheetTop }}>
        <SheetHeader title={existing ? 'Edit plan' : 'Add to plan'} onSave={save} canSave={canSave} />
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: space.lg, gap: space.xl, paddingBottom: space.xxl * 2, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <Field
          placeholder="What’s the plan?"
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
                <Toggle
                  value={time != null}
                  onValueChange={(v) => {
                    setTime(v ? '09:00' : null);
                    // Forgetful by default: a timed reminder pings you at that time.
                    if (v && reminder == null && !existing) setReminder(0);
                  }}
                />
              </View>
            </Row>
            {time && (
              <View style={{ gap: space.sm }}>
                <Text variant="small" tone="muted">
                  How long?{duration ? ` · until ${formatTime(addMinutesToTime(time, duration), use24h)}` : ''}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                  {[null, 15, 30, 45, 60, 90, 120, 180].map((m) => (
                    <Chip key={String(m)} label={m ? formatDuration(m) : 'No end'} selected={duration === m} onPress={() => setDuration(m)} />
                  ))}
                </View>
              </View>
            )}
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
                ? 'In the web app, this shows on your main page when it’s time.'
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

        <View style={{ gap: space.sm }}>
          <Label>Colour</Label>
          <ColorPicker colors={SWATCHES} value={color ?? ''} onChange={setColor}>
            <PremiumColorDots value={color} onChange={setColor} />
            <Press
              onPress={() => setColor(null)}
              accessibilityLabel="No colour"
              accessibilityState={{ selected: !color }}
              style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2.5, padding: 3, borderColor: !color ? c.text : 'transparent' }}>
              <View style={{ flex: 1, borderRadius: 20, borderWidth: 1.5, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="ban-outline" size={18} color={c.textFaint} />
              </View>
            </Press>
          </ColorPicker>
        </View>

        <Field label="Notes" placeholder="Details, links, sub-steps…" value={notes} onChangeText={setNotes} multiline />

        <Button label={existing ? 'Save changes' : 'Add to plan'} onPress={save} disabled={!canSave} />
        {existing && (
          <Button
            kind="secondary"
            icon="timer-outline"
            label="Focus on this for 5 minutes"
            onPress={() => {
              close();
              router.push({ pathname: '/focus', params: { taskId: existing.id } });
            }}
          />
        )}
        {existing && <Button kind="danger" icon="trash-outline" label="Delete" onPress={remove} />}
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

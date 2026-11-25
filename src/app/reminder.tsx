import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { DateTimeField } from '@/components/pickers';
import { Button, Card, Chip, Field, Label, SheetHeader, Text, Toggle, showDialog } from '@/components/ui';
import { useSheetTopInset } from '@/hooks/useTopInset';
import { addDays, combine, timeFromDate, toKey, todayKey } from '@/lib/dates';
import { addReminder, deleteReminder, updateReminder } from '@/store/actions/reminders';
import { useLists, useSettings } from '@/store/hooks';
import { useStore } from '@/store/store';
import { INBOX_LIST } from '@/store/types';
import { space, useTheme } from '@/theme';

/** Add or edit a single reminder. */
export default function ReminderEditor() {
  const { c } = useTheme();
  const sheetTop = useSheetTopInset();
  const params = useLocalSearchParams<{ id?: string; listId?: string }>();
  const existing = useStore((s) => s.reminders.find((r) => r.id === params.id && !r.deletedAt));
  const lists = useLists();
  const { use24h } = useSettings();

  const initialAt = existing?.remindAt ? new Date(existing.remindAt) : null;
  const [title, setTitle] = useState(existing?.title ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [listId, setListId] = useState(existing?.listId ?? params.listId ?? INBOX_LIST);
  const [remind, setRemind] = useState(!!initialAt);
  const [date, setDate] = useState(initialAt ? toKey(initialAt) : todayKey());
  const [time, setTime] = useState(initialAt ? timeFromDate(initialAt) : '09:00');

  const listName = lists.find((l) => l.id === listId)?.name ?? '';
  const placeholder = /grocer|shop|food|market/i.test(listName) ? 'Add an item' : 'Add a reminder';
  const canSave = title.trim().length > 0;
  const close = () => (router.canGoBack() ? router.back() : router.replace('/reminders'));
  const save = () => {
    if (!canSave) return;
    const remindAt = remind ? combine(date, time).getTime() : null;
    const data = { title: title.trim(), notes: notes.trim() || undefined, listId, remindAt };
    if (existing) updateReminder(existing.id, { ...data, snoozedUntil: null });
    else addReminder(data);
    close();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingTop: sheetTop }}>
        <SheetHeader title={existing ? 'Reminder' : 'New reminder'} onSave={save} canSave={canSave} />
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: space.lg, gap: space.xl, paddingBottom: space.xxl * 2, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <Field placeholder={placeholder} value={title} onChangeText={setTitle} autoFocus={!existing} returnKeyType="done" onSubmitEditing={save} style={{ fontSize: 20, fontWeight: '600', minHeight: 58 }} />

        <View style={{ gap: space.sm }}>
          <Label>List</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {lists.map((l) => (
              <Chip key={l.id} label={`${l.icon}  ${l.name}`} selected={listId === l.id} onPress={() => setListId(l.id)} />
            ))}
          </View>
        </View>

        <Card style={{ gap: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text>Remind me</Text>
              <Text variant="small" tone="muted">
                {Platform.OS === 'web' ? 'Shows on your main page when it’s time' : 'A notification at this time'}
              </Text>
            </View>
            <Toggle value={remind} onValueChange={setRemind} />
          </View>
          {remind && (
            <>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                <Chip label="Later today" selected={date === todayKey() && time === '18:00'} onPress={() => (setDate(todayKey()), setTime('18:00'))} />
                <Chip label="Tomorrow 9am" selected={date === addDays(todayKey(), 1) && time === '09:00'} onPress={() => (setDate(addDays(todayKey(), 1)), setTime('09:00'))} />
                <Chip label="In a week" selected={date === addDays(todayKey(), 7)} onPress={() => setDate(addDays(todayKey(), 7))} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <DateTimeField mode="date" value={date} onChange={setDate} />
                <DateTimeField mode="time" value={time} onChange={setTime} use24h={use24h} />
              </View>
            </>
          )}
        </Card>

        <Field label="Notes" placeholder="Phone number, details…" value={notes} onChangeText={setNotes} multiline />

        <Button label={existing ? 'Save' : 'Add reminder'} onPress={save} disabled={!canSave} />
        {existing && (
          <Button
            kind="danger"
            icon="trash-outline"
            label="Delete"
            onPress={() =>
              showDialog({
                title: 'Delete reminder?',
                message: `“${existing.title}”`,
                actions: [{ label: 'Delete', destructive: true, onPress: () => (deleteReminder(existing.id), close()) }],
              })
            }
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import { useState, type ReactNode } from 'react';
import { Platform, ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';

import { DateTimeField } from '@/components/pickers';
import { Button, Card, Chip, Field, Label, Text, showDialog, showToast } from '@/components/ui';
import { addDays, combine, timeFromDate, toKey, todayKey } from '@/lib/dates';
import { addReminder, deleteReminder, updateReminder } from '@/store/actions/reminders';
import { useLists, useSettings } from '@/store/hooks';
import { INBOX_LIST, type ReminderItem } from '@/store/types';
import { space } from '@/theme';

import { parseReminder } from './logic';

/** 6pm today, or 9am tomorrow if it's already late in the day. */
function laterToday() {
  const h = new Date().getHours();
  return h < 17 ? { date: todayKey(), time: '18:00' } : { date: addDays(todayKey(), 1), time: '09:00' };
}

export const isShoppingList = (name: string) => /grocer|shop|food|market/i.test(name);

/**
 * The reminder form (title, list, remind me, notes), used both in the slide-up
 * sheet and the full-screen editor. Typing a day/time in the title
 * ("Call Uber tomorrow 9am") sets the alert if you haven't set one.
 */
export function ReminderForm({
  existing,
  defaultListId = INBOX_LIST,
  onDone,
  header,
  contentStyle,
}: {
  existing?: ReminderItem;
  defaultListId?: string;
  onDone: () => void;
  /** Header above the scrolling form, given the save action (e.g. Cancel · Title · Save). */
  header: (save: () => void, canSave: boolean) => ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const lists = useLists();
  const { use24h } = useSettings();
  const initialAt = existing?.remindAt ? new Date(existing.remindAt) : null;
  const nameOf = (id: string) => lists.find((l) => l.id === id)?.name ?? '';
  // New reminders start with an alert "later today" (or tomorrow morning in the
  // evening); shopping lists start with no alert.
  const later = laterToday();
  const startList = existing?.listId ?? defaultListId;
  const [title, setTitle] = useState(existing?.title ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [listId, setListIdState] = useState(startList);
  const [remind, setRemind] = useState(existing ? !!initialAt : !isShoppingList(nameOf(startList)));
  const [date, setDate] = useState(initialAt ? toKey(initialAt) : later.date);
  const [time, setTime] = useState(initialAt ? timeFromDate(initialAt) : later.time);
  // Once you pick a time yourself, typed times in the title no longer override it.
  const [touched, setTouched] = useState(!!existing);
  const pickTime = (d: string, t: string) => {
    setRemind(true);
    setDate(d);
    setTime(t);
    setTouched(true);
  };
  const setListId = (id: string) => {
    setListIdState(id);
    if (!touched && !existing) setRemind(!isShoppingList(nameOf(id)));
  };

  const listName = nameOf(listId);
  const shopping = isShoppingList(listName);
  const canSave = title.trim().length > 0;

  const save = (keepOpen = false) => {
    if (!canSave) return;
    // "dentist tomorrow 9am" in the title → alert, unless one was set by hand.
    const parsed = !touched && !existing ? parseReminder(title) : null;
    const remindAt = parsed?.remindAt ?? (remind ? combine(date, time).getTime() : null);
    const data = { title: (parsed?.remindAt ? parsed.title : title).trim(), notes: notes.trim() || undefined, listId, remindAt };
    if (existing) updateReminder(existing.id, { ...data, snoozedUntil: null });
    else addReminder(data);
    if (keepOpen) {
      // Shopping lists: add the next item straight away.
      setTitle('');
      setNotes('');
      showToast(`Added “${data.title}”`, 'checkmark-circle');
      return;
    }
    onDone();
  };
  return (
    <>
    {header(() => save(false), canSave)}
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={contentStyle}>
    <View style={{ gap: space.lg }}>
      <Field
        placeholder={shopping ? 'Add an item' : 'Add a reminder'}
        value={title}
        onChangeText={setTitle}
        autoFocus={!existing}
        returnKeyType={shopping && !existing ? 'next' : 'done'}
        submitBehavior={shopping && !existing ? 'submit' : 'blurAndSubmit'}
        blurOnSubmit={!(shopping && !existing)}
        onSubmitEditing={() => save(shopping && !existing)}
        style={{ fontSize: 20, fontWeight: '600', minHeight: 56 }}
      />

      {lists.length > 1 && (
        <View style={{ gap: space.sm }}>
          <Label>List</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {lists.map((l) => (
              <Chip key={l.id} label={`${l.icon}  ${l.name}`} selected={listId === l.id} onPress={() => setListId(l.id)} />
            ))}
          </View>
        </View>
      )}

      <Card style={{ gap: space.md }}>
        <View>
          <Text>Remind me</Text>
          <Text variant="small" tone="muted">
            {Platform.OS === 'web' ? 'Shows on your main page when it’s time' : 'A notification at this time'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          <Chip label="No alert" selected={!remind} onPress={() => (setRemind(false), setTouched(true))} />
          <Chip label={later.date === todayKey() ? 'Later today' : 'Tomorrow 9am'} selected={remind && date === later.date && time === later.time} onPress={() => pickTime(later.date, later.time)} />
          {later.date === todayKey() && (
            <Chip label="Tomorrow 9am" selected={remind && date === addDays(todayKey(), 1) && time === '09:00'} onPress={() => pickTime(addDays(todayKey(), 1), '09:00')} />
          )}
          <Chip label="In a week" selected={remind && date === addDays(todayKey(), 7)} onPress={() => pickTime(addDays(todayKey(), 7), time)} />
        </View>
        {remind && (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <DateTimeField mode="date" value={date} onChange={(d) => pickTime(d, time)} />
            <DateTimeField mode="time" value={time} onChange={(t) => pickTime(date, t)} use24h={use24h} />
          </View>
        )}
      </Card>

      <Field label="Notes" placeholder="Phone number, details…" value={notes} onChangeText={setNotes} multiline />

      <Button label={existing ? 'Save' : shopping ? 'Add item' : 'Add reminder'} onPress={() => save(false)} disabled={!canSave} />
      {existing && (
        <Button
          kind="danger"
          icon="trash-outline"
          label="Delete"
          onPress={() =>
            showDialog({
              title: 'Delete reminder?',
              message: `“${existing.title}”`,
              actions: [{ label: 'Delete', destructive: true, onPress: () => (deleteReminder(existing.id), onDone()) }],
            })
          }
        />
      )}
    </View>
    </ScrollView>
    </>
  );
}

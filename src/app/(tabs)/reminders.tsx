import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Card, Empty, Fab, Icon, Press, Screen, Section, Text, showDialog, showToast } from '@/components/ui';
import { ReminderSheet } from '@/features/reminders/ReminderSheet';
import { ReminderRow } from '@/features/reminders/ReminderRow';
import { addList, clearDone, deleteList, restoreReminders } from '@/store/actions/reminders';
import { useLists, useReminders } from '@/store/hooks';
import { recall, remember } from '@/lib/uiMemory';
import { INBOX_LIST, type ReminderItem } from '@/store/types';
import { font, radius, space, useTheme } from '@/theme';
import { t } from '@/lib/i18n';


/** Things to remember — not your schedule. Lists like Reminders and Groceries. */
export default function RemindersScreen() {
  const { c, fonts } = useTheme();
  const lists = useLists();
  const items = useReminders();
  const [listId, setListState] = useState(() => recall('reminders.list', INBOX_LIST));
  const [showDone, setShowDone] = useState(false);
  const [newList, setNewList] = useState<string | null>(null);
  const [sheet, setSheet] = useState<{ open: boolean; item?: ReminderItem }>({ open: false });
  const setList = (id: string) => {
    remember('reminders.list', id);
    setListState(id);
  };

  const current = lists.find((l) => l.id === listId);
  // Reminders is the main list; fall back to it if a list was deleted.
  const activeId = current ? current.id : INBOX_LIST;
  const inList = items.filter((r) => r.listId === activeId);
  // Alerts first (soonest first), then the rest in the order added.
  const open = inList
    .filter((r) => !r.done)
    .sort((a, b) => (a.remindAt && b.remindAt ? a.remindAt - b.remindAt : a.remindAt ? -1 : b.remindAt ? 1 : a.createdAt - b.createdAt));
  const done = inList.filter((r) => r.done).sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0));
  const counts = (id: string) => items.filter((r) => !r.done && r.listId === id).length;

  const createList = () => {
    const name = newList?.trim();
    if (!name) return setNewList(null);
    const l = addList(name);
    setNewList(null);
    setList(l.id);
  };

  const listOptions = () => {
    if (!current || current.id === INBOX_LIST) return;
    showDialog({
      title: current.name,
      actions: [
        {
          label: t('Delete this list'),
          destructive: true,
          onPress: () =>
            showDialog({
              title: t('Delete “{name}”?', { name: current.name }),
              message: t('The list and everything in it will be removed.'),
              actions: [{ label: t('Delete list'), destructive: true, onPress: () => (deleteList(current.id), setList(INBOX_LIST)) }],
            }),
        },
      ],
    });
  };

  const clear = () => {
    const ids = clearDone(activeId);
    showToast(t('Cleared {n} done', { n: ids.length }), 'checkmark-done-outline', { label: t('Undo'), onPress: () => restoreReminders(ids) });
  };

  const addTo = activeId;
  const isShopping = /grocer|shop|food|market/i.test(current?.name ?? '');

  return (
    <>
    <ReminderSheet visible={sheet.open} existing={sheet.item} defaultListId={addTo} onClose={() => setSheet({ open: false })} />
    <Screen
      title={t('Reminders')}
      subtitle={open.length ? t('{n} to remember', { n: open.length }) : t('Nothing to remember')}
>
      {/* Lists */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm, paddingRight: space.lg }} style={{ marginHorizontal: -2 }}>
        {lists.map((l) => {
          const on = l.id === activeId;
          const n = counts(l.id);
          return (
            <Press
              key={l.id}
              onPress={() => (on && l.id !== INBOX_LIST ? listOptions() : setList(l.id))}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              style={[styles.list, { backgroundColor: on ? c.accent : c.surface, borderColor: on ? c.accent : c.border }]}>
              {l.icon ? <Text style={{ fontSize: 14 }}>{l.icon}</Text> : null}
              <Text variant="small" color={on ? c.accentText : c.text} style={{ fontWeight: '600' }}>
                {t(l.name)}
              </Text>
              {n > 0 && (
                <Text variant="small" color={on ? c.accentText : c.textMuted} style={{ opacity: 0.75 }}>
                  {n}
                </Text>
              )}
            </Press>
          );
        })}
        {newList === null ? (
          <Press onPress={() => setNewList('')} accessibilityLabel={t('New list')} style={[styles.list, { borderColor: c.border, borderStyle: 'dashed' }]}>
            <Icon name="add" size={15} color={c.textMuted} />
            <Text variant="small" tone="muted" style={{ fontWeight: '600' }}>
              {t('New list')}
            </Text>
          </Press>
        ) : (
          <View style={[styles.list, { borderColor: c.accent, paddingRight: 4 }]}>
            <TextInput
              autoFocus
              value={newList}
              onChangeText={setNewList}
              onSubmitEditing={createList}
              onBlur={createList}
              placeholder={t('List name')}
              placeholderTextColor={c.textFaint}
              style={[font.small, { width: 120, color: c.text, fontFamily: fonts.text(500), outlineStyle: 'none' } as object]}
            />
          </View>
        )}
      </ScrollView>

      {/* Tap to open the add sheet: type and set everything in one go. */}
      <Press onPress={() => setSheet({ open: true })} accessibilityRole="button" accessibilityLabel={isShopping ? t('Add an item') : t('Add a reminder')} style={[styles.addField, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Icon name="add" size={22} color={c.textFaint} />
        <Text tone="faint" style={{ fontSize: 16 }}>
          {isShopping ? t('Add an item') : t('Add a reminder')}
        </Text>
      </Press>

      {open.length === 0 && done.length === 0 ? (
        <Empty
          icon={isShopping ? 'cart-outline' : 'notifications-outline'}
          title={isShopping ? t('The list is empty') : t('Nothing to remember')}
          body={isShopping ? t('Add items as you think of them. Tick them off in the shop.') : t('Add anything you don’t want to forget. Add a day or time to get an alert.')}
        />
      ) : (
        open.length > 0 && (
          <Card padded={false} style={{ paddingHorizontal: space.lg, overflow: 'hidden' }}>
            {open.map((r, i) => (
              <ReminderRow key={r.id} item={r} last={i === open.length - 1} onOpen={(item) => setSheet({ open: true, item })} />
            ))}
          </Card>
        )
      )}

      {done.length > 0 && (
        <Section
          title={t('Done · {n}', { n: done.length })}
          right={
            <View style={{ flexDirection: 'row', gap: space.lg }}>
              <Press onPress={() => setShowDone(!showDone)} hitSlop={8}>
                <Text variant="small" tone="muted">
                  {showDone ? t('Hide') : t('Show')}
                </Text>
              </Press>
              <Press onPress={clear} hitSlop={8}>
                <Text variant="small" color={c.accent} style={{ fontWeight: '600' }}>
                  {t('Clear')}
                </Text>
              </Press>
            </View>
          }>
          {showDone && (
            <Card padded={false} style={{ paddingHorizontal: space.lg, overflow: 'hidden' }}>
              {done.map((r, i) => (
                <ReminderRow key={r.id} item={r} last={i === done.length - 1} onOpen={(item) => setSheet({ open: true, item })} />
              ))}
            </Card>
          )}
        </Section>
      )}
    </Screen>
    {/* Within thumb reach, just above the tab bar. */}
    <Fab label={isShopping ? t('Add an item') : t('Add a reminder')} onPress={() => setSheet({ open: true })} />
    </>
  );
}

const styles = StyleSheet.create({
  addField: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.md, height: 52, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth },
  list: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1 },
});

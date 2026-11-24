import { todayKey } from '@/lib/dates';
import { uid } from '@/lib/id';

import { markActive } from './stats';
import { getState, setState } from '../store';
import { INBOX_LIST, type ReminderItem, type ReminderList } from '../types';

export function addReminder(input: { title: string; listId?: string; remindAt?: number | null; notes?: string }): ReminderItem {
  const now = Date.now();
  const item: ReminderItem = {
    id: uid('r_'),
    createdAt: now,
    updatedAt: now,
    listId: input.listId ?? INBOX_LIST,
    title: input.title.trim(),
    notes: input.notes,
    done: false,
    remindAt: input.remindAt ?? null,
  };
  setState((s) => ({ reminders: [...s.reminders, item] }));
  return item;
}

export function updateReminder(id: string, patch: Partial<ReminderItem>) {
  setState((s) => ({ reminders: s.reminders.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: Date.now() } : r)) }));
}

export function toggleReminder(item: ReminderItem) {
  const done = !item.done;
  updateReminder(item.id, { done, doneAt: done ? Date.now() : null, snoozedUntil: null });
  if (done) markActive(todayKey());
  return done;
}

export function deleteReminder(id: string) {
  updateReminder(id, { deletedAt: Date.now() });
}

export function snoozeReminder(id: string, minutes: number) {
  updateReminder(id, { snoozedUntil: Date.now() + minutes * 60_000 });
}

/** Remove ticked items from a list (or every list). Returns their ids for undo. */
export function clearDone(listId?: string): string[] {
  const ids = getState()
    .reminders.filter((r) => r.done && !r.deletedAt && (!listId || r.listId === listId))
    .map((r) => r.id);
  const set = new Set(ids);
  const now = Date.now();
  setState((s) => ({ reminders: s.reminders.map((r) => (set.has(r.id) ? { ...r, deletedAt: now, updatedAt: now } : r)) }));
  return ids;
}

export function restoreReminders(ids: string[]) {
  const set = new Set(ids);
  setState((s) => ({ reminders: s.reminders.map((r) => (set.has(r.id) ? { ...r, deletedAt: null, updatedAt: Date.now() } : r)) }));
}

export function addList(name: string, icon = '📝'): ReminderList {
  const now = Date.now();
  const list: ReminderList = { id: uid('l_'), name: name.trim(), icon, createdAt: now, updatedAt: now };
  setState((s) => ({ lists: [...s.lists, list] }));
  return list;
}

/** Delete a list and its items (the main Reminders list can't be deleted). */
export function deleteList(id: string) {
  if (id === INBOX_LIST) return;
  const now = Date.now();
  setState((s) => ({
    lists: s.lists.map((l) => (l.id === id ? { ...l, deletedAt: now, updatedAt: now } : l)),
    reminders: s.reminders.map((r) => (r.listId === id && !r.deletedAt ? { ...r, deletedAt: now, updatedAt: now } : r)),
  }));
}

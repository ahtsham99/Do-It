import { todayKey } from '@/lib/dates';
import { uid } from '@/lib/id';
import { addGoal } from '@/store/actions/goals';
import { addHabit } from '@/store/actions/habits';
import { addTask } from '@/store/actions/tasks';
import { getState } from '@/store/store';

import type { Suggestion } from './suggestions';

/** Adds chosen suggestions, skipping anything that already exists by name. */
export function applySuggestions(list: Suggestion[]) {
  const { tasks, habits, goals } = getState();
  const goalTitles = new Set(goals.filter((g) => !g.deletedAt).map((g) => g.title.toLowerCase()));
  const taskTitles = new Set(tasks.filter((t) => !t.deletedAt).map((t) => t.title.toLowerCase()));
  const habitNames = new Set(habits.filter((h) => !h.deletedAt).map((h) => h.name.toLowerCase()));
  let added = 0;
  for (const s of list) {
    if (s.kind === 'task' && !taskTitles.has(s.title.toLowerCase())) {
      addTask({ title: s.title, date: todayKey(), repeat: s.repeat, time: s.time ?? null, reminder: s.time ? 0 : null });
      added++;
    } else if (s.kind === 'habit' && !habitNames.has(s.name.toLowerCase())) {
      addHabit({ name: s.name, icon: s.icon, color: s.color, frequency: s.frequency, timesPerWeek: s.timesPerWeek ?? 1 });
      added++;
    } else if (s.kind === 'goal' && !goalTitles.has(s.title.toLowerCase())) {
      addGoal({ title: s.title, icon: s.icon, color: s.color, kind: 'steps', targetDate: null, steps: s.steps.map((title) => ({ id: uid('st_'), title, doneAt: null })) });
      added++;
    }
  }
  return added;
}

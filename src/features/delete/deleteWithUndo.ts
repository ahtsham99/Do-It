import { showDialog, showToast } from '@/components/ui';
import { formatDay, type DayKey } from '@/lib/dates';
import { deleteCountdown, updateCountdown } from '@/store/actions/countdowns';
import { deleteGoal, restoreGoal } from '@/store/actions/goals';
import { deleteHabit, updateHabit } from '@/store/actions/habits';
import { deleteTask, skipOccurrence, updateTask } from '@/store/actions/tasks';
import { getState } from '@/store/store';
import type { Countdown, Goal, Habit, Task } from '@/store/types';

// Every delete is a soft delete, so undo just clears deletedAt.
const undoToast = (title: string, undo: () => void) =>
  showToast(`Deleted “${title.length > 28 ? `${title.slice(0, 27)}…` : title}”`, 'trash-outline', { label: 'Undo', onPress: undo });

export function deleteGoalWithUndo(goal: Goal) {
  const habitIds = deleteGoal(goal.id);
  undoToast(goal.title, () => restoreGoal(goal.id, habitIds));
}

export function deleteHabitWithUndo(habit: Habit) {
  deleteHabit(habit.id);
  undoToast(habit.name, () => updateHabit(habit.id, { deletedAt: null }));
}

export function deleteCountdownWithUndo(item: Countdown) {
  deleteCountdown(item.id);
  undoToast(item.title, () => updateCountdown(item.id, { deletedAt: null }));
}

/** One-off reminders delete straight away; repeating ones ask "this day or all?". */
export function deleteTaskWithUndo(task: Task, day: DayKey) {
  if (task.repeat === 'none') {
    deleteTask(task.id);
    undoToast(task.title, () => updateTask(task.id, { deletedAt: null }));
    return;
  }
  showDialog({
    title: 'Delete repeating plan',
    message: `“${task.title}”`,
    actions: [
      {
        label: `Only ${formatDay(day)}`,
        onPress: () => {
          skipOccurrence(task, day);
          undoToast(task.title, () => {
            const t = getState().tasks.find((x) => x.id === task.id);
            if (t) updateTask(t.id, { skippedDates: (t.skippedDates ?? []).filter((d) => d !== day) });
          });
        },
      },
      {
        label: 'Every time',
        destructive: true,
        onPress: () => {
          deleteTask(task.id);
          undoToast(task.title, () => updateTask(task.id, { deletedAt: null }));
        },
      },
    ],
  });
}

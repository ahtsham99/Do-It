import { showToast } from '@/components/ui';
import { occurrencesOn } from '@/features/tasks/logic';
import { todayKey } from '@/lib/dates';
import { toggleTask } from '@/store/actions/tasks';
import { getState } from '@/store/store';
import type { Task } from '@/store/types';

import { randomLine } from './messages';

/** Toggle a task and cheer (or tease) when it gets done. */
export function completeTask(task: Task, day: string) {
  const nowDone = toggleTask(task, day);
  if (!nowDone) return;
  const { tasks, settings } = getState();
  const today = todayKey();
  const remaining = occurrencesOn(tasks.filter((t) => !t.deletedAt), today).filter((o) => !o.done).length;
  if (day === today && remaining === 0) showToast(randomLine('allDone', settings.tone), 'trophy');
  else showToast(randomLine('done', settings.tone));
}

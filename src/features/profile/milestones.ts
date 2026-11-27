export interface Totals {
  plansDone: number;
  checkIns: number;
  focusMin: number;
  remindersDone: number;
  bestStreak: number;
  goalsDone: number;
}

export interface Milestone {
  id: string;
  icon: string;
  label: string;
  tint: string;
  done: boolean;
  /** 0–1 towards it. */
  progress: number;
}

const M: { id: string; icon: string; label: string; tint: string; value: (t: Totals) => number; target: number }[] = [
  { id: 'plan1', icon: '🌱', label: 'First plan done', tint: '#E3EEE6', value: (t) => t.plansDone, target: 1 },
  { id: 'check1', icon: '✅', label: 'First check-in', tint: '#E1EEE7', value: (t) => t.checkIns, target: 1 },
  { id: 'focus1', icon: '⏱️', label: 'First focus', tint: '#E3E7FB', value: (t) => t.focusMin, target: 5 },
  { id: 'streak7', icon: '🔥', label: '7-day streak', tint: '#FBE7DD', value: (t) => t.bestStreak, target: 7 },
  { id: 'plans50', icon: '📋', label: '50 plans done', tint: '#EDE7F7', value: (t) => t.plansDone, target: 50 },
  { id: 'check100', icon: '💯', label: '100 check-ins', tint: '#F6ECD8', value: (t) => t.checkIns, target: 100 },
  { id: 'focus10h', icon: '🧠', label: '10 hours focused', tint: '#E0EEF6', value: (t) => t.focusMin, target: 600 },
  { id: 'rem25', icon: '🔔', label: '25 reminders done', tint: '#F7E3E8', value: (t) => t.remindersDone, target: 25 },
  { id: 'goal1', icon: '🏁', label: 'First goal reached', tint: '#E6EFDF', value: (t) => t.goalsDone, target: 1 },
  { id: 'streak30', icon: '🏔️', label: '30-day streak', tint: '#E5ECF2', value: (t) => t.bestStreak, target: 30 },
  { id: 'check500', icon: '🌳', label: '500 check-ins', tint: '#E3EEE6', value: (t) => t.checkIns, target: 500 },
  { id: 'focus50h', icon: '🚀', label: '50 hours focused', tint: '#EAE6F8', value: (t) => t.focusMin, target: 3000 },
];

/** Earned first, then the closest ones still to go. */
export function milestones(t: Totals): Milestone[] {
  const all = M.map((m) => {
    const v = m.value(t);
    return { id: m.id, icon: m.icon, label: m.label, tint: m.tint, done: v >= m.target, progress: Math.min(1, v / m.target) };
  });
  return [...all.filter((m) => m.done), ...all.filter((m) => !m.done).sort((a, b) => b.progress - a.progress)];
}

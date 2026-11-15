import type { IconName } from '@/components/ui';
import type { HabitFrequency, Persona, Repeat } from '@/store/types';

/**
 * Persona only drives *suggestions*. It never changes navigation or features.
 */
export interface TaskSuggestion {
  kind: 'task';
  title: string;
  repeat: Repeat;
  time?: string;
}
export interface HabitSuggestion {
  kind: 'habit';
  name: string;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  timesPerWeek?: number;
}
export type Suggestion = TaskSuggestion | HabitSuggestion;

export const PERSONAS: { value: Persona; label: string; icon: IconName; blurb: string }[] = [
  { value: 'student', label: 'Student', icon: 'school-outline', blurb: 'Classes, assignments, exams' },
  { value: 'professional', label: 'Professional', icon: 'briefcase-outline', blurb: 'Work, meetings, deadlines' },
  { value: 'athlete', label: 'Athlete', icon: 'barbell-outline', blurb: 'Training, recovery, competitions' },
  { value: 'other', label: 'Something else', icon: 'sparkles-outline', blurb: 'Life admin, side projects, me' },
];

const COMMON: Suggestion[] = [
  { kind: 'habit', name: 'Drink 2L of water', icon: '💧', color: '#4A6B8A', frequency: 'daily' },
  { kind: 'habit', name: 'No phone in bed', icon: '📵', color: '#22201D', frequency: 'daily' },
];

export const SUGGESTIONS: Record<Persona, Suggestion[]> = {
  student: [
    { kind: 'task', title: 'Review today’s lecture notes', repeat: 'weekdays', time: '18:00' },
    { kind: 'task', title: 'Check assignment deadlines', repeat: 'weekly' },
    { kind: 'task', title: 'Pack bag for tomorrow', repeat: 'weekdays', time: '21:00' },
    { kind: 'habit', name: 'Study 1 focused hour', icon: '📖', color: '#7A5C8E', frequency: 'daily' },
    { kind: 'habit', name: 'Read 20 pages', icon: '📚', color: '#8A5A44', frequency: 'daily' },
    { kind: 'habit', name: 'Exercise', icon: '🏃', color: '#2F4F40', frequency: 'weekly', timesPerWeek: 3 },
    ...COMMON,
  ],
  professional: [
    { kind: 'task', title: 'Clear inbox to zero', repeat: 'weekdays', time: '09:00' },
    { kind: 'task', title: 'Plan the week’s priorities', repeat: 'weekly', time: '08:30' },
    { kind: 'task', title: 'Update project status', repeat: 'weekly', time: '16:00' },
    { kind: 'habit', name: 'Deep work block', icon: '💻', color: '#4A6B8A', frequency: 'daily' },
    { kind: 'habit', name: 'Take a walk at lunch', icon: '🏃', color: '#2F4F40', frequency: 'daily' },
    { kind: 'habit', name: 'Gym', icon: '🏋️', color: '#A8554B', frequency: 'weekly', timesPerWeek: 3 },
    ...COMMON,
  ],
  athlete: [
    { kind: 'task', title: 'Log today’s training', repeat: 'daily', time: '20:00' },
    { kind: 'task', title: 'Meal prep', repeat: 'weekly', time: '17:00' },
    { kind: 'task', title: 'Plan next week’s sessions', repeat: 'weekly' },
    { kind: 'habit', name: 'Stretch / mobility 10 min', icon: '🧘', color: '#3F7C7A', frequency: 'daily' },
    { kind: 'habit', name: 'Sleep 8 hours', icon: '😴', color: '#22201D', frequency: 'daily' },
    { kind: 'habit', name: 'Hit protein target', icon: '🥗', color: '#B5873A', frequency: 'daily' },
    { kind: 'habit', name: 'Recovery session', icon: '❤️', color: '#A8554B', frequency: 'weekly', timesPerWeek: 2 },
    ...COMMON.slice(0, 1),
  ],
  other: [
    { kind: 'task', title: 'Tidy up for 10 minutes', repeat: 'daily', time: '19:00' },
    { kind: 'task', title: 'Pay bills / life admin', repeat: 'monthly' },
    { kind: 'task', title: 'Call someone you love', repeat: 'weekly' },
    { kind: 'habit', name: 'Read 20 pages', icon: '📖', color: '#7A5C8E', frequency: 'daily' },
    { kind: 'habit', name: 'Move for 30 minutes', icon: '🏃', color: '#2F4F40', frequency: 'daily' },
    { kind: 'habit', name: 'Journal', icon: '✍️', color: '#8A5A44', frequency: 'daily' },
    ...COMMON,
  ],
};

export function suggestionKey(s: Suggestion) {
  return s.kind === 'task' ? `t:${s.title}` : `h:${s.name}`;
}

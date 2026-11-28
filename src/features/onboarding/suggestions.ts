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
export interface GoalSuggestion {
  kind: 'goal';
  title: string;
  icon: string;
  color: string;
  /** Small first steps. */
  steps: string[];
}
export type Suggestion = TaskSuggestion | HabitSuggestion | GoalSuggestion;

/** In display order. The first four show in your profile; the rest under "More". */
export const PERSONAS: { value: Persona; label: string; icon: IconName; blurb: string }[] = [
  { value: 'student', label: 'Student', icon: 'school-outline', blurb: 'Classes, assignments, exams' },
  { value: 'professional', label: 'Professional', icon: 'briefcase-outline', blurb: 'Work, meetings, deadlines' },
  { value: 'parent', label: 'Parent', icon: 'people-outline', blurb: 'Family, school runs, home' },
  { value: 'athlete', label: 'Athlete', icon: 'barbell-outline', blurb: 'Training, recovery, competitions' },
  { value: 'creative', label: 'Creative', icon: 'color-palette-outline', blurb: 'Projects, practice, ideas' },
  { value: 'founder', label: 'Founder', icon: 'rocket-outline', blurb: 'Building, selling, shipping' },
  { value: 'freelancer', label: 'Freelancer', icon: 'laptop-outline', blurb: 'Clients, invoices, deadlines' },
  { value: 'teacher', label: 'Teacher', icon: 'easel-outline', blurb: 'Lessons, marking, classes' },
  { value: 'healthcare', label: 'Healthcare', icon: 'medkit-outline', blurb: 'Shifts, rest, recovery' },
  { value: 'jobseeker', label: 'Job hunting', icon: 'search-outline', blurb: 'Applications, interviews' },
  { value: 'retired', label: 'Retired', icon: 'leaf-outline', blurb: 'Health, hobbies, people' },
  { value: 'other', label: 'Something else', icon: 'sparkles-outline', blurb: 'Life admin, side projects, me' },
];

/** Shown up front; everything else sits under "More". */
export const MAIN_PERSONAS = PERSONAS.slice(0, 4);
export const MORE_PERSONAS = PERSONAS.slice(4);
/** First-time setup: the main four, plus "Something else". */
export const ONBOARDING_PERSONAS = [...MAIN_PERSONAS, PERSONAS[PERSONAS.length - 1]];

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
  parent: [
    { kind: 'task', title: 'Pack school bags', repeat: 'weekdays', time: '20:30' },
    { kind: 'task', title: 'Plan the family meals', repeat: 'weekly', time: '18:00' },
    { kind: 'task', title: 'Check the school calendar', repeat: 'weekly' },
    { kind: 'habit', name: '10 minutes just for me', icon: '☕', color: '#8A5A44', frequency: 'daily' },
    { kind: 'habit', name: 'Read with the kids', icon: '📚', color: '#7A5C8E', frequency: 'daily' },
    { kind: 'habit', name: 'Move for 20 minutes', icon: '🏃', color: '#2F4F40', frequency: 'weekly', timesPerWeek: 4 },
    ...COMMON,
  ],
  creative: [
    { kind: 'task', title: 'Share one piece of work', repeat: 'weekly' },
    { kind: 'task', title: 'Back up your files', repeat: 'monthly' },
    { kind: 'task', title: 'Plan this week’s project time', repeat: 'weekly', time: '09:00' },
    { kind: 'habit', name: 'Create for 30 minutes', icon: '🎨', color: '#A8554B', frequency: 'daily' },
    { kind: 'habit', name: 'Sketch / write ideas', icon: '✍️', color: '#8A5A44', frequency: 'daily' },
    { kind: 'habit', name: 'Walk for inspiration', icon: '🚶', color: '#2F4F40', frequency: 'weekly', timesPerWeek: 3 },
    ...COMMON,
  ],
  founder: [
    { kind: 'task', title: 'Write down today’s one big thing', repeat: 'weekdays', time: '08:30' },
    { kind: 'task', title: 'Review the numbers', repeat: 'weekly', time: '16:00' },
    { kind: 'task', title: 'Talk to a customer', repeat: 'weekly' },
    { kind: 'habit', name: 'Deep work block', icon: '💻', color: '#4A6B8A', frequency: 'daily' },
    { kind: 'habit', name: 'Exercise', icon: '🏋️', color: '#A8554B', frequency: 'weekly', timesPerWeek: 3 },
    { kind: 'habit', name: 'Switch off by 10pm', icon: '🌙', color: '#22201D', frequency: 'daily' },
    ...COMMON,
  ],
  freelancer: [
    { kind: 'task', title: 'Send invoices', repeat: 'monthly' },
    { kind: 'task', title: 'Follow up with clients', repeat: 'weekly', time: '10:00' },
    { kind: 'task', title: 'Set aside money for tax', repeat: 'monthly' },
    { kind: 'habit', name: 'Start work by 9', icon: '⏰', color: '#B5873A', frequency: 'daily' },
    { kind: 'habit', name: 'Look for new work', icon: '🔎', color: '#4A6B8A', frequency: 'weekly', timesPerWeek: 2 },
    { kind: 'habit', name: 'Take a proper lunch break', icon: '🥗', color: '#2F4F40', frequency: 'daily' },
    ...COMMON,
  ],
  teacher: [
    { kind: 'task', title: 'Plan tomorrow’s lessons', repeat: 'weekdays', time: '17:00' },
    { kind: 'task', title: 'Marking', repeat: 'weekly' },
    { kind: 'task', title: 'Prep resources for next week', repeat: 'weekly' },
    { kind: 'habit', name: 'Leave work at work', icon: '🏡', color: '#3F7C7A', frequency: 'daily' },
    { kind: 'habit', name: 'Read 20 pages', icon: '📖', color: '#7A5C8E', frequency: 'daily' },
    { kind: 'habit', name: 'Exercise', icon: '🏃', color: '#2F4F40', frequency: 'weekly', timesPerWeek: 3 },
    ...COMMON,
  ],
  healthcare: [
    { kind: 'task', title: 'Check next week’s shifts', repeat: 'weekly' },
    { kind: 'task', title: 'Prep meals for shifts', repeat: 'weekly' },
    { kind: 'task', title: 'Renew training or registration', repeat: 'none' },
    { kind: 'habit', name: 'Sleep 7+ hours', icon: '😴', color: '#22201D', frequency: 'daily' },
    { kind: 'habit', name: 'Decompress after work', icon: '🧘', color: '#3F7C7A', frequency: 'daily' },
    { kind: 'habit', name: 'Stretch', icon: '🤸', color: '#B5873A', frequency: 'weekly', timesPerWeek: 3 },
    ...COMMON,
  ],
  jobseeker: [
    { kind: 'task', title: 'Apply to two jobs', repeat: 'weekdays', time: '10:00' },
    { kind: 'task', title: 'Update your CV', repeat: 'monthly' },
    { kind: 'task', title: 'Follow up on applications', repeat: 'weekly' },
    { kind: 'habit', name: 'Learn a new skill', icon: '🧠', color: '#7A5C8E', frequency: 'daily' },
    { kind: 'habit', name: 'Reach out to someone', icon: '🤝', color: '#4A6B8A', frequency: 'weekly', timesPerWeek: 3 },
    { kind: 'habit', name: 'Get outside', icon: '🌳', color: '#2F4F40', frequency: 'daily' },
    ...COMMON,
  ],
  retired: [
    { kind: 'task', title: 'Call family or a friend', repeat: 'weekly' },
    { kind: 'task', title: 'Take your medication', repeat: 'daily', time: '09:00' },
    { kind: 'task', title: 'Book check-ups', repeat: 'none' },
    { kind: 'habit', name: 'Walk 30 minutes', icon: '🚶', color: '#2F4F40', frequency: 'daily' },
    { kind: 'habit', name: 'Time for a hobby', icon: '🪴', color: '#5F6B4E', frequency: 'weekly', timesPerWeek: 3 },
    { kind: 'habit', name: 'Read', icon: '📖', color: '#7A5C8E', frequency: 'daily' },
    ...COMMON,
  ],
};

export function suggestionKey(s: Suggestion) {
  return s.kind === 'task' ? `t:${s.title}` : s.kind === 'goal' ? `g:${s.title}` : `h:${s.name}`;
}

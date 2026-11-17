import type { DayKey, TimeKey } from '@/lib/dates';
import type { SyncMeta } from '@/lib/storage';

export type Persona = 'student' | 'professional' | 'athlete' | 'other';

export type Repeat = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';

/** Minutes before the task time. `null` = no reminder. */
export type ReminderOffset = number | null;

export interface Task extends SyncMeta {
  title: string;
  notes?: string;
  date: DayKey;
  time?: TimeKey | null;
  reminder: ReminderOffset;
  repeat: Repeat;
  /** Non-repeating: the single completion date. Repeating: one entry per finished occurrence. */
  completedDates: DayKey[];
  /** Occurrences of a repeating task the user removed ("delete this one"). */
  skippedDates?: DayKey[];
}

export type HabitFrequency = 'daily' | 'weekly';

export interface Habit extends SyncMeta {
  name: string;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  /** For weekly habits: how many times per week counts as success. */
  timesPerWeek: number;
  history: DayKey[];
  archived?: boolean;
}

export interface Countdown extends SyncMeta {
  title: string;
  date: DayKey;
  category: string;
  icon: string;
  color: string;
  notes?: string;
}

export type ThemePreference = 'system' | 'light' | 'dark';
export type Tone = 'gentle' | 'balanced' | 'savage';
export type Plan = 'free' | 'premium';

export interface Settings {
  onboarded: boolean;
  persona: Persona | null;
  name: string;
  theme: ThemePreference;
  tone: Tone;
  notificationsEnabled: boolean;
  dailyPromptTime: TimeKey;
  eveningCheckTime: TimeKey;
  weekStartsOn: 0 | 1;
  use24h: boolean;
  plan: Plan;
}

export interface Stats {
  /** Days the user "showed up": planned their day or finished something. */
  activeDays: DayKey[];
  /** Days the user tapped through the daily plan prompt. */
  plannedDays: DayKey[];
  bestStreak: number;
}

export interface AppState {
  hydrated: boolean;
  tasks: Task[];
  habits: Habit[];
  countdowns: Countdown[];
  settings: Settings;
  stats: Stats;
}

export const DEFAULT_SETTINGS: Settings = {
  onboarded: false,
  persona: null,
  name: '',
  theme: 'system',
  tone: 'balanced',
  notificationsEnabled: false,
  dailyPromptTime: '08:00',
  eveningCheckTime: '20:00',
  weekStartsOn: 1,
  use24h: false,
  plan: 'free',
};

export const DEFAULT_STATS: Stats = { activeDays: [], plannedDays: [], bestStreak: 0 };

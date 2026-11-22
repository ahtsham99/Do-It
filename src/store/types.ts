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
  /** Snoozed reminder: show/notify again at this epoch ms. */
  snoozedUntil?: number | null;
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
  /** Optional goal this habit helps with. */
  goalId?: string | null;
}

export type GoalKind = 'steps' | 'number';

export interface GoalStep {
  id: string;
  title: string;
  doneAt?: number | null;
}

/**
 * A bigger outcome ("Run a 5K", "Read 12 books"). Progress comes from small
 * steps or from a number, so it can be broken into pieces you can start today.
 */
export interface Goal extends SyncMeta {
  title: string;
  why?: string;
  icon: string;
  color: string;
  kind: GoalKind;
  targetDate?: DayKey | null;
  steps: GoalStep[];
  target?: number;
  current?: number;
  unit?: string;
  completedAt?: number | null;
}

export interface Countdown extends SyncMeta {
  title: string;
  date: DayKey;
  category: string;
  icon: string;
  color: string;
  notes?: string;
}

export type TimerMode = 'focus' | 'break';

/** The one live timer. Running timers store an end time so they survive the app closing. */
export interface TimerState {
  status: 'idle' | 'running' | 'paused';
  mode: TimerMode;
  /** Planned length in seconds. */
  durationSec: number;
  /** When running: epoch ms when it finishes. */
  endsAt: number | null;
  /** When paused: seconds left. */
  remainingSec: number;
  startedAt: number | null;
  label: string;
  taskId?: string | null;
  habitId?: string | null;
}

/** A finished (or abandoned) focus session, kept for history and stats. */
export interface FocusSession extends SyncMeta {
  mode: TimerMode;
  label: string;
  plannedMin: number;
  /** Minutes actually focused. */
  minutes: number;
  completed: boolean;
  day: DayKey;
  taskId?: string | null;
  habitId?: string | null;
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
  focusMinutes: number;
  breakMinutes: number;
  /** Font ids from src/theme/fonts.ts. */
  displayFont: string;
  textFont: string;
  logoFont: string;
  /** Night-mode glow colour (src/theme/colors.ts NIGHT_COLORS). */
  nightColor: 'forest' | 'ember' | 'electric' | 'violet' | 'mono';
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
  timer: TimerState;
  sessions: FocusSession[];
  goals: Goal[];
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
  focusMinutes: 25,
  breakMinutes: 5,
  displayFont: 'instrument',
  textFont: 'system',
  logoFont: 'newsreader',
  nightColor: 'forest',
};

export const DEFAULT_TIMER: TimerState = {
  status: 'idle',
  mode: 'focus',
  durationSec: 25 * 60,
  endsAt: null,
  remainingSec: 25 * 60,
  startedAt: null,
  label: '',
  taskId: null,
  habitId: null,
};

export const DEFAULT_STATS: Stats = { activeDays: [], plannedDays: [], bestStreak: 0 };

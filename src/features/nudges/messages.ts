import type { Tone } from '@/store/types';

/**
 * Copy for nudges. Each situation has lines per tone; `pick` chooses one
 * deterministically per day so text doesn't change on every render.
 */
type Bank = Record<Tone, string[]>;

export const MESSAGES = {
  planPrompt: {
    gentle: [
      'A few quiet minutes of planning makes the whole day lighter.',
      'What would make today feel like a good day?',
      'Start small. Choose what matters most.',
    ],
    balanced: [
      'Take two minutes to shape your day.',
      'Choose your few important things for today.',
      'A clear plan now makes the rest of the day easier.',
    ],
    savage: [
      'Up! Decide what today is for before anything else.',
      'No plan, no progress. Set your day now!',
      'Pick the one thing you’ll finish today. Go!',
    ],
  },
  overdue: {
    gentle: [
      'A few things are still waiting. Pick one whenever you’re ready.',
      'No rush. Choose one of these and begin.',
    ],
    balanced: [
      'These are still waiting. Move them to today, or let them go.',
      'Give each of these a new day, or cross it off for good.',
    ],
    savage: [
      'These have waited long enough. Finish one now!',
      'Stop scrolling. Start with the oldest one. Go!',
    ],
  },
  unfinished: {
    gentle: ['There’s still time for one more, if you’d like.', 'Almost there. One more?'],
    balanced: ['A little left for today. Finish what you can.', 'Close the day well. One more tick.'],
    savage: ['You planned these. Finish one before you rest!', 'The day’s not over. Get one more done!'],
  },
  streakRisk: {
    gentle: ['One small thing today keeps your streak going.'],
    balanced: ['Your streak is waiting. One habit or one reminder keeps it going.'],
    savage: ['Your streak dies at midnight! Do one thing now!'],
  },
  done: {
    gentle: ['Nicely done.', 'One less thing.', 'Lovely.', 'Well done.'],
    balanced: ['Done. Well done.', 'That’s one more.', 'Good progress.', 'Steady work.'],
    savage: ['Done. Keep the momentum.', 'Good. On to the next.', 'That’s how days get finished.'],
  },
  allDone: {
    gentle: ['Everything’s done. Rest well.'],
    balanced: ['All done for today. Enjoy the quiet.'],
    savage: ['Every task finished. That’s a full day.'],
  },
  // Reminders: plain for Gentle and Firm, pushy for Relentless.
  /** A timed plan, at its time. */
  remindNow: {
    gentle: ['It’s time for this.'],
    balanced: ['It’s time for this.'],
    savage: ['Still not done? Do it now!', 'No more waiting. Go!', 'Now. Not later. Go!'],
  },
  /** An untimed plan for today. */
  remindToday: {
    gentle: ['On your list for today.'],
    balanced: ['On your list for today.'],
    savage: ['Still on your list. Get it done today!', 'Today. No excuses!', 'This won’t do itself. Go!'],
  },
  /** Something you asked to remember (Reminders tab). */
  remindAsked: {
    gentle: ['You asked to be reminded.'],
    balanced: ['You asked to be reminded.'],
    savage: ['You said you’d do this. Do it now!', 'Reminder! Get it done now!', 'Don’t ignore this one. Do it!'],
  },
  /** A snoozed plan coming back. */
  remindAgain: {
    gentle: ['Here it is again, as you asked.'],
    balanced: ['Reminding you again, as you asked.'],
    savage: ['You snoozed this. Not again. Do it now!', 'Back again! Stop putting it off!'],
  },
  /** The reminder card on Today. */
  remindCard: {
    gentle: ['A reminder:'],
    balanced: ['A reminder:'],
    savage: ['Do it now!'],
  },
} satisfies Record<string, Bank>;

export type Situation = keyof typeof MESSAGES;

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function pick(situation: Situation, tone: Tone, seed: string | number = new Date().toDateString()) {
  const list = MESSAGES[situation][tone];
  return list[hash(`${situation}:${seed}`) % list.length];
}

export function randomLine(situation: Situation, tone: Tone) {
  const list = MESSAGES[situation][tone];
  return list[Math.floor(Math.random() * list.length)];
}

export function greeting(hour = new Date().getHours()) {
  if (hour < 5) return 'Up late';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

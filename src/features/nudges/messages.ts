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
      'Before anything else, decide what today is for.',
      'Name the one thing you’ll finish today, then build around it.',
      'A day with a plan is a day you can finish. Set yours now.',
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
      'These have waited long enough. Finish one before anything new.',
      'Start with the oldest one. Ten minutes is enough to begin.',
    ],
  },
  unfinished: {
    gentle: ['There’s still time for one more, if you’d like.', 'Almost there. One more?'],
    balanced: ['A little left for today. Finish what you can.', 'Close the day well. One more tick.'],
    savage: ['You planned these for today. Finish one before you rest.', 'One more before the day ends. You’ll be glad you did.'],
  },
  streakRisk: {
    gentle: ['One small thing today keeps your streak going.'],
    balanced: ['Your streak is waiting. One task or habit keeps it going.'],
    savage: ['Your streak ends at midnight. One small thing saves it.'],
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
  reminder: {
    gentle: ['A gentle reminder:'],
    balanced: ['A reminder:'],
    savage: ['It’s time:'],
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

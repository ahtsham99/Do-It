import type { Tone } from '@/store/types';

/**
 * Copy for nudges. Each situation has lines per tone; `pick` chooses one
 * deterministically per day so text doesn't change on every render.
 */
type Bank = Record<Tone, string[]>;

export const MESSAGES = {
  planPrompt: {
    gentle: [
      'A few minutes of planning makes the whole day lighter.',
      'Let’s set up today together. What matters most?',
      'Small plan, big difference. Ready?',
    ],
    balanced: [
      'Plan your day before it plans you.',
      'Two minutes now saves two hours later. Plan today.',
      'Winners plan the day. Your turn.',
    ],
    savage: [
      'Oh, winging it again? Bold. Plan your day.',
      'Your to-do list called. It feels ignored.',
      'Yesterday-you left a mess. Today-you plans. Go.',
    ],
  },
  overdue: {
    gentle: [
      'A few things slipped. No stress — pick one and start.',
      'These are waiting for you. One at a time is fine.',
    ],
    balanced: [
      'These won’t do themselves. Clear one now.',
      'Overdue is just “not done yet”. Fix that.',
    ],
    savage: [
      'These tasks have been waiting longer than your excuses.',
      'Procrastination level: legendary. Go finish something.',
      'They’re overdue. You know it. I know it. Do it.',
    ],
  },
  unfinished: {
    gentle: ['Still time to tick a couple off before bed.', 'Almost there — one more?'],
    balanced: ['The day isn’t over. Finish what you started.', 'Close the loop before you close your eyes.'],
    savage: ['You said you’d do these. Today. Remember?', 'Going to bed with these unfinished? Bold choice.'],
  },
  streakRisk: {
    gentle: ['Keep your streak alive — one small thing counts.'],
    balanced: ['Your streak ends at midnight unless you show up.', 'Don’t break the chain. One task.'],
    savage: ['Your streak is on life support. One task. Now.', 'Throwing away your streak? Over THIS?'],
  },
  done: {
    gentle: ['Nice work.', 'One less thing.', 'Lovely.', 'Well done.'],
    balanced: ['Done. Next!', 'That’s how it’s done.', 'Momentum!', 'Ticked. Keep going.'],
    savage: ['Look at you, actually doing things.', 'Finally.', 'Who are you and what did you do with the procrastinator?'],
  },
  allDone: {
    gentle: ['Everything’s done. Rest well.'],
    balanced: ['Clean sweep. Today is won.'],
    savage: ['All done? Okay, I’m genuinely impressed.'],
  },
  reminder: {
    gentle: ['Gentle reminder:'],
    balanced: ['Heads up:'],
    savage: ['Don’t pretend you forgot:'],
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

import type { Tone } from '@/store/types';

/**
 * Copy for nudges. Each situation has lines per tone; `pick` chooses one
 * deterministically per day so text doesn't change on every render.
 */
type Bank = Record<Tone, string[]>;

export const MESSAGES = {
  // ---- Morning: plan your day (notification body) ----
  planPrompt: {
    gentle: [
      'A few quiet minutes of planning makes the whole day lighter.',
      'What would make today feel like a good day?',
      'Start small. Choose what matters most.',
      'Pick one thing that would make today count.',
      'Coffee, then a quick plan. You’ve got this.',
    ],
    balanced: [
      'Take two minutes to shape your day.',
      'Choose your few important things for today.',
      'A clear plan now makes the rest of the day easier.',
      'Decide your top three before the day decides for you.',
      'Two minutes now saves an hour of drifting later.',
    ],
    savage: [
      'Up! Decide what today is for before anything else.',
      'No plan, no progress. Set your day now!',
      'Pick the one thing you’ll finish today. Go!',
      'Phone down, plan up. Two minutes. Now!',
      'Today won’t plan itself. Open the app and do it!',
    ],
  },
  // ---- Overdue plans (on Today, and added to the morning notification) ----
  overdue: {
    gentle: [
      'A few things are still waiting. Pick one whenever you’re ready.',
      'No rush. Choose one of these and begin.',
      'Some things carried over. That’s okay. Start with one.',
    ],
    balanced: [
      'These are still waiting. Move them to today, or let them go.',
      'Give each of these a new day, or cross it off for good.',
      'Old plans pile up. Decide: today, later, or never.',
    ],
    savage: [
      'These have waited long enough. Finish one now!',
      'Stop scrolling. Start with the oldest one. Go!',
      'Every day you skip these, they get heavier. Clear one now!',
    ],
  },
  // ---- Evening: what's left ----
  unfinished: {
    gentle: ['There’s still time for one more, if you’d like.', 'Almost there. One more?', 'Whatever’s left can wait for tomorrow. Or try one now.'],
    balanced: ['A little left for today. Finish what you can.', 'Close the day well. One more tick.', 'Finish one more, then move the rest to tomorrow.'],
    savage: ['You planned these. Finish one before you rest!', 'The day’s not over. Get one more done!', 'Not done yet. Five minutes. Go!'],
  },
  /** Evening on a day with nothing left (or a future day). */
  eveningReview: {
    gentle: ['How did today go? Take a moment to look back.', 'Nice work today. Plan tomorrow while it’s fresh?'],
    balanced: ['Check today off and set up tomorrow.', 'Two minutes: review today, plan tomorrow.'],
    savage: ['Review today. Plan tomorrow. Then rest!', 'Tomorrow starts tonight. Plan it now!'],
  },
  // ---- Streak ----
  streakRisk: {
    gentle: ['One small thing today keeps your streak going.', 'Your streak would love one small tick today.'],
    balanced: ['Your streak is waiting. One habit or one plan keeps it going.', 'Don’t lose your streak. One small thing is enough.'],
    savage: ['Your streak dies at midnight! Do one thing now!', 'All that work, gone at midnight? Tick one thing now!'],
  },
  // ---- Celebrations (in the app) ----
  done: {
    gentle: ['Nicely done.', 'One less thing.', 'Lovely.', 'Well done.', 'That’s progress.'],
    balanced: ['Done. Well done.', 'That’s one more.', 'Good progress.', 'Steady work.', 'Ticked off.'],
    savage: ['Done! Keep the momentum!', 'Good. On to the next!', 'That’s how days get finished!', 'Yes! Next one!'],
  },
  allDone: {
    gentle: ['Everything’s done. Rest well.', 'All clear. Enjoy your evening.'],
    balanced: ['All done for today. Enjoy the quiet.', 'Everything ticked. Good day.'],
    savage: ['Every task finished. That’s a full day!', 'All done! That’s how it’s done!'],
  },
  // ---- Reminders: plain for Gentle and Firm, pushy for Relentless ----
  /** A timed plan, at its time. */
  remindNow: {
    gentle: ['It’s time for this.'],
    balanced: ['It’s time for this.'],
    savage: ['Still not done? Do it now!', 'No more waiting. Go!', 'Now. Not later. Go!'],
  },
  /** An untimed plan for today, or an early heads-up. */
  remindToday: {
    gentle: ['On your list for today.'],
    balanced: ['On your list for today.'],
    savage: ['Still on your list. Get it done today!', 'Today. No excuses!', 'This won’t do itself. Go!'],
  },
  /** An early heads-up before a timed plan. */
  remindSoon: {
    gentle: ['Coming up soon.'],
    balanced: ['Coming up soon.'],
    savage: ['Get ready. No excuses!', 'Be ready to start!'],
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
  // ---- Focus timer ----
  focusDone: {
    gentle: ['Nicely done. Take a short break, or keep going.', 'Well focused. Rest your eyes for a minute.'],
    balanced: ['Session done. Take a break, or start another.', 'Good session. Break, or keep the streak going.'],
    savage: ['Session done! Quick break, then go again!', 'That’s one! Don’t stop now!'],
  },
  breakDone: {
    gentle: ['Ready for another round?', 'Whenever you’re ready, the next round is waiting.'],
    balanced: ['Break’s over. Back to it.', 'Time for the next round.'],
    savage: ['Break’s over! Back to work!', 'Enough rest. Go!'],
  },
  // ---- Goals ----
  goalWeek: {
    gentle: ['A little progress this week is enough.', 'One small step this week keeps it moving.'],
    balanced: ['Pick one step for this week and do it.', 'Keep it moving: one step this week.'],
    savage: ['This week, move it forward. No skipping!', 'Goals don’t wait. One step this week, minimum!'],
  },
  goalDue: {
    gentle: ['Your target date is tomorrow. One more step today?'],
    balanced: ['Target date is tomorrow. Make today count.'],
    savage: ['Tomorrow’s the deadline! Push today!'],
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

/**
 * Notification titles per tone. `n` is a count; `name` is optional.
 */
export function titleFor(kind: 'plan' | 'evening' | 'review' | 'streak', tone: Tone, o: { n?: number; name?: string; streak?: number } = {}) {
  const name = o.name?.trim();
  const plural = (k: number, w: string) => `${k} ${w}${k === 1 ? '' : 's'}`;
  switch (kind) {
    case 'plan':
      return tone === 'savage' ? (name ? `${name}, plan your day!` : 'Plan your day!') : name ? `Good morning, ${name}` : 'Good morning';
    case 'evening':
      return tone === 'savage' ? `${plural(o.n ?? 0, 'thing')} still not done!` : `${plural(o.n ?? 0, 'thing')} left today`;
    case 'review':
      return tone === 'savage' ? 'Plan tomorrow now!' : name ? `How did today go, ${name}?` : 'How did today go?';
    case 'streak':
      return tone === 'savage' ? `🔥 ${o.streak}-day streak at risk!` : `🔥 Keep your ${o.streak}-day streak`;
  }
}

export function greeting(hour = new Date().getHours()) {
  if (hour < 5) return 'Up late';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

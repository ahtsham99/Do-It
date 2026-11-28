import type { GoalSuggestion, HabitSuggestion, Suggestion, TaskSuggestion } from './suggestions';

/**
 * On-device matching of "what do you want to work on?" to suggestions.
 * No AI and nothing leaves the phone: each theme lists phrases that trigger it
 * and the goal, habits and plans it suggests.
 */
interface Theme {
  id: string;
  /** Lower-case phrases or regex fragments, matched on word boundaries. */
  keys: string[];
  goal?: Omit<GoalSuggestion, 'kind'>;
  habits: Omit<HabitSuggestion, 'kind'>[];
  tasks: Omit<TaskSuggestion, 'kind'>[];
}

const T: Theme[] = [
  {
    id: 'fitness',
    keys: ['gym', 'work ?outs?', 'exercis\\w*', 'lift(ing)?', 'weights?', 'get fit', 'fit(ter|ness)?', 'strong(er)?', 'muscles?', 'bulk', 'training', 'cardio', 'sport'],
    goal: { title: 'Get fit', icon: '💪', color: '#A8554B', steps: ['Pick 3 gym days', 'First week done', 'A month without missing a week'] },
    habits: [{ name: 'Gym', icon: '🏋️', color: '#A8554B', frequency: 'weekly', timesPerWeek: 3 }, { name: 'Stretch 10 minutes', icon: '🧘', color: '#3F7C7A', frequency: 'daily' }],
    tasks: [{ title: 'Pack gym bag', repeat: 'weekdays', time: '21:00' }, { title: 'Plan this week’s workouts', repeat: 'weekly', time: '19:00' }],
  },
  {
    id: 'running',
    keys: ['run(ning)?', 'jog(ging)?', '5k', '10k', 'marathon', 'half marathon'],
    goal: { title: 'Run a 5K', icon: '🏃', color: '#2F4F40', steps: ['Run 1K without stopping', 'Run 3K', 'Run 5K'] },
    habits: [{ name: 'Run', icon: '🏃', color: '#2F4F40', frequency: 'weekly', timesPerWeek: 3 }],
    tasks: [{ title: 'Lay out running kit', repeat: 'weekly' }],
  },
  {
    id: 'walking',
    keys: ['walk(ing|s)?', 'steps', '10,?000 steps', 'move more', 'more active', 'sit less'],
    habits: [{ name: 'Walk 8,000 steps', icon: '🚶', color: '#5F6B4E', frequency: 'daily' }, { name: 'Walk after lunch', icon: '🌳', color: '#2F4F40', frequency: 'daily' }],
    tasks: [],
  },
  {
    id: 'food',
    keys: ['eat (clean|healthy|healthier|better)', 'clean eating', 'healthy eating', 'diet', 'nutrition', 'junk', 'fast food', 'sugar', 'snack(ing|s)?', 'vegetables?', 'veg', 'protein', 'meal prep', 'cook(ing)?', 'takeaways?', 'calories'],
    goal: { title: 'Eat cleaner', icon: '🥗', color: '#5F6B4E', steps: ['Meal prep for one week', 'Two weeks with no takeaway', 'A month of mostly home cooking'] },
    habits: [{ name: 'Eat a portion of veg with every meal', icon: '🥦', color: '#5F6B4E', frequency: 'daily' }, { name: 'No sugary snacks', icon: '🍬', color: '#A8554B', frequency: 'daily' }, { name: 'Cook at home', icon: '🍳', color: '#B5873A', frequency: 'weekly', timesPerWeek: 4 }],
    tasks: [{ title: 'Meal prep', repeat: 'weekly', time: '17:00' }, { title: 'Write the shopping list', repeat: 'weekly' }],
  },
  {
    id: 'weight',
    keys: ['lose weight', 'weight loss', 'lose \\d+ ?(kg|lbs?|pounds|kilos?)', 'slim', 'fat loss', 'lose fat', 'get lean', 'tone up'],
    goal: { title: 'Lose weight', icon: '⚖️', color: '#4A6B8A', steps: ['Weigh in and write it down', 'First 2 kg', 'Halfway there'] },
    habits: [{ name: 'Track what I eat', icon: '📝', color: '#4A6B8A', frequency: 'daily' }, { name: 'Walk 30 minutes', icon: '🚶', color: '#2F4F40', frequency: 'daily' }],
    tasks: [{ title: 'Weekly weigh-in', repeat: 'weekly', time: '08:00' }],
  },
  {
    id: 'water',
    keys: ['water', 'hydrat\\w*', 'drink more'],
    habits: [{ name: 'Drink 2L of water', icon: '💧', color: '#4A6B8A', frequency: 'daily' }],
    tasks: [],
  },
  {
    id: 'sleep',
    keys: ['sleep(ing)?', 'bed ?time', 'go to bed', 'tired', 'well rested', 'insomnia', 'stay(ing)? up late', 'late nights?'],
    goal: { title: 'Sleep better', icon: '😴', color: '#22201D', steps: ['Pick a bedtime', 'A week in bed on time', 'A month of 7+ hours'] },
    habits: [{ name: 'In bed by 11', icon: '🛏️', color: '#22201D', frequency: 'daily' }, { name: 'No screens 30 min before bed', icon: '📵', color: '#7A5C8E', frequency: 'daily' }],
    tasks: [{ title: 'Start winding down', repeat: 'daily', time: '22:30' }],
  },
  {
    id: 'morning',
    keys: ['wake up early', 'early (riser|mornings?)', 'mornings?', 'get up early', 'stop snoozing', 'snooze'],
    habits: [{ name: 'Up by 7', icon: '🌅', color: '#B5873A', frequency: 'daily' }, { name: 'No phone for the first 30 minutes', icon: '☀️', color: '#B5873A', frequency: 'daily' }],
    tasks: [],
  },
  {
    id: 'study',
    keys: ['stud(y|ying)', 'revis(e|ion|ing)', 'exams?', 'uni(versity)?', 'college', 'school', 'grades?', 'homework', 'assignments?', 'coursework', 'lectures?', 'degree', 'thesis', 'dissertation'],
    goal: { title: 'Ace my exams', icon: '🎓', color: '#7A5C8E', steps: ['Make a revision timetable', 'Finish first pass of notes', 'Do two past papers'] },
    habits: [{ name: 'Study 1 focused hour', icon: '📖', color: '#7A5C8E', frequency: 'daily' }, { name: 'Review today’s notes', icon: '🗒️', color: '#4A6B8A', frequency: 'weekly', timesPerWeek: 5 }],
    tasks: [{ title: 'Check assignment deadlines', repeat: 'weekly' }, { title: 'Plan tomorrow’s study session', repeat: 'weekdays', time: '20:00' }],
  },
  {
    id: 'procrastination',
    keys: ['procrastinat\\w*', 'put(ting)? (things|stuff|it) off', 'lazy', 'motivat\\w*', 'focus', 'productiv\\w*', 'get (things|stuff) done', 'distracted', 'discipline', 'consistent'],
    goal: { title: 'Stop putting things off', icon: '⚡', color: '#B5873A', steps: ['Plan every day for a week', 'Do the hardest thing first, 5 days in a row', 'Two weeks with nothing overdue'] },
    habits: [{ name: 'Plan tomorrow tonight', icon: '🗓️', color: '#2F4F40', frequency: 'daily' }, { name: 'Do the hardest thing first', icon: '🐸', color: '#5F6B4E', frequency: 'weekly', timesPerWeek: 5 }, { name: 'One 25-minute focus session', icon: '⏱️', color: '#B5873A', frequency: 'daily' }],
    tasks: [{ title: 'Plan the week’s priorities', repeat: 'weekly', time: '18:00' }],
  },
  {
    id: 'work',
    keys: ['work(?! ?outs?)', 'job', 'career', 'promotion', 'inbox', 'emails?', 'meetings?', 'deadlines?', 'projects?', 'business', 'clients?'],
    habits: [{ name: 'Deep work block', icon: '💻', color: '#4A6B8A', frequency: 'weekly', timesPerWeek: 5 }],
    tasks: [{ title: 'Clear inbox', repeat: 'weekdays', time: '09:00' }, { title: 'Review the week', repeat: 'weekly', time: '16:00' }],
  },
  {
    id: 'reading',
    keys: ['read(ing)? (more|books?|novels?|every day|daily)', 'reading', 'books?', 'novels?'],
    goal: { title: 'Read 12 books this year', icon: '📚', color: '#8A5A44', steps: ['Pick the first book', 'Finish book 1', 'Finish book 6'] },
    habits: [{ name: 'Read 20 pages', icon: '📚', color: '#8A5A44', frequency: 'daily' }],
    tasks: [],
  },
  {
    id: 'mind',
    keys: ['stress(ed)?', 'anxi(ety|ous)', 'calm(er)?', 'mental health', 'meditat\\w*', 'mindful\\w*', 'overwhelm\\w*', 'burn ?out', 'relax\\w*', 'breath\\w*', 'happier', 'mood'],
    goal: { title: 'Feel calmer', icon: '🌿', color: '#3F7C7A', steps: ['Meditate 5 days in a row', 'Find one thing that helps on bad days', 'A month of daily check-ins'] },
    habits: [{ name: 'Meditate 5 minutes', icon: '🧘', color: '#3F7C7A', frequency: 'daily' }, { name: 'Write 3 good things', icon: '✍️', color: '#8A5A44', frequency: 'daily' }],
    tasks: [{ title: 'Do something just for me', repeat: 'weekly' }],
  },
  {
    id: 'journal',
    keys: ['journal(ing)?', 'diary', 'gratitude', 'reflect\\w*'],
    habits: [{ name: 'Journal', icon: '📓', color: '#8A5A44', frequency: 'daily' }],
    tasks: [],
  },
  {
    id: 'screen',
    keys: ['phone', 'screen ?time', 'scroll(ing)?', 'doom ?scroll\\w*', 'social media', 'instagram', 'tik ?tok', 'youtube', 'netflix', 'gaming', 'video games?', 'addicted'],
    goal: { title: 'Use my phone less', icon: '📵', color: '#22201D', steps: ['Check my screen time', 'Delete one app that wastes time', 'Under 2 hours a day for a week'] },
    habits: [{ name: 'No phone in bed', icon: '📵', color: '#22201D', frequency: 'daily' }, { name: 'Under 2 hours of screen time', icon: '⏳', color: '#7A5C8E', frequency: 'daily' }],
    tasks: [],
  },
  {
    id: 'money',
    keys: ['sav(e|ing|ings)', 'money', 'budget\\w*', 'spend(ing)?', 'debt', 'invest\\w*', 'finances?', 'bills?', 'rent'],
    goal: { title: 'Save money', icon: '💰', color: '#B5873A', steps: ['Write a simple budget', 'Save the first £100', 'Build a month of savings'] },
    habits: [{ name: 'No-spend day', icon: '🪙', color: '#B5873A', frequency: 'weekly', timesPerWeek: 3 }, { name: 'Log what I spend', icon: '🧾', color: '#4A6B8A', frequency: 'daily' }],
    tasks: [{ title: 'Pay bills', repeat: 'monthly' }, { title: 'Move money to savings', repeat: 'monthly' }],
  },
  {
    id: 'quit',
    keys: ['smok(e|ing)', 'vap(e|ing)', 'cigarettes?', 'nicotine', 'quit', 'alcohol', 'drink(ing)? less', 'sober', 'beer', 'caffeine', 'coffee'],
    goal: { title: 'Quit a bad habit', icon: '🚭', color: '#A8554B', steps: ['Pick a quit date', 'First week clean', 'First month clean'] },
    habits: [{ name: 'A clean day', icon: '🚭', color: '#A8554B', frequency: 'daily' }],
    tasks: [{ title: 'Check in with how it’s going', repeat: 'weekly' }],
  },
  {
    id: 'social',
    keys: ['friends?', 'family', 'parents?', 'mum', 'mom', 'dad', 'call (more|people)', 'lonely', 'relationships?', 'partner', 'kids', 'children', 'social'],
    habits: [{ name: 'Message someone I care about', icon: '💬', color: '#4A6B8A', frequency: 'daily' }],
    tasks: [{ title: 'Call family', repeat: 'weekly', time: '18:00' }, { title: 'Plan something with friends', repeat: 'monthly' }],
  },
  {
    id: 'faith',
    keys: ['pray(er|ers|ing)?', 'salah', 'salat', 'namaz', 'quran', 'qur.an', 'bible', 'church', 'mosque', 'faith', 'god', 'allah', 'spiritual\\w*', 'deen', 'dhikr', 'fasting', 'ramadan'],
    habits: [{ name: 'Pray on time', icon: '🤲', color: '#3F7C7A', frequency: 'daily' }, { name: 'Read scripture 10 minutes', icon: '📖', color: '#7A5C8E', frequency: 'daily' }],
    tasks: [],
  },
  {
    id: 'home',
    keys: ['cleaning', 'clean (up|my|the) (room|house|flat|place|kitchen)', 'tid(y|ier|ying)', 'messy', 'declutter\\w*', 'laundry', 'chores', 'house', 'room', 'dishes'],
    habits: [{ name: 'Tidy for 10 minutes', icon: '🧹', color: '#5F6B4E', frequency: 'daily' }, { name: 'Make my bed', icon: '🛏️', color: '#B5873A', frequency: 'daily' }],
    tasks: [{ title: 'Laundry', repeat: 'weekly' }, { title: 'Deep clean one room', repeat: 'weekly' }],
  },
  {
    id: 'selfcare',
    keys: ['skin ?care', 'self ?care', 'skin', 'hair', 'look after myself', 'teeth', 'floss(ing)?', 'vitamins?', 'meds', 'medication', 'pills?'],
    habits: [{ name: 'Skincare routine', icon: '🧴', color: '#A8554B', frequency: 'daily' }, { name: 'Take vitamins', icon: '💊', color: '#B5873A', frequency: 'daily' }],
    tasks: [],
  },
  {
    id: 'learn',
    keys: ['learn\\w*', 'languages?', 'spanish', 'french', 'arabic', 'german', 'italian', 'japanese', 'korean', 'chinese', 'english', 'coding', 'code', 'programming', 'new skills?', '(an? |online )course'],
    goal: { title: 'Learn something new', icon: '🧠', color: '#7A5C8E', steps: ['Pick what to learn and where', 'Study for 7 days in a row', 'Finish the first course or level'] },
    habits: [{ name: 'Practise 15 minutes', icon: '🧠', color: '#7A5C8E', frequency: 'daily' }],
    tasks: [],
  },
  {
    id: 'creative',
    keys: ['writ(e|ing)', 'draw(ing)?', 'paint(ing)?', 'music', 'guitar', 'piano', 'sing(ing)?', 'art', 'photography', 'create', 'creative'],
    habits: [{ name: 'Create for 30 minutes', icon: '🎨', color: '#A8554B', frequency: 'daily' }],
    tasks: [{ title: 'Share one thing I made', repeat: 'weekly' }],
  },
  {
    id: 'jobhunt',
    keys: ['new job', 'job hunt\\w*', 'apply(ing)? for jobs', 'applications?', 'interviews?', 'cv', 'resume', 'hired'],
    goal: { title: 'Land a new job', icon: '💼', color: '#4A6B8A', steps: ['Update CV', 'Send 10 applications', 'First interview'] },
    habits: [{ name: 'Apply to one job', icon: '📨', color: '#4A6B8A', frequency: 'weekly', timesPerWeek: 5 }],
    tasks: [{ title: 'Follow up on applications', repeat: 'weekly' }],
  },
];

/** Ideas to tap when the box is empty. */
export const INTENT_IDEAS = ['Go to the gym', 'Eat clean', 'Sleep better', 'Stop procrastinating', 'Study more', 'Save money', 'Less phone', 'Read more', 'Feel calmer', 'Drink more water'];

const COMPILED = T.map((t) => ({ ...t, re: new RegExp(`\\b(${t.keys.join('|')})\\b`, 'i') }));

/** "3 times a week", "3x a week", "3 days a week" → 3. */
function timesPerWeek(text: string) {
  const m = text.match(/\b([1-7])\s*(x|times?|days?)\s*(a|per|each)?\s*week\b/i);
  return m ? Number(m[1]) : null;
}

/**
 * Themes in the order they appear in the text, then their suggestions: one
 * goal per theme (up to 3), habits and plans, without duplicates.
 */
export function matchIntents(text: string): { themes: string[]; items: Suggestion[] } {
  const t = ` ${text.toLowerCase().replace(/[’']/g, '').replace(/\s+/g, ' ')} `;
  if (t.trim().length < 3) return { themes: [], items: [] };
  const hits = COMPILED.map((th) => ({ th, at: t.search(th.re) }))
    .filter((h) => h.at >= 0)
    .sort((a, b) => a.at - b.at)
    .slice(0, 5);
  const weekly = timesPerWeek(t);
  const seen = new Set<string>();
  const goals: Suggestion[] = [];
  const habits: Suggestion[] = [];
  const tasks: Suggestion[] = [];
  hits.forEach(({ th }, i) => {
    if (th.goal && goals.length < 3 && !seen.has(`g:${th.goal.title}`)) {
      seen.add(`g:${th.goal.title}`);
      goals.push({ kind: 'goal', ...th.goal });
    }
    th.habits.forEach((h, j) => {
      if (seen.has(`h:${h.name}`)) return;
      seen.add(`h:${h.name}`);
      // "Gym 4 times a week" → the first weekly habit of the first theme uses that number.
      const n = i === 0 && j === 0 && h.frequency === 'weekly' && weekly ? weekly : h.timesPerWeek;
      habits.push({ kind: 'habit', ...h, timesPerWeek: n });
    });
    th.tasks.forEach((k) => {
      if (seen.has(`t:${k.title}`)) return;
      seen.add(`t:${k.title}`);
      tasks.push({ kind: 'task', ...k });
    });
  });
  return { themes: hits.map((h) => h.th.id), items: [...goals, ...habits.slice(0, 8), ...tasks.slice(0, 5)] };
}

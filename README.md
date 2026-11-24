# Do It — habits, reminders and focus for people who forget and put things off

A calm habit planner and reminder app for people who tend to forget things
and procrastinate, and want to do better. Small daily habits, reminders you
can snooze instead of ignore, a focus timer for when starting is the hard
part, and countdowns to the days that matter. The look is quiet and premium: warm paper background, deep green accent,
serif headings (Instrument Serif) and a floating frosted-glass tab bar.

One codebase (Expo SDK 58, React Native, TypeScript, Expo Router) for
**iOS, Android and web**. The web build is a **home-screen web app (PWA)**
for iPhone: it has a manifest, icons, runs full-screen, works offline and
uses a mobile layout.

```bash
npm install
npm run web          # dev server → open the printed URL
npm run build:web    # static export to ./dist (this is what Vercel/Netlify deploy)
npm run typecheck
npm start            # Expo dev server for native (Expo Go / dev build)
```

---

## Deploying from your iPhone

The repo already contains `vercel.json` and `netlify.toml`. They set the build
command (`npm run build:web`), the output folder (`dist`), the single-page-app
rewrites and the caching headers. You don't need to configure anything by hand.

### Option A: Vercel (recommended)

1. In Safari, go to **vercel.com** and tap **Sign Up → Continue with GitHub**.
2. Tap **Add New… → Project**. If `Do-It` isn't listed, tap **Adjust GitHub
   App Permissions** and give Vercel access to the repo.
3. Tap **Import** next to `Do-It`.
   - Framework Preset: **Other**. `vercel.json` handles the rest. Leave the
     build and output settings alone.
4. Tap **Deploy** and wait about 2 minutes. You'll get a URL like
   `do-it-xyz.vercel.app`.
5. **Which branch:** Vercel builds the repo's *production branch* (usually
   `main`). Either merge `claude/planner-app-expo-ckfkkw` into `main`, or set
   **Project → Settings → Git → Production Branch** to that branch. Every
   other branch you push also gets its own *preview* URL automatically.

### Option B: Netlify

1. In Safari, go to **app.netlify.com** and sign in with GitHub.
2. **Add new site → Import an existing project → GitHub** and pick `Do-It`.
3. Choose the branch to deploy. Build settings are read from
   `netlify.toml`. Tap **Deploy**.

### Install it on your home screen

1. Open the deployed URL in **Safari**. It has to be Safari, not Chrome, on iOS.
2. Tap **Share**, then **Add to Home Screen**, then **Add**.
3. Launch **Do It** from the home screen. It opens full-screen with no browser
   bars.

> Data is stored on the device. On iOS, the home-screen app has its **own
> storage**, separate from Safari tabs, so data you enter in a Safari tab
> won't appear in the installed app. Use the installed app.
> Every new deploy updates the app the next time you open it.

---

## Features

| Area | What it does |
| --- | --- |
| **Today (daily planner)** | Day title (tap for the month), week strip to pick any day, the day's plan as a timeline (Anytime first, then by time, with a Now line), and one-line smart add: "Gym tomorrow at 7am", "Dentist friday 3pm", "Read tonight" land on the right day and time with a reminder. Below: one nudge at a time, due reminders, habit rings, streak and focus cards, goals, the live focus timer, habit rings, today's reminders, quick add, next countdown |
| **Habits** | Daily or N-times-per-week habits, emoji ring to tick, streaks, week circles (tap to backfill), consistency chart, history |
| **Plan (main page)** | Day or Week planning: organise tomorrow the night before (an evening "Plan tomorrow" prompt), or a whole week. Timeline per day, month calendar from the title, one-line smart add with day and time |
| **Reminders (tab)** | Things to remember, separate from the plan: lists (Reminders, Groceries, your own), one-line add, optional alert ("Call dentist tomorrow 9am"), tick off, swipe to delete, a Done section you can clear (with Undo). Due reminders show on the main page and as notifications on native |
| **Due reminders** | Card on Today with **Done**, **Later** (15 min / 1 hour / 3 hours / tomorrow) and **Focus** (start a 5-minute session on it). Native: notification, also for snoozes. Web: the card is the reminder |
| **Focus timer** | Countdown timer with a ring: 5 ("just start") / 15 / 25 / 45 min or custom, pick what you're working on, pause, +5 min, end early. Keeps running when the app is closed. When it ends: chime/haptic, then break or keep going; a linked habit is ticked and the session counts toward your streak. Today / week stats and recent sessions |
| **Goals** | Habits tab → Goals. A goal is a bigger outcome tracked by small steps (tick them, or send one to today's reminders) or by a number (e.g. 2 of 12 books). Optional why, target date with days left, emoji and colour, linked habits, quick-start ideas. Reaching 100% marks it achieved. Top goals show on Today; weekly check-in and day-before-target notifications on native |
| **Countdowns** | Under Habits → Goals (full list via 'All'). Events grouped by category; "days left" / "days ago"; emoji icon + colour; Future / Past; search |
| **Nudges** | Daily "Plan your day" ritual, completion toasts, Gentle / Firm / Relentless strength in calm language. Native: morning prompt, evening check-in, reminders and timer end |
| **Streak & Profile** | Streak count, best, six-week calendar and habit streaks; profile with name, who you are and totals |
| **Onboarding** | Asks who you are (student / professional / athlete / other) **only** to suggest habits and reminders |
| **Fonts** | Settings → Appearance → Fonts: one-tap styles (Classic, Bookish, Soft, Modern, Bold, Easy to read), or 'Customise each font' for logo, heading and text separately, with a live preview. Options include Classic (Newsreader, the logo default), Editorial (Instrument Serif), Book, Soft, Elegant, Bold, Modern and System for logo/headings; System, Inter, DM Sans, Rounded, Easy to read (Atkinson Hyperlegible) and Serif for text. Only the chosen fonts load at start-up |
| **Look** | Day mode: the original warm off-white with a faint green glow and light dots. Night mode: true black, dark cards and a colour glow with a dotted texture; choose Forest, Ember, Electric, Violet or Mono |
| **Settings** | Opened from your initials on Today. Profile, appearance (light/dark/auto, night colour) and fonts, nudge strength, notification times, focus and break length, light/dark/auto, week start, 24h clock, erase data |

## Project structure

```
src/
  app/                      Expo Router routes (screens only)
    _layout.tsx             root: hydrate store, theme, stack, dialogs/toasts, notification sync
    (tabs)/                 Today · Habits · Reminders (planner.tsx) · Focus · Countdowns  (+ settings, hidden from the bar)
    task.tsx habit.tsx countdown.tsx plan.tsx suggestions.tsx streaks.tsx profile.tsx onboarding.tsx   (modals/flows)
  features/                 domain logic + feature components
    tasks/ habits/ countdowns/ focus/ nudges/ onboarding/
  store/
    types.ts                data model (every record has id/createdAt/updatedAt/deletedAt)
    store.ts                tiny local-first store, one storage key per slice, schema version + migrate()
    actions/                the only place state is written
    hooks.ts                useTasks/useHabits/useCountdowns/useSettings
  lib/
    storage/                StorageDriver interface + AsyncStorage driver  ← swap/wrap for sync
    notifications/          index.ts (native, expo-notifications) / index.web.ts (no-op) + pure planner
    premium.ts              plans, feature flags, limits  ← paid tier hooks in here
    dates.ts                timezone-safe YYYY-MM-DD helpers
  components/ui/            design system (Text, Button, Card, Banner, Dialog, Toast, …)
  components/TabBar.tsx     floating tab bar
  theme/                    light/dark tokens, font registry + loading (fonts.ts), shadows
public/                     index.html (PWA meta), manifest.json, sw.js, icons
```

### Adding accounts & sync later
All reads and writes go through `src/lib/storage` (`StorageDriver`). Records
already carry `id`, `updatedAt` and soft-delete `deletedAt`, so a synced
driver can merge by `updatedAt` without touching any screen. Call
`setStorageDriver()` at startup to swap it in.

### Adding a premium tier later
`src/lib/premium.ts` defines `Plan` (`free` / `premium`), `Feature` flags and
`Limits`. Gate UI with `useEntitlements().has('feature')` or
`<PremiumGate feature="…">`, and set `settings.plan` from your purchase
provider (RevenueCat / StoreKit / Stripe).

### Native builds (later)
`app.json` already has bundle IDs, icons, splash, and the notifications and
date-picker plugins. Run `npx eas-cli@latest build -p ios` once you have an
Apple developer account. Notifications and the native date/time pickers need a
development build (they aren't all in Expo Go).

## Manual test checklist
- First launch → onboarding → pick a persona → starter kit gets added.
- Today: add a reminder with quick add, tick it (toast), see the streak flame light up.
- Reminder with a time → when due, a card on Today: try **Later → In 15 minutes** (card hides, comes back), **Done**, **Focus**.
- Focus: pick 5 min and a habit, start, leave the app, come back after it ends → "Session complete", the habit is ticked.
- Planner: switch Day/Week/Month/List, create a repeating task, delete one occurrence.
- Make a task for yesterday → "still waiting" card on Today → **Review** → Move to today.
- Tap the streak pill → Streak screen; tap your initials → Profile.
- Settings → Evening check-in set to a past time → unfinished banners appear.
- Countdowns: add one in the past and one in the future; check grouping and labels.
- Habits: daily + 3×/week habit, tick, backfill a past day, open history.
- Settings → theme Dark/Light; erase everything → onboarding again.
- On iPhone: Add to Home Screen → opens full-screen, status bar blends, works offline.

## Latest additions
- Main page: **Plan | Stats**. Stats shows streak, plans done, focus, habit check-ins, reminders done, focus by day, a habit week grid and 6 months of history, and goals.
- Plans with a length ("Gym 7-8am", "Study at 4pm for 2h") show as blocks with free time between; in the evening, move unfinished plans to tomorrow in one tap.
- Habits can have a daily count ("Drink water 0/8").
- Focus sounds (web): Rain, Ocean, Deep, White, Tick.
- Four tabs: Today, Habits, Reminders, Focus.

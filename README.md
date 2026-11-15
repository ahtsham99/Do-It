# Do It — the planner that won't let you quit

A planner, habit tracker and countdown app for people who start things and
don't finish them, or forget them. It nags you like Duolingo, and it looks
calm and minimal while doing it.

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
| **Today** | Greeting, streak flame, progress, today's tasks, quick add, habits, upcoming countdowns, and big nudge banners |
| **Planner** | Tasks with date, optional time, reminder and repeat (daily / weekdays / weekly / monthly). One-tap **Day · Week · Month · List** views |
| **Nudges** | Daily "Plan your day" ritual, overdue / unfinished / streak-at-risk / reminder banners, completion toasts, and gentle / balanced / savage tone. Native: local notifications (morning prompt, evening check-in, task reminders). Web: in-app banners instead |
| **Countdowns** | Events grouped by category; "days left" / "days ago"; icon + colour per event |
| **Habits** | Daily or N-times-per-week habits, big tick, streaks, last-7-days dots (tap to backfill), 16-week history grid |
| **Onboarding** | Asks who you are (student / professional / athlete / other) **only** to suggest habits and tasks |
| **Settings** | Name, persona + suggestions, tone, notification times, light/dark/auto, week start, 24h clock, erase data |

## Project structure

```
src/
  app/                      Expo Router routes (screens only)
    _layout.tsx             root: hydrate store, theme, stack, dialogs/toasts, notification sync
    (tabs)/                 Today · Planner · Habits · Countdowns · Settings
    task.tsx habit.tsx countdown.tsx plan.tsx suggestions.tsx onboarding.tsx   (modals/flows)
  features/                 domain logic + feature components
    tasks/ habits/ countdowns/ nudges/ onboarding/
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
  theme/                    light/dark tokens
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
- Today: add a task with quick add, tick it (toast), see the streak flame light up.
- Planner: switch Day/Week/Month/List, create a repeating task, delete one occurrence.
- Make a task for yesterday → red overdue banner → **Deal with it** → Move to today.
- Settings → Evening check-in set to a past time → unfinished banners appear.
- Countdowns: add one in the past and one in the future; check grouping and labels.
- Habits: daily + 3×/week habit, tick, backfill a past day, open history.
- Settings → theme Dark/Light; erase everything → onboarding again.
- On iPhone: Add to Home Screen → opens full-screen, status bar blends, works offline.

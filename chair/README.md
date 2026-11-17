# Chair — bookings for independent barbers

A lean alternative to Booksy for UK barbers who work alone: no commission, no
marketplace, one flat monthly fee. Barbers set up their shop in a few minutes,
share a link or a QR code, and clients book in under 30 seconds with just a
name and mobile number. Classy and calm: warm ivory or near-black, brass
accent, serif headings, big tap targets. Light and dark mode.

One codebase (Expo SDK 58, React Native, TypeScript, Expo Router) for
**iOS, Android and web**. The web build is a home-screen web app (PWA).

This app lives in the `chair/` folder of the repo, separate from Do It
(which stays at the repo root). Run everything from inside `chair/`:

```bash
cd chair
npm install
npm run web          # dev server → open the printed URL
npm run build:web    # static export to ./dist (this is what Vercel/Netlify deploy)
npm run typecheck
npm run lint
npm start            # Expo dev server for native (Expo Go / dev build)
```

## Trying it on your phone

1. Deploy (below) or run `npm run web`, and open the URL on your phone.
2. Tap **Explore with a sample shop** to load *Fade & Co.* (services, hours,
   a holiday, lunch breaks, ten regulars with history and a busy week), or
   **Set up my shop** to go through the five-step setup.
3. Barber side: Calendar (day/week), Walk-in, Block, Close day, Clients,
   Link & QR, Shop settings.
4. Client side: **Link & QR → See it as a client** (or open `/b/fade-and-co`).
   Book, then use the confirmation page (the same page the text links to) to
   move or cancel.
5. **Shop → Texts to clients** shows every text: what was sent and what is
   scheduled.

> **Test mode.** There is no server yet, so everything lives on the device:
> the client booking page and the barber's calendar share the same storage.
> That means you can test both sides on one phone, but a booking made on a
> friend's phone won't reach yours. Texts are shown in the outbox instead of
> being sent, and deposits are marked paid without charging a card.

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
   - **Root Directory: `chair`** (tap *Edit* next to it). This is what makes Vercel build the barber app instead of Do It. Use a separate Vercel project from your Do It one.
   - Framework Preset: **Other**. `vercel.json` handles the rest. Leave the
     build and output settings alone.
4. Tap **Deploy** and wait about 2 minutes. You'll get a URL like
   `chair-xyz.vercel.app`.
5. **Which branch:** Vercel builds the repo's *production branch* (usually
   `main`). Either merge `claude/barber-booking-app-r2dkm7` into `main`, or set
   **Project → Settings → Git → Production Branch** to that branch. Every
   other branch you push also gets its own *preview* URL automatically.

### Option B: Netlify

1. In Safari, go to **app.netlify.com** and sign in with GitHub.
2. **Add new site → Import an existing project → GitHub** and pick `Do-It`.
3. Choose the branch to deploy. Set **Base directory** to `chair`. Build settings are then read from
   `chair/netlify.toml`. Tap **Deploy**.

### Install it on your home screen

1. Open the deployed URL in **Safari**. It has to be Safari, not Chrome, on iOS.
2. Tap **Share**, then **Add to Home Screen**, then **Add**.
3. Launch **Chair** from the home screen. It opens full-screen with no browser
   bars.

> Data is stored on the device. On iOS, the home-screen app has its **own
> storage**, separate from Safari tabs, so data you enter in a Safari tab
> won't appear in the installed app. Use the installed app.
> Every new deploy updates the app the next time you open it.

---

## Features

| Area | What it does |
| --- | --- |
| **Setup** | 5 steps: shop profile (name, address, phone, photo, bio) → services (name, £, minutes) → weekly hours → deposit & cancellation → your link + QR |
| **Calendar** | Day view (hour timeline, tap any gap to add a walk-in or block it) and week view (each day's bookings and takings). Now-line, closed days greyed |
| **Block time** | One tap: next 30 min, next hour, rest of the day, or a custom block (lunch, break, emergency). Asks before landing on a booking |
| **Walk-ins** | Service + time, name and mobile optional. Checked against bookings and blocks |
| **Days off** | Close a day from the calendar, or add holidays (ranges). Bookings on those days are cancelled, deposits refunded and every client texted automatically. Same when a weekday is switched to closed |
| **Deposits** | Optional, barber sets the amount. Refunded if cancelled inside the free window or by the shop, kept on late cancellation or no-show |
| **Cancellation rule** | Free cancellation up to *any time / 2 / 12 / 24 / 48 hours* before. The rule is saved on each booking, so changing it later doesn't change existing bookings |
| **Link & QR** | `/b/<shop-slug>`, copy/share, printable A4 QR poster. The link is fixed once setup finishes so printed posters keep working |
| **Clients** | Search by name or number; visits, spend, no-shows, notes, upcoming bookings, call/text buttons |
| **Client booking** | Service → only genuinely free times → name + mobile → confirmation. Deposit and cancellation rules in plain English before booking, with a warning if the chosen time is already inside the window |
| **Manage link** | `/a/<token>` in every text: see, move (inside the window) or cancel |
| **Texts** | Confirmation, reminder at 6pm the day before, reminder 1 hour before, moved, cancelled. Each includes the manage link |

### Booking rules (one place: `src/features/booking/rules.ts`)
- A slot must fit inside the day's hours, not overlap any confirmed booking or
  blocked time, respect minimum notice (30 min) and the booking window (28 days).
- Candidate start times are every 15 minutes **plus** the moment each booking
  or block ends, so a 40-minute fade at 10:00 leaves a 10:40 slot, not 10:45.
- `createBooking` re-checks the slot at the moment of saving, so two people can
  never take the same time.
- Closed days (weekly or time off) offer no slots, so nobody can pay a deposit
  for them.
- **UK time everywhere.** Days are `YYYY-MM-DD`, times are minutes after
  midnight UK time. `src/lib/dates.ts` converts with the GMT/BST rules, so the
  phone's own time zone never shifts a booking.

## Project structure

```
src/
  app/                      Expo Router routes (screens only)
    index.tsx               welcome (or → calendar once set up)
    setup.tsx               5-step setup flow
    (barber)/               tabs: calendar · clients · share (Link & QR) · settings (Shop)
    booking/[id] client/[id] walk-in block messages poster edit/[section]   (modals)
    b/[slug].tsx            public booking page (no login)
    a/[token].tsx           client's manage page: confirm / move / cancel
  features/
    booking/                rules.ts (slots, closures, cancellation), wording.ts, SlotPicker, PolicyBox
    calendar/               DayTimeline, WeekAgenda, WeekStrip, quick block
    shop/                   ProfileForm, ServicesEditor, HoursEditor, PoliciesForm, TimeOffEditor, QR code
    clients/                visit stats
  store/
    types.ts                data model (records carry id/createdAt/updatedAt/deletedAt for sync)
    store.ts                tiny local-first store, one storage key per slice
    actions/                the only place state is written (bookings.ts holds all booking side effects)
  lib/
    dates.ts                UK time helpers        phone.ts   UK mobile numbers
    sms/                    text templates + outbox notes      links.ts   public URLs
    storage/                StorageDriver interface + AsyncStorage driver
  components/ui/            design system (Text, Button, Card, Dialog, Toast, …)
  theme/                    light/dark tokens, serif font
```

## Going live: what comes next
- **Server + sync.** Swap the storage driver (`setStorageDriver`) for one that
  talks to an API (e.g. Supabase/Postgres) so the public booking page and the
  barber's phone share one database. Move `createBooking` behind the API with a
  database constraint so double bookings are impossible across devices.
- **Real texts.** A scheduled job sends rows from `messages` whose `sendAt` has
  passed, via Twilio/Vonage/MessageBird. The wording is already in
  `src/lib/sms/templates.ts`.
- **Deposits.** Stripe Checkout/Payment Element at the "Pay deposit & book"
  step; refunds triggered where the app marks a deposit `refunded`.
- **Accounts + billing** for barbers (the flat monthly fee), and set
  `expo.extra.publicUrl` in `app.json` to your domain so links and QR codes
  point at it.

## Manual test checklist
- Welcome → **Explore with a sample shop** → calendar shows today with bookings, lunch block and now-line.
- Tap an empty gap → *Add a walk-in here* → save; try a time that overlaps a booking (refused).
- **Block** → *Next hour* over a booking → choose *Keep* or *Cancel and text*.
- **Close day** on a day with bookings → bookings vanish, banner shows, Shop → Texts → Sent shows the cancellation texts.
- Shop → Working hours → switch a weekday off with bookings → confirm → clients texted.
- Link & QR → *See it as a client* → book; the time disappears from the slot list; the closed day says *Closed*.
- On the confirmation page: *Change time*, then *Cancel booking* (deposit refunded). Book a slot within 24 hours and check the warning and the kept-deposit wording.
- Shop → Deposit & cancellations: toggle deposit, change hours; preview text updates.
- Shop → Appearance: Light / Dark.

# Lead & Grow — Leadership Development & Mental Wellness Platform

A premium, cinematic leadership-development app: a scroll-driven one-page marketing
experience, a customer dashboard app (assessment → personalized 15-minute daily
practice → progress tracking), and a full admin panel — built on Vite + React 18 +
TypeScript, Tailwind, and Supabase (Postgres + Auth), deployed on Vercel.

## Stack

- **Frontend:** Vite, React 18, TypeScript, Tailwind CSS, React Router, lucide-react, recharts
- **Backend:** Supabase (Postgres, Auth, Row Level Security) — no separate server to run
- **Video:** WebCodecs + mp4box.js scroll-scrubbed frame bank, with automatic fallback
  to standard `<video>` seeking
- **Deployment:** Vercel (static Vite build + `vercel.json` SPA rewrites)

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL Editor and run, in order:
   - `supabase/migrations/0001_init.sql` (tables, RLS policies, triggers) — a one-time
     schema migration; re-running it on the same database will error on
     already-exists (as any migration would), so only run it once per project.
   - `supabase/migrations/0002_seed.sql` (12 parameters, 36 questions, 5 stages,
     achievements, sample content library) — safe to re-run any time; it upserts.

   (If you have the Supabase CLI linked to this project, `supabase db push` runs both.)

   Both files were verified by running them against a real local Postgres 16
   instance (with a stub `auth` schema standing in for Supabase Auth) end-to-end
   before delivery — schema creation, RLS policies, the `handle_new_user` signup
   trigger, and the seed data (12/36/5/5/14 rows) all applied without error.
3. In **Project Settings → API**, copy the **Project URL** and **anon public key**.

### Create your first admin user

Sign up normally through the app (`/signup`), then in the SQL Editor run:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

You'll then see an **Admin Panel** link in the customer app sidebar.

## 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_HERO_VIDEO_URL=https://your-cdn.example.com/hero.mp4   # optional, see below
```

## 3. Install & run

```bash
npm install
npm run dev
```

> **Note on this delivery:** this project was authored in a sandbox without access to
> the npm registry, so `npm install` has **not** been run or verified here. Run
> `npm install` and `npm run build` locally (or let Vercel do it) as your first step —
> if TypeScript surfaces anything, the likely spot is `src/hooks/useVideoScrub.ts`
> (marked `@ts-nocheck` on purpose, since `mp4box` ships no official types) or a minor
> version mismatch in `package.json`.

## 4. The hero video

The marketing page (`/`) expects a cinematic yoga / breathwork / leadership video that:

- visually progresses from mental noise → pause/breath → stillness/yoga → clarity/confidence
- is served with **CORS enabled** (the frame-bank fetch uses `mode: 'cors'`)
- is reasonably short (~20–40s) since it's fully scroll-scrubbed, not played on a timeline

Set its URL via `VITE_HERO_VIDEO_URL`. Until you provide one, a placeholder cinematic
nature clip is used so the scroll architecture is fully visible and testable. If the
video host doesn't support CORS, or a browser lacks WebCodecs, the page still works —
`useVideoScrub` automatically falls back to scrubbing the plain `<video>` element via
`currentTime`.

## 5. Deploy to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket and import it in Vercel, **or** run `vercel`
   from this directory.
2. Vercel auto-detects Vite via `vercel.json`. Add the same environment variables
   (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_HERO_VIDEO_URL`) in
   **Project Settings → Environment Variables**.
3. Deploy. `vercel.json` includes an SPA rewrite so client-side routes
   (`/app/*`, `/admin/*`) resolve correctly on refresh.

## Project structure

```
src/
  components/
    marketing/    the 500vh cinematic one-pager (video, navbar, 3 scroll sections)
    auth/          login / signup
    layout/        customer app shell + sidebar
    dashboard/      Dashboard (score ring, strengths, today's plan)
    assessment/     12-parameter / 36-question assessment flow + radar results
    practice/       4-stage 15-minute daily practice (Reset → Learn → Practice → Reflect)
    plan/           My Plan (personalized recommendations)
    progress/       score-over-time + parameter breakdown charts
    reflections/    journal
    resources/      content library browser
    achievements/   badges
    settings/       profile settings
    admin/          admin panel: users, assessment builder, content library, analytics
  hooks/
    useVideoScrub.ts   WebCodecs/mp4box scroll-scrub engine (see file header for details)
  lib/
    supabaseClient.ts, database.types.ts, api.ts (all Supabase reads/writes),
    scoring.ts (Likert → 0-100 scoring), plan.ts (today's-practice selection)
  context/AuthContext.tsx
supabase/migrations/   SQL schema + seed data
```

## Data model & security

All customer/business data lives in Postgres behind Row Level Security:

- Customers can only read/write their **own** assessment sessions, answers, scores,
  practice sessions, reflections, and achievements.
- Reference data (parameters, questions, leadership stages, content library,
  achievements) is readable by any signed-in user, writable only by `role = 'admin'`.
- Admins (`profiles.role = 'admin'`) can read and write **any** user's data — this is
  what powers the admin panel's user list, per-user detail view, and analytics.

See `supabase/migrations/0001_init.sql` for the full policy set.

## What the admin panel covers

- **Users & customer accounts** — search, view leadership score/stage/streak, promote
  to admin, drill into a customer's assessment and practice history.
- **Assessment questions & 12 parameters** — edit parameter names/descriptions, and
  add/edit/delete the Likert questions under each.
- **Content library** — create/edit/hide the videos and exercises recommended across
  the Reset / Learn / Practice / Reflect stages, and which leadership parameter each
  targets.
- **Analytics & reporting** — customer count, assessments completed, practice
  completion rate, weekly engagement, and leadership-stage distribution.

## Explicitly out of scope (per the original spec)

No pricing, testimonials, blog, FAQ, cookie widgets, or social sections were added to
the marketing page. This is a leadership-development and wellness platform, not a
medical or psychological diagnostic tool — no such claims are made anywhere in the
product copy.

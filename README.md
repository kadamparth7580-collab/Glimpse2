# Glimpse

*A small place for ordinary moments.*

A private app for exactly two people to share one photo a day. Tap **Share a
Glimpse**, take a photo, and it disappears from the feed 24 hours later.
Comments (text or emoji) live in a thread under each photo.

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS, and Supabase
(Auth, Postgres, Storage, Realtime).

---

## 1. Folder structure

```
glimpse/
├── README.md
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── .env.local.example
├── .gitignore
├── supabase/
│   └── schema.sql                 # tables, RLS policies, storage bucket
└── src/
    ├── middleware.ts              # refreshes Supabase session, guards routes
    ├── app/
    │   ├── layout.tsx             # root layout, fonts, mobile shell
    │   ├── globals.css            # Tailwind + base styles
    │   ├── page.tsx               # feed (server component)
    │   ├── login/
    │   │   └── page.tsx
    │   ├── camera/
    │   │   └── page.tsx           # "Share a Glimpse" flow
    │   └── glimpse/
    │       └── [id]/
    │           └── page.tsx       # photo + comment thread
    ├── components/
    │   ├── AuthForm.tsx
    │   ├── Header.tsx
    │   ├── LogoutButton.tsx
    │   ├── EmptyState.tsx
    │   ├── ShareButton.tsx
    │   ├── CountdownTimer.tsx
    │   ├── GlimpseCard.tsx
    │   ├── CameraCapture.tsx
    │   ├── CommentThread.tsx
    │   ├── CommentItem.tsx
    │   └── CommentInput.tsx
    └── lib/
        ├── types.ts
        ├── utils.ts
        └── supabase/
            ├── client.ts          # browser client
            ├── server.ts          # server component / action client
            └── middleware.ts      # session refresh helper
```

---

## 2. How it works

- **Auth** — email/password via Supabase Auth. There is no public sign-up
  screen on purpose: this app is for exactly two people. You create both
  accounts yourself from the Supabase dashboard (step 5 below).
- **Camera-first sharing** — `/camera` opens the device's native camera
  (via `<input type="file" accept="image/*" capture="environment">`, the
  most reliable cross-device way to do this on mobile web), shows a preview,
  and offers **Retake** / **Looks Good**. "Looks Good" uploads the photo to
  Supabase Storage and inserts a row into `glimpses` with `expires_at` set
  24 hours out.
- **Feed** — the home page queries `glimpses` where `expires_at > now()`,
  ordered newest first. Each card shows the poster's name, the time posted,
  and a live countdown to expiry.
- **Expiry** — handled at query time (`expires_at > now()`), so nothing needs
  a cron job to "delete" anything — expired glimpses simply stop showing up.
  An optional cleanup job is described in step 6 if you'd like to actually
  remove old rows/files.
- **Threads** — every glimpse has a detail page with a comment thread.
  Comments can be plain text or emoji; a quick-emoji row sits above the text
  input. New comments appear instantly via Supabase Realtime.
- **Empty state** — shown when there are no active glimpses.

---

## 3. Supabase SQL schema

Run `supabase/schema.sql` (also reproduced below) in your project's
**SQL Editor**. It creates:

- `profiles` — display name per user, auto-populated by a trigger on
  `auth.users`.
- `glimpses` — `id, user_id, image_url, created_at, expires_at`.
- `comments` — `id, glimpse_id, user_id, content, created_at`.
- Row Level Security policies scoping writes to the authenticated owner,
  while allowing both signed-in users to read everything.
- A public `glimpses` Storage bucket with policies so each user can only
  upload/delete inside their own `user_id/` folder.
- Adds `comments` to the `supabase_realtime` publication for live threads.

```sql
-- See supabase/schema.sql in this project for the full, commented file.
```

---

## 4. Environment variables

Create `.env.local` in the project root (there's an example file at
`.env.local.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

Both values are on **Project Settings → API** in your Supabase dashboard.

---

## 5. Supabase project setup (one time)

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and run `supabase/schema.sql`.
3. Go to **Authentication → Providers** and make sure **Email** is enabled.
   Under **Authentication → Settings**, turn **off** "Enable email
   confirmations" if you want the two of you to be able to sign in the
   moment you set a password (optional, but simpler for a 2-person app).
4. Go to **Authentication → Users → Add user** and create exactly two
   accounts (one per person), setting an email + password for each. You can
   optionally set `user_metadata` → `display_name` for each, e.g.
   `{ "display_name": "Sam" }` — otherwise the name shown in the app
   defaults to the part of the email before the `@`.
5. Confirm a `glimpses` bucket now exists under **Storage** (created by the
   SQL script) and that it's marked public.

---

## 6. Commands to run locally

```bash
# 1. Install dependencies
npm install

# 2. Add your Supabase credentials
cp .env.local.example .env.local
# then edit .env.local with your project's URL + anon key

# 3. Run the dev server
npm run dev

# App is now at http://localhost:3000
```

To test the camera flow on an actual phone during development, use a tunnel
(e.g. `npx ngrok http 3000`) since browsers require HTTPS (or localhost) to
access the camera.

**Optional: automatic cleanup of old rows/files.** Expired glimpses already
disappear from the feed via the query filter, but if you'd like to actually
delete old storage files and rows, add a Supabase **Edge Function** on a
**Cron Trigger** (Database → Cron, or `supabase functions schedule`) that
runs daily and deletes `glimpses` rows where `expires_at < now() - interval
'7 days'` (and their storage objects) — this is a nice-to-have, not required
for the app to behave correctly.

---

## 7. Deploying to Vercel

1. Push this project to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Vercel auto-detects Next.js — no build settings need to change.
5. Once deployed, open the Vercel URL on your phone, sign in with one of the
   two accounts you created in step 5, and add it to your home screen for an
   app-like feel (Safari/Chrome → Share → "Add to Home Screen").

That's it — both of you sign in with your own account on the same URL and
you'll see each other's glimpses and threads.

---

## Design

| Token | Value |
|---|---|
| Background | `#F7F3EE` (cream) |
| Accent | `#6B8F71` (sage green) |
| Cards | `#FFFFFF` |
| Text | `#2E2E2E` |
| Display type | Fraunces (italic, warm serif) |
| Body type | Inter |

Mobile-first, single centered column (max-width `28rem`), large rounded photo
cards, minimal chrome — deliberately quieter than a typical social feed.

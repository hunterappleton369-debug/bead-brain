# Child Phenoms

Mental math superpowers for kids. A self-contained soroban (Japanese abacus) program for children, run by a parent at home. (Formerly Bead Brain; the GitHub repo and Pages URL still carry the old name until renamed.) Ten stages take a child from reading beads to competition-style mental arithmetic. No build step and no server of its own: open `index.html` through any static web server and progress is saved in the browser. A parent can also sign in with an email link, and then the children and their progress follow them to any device (Supabase, see **Accounts** below).

**Live site:** https://childphenoms.com/ (custom domain; until its DNS flips, https://hunterappleton369-debug.github.io/bead-brain/). Funnel: `/free-abacus/`. Launch state: `docs/LAUNCH-CHECKLIST.md`.

## Run it

```bash
node serve.mjs
```

Then open http://localhost:8787. Any static host works too (GitHub Pages, Netlify, an S3 bucket): upload the folder as is.

## Deploy

The site is hosted on GitHub Pages from the `main` branch of [hunterappleton369-debug/bead-brain](https://github.com/hunterappleton369-debug/bead-brain), served from the repo root. There is no build step, so redeploying is just a push:

```bash
git add -A && git commit -m "Describe the change" && git push
```

GitHub rebuilds the site within a minute or two of the push. Check progress at https://github.com/hunterappleton369-debug/bead-brain/actions or with `gh api repos/hunterappleton369-debug/bead-brain/pages/builds/latest --jq .status`.

## What is in the box

| Path | What it does |
|---|---|
| `index.html` | Shell page and navigation |
| `js/soroban.js` | Soroban model. Classifies every bead move as direct, small friend, big friend or combination, with carries. The 34 formulas live here. |
| `js/generator.js` | Problem generators. Add/subtract problems are simulated and rejected unless every move is inside the allowed formula set and the required formula appears. Also multiplication, division, flash sequences, times tables. |
| `js/abacus.js` | Interactive SVG soroban with hand-drawn styling and step-by-step animated explanations. |
| `js/drills.js` | Drill runner: reading, setting, single-column, carry/borrow, stacked problems, flash anzan, dictation (speech synthesis), times tables, multiply, divide. Explains wrong answers by replaying them on the beads. |
| `js/curriculum.js` | The ten stages, 76 lessons, boss tests, daily quests. |
| `js/ladder.js` | Bead Score ladder test (20 rungs), Times ladder (10 rungs), age-ranked chart. |
| `js/store.js` | Progress in localStorage: profiles, XP, streaks, lesson results, boss results, test history. Fires `onChange` / `onRemove` hooks that `auth.js` listens to. |
| `js/auth.js` | Parent accounts and sync: magic-link sign-in, pull on load, debounced push after every save. Loads `@supabase/supabase-js` from a CDN only when `config.js` is filled in. |
| `js/config.js` | The Supabase project URL and publishable key. Empty = no accounts, browser-only progress. |
| `supabase/schema.sql` | The three tables, the trigger that creates a parent row for each auth user, and the row-level-security policies. |
| `js/guide.js` | Parent guide and plan page copy. |
| `js/coach.js` | Coach tips, needs strips, "stuck?" help, plain-English stage outcomes, first-steps checklist. |
| `js/art.js` | Logo mark, colored-pencil stage badges, comic bursts and pencil icons. |
| `css/style.css` | White paper, ink and pop-color design system (see `DESIGN.md`). |
| `DESIGN.md` | The design system in awesome-design-md format. Build new pages to it. |
| `img/*.webp` | Pencil-drawn illustrations generated with Higgsfield (GPT Image 2.5, transparent). Originals in `img/gen/` (gitignored). |
| `docs/` | The plan and research notes as Markdown. |

## The stages

1. **Sprout** – read and set numbers, direct moves
2. **Explorer** – small friends (the eight 5-formulas)
3. **Apprentice** – big friends (the eighteen 10-formulas), carries and borrows
4. **Adept** – combination formulas; all 34 complete; 3-digit numbers
5. **Ace** – speed on the beads, 2-digit mental, flash anzan begins, first Bead Score
6. **Wizard** – multiplication
7. **Champion** – division; 3-digit mental begins
8. **Prodigy** – ten 3-digit lines mentally, 3-digit flash, mental 2×2
9. **Grandmaster** – dan-level flash, 4-digit mental, 3×2 and 4÷2 mentally
10. **Legend** – competition flash speeds, 3×3 mentally

## Sign-ups

`#/start` creates a child profile (name, age, optional parent email) in localStorage under `beadbrain.v1`, so progress from the Bead Brain era carries over. With accounts switched on (below), entering a parent email also sends a sign-in link; without one, the email is only kept on the profile (`profile.parentEmail`).

## Accounts

Parents sign in with a magic link (no password). The browser stays the source of truth: every save goes to localStorage first, and when a parent is signed in the changed profile is mirrored to Supabase at most once every 2 seconds. On load the app pulls the account's children and the newest copy of each profile wins (last write wins, by the profile's `updated` stamp). Signed out, or with the CDN unreachable, the site behaves exactly as before.

What the server holds, all behind row-level security so a parent only ever sees their own rows:

| Table | Columns |
|---|---|
| `parents` | `id` (= `auth.users.id`), `email`, `created_at`. Filled by a trigger when the auth user is created. |
| `children` | `id` (the browser's profile id), `parent_id`, `name`, `age`, `created_at`. Primary key `(parent_id, id)`. |
| `progress` | `parent_id`, `child_id`, `data` (the whole profile as JSON), `updated_at`. One row per child. |

Removing a child on the Family page removes it on the server too, and other devices drop it on their next load. "Download progress" and "Load progress" still work; a loaded file wins over the account copy.

### Setup

1. **Project.** Create a Supabase project (or pick one). In the SQL editor run `supabase/schema.sql`, or apply it as a migration through the Supabase MCP connector. The script is safe to re-run.
2. **Keys.** Put the project URL and the *publishable* key (`sb_publishable_…`, from Project Settings → API Keys) into `js/config.js`. They are public by design; the policies in the schema are what protect the data. Never put a secret or service-role key there.
3. **Redirect URLs** (manual, in the dashboard: Authentication → URL Configuration). Until this is done the magic link always lands on the default Site URL, `http://localhost:3000`.
   - Site URL: `https://childphenoms.com`
   - Redirect URLs: `http://localhost:8787/**`, `https://hunterappleton369-debug.github.io/bead-brain/**`, `https://childphenoms.com/**`, `https://www.childphenoms.com/**`

   The magic link sends the parent back to whichever origin they signed in from (`auth.redirectURL()`), so every origin the site is served from must be on the list. The session arrives in the URL hash (`#access_token=…`); `app.js` recognises that hash and shows a "Signing you in" box instead of a route. The same settings can be pushed in one command with a personal access token (Account → Access Tokens in the Supabase dashboard): `SUPABASE_ACCESS_TOKEN=sbp_… supabase/set-auth-urls.sh`, which PATCHes `site_url` and `uri_allow_list` through the Management API and prints what is now set.
4. **Email** (later, once childphenoms.com is live). Supabase's built-in mailer only delivers to members of the Supabase organisation and allows a couple of messages an hour, which is enough to test with the owner's address and nothing more. Before real families sign up, plug a sending domain into Authentication → SMTP Settings. Nothing in the code changes for this. With Resend the job is:
   1. In Resend, add the domain `childphenoms.com` and copy the DNS records it shows. They are always the same three kinds, added at the registrar (GoDaddy):
      - **SPF**: a TXT record on `send.childphenoms.com` (Resend's default subdomain for the return path) with the value Resend gives, of the form `v=spf1 include:amazonses.com ~all`, plus an MX record on the same name pointing at Resend's feedback host (`feedback-smtp.<region>.amazonses.com`, priority 10).
      - **DKIM**: a TXT record on `resend._domainkey.childphenoms.com` with the long `p=…` public key Resend shows.
      - **DMARC**: a TXT record on `_dmarc.childphenoms.com`, start with `v=DMARC1; p=none; rua=mailto:hello@childphenoms.com` and tighten to `p=quarantine` once reports look clean.
   2. Create a Resend API key (Sending access is enough).
   3. In Supabase, Authentication → SMTP Settings → Enable Custom SMTP:
      - Sender email: `hello@childphenoms.com` · Sender name: `Child Phenoms`
      - Host: `smtp.resend.com` · Port: `465` (or `587`)
      - Username: `resend` · Password: the API key
   4. Authentication → Rate Limits: raise "emails sent per hour" from the default 30 to something sensible for sign-ups.
   5. Authentication → Email Templates: rewrite "Magic Link" and "Confirm signup" in the site's voice (keep `{{ .ConfirmationURL }}` as the link). Send one to the owner's address and click it from a phone.

   Postmark or Brevo work the same way: their own host, port, username and password in step 3, their own SPF/DKIM values in step 1.
5. **Try it.** `node serve.mjs`, open http://localhost:8787/#/start, create a profile with your email, click the link in the email, then open the site in a private window and sign in from `#/start/signin`: the same children and progress should appear. Rows show up in `children` and `progress` within two seconds of any save.

The live project is `child-phenoms` (ref `fndemnipqtpmuvcidcxo`, Cuspdental org, us-west-1); its URL and publishable key are already in `js/config.js`. Test accounts use hunterappleton369@gmail.com only.

Local sync bookkeeping (which ids this account already has on the server, deletes not yet sent) lives in localStorage under `beadbrain.sync.v1` and is per device.

## About the ranking chart

Percentile lines are estimates built from grade-level expectations for mental arithmetic, not a measured sample. The site says so on the chart. A child's own test history is the real measure.

## Credits

Written from scratch. The problem-constraint approach (classify each rod move, reject problems that use untaught moves) follows the pattern used by several open-source soroban trainers, among them penko-soroban (GPL) and pove/soroban (MIT); no code was copied. Exam levels are from the Japanese chambers of commerce, Nihon Shuzan Renmei, Zenshuren and the Japan Flash Anzan Association. Research citations are in the parent guide.

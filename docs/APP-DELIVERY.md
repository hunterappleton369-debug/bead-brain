# App delivery: account, member library, instructor directory

Built 2026-10-21. The funnel promises three things the app did not have: billing you can manage "from your account page", practice handouts "printed on demand" plus a library you "keep even if you cancel", and "your name in the directory parents search". This file says what was added, how the membership flag and the Stripe portal link get set, and what is still yours to do. Nothing is committed or pushed.

## 1. What was added

| Route | What it is | Who sees it |
|---|---|---|
| `#/account` | Parent email, membership state, "Manage billing / Pause for a month / Cancel", the children on the account. A trial shows the day count and a "What day 14 means" box with real dates. | Everyone (signed-out parents get a sign-in button) |
| `#/library` | All 10 stages of the Prodigy Secrets Program, every lesson with a "Print sheet" button, a boss-prep sheet per stage. | Members, and past members who keep the library |
| `#/library/3` (or `start`, `bosses`) | The book pages of one stage, readable on a phone. "Print the whole stage" or "Print this page". | Same |
| `#/print/<stage>/<lesson>/<sheet no.>` | A fresh 20-problem practice sheet for that lesson, built and re-checked in the browser, then `window.print()`. Same sheet number = same numbers. | Running members only (see §3) |
| `#/instructors` (or `#/instructors/CO`) | Public Certified Phenom Instructor directory: search by state, city or ZIP, in person or online. Plus the "Get listed" template and the badge rules. | Everyone |
| `childphenoms.com/instructors/` | `instructors/index.html`, a redirect into the directory for flyers and the certificate email. `?state=CO` works. | Everyone |

Smaller changes: "Library" in the top nav, "Account & billing" and "Find an instructor" in the footer, a "Membership and billing" link on the Family page, and a "Print a practice sheet" button on each lesson page for members.

| File | Role |
|---|---|
| `js/membership.js` | Reads the membership row, works out the state (trial day, renewal, cancelled, paused…) and what each feature needs. The access rules are the `ACCESS` table at the top. |
| `js/account.js`, `js/library.js`, `js/instructors.js`, `js/ui.js` | The pages. |
| `js/handouts.js` | Browser port of `docs/products/practice-handouts/tools/make-handouts.mjs`. Same seeds, same checks. |
| `js/lesson-notes.js` | Generated copy of the handouts' lesson notes. Do not edit; edit the source in `docs/products/…` and rebuild. |
| `library/*.json` | The Prodigy Secrets Program as HTML pages, generated from `docs/products/prodigy-secrets-program/*.md`. |
| `tools/build-members.mjs` | Rebuilds the two generated items above and checks the handout port (see §3). |
| `instructors/instructors.json` | The live directory list (empty today). `instructors/sample.json` is test data that only loads on localhost. |
| `supabase/memberships.sql` | The membership table. Not applied yet. |
| `css/members.css` | Styles and print rules for all of the above. |
| `js/config.js` | New: `STRIPE_PORTAL_URL` (empty, `[HUNTER]`), `SUPPORT_EMAIL`, `MEMBER_PRICE`, `JOIN_URL`, `CERTIFY_URL`. |
| `js/app.js`, `js/auth.js`, `index.html` | Routes and links; `auth.client()` so the membership read can use the same Supabase client. |

## 2. The Stripe portal link (billing, cancel, receipts)

The site is static, so "Manage billing", "Cancel" and "Update my card" open Stripe's hosted customer portal. Until the link is set, those buttons open an email to hello@childphenoms.com instead, so nothing is broken in the meantime.

1. Do `docs/products/legal-and-ops/stripe-setup.md` §5 (Settings → Billing → **Customer portal**). One change from that guide: set **Default redirect link** to `SITE/#/account` instead of `SITE/#/start`, so a parent lands back on their account page.
2. Copy the **Login link** (looks like `https://billing.stripe.com/p/login/...`; in test mode it contains `test_`).
3. Open `js/config.js` and paste it between the quotes of `STRIPE_PORTAL_URL`.
4. Push the site (your call).

Finish signal: on `#/account`, signed in as a member, "Manage billing" opens the Stripe login page in a new tab with the parent's email already filled in. At go-live, repeat steps 2 and 3 with the live-mode link.

**Pause** is not in Stripe's portal (stripe-setup.md §5), so "Pause for a month" and "Start again now" open an email to support, and you pause by hand (`ops-runbook.md` §3.8). The funnel says "Pause for a month at a time from your account page"; the button is on the account page, but the pause itself is manual.

## 3. The membership flag

There was no membership flag in the app. It is now one row per paying email in a Supabase table, `memberships`. A signed-in parent can read only their own row and only the columns the page needs (not `stripe_customer_id` or `note`). The browser cannot write it. You write it.

### Apply the table (once)

1. Supabase dashboard → project **child-phenoms** → **SQL Editor** → **New query**.
2. Paste all of `supabase/memberships.sql` and press **Run**.

Finish signal: **Table Editor** lists `memberships`. Checked today: the live project answers `PGRST205 Could not find the table 'public.memberships'`, so it is not there yet. Until it is, everyone is treated as "no membership" and the library stays locked.

### Add or change a member

The row's `email` must be the email they paid with in Stripe, and they must sign in to the app with that same email (magic link). Table Editor → `memberships` → **Insert row**, or use the commented examples at the bottom of `supabase/memberships.sql`.

| What happened in Stripe | Change in `memberships` |
|---|---|
| Test drive started (University link paid) | New row: `email`, `status` = `trialing`, `trial_end` = Stripe's "Trial ends" date (the day of the first $67 charge), `stripe_customer_id` |
| First $67 charge went through | `status` = `active`, `trial_end` empty, `current_period_end` = next renewal date |
| They cancelled in the portal | `cancel_at` = the date Stripe shows under "Cancels" |
| That date passed | `status` = `canceled` (the page already treats a past `cancel_at` as ended) |
| A payment failed | `status` = `past_due`; back to `active` when it is paid |
| You paused them (runbook §3.8) | `status` = `paused`, `paused_until` = resume date; back to `active` when it resumes |
| Certification bought ($297) | New row: `plan` = `instructor`, `status` = `active`, `current_period_end` = one year out |
| They should not keep the library (refund, chargeback) | `keeps_library` = false |

Finish signal: the parent signs in and `#/account` shows "Test drive · day N of 14" (or Active, and so on), and `#/library` opens.

Who gets what (`ACCESS` in `js/membership.js`):

- **Library pages** (the Prodigy Secrets Program): `trialing`, `active`, `past_due`, and anyone with `keeps_library` = true, including after a cancel. This is the "keep it even if you cancel" promise.
- **Fresh practice sheets**: `trialing`, `active`, `past_due` only. A cancelled keeper still has every lesson page's printed 10-problem drill. To let keepers print fresh sheets too, change one line in `ACCESS` (the comment above it says how).

Doing this by hand gets heavy past a few dozen members. The next step is a Stripe webhook (a Supabase Edge Function on `customer.subscription.*` events) that writes this table. Not built.

### What "day 14" shows

Stripe charges on the trial end date, 14 days after sign-up. Signed up October 21 → the 14 free days run through November 3 → the first $67 is charged November 4. The account page names those exact dates rather than saying "day 14", because the funnel FAQ ("What happens on day 14? Your card is charged $67") is one day off from Stripe for the parent who counts sign-up day as day 1.

## 4. Library and handouts

- `#/print/...` builds the sheet in the browser with the app's own generators, then re-checks every problem with the soroban model before showing it. If a check ever fails it moves to the next sheet number rather than print a bad page.
- A new sheet number is picked each time and written into the address, so "New numbers" gives a fresh page and reopening the address gives the same page again.
- The port matches the CLI exactly: for the samples' seed it prints all 86 sheets byte for byte the same as `docs/products/practice-handouts/samples/`. One change: the search for 1-digit mental rounds now skips combinations that already break the lesson's rules. Same results in the same order, 68 ms instead of 3 s for the slowest sheet, which matters on a phone.
- Book pages come from `library/*.json`. A lesson prints on one Letter page, or two for the long 5-line and flash drills. Each lesson starts on a new sheet.

When `docs/products/` changes (a lesson note, a stage file, the CLI's rules), run from the repo root:

```bash
node tools/build-members.mjs
```

It rewrites `js/lesson-notes.js` and `library/*.json`, then checks the port against the samples and exits with an error if they drift. Regenerate the samples with the CLI first if the CLI changed. `node tools/build-members.mjs --check` runs only the check.

**The gate is not a vault.** The site is static on GitHub Pages: `library/*.json` can be fetched by anyone who knows the address, and `docs/products/` (all manuscripts, the exam keys) becomes public too the day it is committed and pushed. The membership flag decides what the app shows, not what the server serves. If that matters, keep `docs/products/` out of the published repo and move `library/` to a private Supabase Storage bucket with a policy on the `memberships` table.

## 5. Instructor directory

The list is `instructors/instructors.json`, reviewed by you and published with the site. Only rows with `"status": "live"` show. Instructor emails never appear: the "Ask about a class" button opens the instructor's own booking link if they gave one, or else emails hello@childphenoms.com with the instructor's name and certificate number in the subject, for you to pass on.

| Field | Example | Notes |
|---|---|---|
| `id` | `"CPI-2026-0001"` | Certificate number (`instructor-certificate.md`) |
| `name` | `"Jane D."` | First name and last initial unless they ask for the full name |
| `certified` | `"2026-10"` | Year and month they passed; the year goes on the badge |
| `city`, `state`, `zip` | `"Boulder"`, `"CO"`, `"80302"` | Two-letter state. Never a street address |
| `in_person`, `online` | `true`, `true` | Online-only instructors also show under "Also teaching online" in every state |
| `travel` | `"10 miles"` or `"hosts"` | Optional |
| `ages` | `[7, 11]` | |
| `format` | `"Small group, weekly, 45 minutes"` | One line, 80 characters |
| `next_class` | `"2026-11-04"` | Optional; hidden once it has passed |
| `price_from` | `25` | Optional, dollars a class |
| `about` | two or three sentences | 300 characters; read it before it goes live |
| `contact_url` | `"https://…"` | Optional booking link; must start with https |
| `photo` | `"instructors/photos/cpi-2026-0001.webp"` | Optional, adults only |
| `status` | `"live"` | `review` while you read it, `removed` to take it down |

### Add someone after they pass the exam

1. They press "Send my listing" on the directory page, which opens an email to you with the form fields from `instructor-launch-kit/directory-listing.md`.
2. Read the "About" text and photo against the rules on that page (no results promises, no child named, no earnings, badge not used as a logo).
3. On GitHub open `instructors/instructors.json` → pencil icon. Add one object inside `"instructors": [ … ]`, copying the shape from `instructors/sample.json` (drop "(test)" and the sample wording). Set `"status": "live"`. Separate objects with commas.
4. Optional photo: upload it to `instructors/photos/` and put its path in `"photo"`.
5. Commit to `main`.

Finish signal: `childphenoms.com/instructors/?state=CO` (their state) shows the listing with the badge and a working "Ask about a class" button. To take a listing down, set `"status": "removed"`.

**The badge** on the page is drawn in code from the art direction in `certification-course/instructor-certificate.md` (round seal, one soroban rod, ring text, yellow ribbon with the year). It is a stand-in until the commissioned badge art exists; swap it in `instructorBadge()` in `js/instructors.js`.

## 6. Checking it on localhost

`#/account` on localhost has a "Preview a membership state" panel (it never shows on the live site): test drive day 3 and day 14, cancelled test drive, active, cancelled, payment missed, paused, ended-but-keeps-library, instructor year, no membership. The library, print pages and lesson buttons follow whichever state is picked. `#/instructors` on localhost has "Show sample listings".

Checked in the `beadbrain` preview at 1280 px and 375 px: every state above, the library lock for signed-out visitors and the sheet lock for cancelled keepers, all 12 books and 86 sheets, the directory filters (state, ZIP, in person, online), the hidden `review` row and past class date, the redirect page, no sideways scrolling on any page at phone width, no console errors and no failed requests. Printing was checked with Chrome's own print engine (print-to-PDF of the live pages): lesson sheets are one Letter page with the answer strip at the foot, flash and listening sheets add the read-aloud page 2, and book pages break per lesson. Boss-prep sheets for Stages 5–8 run to two or three pages, page for page the same as the CLI's samples printed with `handout.css`; that comes from the sheet design (four timed parts), not the port, and the handouts README's "run to exactly two" does not hold for Stages 7 and 8. 25,800 sheets across 300 random sheet numbers all passed the re-check.

Found and fixed while checking: the book's bead pictures had a number printed next to them, which gave away the answers in the bead-reading drills (pictures only now); and the Stage 4 mental sheet took 3 seconds to build.

## 7. Still yours to do

1. Apply `supabase/memberships.sql` (§3). Until then the library is locked for everyone.
2. Set up the Stripe customer portal and paste its login link into `js/config.js` (§2). Live-mode link at go-live.
3. Write a `memberships` row for every University and certification buyer (§3), or have the Stripe webhook built.
4. Decide: may past members print fresh sheets (one line in `ACCESS`)? Does an instructor's free year come with `keeps_library` (the certify page calls it "Twelve months of the family membership")?
5. Fix or accept the copy mismatches below.
6. Who reads new listings and passes on "Ask about a class" emails, and how fast.
7. Commission the badge art and swap it in.
8. Decide whether the library and `docs/products/` may be public (§4) before anything is pushed.
9. Push when you are ready. Nothing is committed; `js/curriculum.js` also has another session's uncommitted edits.

### Copy mismatches noticed (funnel pages not touched)

- University FAQ: "on day 14 your card is charged $67 **and the next stages open up**". The app does not lock any stage during the test drive, so nothing "opens up" on day 14.
- University FAQ: "Cancel any time before that from your account page" works once the portal link is set. "Pause for a month at a time from your account page" sends a pause request to support (Stripe's portal cannot pause).
- Thanks page: "a link to your parent account" in the welcome email should point to `SITE/#/account` (or `SITE/#/start/signin` for a first sign-in).
- Certify page: "your name in the directory" — the directory exists now, but listings go live only after you add them by hand (§5).

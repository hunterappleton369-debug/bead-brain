# Supabase Auth: custom SMTP through Resend, the hourly limit and the branded templates

Written 2026-10-23 (job 4 of `docs/AGENT-PROMPT.md`). Today the sign-in links come from Supabase's default sender (`noreply@mail.app.supabase.io`, the plain "Confirm your email address" template, capped at a few emails an hour and meant for team addresses only). At ad volume most parents would never get a link. Everything below is yours, because it needs your Supabase login and the Resend key. Do `resend-setup.md` steps 1 to 3 first: the domain must be **Verified** and you need a sending key.

## 1. Turn on custom SMTP (5 minutes)

1. Open https://supabase.com/dashboard/project/fndemnipqtpmuvcidcxo/auth/smtp (Authentication → **Emails** → **SMTP Settings** on newer dashboards; the link lands on the right page either way).
2. Switch **Enable Custom SMTP** on.
3. Fill the form exactly:

| Field | Value |
|---|---|
| Sender email | `hello@childphenoms.com` |
| Sender name | `Child Phenoms` |
| Host | `smtp.resend.com` |
| Port number | `465` |
| Minimum interval between emails | leave it |
| Username | `resend` |
| Password | the Resend API key (`re_…`) from `resend-setup.md` step 3. The same key the webhook uses is fine; a second sending-only key named `supabase-auth` is tidier. |

4. Click **Save**.

Finish signal: the page shows custom SMTP enabled with `smtp.resend.com` and port 465.

## 2. Raise the hourly email limit (2 minutes)

Supabase only lets you raise this once custom SMTP is on.

1. Open https://supabase.com/dashboard/project/fndemnipqtpmuvcidcxo/auth/rate-limits (Authentication → **Rate Limits**).
2. **Rate limit for sending emails**: change it to `100` (per hour). Leave the other limits.
3. Click **Save**.

Finish signal: the field reads 100.

## 3. Paste the branded templates (5 minutes)

The two templates the app sends are staged in `supabase/auth-templates/` (`README.md` there has the table). A parent's first link uses **Confirm signup**; every later one uses **Magic Link**.

1. Open https://supabase.com/dashboard/project/fndemnipqtpmuvcidcxo/auth/templates (Authentication → **Emails** → **Templates**).
2. Click **Confirm signup**. **Subject heading:** `Open your Child Phenoms parent account`. **Message body:** select everything in the box, delete it, and paste the whole of `supabase/auth-templates/confirm-signup.html`. Click **Save**.
3. Click **Magic Link**. **Subject heading:** `Your Child Phenoms sign-in link`. **Message body:** replace it with the whole of `supabase/auth-templates/magic-link.html`. Click **Save**.
4. Leave Invite, Change email address, Reset password and Reauthentication alone; the app never sends them.

Finish signal: both templates show the new subject, and the preview shows the blue "Open my parent account →" button.

## 4. Prove it (3 minutes)

1. In a private window open https://childphenoms.com/#/start/signin and ask for a link to `hunterappleton369+smtp@gmail.com` (a fresh alias, so it takes the Confirm signup path).
2. The email arrives within a minute **from Child Phenoms <hello@childphenoms.com>** with the subject "Open your Child Phenoms parent account". Tap the button: it lands on `#/family` signed in.
3. Sign out and ask for a link to the same alias again: this time the subject is "Your Child Phenoms sign-in link".
4. https://resend.com/emails lists both as **Delivered**.

Finish signal: steps 2 to 4 all happened. The old `noreply@mail.app.supabase.io` sender is gone.

## If something goes wrong

| What you see | Fix |
|---|---|
| Supabase says "SMTP settings could not be verified" on Save | Host, port or username is mistyped, or the key was pasted with a space. Username is the word `resend`, not your email. |
| The link email never arrives and Resend → Emails shows nothing | Custom SMTP did not save, or the limit in step 2 was hit. Check the SMTP page, then Authentication → **Logs**. |
| Resend shows the email as **Bounced** or **Failed** | The domain is not Verified yet (`resend-setup.md` step 2). |
| The email arrives but looks like plain text | The template body was pasted without the `<!doctype html>` line, or into the wrong template. Paste the whole file again. |
| The link says it expired or was already used | Gmail or a security scanner opened it first. Ask for a new one; the app shows the same message and a resend button. |

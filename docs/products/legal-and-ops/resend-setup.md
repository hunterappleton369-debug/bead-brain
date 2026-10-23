# Resend: the sender behind the Quick-Start emails and the sign-in links

Written 2026-10-23. Resend sends two kinds of mail for Child Phenoms: the three Quick-Start emails the `stripe-webhook` function sends when a kit is paid (job 1 of `docs/AGENT-PROMPT.md`), and, once custom SMTP is on, Supabase's sign-in links (`supabase-smtp.md`). Both go out as `hello@childphenoms.com`. Everything below is yours: it needs your Resend login and the GoDaddy login, and the key is a secret.

## What is already built

- The function sends Q1 the moment a kit is paid and hands Q2 and Q3 to Resend with `scheduled_at` one and two days after the order. Copy: `docs/products/marketing-sequences/10-quickstart-soap-opera.md`, rendered by `tools/build-emails.mjs` into `supabase/functions/stripe-webhook/emails.ts`.
- It sends once per email address (`purchases.welcome_sent_at`), so Stripe retries and re-sent events never double-send.
- Until the key is in place, every paid kit logs `EMAIL NOT SET UP` and the order still goes through.

## 1. Add the domain (5 minutes)

1. Open https://resend.com/domains and sign in.
2. Click **Add Domain**. Type `childphenoms.com`. Region: **North Virginia (us-east-1)**. Click **Add**.
3. Resend shows three or four DNS records. Keep that tab open; you copy each value into GoDaddy in step 2. They look like this (the long DKIM value is unique to your account, so copy it from the screen, never from here):

| Type | Name (GoDaddy "Name" field) | Value | Why |
|---|---|---|---|
| TXT | `resend._domainkey` | `p=MIGf…` (one long line) | DKIM: proves the mail is yours |
| MX | `send` | `feedback-smtp.us-east-1.amazonses.com`, priority `10` | bounce reports |
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | SPF |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | DMARC (Resend lists it as recommended) |

Finish signal for this step: the domain page lists the records with a grey "Pending" badge next to each.

## 2. The DNS records at GoDaddy (10 minutes)

1. Open https://dcc.godaddy.com/control/portfolio/childphenoms.com/settings?tab=dns (GoDaddy → My Products → childphenoms.com → **DNS**).
2. For each record from step 1: click **Add New Record**, pick the **Type**, paste the **Name** exactly as Resend shows it (GoDaddy adds `.childphenoms.com` itself; do not type the full domain), paste the **Value**, leave TTL at 1 hour, click **Save**. For the MX record, GoDaddy asks for a **Priority**: type `10`.
3. If GoDaddy asks for the SMS code here, that is the same code it wanted for the A records: enter it and save all pending records in one go.
4. Back in Resend, click **Verify DNS Records**. GoDaddy usually publishes within minutes; Resend keeps checking for 72 hours.

Finish signal: every record on https://resend.com/domains/childphenoms.com shows a green **Verified** badge, and the domain's status reads **Verified**.

## 3. A sending-only key (2 minutes)

1. Open https://resend.com/api-keys → **Create API Key**.
2. **Name:** `childphenoms-supabase`. **Permission:** **Sending access**. **Domain:** `childphenoms.com`. Click **Add**.
3. Resend shows the key once (`re_…`). Copy it. Do not paste it into chat, email or the repo.

## 4. Paste it as `RESEND_API_KEY` (2 minutes)

1. Open https://supabase.com/dashboard/project/fndemnipqtpmuvcidcxo/functions/secrets.
2. Click **Add new secret**. **Name:** `RESEND_API_KEY`. **Value:** paste the key. Click **Save**.
3. No redeploy: the next paid kit uses it.

Finish signal: the Secrets page lists `RESEND_API_KEY`.

## 5. Prove it (5 minutes)

Either place your real kit order on https://childphenoms.com/free-abacus/ with hunterappleton369@gmail.com (the order you planned anyway), or re-send the `checkout.session.completed` event of an earlier kit order from Stripe → Developers → Events → the event → **Resend** → the `childphenoms-supabase-webhook` endpoint.

Finish signal, all three:
1. https://resend.com/emails lists three emails to hunterappleton369@gmail.com: "Your kit is ordered. Start tonight." as **Delivered**, and "The wall, and the 3 steps over it" and "What to say at the table" as **Scheduled**, one and two days after the order.
2. Supabase → Table Editor → `purchases` → your row has `welcome_sent_at` filled and three ids in `welcome_email_ids`.
3. The Stripe delivery's response ends with `quick-start h***@gmail.com: q1 sent, q2 and q3 scheduled`.

## Replies and unsubscribes

- **Replies.** The emails say "Reply to this email." Today `childphenoms.com` has no mailbox: there is no MX record for the bare domain, so a reply to hello@childphenoms.com bounces. Fix before the first order ships: either GoDaddy → Email & Office → set up forwarding for `hello@childphenoms.com` to hunterappleton369@gmail.com (GoDaddy adds its own MX records; they do not clash with Resend's, which sit on `send.childphenoms.com`), or turn on Resend → Domains → childphenoms.com → **Receiving** and forward from there. Finish signal: an email sent to hello@childphenoms.com from your phone lands in your inbox.
- **Unsubscribes.** Each email carries a List-Unsubscribe header and a footer line that both open a "Unsubscribe" email to hello@. When one arrives: Supabase → `purchases` → that row → copy `welcome_email_ids`; Resend → Emails → open each id still marked Scheduled → **Cancel**. Do the same for a refunded kit. CAN-SPAM gives 10 business days; do it the day it arrives.

## If something goes wrong

The function's log line (Supabase → Edge Functions → stripe-webhook → Logs) says which:

| Logs show | Fix |
|---|---|
| `EMAIL NOT SET UP` | Step 4, then re-send the event from Stripe. |
| `QUICK-START EMAIL FAILED … Resend answered 403` or `… domain is not verified` | Step 2 is not finished, or the key's domain is wrong. Verify, then re-send the event. |
| `QUICK-START EMAIL FAILED … answered 401` | Wrong or revoked key. Make a new one (step 3) and replace the secret. |
| `QUICK-START EMAIL FAILED … answered 422 … scheduled_at` | Resend refused the schedule (more than 30 days out, or in the past). Re-send the event; the function moves old dates to a minute from now. |
| `QUICK-START EMAIL q2 FAILED` (or q3) | Q1 went out. Send that one by hand from Resend → Emails → Q1 → **Resend**, or leave it. |
| `QUICK-START sent … but the purchases row did not take welcome_sent_at` | Type the values from the log into the row, so a re-send does not send Q1 again. |

Resend's free plan sends 100 emails a day and 3,000 a month, and one scheduled email counts when it is created. At 30 kits a day the Quick-Start alone is 90; move to the $20 plan before ads scale.

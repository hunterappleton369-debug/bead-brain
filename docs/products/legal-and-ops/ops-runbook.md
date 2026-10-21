# Operations runbook

How an order moves from Stripe to the family's door and through the membership, who does each step, and what to do when something goes wrong.

Companion files: `stripe-setup.md` (the links), `guarantees.md` (refund steps), `support-macros.md` (email replies), `sms-email-consent.md` (texting rules).

## 1. Who does what

| Job | Owner | Backup |
|---|---|---|
| Stripe settings, payment links, disputes | Hunter | none |
| Support inbox (hello@childphenoms.com): macros, cancels, pauses, refunds inside the policy | [HUNTER: Hunter or an assistant] | Hunter |
| Packing and shipping kits | [HUNTER: Hunter in house, or a fulfilment partner] | [HUNTER] |
| Pass Promise coaching calls | Hunter | none |
| Privacy requests (access, delete) | Hunter | none |
| Refunds outside the policy, legal letters, press | Hunter only | none |

Rule for the inbox: answer within one business day. Anything that does not fit a macro goes to Hunter with the label "Hunter".

## 2. The daily 20 minutes

1. **Stripe → Payments**, filter to yesterday. Every $9.95 or $36.95 payment is a kit to ship.
2. Add each to the order sheet (section 3.2).
3. Pack and buy labels for everything paid by 2 pm. Ship today or tomorrow. The promise is "2 to 3 business days".
4. Paste tracking numbers into the sheet and send the tracking email.
5. **Stripe → Billing → Subscriptions**: look at "Past due" for failed charges (section 3.6).
6. Clear the inbox with the macros.
7. **Stripe → Disputes**: answer anything new the same day.

## 3. The order flow

### 3.1 Order comes in

What happens without anyone touching it:

1. The parent fills the two-step form on `free-abacus/index.html`. Step 1 data is saved in their browser and, if `leadWebhook` is set, posted to the webhook (name, email, phone, street, city, ZIP. The state field is not included).
2. They pay on the Stripe link. Stripe collects the shipping address (Link A or B setting), takes payment and emails a receipt.
3. Stripe redirects to `university.html`, then `certify.html`, then `thanks.html`.

**The shipping address you use is the one in Stripe,** on the payment's page under **Shipping**. Never ship to the webhook address. It can be stale or missing the state.

### 3.2 The order sheet

One row per kit order. Columns:

`order date · Stripe payment ID · parent name · email · phone · shipping address · workbook? (Y/N) · University trial? · certification? · packed date · tracking number · shipped date · delivered date · notes`

Fill it by hand from Stripe each morning, or by export: **Payments** → **Export** → include shipping columns. [HUNTER: optional Zapier zap "Stripe new payment → Google Sheets row" saves the copying]

### 3.3 Pack and ship

**Pick list per order:**

- 1 Child Phenoms abacus [HUNTER: model / rod count]
- 1 Child Prodigy Secrets: The Playbook [HUNTER: printed copy, or a card with the download link?]
- If workbook = Y: 1 Prodigy Maker Workbook (printed). The audiobook goes by email.
- 1 welcome card with the trainer address (`childphenoms.com/#/start`) and "Stage 1 is open tonight" [HUNTER: design the card. Optional]

**Pack:**

1. Check the abacus: all beads move, frame not cracked.
2. Abacus, book(s) and card into the mailer. Fill gaps so the abacus cannot rattle.
3. Seal. Write the order's Stripe payment ID (last 6 characters) on the inside flap.

**Label:**

1. Buy a USPS Ground Advantage label [HUNTER: pick the tool, for example Pirate Ship or USPS Click-N-Ship] using the Stripe shipping address exactly.
2. Weigh the packed box once, save it as a preset, reuse it.
3. Drop off or schedule a USPS pickup.

**Small parts warning:** the box or insert must carry the small-parts warning if the supplier's paperwork requires it (see `launch-checklist.md`, step 11).

### 3.4 Tracking email

1. Paste the tracking number into the sheet.
2. Send the tracking email (`marketing-sequences/04-shipping-and-first-week.md` when built, or macro 1 in `support-macros.md` as a stopgap).
3. If texts are set up and the parent opted in, send the "it shipped" text.

### 3.5 The University trial

Day 0, the moment they pay Link C:

1. Stripe creates a subscription with status **Trialing**, trial end 14 days out.
2. The welcome email goes out with: the trainer link, the billing portal login link, and the download link for the Prodigy Secrets Program they keep. [HUNTER: where the program files are hosted. The `prodigy-secrets-program` deliverable]
3. The parent makes their own account at `childphenoms.com/#/start`. The trainer does not check Stripe. Any signed-in parent can use every stage today. [HUNTER: the page says "the next stages open up" on day 14. Either add a paywall later or soften that line]

Day 7: Stripe's trial reminder email goes out automatically.

Day 13: our "your card is charged tomorrow" email goes out (trial onboarding sequence), with the billing portal link.

Day 14: Stripe charges $67 automatically. Status becomes **Active**. Stripe sends the receipt.

### 3.6 Failed payments

1. Stripe retries on its own schedule (Smart Retries) and emails the parent a link to update the card.
2. In **Subscriptions → Past due**, if a parent is still past due after 7 days, send macro 4b.
3. If every retry fails, Stripe cancels the subscription (setting in `stripe-setup.md` §6). Nothing else to do.

### 3.7 Cancellation

Most parents cancel in the billing portal. Nothing to do. When one emails "Cancel":

1. Stripe → **Customers** → search their email → open the subscription.
2. Click **Cancel subscription**.
   - In trial: choose **Immediately**. Nothing has been charged and nothing will be.
   - After a charge: choose **At end of current period**. They keep access to the date they paid for.
3. Send macro 3. Same day, or the next business day at the latest.
4. Unsubscribe them from membership emails in the email tool (they stay on the kit buyer list unless they ask).

Do not argue, delay or ask them to call. One retention line is fine (macro 3 offers a pause), then cancel.

### 3.8 Pause (one month)

1. Stripe → subscription → **Actions** → **Pause payment collection**.
2. Choose **Void invoices** (nothing is charged and nothing is owed later).
3. Set **Resume on** to one month after their next billing date.
4. Send macro 5. Note the pause in the customer's Stripe **Notes**.
5. Their $67 price stays because the subscription is the same one.

### 3.9 Refunds

Follow `guarantees.md` → "Behind the counter". Inside the policy, the inbox owner refunds without asking. Outside it, ask Hunter.

### 3.10 Disputes

1. Stripe → **Disputes** → open it. Note the **Respond by** date.
2. If the parent was owed a refund under our guarantees, accept the dispute and note why.
3. If not, submit: the receipt, the terms-of-service checkbox record (Stripe shows it on the payment), the trial reminder email, USPS tracking showing delivery, and every email with the parent.
4. Add the parent's email to the "do not sell to" note in the order sheet.

### 3.11 Certification orders

When a $297 payment comes in:

1. Send the course access and the Instructor Agreement link. [HUNTER: course host not chosen. Agreement acceptance checkbox needs a home]
2. Give the free year of the instructor account. [HUNTER: how. The trainer has no instructor account type yet]
3. Twelve months of the family membership:
   - If they have a University subscription: Stripe → subscription → **Actions** → **Update subscription** → **Add coupon** → a 100% off coupon, duration **12 months**. Name it "Instructor year".
   - If they do not: nothing to charge. Give trainer access. [HUNTER: confirm]
4. When they fail the exam: send macro 7b and book the Pass Promise call.
5. When they pass: send the certificate, the badge files and the directory form. [HUNTER: directory does not exist]
6. At 11 months: email them about the instructor account renewal. [HUNTER: renewal price]

### 3.12 Lost, damaged or returned kits

| What happened | What to do |
|---|---|
| Tracking stalled 7+ days | Open a USPS missing mail search. Send macro 1b |
| Tracking says delivered, parent says no | Ask them to check with neighbours and wait 2 days. Then reship once [HUNTER: confirm] |
| Box arrived broken | Ask for one photo. Reship at no cost |
| Returned to sender, wrong address | Email for the right address. Reship after they pay $9.95 again (terms §3.3) |
| Returned to sender, our error | Reship at no cost |

### 3.13 Privacy requests

Answer within 45 days. Aim for 5 business days.

**Copy of their data:**

1. Supabase (project `child-phenoms`) → **Table editor** → `parents`, `children`, `progress` → filter by their email or parent id → export as CSV.
2. Stripe → customer → export payments.
3. Email them the files with macro 11.

**Delete everything:**

1. Supabase → **Authentication** → **Users** → find the email → **Delete user**. The database deletes their `parents`, `children` and `progress` rows with it (cascade).
2. Check: **Table editor** → `children` filtered by that parent id is empty.
3. Stripe: cancel any subscription. Keep payment records (needed for tax), but delete saved cards: customer → payment methods → **Remove**.
4. Email and SMS tools: delete the contact and add the email and phone to the suppression list so imports do not add them back.
5. Delete any photos or videos they sent.
6. Send macro 11b.

## 4. Weekly numbers (Monday, 15 minutes)

| Number | Where | Watch for |
|---|---|---|
| Kit orders | Stripe Payments | trend |
| Workbook take rate | orders at $36.95 ÷ all kit orders | trend |
| Trials started | Subscriptions created | ÷ kit orders |
| Trial → paid | subscriptions Active after day 14 ÷ trials started | drops |
| Cancels and pauses | Subscriptions canceled / paused | reasons in the portal |
| Refunds | Payments → Refunded | any guarantee used more than usual |
| Disputes | Disputes | any at all. Find the cause the same week |
| Unshipped kits older than 3 business days | order sheet | should be zero |

<!-- status: needs Hunter: the owner of each job, how kits get packed, where the course and program files live, how certification is delivered, the reship rule -->

# Refund policy and guarantees

Our three guarantees, exactly as our order pages print them, and the steps to use each one.

Effective date: [HUNTER: go-live date]

## 1. Keep-the-Kit Promise

**As printed:** "If your child doesn't light up on the beads, shipping is on us. Try it for 30 days. Not a fit? Email us and we refund your shipping. Keep the abacus."

**What it covers:** the $9.95 shipping charge on the free kit.

**How to use it:**

1. Email hello@childphenoms.com within 30 days of your order date.
2. Use the email you ordered with. Put "Keep-the-Kit" in the subject.
3. You do not need to give a reason or send anything back.
4. We refund $9.95 to your card within 2 business days and email you to confirm. Your bank shows it in 5 to 10 business days.

After 30 days the shipping charge is non-refundable.

## 2. Pass Promise

**As printed:** "Don't pass the test? We coach you one on one until you do."

**What it covers:** Certified Phenom Instructor buyers who take the exam and do not pass.

**How to use it:**

1. Take the exam. If you do not pass, your result email has a link to book a coaching call. You can also email hello@childphenoms.com with "Pass Promise" in the subject.
2. We look at your answers and book a one-on-one video call to work on what you missed.
3. Retake the exam when you are ready. Repeat until you pass.

Coaching sessions must be booked within 12 months of your purchase.

## 3. 30-day money back (certification)

**As printed:** "Change your mind in the first 30 days? Full refund."

**What it covers:** the $297 certification payment.

**How to use it:**

1. Email hello@childphenoms.com within 30 days of buying, from the email you bought with. Put "Certification refund" in the subject.
2. We refund the full $297 within 2 business days and confirm by email.
3. When we refund, your course access, instructor account and directory listing end, and you stop using the Child Phenoms name and badge.

## 4. Phenom University free trial

The membership is free for 14 days. Cancel any time before day 14 and you pay nothing. You keep the Prodigy Secrets Program either way.

- **To cancel:** open your account page at childphenoms.com/#/account and press Cancel (it opens our billing portal), use the "Manage billing" link in any receipt, or email hello@childphenoms.com with "Cancel" in the subject.
- **After the trial:** monthly charges are not refunded for part of a month. If you forgot to cancel and email us within 7 days of a charge, we refund that charge once.

## 5. The Playbook add-on

The $27 Child Prodigy Secrets Playbook + Audiobook can be refunded within 30 days of your order. Email us with "Playbook refund" in the subject. You keep the Playbook.

## 6. Before you dispute a charge

Please email us first. We answer within one business day, and a refund from us reaches you faster than a bank dispute.

Child Phenoms · hello@childphenoms.com

<!-- internal-only -->

## Behind the counter: how we process each refund

Not published. This is the exact routine for whoever answers hello@childphenoms.com.

### Check first

1. Find the customer: Stripe Dashboard → **Customers** → search the email.
2. Check the date against the window (30 days for the kit shipping, the Playbook and the certification; 7 days after a renewal for the goodwill refund).
3. Check the refund log for an earlier goodwill refund on the same customer. One per household.

### Refund a one-time payment (shipping, Playbook, certification)

1. Stripe → **Payments** → open the payment.
2. Click **Refund** (or the ⋯ menu → **Refund payment**).
3. Keep the full amount, or type a partial amount when refunding only part of a payment. Example: a $36.95 order (shipping + Playbook) where only shipping is refunded → type 9.95.
4. Reason: **Requested by customer**. Click **Refund**.
5. Send macro 6 (kit) or macro 7 (certification) from `support-macros.md`.
6. Log it: date, email, amount, reason, guarantee used.

### Certification refund extras

1. Remove course access. [HUNTER: course host not chosen]
2. Remove the directory listing and mark the instructor account as ended. [HUNTER: directory does not exist yet]
3. If the 12 free months were applied to a University membership, remove that coupon so normal billing resumes, and tell the customer in the refund email.

### Goodwill refund of a monthly charge

1. Stripe → **Customers** → customer → **Subscriptions**. Cancel it first if they asked (see `ops-runbook.md` §7).
2. Scroll to **Payments** → open the $67 charge → **Refund**.
3. Note "goodwill, once" on the customer record (**Metadata** or **Notes**).

### Disputes (chargebacks)

1. Stripe emails you and the payment shows **Disputed**. Open it and note the **Respond by** date.
2. If the customer is entitled to a refund under the guarantees, accept the dispute.
3. Otherwise submit evidence: the order page and terms checkbox, the receipt, USPS tracking showing delivery, the trial reminder email, and any emails with the customer.

<!-- status: filled 2026-10-23 with the drafted defaults (12-month Pass Promise window, one goodwill refund within 7 days, 30-day Playbook refund); still needs counsel review -->

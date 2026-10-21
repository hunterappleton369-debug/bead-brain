# Send map

Every email and text in one table. Load these into the email and SMS tool in this order.

## Rules that sit above the table

- **One sequence wins.** A paid order stops the abandon sequence. A cancelled trial stops onboarding. A certification order stops the certification emails.
- **Trial members** get soap opera emails 1 to 3 and skip 4 and 5. On days when an onboarding email and a soap opera email both fall, send onboarding at 7 a.m. and the soap opera email at 7 p.m.
- **Seinfeld emails** pause on any day a sequence email goes out to the same person, and pick up the next day where they left off.
- **Texts** go only to numbers that ticked the consent line, and only between 8 a.m. and 8 p.m. local.
- **Test sends** go to hunterappleton369@gmail.com (or a +alias) and 9857681025. Nothing else.

## The map

| Code | Trigger | Delay | Channel | File | Subject or text |
|---|---|---|---|---|---|
| A1 | Step-1 lead, no order | 1 hour | Email | 02-abandon-cart.md | Your kit is still here |
| S2 | Step-1 lead, no order | 3 hours | SMS | 08-sms-bank.md | Your free abacus kit is saved |
| A3 | Step-1 lead, no order | 24 hours | Email | 02-abandon-cart.md | "My child isn't a math kid" |
| S3 | Step-1 lead, no order | 46 hours | SMS | 08-sms-bank.md | Last note from Hunter |
| A5 | Step-1 lead, no order | 48 hours | Email | 02-abandon-cart.md | Last note about your kit |
| E1 | Kit order paid | At once | Email | 01-kit-buyer-soap-opera.md | Your receipt, and one question |
| S1 | Kit order paid | Next day, 8:30 a.m. | SMS | 08-sms-bank.md | Print Lesson 1 tonight |
| E2 | Kit order paid | Day 1 | Email | 01-kit-buyer-soap-opera.md | The wall |
| E3 | Kit order paid | Day 2 | Email | 01-kit-buyer-soap-opera.md | Week three |
| E4 | Kit order paid, no trial | Day 3 | Email | 01-kit-buyer-soap-opera.md | What the beads gave me besides math |
| E5 | Kit order paid, no trial | Day 4 | Email | 01-kit-buyer-soap-opera.md | If I started over |
| W1 | Parent replies with child's name and age | Within 1 business day | Email (manual reply) | 04-shipping-and-first-week.md | Re: your receipt (the plan for {{child}}) |
| SH1 | Shipping label bought | At once | Email | 04-shipping-and-first-week.md | Your abacus just shipped |
| S4 | Delivered scan (or label + 5 days) | At once, inside quiet hours | SMS | 08-sms-bank.md | Your abacus landed |
| T0 | Trial started | At once | Email | 03-trial-onboarding.md | You're in. Start here. |
| T1 | Trial started | Day 1 | Email | 03-trial-onboarding.md | The zero that trips everyone up |
| T3 | Trial started | Day 3 | Email | 03-trial-onboarding.md | The party trick |
| T5 | Trial started | Day 5 | Email | 03-trial-onboarding.md | The question that does the teaching |
| T7 | Trial started | Day 7 | Email | 03-trial-onboarding.md | One week. Here's what to look for. |
| T10 | Trial started | Day 10 | Email | 03-trial-onboarding.md | Eyes closed |
| T12 | Trial started | Day 12 | Email | 03-trial-onboarding.md | Two days left in your test drive |
| T13 | Trial started | Day 13, 9 a.m. | Email | 03-trial-onboarding.md | Your card is charged $67 tomorrow |
| S5 | Trial started | Day 13, 10 a.m. | SMS | 08-sms-bank.md | Your test drive ends tomorrow |
| SF1–SF20 | Kit buyer, no trial | Daily from day 5 | Email | 05-seinfeld-bank.md | See each email |
| SF1–SF20 | Trial member, still paying | Daily from day 15 | Email | 05-seinfeld-bank.md | Same emails, member P.S. |
| SF1–SF20 | Step-1 lead, never ordered | Daily from hour 72 | Email | 05-seinfeld-bank.md | Same emails, lead P.S. |
| C1 | Paying member, not certified | Day 21 of trial | Email | 06-certification-sequence.md | The best coach in town |
| C2 | Paying member, not certified | Day 24 | Email | 06-certification-sequence.md | Everything in the instructor kit |
| C3 | Paying member, not certified | Day 27 | Email | 06-certification-sequence.md | Four questions before you certify |

## Totals

- Emails: 5 soap opera, 3 abandon, 8 onboarding, 2 shipping (one is a manual reply), 20 Seinfeld, 3 certification. **41 emails.**
- Texts: **5.**
- Ads: 5 angles, 15 primary texts, 15 headlines, 5 video scripts in `07-ad-copy.md`.

<!-- status: ready -->

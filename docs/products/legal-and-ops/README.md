# legal-and-ops

The legal pages, the payment setup and the day-to-day operating manual for the Child Phenoms free-abacus funnel. Built to `BUILD-BRIEF.md` §5.7.

**Folder status: needs Hunter: counsel review.** Nothing here is legal advice. Every file is a working draft for a lawyer to check, and the public pages refuse to build in final mode until every `[HUNTER]` marker is resolved.

## Files

| File | Purpose | Status | Words | Deslop | FK grade (tables stripped) |
|---|---|---|---|---|---|
| `README.md` | This file: file list, checker numbers, build command, funnel problems found, decisions for Hunter and counsel | needs Hunter | 1,413 | 5/5 | 10.8 (9.3) |
| `privacy-policy.md` | Source of the public privacy policy: funnel and app data, processors, COPPA, sale and sharing, retention periods, plus the CCPA and Colorado rights sections | needs Hunter | 2,184 | 5/5 | 8.0 (7.2) |
| `terms.md` | Source of the public terms: kit, $9.95 shipping, $27 add-on, 14-day trial then $67/mo vs $197, cancel/pause, $297 certification, guarantees and refunds, plus the disclaimers (research, earnings, Facebook) | needs Hunter | 1,985 | 5/5 | 6.4 (6.2) |
| `guarantees.md` | Source of the public refund policy: the three guarantees as printed, with parent steps. Below an `internal-only` line, the Stripe steps for each refund and dispute (not published) | needs Hunter | 856 | 5/5 | 6.0 |
| `earnings-disclaimer.md` | Source of the public earnings disclaimer for the certification | needs Hunter | 347 | 5/5 | 7.9 |
| `site/privacy-policy.html` | Built page, DESIGN.md style | needs Hunter | built | 5/5 | 6.2 |
| `site/terms.html` | Built page | needs Hunter | built | 5/5 | 5.5 |
| `site/refund-policy.html` | Built page (public half of `guarantees.md`) | needs Hunter | built | 5/5 | 4.5 |
| `site/earnings-disclaimer.html` | Built page | needs Hunter | built | 5/5 | 5.1 |
| `sms-email-consent.md` | Checkout consent wording and HTML, double opt-in, STOP/HELP replies, TCPA and CAN-SPAM rules, 10DLC registration, consent records | needs Hunter | 1,231 | 5/5 | 6.6 (6.4) |
| `instructor-agreement.md` | Independent-instructor agreement: licence to the name and badge, no employment, no earnings claims, child-safety rules, background-check choice, revocation | needs Hunter | 1,401 | 5/5 | 6.8 |
| `stripe-setup.md` | Click-by-click Stripe Payment Links setup: business details, four products, four links with redirects, billing portal, reminder emails, `config.js`, test run, go-live | needs Hunter (his clicks) | 1,570 | 5/5 | 6.6 (6.1) |
| `ops-runbook.md` | Fulfilment SOP and runbook: who does what, daily 20 minutes, order → Stripe → pack → tracking → trial → day-14 charge → failed payment → cancel → pause → refund → dispute → certification → privacy requests, weekly numbers | needs Hunter | 1,729 | 5/5 | 6.6 (6.1) |
| `support-macros.md` | 11 ready email replies (plus 4 variants) for the most likely support emails | ready (fill braces) | 1,237 | 5/5 | 3.7 |
| `launch-checklist.md` | Everything Hunter does before ads run, 15 steps, each with a finish signal | needs Hunter | 1,753 | 5/5 | 7.5 (7.1) |
| `tools/build_pages.py` | Builds `site/*.html` from the four sources. Draft mode highlights `[HUNTER]` gaps and adds a noindex tag and a draft box. `--final` refuses while any gap remains | ready | | | |

Legal pages have no grade target in the brief. The numbers are reported as asked. Macros are parent-facing and sit at grade 3.7.

## How to use the pages

1. Edit the `.md` files, never the HTML.
2. `python3 tools/build_pages.py` (draft) to preview: `node serve.mjs`, then http://localhost:8787/docs/products/legal-and-ops/site/terms.html
3. When every decision is made and counsel has signed off: `python3 tools/build_pages.py --final`, copy `site/*.html` to `Bead-Brain/legal/`, and link them in the footers (`launch-checklist.md` steps 4 and 5).

The pages link `../css/style.css` like the funnel pages do, so from `legal/` they pick up the site's paper background. They also carry their own style block (Unbounded headings, Inter body, hairline rows, no cards), so they look right from this folder too. Checked at 1024 px and 375 px: no sideways scroll, tables fit, contents list drops to one column on phones.

## Gaps found in the live funnel (fix before ads)

These are in the funnel today and are now covered by a clause, a checklist step, or both.

1. **The shipping address never reaches Stripe.** The order form keeps the address in the browser and sends it to the webhook without the state. Stripe Links A and B must collect the shipping address (`stripe-setup.md` §4).
2. **The phone field is required and has no text-message consent.** Wording, HTML and a one-line `funnel.js` fix are in `sms-email-consent.md` and `launch-checklist.md` step 6.
3. **"Cancel / pause from your account page"**: the trainer has no billing page and Stripe's portal cannot pause. Add the portal link to the trainer. Pauses by email.
4. **"The next stages open up" on day 14**: the trainer does not lock stages.
5. **"We never sell or share your info"** stops being accurate once the Meta pixel runs (California treats it as sharing).
6. **102 lessons**: the program has 76 lessons and 28 quest drills.
7. Three of the four funnel footers lack the Facebook disclaimer, and none links to legal pages.
8. **Certification fulfilment does not exist yet** (course host, exam, directory, instructor account, renewal price). The certify page takes $297 for it.
9. **The kit is an imported children's product**: get the supplier's Children's Product Certificate and lab report (`launch-checklist.md` step 11).
10. **"Send me the first video"** on the thank-you page means parents will email videos of children. The privacy policy now says how they are used and when they are deleted.

## Open decisions for Hunter

Business details
- Legal entity name and state. Mailing address for emails and pages. Support phone for Stripe. Governing-law state and county.
- Publish date for each page.

Providers
- Email tool for the sequences (sign-in mail already planned on Resend) and SMS provider. Name both in the privacy policy.
- Web host (currently GitHub Pages). Fulfilment: in house or a partner. Label tool.
- Where the Prodigy Secrets Program files and the certification course are hosted.

Policies
- Retention periods in privacy §9 (proposed: orders kept 7 years. Accounts kept until deletion or 24 months without a sign-in. Photos and videos kept 90 days. Support email kept 2 years. Consent records kept 5 years.).
- Workbook add-on refundable for 30 days? (drafted: yes)
- Goodwill refund of a forgotten $67 charge within 7 days, once? (drafted: yes, recommended)
- Lost-in-transit and "delivered but missing" reship rules.
- Pass Promise limit (drafted example: coaching booked within 12 months).
- Instructor account renewal price, and whether it renews automatically.
- Free 12 months for instructors who already pay for University: credit as a coupon? (drafted: yes)
- Instructor background checks: required, recommended, or none (agreement §7).
- Text cap per week (drafted: up to 5) and whether leads get email double opt-in (drafted: off).
- One-click upsells: accept separate Stripe checkouts for launch?
- Sales tax on the kit and workbook (ask the CPA).

For counsel
- The whole folder, with focus on: auto-renewal and trial disclosures, COPPA and the Colorado minors amendment (the trainer uses streaks and points. Ask whether that counts as a feature designed to extend use), the instructor franchise and business-opportunity question, SMS consent wording, arbitration, and "certification yours for life" vs revocable licence.
- Global Privacy Control: the policy promises the pixel will not load when the signal is on. The code in `launch-checklist.md` step 9 must ship with the pixel.

Funnel wording (Hunter's pages, not edited here)
- 102 lessons; "from your account page"; "next stages open up"; "never sell or share".

## Sources checked for this folder (2026-10-21)

- Stripe Payment Links (options such as the redirect after payment, collecting the address and phone, and the terms checkbox): https://docs.stripe.com/payment-links/customize , https://docs.stripe.com/payment-links/post-payment
- Stripe customer portal (no pause option): https://docs.stripe.com/customer-management/configure-portal
- Stripe free-trial reminders (7 days before) and "* TRIAL OVER" descriptor: https://docs.stripe.com/billing/subscriptions/trials/manage-trial-compliance
- COPPA amended rule, compliance date April 22, 2026: https://www.davispolk.com/insights/client-update/ftc-prioritizes-coppa-enforcement-new-compliance-obligations-take-effect
- Colorado Privacy Act minors amendment (SB 24-041), in force October 1, 2025, no size threshold: https://www.lowenstein.com/news-insights/publications/client-alerts/colorado-tightens-rules-on-minors-online-data-are-you-ready-for-october-1-data-privacy
- FTC click-to-cancel rule vacated July 2025. ROSCA still applies: https://www.cooley.com/news/insight/2025/2025-07-11-click-to-cancel-just-got-cancelled-eighth-circuit-vacates-entirety-of-ftcs-negative-option-rule
- TCPA opt-out within 10 business days; "revoke all" part delayed to January 31, 2027: https://www.burr.com/telephone-consumer-protection-act/the-fcc-delays-effective-date-of-tcpa-revoke-all-rule-until-january-31-2027

## Repos

None cloned. The policies are written from scratch. No template text was used. `ArthurGareginyan/privacy-policy-template` (GPLv3) was not touched, per the brief. `tools/build_pages.py` is new code using only the Python standard library.

<!-- status: needs Hunter: counsel review -->

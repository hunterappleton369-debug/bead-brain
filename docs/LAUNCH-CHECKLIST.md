# Launch checklist: free abacus funnel

Status on the evening of 2026-10-21. "Done" means built, tested in a browser at phone width, and (once pushed) live at https://childphenoms.com/free-abacus/. "You" means only Hunter can do it, with the exact clicks. Items are in the order they unblock each other. The matching helper for anything you hand to an agent is `docs/AGENT-PROMPT.md`.

## Done today

- **Offer**: the free kit is the abacus plus a 3-night quick-start card ($39 value). The $27 bump is the Child Prodigy Secrets Playbook + Audiobook (text-only box, last decision before the checkout button). Step 1 of the form asks name, email and phone only; the hosted checkout takes the address and card. Decisions are in `docs/FUNNEL.md`.
- **Pages** (`free-abacus/`): regenerated from the design canvas (version 290, https://claude.ai/artifact/MAT8DW8b48fZjrUguLbgoh). Codex's conversion review applied: claims softened, fake video player replaced with a "how one lesson works" box, trial first-charge date shown, "cancel from your account page", pause by request, HM initials, NAEP and brain-study lines corrected.
- **Images**: Expert-Secrets-style Playbook cover (`img/funnel/playbook.webp`, alternate `playbook-alt.webp`), photoreal abacus (`abacus.webp`), kit box with the card and no book (`kitbox.webp`). Older renders in `img/funnel/v1/` and `v2/`. Candidates and the rerun script in `img/gen/funnel/candidates/`.
- **Tracking**: Meta Pixel wired in `free-abacus/funnel.js`, off until `metaPixelId` is set in `free-abacus/config.js`. Events: PageView, Lead, AddToCart, InitiateCheckout, Purchase, StartTrial, once per browser.
- **Checkout logic**: `?paid=kit|university|certify` on a return URL is the only thing that marks an item as bought; thank-you rows follow that. Shopify cart links would prefill name, email and phone; Stripe links get `prefilled_email`.
- **App**: `#/playbook` (digital Playbook, audiobook slot, print), `#/account` "What you own", stages 2 to 10 gated behind a University membership (Stage 1 free), sign-in polish (lower-cased email, resend link, Gmail/Outlook buttons, expired-link message, return to the page they wanted). Supabase: `memberships` and `purchases` tables are live with row-level security. Stripe webhook edge function in `supabase/functions/stripe-webhook/` (see `docs/products/legal-and-ops/stripe-setup.md` §8).
- **Shopify** (store j1tu10-he, Basic plan): products "Child Phenoms Free Abacus Kit" (id 10239735988480, $0, inventory not tracked) and "Child Prodigy Secrets Playbook + Audiobook" (id 10239737823488, $27); US-only rate "USPS Ground Advantage (2 to 7 days)" $9.95; checkout collects email. Shopify is the fulfilment back office for CJ, not the checkout (see `docs/FULFILLMENT.md`).
- **Email**: no SMS at launch. Sequences swept for the new offer; new 8-email loyalty sequence `docs/products/marketing-sequences/09-post-purchase-loyalty.md` ("the Whole Brain family"); quick-start card text in `docs/products/welcome-card.md`.
- **Ads**: `docs/ADS-BUILD-SHEET.md` (campaign, ad sets, copy, UTMs, creative brief per angle, daily review rules).

## Blocks launch, in order

### 1. Domain (done except one save)

childphenoms.com points at GitHub Pages, the custom domain is set and HTTPS is enforced: https://childphenoms.com/free-abacus/ is live with a padlock, and the old github.io address redirects to it. Two loose ends: GoDaddy is still waiting for a second code to save the three extra A records (the site works on one, the other three are GitHub's recommended redundancy), and https://www.childphenoms.com shows a certificate warning until the `www` CNAME is changed from `childphenoms.com` to `hunterappleton369-debug.github.io` (one more GoDaddy save and code). Plain http://www already redirects to the live site.

### 1 (old). Domain (you, 2 minutes, then me)

GoDaddy sent a 6-digit code to your phone ending 1025 and the DNS panel is waiting for it in the Chrome tab "Domain Portfolio: childphenoms.com".

1. In that Chrome tab, type the code into "6-digit code" and press **Verify code**. If it expired, press **Resend code**.
2. Tell me "code is in". I replace the parked A record with GitHub's four addresses, point `www` at `hunterappleton369-debug.github.io`, set the custom domain on the GitHub Pages settings, and turn on HTTPS.

If you would rather do it yourself: DNS → delete the `A @ Parked` record; add `A @ 185.199.108.153`, `A @ 185.199.109.153`, `A @ 185.199.110.153`, `A @ 185.199.111.153` (TTL 600); edit `CNAME www` to `hunterappleton369-debug.github.io`. Then https://github.com/hunterappleton369-debug/bead-brain/settings/pages → Custom domain `childphenoms.com` → Save → tick **Enforce HTTPS** once the check passes (5 to 30 minutes). Finish signal: https://childphenoms.com/free-abacus/ loads with a padlock.

### 2. Stripe (live, 2026-10-22)

Decision on 2026-10-22: Child Phenoms is a DBA of Enamelogic LLC, so everything runs in the **Enamelogic LLC** Stripe account (acct_1TivQW5uuxnQgoyB), live mode, added alongside Enamelogic's own products and never changing them. The separate "Child Phenoms" Stripe account from earlier today holds only the test-mode rehearsal and can be closed or ignored.

Live and deployed on the site:

| What | Where |
|---|---|
| Products | Free Abacus Kit $9.95, Playbook + Audiobook $27, Child Phenom University $67/month (14-day trial), Certified Phenom Instructor $297. Statement descriptor CHILD PHENOMS on each (Stripe applies it to subscription charges; one-time charges show the account's ENAMELOGIC descriptor and receipts say Enamelogic LLC). |
| Payment links | A kit `https://buy.stripe.com/cNicMY0ISck62iLdo9eZ200`, B kit + Playbook `https://buy.stripe.com/bJe5kw63cck60aD0BneZ201`, C University trial `https://buy.stripe.com/aFa5kw4Z83NAbTl97TeZ202`, D certification `https://buy.stripe.com/4gM28kajsck63mPfwheZ203`. A and B collect a US shipping address; every link returns to the next funnel page with `?paid=`. In `free-abacus/config.js`. |
| Customer portal | The account's existing live login link `https://billing.stripe.com/p/login/cNicMY0ISck62iLdo9eZ200` in `js/config.js`. Its configuration was left exactly as Enamelogic uses it (cancel allowed; no return URL set, so parents close the portal tab when done; the portal shows the Enamelogic name). |
| Webhook | Destination `childphenoms-supabase-webhook` (we_1UTLUQ5uuxnQgoyBdpLGJ5tR), five events, URL `https://fndemnipqtpmuvcidcxo.supabase.co/functions/v1/stripe-webhook`. Enamelogic's own destination is untouched; the function ignores events that carry no Child Phenoms product. |

The full chain was rehearsed end to end in test mode earlier today (kit + Playbook, trial, certification, thank-you page). Live links were checked to load.

Still yours:

1. **Webhook secret**: Workbench → Webhooks → `childphenoms-supabase-webhook` → Reveal under Signing secret → paste into Supabase as `STRIPE_WEBHOOK_SECRET`, plus a restricted key from this Enamelogic account as `STRIPE_SECRET_KEY` (`docs/products/legal-and-ops/stripe-setup.md` §8). Until then, no `purchases` or `memberships` rows are written and you add them by hand.
2. **One real order**: buy the kit with your own card on https://childphenoms.com/free-abacus/, check the Stripe payment, the receipt wording and the shipping address, then refund it in Stripe. This is the only step that proves live money moves.
3. **Tax**: the new links do not collect sales tax, so the page's "$9.95" stays exact. The products carry the account's default SaaS tax code, which is wrong for a shipped kit if you ever turn Stripe Tax on for these links; ask your CPA when sales pass a state threshold.

### 3. Fulfilment (you, one to two weeks for stock)

1. Shopify → Settings → General → Business details → the entity row → fill the full street address. Then Online Store → Preferences → turn **Private mode** off (the switch is greyed until the address is in) → Save. Finish signal: https://j1tu10-he.myshopify.com/ opens without a password page.
2. Install the CJdropshipping app, source the abacus (black frame, natural wood beads, silver bar; `img/funnel/abacus.webp`), buy an opening batch into a **US** warehouse, and get the Children's Product Certificate from the supplier. Print the quick-start card (`docs/products/welcome-card.md`) and the Playbook; ship both to the same warehouse. Confirm bundle kitting in writing.
3. Connect orders: Zapier → trigger "Stripe: Checkout Session Completed" → action "Shopify: Create Order" (customer email, shipping address from the session, line items kit and, when bought, Playbook, financial status paid). Until the zap runs, create each order by hand in Shopify → Orders → Create order → Mark as paid. CJ picks it up from Shopify either way.
4. One real test order to your own address. Finish signal: tracking in Shopify within 2 business days, box within 7 with the abacus and the card (and the Playbook when ticked).

### 4. Meta (pixel done; Page, ad account and domain are yours)

The pixel is installed: `metaPixelId` is 1239441998349754, the Enamelogic pixel, by your call. One dataset now mixes dentist and parent traffic, so audiences and optimisation blur across the two businesses; if that shows up in Ads Manager, create a Child Phenoms pixel and change that one line. Still yours: the Page, the ad account, domain verification for childphenoms.com, and the campaign build from `docs/ADS-BUILD-SHEET.md`.

### 4 (old). Meta (you, 20 minutes, then me)

1. https://business.facebook.com → Settings → Business assets → **Pages → Add → Create a new Page** "Child Phenoms". **Ad accounts → Add → Create** (USD, your card). **Data sources → Pixels (datasets) → Add** "Child Phenoms Pixel". Copy the **Pixel ID** (15 to 16 digits).
2. Brand safety → **Domains → Add** `childphenoms.com` → verify with the DNS TXT record (give me the record text and I add it at GoDaddy).
3. Paste the Pixel ID into `free-abacus/config.js` → `metaPixelId`, or send it to me and I push. Finish signal: Events Manager → Test events shows PageView from https://childphenoms.com/free-abacus/ and Lead after step 1.
4. Build the campaign from `docs/ADS-BUILD-SHEET.md` (paused until the test order and the email flow pass). Your creative goes in last.

### 5. Supabase sign-in links (done 2026-10-22)

Site URL and redirect URLs are set. Verified end to end: a link requested on https://childphenoms.com/#/start/signin arrived with `redirect_to=https://childphenoms.com/`, opened straight into `#/family` signed in, `#/account` showed the account, `#/playbook` and `#/stage/2` showed their gates, `#/stage/1` opened. Still to do under Email below: custom SMTP through Resend, so links reach every parent and not only team addresses, and the hourly email rate limit.

### 6. Email (you create accounts, then me)

1. **Resend** (exists): sign in at https://resend.com in Chrome and tell me; I add the DKIM, SPF and return-path records at GoDaddy and verify the domain. Then Resend → API keys → create "supabase-auth" (sending only) and keep it for step 2.
2. **Supabase SMTP** (so sign-in links reach every parent, not just team members): https://supabase.com/dashboard/project/fndemnipqtpmuvcidcxo/auth/smtp → Enable custom SMTP → Sender `hello@childphenoms.com`, name "Child Phenoms", host `smtp.resend.com`, port `465`, username `resend`, password = the API key → Save. Then Authentication → Rate limits → emails per hour → 100. Then Authentication → URL configuration → Site URL `https://childphenoms.com/`, redirect URLs `https://childphenoms.com/**` and `https://www.childphenoms.com/**`. Finish signal: `#/start/signin` with hunterappleton369@gmail.com delivers a link that lands you on `#/family`.
3. **Customer.io** (to create): https://customer.io → create a workspace "Child Phenoms" → Settings → Email → add the sending domain and give me the DNS records. Then load the sequences in the order in `docs/products/marketing-sequences/send-map.md`, with the link tags from its README. Triggers: Stripe → Customer.io via Zapier (kit paid, trial started, certification bought) and the step-1 lead via `leadWebhook` in `free-abacus/config.js` (a Customer.io track endpoint or a Zapier catch hook). Test sends only to hunterappleton369@gmail.com.

### 7. Legal pages (you + counsel, 1 hour)

Fill the placeholders in `docs/products/legal-and-ops/site/` (entity, state, address, dates, the pixel and email-provider disclosure), copy the four HTML pages to `legal/` on the site, link Privacy and Terms from every funnel footer and the app footer. Counsel reads the trial and auto-renewal wording, the children's privacy section and the instructor agreement.

### 8. Truth check (you, 10 minutes)

Page 1: "1,000 kits", "6 weeks", "ships in 2 to 3 business days by USPS", "7 days or less", "thousands of children"; page 2: "$997" as a real former price; page 3: "$297 once". Every line must match what fulfilment, Stripe and the refund policy actually do. Edit on the canvas or tell me.

### 9. Push (me, when you say)

Everything above that is built is committed and pushed today. Later changes: tell me and I port from the canvas and push.

## First two weeks

- **Recordings**: the VSL for page 2 (`docs/VSL-SCRIPT.md`; the "how one lesson works" box is the placeholder), the Playbook audiobook (`docs/products/audiobook-notes.md`; paste the MP3 URL into `PLAYBOOK_AUDIO_URL` in `js/config.js`), the 20 certification videos, the five ad videos with releases, a founder photo for the HM circle.
- **Print**: Playbook interior PDF, quick-start card, instructor badge, signature image.
- **Support**: hello@childphenoms.com answered within a day, macros in `docs/products/legal-and-ops/`.
- **Ops until the webhook is live**: after each order, add the `purchases` row (kit, playbook) or `memberships` row by hand (`docs/APP-DELIVERY.md` §3).
- **Ops the webhook does not cover** (by hand in Stripe and Supabase): a University member who buys the certification keeps the $67 subscription unless you pause it for the free year; the instructor year never ends on its own (set the row to `canceled` after 12 months or renew it); refunds and chargebacks do not remove access.

## Open decisions

- Instructor background checks (agreement §7).
- Whether the kept library after a cancel includes fresh practice sheets (one line in `ACCESS`, `js/membership.js`).
- Whether "thousands of children" stays on pages 1 and 2 (it refers to abacus training worldwide).
- Whether to swap `img/funnel/university.webp` (still prints "102 Training Lessons") for a fresh render.

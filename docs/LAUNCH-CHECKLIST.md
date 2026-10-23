# Launch checklist: free abacus funnel

Status on the evening of 2026-10-21. "Done" means built, tested in a browser at phone width, and (once pushed) live at https://childphenoms.com/free-abacus/. "You" means only Hunter can do it, with the exact clicks. Items are in the order they unblock each other. The matching helper for anything you hand to an agent is `docs/AGENT-PROMPT.md`.

## Done today

- **Offer**: the free kit is the abacus ($39 value) with a 3-night quick-start by email. The $27 bump is the digital Child Prodigy Secrets Playbook + Audiobook in the parent account (text-only box, last decision before the checkout button); printed copies return when a print path exists. Step 1 of the form asks name, email and phone only; the hosted checkout takes the address and card. Decisions are in `docs/FUNNEL.md`.
- **Pages** (`free-abacus/`): regenerated from the design canvas (version 290, https://claude.ai/artifact/MAT8DW8b48fZjrUguLbgoh). Codex's conversion review applied: claims softened, fake video player replaced with a "how one lesson works" box, trial first-charge date shown, "cancel from your account page", pause by request, HM initials, NAEP and brain-study lines corrected.
- **Images**: Expert-Secrets-style Playbook cover (`img/funnel/playbook.webp`, alternate `playbook-alt.webp`), photoreal abacus (`abacus.webp`), kit box with the card and no book (`kitbox.webp`). Older renders in `img/funnel/v1/` and `v2/`. Candidates and the rerun script in `img/gen/funnel/candidates/`.
- **Tracking**: Meta Pixel wired in `free-abacus/funnel.js`, off until `metaPixelId` is set in `free-abacus/config.js`. Events: PageView, Lead, AddToCart, InitiateCheckout, Purchase, StartTrial, once per browser.
- **Checkout logic**: `?paid=kit|university|certify` on a return URL is the only thing that marks an item as bought; thank-you rows follow that. Shopify cart links would prefill name, email and phone; Stripe links get `prefilled_email`.
- **App**: `#/playbook` (digital Playbook, audiobook slot, print), `#/account` "What you own", stages 2 to 10 gated behind a University membership (Stage 1 free), sign-in polish (lower-cased email, resend link, Gmail/Outlook buttons, expired-link message, return to the page they wanted). Supabase: `memberships` and `purchases` tables are live with row-level security. Stripe webhook edge function in `supabase/functions/stripe-webhook/` (see `docs/products/legal-and-ops/stripe-setup.md` §8).
- **Shopify** (store j1tu10-he, Basic plan): products "Child Phenoms Free Abacus Kit" (id 10239735988480, $0, inventory not tracked) and "Child Prodigy Secrets Playbook + Audiobook" (id 10239737823488, $27); US-only rate "USPS Ground Advantage (2 to 7 days)" $9.95; checkout collects email. Shopify is the fulfilment back office for CJ, not the checkout (see `docs/FULFILLMENT.md`).
- **Email**: no SMS at launch. Sequences swept for the new offer; new 8-email loyalty sequence `docs/products/marketing-sequences/09-post-purchase-loyalty.md` ("the Whole Brain family"); quick-start card text in `docs/products/welcome-card.md`.
- **Ads**: `docs/ADS-BUILD-SHEET.md` (campaign, ad sets, copy, UTMs, creative brief per angle, daily review rules).

## Blocks launch, in order

## Pre-live check (2026-10-22, evening)

Verified on the live site and the live accounts tonight:

- Pages: `/free-abacus/`, `university.html`, `certify.html`, `thanks.html` and the app all answer 200 on https://childphenoms.com; HTTPS is enforced and http redirects (301). GitHub Pages reports the domain built, no pending verification.
- Config served live: the four Enamelogic payment links, the pixel id, `shipDays`. All four Stripe links and the portal login load (200).
- Funnel smoke test in a real browser: step 1 accepts name, email, phone; step 2 shows the bump and "Total due today $36.95" when it is ticked; the green button lands on payment link B with `prefilled_email` set; `university.html?paid=kit` shows the trial's first-charge date 14 days out; `thanks.html?paid=certify` lists the right "what you own" rows and the parent-account button; no console errors; the Meta pixel script loads and `fbq` exists.
- Delivery copy now reads "about 2 weeks" and "most arrive in 9 to 15 days" on the page, the FAQ, the thank-you page and the Stripe kit description (the description used to say a quick-start card ships and "2 to 3 business days"; fixed in Stripe tonight).
- Webhook: the live destination is Active with 0 deliveries so far. The function has its Stripe secrets: a POST with a fake signature gets 400 "signature did not verify" (a missing secret would give 500). `purchases` and `memberships` tables are empty, as expected before the first order.
- Shopify: both products Active, inventory not tracked. DSers: the kit maps to the ZZ listing, SKU A5, and the US shipping method is saved on it.
- Sign-in email: a sign-in request for a Gmail alias was accepted and the email arrived, but from `noreply@mail.app.supabase.io` using Supabase's default "Confirm your email address" template. Custom SMTP is not set yet.

Not done, in the order that blocks money first:

1. **Link AliExpress in DSers.** Settings → Application Management → Supplier → AliExpress shows "Add Account", so no supplier order can be placed. Needs your AliExpress login and a saved card there.
2. **Shopify app credentials in Supabase** (`SHOPIFY_CLIENT_ID` + `SHOPIFY_CLIENT_SECRET`, `stripe-setup.md` §8). Not verifiable from outside; if they are missing, a paid kit writes its `purchases` row but never becomes a Shopify order, and you create it by hand (`docs/FULFILLMENT.md`, "Backup").
3. **The 3-night quick-start has no sender.** The page promises it "in your welcome email the minute you order", but the only email after checkout is Stripe's receipt. Either put the quick-start on the thank-you page and in the parent account and change that line, or wire the email (Customer.io, or a Supabase function on `checkout.session.completed`).
4. **Legal pages.** The four templates in `docs/products/legal-and-ops/site/` still carry `[HUNTER: …]` placeholders (entity, mailing address, state, dates, email provider) and are not on the site; no funnel or app footer links Privacy or Terms. Meta will not approve ads to a landing page without a privacy policy, and the pixel has to be disclosed in it.
5. **Custom SMTP through Resend** for Supabase Auth, plus the hourly email rate limit and branded templates. The default sender caps outgoing mail at a few per hour, so at ad volume most parents would never get a sign-in link.
6. **One real order** on the live page with your card, through to a Shopify order, a DSers order and tracking; then refund in Stripe.
7. **GoDaddy, second SMS code:** the three remaining A records and `www` → `hunterappleton369-debug.github.io`. `https://www.childphenoms.com` fails today (no certificate); the bare domain works.
8. **Meta:** Page, ad account, domain verification for childphenoms.com, the campaign from `docs/ADS-BUILD-SHEET.md`. Decide whether sharing the Enamelogic pixel stays acceptable.
9. **Stripe housekeeping:** confirm receipts go out for successful payments (Settings → Emails); ask the CPA about the tax code on the kit and Playbook (today SaaS).
10. **Shopify housekeeping:** business street address, Private mode, and the "free over $70" flag on the US rate.
11. **Truth check before traffic:** the urgency box ("only 1,000 kits", "6 weeks") describes a batch that does not exist under dropshipping; the product photos show a black-frame wooden soroban and the supplier ships a plastic brown-bead one.
12. **Customer.io workspace and the sequences** (`docs/products/marketing-sequences/`), including the post-purchase loyalty series. Not needed for the first orders.

### 1. Domain (done except one save)

childphenoms.com points at GitHub Pages, the custom domain is set and HTTPS is enforced: https://childphenoms.com/free-abacus/ is live with a padlock, and the old github.io address redirects to it. Two loose ends: GoDaddy is still waiting for a second code to save the three extra A records (the site works on one, the other three are GitHub's recommended redundancy), and https://www.childphenoms.com shows a certificate warning until the `www` CNAME is changed from `childphenoms.com` to `hunterappleton369-debug.github.io` (one more GoDaddy save and code). Plain http://www already redirects to the live site.

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

1. ~~Webhook secret~~ Done 2026-10-22: the function answers 400 "signature did not verify" to a forged request, so `STRIPE_WEBHOOK_SECRET` and `STRIPE_SECRET_KEY` are in place.
2. **One real order**: buy the kit with your own card on https://childphenoms.com/free-abacus/, check the Stripe payment, the receipt wording and the shipping address, then refund it in Stripe. This is the only step that proves live money moves.
3. **Tax**: the Enamelogic account has Stripe Tax on, so the links show a Tax line. For a Wyoming address it computed $0.00 and the total stayed $9.95; in any state where Enamelogic is registered to collect, tax will be added on top of the $9.95 the page promises. The four products carry the account's default SaaS tax code, which is the wrong category for a shipped kit. Ask your CPA whether to set the kit and Playbook to a tangible-goods code or to turn tax off on these four links.
4. **Branding**: the checkout page and receipts say "Pay Enamelogic" because the public business name is the account's. That is the DBA trade-off you chose; changing the public name would change it for Enamelogic customers too.

### 3. Fulfilment (wired 2026-10-22; two clicks left for you)

Pipeline: Stripe → Supabase `stripe-webhook` → Shopify order → DSers → AliExpress (details in `docs/FULFILLMENT.md`). The kit product is imported into DSers and mapped to the AliExpress soroban "ZZ 7/9/11/13/15/17 Digit Rods" (item 1005008927792517, variant A5 = 15 rods, DSers cost $2.85 to $4.19 + $1.99 AliExpress Selection Standard, quoted 9 to 15 days; switched from the $8.92 listing on 2026-10-22). The Playbook is digital only; nothing else ships. DSers' product shipping method for the US is set on this product and SKU (AliExpress Selection Standard, $1.99, tracked), so orders do not fall back to the $7.04 default. Supplier stock showed 45 at mapping time: if an order fails for stock, switch the mapping to variant A6 (17 rods) or back to the earlier listing in `docs/FULFILLMENT.md`. The page promise was changed to match: "about 2 weeks" and "most arrive in 9 to 15 days".

1. **DSers → Settings → Application Management → Supplier → AliExpress → Add Account** (checked 2026-10-22 evening: not linked). Keep a card saved on AliExpress. Finish signal: that row shows your AliExpress account instead of "Add Account", and Open Orders shows an "Order" button on a test order.
2. **Shopify app credentials for the webhook**: Shopify no longer allows legacy custom apps, so follow `stripe-setup.md` §8 "Shopify order creation" (Dev Dashboard app with `write_orders`, `read_orders`, `read_products`; paste `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET` into Supabase secrets). Until then, create each paid order by hand in Shopify (FULFILLMENT.md "Backup").
3. **First real order**: buy the kit on the live page, confirm the Shopify order appears tagged `childphenoms`, click Order in DSers, pay on AliExpress, and watch tracking come back to Shopify. Then refund yourself in Stripe if you want.
4. Store housekeeping still open: Settings → General → entity street address, then Online Store → Preferences → Private mode off (not needed for orders, only if you ever send people to the storefront).

### 4. Meta (pixel done; Page, ad account and domain are yours)

The pixel is installed: `metaPixelId` is 1239441998349754, the Enamelogic pixel, by your call. One dataset now mixes dentist and parent traffic, so audiences and optimisation blur across the two businesses; if that shows up in Ads Manager, create a Child Phenoms pixel and change that one line. Still yours: the Page, the ad account, domain verification for childphenoms.com, and the campaign build from `docs/ADS-BUILD-SHEET.md`.

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

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

Not done, in the order that blocks money first. Rewritten 2026-10-23 after jobs 1 to 4 of `docs/AGENT-PROMPT.md` shipped (Quick-Start emails wired, quick-start on the thank-you page and in the account, legal pages live and linked, SMTP steps and templates staged). Every item here is yours; where an agent finishes the check afterwards, it says so.

1. **Link AliExpress in DSers** (in progress). Open https://www.dsers.com → **Settings** → **Application Management** → **Supplier** → **AliExpress** → **Add Account** → sign in to AliExpress in the window that opens → allow. Keep a card saved on AliExpress (AliExpress → My account → Payment). Finish signal: that row shows your AliExpress account instead of "Add Account", and DSers → **Open Orders** shows an **Order** button on an order.
2. **Resend, so the Quick-Start emails go out.** Follow `docs/products/legal-and-ops/resend-setup.md` steps 1 to 4: add `childphenoms.com` at https://resend.com/domains, paste its DNS records at GoDaddy, press **Verify DNS Records**, create a sending-only key, and save it as `RESEND_API_KEY` at https://supabase.com/dashboard/project/fndemnipqtpmuvcidcxo/functions/secrets. Finish signal: the domain shows **Verified** and the Secrets page lists `RESEND_API_KEY`. Then tell the agent: it re-sends a kit checkout event from the Stripe CLI and checks that https://resend.com/emails shows Q1 delivered and Q2 and Q3 scheduled to hunterappleton369@gmail.com. Until then every paid kit logs `EMAIL NOT SET UP` and the order still goes through.
3. **A mailbox for hello@childphenoms.com.** The emails say "reply to this email" and the legal pages give that address, but the domain has no mail records, so a reply bounces today. GoDaddy → **My Products** → **Email & Office** → set up **Email Forwarding** for `hello@childphenoms.com` → forward to `hunterappleton369@gmail.com` → Save (GoDaddy adds its MX records; they do not clash with Resend's, which live on `send.childphenoms.com`). Finish signal: an email sent to hello@childphenoms.com from your phone lands in your Gmail inbox.
4. ~~Shopify app for the webhook~~ Done by Hunter 2026-10-23: the Dev Dashboard app exists and `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET` are in Supabase secrets. Proof comes with the first real order (item 6): the Stripe delivery response ends with `shopify #10xx: created`. If it says `SHOPIFY ORDER FAILED` instead, the log line names the cause (`stripe-setup.md` §8 table) and the agent fixes the function.
5. **Custom SMTP for sign-in links.** Follow `docs/products/legal-and-ops/supabase-smtp.md`: Authentication → SMTP Settings (host `smtp.resend.com`, port `465`, user `resend`, password = the Resend key), Rate Limits → emails per hour `100`, Templates → paste `supabase/auth-templates/confirm-signup.html` and `magic-link.html` with the subjects in that folder's README. Finish signal: a link requested for `hunterappleton369+smtp@gmail.com` arrives from `hello@childphenoms.com` with the subject "Open your Child Phenoms parent account" and lands you on `#/family`.
6. **One real order** on https://childphenoms.com/free-abacus/ with your card and hunterappleton369@gmail.com, kit plus Playbook. Then tell the agent, which checks: the Stripe delivery shows 200 with `shopify #10xx: created` and `quick-start … q1 sent`; the Shopify order is tagged `childphenoms` with your address; DSers lists it under Open Orders; `purchases` has your row with `kit`, `playbook`, `kit_paid_at`, `shopify_order_name`, `welcome_sent_at` filled; `#/account` shows the kit and the Playbook. Finish signal from your side: the receipt email from Stripe (it says Enamelogic LLC) and the Q1 email both in your inbox. Refund yourself in Stripe afterwards if you want; cancel the Shopify order before DSers ships it.
7. **GoDaddy, second SMS code:** the three remaining A records and `www` → `hunterappleton369-debug.github.io`. GoDaddy → childphenoms.com → **DNS** → the pending records → **Save** → type the code. Finish signal: https://www.childphenoms.com opens with a padlock.
8. **Meta:** Business Manager → create the Child Phenoms Page and ad account, verify the domain childphenoms.com (Business settings → Brand safety → Domains → Add → the DNS TXT record at GoDaddy), then build the campaign from `docs/ADS-BUILD-SHEET.md`. The privacy policy Meta asks for is live at https://childphenoms.com/legal/privacy-policy.html and names the pixel. Decide whether sharing the Enamelogic pixel stays acceptable. Finish signal: Ads Manager shows the campaign in review.
9. ~~Stripe receipts~~ Decided 2026-10-23 ("Receipt in email"): Stripe's receipt emails stay off on the shared account, and the kit receipt is built into Quick-Start email Q1 by the webhook (function version 14): date, each item and price, tax when charged, total, card and shipping address. Open gap for you: University trial and certification buyers get no receipt from anyone today; either turn on Stripe receipts later (account-wide) or have the agent add a receipt email for those two checkouts. Separately, ask the CPA about the tax code on the kit and Playbook (today the account's SaaS default).
10. **Shopify US rate still says "Free $70.00 and up"** (checked 2026-10-23: Settings → Shipping and delivery → General profile → United States → "USPS Ground Advantage (2 to 7 days) · Free $70.00 and up · 3–5 business days · $9.95"). The webhook writes its own $9.95 shipping line, so orders are not affected, but a storefront checkout over $70 would ship free. https://admin.shopify.com/store/j1tu10-he/settings/shipping → **General profile** → the rate's **…** → **Edit rate** → under conditions remove the "Free $70.00 and up" rule (or pick "No conditions") → **Done** → **Save**. While there, rename the rate **Standard shipping (9 to 15 days)** so Shopify's shipping emails match the page: the webhook already writes that title on every order it creates (function version 13). The agent could not make these two changes for you: the session's permission rules block edits to store settings. Finish signal: the rate reads $9.95 with no condition line. Also Settings → **General** → the store's street address; Private mode off only if you ever send people to the storefront.
11. **Go-live date on the legal pages.** On launch day, replace `[HUNTER: go-live date]` on the `Effective date` line of `docs/products/legal-and-ops/privacy-policy.md`, `terms.md`, `guarantees.md` and `earnings-disclaimer.md` with the date, then `python3 docs/products/legal-and-ops/tools/build_pages.py --final`, `cp docs/products/legal-and-ops/site/*.html legal/`, commit and push. Or tell the agent the date. Finish signal: https://childphenoms.com/legal/terms.html shows the date with no yellow mark.
12. **Counsel reads the legal pages** (trial and auto-renewal wording, the children's privacy section, the instructor agreement) and you confirm the defaults the agent filled in: a lost kit is replaced at no cost; the Playbook add-on is refundable for 30 days; one goodwill refund within 7 days of a forgotten renewal; Pass Promise coaching booked within 12 months; nothing renews by itself after the instructor year; a paying University member who certifies emails you to pause the $67 for twelve months; no arbitration clause. Change any of them in the `.md` source and rebuild as in item 11.
13. **Customer.io workspace and the sequences** (`docs/products/marketing-sequences/`), including the post-purchase loyalty series. Not needed for the first orders.

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

### 6. Email (done on the build side 2026-10-23; your clicks are items 2, 3 and 5 above)

The `stripe-webhook` function sends the three Quick-Start emails through Resend (`docs/products/legal-and-ops/resend-setup.md`), and the Supabase Auth templates and SMTP click path are in `docs/products/legal-and-ops/supabase-smtp.md` and `supabase/auth-templates/`. Customer.io and the rest of the sequences stay for later (item 13 above).

### 7. Legal pages (live 2026-10-23)

Filled, built and pushed: https://childphenoms.com/legal/privacy-policy.html, terms.html, refund-policy.html and earnings-disclaimer.html, linked from every funnel footer and the app footer. Left for you: the go-live date (item 11 above) and counsel's read (item 12).

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

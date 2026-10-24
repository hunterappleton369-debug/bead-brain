# Stripe Payment Links setup

Click-by-click: four products, four payment links, the billing portal, reminders, and the test run. About 60 minutes.

**Finish signal for the whole guide:** `free-abacus/config.js` has four `https://buy.stripe.com/...` links, and a test order walks kit → University → certify → thanks with the right charges in Stripe.

## 0. Before you start

- You need: Stripe login, the live site address, and the legal pages published (Stripe asks for their URLs).
- Site address below is written as `SITE`. Use `https://childphenoms.com` once DNS is live; until then use `https://hunterappleton369-debug.github.io/bead-brain`.
- Do everything in **test mode** first (toggle **Test mode** top right, or open a **Sandbox**). Section 9 repeats it in live mode.

### How the funnel uses the links

| config.js key | What it sells | After payment, send them to |
|---|---|---|
| `checkoutUrl` | kit shipping $9.95 | `SITE/free-abacus/university.html?paid=kit` |
| `checkoutUrlWithBump` | kit shipping $9.95 + workbook $27 | `SITE/free-abacus/university.html?paid=kit` |
| `universityTrialUrl` | University, 14 days free then $67/mo | `SITE/free-abacus/certify.html?paid=university` |
| `certifyUrl` | certification $297 | `SITE/free-abacus/thanks.html?paid=certify` |

The `?paid=` tag lets the Meta pixel fire "Purchase" only after a real payment (see `launch-checklist.md` step 9).

**Know this:** each link is its own Stripe checkout, so a parent who takes an upsell types or autofills their card again (Stripe Link and Apple Pay make it one tap for most). True one-click upsells need ClickFunnels or a custom Stripe integration. [HUNTER: fine for launch?]

## 1. Business details (5 min)

1. Open https://dashboard.stripe.com/settings/public (Settings → Business → **Public details**).
2. **Public business name:** Child Phenoms.
3. **Statement descriptor:** `CHILD PHENOMS`. Stripe adds "* TRIAL OVER" after the 10th character on the first charge after a trial, so the first 10 characters must read clearly.
4. **Support email:** hello@childphenoms.com. **Support phone:** [HUNTER: number, required by Stripe].
5. **Website:** `SITE`.
6. **Terms of service URL:** `SITE/legal/terms.html`. **Privacy policy URL:** `SITE/legal/privacy-policy.html`. **Refund policy URL** (if shown): `SITE/legal/refund-policy.html`.
7. Click **Save**.

Finish signal: the Public details page shows all six fields filled.

## 2. Branding (3 min)

1. Open https://dashboard.stripe.com/account/branding (Settings → **Branding**).
2. Upload the logo (`img/favicon.svg` exported as PNG) as the **icon**.
3. **Brand color:** `#2457f5`. **Accent color:** `#22c55e`.
4. Save.

Finish signal: the checkout preview shows the blue bolt logo.

## 3. Products (10 min)

Open **Product catalog** → **+ Add product**. Make four.

| # | Name (customer sees this) | Description | Price | Billing |
|---|---|---|---|---|
| 1 | Child Phenoms Abacus Kit: shipping & handling | Free abacus + Child Prodigy Secrets Playbook. You pay shipping only. USPS, US addresses. | $9.95 | One-off |
| 2 | Child Prodigy Secrets Playbook + Audiobook | 90-day printed workbook, ships in the same box. Playbook audiobook by email. | $27.00 | One-off |
| 3 | Phenom University | 14 days free, then $67/month (regular $197). Cancel anytime. One membership covers every child in your home. | $67.00 | Recurring, Monthly |
| 4 | Certified Phenom Instructor | Certification course, exam, Launch Kit, listing and badge, plus one free year of the trainer. | $297.00 | One-off |

For each: type the name and description, add an image if you have one (`img/funnel/kitbox.webp` for #1, `img/funnel/bump.webp` for #2), set the price and billing, click **Add product**.

Finish signal: Product catalog lists four products with those prices.

## 4. The four payment links (20 min)

Open https://dashboard.stripe.com/payment-links/create (**Payment Links** → **+ New**). Repeat for each link below. Settings not listed: leave as default.

### Link A: kit only (`checkoutUrl`)

1. **Product:** choose product 1. Quantity 1. Leave **Let customers adjust quantity** off.
2. **Options:**
   - **Collect customer addresses** → **Billing and shipping addresses**. Countries: **United States** only. This matters: the order form's address does not reach Stripe, so this is where the shipping address for fulfilment comes from.
   - **Require customers to provide a phone number:** on.
   - **Collect customer names:** on (individual name).
   - **Require customers to accept your terms of service:** on (appears once step 1 has the terms URL).
   - **Allow promotion codes:** off.
   - **Collect tax automatically:** [HUNTER: ask the CPA; off until then].
3. **After payment** tab → **Don't show confirmation page** → redirect to `SITE/free-abacus/university.html?paid=kit`.
4. Click **Create link**. Copy the URL.

### Link B: kit + workbook (`checkoutUrlWithBump`)

Same as Link A, with two products: product 1 **and** product 2 (click **+ Add another product**). Same options, same redirect.

### Link C: University trial (`universityTrialUrl`)

1. **Product:** choose product 3 ($67 monthly).
2. **Include a free trial:** on, **14 days**. Leave **Let customers start trial without payment method** OFF. The page promises "$0 today, then $67", which needs a card on file.
3. **Options:** **Require terms of service:** on. Addresses: **Billing addresses only**. Phone: off. Promotion codes: off.
4. **After payment** → **Don't show confirmation page** → `SITE/free-abacus/certify.html?paid=university`.
5. Create link. Copy it.

Checkout will show "14 days free, then $67.00 per month" under the button. Check it does.

### Link D: certification (`certifyUrl`)

1. **Product:** product 4.
2. **Options:** terms of service on, billing address only, promotion codes off.
3. **After payment** → `SITE/free-abacus/thanks.html?paid=certify`.
4. Create link. Copy it.

Finish signal: Payment Links lists four active links, each opening a checkout with the right price.

## 5. Billing portal: the "cancel in two taps" link (5 min)

1. Open https://dashboard.stripe.com/settings/billing/portal (Settings → Billing → **Customer portal**).
2. **Subscriptions:** **Cancel subscriptions** on → **Cancel at end of billing period**. **Cancellation reason** on. Switch plan and quantities: off.
3. **Payment methods:** on. **Invoice history:** on. **Customer information:** name, billing address, phone on.
4. **Business information:** headline "Manage your Child Phenoms membership". Terms and privacy links filled. **Default redirect link:** `SITE/#/start`.
5. Save. Copy the **Login link** (looks like `https://billing.stripe.com/p/login/...`).
6. Put that link in: the welcome email, the day-13 reminder, the trainer's account page, and support macro 3. [HUNTER: send the link to whoever builds the emails]

The portal cannot pause a subscription. Pauses are done by hand (`ops-runbook.md` §8).

Finish signal: open the login link in a private window, type a test customer's email, and the portal shows their subscription with a Cancel button.

## 6. Emails Stripe sends for you (5 min)

1. https://dashboard.stripe.com/settings/emails (Settings → **Customer emails**): **Successful payments** on, **Refunds** on.
2. https://dashboard.stripe.com/settings/billing/automatic (Settings → Billing → **Subscriptions and emails**):
   - **Manage free trial messaging** → send a reminder before the trial ends → **Link to a Stripe-hosted page**. Stripe sends it 7 days before the trial ends. Our own day-13 email covers the last day.
   - **Failed payments:** turn on **Smart Retries** and the emails that ask customers to update their card.
   - **If all retries fail:** **Cancel the subscription**.
3. Settings → **Personal details** → notifications: turn on an email for every successful payment, so each kit order lands in your inbox.

Finish signal: the trial-reminder and failed-payment settings show "on".

## 7. Paste the links into config.js, then test (10 min)

Open `free-abacus/config.js` and fill the four slots:

```js
  checkoutUrl: 'https://buy.stripe.com/test_XXXX',          // Link A
  checkoutUrlWithBump: 'https://buy.stripe.com/test_YYYY',  // Link B
  universityTrialUrl: 'https://buy.stripe.com/test_ZZZZ',   // Link C
  certifyUrl: 'https://buy.stripe.com/test_WWWW',           // Link D
```

`funnel.js` already adds `prefilled_email` to each link, so the parent's email carries into Stripe.

**Test run** (test mode, card `4242 4242 4242 4242`, any future date, any CVC, any ZIP; email `hunterappleton369@gmail.com`; phone `9857681025`):

1. Open `SITE/free-abacus/`, fill step 1, tick the workbook, press the order button.
2. Stripe checkout shows $36.95, US shipping address, phone, terms box. Pay.
3. You land on `university.html?paid=kit`. Press the yes button. Checkout shows 14 days free then $67. Pay.
4. You land on `certify.html?paid=university`. Press yes. Pay $297.
5. You land on `thanks.html`, listing all four items.
6. In Stripe (test): **Payments** shows $36.95 and $297; **Subscriptions** shows University "Trialing" with a trial end date 14 days out.
7. Fast-forward a trial. Payment-link checkouts cannot be put on a test clock, so test the billing on its own: **Billing** → **Subscriptions** → **Test clocks** → **New simulation**. Add a customer with card `4242 4242 4242 4242`, add a subscription to Phenom University with a 14-day trial, then **Advance time** by 15 days. A $67 invoice is created and paid.
8. Repeat step 7 with card `4000 0000 0000 0341` (it saves, then fails when charged). The invoice fails and Smart Retries schedule another try. Stripe does not send customer emails in test mode, so check the subscription's event list instead.
9. Refund the $297 (see `guarantees.md`, behind the counter). Cancel the subscription in the portal using the login link.

Finish signal: every step above matched. Delete nothing; test data stays in test mode.

## 8. Webhook: Stripe writes the access tables (15 min)

> **Live account note (2026-10-22):** everything below was written against test mode. Child Phenoms now runs **live in the Enamelogic LLC account** (acct_1TivQW5uuxnQgoyB) and the live webhook destination already exists, so use these live pages instead of the test ones: signing secret at https://dashboard.stripe.com/acct_1TivQW5uuxnQgoyB/workbench/webhooks/we_1UTLUQ5uuxnQgoyBdpLGJ5tR, API keys at https://dashboard.stripe.com/acct_1TivQW5uuxnQgoyB/apikeys (a live restricted key starts with `rk_live_`), products at https://dashboard.stripe.com/acct_1TivQW5uuxnQgoyB/products. Skip Step 1 (done).

When someone pays, Stripe tells our Supabase project. A small program there (the edge function `stripe-webhook`) fills in the two tables the app reads: `purchases` (kit and Playbook) and `memberships` (University and the instructor year). A paying parent signs in and gets in. Nobody types rows by hand. The function is already deployed. It does nothing until you give it the secrets below.

| What happened in Stripe | What the webhook writes |
|---|---|
| Kit, or kit + Playbook, paid (Link A or B) | `purchases`: `kit` true, `playbook` true if the Playbook was in the order, `kit_paid_at` = that day, `order_ref` = the checkout id. Then a paid Shopify order for the supplier app, with its number in `shopify_order_name` (once "Shopify order creation" below is done) |
| Test drive started (Link C) | `memberships`: `university`, `trialing`, `trial_end` = the day of the first $67 charge |
| A $67 charge went through | `active`, `trial_end` empty, `current_period_end` = next renewal |
| Card failed, cancelled, paused, ended | `past_due`, `cancel_at` filled, `paused` with `paused_until`, or `canceled` |
| Certification paid (Link D) | `memberships`: `instructor`, `active`, `current_period_end` = one year out |
| The on-page order form (`funnel-checkout`): a kit PaymentIntent, a certification PaymentIntent, or a trial Subscription, each stamped `metadata.cp = funnel` | The same rows, Shopify order and Quick-Start emails as the matching Payment Link above; `order_ref` is the `pi_…` id |

Each change also adds a line to `note`: the date, the event and its id.

**Endpoint URL:** `https://fndemnipqtpmuvcidcxo.supabase.co/functions/v1/stripe-webhook`

Do this in test mode first, after sections 3 and 4.

### Step 1. Add the endpoint in Stripe (4 min)

1. Test mode on. Open https://dashboard.stripe.com/test/webhooks (**Developers** → **Webhooks**).
2. Click **+ Add endpoint**. (Newer dashboards say **Add destination**: pick **Your account**, then **Webhook endpoint**.)
3. **Endpoint URL:** paste the URL above.
4. **Description:** `Child Phenoms access tables`.
5. **API version:** leave what Stripe picks.
6. Click **Select events**. Search for each of these five and tick it. Nothing else.
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `payment_intent.succeeded` and `customer.subscription.created` (added 2026-10-23 for the on-page order form, `supabase/functions/funnel-checkout`; the webhook acts only on objects that function stamped with `metadata.cp = funnel`)
7. Click **Add endpoint** (or **Create destination**).

Finish signal: the Webhooks page lists the URL with 5 events.

### Step 2. Copy the signing secret (1 min)

1. Click the new endpoint.
2. Under **Signing secret**, click **Reveal**. It starts with `whsec_`.
3. Copy it. Keep it out of chat, email and the repo. You paste it in step 4.

### Step 3. Copy the Stripe key and the four price ids (5 min)

1. **Key:** open https://dashboard.stripe.com/test/apikeys (**Developers** → **API keys**) → **Secret key** → **Reveal test key** → copy it (`sk_test_…`). Safer: **+ Create restricted key** with **Read** on Checkout Sessions, Customers, Invoices, Subscriptions, Products and Prices, and nothing else (`rk_test_…`).
2. **Price ids:** **Product catalog** → open a product → under **Pricing**, click the price → copy the id at the top right (`price_…`). Do it for all four:

| Product | Secret name |
|---|---|
| Kit, $9.95 | `KIT_PRICE_ID` |
| Playbook, $27 | `PLAYBOOK_PRICE_ID` |
| Child Phenom University, $67/month | `UNIVERSITY_PRICE_ID` |
| Certified Phenom Instructor, $297 | `CERT_PRICE_ID` |

The price ids are optional, but set them. Without one, the webhook guesses from the product name ("Playbook" or "Workbook", "University", "Instructor", "Kit" or "Abacus"), and a renamed product would be missed.

### Step 4. Put the secrets in Supabase (3 min)

1. Open https://supabase.com/dashboard/project/fndemnipqtpmuvcidcxo/functions/secrets (**Edge Functions** → **Secrets**).
2. Type each name, paste its value, click **Save**.

| Name | Value |
|---|---|
| `STRIPE_WEBHOOK_SECRET` | the `whsec_…` from step 2 |
| `STRIPE_SECRET_KEY` | the `sk_test_…` or `rk_test_…` from step 3 |
| `KIT_PRICE_ID` | `price_…` |
| `PLAYBOOK_PRICE_ID` | `price_…` |
| `UNIVERSITY_PRICE_ID` | `price_…` |
| `CERT_PRICE_ID` | `price_…` |

Do not add `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY`. Supabase gives the function those by itself.

Two more secrets are optional and have their own pages: `RESEND_API_KEY` for the three Quick-Start emails a paid kit sends (`resend-setup.md`; without it the log says `EMAIL NOT SET UP` and the order still goes through), and the Shopify pair under "Shopify order creation" below.

Or from a terminal, in one line (the dashboard is safer: the terminal keeps a history of what you type):

```bash
supabase secrets set --project-ref fndemnipqtpmuvcidcxo STRIPE_WEBHOOK_SECRET=whsec_... STRIPE_SECRET_KEY=sk_test_... KIT_PRICE_ID=price_... PLAYBOOK_PRICE_ID=price_... UNIVERSITY_PRICE_ID=price_... CERT_PRICE_ID=price_...
```

New secrets work on the next event. No redeploy.

Finish signal: the Secrets page lists all six names.

### Step 5. Test it (5 min)

1. Do the section 7 test run, steps 1 to 4, with `hunterappleton369@gmail.com`.
2. Stripe → **Developers** → **Webhooks** → your endpoint → **Event deliveries**. Each event shows **200**. Click one: the response says what was written, for example `purchases h***@gmail.com: kit true, playbook true`.
3. Supabase → **Edge Functions** → **stripe-webhook** → **Logs**. One line per event, for example `stripe-webhook checkout.session.completed evt_… [test] memberships h***@gmail.com: university trialing`.
4. Supabase → **Table Editor**:
   - `purchases`: a row for your email. `kit` true, `playbook` true, `kit_paid_at` today, `order_ref` `cs_test_…`.
   - `memberships`: a row for your email. Look right after test-run step 3: `university`, `trialing`, `trial_end` 14 days out. After step 4 (certification) the same row turns `instructor`, `active`, `current_period_end` one year out. That is right: the instructor year wins over the test drive.
5. Send one event again: Stripe → **Developers** → **Events** → open a `checkout.session.completed` → **Resend** → pick the endpoint. The row stays the same (its event id is already in `note`).

If something is off, the log line says why:

| Logs or Stripe show | Fix |
|---|---|
| `NOT SET UP: missing secret …` (Stripe shows 500) | Add that secret (step 4). Stripe tries again by itself for 3 days. |
| `signature did not verify` (Stripe shows 400) | Wrong `whsec_`. Copy it again from this endpoint, in the same mode (test or live). |
| `ignored: checkout … has no Child Phenoms item` | A price id does not match. Test ids in test mode, live ids in live mode. |
| `ignored: subscription … is not Child Phenom University` | `UNIVERSITY_PRICE_ID` is wrong. |
| `FAILED … memberships write` or `purchases write` | The table is missing or was changed. Fix it; Stripe retries. |

Finish signal: every delivery shows 200, both tables have your test email with the values above, and the Logs show no `FAILED`.

### Step 6. At go-live (with section 9)

1. Live mode on. Do steps 1 and 2 again: same URL, same five events. The live endpoint has its own `whsec_`.
2. In Supabase Secrets, replace all six values with live ones: the live `whsec_`, an `sk_live_…` or `rk_live_…` key, and the live `price_…` ids.
3. Open the test endpoint → **…** → **Disable**. Its events would now fail the signature check, and Stripe would email you about it.

Finish signal: the real $9.95 order in section 9 step 5 shows 200 on the live endpoint, and `purchases` has a row for your email. The refund does not remove the row; delete it by hand if you like.

### Shopify order creation (15 min)

Every paid kit order (Link A or B) also becomes a paid order in the Shopify store `j1tu10-he`, where the supplier app picks it up. The function makes it with the parent's email and the shipping address from Stripe. It adds the $0 kit, the $27 Playbook when they bought it, the "Standard shipping (within 7 days)" $9.95 shipping line and the Stripe payment. The order is tagged `childphenoms` and has the checkout id in its note. Shopify sends no order receipt (Stripe already did). It sends the shipping confirmation once the order is fulfilled.

Until this is set up, the function still writes `purchases` and logs one line: `SHOPIFY NOT SET UP`.

**Which path.** Shopify admin → **Settings** → **Apps and sales channels** (newer admins: **Apps**) → **Develop apps**. If the page offers **Create an app** (or **Create a legacy custom app**), use path A. If it only offers **Build apps in Dev Dashboard**, use path B. Since January 1, 2026, Shopify no longer lets most stores make new admin apps, so expect path B.

**Path A: custom app in the admin (gives a token that does not expire)**

1. On **Develop apps**, click **Allow custom app development**. Read the warning, then click **Allow custom app development** again.
2. Click **Create an app**. **App name:** `Child Phenoms orders`. Click **Create app**.
3. **Configuration** tab → **Admin API integration** → **Configure**. Tick `write_orders`, `read_orders` and `read_products`. Click **Save**.
4. **API credentials** tab → **Install app** → **Install**.
5. Under **Admin API access token**, click **Reveal token once**. It starts with `shpat_`. Copy it straight into Supabase (the next step). Shopify shows it only once.

**Path B: Dev Dashboard app (gives a client ID and secret; the function gets a fresh token each day)**

1. On **Develop apps**, click **Build apps in Dev Dashboard**.
2. Click **Create app**. Under **Start from Dev Dashboard**, name it `Child Phenoms orders` and click **Create**.
3. In the new version: **App URL** = `https://shopify.dev/apps/default-app-home` (the default). **Webhooks API version**: leave what it shows. **Access** → **Scopes**: `write_orders,read_orders,read_products`. Click **Release**, name it `v1`, and click **Release** again.
4. In the app's **Installs** section, click **Install app**. Pick `j1tu10-he` and click **Install**.
5. Open the app's **Settings** and copy the **Client ID** and the **Client secret**.
6. If the app shows a **Protected customer data** request, ask for **Name**, **Email**, **Phone** and **Address**, with the reason "creating orders to ship". Without these, Shopify can refuse orders that carry a name and address.

**Put the secrets in Supabase.** Open https://supabase.com/dashboard/project/fndemnipqtpmuvcidcxo/functions/secrets, then type each name, paste its value and click **Save**:

| Name | Value |
|---|---|
| `SHOPIFY_STORE` | `j1tu10-he` |
| `SHOPIFY_ADMIN_TOKEN` | path A: the `shpat_…` token |
| `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET` | path B: the two values from path B step 5 |

Set path A's token or path B's pair, not both. With both, the token wins. `SHOPIFY_KIT_PRODUCT_ID` (10239735988480) and `SHOPIFY_PLAYBOOK_PRODUCT_ID` (10239737823488) are built in. Set them only if those Shopify products are ever replaced. No redeploy: the next event uses the secrets.

**Test it.**

1. Place a test order through Link B in Stripe test mode with `hunterappleton369@gmail.com` and a real-looking US address. (Or re-send the `checkout.session.completed` event of a test kit order that has no Shopify order yet. See "Re-send" below.)
2. Stripe → **Developers** → **Webhooks** → your endpoint → the delivery shows **200**, and the response ends with `shopify #1001: created` (your number will differ).
3. Shopify admin → **Orders**: a new order tagged `childphenoms`, `stripe`, `stripe-test`. It shows the address you typed in Stripe, the Abacus Kit at $0.00, the Playbook at $27.00 and Standard shipping (within 7 days) at $9.95, and it is marked **Paid**.
4. Supabase → **Table Editor** → `purchases`: your row has `shopify_order_id` and `shopify_order_name` (`#1001`) filled in.
5. Cancel the test order: open it → **More actions** → **Cancel order**, with no restock and no customer notification. Don't place it in the supplier app. Test orders are real Shopify orders, and the `stripe-test` tag is there to mark them.

Finish signal: a Stripe test event creates a Shopify order tagged `childphenoms` with the right address and line items, and the `purchases` row shows its number.

**Re-send (when an order did not reach Shopify).** The logs say `SHOPIFY NOT SET UP` or `SHOPIFY ORDER FAILED … for checkout cs_…`, the Stripe delivery still shows 200, and `shopify_order_id` stays empty.

1. Fix the cause (the log line says it): add the secrets, or fix the scope. An address Shopify refuses cannot be fixed by a re-send (Stripe sends the same address again): make that order by hand instead.
2. Stripe → **Developers** → **Events**. Search for the `cs_…` id from the log and open its `checkout.session.completed` event (`checkout.session.async_payment_succeeded` for a bank payment). Click **Resend** and pick the endpoint. (Or: **Webhooks** → your endpoint → **Event deliveries** → that event → **Resend**.)
3. The response shows `shopify #10xx: created` and the row gets the number.

A re-send is safe. If the row already has a Shopify order for that checkout, nothing happens. If Shopify already has an order carrying that checkout id (a timeout after Shopify saved it), the function saves that number and does not make a second order. Stripe keeps full events for 30 days. For anything older, make the order by hand (`docs/FULFILLMENT.md`, "Backup"). To list kit orders that never reached Shopify, run this in the SQL editor: `select email, order_ref, kit_paid_at from public.purchases where shopify_order_id is null and order_ref like 'cs_%' order by kit_paid_at;`

| Logs show | Fix |
|---|---|
| `SHOPIFY NOT SET UP` | Do path A or B and the Supabase secrets, then re-send. |
| `SHOPIFY ORDER FAILED … token request answered 400/401` | Wrong client ID or secret, or the app is not installed on `j1tu10-he` (path B step 4). |
| `SHOPIFY ORDER FAILED … answered 401` | Wrong or revoked `SHOPIFY_ADMIN_TOKEN`. |
| `SHOPIFY ORDER FAILED … answered 403` | A scope is missing. Path A: add it under **Configuration** and save. Path B: release a new version with it and approve the change on the store. If the 403 text mentions customer data, see path B step 6. Shopify may hold customer names and addresses back from custom apps on the Basic plan. [HUNTER: if so, the fix is the Grow plan] |
| `SHOPIFY ORDER FAILED … answered 404` | `SHOPIFY_STORE` is wrong, or a product id no longer exists. |
| `SHOPIFY ORDER FAILED … answered 422` | Shopify did not accept a field, usually the address. The log shows which. Make that order by hand with the corrected address (`docs/FULFILLMENT.md`, "Backup"). |
| `SHOPIFY ORDER #… HAS NO SHIPPING ADDRESS` | The checkout carried no address. Add it to the Shopify order before it ships. |
| `SHOPIFY ORDER #… made, but not saved on the purchases row` | Type the two values from the log into the row by hand. |

At go-live nothing changes here. The live and test webhooks both write to the same Shopify store. Live orders carry no `stripe-test` tag.

### Still by hand

- **Refunds and chargebacks** change nothing. To take the library away, set `keeps_library` false. To take the Playbook away, set `playbook` false. A refunded kit's Shopify order stays open: cancel it in Shopify before the supplier app ships it.
- **The instructor year does not end by itself.** No Stripe event comes a year later, and the app does not check the date. When `current_period_end` passes, set `status` to `canceled`. [HUNTER: or have a nightly job built]
- **A University member who buys certification** keeps paying $67 a month in Stripe unless you cancel or pause that subscription. The row shows the instructor year either way. [HUNTER: should the free year pause their $67?]
- **Pause in Stripe** (`ops-runbook.md` §3.8), not only in the table. The next Stripe event for that member overwrites a pause typed into the table.

## 9. Go live (10 min)

1. Switch off **Test mode**.
2. Make the four products again (or open each test product → **Copy to live mode** where Stripe offers it).
3. Make the four payment links again in live mode with the same settings (section 4), and the portal (section 5) and email settings (section 6) again: live and test settings are separate.
4. Replace the four `test_` links in `config.js` with the live ones. Push the site.
5. Place one real kit order on your own card. Check the payment, the shipping address and the email. Refund it.

Finish signal: a real $9.95 payment and its refund show in the live Payments list, and `config.js` has no `test_` in it.

<!-- status: needs Hunter: do the clicks; support phone, tax decision, one-click-upsell decision -->

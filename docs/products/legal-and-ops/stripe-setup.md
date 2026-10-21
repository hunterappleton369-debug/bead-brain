# Stripe Payment Links setup

Click-by-click: four products, four payment links, the billing portal, reminders, and the test run. About 60 minutes.

**Finish signal for the whole guide:** `free-abacus/config.js` has four `https://buy.stripe.com/...` links, and a test order walks kit → University → certify → thanks with the right charges in Stripe.

## 0. Before you start

- You need: Stripe login, the live site address, and the legal pages published (Stripe asks for their URLs).
- Site address below is written as `SITE`. Use `https://childphenoms.com` once DNS is live; until then use `https://hunterappleton369-debug.github.io/bead-brain`.
- Do everything in **test mode** first (toggle **Test mode** top right, or open a **Sandbox**). Section 8 repeats it in live mode.

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
| 2 | Prodigy Maker Workbook + Audiobook | 90-day printed workbook, ships in the same box. Playbook audiobook by email. | $27.00 | One-off |
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

## 8. Go live (10 min)

1. Switch off **Test mode**.
2. Make the four products again (or open each test product → **Copy to live mode** where Stripe offers it).
3. Make the four payment links again in live mode with the same settings (section 4), and the portal (section 5) and email settings (section 6) again: live and test settings are separate.
4. Replace the four `test_` links in `config.js` with the live ones. Push the site.
5. Place one real kit order on your own card. Check the payment, the shipping address and the email. Refund it.

Finish signal: a real $9.95 payment and its refund show in the live Payments list, and `config.js` has no `test_` in it.

<!-- status: needs Hunter: do the clicks; support phone, tax decision, one-click-upsell decision -->

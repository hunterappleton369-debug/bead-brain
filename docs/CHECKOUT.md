# On-page checkout and one-click upsells

Built 2026-10-23 at Hunter's request: the card form lives in step 2 of the order form, the way a ClickFunnels order form does, and the two upsell pages charge the saved card with one click. The hosted Stripe Payment Links in `free-abacus/config.js` stay as the fallback: if the on-page checkout cannot start, the buttons send the parent to them exactly as before.

## How it works

1. **Step 1** collects first name, last name, email and phone (unchanged).
2. **Step 2** calls `supabase/functions/funnel-checkout` (`action: start`). The function finds or creates a Stripe Customer by email and creates a PaymentIntent for $9.95 with `setup_future_usage: off_session`, so the card is saved to the customer when it is charged. The page mounts Stripe's Address Element (shipping, US only) and Payment Element (card, Apple Pay, Google Pay, Link) with the client secret. The Playbook bump checkbox sits under the card fields; ticking it calls `action: update`, which raises the intent to $36.95, and the Payment Element refreshes.
3. **Complete order** confirms the PaymentIntent on the page. Success sends the parent to `university.html?paid=kit` with the intent id and client secret kept in local storage.
4. **University page**: the yes button calls `action: upsell` with `kind: university`. The function starts a $67/month subscription with a 14-day trial on the saved card (`trial_period_days: 14`, cancels if the card disappears) and marks the kit intent so it cannot run twice. Then `certify.html?paid=university`.
5. **Certification page**: the yes button calls `kind: certify`, which charges $297 off-session to the saved card, once. Then `thanks.html?paid=certify`.
6. If a one-click charge fails (declined card), the button falls back to the hosted Payment Link so the parent can enter another card.

The browser proves it owns an order with the PaymentIntent's client secret; prices are fixed in the function, never sent by the browser. Statement descriptor suffix "CHILD PHENOMS" is requested on every charge and dropped if the account refuses it.

**Status 2026-10-24:** live. The restricted key has the permissions below (Hunter applied them), the publishable key in `free-abacus/config.js` is the full 107-character `pk_live_…`, and step 2 mounts the address and card fields on childphenoms.com. The page, FAQ, thank-you page, Quick-Start email Q1 and the Stripe kit description all promise delivery within 7 days (Hunter's call; DSers quotes 9 to 15 days for the listing's US method, so watch the first deliveries).

## What Stripe needs

- The restricted key in Supabase (`STRIPE_SECRET_KEY`, the one the webhook uses) needs **Customers: Write, Payment Intents: Write, Subscriptions: Write, Payment Methods: Read, Products: Read, Prices: Read**. Without Customers write the function answers 400 "Permission denied" and the page falls back to the hosted links.
- The webhook destination `childphenoms-supabase-webhook` listens to `payment_intent.succeeded` and `customer.subscription.created` as well as the five events it had (done 2026-10-23). `stripe-webhook` treats a PaymentIntent or Subscription with `metadata.cp = 'funnel'` like a paid Checkout Session: purchases row, Shopify order, Quick-Start emails, membership row.
- Apple Pay and Google Pay: `childphenoms.com` is registered under Settings → Payments → Payment method domains, and the site serves `/.well-known/apple-developer-merchantid-domain-association` (`.nojekyll` makes GitHub Pages publish the dot folder). Apple Pay shows only in Safari on a device with a card in Wallet.

## Not covered yet

- Stripe Tax is not applied to on-page orders (the Payment Links had it). Wyoming computed $0 anyway; ask the CPA before registering elsewhere.
- The checkout page name shown in the Apple Pay sheet is "Child Phenoms" (set on the Payment Element); card statements still carry the account's ENAMELOGIC prefix.

## Files

`free-abacus/funnel.js` (`orderForm`, `upsell`), `free-abacus/funnel.css` (`.pay-block`, `.stripe-el`), `free-abacus/index.html` step 2, `free-abacus/config.js` (`stripePublishableKey`, `checkoutApi`), `supabase/functions/funnel-checkout/index.ts`.

// Child Phenoms funnel-checkout: the order form's server, so the card form lives on the page (ClickFunnels style)
// and the two upsells are one click.
//
//   start   → a Customer (found by email or created) and a PaymentIntent for the kit ($9.95), or kit + Playbook
//             ($36.95). The card is saved for off-session use, which is what makes the upsells one click.
//   update  → the Playbook bump was ticked or unticked: the same intent gets the new amount.
//   upsell  → after the kit is paid: 'university' starts the $67/month subscription with a 14-day trial on the
//             saved card; 'certify' charges $297 to it. Each runs once per order (idempotent).
//
// The browser proves it owns an order with the intent's client_secret, which only the paying browser has.
// Prices are fixed here on the server; the browser only says whether the bump is ticked.
// Secrets: STRIPE_SECRET_KEY (required); UNIVERSITY_PRICE_ID and CERT_PRICE_ID (optional: found by product
// name when empty). Deployed with verify_jwt off: the page has no Supabase session when it calls this.
// The stripe-webhook function turns the resulting payment_intent.succeeded and customer.subscription.created
// events into purchases, memberships, the Shopify order and the Quick-Start emails.
import Stripe from 'npm:stripe@^17';

const env = (k: string) => (Deno.env.get(k) ?? '').trim();
const ORIGINS = ['https://childphenoms.com', 'https://www.childphenoms.com', 'http://localhost:8000', 'http://127.0.0.1:8000'];
const KIT_CENTS = 995;
const PLAYBOOK_CENTS = 2700;
const CERT_CENTS = 29700;
const SUFFIX = 'CHILD PHENOMS'; // card statements read ENAMELOGIC* CHILD PHENOMS where the account allows a suffix
const KIT_DESC = 'Child Phenoms Free Abacus Kit (shipping and handling)';
const PLAYBOOK_DESC = 'Child Prodigy Secrets Playbook + Audiobook';
const CERT_DESC = 'Certified Phenom Instructor';
const UNIVERSITY_NAME = 'Child Phenom University';
const CERT_NAME = 'Certified Phenom Instructor';

type Body = Record<string, unknown>;
const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const cleanEmail = (e: string) => { const v = e.trim().toLowerCase(); return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? v : ''; };

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  const cors: Record<string, string> = {
    'Access-Control-Allow-Origin': ORIGINS.includes(origin) ? origin : ORIGINS[0],
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
  const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...cors, 'content-type': 'application/json; charset=utf-8' } });
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  if (!env('STRIPE_SECRET_KEY')) { console.error('funnel-checkout NOT SET UP: missing STRIPE_SECRET_KEY'); return json({ error: 'Checkout is not set up yet.' }, 500); }
  const stripe = new Stripe(env('STRIPE_SECRET_KEY'), { httpClient: Stripe.createFetchHttpClient() });

  let body: Body = {};
  try { body = await req.json(); } catch { return json({ error: 'bad json' }, 400); }
  const action = str(body.action, 20);
  try {
    if (action === 'start') return json(await start(stripe, body));
    if (action === 'update') return json(await update(stripe, body));
    if (action === 'upsell') return json(await upsell(stripe, body));
    return json({ error: 'unknown action' }, 400);
  } catch (e) {
    const err = e as { type?: string; code?: string; message?: string; statusCode?: number };
    console.error(`funnel-checkout ${action} FAILED: ${err.type ?? ''} ${err.code ?? ''} ${err.message ?? e}`);
    const status = err.statusCode && err.statusCode < 500 ? 400 : 500;
    return json({ error: friendly(err) }, status);
  }
});

// ───────── start: customer + kit intent ─────────
async function start(stripe: Stripe, b: Body) {
  const email = cleanEmail(str(b.email));
  if (!email) throw Object.assign(new Error('That does not look like an email address.'), { statusCode: 400 });
  const first = str(b.first, 60), last = str(b.last, 60), phone = str(b.phone, 30);
  const bump = b.bump === true || b.bump === '1' || b.bump === 1;
  const name = `${first} ${last}`.trim();

  const found = await stripe.customers.list({ email, limit: 1 });
  let customer = found.data[0] ?? null;
  if (!customer) customer = await stripe.customers.create({ email, name: name || undefined, phone: phone || undefined, metadata: { cp: 'funnel' } });
  else if ((name && !customer.name) || (phone && !customer.phone)) customer = await stripe.customers.update(customer.id, { name: customer.name || name || undefined, phone: customer.phone || phone || undefined });

  const params: Stripe.PaymentIntentCreateParams = {
    amount: KIT_CENTS + (bump ? PLAYBOOK_CENTS : 0),
    currency: 'usd',
    customer: customer.id,
    setup_future_usage: 'off_session',
    automatic_payment_methods: { enabled: true },
    description: bump ? `${KIT_DESC} + ${PLAYBOOK_DESC}` : KIT_DESC,
    metadata: { cp: 'funnel', kind: 'kit', kit: '1', playbook: bump ? '1' : '0', email, first, last, phone },
  };
  const pi = await withSuffix(stripe, params);
  console.log(`funnel-checkout start ${pi.id} ${email} bump=${bump}`);
  return { intentId: pi.id, clientSecret: pi.client_secret, amount: pi.amount, customerId: customer.id };
}

async function withSuffix(stripe: Stripe, params: Stripe.PaymentIntentCreateParams, opts?: Stripe.RequestOptions) {
  try { return await stripe.paymentIntents.create({ ...params, statement_descriptor_suffix: SUFFIX }, opts); }
  catch (e) {
    const msg = String((e as { message?: string }).message ?? '');
    if (!/statement_descriptor/i.test(msg)) throw e;
    console.warn(`funnel-checkout: statement_descriptor_suffix refused (${msg.slice(0, 120)}), creating without it`);
    return await stripe.paymentIntents.create(params, opts);
  }
}

// ───────── update: the bump changed ─────────
async function update(stripe: Stripe, b: Body) {
  const pi = await owned(stripe, b);
  const bump = b.bump === true || b.bump === '1' || b.bump === 1;
  const open = ['requires_payment_method', 'requires_confirmation', 'requires_action'].includes(pi.status);
  if (!open) return { intentId: pi.id, amount: pi.amount, status: pi.status };
  const amount = KIT_CENTS + (bump ? PLAYBOOK_CENTS : 0);
  if (amount === pi.amount) return { intentId: pi.id, amount, status: pi.status };
  const u = await stripe.paymentIntents.update(pi.id, { amount, description: bump ? `${KIT_DESC} + ${PLAYBOOK_DESC}` : KIT_DESC, metadata: { playbook: bump ? '1' : '0' } });
  return { intentId: u.id, amount: u.amount, status: u.status };
}

// ───────── upsell: one click on the saved card ─────────
async function upsell(stripe: Stripe, b: Body) {
  const kind = str(b.kind, 20);
  if (kind !== 'university' && kind !== 'certify') throw Object.assign(new Error('unknown upsell'), { statusCode: 400 });
  const pi = await owned(stripe, b, ['payment_method']);
  if (pi.status !== 'succeeded') throw Object.assign(new Error('The kit order has not been paid yet.'), { statusCode: 400 });
  const customer = typeof pi.customer === 'string' ? pi.customer : pi.customer?.id;
  const pm = typeof pi.payment_method === 'string' ? pi.payment_method : pi.payment_method?.id;
  if (!customer || !pm) throw Object.assign(new Error('No saved card on this order.'), { statusCode: 400 });
  const email = pi.metadata.email || '';
  const already = pi.metadata[`upsell_${kind}`];
  if (already) { console.log(`funnel-checkout upsell ${kind} already done for ${pi.id}: ${already}`); return { ok: true, id: already, already: true }; }

  if (kind === 'university') {
    const price = env('UNIVERSITY_PRICE_ID') || await priceFor(stripe, UNIVERSITY_NAME);
    await stripe.customers.update(customer, { invoice_settings: { default_payment_method: pm } });
    const sub = await stripe.subscriptions.create({
      customer, items: [{ price }], trial_period_days: 14, default_payment_method: pm,
      trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
      metadata: { cp: 'funnel', kind: 'university', email, order_intent: pi.id },
    }, { idempotencyKey: `${pi.id}-university` });
    await stripe.paymentIntents.update(pi.id, { metadata: { upsell_university: sub.id } });
    console.log(`funnel-checkout upsell university ${sub.id} ${sub.status} for ${pi.id}`);
    return { ok: true, id: sub.id, status: sub.status };
  }

  const cert = await withSuffix(stripe, {
    amount: CERT_CENTS, currency: 'usd', customer, payment_method: pm, off_session: true, confirm: true,
    description: CERT_DESC, metadata: { cp: 'funnel', kind: 'cert', email, order_intent: pi.id },
  }, { idempotencyKey: `${pi.id}-certify` });
  if (cert.status !== 'succeeded') throw Object.assign(new Error('The card did not go through. Try another card.'), { statusCode: 400 });
  await stripe.paymentIntents.update(pi.id, { metadata: { upsell_certify: cert.id } });
  console.log(`funnel-checkout upsell certify ${cert.id} for ${pi.id}`);
  return { ok: true, id: cert.id, status: cert.status };
}

// The browser must present the intent's own client_secret: proof that it is the browser that paid.
async function owned(stripe: Stripe, b: Body, expand: string[] = []) {
  const id = str(b.intentId, 80), secret = str(b.clientSecret, 200);
  if (!/^pi_[A-Za-z0-9]+$/.test(id) || !secret) throw Object.assign(new Error('missing order'), { statusCode: 400 });
  const pi = await stripe.paymentIntents.retrieve(id, { expand });
  if (pi.client_secret !== secret || pi.metadata?.cp !== 'funnel') throw Object.assign(new Error('order not found'), { statusCode: 404 });
  return pi;
}

async function priceFor(stripe: Stripe, name: string): Promise<string> {
  const products = await stripe.products.search({ query: `active:'true' AND name:'${name.replace(/'/g, "\\'")}'`, limit: 1 });
  const product = products.data[0];
  if (!product) throw new Error(`no active Stripe product named ${name}`);
  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 1 });
  const price = prices.data[0];
  if (!price) throw new Error(`no active price on ${name}`);
  return price.id;
}

function friendly(e: { type?: string; code?: string; message?: string; decline_code?: string }): string {
  const code = e.code ?? '';
  if (e.type === 'StripeCardError' || code === 'card_declined') return 'The card was declined. Try another card.';
  if (code === 'authentication_required') return 'Your bank wants to check this card. Use the button below to confirm it.';
  if (code === 'insufficient_funds') return 'The card does not have enough on it. Try another card.';
  if (e.message && /email|order|upsell|paid|card/i.test(e.message) && e.message.length < 120) return e.message;
  return 'Something went wrong on our side. Try again in a moment.';
}

// Child Phenoms: Stripe tells this function when someone pays, and it writes the access rows the app reads
// (supabase/memberships.sql and supabase/purchases.sql), so nobody types them by hand.
// What each Stripe event does to a row: docs/APP-DELIVERY.md §3. Setup and test: docs/products/legal-and-ops/stripe-setup.md §8.
//
// Secrets (Supabase → Edge Functions → Secrets): STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET (required);
// KIT_PRICE_ID, PLAYBOOK_PRICE_ID, UNIVERSITY_PRICE_ID, CERT_PRICE_ID (optional: while one is empty, that item is
// recognised by its product name instead). SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected by Supabase.
// Shopify order for each paid kit (optional; without it the purchases row is still written): SHOPIFY_ADMIN_TOKEN, or
// SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET of a Dev Dashboard app; SHOPIFY_STORE (default j1tu10-he);
// SHOPIFY_KIT_PRODUCT_ID and SHOPIFY_PLAYBOOK_PRODUCT_ID (default the two products in that store).
// Quick-Start emails for each paid kit (optional; without it the row is still written): RESEND_API_KEY, and
// RESEND_FROM (default "Hunter at Child Phenoms <hello@childphenoms.com>"). The three emails are ./emails.ts, built
// by tools/build-emails.mjs from docs/products/marketing-sequences/10-quickstart-soap-opera.md.
// Deployed with verify_jwt off because Stripe cannot send a Supabase JWT: the Stripe signature is the lock.
//
// Ground rules: only the signed event and Stripe's own API decide anything (metadata is never read). Every write
// is worked out from the event plus Stripe's current state, and the event id goes into `note`, so the same event
// sent twice leaves the same row. A failed write answers 500 and Stripe retries for up to three days. The Shopify
// order is the exception: a Shopify problem answers 200 (see "Shopify" below).

import Stripe from 'npm:stripe@^17';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { QUICKSTART } from './emails.ts';

type Status = 'trialing' | 'active' | 'past_due' | 'paused' | 'canceled';
type Kind = 'kit' | 'playbook' | 'university' | 'cert';
// deno-lint-ignore no-explicit-any
type Row = Record<string, any>;
interface Ctx { stripe: Stripe; sb: SupabaseClient; event: Stripe.Event; day: string; today: string }
type CustomerRef = string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined;

const TZ = 'America/Denver'; // the tables store plain days: a Stripe timestamp becomes its day in US Mountain time
const NOTE_MAX = 499;        // `note` keeps its newest entries, under 500 characters
const REQUIRED = ['STRIPE_WEBHOOK_SECRET', 'STRIPE_SECRET_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

const env = (k: string) => (Deno.env.get(k) ?? '').trim();
const cryptoProvider = Stripe.createSubtleCryptoProvider();

// ───────── the endpoint ─────────
export async function serve(req: Request): Promise<Response> {
  if (req.method !== 'POST') return reply(405, 'POST only');
  const signature = req.headers.get('stripe-signature');
  if (!signature) return reply(400, 'missing Stripe-Signature header');
  const missing = REQUIRED.filter((k) => !env(k));
  if (missing.length) {
    console.error(`stripe-webhook NOT SET UP: missing secret ${missing.join(', ')}. Add it in Supabase → Edge Functions → Secrets (stripe-setup.md §8). Answering 500, so Stripe tries again later.`);
    return reply(500, `webhook not set up: missing ${missing.join(', ')}`);
  }
  const stripe = stripeFor(env('STRIPE_SECRET_KEY'));
  const body = await req.text(); // the raw body: the signature is over these exact bytes
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, env('STRIPE_WEBHOOK_SECRET'), undefined, cryptoProvider);
  } catch (e) {
    console.warn(`stripe-webhook rejected: signature did not verify (${short(e)})`);
    return reply(400, 'signature did not verify');
  }
  const mode = event.livemode ? 'live' : 'test';
  try {
    const outcome = await handle(event, stripe, supabase());
    console.log(`stripe-webhook ${event.type} ${event.id} [${mode}] ${outcome}`);
    return reply(200, outcome);
  } catch (e) {
    console.error(`stripe-webhook ${event.type} ${event.id} [${mode}] FAILED, Stripe will retry: ${short(e)}`);
    return reply(500, 'failed, Stripe will retry');
  }
}

// ───────── what each event does ─────────
export async function handle(event: Stripe.Event, stripe: Stripe, sb: SupabaseClient): Promise<string> {
  const c: Ctx = { stripe, sb, event, day: toDay(event.created)!, today: toDay(Date.now() / 1000)! };
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': // a bank payment that cleared after checkout
      return checkout(c, event.data.object as Stripe.Checkout.Session);
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sent = event.data.object as Stripe.Subscription;
      const sub = await getSubscription(c, sent.id, sent); // Stripe's state now, so late or repeated events cannot undo a newer one
      return subscription(c, sub, { deleted: event.type === 'customer.subscription.deleted' });
    }
    case 'invoice.paid':
      return invoicePaid(c, event.data.object as Stripe.Invoice);
    default:
      return 'ignored: not an event this webhook uses';
  }
}

async function checkout(c: Ctx, s: Stripe.Checkout.Session): Promise<string> {
  const email = await emailOf(c, [s.customer_details?.email, s.customer_email], s.customer);
  if (!email) return `skipped: checkout ${s.id} has no email`;
  if (s.mode === 'subscription') {
    const subId = idOf(s.subscription);
    if (!subId) return `skipped: checkout ${s.id} has no subscription`;
    return subscription(c, await getSubscription(c, subId), { email });
  }
  if (s.mode !== 'payment') return `ignored: checkout mode ${s.mode}`;
  if (s.payment_status === 'unpaid') return `waiting: checkout ${s.id} is not paid yet (async_payment_succeeded finishes it)`;
  const items = await c.stripe.checkout.sessions.listLineItems(s.id, { limit: 100, expand: ['data.price.product'] });
  const kinds = new Set(items.data.map((li) => kindOf(li.price, li.description)));
  const done: string[] = [];
  if (kinds.has('kit') || kinds.has('playbook')) {
    const kit = kinds.has('kit'), playbook = kinds.has('playbook');
    const bought = await writePurchase(c, s, email, kit, playbook); // first: a failed write answers 500 before Shopify is touched
    done.push(bought.text, await shopifyOrder(c, s, email, kit, playbook, bought.shopify));
    if (kit) done.push(await quickStartEmails(c, s, email, playbook, bought.welcomeSentAt));
  }
  if (kinds.has('cert')) done.push(await writeCertification(c, s, email));
  return done.length ? done.join('; ') : `ignored: checkout ${s.id} has no Child Phenoms item`;
}

// Kit and Playbook: one purchases row per email. A repeat order never takes the Playbook away. The Shopify columns
// belong to the checkout in order_ref: a new checkout starts them empty, so a parent's second order ships too.
async function writePurchase(c: Ctx, s: Stripe.Checkout.Session, email: string, kit: boolean, playbook: boolean) {
  const { data: old, error } = await c.sb.from('purchases')
    .select('kit,playbook,note,order_ref,shopify_order_id,shopify_order_name,welcome_sent_at').eq('email', email).maybeSingle();
  if (error) throw new Error(`purchases read: ${error.message}`);
  const sameOrder = old?.order_ref === s.id;
  const row: Row = {
    email,
    kit: kit || !!old?.kit,
    playbook: playbook || !!old?.playbook,
    kit_paid_at: c.day,
    order_ref: s.id,
    note: addNote(c, old?.note),
  };
  if (!sameOrder) Object.assign(row, { shopify_order_id: null, shopify_order_name: null });
  const { error: werr } = await c.sb.from('purchases').upsert(row, { onConflict: 'email' });
  if (werr) throw new Error(`purchases write: ${werr.message}`);
  const shopify: ShopifyRef | null = sameOrder && old?.shopify_order_id
    ? { id: String(old.shopify_order_id), name: old.shopify_order_name ? String(old.shopify_order_name) : null } : null;
  return { text: `purchases ${mask(email)}: kit ${row.kit}, playbook ${row.playbook}`, shopify, welcomeSentAt: old?.welcome_sent_at ? String(old.welcome_sent_at) : null };
}

// ───────── Resend: the 3-Night Quick-Start emails ─────────
// Q1 goes the moment a kit is paid; Q2 and Q3 are handed to Resend with scheduled_at one and two days after the
// order (Resend holds a scheduled email for up to 30 days). Like Shopify, nothing here answers 500: a Resend problem
// is logged and Stripe gets 200. Sent once per email address: welcome_sent_at is written as soon as Resend accepts
// Q1, and a row that has it is skipped, so a retry, a re-sent event or a second kit order never repeats the
// sequence. Resend's Idempotency-Key (one per checkout and email, honoured 24 hours) covers a retry that lands
// between the send and the row update. Resend's ids go into welcome_email_ids: cancel Q2 or Q3 there when a parent
// unsubscribes after Q1 or a kit is refunded (Resend → Emails → the id → Cancel).
const RESEND_API = 'https://api.resend.com/emails';
const RESEND_TIMEOUT_MS = 8000;
const FROM_DEFAULT = 'Hunter at Child Phenoms <hello@childphenoms.com>';
const SUPPORT = 'hello@childphenoms.com';
const UNSUB_MAILTO = `mailto:${SUPPORT}?subject=Unsubscribe`;
const DAY_S = 86400;

async function quickStartEmails(c: Ctx, s: Stripe.Checkout.Session, email: string, playbook: boolean, sentAt: string | null): Promise<string> {
  if (sentAt) return `quick-start: already sent ${sentAt.slice(0, 10)}`;
  const key = env('RESEND_API_KEY');
  if (!key) {
    console.error(`stripe-webhook EMAIL NOT SET UP: no RESEND_API_KEY, so checkout ${s.id} got no Quick-Start emails. Add it (docs/products/legal-and-ops/resend-setup.md), then re-send this event from Stripe.`);
    return 'quick-start: EMAIL NOT SET UP, nothing sent';
  }
  const firstName = firstNameOf(s) || 'there';
  const now = Math.floor(Date.now() / 1000);
  const ids: string[] = [];
  for (const [i, m] of QUICKSTART.entries()) {
    // Days 1 and 2 count from the order; a re-sent event days later still lands them at least a minute from now.
    const at = i ? new Date(Math.max(s.created + i * DAY_S, now + 60) * 1000).toISOString() : null;
    const body = {
      from: env('RESEND_FROM') || FROM_DEFAULT,
      to: [email],
      reply_to: SUPPORT,
      subject: m.subject,
      html: fill(m.html, firstName, playbook, `<a href="${UNSUB_MAILTO}" style="color:#6b7280">email us</a>`),
      text: fill(m.text, firstName, playbook, `email ${SUPPORT} with "Unsubscribe" in the subject`),
      headers: { 'List-Unsubscribe': `<${UNSUB_MAILTO}>` },
      tags: [{ name: 'sequence', value: 'quickstart' }, { name: 'email', value: m.key }, { name: 'mode', value: c.event.livemode ? 'live' : 'test' }],
      ...(at ? { scheduled_at: at } : {}),
    };
    try {
      const res = await fetch(RESEND_API, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `quickstart/${s.id}/${m.key}` },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`Resend answered ${res.status}: ${maskEmails(text).slice(0, 300)}`);
      const id = String(JSON.parse(text).id ?? '');
      if (!id) throw new Error('Resend answered without an id');
      ids.push(id);
    } catch (e) {
      if (i === 0) {
        console.error(`stripe-webhook ${c.event.id} QUICK-START EMAIL FAILED for checkout ${s.id} (${m.key}): ${short(e, 400)}. Nothing sent; fix the cause, then re-send this event from Stripe.`);
        return 'quick-start: FAILED, nothing sent (Supabase logs say why); re-send the event once fixed';
      }
      console.error(`stripe-webhook ${c.event.id} QUICK-START EMAIL ${m.key} FAILED for checkout ${s.id}: ${short(e, 400)}. Q1 went out; send ${m.key} to ${mask(email)} by hand from Resend.`);
      break;
    }
    if (i === 0) await markWelcome(c, email, { welcome_sent_at: new Date().toISOString(), welcome_email_ids: ids.join(',') });
  }
  if (ids.length > 1) await markWelcome(c, email, { welcome_email_ids: ids.join(',') });
  return `quick-start ${mask(email)}: ${ids.length === QUICKSTART.length ? 'q1 sent, q2 and q3 scheduled' : `${ids.length} of ${QUICKSTART.length} accepted (see logs)`}`;
}

// Q1 is out: the row says so before anything else can fail. A failed update is logged, not thrown (a 500 would
// make Stripe retry, and the idempotency key is the only thing then stopping a second Q1 after 24 hours).
async function markWelcome(c: Ctx, email: string, patch: Row) {
  const { error } = await c.sb.from('purchases').update(patch).eq('email', email);
  if (error) console.error(`stripe-webhook ${c.event.id} QUICK-START sent to ${mask(email)}, but the purchases row did not take ${Object.keys(patch).join(', ')} (${error.message}). Type them in by hand: ${JSON.stringify(patch)}.`);
}

function fill(t: string, firstName: string, playbook: boolean, unsubscribe: string) {
  return t.replace(/\{\{first_name\}\}/g, firstName)
    .replace(/\{\{if_bump\}\}([\s\S]*?)\{\{end_if\}\}/g, playbook ? '$1' : '')
    .replace(/\{\{unsubscribe\}\}/g, unsubscribe)
    .replace(/<p[^>]*>\s*<\/p>\n?/g, '') // a Playbook-only paragraph, emptied for a kit-only order
    .replace(/\n{3,}/g, '\n\n');
}

// The parent's first name: the first word of the name Stripe collected (the buyer's, else the shipping name).
function firstNameOf(s: Stripe.Checkout.Session): string {
  // deno-lint-ignore no-explicit-any
  const raw = s as any;
  const name: string = s.customer_details?.name ?? raw.collected_information?.shipping_details?.name ?? raw.shipping_details?.name ?? '';
  const first = name.trim().split(/\s+/)[0] ?? '';
  return /^[\p{L}'’.-]{1,30}$/u.test(first) ? first.replace(/^(.)(.*)$/u, (_, a, b) => a.toUpperCase() + b) : '';
}

// ───────── Shopify: the order the supplier app ships ─────────
// Shopify is the fulfilment back office (docs/FULFILLMENT.md): the supplier app picks its orders up. Each paid kit
// checkout becomes one paid Shopify order: the $0 kit, the $27 Playbook when bought, and the $9.95 USPS line, which
// adds up to what Stripe charged. Nothing here answers 500: a Shopify problem is logged, shopify_order_id stays
// empty, and Stripe gets 200 (a retry cannot fix a missing token, and retrying a half-finished call could ship twice).
// Fix the cause, then re-send the event from Stripe (stripe-setup.md §8). Before creating, it asks Shopify for an
// order already carrying this checkout id, so a re-send after a timeout does not make a second one.
interface ShopifyRef { id: string; name: string | null }
interface Shopify { store: string; call: (path: string, post?: unknown) => Promise<Row> }
const SHOPIFY_API = '2025-01';
const SHOPIFY_SHIPPING = { title: 'USPS Ground Advantage (2 to 7 days)', price: '9.95', code: 'childphenoms-kit' };
const SHOPIFY_TIMEOUT_MS = 8000;
const variantIds = new Map<string, number>(); // "store/product id" → its first variant id, while the function stays warm
let shopifyToken: { key: string; token: string; until: number } | undefined;

async function shopifyOrder(c: Ctx, s: Stripe.Checkout.Session, email: string, kit: boolean, playbook: boolean, made: ShopifyRef | null): Promise<string> {
  if (made) return `shopify ${made.name ?? made.id}: already made`;
  if (!env('SHOPIFY_ADMIN_TOKEN') && !(env('SHOPIFY_CLIENT_ID') && env('SHOPIFY_CLIENT_SECRET'))) {
    console.error(`stripe-webhook SHOPIFY NOT SET UP: no SHOPIFY_ADMIN_TOKEN (or SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET), so checkout ${s.id} has no Shopify order. Add it (stripe-setup.md §8, Shopify order creation), then re-send this event from Stripe.`);
    return 'shopify: not set up, no order made';
  }
  let order: Row | null;
  let found = false;
  let noAddress = false;
  try {
    const sh = await shopifyApi();
    order = await shopifyOrderFor(sh, s);
    found = !!order;
    if (!order) {
      const line_items: Row[] = [];
      if (kit) line_items.push({ variant_id: await variantOf(sh, env('SHOPIFY_KIT_PRODUCT_ID') || '10239735988480'), quantity: 1 });
      if (playbook) line_items.push({ variant_id: await variantOf(sh, env('SHOPIFY_PLAYBOOK_PRODUCT_ID') || '10239737823488'), quantity: 1 });
      const body = orderBody(c, s, email, line_items);
      noAddress = !body.shipping_address;
      order = (await sh.call('orders.json', { order: body })).order ?? null;
      if (!order?.id) throw new Error('Shopify answered without an order id');
    }
  } catch (e) {
    console.error(`stripe-webhook ${c.event.id} SHOPIFY ORDER FAILED for checkout ${s.id}: ${short(e, 600)}. shopify_order_id left empty: fix the cause, then re-send this event from Stripe.`);
    return 'shopify: FAILED, no order made (Supabase logs say why); re-send the event once fixed';
  }
  const ref = { shopify_order_id: String(order.id), shopify_order_name: order.name ? String(order.name) : null };
  const label = ref.shopify_order_name ?? ref.shopify_order_id;
  if (noAddress) console.warn(`stripe-webhook ${c.event.id} SHOPIFY ORDER ${label} HAS NO SHIPPING ADDRESS: checkout ${s.id} carried none. Add it in Shopify before it ships.`);
  const { error } = await c.sb.from('purchases').update(ref).eq('email', email).eq('order_ref', s.id);
  if (error) {
    // Answer 200 anyway: a Stripe retry would only find this order again. The row needs the two values by hand.
    console.error(`stripe-webhook ${c.event.id} SHOPIFY ORDER ${label} made, but not saved on the purchases row (${error.message}). Type shopify_order_id ${ref.shopify_order_id} and shopify_order_name ${label} into the row by hand.`);
    return `shopify ${label}: made, NOT saved on the row (see logs)`;
  }
  return `shopify ${label}: ${found ? 'already in Shopify, saved on the row' : 'created'}${noAddress ? ', NO SHIPPING ADDRESS' : ''}`;
}

function orderBody(c: Ctx, s: Stripe.Checkout.Session, email: string, line_items: Row[]): Row {
  // deno-lint-ignore no-explicit-any
  const raw = s as any; // newer API versions move shipping_details under collected_information
  const ship = raw.collected_information?.shipping_details ?? raw.shipping_details ?? null;
  const cd = s.customer_details;
  const buyer: string | null = cd?.name ?? raw.customer_details?.individual_name ?? null;
  const phone = cd?.phone ?? null;
  const shipping_address = addressFor(ship?.name ?? buyer, ship?.address, phone) ?? addressFor(buyer ?? ship?.name, cd?.address, phone);
  const billing_address = addressFor(buyer ?? ship?.name, cd?.address, phone) ?? shipping_address;
  const amount = (s.amount_total ?? 0) / 100;
  const pi = idOf(s.payment_intent);
  return {
    email,
    line_items,
    ...(shipping_address ? { shipping_address } : {}),
    ...(billing_address ? { billing_address } : {}),
    shipping_lines: [SHOPIFY_SHIPPING],
    financial_status: 'paid',
    transactions: amount > 0 ? [{ kind: 'sale', status: 'success', amount: amount.toFixed(2), gateway: 'Stripe' }] : [],
    tags: c.event.livemode ? 'childphenoms, stripe' : 'childphenoms, stripe, stripe-test', // a test checkout makes a real Shopify order: never ship it
    note: `Stripe checkout ${s.id}`,
    note_attributes: [{ name: 'stripe_session', value: s.id }, ...(pi ? [{ name: 'stripe_payment_intent', value: pi }] : [])],
    send_receipt: false,
    send_fulfillment_receipt: true,
    inventory_behaviour: 'bypass',
  };
}

// A Stripe address as a Shopify one. The last word of the name is the last name.
function addressFor(name: string | null | undefined, a: Stripe.Address | null | undefined, phone: string | null) {
  if (!a?.line1) return null;
  const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
  const last = words.length > 1 ? words.pop()! : '';
  return {
    first_name: words.join(' '), last_name: last,
    address1: a.line1, address2: a.line2 || undefined, city: a.city ?? undefined, province_code: a.state ?? undefined,
    zip: a.postal_code ?? undefined, country_code: (a.country || 'US').toUpperCase(), phone: phone || undefined,
  };
}

// An order this checkout already made: a create that timed out after Shopify saved it, or a row that missed the id.
// Looks through the newest 250 orders since the checkout opened.
async function shopifyOrderFor(sh: Shopify, s: Stripe.Checkout.Session): Promise<Row | null> {
  const since = encodeURIComponent(new Date((s.created - 3600) * 1000).toISOString());
  const r = await sh.call(`orders.json?status=any&limit=250&fields=id,name,note_attributes&created_at_min=${since}`);
  const orders: Row[] = r.orders ?? [];
  return orders.find((o) => (o.note_attributes ?? []).some((a: Row) => a.name === 'stripe_session' && a.value === s.id)) ?? null;
}

async function variantOf(sh: Shopify, productId: string): Promise<number> {
  if (!/^\d+$/.test(productId)) throw new Error(`Shopify product id "${productId}" is not a number`);
  const key = `${sh.store}/${productId}`;
  let id = variantIds.get(key);
  if (!id) {
    id = Number((await sh.call(`products/${productId}.json?fields=id,variants`)).product?.variants?.[0]?.id) || undefined;
    if (!id) throw new Error(`Shopify product ${productId} has no variant`);
    variantIds.set(key, id);
  }
  return id;
}

async function shopifyApi(): Promise<Shopify> {
  const store = (env('SHOPIFY_STORE') || 'j1tu10-he').toLowerCase()
    .replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/\.myshopify\.com$/, ''); // "j1tu10-he", pasted any way
  if (!/^[a-z0-9][a-z0-9-]*$/.test(store)) throw new Error('SHOPIFY_STORE should be the store name, like j1tu10-he');
  const token = await shopifyAccessToken(store);
  const call = async (path: string, post?: unknown): Promise<Row> => {
    const res = await fetch(`https://${store}.myshopify.com/admin/api/${SHOPIFY_API}/${path}`, {
      method: post ? 'POST' : 'GET',
      headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: post ? JSON.stringify(post) : undefined,
      signal: AbortSignal.timeout(SHOPIFY_TIMEOUT_MS),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`Shopify ${post ? 'POST' : 'GET'} ${path.split('?')[0]} answered ${res.status}: ${maskEmails(text)}`);
    return JSON.parse(text);
  };
  return { store, call };
}

// SHOPIFY_ADMIN_TOKEN as given (a custom app made in the Shopify admin before 2026), or a token asked for with the
// Dev Dashboard app's client id and secret (client credentials grant). That token lasts 24 hours: it is kept while
// the function stays warm and asked for again 10 minutes before it runs out.
async function shopifyAccessToken(store: string): Promise<string> {
  const fixed = env('SHOPIFY_ADMIN_TOKEN');
  if (fixed) return fixed;
  const clientId = env('SHOPIFY_CLIENT_ID');
  const key = `${store}/${clientId}`;
  if (shopifyToken?.key === key && shopifyToken.until > Date.now()) return shopifyToken.token;
  const res = await fetch(`https://${store}.myshopify.com/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: env('SHOPIFY_CLIENT_SECRET') }),
    signal: AbortSignal.timeout(SHOPIFY_TIMEOUT_MS),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Shopify token request answered ${res.status}: ${text.split(env('SHOPIFY_CLIENT_SECRET')).join('***')}`);
  const j = JSON.parse(text);
  if (typeof j.access_token !== 'string' || !j.access_token) throw new Error('Shopify token request answered without an access_token');
  shopifyToken = { key, token: j.access_token, until: Date.now() + ((Number(j.expires_in) || 3600) - 600) * 1000 };
  return j.access_token;
}

// Certification ($297): an instructor year. An existing University row keeps its Stripe customer (its subscription
// still sends events); the subscription dates are cleared so an old cancel date cannot end the paid year early.
async function writeCertification(c: Ctx, s: Stripe.Checkout.Session, email: string) {
  const old = await membershipByEmail(c, email);
  let yearEnd = plusOneYear(c.day);
  if (old?.plan === 'instructor' && old.current_period_end && String(old.current_period_end) > yearEnd) yearEnd = String(old.current_period_end);
  const row: Row = {
    email, plan: 'instructor', status: 'active', current_period_end: yearEnd,
    trial_end: null, cancel_at: null, paused_until: null,
    note: addNote(c, old?.note, `certification ${s.id} (${entry(c)})`),
  };
  const cus = idOf(s.customer);
  if (!old) { row.keeps_library = true; row.stripe_customer_id = cus; }
  else if (!old.stripe_customer_id && cus) row.stripe_customer_id = cus;
  await upsertMembership(c, row);
  return `memberships ${mask(email)}: instructor, active to ${yearEnd}`;
}

// University ($67/month). From a checkout the email the parent typed is the account; from a later event the row
// is found by Stripe customer id, then by the customer's email.
async function subscription(c: Ctx, sub: Stripe.Subscription, o: { email?: string; hint?: string | null; deleted?: boolean; paid?: boolean }) {
  if (!isUniversity(sub)) return `ignored: subscription ${sub.id} is not Child Phenom University`;
  const cus = idOf(sub.customer);
  let row: Row | null = null;
  let email: string | null = o.email ?? null;
  if (email) row = await membershipByEmail(c, email);
  else {
    if (cus) row = await membershipByCustomer(c, cus);
    email = row?.email ?? await emailOf(c, [o.hint], sub.customer);
    if (!email) return `skipped: subscription ${sub.id} has no customer email`;
    if (!row) row = await membershipByEmail(c, email);
    // Found by email but tied to a different Stripe customer: an older subscription of the same parent. Their
    // current one drives the row, so this one is only noted.
    if (row?.stripe_customer_id && cus && row.stripe_customer_id !== cus) {
      await upsertMembership(c, { email, note: addNote(c, row.note) });
      return `memberships ${mask(email)}: row belongs to ${row.stripe_customer_id}, not ${cus}; noted only`;
    }
  }
  // A running instructor year wins over the subscription: note it, change nothing else.
  if (row && instructorYear(row, c.today)) {
    const keep = o.email ? cus ?? row.stripe_customer_id : row.stripe_customer_id ?? cus;
    await upsertMembership(c, { email, stripe_customer_id: keep ?? null, note: addNote(c, row.note) });
    return `memberships ${mask(email)}: instructor year to ${row.current_period_end} kept; subscription ${sub.status} noted only`;
  }
  let status: Status = o.deleted ? 'canceled' : statusOf(sub);
  if (o.paid && (status === 'active' || status === 'past_due')) status = 'active'; // a paid invoice; a $0 trial invoice stays trialing
  const end = periodEndOf(sub);
  await upsertMembership(c, {
    email,
    plan: 'university',
    status,
    trial_end: status === 'trialing' ? toDay(sub.trial_end) : null, // the day of the first $67 charge
    current_period_end: toDay(end),
    cancel_at: toDay(sub.cancel_at ?? (sub.cancel_at_period_end ? end : null)),
    paused_until: status === 'paused' ? toDay(sub.pause_collection?.resumes_at) : null,
    stripe_customer_id: cus ?? row?.stripe_customer_id ?? null,
    note: addNote(c, row?.note),
  });
  return `memberships ${mask(email)}: university ${status}`;
}

async function invoicePaid(c: Ctx, inv: Stripe.Invoice) {
  // The event's shape follows the webhook's API version: older ones put the subscription on the invoice, newer
  // ones under parent.subscription_details. Ask Stripe if neither is there.
  // deno-lint-ignore no-explicit-any
  const raw = inv as any;
  let subId = idOf(raw.subscription) ?? idOf(raw.parent?.subscription_details?.subscription);
  if (!subId && inv.id) subId = idOf((await c.stripe.invoices.retrieve(inv.id)).subscription);
  if (!subId) return `ignored: invoice ${inv.id} is not for a subscription`;
  return subscription(c, await getSubscription(c, subId), { paid: true, hint: inv.customer_email });
}

// ───────── Stripe → table values ─────────
function statusOf(sub: Stripe.Subscription): Status {
  // incomplete = the first payment never went through; unpaid = retries ran out. Neither opens anything.
  if (['canceled', 'incomplete_expired', 'incomplete', 'unpaid'].includes(sub.status)) return 'canceled';
  if (sub.pause_collection || sub.status === 'paused') return 'paused';
  if (sub.status === 'trialing' || sub.status === 'past_due') return sub.status;
  return 'active';
}

// Older API versions carry the period end on the subscription, newer ones on each item.
function periodEndOf(sub: Stripe.Subscription): number | null {
  // deno-lint-ignore no-explicit-any
  const raw = sub as any;
  if (raw.current_period_end) return raw.current_period_end;
  // deno-lint-ignore no-explicit-any
  const ends = (sub.items?.data ?? []).map((i: any) => Number(i.current_period_end) || 0);
  return Math.max(0, ...ends) || null;
}

// Which Child Phenoms item a price is: the price id from the secrets, or (while that secret is empty) the
// product name. Stripe's line-item description is the product name.
function kindOf(price: Stripe.Price | null | undefined, description?: string | null): Kind | null {
  const ids: Record<Kind, string> = {
    kit: env('KIT_PRICE_ID'), playbook: env('PLAYBOOK_PRICE_ID'), university: env('UNIVERSITY_PRICE_ID'), cert: env('CERT_PRICE_ID'),
  };
  const hit = (Object.keys(ids) as Kind[]).find((k) => ids[k] && price?.id === ids[k]);
  if (hit) return hit;
  const product = price?.product;
  const name = `${description ?? ''} ${product && typeof product === 'object' && 'name' in product ? product.name : ''}`;
  if (!ids.playbook && /playbook|workbook/i.test(name)) return 'playbook';
  if (!ids.cert && /instructor/i.test(name)) return 'cert';
  if (!ids.university && /university/i.test(name)) return 'university';
  if (!ids.kit && /abacus|\bkit\b|shipping/i.test(name)) return 'kit';
  return null;
}
const isUniversity = (sub: Stripe.Subscription) => (sub.items?.data ?? []).some((i) => kindOf(i.price) === 'university');

function instructorYear(row: Row, today: string) {
  return row.plan === 'instructor' && row.status !== 'canceled' && (!row.current_period_end || String(row.current_period_end) >= today);
}

// ───────── reads and writes ─────────
async function getSubscription(c: Ctx, id: string, fallback?: Stripe.Subscription) {
  try {
    return await c.stripe.subscriptions.retrieve(id, { expand: ['items.data.price.product'] });
  } catch (e) {
    if (fallback && (e as { code?: string }).code === 'resource_missing') return fallback;
    throw e;
  }
}

async function emailOf(c: Ctx, candidates: (string | null | undefined)[], customer: CustomerRef) {
  for (const e of candidates) { const v = cleanEmail(e); if (v) return v; }
  if (customer && typeof customer === 'object') return 'email' in customer ? cleanEmail(customer.email) : null;
  if (!customer) return null;
  const cu = await c.stripe.customers.retrieve(customer);
  return 'email' in cu ? cleanEmail(cu.email) : null; // a deleted customer has no email
}

async function membershipByEmail(c: Ctx, email: string): Promise<Row | null> {
  const { data, error } = await c.sb.from('memberships').select('*').eq('email', email).maybeSingle();
  if (error) throw new Error(`memberships read: ${error.message}`);
  return data;
}

async function membershipByCustomer(c: Ctx, cus: string): Promise<Row | null> {
  const { data, error } = await c.sb.from('memberships').select('*').eq('stripe_customer_id', cus)
    .order('updated_at', { ascending: false }).limit(1);
  if (error) throw new Error(`memberships read: ${error.message}`);
  return data?.[0] ?? null;
}

// Upsert on email: only the columns given change on an existing row.
async function upsertMembership(c: Ctx, row: Row) {
  const { error } = await c.sb.from('memberships').upsert(row, { onConflict: 'email' });
  if (error) throw new Error(`memberships write: ${error.message}`);
}

// ───────── small helpers ─────────
const entry = (c: Ctx) => `${c.day} ${c.event.type} ${c.event.id}`;

// Appends this event to the note once (a repeat of the same event changes nothing), newest kept under 500 characters.
function addNote(c: Ctx, old: unknown, text = entry(c)) {
  const prev = typeof old === 'string' ? old.trim() : '';
  if (prev.includes(c.event.id)) return prev;
  const note = prev ? `${prev} | ${text}` : text;
  return note.length <= NOTE_MAX ? note : '…' + note.slice(note.length - NOTE_MAX + 1);
}

const dayFormat = new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
function toDay(ts: number | null | undefined): string | null {
  if (!ts) return null;
  const p = Object.fromEntries(dayFormat.formatToParts(new Date(ts * 1000)).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}`;
}
function plusOneYear(day: string) {
  const next = `${Number(day.slice(0, 4)) + 1}${day.slice(4)}`;
  return next.endsWith('-02-29') ? next.replace(/-29$/, '-28') : next;
}

const idOf = (x: string | { id: string } | null | undefined): string | null => (typeof x === 'string' ? x : x?.id ?? null);
const cleanEmail = (e: string | null | undefined) => { const v = (e ?? '').trim().toLowerCase(); return v.includes('@') ? v : null; };
const mask = (email: string) => email.replace(/^(.)[^@]*/, '$1***');
const maskEmails = (text: string) => text.replace(/[^\s"'<>,:;()[\]{}]+@[^\s"'<>,:;()[\]{}]+/g, mask);
const short = (e: unknown, max = 200) => String((e as Error)?.message ?? e).replace(/\s+/g, ' ').slice(0, max); // one log line
const reply = (status: number, text: string) => new Response(text, { status, headers: { 'content-type': 'text/plain; charset=utf-8' } });

let stripeClient: { key: string; client: Stripe } | undefined;
function stripeFor(key: string) {
  if (stripeClient?.key !== key) stripeClient = { key, client: new Stripe(key, { httpClient: Stripe.createFetchHttpClient() }) };
  return stripeClient.client;
}
function supabase() {
  return createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false, autoRefreshToken: false } });
}

Deno.serve(serve);

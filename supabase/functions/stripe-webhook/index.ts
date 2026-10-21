// Child Phenoms: Stripe tells this function when someone pays, and it writes the access rows the app reads
// (supabase/memberships.sql and supabase/purchases.sql), so nobody types them by hand.
// What each Stripe event does to a row: docs/APP-DELIVERY.md §3. Setup and test: docs/products/legal-and-ops/stripe-setup.md §8.
//
// Secrets (Supabase → Edge Functions → Secrets): STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET (required);
// KIT_PRICE_ID, PLAYBOOK_PRICE_ID, UNIVERSITY_PRICE_ID, CERT_PRICE_ID (optional: while one is empty, that item is
// recognised by its product name instead). SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected by Supabase.
// Deployed with verify_jwt off because Stripe cannot send a Supabase JWT: the Stripe signature is the lock.
//
// Ground rules: only the signed event and Stripe's own API decide anything (metadata is never read). Every write
// is worked out from the event plus Stripe's current state, and the event id goes into `note`, so the same event
// sent twice leaves the same row. A failed write answers 500 and Stripe retries for up to three days.

import Stripe from 'npm:stripe@^17';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

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
  if (kinds.has('kit') || kinds.has('playbook')) done.push(await writePurchase(c, s, email, kinds.has('kit'), kinds.has('playbook')));
  if (kinds.has('cert')) done.push(await writeCertification(c, s, email));
  return done.length ? done.join('; ') : `ignored: checkout ${s.id} has no Child Phenoms item`;
}

// Kit and Playbook: one purchases row per email. A repeat order never takes the Playbook away.
async function writePurchase(c: Ctx, s: Stripe.Checkout.Session, email: string, kit: boolean, playbook: boolean) {
  const { data: old, error } = await c.sb.from('purchases').select('kit,playbook,note').eq('email', email).maybeSingle();
  if (error) throw new Error(`purchases read: ${error.message}`);
  const row = {
    email,
    kit: kit || !!old?.kit,
    playbook: playbook || !!old?.playbook,
    kit_paid_at: c.day,
    order_ref: s.id,
    note: addNote(c, old?.note),
  };
  const { error: werr } = await c.sb.from('purchases').upsert(row, { onConflict: 'email' });
  if (werr) throw new Error(`purchases write: ${werr.message}`);
  return `purchases ${mask(email)}: kit ${row.kit}, playbook ${row.playbook}`;
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
const short = (e: unknown) => String((e as Error)?.message ?? e).replace(/\s+/g, ' ').slice(0, 200); // one log line
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

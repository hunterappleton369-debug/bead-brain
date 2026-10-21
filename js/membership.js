// membership.js — is this family a Phenom University member, what did they buy, and what may they open?
// Reads one row from the `memberships` table (supabase/memberships.sql) and one from the `purchases` table
// (supabase/purchases.sql: the abacus kit and the $27 Playbook) for the signed-in parent's email, with the
// same client. Hunter writes both rows; the browser can only read them. A missing row means none of it.
// Signed out, or with accounts off, nobody is a member and nothing is bought. On localhost a preview row
// (picked on the account page) stands in for the server, so every state can be checked without a payment,
// and ?demo=member (or kit, playbook) fakes a whole signed-in family while there is no session.
import { auth } from './auth.js';
import { MEMBER_PRICE } from './config.js';

const CACHE = 'cp.membership.v1';      // the last row seen for the signed-in account, so a reload does not flash the lock
const PREVIEW = 'cp.membership.preview';
const COLS = 'email,status,plan,trial_end,current_period_end,cancel_at,paused_until,keeps_library,updated_at';
const PCOLS = 'email,kit,playbook,kit_paid_at,updated_at';
export const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);

// What each member feature needs. "Keepers" cancelled but keep the Prodigy Secrets Program, so they read and
// print the library; fresh practice sheets come with a running membership. To let keepers print fresh
// sheets too, change handouts to: s => s.member || s.keepsLibrary
// The Playbook (digital copy and audiobook): bought as the $27 add-on, or a running University membership.
// Stages 2 to 10 of the trainer (lessons, drills, quests, bosses): a running membership, or an instructor's year
// (also while paused; not once it has ended). Stage 1 is free and never asks. Keepers who cancelled read the
// library pages but do not get the trainer stages. Locking a stage only hides it: saved progress stays as it is.
const ACCESS = {
  library: s => s.member || s.keepsLibrary,
  handouts: s => s.member,
  playbook: s => s.boughtPlaybook || s.member,
  stages: s => s.member || (s.plan === 'instructor' && !['none', 'canceled'].includes(s.status)),
};

const subs = new Set();
const emit = () => { for (const fn of subs) { try { fn(); } catch (e) { console.error(e); } } };

export const membership = {
  row: null,           // the memberships row, or null
  purchases: null,     // the purchases row ({ kit, playbook, kit_paid_at }), or null: nothing bought
  loaded: false,       // we know the answer (possibly from the cache while a fresh read runs)
  loading: false,
  error: null,         // short text when the read failed for a reason other than a missing table
  setupMissing: false, // the memberships table is not on the server yet (supabase/memberships.sql not applied)
  purchasesMissing: false, // the same for the purchases table (supabase/purchases.sql)
  owner: null,         // the account id the rows belong to (null signed out or in a preview)
  preview: false,      // the row is a localhost preview, not the server's
  demo: '',            // localhost only: the ?demo= family shown while nobody is signed in ('' = off)
  on(fn) { subs.add(fn); return () => subs.delete(fn); },
  load, state, can, setPreview, previewRow,
};

// ───────── dates (the table stores plain days: 2026-11-04) ─────────
const parseDay = s => { if (!s) return null; const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return y ? new Date(y, m - 1, d) : null; };
const startOfToday = () => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); };
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const daysBetween = (a, b) => Math.round((b - a) / 86400000);
export const isoDay = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const fromToday = n => isoDay(addDays(startOfToday(), n));

// The membership as the pages need it.
function state() {
  const r = membership.row, pu = membership.purchases;
  const email = (membership.preview ? r?.email || pu?.email : auth.user?.email) || '';
  const base = { email, price: MEMBER_PRICE, preview: membership.preview, demo: membership.demo, plan: r?.plan || 'university',
    kit: !!pu?.kit, boughtPlaybook: !!pu?.playbook, kitPaidAt: parseDay(pu?.kit_paid_at) };
  if (!r) return { ...base, status: 'none', member: false, keepsLibrary: false };
  const today = startOfToday();
  const trialEnd = parseDay(r.trial_end), periodEnd = parseDay(r.current_period_end), cancelAt = parseDay(r.cancel_at), pausedUntil = parseDay(r.paused_until);
  let status = r.status;
  // The table can lag Stripe by a day or two: a cancel date that has passed means it has ended.
  if (cancelAt && cancelAt <= today && ['trialing', 'active', 'past_due'].includes(status)) status = 'canceled';
  const member = ['trialing', 'active', 'past_due'].includes(status);
  const out = { ...base, status, member, keepsLibrary: r.keeps_library !== false, trialEnd, periodEnd, cancelAt, pausedUntil };
  if (status === 'trialing' && trialEnd) {
    // 14 free days end the day before trial_end; the first charge is on trial_end.
    out.trialStart = addDays(trialEnd, -14);
    out.lastFreeDay = addDays(trialEnd, -1);
    out.trialDay = Math.min(14, Math.max(1, daysBetween(out.trialStart, today) + 1));
    out.trialOver = trialEnd <= today; // Stripe moved on and the row was not updated yet
    out.daysLeft = Math.max(0, daysBetween(today, trialEnd));
  }
  return out;
}
function can(feature) { const f = ACCESS[feature]; return !!(f && f(state())); }

// ───────── reading the row ─────────
// The cache holds both rows: { id, row, purchases }. An older cache without purchases reads as "nothing bought".
function readCache(id) { try { const c = JSON.parse(localStorage.getItem(CACHE)); return c && c.id === id ? { row: c.row ?? null, purchases: c.purchases ?? null } : undefined; } catch { return undefined; } }
function writeCache(id, row, purchases) { try { localStorage.setItem(CACHE, JSON.stringify({ id, row, purchases })); } catch {} }
function clearCache() { try { localStorage.removeItem(CACHE); } catch {} }

function set(row, preview = false, purchases = null, demo = '') {
  const owner = preview ? null : auth.user?.id || null;
  const before = JSON.stringify([membership.row, membership.purchases, membership.loaded, membership.preview, membership.demo, membership.owner]);
  Object.assign(membership, { row, purchases, loaded: true, preview, demo, owner });
  if (JSON.stringify([row, purchases, true, preview, demo, owner]) !== before) emit();
}
const missingTable = e => /PGRST205|42P01/.test(e?.code || '') || /does not exist|schema cache/i.test(e?.message || '');

let running = null, again = false;
async function load() {
  if (running) { again = true; return running; }
  running = (async () => {
    const d = demoFamily();
    if (d && !auth.user) { set(d.row, true, d.purchases, DEMO); return; } // localhost ?demo=…, only while signed out
    const p = isLocal ? previewRow() : undefined;
    if (p !== undefined) { set(p, true); return; }
    const u = auth.user;
    if (!u && auth.enabled && !auth.ready) return; // the saved session is not known yet; auth emits 'ready' when it is
    if (!u) { clearCache(); membership.error = null; set(null); return; }
    // A different account than the rows on hand (a fresh sign-in): pages show "checking" until its rows arrive.
    if (membership.owner !== u.id) membership.loaded = false;
    const cached = readCache(u.id);
    if (cached !== undefined) set(cached.row, false, cached.purchases);
    const sb = auth.client();
    if (!sb) { set(cached?.row ?? null, false, cached?.purchases ?? null); return; }
    membership.loading = true;
    try {
      // Both rows for the signed-in email (row-level security returns only theirs), side by side.
      const [m, pr] = await Promise.all([
        sb.from('memberships').select(COLS).maybeSingle(),
        sb.from('purchases').select(PCOLS).maybeSingle(),
      ]);
      let row = cached?.row ?? null, purchases = cached?.purchases ?? null; // a failed read keeps what this device saw last
      if (m.error) {
        membership.setupMissing = missingTable(m.error);
        membership.error = membership.setupMissing ? null : String(m.error.message || m.error);
        console.warn(membership.setupMissing ? 'memberships table not found: apply supabase/memberships.sql' : 'membership check failed', m.error);
      } else { row = m.data || null; membership.setupMissing = false; membership.error = null; }
      if (pr.error) {
        membership.purchasesMissing = missingTable(pr.error);
        if (!membership.purchasesMissing && !membership.error) membership.error = String(pr.error.message || pr.error);
        console.warn(membership.purchasesMissing ? 'purchases table not found: apply supabase/purchases.sql' : 'purchases check failed', pr.error);
      } else { purchases = pr.data || null; membership.purchasesMissing = false; }
      if (!m.error || !pr.error) writeCache(u.id, row, purchases);
      if (auth.user?.id === u.id) set(row, false, purchases);
    } catch (e) {
      membership.error = String(e?.message || e);
      console.warn('membership check failed', e);
      set(cached?.row ?? null, false, cached?.purchases ?? null); // offline: trust the last rows this device saw
    } finally { membership.loading = false; }
  })();
  try { await running; } finally { running = null; if (again) { again = false; load(); } }
}

// ───────── localhost demo: ?demo=member | playbook | kit ─────────
// A whole family without a session, for checking #/playbook and #/account by eye: member = an active University
// membership plus the kit and the Playbook; playbook = the kit and the $27 Playbook, no membership; kit = the free kit only.
// Dead on any other hostname (isLocal), and ignored the moment someone signs in.
const DEMO = isLocal ? new URLSearchParams(location.search).get('demo') || '' : '';
const DEMO_EMAIL = 'demo-parent@example.com';
function demoFamily() {
  if (!isLocal || !DEMO) return null;
  const kit = { email: DEMO_EMAIL, kit: true, playbook: false, kit_paid_at: fromToday(-3) };
  if (DEMO === 'member') return { row: { email: DEMO_EMAIL, status: 'active', plan: 'university', current_period_end: fromToday(20), keeps_library: true }, purchases: { ...kit, playbook: true } };
  if (DEMO === 'playbook') return { row: null, purchases: { ...kit, playbook: true } };
  if (DEMO === 'kit') return { row: null, purchases: kit };
  return null;
}

// ───────── localhost preview ─────────
// undefined = no preview; null = preview "no membership"; an object = preview that row.
function previewRow() {
  if (!isLocal) return undefined;
  try { const v = localStorage.getItem(PREVIEW); return v === null ? undefined : JSON.parse(v); } catch { return undefined; }
}
function setPreview(row) {
  if (!isLocal) return;
  try { if (row === undefined) localStorage.removeItem(PREVIEW); else localStorage.setItem(PREVIEW, JSON.stringify(row)); } catch {}
  if (row === undefined) { membership.preview = false; membership.loaded = false; }
  load();
}

// Ask again whenever the signed-in account changes or becomes known. A localhost preview answers at once.
auth.on(ev => { if (ev === 'auth' || ev === 'ready') load(); });
if (isLocal && (previewRow() !== undefined || demoFamily())) load();

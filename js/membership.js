// membership.js — is this family a Phenom University member, what did they buy, and what may they open?
// Reads one row from the `memberships` table (supabase/memberships.sql), one from the `purchases` table
// (supabase/purchases.sql: the abacus kit and the $27 Playbook) and one from `cert_certificates` (an
// instructor who passed the exam) for the signed-in parent's email, with the same client. The server writes
// all three; the browser can only read them. A missing row means none of it.
// Signed out, or with accounts off, nobody is a member and nothing is bought. On localhost a preview row
// (picked on the account page) stands in for the server, so every state can be checked without a payment,
// and ?demo=member (or kit, playbook, instructor, certified) fakes a whole signed-in family while there is no session.
import { auth } from './auth.js';
import { MEMBER_PRICE } from './config.js';

const CACHE = 'cp.membership.v1';      // the last row seen for the signed-in account, so a reload does not flash the lock
const PREVIEW = 'cp.membership.preview';
const COLS = 'email,status,plan,trial_end,current_period_end,cancel_at,paused_until,keeps_library,updated_at';
const PCOLS = 'email,kit,playbook,kit_paid_at,updated_at';
const CCOLS = 'cert_id,full_name,passed_on,listing_requested_at';
export const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);

// What each member feature needs. "Keepers" cancelled but keep the Prodigy Secrets Program, so they read and
// print the library; fresh practice sheets come with a running membership. To let keepers print fresh
// sheets too, change handouts to: s => s.member || s.keepsLibrary
// The Playbook (digital copy and audiobook): bought as the $27 add-on, or a running University membership.
// Stages 2 to 10 of the trainer (lessons, drills, quests, bosses): a running membership, or an instructor's year
// (also while paused; not once it has ended). Stage 1 is free and never asks. Keepers who cancelled read the
// library pages but do not get the trainer stages. Locking a stage only hides it: saved progress stays as it is.
// The two bonus guides come with the library. The instructor course, the test and the Launch Kit come with the
// instructor year; passing the test (a cert_certificates row) keeps the course, the kit and the certificate for life.
// The instructor year ends on its own (nothing in Stripe fires at the end of a one-time purchase), so the row's
// current_period_end is the gate: past it, the course, kit and exam close until Hunter renews the row.
export const instructor = s => s.plan === 'instructor' && !['none', 'canceled'].includes(s.status)
  && !(s.periodEnd instanceof Date && !isNaN(s.periodEnd) && s.periodEnd.getTime() < Date.now() - 86400000);
const ACCESS = {
  library: s => s.member || s.keepsLibrary,
  handouts: s => s.member,
  playbook: s => s.boughtPlaybook || s.member,
  stages: s => s.member || instructor(s),
  bonus: s => s.member || s.keepsLibrary || instructor(s),
  course: s => instructor(s) || s.certified,
  exam: s => instructor(s),
  certificate: s => s.certified,
  kit: s => instructor(s) || s.certified,
};

const subs = new Set();
const emit = () => { for (const fn of subs) { try { fn(); } catch (e) { console.error(e); } } };

export const membership = {
  row: null,           // the memberships row, or null
  purchases: null,     // the purchases row ({ kit, playbook, kit_paid_at }), or null: nothing bought
  cert: null,          // the cert_certificates row ({ cert_id, full_name, passed_on, listing_requested_at }), or null
  loaded: false,       // we know the answer (possibly from the cache while a fresh read runs)
  loading: false,
  error: null,         // short text when the read failed for a reason other than a missing table
  setupMissing: false, // the memberships table is not on the server yet (supabase/memberships.sql not applied)
  purchasesMissing: false, // the same for the purchases table (supabase/purchases.sql)
  certMissing: false,  // the same for the cert_certificates table
  owner: null,         // the account id the rows belong to (null signed out or in a preview)
  preview: false,      // the row is a localhost preview, not the server's
  demo: '',            // localhost only: the ?demo= family shown while nobody is signed in ('' = off)
  on(fn) { subs.add(fn); return () => subs.delete(fn); },
  load, state, can, setPreview, previewRow, setDemoCertName,
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
  const r = membership.row, pu = membership.purchases, c = membership.cert;
  const email = (membership.preview ? r?.email || pu?.email : auth.user?.email) || '';
  const base = { email, price: MEMBER_PRICE, preview: membership.preview, demo: membership.demo, plan: r?.plan || 'university',
    kit: !!pu?.kit, boughtPlaybook: !!pu?.playbook, kitPaidAt: parseDay(pu?.kit_paid_at),
    certified: !!c, cert: c ? { ...c, passedOn: parseDay(c.passed_on) } : null };
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
// The cache holds the three rows: { id, row, purchases, cert }. An older cache without one reads as "none of it".
function readCache(id) { try { const c = JSON.parse(localStorage.getItem(CACHE)); return c && c.id === id ? { row: c.row ?? null, purchases: c.purchases ?? null, cert: c.cert ?? null } : undefined; } catch { return undefined; } }
function writeCache(id, row, purchases, cert) { try { localStorage.setItem(CACHE, JSON.stringify({ id, row, purchases, cert })); } catch {} }
function clearCache() { try { localStorage.removeItem(CACHE); } catch {} }

function set(row, preview = false, purchases = null, demo = '', cert = null) {
  const owner = preview ? null : auth.user?.id || null;
  const before = JSON.stringify([membership.row, membership.purchases, membership.cert, membership.loaded, membership.preview, membership.demo, membership.owner]);
  Object.assign(membership, { row, purchases, cert, loaded: true, preview, demo, owner });
  if (JSON.stringify([row, purchases, cert, true, preview, demo, owner]) !== before) emit();
}
export const missingTable = e => /PGRST205|42P01/.test(e?.code || '') || /does not exist|schema cache/i.test(e?.message || '');

let running = null, again = false;
async function load() {
  if (running) { again = true; return running; }
  running = (async () => {
    const d = demoFamily();
    if (d && !auth.user) { set(d.row, true, d.purchases, DEMO, demoCert === undefined ? d.cert : demoCert); return; } // localhost ?demo=…, only while signed out
    const p = isLocal ? previewRow() : undefined;
    if (p !== undefined) { set(p, true); return; }
    const u = auth.user;
    if (!u && auth.enabled && !auth.ready) return; // the saved session is not known yet; auth emits 'ready' when it is
    if (!u) { clearCache(); membership.error = null; set(null); return; }
    // A different account than the rows on hand (a fresh sign-in): pages show "checking" until its rows arrive.
    if (membership.owner !== u.id) membership.loaded = false;
    const cached = readCache(u.id);
    if (cached !== undefined) set(cached.row, false, cached.purchases, '', cached.cert);
    const sb = auth.client();
    if (!sb) { set(cached?.row ?? null, false, cached?.purchases ?? null, '', cached?.cert ?? null); return; }
    membership.loading = true;
    try {
      // The three rows for the signed-in email (row-level security returns only theirs), side by side.
      const [m, pr, ce] = await Promise.all([
        sb.from('memberships').select(COLS).maybeSingle(),
        sb.from('purchases').select(PCOLS).maybeSingle(),
        sb.from('cert_certificates').select(CCOLS).maybeSingle(),
      ]);
      let row = cached?.row ?? null, purchases = cached?.purchases ?? null, cert = cached?.cert ?? null; // a failed read keeps what this device saw last
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
      if (ce.error) {
        membership.certMissing = missingTable(ce.error);
        if (!membership.certMissing) console.warn('certificate check failed', ce.error); // the table may not be on the server yet: quietly none
        else cert = null;
      } else { cert = ce.data || null; membership.certMissing = false; }
      if (!m.error || !pr.error || !ce.error) writeCache(u.id, row, purchases, cert);
      if (auth.user?.id === u.id) set(row, false, purchases, '', cert);
    } catch (e) {
      membership.error = String(e?.message || e);
      console.warn('membership check failed', e);
      set(cached?.row ?? null, false, cached?.purchases ?? null, '', cached?.cert ?? null); // offline: trust the last rows this device saw
    } finally { membership.loading = false; }
  })();
  try { await running; } finally { running = null; if (again) { again = false; load(); } }
}

// ───────── localhost demo: ?demo=member | playbook | kit | instructor | certified ─────────
// A whole family without a session, for checking #/playbook and #/account by eye: member = an active University
// membership plus the kit and the Playbook; playbook = the kit and the $27 Playbook, no membership; kit = the free kit only;
// instructor = the instructor year, test not passed yet; certified = the instructor year and a certificate (no name yet).
// Dead on any other hostname (isLocal), and ignored the moment someone signs in.
const DEMO = isLocal ? new URLSearchParams(location.search).get('demo') || '' : '';
const DEMO_EMAIL = 'demo-parent@example.com';
let demoCert; // the demo certificate after "save my name" on #/certificate (undefined = as the demo starts)
function demoFamily() {
  if (!isLocal || !DEMO) return null;
  const kit = { email: DEMO_EMAIL, kit: true, playbook: false, kit_paid_at: fromToday(-3) };
  const year = { email: DEMO_EMAIL, status: 'active', plan: 'instructor', current_period_end: fromToday(300), keeps_library: true };
  if (DEMO === 'member') return { row: { email: DEMO_EMAIL, status: 'active', plan: 'university', current_period_end: fromToday(20), keeps_library: true }, purchases: { ...kit, playbook: true } };
  if (DEMO === 'playbook') return { row: null, purchases: { ...kit, playbook: true } };
  if (DEMO === 'kit') return { row: null, purchases: kit };
  if (DEMO === 'instructor') return { row: year, purchases: null };
  if (DEMO === 'certified') return { row: year, purchases: null, cert: { cert_id: `CPI-${new Date().getFullYear()}-0001`, full_name: null, passed_on: fromToday(-1), listing_requested_at: null } };
  return null;
}
// #/certificate in a demo: the name goes on the sheet without a server (nothing is saved).
function setDemoCertName(name) {
  if (!membership.demo || !membership.cert) return false;
  demoCert = { ...membership.cert, full_name: name };
  load();
  return true;
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

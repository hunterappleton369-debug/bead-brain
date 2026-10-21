// membership.js — is this family a Phenom University member, and what may they open?
// Reads one row from the `memberships` table (supabase/memberships.sql) for the signed-in parent's email.
// Hunter writes that row from the Stripe dashboard; the browser can only read it. Signed out, or with
// accounts off, nobody is a member. On localhost a preview row (picked on the account page) stands in
// for the server, so every state can be checked without a real payment.
import { auth } from './auth.js';
import { MEMBER_PRICE } from './config.js';

const CACHE = 'cp.membership.v1';      // the last row seen for the signed-in account, so a reload does not flash the lock
const PREVIEW = 'cp.membership.preview';
const COLS = 'email,status,plan,trial_end,current_period_end,cancel_at,paused_until,keeps_library,updated_at';
export const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);

// What each member feature needs. "Keepers" cancelled but keep the Prodigy Secrets Program, so they read and
// print the library; fresh practice sheets come with a running membership. To let keepers print fresh
// sheets too, change handouts to: s => s.member || s.keepsLibrary
const ACCESS = {
  library: s => s.member || s.keepsLibrary,
  handouts: s => s.member,
};

const subs = new Set();
const emit = () => { for (const fn of subs) { try { fn(); } catch (e) { console.error(e); } } };

export const membership = {
  row: null,           // the memberships row, or null
  loaded: false,       // we know the answer (possibly from the cache while a fresh read runs)
  loading: false,
  error: null,         // short text when the read failed for a reason other than a missing table
  setupMissing: false, // the memberships table is not on the server yet (supabase/memberships.sql not applied)
  preview: false,      // the row is a localhost preview, not the server's
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
  const r = membership.row;
  const email = (membership.preview ? r?.email : auth.user?.email) || '';
  const base = { email, price: MEMBER_PRICE, preview: membership.preview, plan: r?.plan || 'university' };
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
function readCache(id) { try { const c = JSON.parse(localStorage.getItem(CACHE)); return c && c.id === id ? c.row : undefined; } catch { return undefined; } }
function writeCache(id, row) { try { localStorage.setItem(CACHE, JSON.stringify({ id, row })); } catch {} }
function clearCache() { try { localStorage.removeItem(CACHE); } catch {} }

function set(row, preview = false) {
  const before = JSON.stringify([membership.row, membership.loaded, membership.preview]);
  membership.row = row; membership.loaded = true; membership.preview = preview;
  if (JSON.stringify([row, true, preview]) !== before) emit();
}

let running = null, again = false;
async function load() {
  if (running) { again = true; return running; }
  running = (async () => {
    const p = isLocal ? previewRow() : undefined;
    if (p !== undefined) { set(p, true); return; }
    const u = auth.user;
    if (!u && auth.enabled && !auth.ready) return; // the saved session is not known yet; auth emits 'ready' when it is
    if (!u) { clearCache(); membership.error = null; set(null); return; }
    const cached = readCache(u.id);
    if (cached !== undefined) set(cached);
    const sb = auth.client();
    if (!sb) { set(cached ?? null); return; }
    membership.loading = true;
    try {
      const { data, error } = await sb.from('memberships').select(COLS).maybeSingle();
      if (error) throw error;
      membership.setupMissing = false; membership.error = null;
      writeCache(u.id, data || null);
      if (auth.user?.id === u.id) set(data || null);
    } catch (e) {
      const missing = /PGRST205|42P01/.test(e?.code || '') || /does not exist|schema cache/i.test(e?.message || '');
      membership.setupMissing = missing;
      membership.error = missing ? null : String(e?.message || e);
      console.warn(missing ? 'memberships table not found: apply supabase/memberships.sql' : 'membership check failed', e);
      set(cached ?? null); // offline: trust the last row this device saw
    } finally { membership.loading = false; }
  })();
  try { await running; } finally { running = null; if (again) { again = false; load(); } }
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
if (isLocal && previewRow() !== undefined) load();

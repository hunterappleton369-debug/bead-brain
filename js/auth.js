// auth.js — parent accounts and progress sync (Supabase, loaded from a CDN at runtime).
// Everything here is optional. With no config, or with no network, the store keeps working from
// localStorage and the rest of the app never notices. When a parent is signed in, every profile
// save is mirrored to the server (at most once every 2 s) and the newest copy wins on load.
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';
import { store } from './store.js';

const CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/+esm';
const SYNC_KEY = 'beadbrain.sync.v1'; // per device: which profile ids each account already holds, deletes still to send
const PUSH_DELAY = 2000;

export const auth = {
  enabled: !!(SUPABASE_URL && SUPABASE_KEY),
  ready: false,            // the initial session is known (or the client could not load)
  offline: false,          // the client library did not load: behave as if accounts were off
  user: null,              // { id, email } while signed in
  syncing: false,
  lastSync: null,          // Date of the last successful push or pull
  lastError: null,         // short text for the UI
  linkError: null,         // the error a failed magic link came back with (expired, already used)
  linkCode: null,          // its error_code, e.g. otp_expired (the sign-in page words that one plainly)
  callbackPending: false,  // this page was opened from a magic link; waiting for the session
  on(fn) { subs.add(fn); return () => subs.delete(fn); },
  client: () => sb,        // the supabase client once loaded (null before, or with accounts off); membership.js reads with it
  init, signIn, signOut, redirectURL, flush,
};

const subs = new Set();
const emit = (ev, extra) => { for (const fn of subs) { try { fn(ev, extra); } catch (e) { console.error(e); } } };

let sb = null;             // supabase client
let pulledFor = null;      // user id we already pulled for in this page load
const dirty = new Set();   // profile ids with local changes not yet on the server
let timer = null, inflight = false, again = false, hiding = false;

// A magic link lands on the site with the session in the hash: #access_token=…&refresh_token=…
export function isAuthHash(h) { return /(^|&)(access_token|refresh_token)=/.test(h); }
export function redirectURL() { return location.origin + location.pathname.replace(/index\.html$/, ''); }

// ───────── per-device sync memory ─────────
function meta() { try { return JSON.parse(localStorage.getItem(SYNC_KEY)) || {}; } catch { return {}; } }
function userMeta() { const m = meta(); return m[auth.user?.id] || { known: [], deletes: [] }; }
function saveUserMeta(um) { const m = meta(); m[auth.user.id] = um; try { localStorage.setItem(SYNC_KEY, JSON.stringify(m)); } catch {} }

// ───────── start-up ─────────
async function init() {
  if (!auth.enabled) { auth.ready = true; emit('ready'); return; }
  const hash = location.hash.replace(/^#\/?/, '');
  if (/(^|&)(error|error_code|error_description)=/.test(hash)) {
    // A link that expired or was used already comes back as #error=…&error_description=…
    const q = new URLSearchParams(hash);
    auth.linkError = (q.get('error_description') || q.get('error') || 'That link did not work.').replace(/\+/g, ' ');
    auth.linkCode = q.get('error_code') || null;
    history.replaceState(null, '', location.pathname + location.search + '#/start/signin');
  } else if (isAuthHash(hash)) auth.callbackPending = true;

  let mod;
  try { mod = await import(CDN); }
  catch (e) { console.warn('accounts off: supabase-js did not load', e); auth.offline = true; auth.ready = true; emit('ready'); return; }

  sb = mod.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { flowType: 'implicit', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true },
    global: { fetch: (url, opts) => fetch(url, hiding ? { ...opts, keepalive: true } : opts) },
  });

  sb.auth.onAuthStateChange((event, session) => {
    const u = session?.user ? { id: session.user.id, email: session.user.email } : null;
    const changed = (u?.id || null) !== (auth.user?.id || null);
    auth.user = u; auth.ready = true;
    if (event === 'SIGNED_OUT' || !u) { pulledFor = null; dirty.clear(); emit(changed ? 'auth' : 'ready'); return; }
    if (changed) emit('auth'); else if (event === 'INITIAL_SESSION') emit('ready');
    if (pulledFor !== u.id) {
      pulledFor = u.id;
      // Off the auth callback's tick: supabase-js holds a lock during this callback and data calls would wait on it.
      setTimeout(() => syncAll().finally(() => { if (auth.callbackPending) { auth.callbackPending = false; emit('link'); } }), 0);
    }
  });

  store.onChange(id => {
    if (!auth.user) return; // signed out: the next sign-in pulls and pushes everything
    if (id === '*') for (const p of store.profiles()) dirty.add(p.id); else dirty.add(id);
    schedule();
  });
  store.onRemove(id => {
    if (!auth.user) return;
    const um = userMeta();
    um.known = um.known.filter(x => x !== id);
    if (!um.deletes.includes(id)) um.deletes.push(id);
    saveUserMeta(um);
    dirty.delete(id);
    schedule(0);
  });
  const hide = () => { if (dirty.size || userMeta().deletes.length) { hiding = true; flush().finally(() => { hiding = false; }); } };
  addEventListener('pagehide', hide);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') hide(); });
}

// ───────── sign in / out ─────────
// The link goes out through the send-signin edge function (Resend, from hello@childphenoms.com): Supabase's own mailer
// sends two emails an hour for the whole project and only to the team's addresses. That mailer is the fallback, for
// when the function cannot be reached or fails (it still reaches the team's addresses). Either way the link is
// Supabase's /auth/v1/verify, so the session lands in the hash as before.
const SEND_SIGNIN = `${SUPABASE_URL}/functions/v1/send-signin`;
async function signIn(email) {
  email = String(email || '').trim().toLowerCase(); // the purchases and memberships rows are keyed on the lower-case email
  if (!sb) return { error: auth.offline ? 'You look offline. Progress is still saved on this device.' : auth.enabled ? 'Still connecting. Try again in a moment.' : 'Accounts are not switched on yet.' };
  const sent = await sendSignin(email);
  if (sent) return sent;
  const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectURL(), shouldCreateUser: true } });
  return { error: error ? friendly(error) : null };
}
// { error: null } once the email is out; { error } for a refusal the page shows as it is (429 too many links, 400 not an
// email); null when the fallback should try (offline, a timeout, a 5xx, the function missing).
async function sendSignin(email) {
  let res;
  try {
    res = await fetch(SEND_SIGNIN, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, redirectTo: redirectURL() }), signal: AbortSignal.timeout?.(25000) });
  } catch (e) { console.warn('send-signin unreachable, trying Supabase mail', e); return null; }
  const body = await res.json().catch(() => ({}));
  if (res.ok && body.ok) return { error: null };
  if (res.status === 429) return { error: body.error || friendly({ message: 'too many' }) };
  if (res.status === 400 && body.error) return { error: String(body.error) };
  console.warn(`send-signin answered ${res.status}, trying Supabase mail`);
  return null;
}
function friendly(e) {
  const m = e?.message || '';
  if (/rate limit|security purposes|too many/i.test(m)) return 'We just sent a link. Give it a minute before asking for another.';
  if (/not authorized|not allowed/i.test(m)) return 'We cannot send to that address yet. Progress still saves on this device.';
  if (/invalid.*email|valid email/i.test(m)) return 'That does not look like an email address.';
  if (/failed to fetch|network|load failed/i.test(m)) return 'We could not reach the server. Check the connection and try again.';
  return m || 'That did not work. Progress still saves on this device.';
}
async function signOut() {
  if (!sb) return;
  await flush().catch(() => {});
  await sb.auth.signOut({ scope: 'local' });
  auth.user = null; pulledFor = null; dirty.clear();
  emit('auth');
}

// ───────── sync ─────────
async function syncAll() {
  if (!sb || !auth.user) return;
  auth.syncing = true; emit('sync');
  try {
    const r = await sb.from('parents').upsert({ id: auth.user.id, email: auth.user.email }, { onConflict: 'id' });
    if (r.error) throw r.error;
    const changed = await pull();
    await sendDeletes();
    await push();
    auth.lastSync = new Date(); auth.lastError = null;
    emit('sync', { changed });
  } catch (e) {
    console.warn('sync failed', e);
    auth.lastError = String(e?.message || e);
    emit('sync', { error: true });
  } finally { auth.syncing = false; }
}

// Pull every child on the account. Newest `updated` wins. Returns true when local profiles changed.
async function pull() {
  const { data, error } = await sb.from('children').select('id,name,age,created_at,progress(data,updated_at)');
  if (error) throw error;
  const um = userMeta(); const known = new Set(um.known); const onServer = new Set();
  let changed = false;
  for (const row of data || []) {
    onServer.add(row.id);
    const pr = Array.isArray(row.progress) ? row.progress[0] : row.progress;
    const remote = pr && pr.data && typeof pr.data === 'object' ? pr.data : null;
    const local = store.db.profiles[row.id];
    const rT = Date.parse(pr?.updated_at || row.created_at) || 0;
    const lT = Date.parse(local?.updated || '') || 0;
    known.add(row.id);
    if (!local) { if (remote) { store.putProfile(normalize(remote, row)); changed = true; } }
    else if (remote && rT > lT) { store.putProfile(normalize(remote, row)); changed = true; }
    else if (lT > rT || !remote) dirty.add(row.id);
  }
  // Local profiles the server lacks: new on this device (push) or removed on another device (drop).
  for (const p of store.profiles()) {
    if (onServer.has(p.id)) continue;
    if (known.has(p.id) && !um.deletes.includes(p.id)) { store.dropProfile(p.id); known.delete(p.id); changed = true; }
    else dirty.add(p.id);
  }
  um.known = [...known]; saveUserMeta(um);
  return changed;
}
function normalize(remote, row) {
  return { lessons: {}, bosses: {}, tests: [], bests: {}, log: [], firstSteps: {}, xp: 0, streak: 0, lastDay: null, ...remote, id: row.id, name: remote.name || row.name, age: remote.age || row.age };
}

async function push() {
  if (!sb || !auth.user || !dirty.size) return;
  const ids = [...dirty]; dirty.clear();
  const kids = [], progs = [];
  for (const id of ids) {
    const p = store.db.profiles[id]; if (!p) continue;
    const created = p.created ? new Date(p.created).toISOString() : new Date().toISOString();
    kids.push({ id, parent_id: auth.user.id, name: p.name, age: p.age, created_at: created });
    progs.push({ parent_id: auth.user.id, child_id: id, data: p, updated_at: p.updated || new Date().toISOString() });
  }
  if (!kids.length) return;
  try {
    let r = await sb.from('children').upsert(kids, { onConflict: 'parent_id,id' }); if (r.error) throw r.error;
    r = await sb.from('progress').upsert(progs, { onConflict: 'parent_id,child_id' }); if (r.error) throw r.error;
    const um = userMeta(); const known = new Set(um.known); for (const k of kids) known.add(k.id); um.known = [...known]; saveUserMeta(um);
    auth.lastSync = new Date(); auth.lastError = null;
  } catch (e) { for (const id of ids) dirty.add(id); throw e; }
}

async function sendDeletes() {
  if (!sb || !auth.user) return;
  const um = userMeta();
  for (const id of [...um.deletes]) {
    const { error } = await sb.from('children').delete().eq('id', id);
    if (error) throw error;
    um.deletes = um.deletes.filter(x => x !== id); saveUserMeta(um);
  }
}

function schedule(ms = PUSH_DELAY) { if (timer) return; timer = setTimeout(() => { timer = null; flush(); }, ms); }
// Push now (every save is debounced to this; also called on sign-out and when the tab hides).
async function flush() {
  if (!sb || !auth.user) return;
  if (inflight) { again = true; return; }
  if (timer) { clearTimeout(timer); timer = null; }
  inflight = true; auth.syncing = true; emit('sync');
  try { await sendDeletes(); await push(); auth.lastError = null; emit('sync', {}); }
  catch (e) { console.warn('push failed', e); auth.lastError = String(e?.message || e); emit('sync', { error: true }); schedule(10000); }
  finally { inflight = false; auth.syncing = false; if (again) { again = false; schedule(); } }
}

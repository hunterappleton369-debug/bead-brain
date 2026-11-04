// funnel.js — two-step order form (address, then a preloaded card form), order bump, sticky CTA, upsell routing, Meta Pixel and PostHog. No framework.
import { CONFIG } from './config.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => '$' + n.toFixed(2);
const day = d => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const LEAD_KEY = 'cp.funnel.lead';
const ORDER_KEY = 'cp.funnel.order';
const ATTR_KEY = 'cp.funnel.attr';
const RECEIPT_KEY = 'cp.funnel.receipt';
const load = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
// The order carries the kit intent's id and client secret, so it lives in this tab only (sessionStorage) and
// leaves on the thank-you page. The lead and the ad attribution stay in localStorage.
const sload = k => { try { return JSON.parse(sessionStorage.getItem(k) || 'null'); } catch { return null; } };
const ssave = (k, v) => { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch {} };
const loadOrder = () => sload(ORDER_KEY);
const saveOrder = o => ssave(ORDER_KEY, o);
// an earlier build kept the order in localStorage: move one from the last day into this tab, drop the rest
try { const old = localStorage.getItem(ORDER_KEY); if (old !== null) { localStorage.removeItem(ORDER_KEY); const o = JSON.parse(old); if (!sessionStorage.getItem(ORDER_KEY) && o && Date.now() - Date.parse(o.at) < 864e5) sessionStorage.setItem(ORDER_KEY, old); } } catch {}
const rid = () => { try { return crypto.randomUUID(); } catch { return Date.now().toString(36) + Math.random().toString(36).slice(2, 12); } };
// The privacy policy promises that under Global Privacy Control neither the Meta Pixel nor PostHog loads.
const gpc = () => !!navigator.globalPrivacyControl;
// A redirect back from Stripe carries the intent's client secret in the address. Read the query once, then take the
// secret out of the address bar before the pixel or PostHog load, so neither ever records it.
const RETURN_Q = new URLSearchParams(location.search);
try {
  if (RETURN_Q.has('payment_intent_client_secret')) {
    const u = new URL(location.href);
    ['payment_intent_client_secret', 'payment_intent', 'redirect_status'].forEach(k => u.searchParams.delete(k));
    history.replaceState(null, '', u.pathname + u.search + u.hash);
  }
} catch {}
// A sign-in link that lands on an order page (#access_token=…) goes on to the app. The hash leaves this page's address
// first, so neither the pixel nor PostHog (whose replay keeps the full address) ever sees the session.
try {
  const h = location.hash;
  if (/(^|[#&])(access_token|refresh_token)=/.test(h)) { history.replaceState(null, '', location.pathname + location.search); location.replace('/' + h); }
} catch {}
// One Meta Lead event id per email: the page's pixel and the server's Conversions API copy share it, so Meta
// counts the lead once.
const LEADEV_KEY = 'cp.funnel.leadev';
function leadEventId(email) {
  const k = String(email || '').trim().toLowerCase(); if (!k) return '';
  const m = load(LEADEV_KEY) || {};
  if (!m[k]) { m[k] = 'lead-' + rid().replace(/[^A-Za-z0-9_-]/g, ''); save(LEADEV_KEY, m); }
  return m[k];
}


// ---------- Meta Pixel (loads only when CONFIG.metaPixelId is set) ----------
const PX_KEY = 'cp.px.fired';
export function pixel() {
  if (!CONFIG.metaPixelId || window.fbq || gpc()) return;
  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  const lead = load(LEAD_KEY) || {};
  const am = {}; if (lead.email) am.em = lead.email.trim().toLowerCase(); if (lead.first) am.fn = lead.first.trim().toLowerCase(); if (lead.last) am.ln = lead.last.trim().toLowerCase(); if (lead.phone) { const d = lead.phone.replace(/\D/g, ''); am.ph = d.length === 10 ? '1' + d : d; } // Meta wants the country code
  window.fbq('init', CONFIG.metaPixelId, am);
  window.fbq('track', 'PageView');
}
// eventID (the 4th argument) is what lets the Conversions API drop its copy of the same event later.
export function track(name, params, eventID) {
  if (!window.fbq) return;
  if (eventID) window.fbq('track', name, params || {}, { eventID }); else window.fbq('track', name, params || {});
}
// Count a conversion once per order (or once per lead email): a reload or a second visit to a thank-you page never
// counts twice, and a new order from the same browser still counts.
function once(key, fire) {
  const fired = load(PX_KEY) || {}; if (fired[key]) return;
  fired[key] = new Date().toISOString(); save(PX_KEY, fired); fire();
}
function trackOnce(key, name, params, eventID) {
  if (!window.fbq) return; // no pixel yet: do not record, so the event still fires once the ID is set
  once(key, () => track(name, params, eventID));
}

// ---------- PostHog (loads only when CONFIG.posthogKey is set) ----------
let phOn = false;
// a Stripe redirect's client secret or a sign-in link's tokens can ride in a URL: their values become REDACTED
// in every event property ($current_url, $pathname, $referrer and the initial-visit copies)
const SECRET_Q = /([?&#](?:payment_intent_client_secret|access_token|refresh_token)=)[^&#]*/gi;
const scrub = (v, d = 0) => {
  if (typeof v === 'string') return v.replace(SECRET_Q, '$1REDACTED');
  if (v && typeof v === 'object' && d < 4) Object.keys(v).forEach(k => { v[k] = scrub(v[k], d + 1); });
  return v;
};
function posthog() {
  if (phOn || !CONFIG.posthogKey || gpc()) return;
  try {
    /* eslint-disable */
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    /* eslint-enable */
    window.posthog.init(CONFIG.posthogKey, {
      api_host: CONFIG.posthogHost || 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false, // sent by hand below, at once: a batched one is lost when the in-app browser closes within seconds
      capture_pageleave: true,
      autocapture: true,
      session_recording: { maskAllInputs: true, maskTextSelector: '[data-ph-mask]' },
      before_send: ev => (ev && ev.event !== '$snapshot' ? scrub(ev) : ev),
    });
    phOn = true;
    // A/B copy test (index.html's head script picks the variant and keeps it in localStorage): every event on every
    // funnel page carries ab_variant, so leads, card steps and purchases can be split by variant; ab_source=url marks
    // a variant forced with ?ab= (previews), which the report leaves out
    const ab = abVariant(); if (ab) window.posthog.register(ab);
    window.posthog.capture('$pageview', {}, { send_instantly: true, transport: 'sendBeacon' });
    // events sent before PostHog loaded (markPaid's purchase runs at page start) go out now, after the page view
    phQueue.splice(0).forEach(([n, p]) => { try { window.posthog.capture(n, p, { send_instantly: true, transport: 'sendBeacon' }); } catch {} });
  } catch {}
}
// Meta's link crawler (desktop Chrome in a 1050 by 1893 window, referred by www.facebook.com, two hits a second
// apart from Europe on 2026-10-26) and its named bots are not visitors: no PostHog for them.
const crawler = () => (innerWidth === 1050 && innerHeight === 1893) || /facebookexternalhit|facebookcatalog|meta-externalagent|FacebookBot/i.test(navigator.userAgent);
// A page opened in the background (the in-app browser's preload) is recorded once it is on screen, so a preload that
// is never opened does not count as a visit.
function posthogWhenShown() {
  if (crawler()) return;
  if (document.visibilityState === 'hidden') { addEventListener('visibilitychange', () => { if (document.visibilityState !== 'hidden') posthog(); }, { once: true }); return; }
  posthog();
}
// beforeNav: the page changes right after this, so send the event now instead of with the next batch.
// Before PostHog has loaded (it waits for the load event), an event waits in phQueue; it used to be dropped, which is
// why the upsell page's purchase never reached the dashboard (2026-10-31).
const phQueue = [];
const phWillLoad = () => !!CONFIG.posthogKey && !gpc() && !crawler();
function ph(name, props, beforeNav) {
  if (!phOn || !window.posthog) { if (phWillLoad() && phQueue.length < 40) phQueue.push([name, props || {}]); return; }
  try { window.posthog.capture(name, props || {}, beforeNav ? { send_instantly: true, transport: 'sendBeacon' } : undefined); } catch {}
}
function phOnce(key, name, props) { if (phOn || phWillLoad()) once('ph:' + key, () => ph(name, props)); }
function phIdentify(email) { if (!phOn || !window.posthog || !email) return; try { window.posthog.identify(email, { email, ...(abVariant() || {}) }); } catch {} }
function abVariant() { try { const v = localStorage.getItem('cp_ab'); return v === 'a' || v === 'b' ? { ab_variant: v, ab_source: localStorage.getItem('cp_ab_src') || 'random' } : null; } catch { return null; } }

// ---------- ad attribution: the first touch, sent with the order so Stripe shows which ad sold each kit ----------
const TAGS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];
const META_IDS = ['fbclid', 'fbc', 'fbp']; // Meta's own ids: never sent under Global Privacy Control
const cookie = n => { const m = document.cookie.match(new RegExp('(?:^|; )' + n + '=([^;]*)')); return m ? decodeURIComponent(m[1]) : ''; };
const clip = v => String(v || '').slice(0, 200); // the server keeps 200 characters per key
const tagged = a => !!a && TAGS.some(k => a[k]);
function captureAttribution() {
  const q = new URLSearchParams(location.search), now = {};
  TAGS.forEach(k => { const v = q.get(k); if (v) now[k] = clip(v); });
  const had = load(ATTR_KEY);
  if (had && (tagged(had) || !tagged(now))) return; // keep the first touch; an untagged first visit gives way to the first ad click
  let referrer = ''; // another site's address without its query string
  try { const r = document.referrer ? new URL(document.referrer) : null; if (r && r.origin !== location.origin) referrer = r.origin + r.pathname; } catch {}
  save(ATTR_KEY, { ...now, fbc: clip(cookie('_fbc')), fbp: clip(cookie('_fbp')), referrer: clip(referrer), landing: clip(location.pathname), at: new Date().toISOString() });
}
function attribution() {
  const a = { ...(load(ATTR_KEY) || {}) };
  if (!a.fbc) a.fbc = clip(cookie('_fbc')); // the pixel sets its cookies after the first page view
  if (!a.fbp) a.fbp = clip(cookie('_fbp'));
  const out = {};
  [...TAGS, 'fbc', 'fbp', 'referrer', 'landing'].forEach(k => { if (a[k] && !(gpc() && META_IDS.includes(k))) out[k] = String(a[k]); });
  const ref = refCode(); if (ref) out.ref = ref;
  return out;
}
// ---------- creator partners: the code in childphenoms.com/go/CODE, kept 30 days, apart from the ad attribution ----------
// The latest creator link wins (a parent who taps two creators' links credits the second), and it never displaces the
// ad first-touch above. It rides with the attribution as `ref`, and stripe-webhook credits the partner behind it when
// the kit is paid (docs/PARTNERS.md). Links only: nothing on the form shows it and the parent never types a code (the
// "Creator code" box lived on step 1 for a few hours on 2026-11-04 and was taken out at Hunter's call).
const REF_KEY = 'cp.funnel.ref', REF_DAYS = 30;
const normCode = v => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 24);
function captureRef() {
  const code = normCode(new URLSearchParams(location.search).get('ref'));
  if (code.length >= 3) save(REF_KEY, { code, at: new Date().toISOString() });
}
function refCode() {
  const r = load(REF_KEY);
  if (!r || !r.code || Date.now() - Date.parse(r.at) > REF_DAYS * 864e5) return '';
  return normCode(r.code);
}

// toasts go into one polite live region, made when the page starts, so screen readers announce each one
let toastBox = null;
const toastRegion = () => { if (!toastBox) { toastBox = document.createElement('div'); toastBox.setAttribute('aria-live', 'polite'); toastBox.setAttribute('role', 'status'); document.body.appendChild(toastBox); } return toastBox; };
export function toast(msg, ms = 2600) {
  const t = document.createElement('div'); t.className = 'toast-fn'; t.textContent = msg; toastRegion().appendChild(t);
  setTimeout(() => t.remove(), ms);
}

// ---------- sticky CTA: shows only while no other CTA button is on screen ----------
export function stickyCTA() {
  const bar = $('.sticky-cta'); if (!bar) return;
  // keep the page's last lines clear of the bar, whatever its button text wraps to on this phone
  const pad = () => { const h = bar.offsetHeight; document.body.style.paddingBottom = h ? (h + 8) + 'px' : ''; };
  pad(); addEventListener('resize', pad, { passive: true }); if (document.fonts) document.fonts.ready.then(pad, () => {});
  // every CTA button on the page except the bar's own; the bar shows once none of them is in the viewport
  const ctas = $$('.btn.cta').filter(b => !b.closest('.sticky-cta'));
  const onScreen = new Set();
  const shown = el => { const pane = el.closest('.pane'); return !pane || pane.classList.contains('on'); }; // a button in the order form's hidden step does not count
  const update = () => bar.classList.toggle('show', onScreen.size === 0);
  if (!('IntersectionObserver' in window)) { bar.classList.add('show'); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting && shown(e.target)) onScreen.add(e.target); else onScreen.delete(e.target); });
    update();
  }, { threshold: 0 });
  ctas.forEach(el => io.observe(el));
  // a button inside a hidden pane (step 2 of the order form) leaves the viewport without a scroll: re-check on each change
  const mo = new MutationObserver(() => { ctas.forEach(el => { const r = el.getBoundingClientRect(); const vis = shown(el) && r.width > 0 && r.bottom > 0 && r.top < innerHeight; if (vis) onScreen.add(el); else onScreen.delete(el); }); update(); });
  $$('.order .pane').forEach(p => mo.observe(p, { attributes: true, attributeFilter: ['class'] }));
}

// ---------- smooth scroll for in-page CTAs ----------
export function scrollLinks() {
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const h = a.getAttribute('href'); if (h.length < 2) return;
    const el = $(h); if (!el) return;
    e.preventDefault();
    // CTAs aimed at the order form put the cursor in its first empty field; the logo (#top) does not. The focus runs
    // inside the tap: iOS opens the keyboard only for a focus made during the tap (the old 500 ms timer was ignored,
    // and a parent tapped Next on an empty form, 2026-10-29). The smooth scroll then brings the form up.
    const fields = el.matches('.order') ? $$('.pane.on input:not([type=hidden]):not([type=checkbox]), .pane.on select', el) : [];
    const first = fields.find(f => !f.value) || fields[0];
    if (first) { try { first.focus({ preventScroll: true }); } catch {} }
    // on a phone the field with the cursor is placed under the top bar, clear of the keyboard (keyboardAware below);
    // elsewhere the form's top comes up as before
    if (first && TOUCH) reveal(first, true, $('.tabs', el)); else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (first) ph('cta_to_form', { from: a.closest('.sticky-cta') ? 'sticky' : a.classList.contains('hero-cta') ? 'hero' : 'section', field: first.name || first.id || '' });
  }));
}

// ---------- the keyboard and the form: the field with the cursor stays in view ----------
// A phone keyboard takes the lower half of the screen: an iPhone in the Facebook browser keeps about 360 of its 745 px.
// The CTA tap used to scroll the red form header to the top, so a parent whose name, email and phone the browser had
// filled in got the cursor in Street Address, 420 px down and behind the keyboard (Hunter, 2026-11-03). Now the field
// with the cursor sits just under the page's top bar with the next rows under it, goes back there when the keyboard
// changes the visible area, Return moves to the next field instead of submitting a half-filled form, and the sticky
// bar and toasts keep out of the way while typing. Positions use the visual viewport (the part of the page the
// keyboard leaves), which Safari, the in-app browsers and Chrome all report.
const TOUCH = (window.matchMedia && matchMedia('(pointer: coarse)').matches) || 'ontouchstart' in window;
const vvTop = () => (window.visualViewport ? visualViewport.offsetTop : 0);
const vvHeight = () => (window.visualViewport ? visualViewport.height : innerHeight);
// where a focused field is placed: under the top bar when that is on screen, else at the top of what is visible
const restingTop = () => { const h = $('.fn-top'); const r = h ? h.getBoundingClientRect() : null; const vt = vvTop(); return (r && r.height && r.bottom > vt ? r.bottom : vt) + 12; };
// the bottom of what the parent can see: the keyboard takes about half the screen, counted even before it has opened
const visBottom = () => vvTop() + Math.min(vvHeight(), innerHeight * 0.48);
const setTyping = on => document.body.classList.toggle('cp-typing', !!on);
// Scroll so `el` sits at the resting spot. Without `always`, a field whose bottom is in the upper part of the visible
// area is left alone, so tapping the next row down does not jolt the page. `floor` (the form's step tabs) stays in
// view above `el` when there is room, so the first rows keep their heading.
export function reveal(el, always, floor) {
  if (!el || !TOUCH) return;
  const r = el.getBoundingClientRect(), top = restingTop(), zone = top + (visBottom() - top) * 0.6;
  if (!always && r.top >= top - 8 && r.bottom <= zone) return;
  let y = scrollY + r.top - top;
  if (floor) { const f = floor.getBoundingClientRect(), cap = scrollY + f.top - (top - 6); if (cap < y && r.bottom - (cap - scrollY) <= zone) y = cap; }
  window.scrollTo({ top: Math.max(0, y), behavior: 'auto' });
}
function keyboardAware(form) {
  if (!TOUCH) return;
  let t = 0, since = 0;
  const fieldOf = el => (el && el.matches && form.contains(el) && el.matches('input:not([type=hidden]):not([type=checkbox]), select')) ? el : null;
  const tabs = $('.tabs', form);
  const place = f => { if (document.activeElement === f) reveal(f, false, tabs); };
  form.addEventListener('focusin', e => {
    const f = fieldOf(e.target); if (!f) return;
    clearTimeout(t); setTyping(true); since = Date.now();
    setTimeout(() => place(f), 60); setTimeout(() => place(f), 450); // once now, once after the browser's own keyboard scroll
  });
  form.addEventListener('focusout', () => { clearTimeout(t); t = setTimeout(() => { if (!fieldOf(document.activeElement)) setTyping(false); }, 150); });
  // the keyboard opening (or the browser shrinking for it) changes the visible area within a second of the focus
  if (window.visualViewport) visualViewport.addEventListener('resize', () => { const f = fieldOf(document.activeElement); if (f && Date.now() - since < 1500) reveal(f, false, tabs); });
  // Return (the keyboard's Next) goes to the next field; on the last one (ZIP, "Go") the form submits as before
  form.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || e.isComposing) return; const f = fieldOf(e.target); if (!f || f.tagName === 'SELECT') return;
    const list = $$('.pane.on input:not([type=hidden]):not([type=checkbox])', form), i = list.indexOf(f);
    if (i < 0 || i === list.length - 1) return;
    e.preventDefault(); const next = list[i + 1]; since = Date.now(); try { next.focus({ preventScroll: true }); } catch {} reveal(next, false, tabs);
  });
}

// ---------- on-page checkout: Stripe Elements in step 2, the card saved for one-click upsells ----------
const onPage = () => !!(CONFIG.checkoutApi && CONFIG.stripePublishableKey);
// A call that hangs on a flaky in-app connection would freeze the button it belongs to, so each one gives up: start
// and update after 15 seconds (the hosted checkout then takes over), an upsell after 40 (the server itself stops
// waiting on Stripe at 25, and the page treats a timeout like a dropped answer: wait, ask once more).
const API_MS = { start: 15000, update: 15000, upsell: 40000 };
async function api(payload) {
  let r;
  const ctl = typeof AbortController === 'function' ? new AbortController() : null;
  const t = ctl ? setTimeout(() => ctl.abort(), API_MS[payload.action] || 15000) : 0;
  try { r = await fetch(CONFIG.checkoutApi, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: ctl ? ctl.signal : undefined }); }
  catch (e) { throw Object.assign(new Error('Something went wrong. Try again in a moment.'), { code: e && e.name === 'AbortError' ? 'timeout' : 'network', status: 0 }); }
  finally { clearTimeout(t); }
  let data = {}; try { data = await r.json(); } catch {}
  if (!r.ok || data.error) throw Object.assign(new Error(data.error || 'Something went wrong. Try again in a moment.'), { code: 'http_' + r.status, status: r.status, decline: !!data.decline });
  return data;
}
let stripeJs = null;
function loadStripe() {
  if (stripeJs) return stripeJs;
  stripeJs = new Promise((res, rej) => {
    if (window.Stripe) return res(window.Stripe);
    const fail = () => { stripeJs = null; rej(Object.assign(new Error('Stripe.js did not load'), { code: 'stripe_js' })); };
    const t = document.createElement('script'); t.src = 'https://js.stripe.com/v3/'; t.async = true;
    t.onload = () => (window.Stripe ? res(window.Stripe) : fail()); t.onerror = fail;
    document.head.appendChild(t);
  });
  return stripeJs;
}
// why the card form is off, for analytics: network | stripe_js | http_<status>: <server message> | loaderror: … | timeout
const reasonOf = e => { const c = (e && e.code) || 'error'; return c === 'network' || c === 'stripe_js' || c === 'timeout' || !(e && e.message) ? c : c + ': ' + String(e.message).slice(0, 120); };
const APPEARANCE = { theme: 'stripe', variables: { colorPrimary: '#2457f5', colorText: '#121826', colorDanger: '#f03e3e', borderRadius: '10px', fontFamily: 'Inter, system-ui, sans-serif', fontSizeBase: '16px', spacingUnit: '4px' } };
const FONTS = [{ cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap' }];
const MOUNT_MS = 12000; // no card form 12 seconds after step 2 opens (it is mounted at page load, so this is rare): the hosted checkout takes over
const MOUNT_TRIES = 3;  // mounts of the card form before the hosted checkout takes over (2.5 s, then 5 s between them)

// ---------- the two-step order form ----------
// Step 1 takes the contact details and the shipping address in plain fields (the phone's autofill handles them in one
// tap). Step 2 is the card. The Payment Element is mounted while the page loads, before any intent exists (Stripe's
// deferred-intent mode: amount and currency up front, the intent's client secret only at confirm), so step 2 slides in
// with the card fields already there. The kit intent opens on the email's blur, in the background, as before.
export function orderForm() {
  const form = $('#order'); if (!form) return;
  const pane1 = $('[data-pane="1"]', form), pane2 = $('[data-pane="2"]', form);
  keyboardAware(form);
  const ind = $$('.step-ind > span, .tabs > span', form);
  const bump = $('#bump', form);
  const lead = load(LEAD_KEY) || {};
  // prefill from an earlier visit
  $$('input, select', pane1).forEach(i => { if (lead[i.name]) i.value = lead[i.name]; });
  // Back from a card check that failed or was abandoned (university.html sends ?pay=failed): say so, once
  if (RETURN_Q.get('pay') === 'failed') {
    try { const u = new URL(location.href); u.searchParams.delete('pay'); history.replaceState(null, '', u.pathname + u.search + u.hash); } catch {}
    setTimeout(() => toast('That payment did not go through. Check the card and try again.', 5000), 600);
  }

  const ZIP = /^\d{5}(-\d{4})?$/;
  // what a red field is missing, printed under it (a red outline alone cost one parent three tries and four minutes)
  const ERR = { first: 'Enter your first name', last: 'Enter your last name', email: 'Enter a valid email address (name@example.com)', phone: 'Enter a 10-digit phone number', address: 'Enter your street address', city: 'Enter your city', state: 'Pick your state', zip: 'Enter your 5-digit ZIP code' };
  const valid = pane => {
    let ok = true;
    $$('input[required], select[required]', pane).forEach(i => {
      const fld = i.closest('.fld'); const v = i.value.trim();
      const bad = !v || (i.type === 'email' && !EMAIL.test(v)) || (i.name === 'phone' && v.replace(/\D/g, '').length < 10) || (i.name === 'zip' && !ZIP.test(v));
      fld.classList.toggle('bad', bad); if (bad) { fld.dataset.err = ERR[i.name] || 'Required'; if (ok) i.focus({ preventScroll: false }); ok = false; }
    });
    return ok;
  };
  $$('input, select', pane1).forEach(i => { const clear = () => { const f = i.closest('.fld'); if (f && f.classList.contains('bad') && i.value.trim()) f.classList.remove('bad'); }; i.addEventListener('input', clear); i.addEventListener('change', clear); });
  const withBump = () => !!(bump && bump.checked);
  const total = () => CONFIG.shipping + (withBump() ? CONFIG.bumpPrice : 0);
  const cents = n => Math.round(n * 100);
  const totals = () => {
    const b = withBump();
    $$('[data-bump-row]', form).forEach(r => r.classList.toggle('hide', !b));
    $$('[data-total]', form).forEach(t => t.textContent = money(total()));
    $$('[data-ship]', form).forEach(t => t.textContent = money(CONFIG.shipping));
    $$('[data-bump-price]').forEach(t => t.textContent = '$' + CONFIG.bumpPrice);
  };
  totals();

  // ----- the card form on the page -----
  const payBlock = $('[data-pay-block]', form), payErr = $('[data-pay-error]', form), payLoading = $('[data-pay-loading]', form);
  const complete = $('[data-complete]', form);
  let co = null;          // { stripe, elements, pay } once the Payment Element is on the page
  let intent = null;      // { intentId, clientSecret, amount, bump, email } the kit intent the server opened for this email
  let pre = null;         // { email, p, sent } a start call on its way
  let hosted = !onPage(); // true = the Complete button sends the parent to the hosted checkout links
  let seq = 0, mounting = null, timer = 0, syncing = null, mountTries = 0, retryTimer = 0;
  let linkOff = false;    // true after a Link log-in was left half done at Complete: the card form comes back without Link
  const showErr = msg => { if (!payErr) return; payErr.textContent = msg || ''; payErr.hidden = !msg; };
  const setState = (mode, reason) => { window.cpCheckoutState = { mode, reason: reason || '' }; };
  const setBusy = on => { complete.classList.toggle('busy', on); if (on) complete.setAttribute('aria-disabled', 'true'); else complete.removeAttribute('aria-disabled'); };
  const fullName = d => [d.first, d.last].filter(Boolean).join(' ');
  const p1 = () => { const d = {}; $$('input, select', pane1).forEach(i => d[i.name] = i.value.trim()); return d; };
  const billing = d => ({ name: fullName(d) || undefined, email: d.email || undefined, phone: d.phone || undefined,
    address: { line1: d.address || undefined, line2: d.address2 || undefined, city: d.city || undefined, state: d.state || undefined, postal_code: d.zip || undefined, country: 'US' } });
  // the shipping address as typed on step 1, attached to the intent at confirm (the webhook and Shopify read it there)
  const shippingOf = d => ({ name: fullName(d), phone: d.phone || undefined, address: { line1: d.address, line2: d.address2 || undefined, city: d.city, state: d.state, postal_code: d.zip, country: 'US' } });
  // In hosted mode the button opens Stripe's page, where the card is typed: its label says so
  const LABEL_HOSTED = 'CONTINUE TO SECURE CHECKOUT →';
  if (!complete.dataset.label) complete.dataset.label = complete.firstChild.textContent;
  const setLabel = hostedMode => { complete.firstChild.textContent = hostedMode ? LABEL_HOSTED : complete.dataset.label; };
  // An error the parent can see: the line under the card fields, a toast by the thumb, and the page scrolls up to the
  // fields (a phone shows the button about a screen below them, so a message left there was never seen).
  const failed = (msg, toFields) => {
    showErr(msg); toast(msg, 4200);
    ph('checkout_failed', { message: String(msg || '').slice(0, 90), fields: !!toFields });
    const target = toFields ? payBlock : payErr;
    if (target) setTimeout(() => window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - (toFields ? 84 : innerHeight / 2), behavior: 'smooth' }), 50);
    // a card the bank refused (wrong number, expiry, code): the cursor goes back into the card fields, so the next
    // thing typed fixes it (one parent tapped the page's other buttons for a minute after this message, 2026-11-03)
    if (co && !toFields && /card|expir|security code|cvc|cvv/i.test(String(msg || ''))) setTimeout(() => { try { co.pay.focus(); } catch {} }, 400);
  };
  // After a confirm that ended in an error: whether Stripe shows the kit as paid anyway (the answer was lost on the way
  // back, which a dropped in-app connection does). Never a guess: a lookup that fails answers null.
  const paidAfterAll = async () => {
    if (!co || !intent) return null;
    try { const r = await co.stripe.retrievePaymentIntent(intent.clientSecret); const pi = r && r.paymentIntent; return pi && (pi.status === 'succeeded' || pi.status === 'processing') ? pi : null; }
    catch { return null; }
  };
  // The card form could not start or is too slow: a calm line in its place, and the bump, the summary and the
  // button stay. Complete then opens the hosted Payment Link.
  const useHosted = reason => {
    hosted = true; mounting = null; seq++; clearTimeout(timer); clearTimeout(retryTimer); // a mount still on its way is dropped: the next Next starts fresh
    if (co) { try { co.pay.destroy(); } catch {} co = null; }
    if (payBlock) payBlock.classList.add('hosted');
    setLabel(true);
    if (payLoading) payLoading.classList.add('hide');
    pane2.classList.remove('loading'); showErr('');
    setState('hosted', reason); ph('checkout_hosted_fallback', { reason });
    console.warn('on-page checkout off:', reason);
  };
  if (hosted) { if (payBlock) payBlock.classList.add('hosted'); setLabel(true); setState('hosted', 'not_configured'); }
  else pane2.classList.add('loading'); // the skeleton, until the Payment Element says it is ready

  // The Payment Element, mounted once, before step 2 opens (page 2 of the form is in the layout, only hidden). Its
  // amount follows the bump box; the intent's client secret is handed over at confirm.
  function mountPay() {
    if (!onPage() || co || mounting) return mounting || Promise.resolve();
    const my = ++seq; mountTries++; clearTimeout(retryTimer);
    mounting = (async () => {
      const S = await loadStripe();
      if (my !== seq) return;
      const stripe = S(CONFIG.stripePublishableKey);
      const elements = stripe.elements({ mode: 'payment', amount: cents(total()), currency: 'usd', setupFutureUsage: 'off_session', paymentMethodTypes: ['card', 'link'], appearance: APPEARANCE, fonts: FONTS, loader: 'auto' });
      const d = p1();
      // The card fields, and Link (2026-11-03). Before this the element ran 900 to 1,100 px tall on a phone: a lone
      // "Card" radio row, Link's expanded save-my-info Email and Mobile fields, Country and ZIP the parent had just
      // typed on step 1, and Stripe's "charge your card for future payments" sentence. Eight lost leads in a row met
      // that wall with no total and no button on their screen. Link stays: 3 of the first 5 kit buyers paid with it.
      // Its sign-up fields come prefilled from step 1 (defaultValues), and they stay collapsed once "accelerated
      // sign-up" is off in the Stripe Dashboard (Settings → Payment methods → Link). The address goes with the confirm instead of being typed again, and
      // the saved-card sentence is ours, under the fields (.pay-note). A Link log-in left half done at Complete
      // ("No account connected", 2026-11-03) remounts the element without Link: see cardOnly below.
      const pay = elements.create('payment', {
        // accordion, no radios: the card fields open on top; Link's "Bank" row (Instant Bank Payments, which Stripe adds
        // to Link on its own) sits collapsed under them instead of as a second tab. The server's intents take card and
        // link, so a bank picked there pays (2026-11-03).
        layout: { type: 'accordion', defaultCollapsed: false, radios: 'never', spacedAccordionItems: false },
        business: { name: 'Child Phenoms' },
        fields: { billingDetails: { name: 'never', email: 'never', phone: 'never', address: 'never' } },
        defaultValues: { billingDetails: { name: fullName(d), email: d.email || '', phone: d.phone || '' } },
        wallets: { applePay: 'auto', googlePay: 'auto', link: linkOff ? 'never' : 'auto' },
        terms: { card: 'never', applePay: 'never', googlePay: 'never' },
      });
      const el = $('#pay-el', form); if (el) el.innerHTML = '';
      // once per page view: the parent put the cursor in the card fields, then finished them
      let cardStarted = false, cardDone = false;
      // the card fields with the cursor go under the top bar, clear of the keyboard, like the step-1 fields
      pay.on('focus', () => { if (!cardStarted) { cardStarted = true; ph('card_started'); } setTyping(true); reveal(payBlock || $('#pay-el'), true); });
      pay.on('blur', () => setTyping(false));
      pay.on('change', e => {
        if (e && e.complete && !cardDone) { cardDone = true; ph('card_complete', { type: (e.value && e.value.type) || '' }); }
        if (payErr && !payErr.hidden && e && !e.empty) showErr(''); // the parent is fixing the card: the old message goes
      });
      await new Promise((res, rej) => {
        pay.on('ready', res);
        pay.on('loaderror', e => rej(Object.assign(new Error(''), { code: 'loaderror: ' + String((e && e.error && e.error.message) || '').slice(0, 120) })));
        pay.mount('#pay-el');
      });
      if (my !== seq) { try { pay.destroy(); } catch {} return; }
      co = { stripe, elements, pay };
      hosted = false; mounting = null; clearTimeout(timer);
      if (payBlock) payBlock.classList.remove('hosted');
      setLabel(false);
      if (payLoading) payLoading.classList.add('hide'); pane2.classList.remove('loading');
      setState('onpage', ''); ph('checkout_mounted', { attempt: mountTries, apple_pay: applePayHere(), link: !linkOff });
    })().catch(e => {
      if (my !== seq) return;
      mounting = null;
      // Stripe.js or the element did not come up (the Facebook browser drops a connection now and then: one parent's
      // card form failed at load on 2026-11-03 and she reloaded the page herself). Up to MOUNT_TRIES mounts, a few
      // seconds apart, before the hosted checkout takes over; Next starts the count again.
      if (mountTries < MOUNT_TRIES) { ph('checkout_mount_retry', { attempt: mountTries, reason: reasonOf(e) }); retryTimer = setTimeout(() => { if (!co && !mounting && my === seq) mountPay(); }, 2500 * mountTries); }
      else useHosted(reasonOf(e));
    });
    return mounting;
  }
  // Apple Pay can only show where the browser offers it (Safari and WebKit views with a card in Wallet)
  function applePayHere() { try { return !!(window.ApplePaySession && window.ApplePaySession.canMakePayments()); } catch { return false; } }
  // Link recognized the email and opened its log-in, the parent skipped the code and tapped Complete: Stripe answers
  // "No account connected" and nothing can be charged. The card form comes back without Link, so the card can be typed.
  async function cardOnly() {
    linkOff = true; ph('checkout_link_off');
    const old = co; co = null; seq++; mountTries = 0; clearTimeout(retryTimer);
    if (old) { try { old.pay.destroy(); } catch {} }
    pane2.classList.add('loading'); if (payLoading) payLoading.classList.remove('hide');
    await mountPay();
    if (co) { try { co.pay.update({ defaultValues: { billingDetails: { name: fullName(p1()), email: p1().email, phone: p1().phone || '' } } }); } catch {} }
  }
  // Mount once the page's own images and fonts are in, or as soon as the parent touches the form, whichever comes
  // first, so Stripe.js (250 KB) never competes with the hero image for a slow connection's first seconds.
  if (onPage()) {
    let warmed = false; const warm = () => { if (warmed) return; warmed = true; mountPay(); };
    if (document.readyState === 'complete') warm(); else addEventListener('load', warm, { once: true });
    pane1.addEventListener('focusin', warm, { once: true });
    setTimeout(warm, 4000); // a load event held up by a slow third-party script still warms up in time
  }

  // ----- the kit intent (the server's start), opened in the background while the parent types -----
  const startCall = d => {
    const b = withBump();
    // the server saves the lead first, so even a page whose Stripe.js never loads keeps the parent's contact details
    return api({ action: 'start', email: d.email, first: d.first, last: d.last, phone: d.phone, bump: b, attribution: attribution(), lead_event_id: gpc() ? undefined : leadEventId(d.email), gpc: gpc() })
      .then(st => ({ ...st, bump: b, email: d.email, sent: d })); // sent: the fields this start carried
  };
  function prefetch(d) {
    if (!onPage() || !d.email || !EMAIL.test(d.email)) return;
    if ((pre && pre.email === d.email) || (intent && intent.email === d.email)) return;
    const p = startCall(d);
    pre = { email: d.email, p, sent: d };
    p.then(st => { if (pre && pre.p === p) { pre = null; intent = st; if (st.bump !== withBump()) syncBump(); } }, () => { if (pre && pre.p === p) pre = null; });
  }
  // The start usually goes out on the email's blur, before the first name or the phone is typed (one order reached
  // Stripe as first '' / last 'Hernandez', and its welcome email opened "Hi Hernandez"). Once Next has the fields as
  // finally typed, the server gets them for the lead row, the Customer and the intent. Sent once per intent and set
  // of values, in the background; nothing waits for it and a failure changes nothing on the page.
  let contactSent = '';
  const syncContact = (st, d) => {
    if (!st || !st.intentId || !st.clientSecret) return;
    const key = [st.intentId, d.first, d.last, d.phone].join('|');
    if (contactSent === key) return;
    contactSent = key;
    const s0 = st.sent || null;
    if (s0 && s0.first === d.first && s0.last === d.last && s0.phone === d.phone) return; // the start already carried these
    api({ action: 'update', intentId: st.intentId, clientSecret: st.clientSecret, first: d.first, last: d.last, phone: d.phone }).catch(() => { if (contactSent === key) contactSent = ''; });
  };
  let step2Marked = '';
  const markStep2 = st => {
    if (!st || !st.intentId || !st.clientSecret || step2Marked === st.intentId) return;
    step2Marked = st.intentId;
    api({ action: 'update', intentId: st.intentId, clientSecret: st.clientSecret, step2: true }).catch(() => { if (step2Marked === st.intentId) step2Marked = ''; });
  };
  // the kit intent for this email: the one already open, the start on its way, or a new start
  async function ensureIntent(d) {
    if (!(intent && intent.email === d.email)) {
      if (!(pre && pre.email === d.email)) { pre = null; prefetch(d); }
      if (!pre) throw Object.assign(new Error('That does not look like an email address.'), { code: 'email' });
      const p = pre.p, st = await p;
      if (!(intent && intent.intentId === st.intentId)) { intent = st; if (pre && pre.p === p) pre = null; }
    }
    syncContact(intent, d);
    return intent;
  }
  // The bump changed: move the intent to the new total. Complete stays busy until Stripe has it, and the loop
  // re-reads the box after each answer, so quick taps end on the box's last state.
  function syncBump() {
    if (!intent || hosted) return Promise.resolve();
    if (syncing) return syncing;
    setBusy(true);
    syncing = (async () => {
      try {
        let it, want;
        do {
          it = intent; want = withBump();
          if (it.bump === want) break;
          const u = await api({ action: 'update', intentId: it.intentId, clientSecret: it.clientSecret, bump: want });
          it.amount = u.amount; it.bump = want;
        } while (it === intent && !hosted && want !== withBump());
        showErr('');
      } catch (e) {
        // the total on the page must be the total Stripe will charge: the box goes back to what Stripe has
        if (bump && intent) { bump.checked = !!intent.bump; totals(); if (co) { try { co.elements.update({ amount: cents(total()) }); } catch {} } }
        failed(e.message, false);
      }
      finally { syncing = null; setBusy(false); }
    })();
    return syncing;
  }

  // Start the payment while the parent is still on step 1, so the charge is ready when Complete is tapped.
  const emailEl = $('#email', pane1), phoneEl = $('#phone', pane1);
  // The start goes out on the email's blur or once the phone has 10 digits (the in-app browsers' autofill fills every
  // field at once, and some parents type the phone first).
  const phoneReady = () => !!phoneEl && phoneEl.value.replace(/\D/g, '').length >= 10;
  emailEl && emailEl.addEventListener('blur', () => prefetch(p1()));
  phoneEl && phoneEl.addEventListener('input', () => { if (phoneReady()) prefetch(p1()); });
  // the step-1 fields are a form, so the keyboard's Go key is the same as the button
  const step1 = form.querySelector('form[data-step1]');
  step1 && step1.addEventListener('submit', e => { e.preventDefault(); $('[data-next]', form).click(); });

  bump && bump.addEventListener('change', () => {
    totals();
    if (co) { try { co.elements.update({ amount: cents(total()) }); } catch {} }
    if (bump.checked) track('AddToCart', { content_name: 'playbook', value: CONFIG.bumpPrice, currency: 'USD' });
    ph('bump_toggled', { state: bump.checked ? 'on' : 'off' });
    if (intent && !hosted) syncBump();
  });

  // the pane that opens slides in; the other leaves the flow but stays in the layout (hidden)
  const go = (to, back) => {
    const from = to === pane2 ? pane1 : pane2;
    from.classList.remove('on', 'slide', 'rev');
    to.classList.remove('slide', 'rev'); void to.offsetWidth; // restart the animation
    to.classList.add('on', 'slide'); if (back) to.classList.add('rev');
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  $('[data-next]', form).addEventListener('click', e => {
    e.preventDefault();
    if (!valid(pane1)) {
      toast('Check the highlighted fields');
      ph('step1_invalid', { fields: $$('.fld.bad input, .fld.bad select', pane1).map(f => f.name || f.id).join(',') });
      return;
    }
    const data = p1();
    data.at = new Date().toISOString(); save(LEAD_KEY, data);
    const email = data.email.toLowerCase();
    trackOnce('lead:' + email, 'Lead', { content_name: 'free-abacus-kit' }, leadEventId(email)); // once per lead email, same id as the server's copy
    phIdentify(email); ph('funnel_lead', { has_phone: !!data.phone });
    if (CONFIG.leadWebhook) fetch(CONFIG.leadWebhook, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'lead', ...data }) }).catch(() => {});
    ind[0].classList.replace('on', 'done'); ind[1].classList.add('on');
    const ttl = $('[data-pane="2"] h3', form); if (ttl) ttl.textContent = 'Almost done, ' + (data.first || 'friend') + '.';
    // Step 2 is the whole page: the landing page's sections and its sticky bar go away until the parent taps Back
    // (2026-11-03: parents flung past the form, stared at a card form with no total or button on screen, or tapped
    // the sticky "YES" bar as if it were the Complete button; now there is nothing to scroll off to)
    document.body.classList.add('cp-step2');
    go(pane2);
    // the card step opened: card_ready says whether the card form was already on screen (it preloads at page start)
    ph('checkout_step2_shown', { card_ready: !!co, hosted: !!hosted });
    if (!onPage()) return;
    if (co) { try { co.pay.update({ defaultValues: { billingDetails: { name: fullName(data), email: data.email, phone: data.phone || '' } } }); } catch {} }
    // the intent opens (or is already open) in the background; a start that fails sends Complete to the hosted link.
    // Once it is open, the server stamps the lead row as a step-2 lead (the start alone goes out on the email's blur,
    // and a parent who never tapped Next was counted and emailed as a lead on 2026-11-03).
    ensureIntent(data).then(st => markStep2(st)).catch(e => { if (!hosted) useHosted(reasonOf(e)); });
    // every Next tries the card form again, so one failed mount does not leave the parent on the hosted link
    if (!co) {
      hosted = false; if (payBlock) payBlock.classList.remove('hosted'); setLabel(false);
      pane2.classList.add('loading'); if (payLoading) payLoading.classList.remove('hide');
      clearTimeout(timer); timer = setTimeout(() => { if (!co) useHosted('timeout'); }, MOUNT_MS);
      mountTries = 0; mountPay();
    }
  });
  $('[data-back]', form) && $('[data-back]', form).addEventListener('click', e => { e.preventDefault(); ind[1].classList.remove('on'); ind[0].classList.replace('done', 'on'); document.body.classList.remove('cp-step2'); go(pane1, true); });

  complete.addEventListener('click', async e => {
    e.preventDefault();
    if (complete.classList.contains('busy')) return; // the bump total or the payment is still on its way
    const data = p1();
    const wb = withBump();
    const payHere = !hosted && !!co;
    const order = { ...(load(LEAD_KEY) || {}), ...data, bump: wb, total: total(), at: new Date().toISOString(), mode: payHere ? 'onpage' : 'hosted', eventId: rid() };
    saveOrder(order);
    track('InitiateCheckout', { content_name: wb ? 'kit+playbook' : 'kit', value: order.total, currency: 'USD', num_items: wb ? 2 : 1 }, payHere && intent ? intent.intentId : order.eventId);
    ph('checkout_submitted', { total: order.total, bump: wb }, !payHere);

    if (payHere) {
      // pay here: the card form on the page; the saved card makes the next two pages one click
      showErr(''); setBusy(true); if (bump) bump.disabled = true;
      const label = complete.firstChild.textContent; complete.firstChild.textContent = 'Processing your order… ';
      const undo = () => { setBusy(false); if (bump) bump.disabled = false; complete.firstChild.textContent = label; };
      const finish = pi => { saveOrder({ ...order, intentId: intent.intentId, clientSecret: intent.clientSecret, kit: true, paid: true, paidAt: new Date().toISOString(), status: pi && pi.status }); location.href = 'university.html?paid=kit'; };
      try {
        // the card fields first (Stripe checks them before anything is charged), then the intent, then the charge
        const sub = await co.elements.submit();
        if (sub && sub.error) {
          if (!linkOff && /account connected|link/i.test(sub.error.message || '')) { await cardOnly(); failed('The Link log-in did not finish. Type your card below instead.', true); undo(); return; }
          failed(sub.error.message || 'Please fill in the highlighted fields above.', true); undo(); return;
        }
        await ensureIntent(data);
        // never charge a total the parent did not see: a bump update that failed gets one more try first
        if (intent.bump !== wb) { await syncBump(); setBusy(true); if (!intent || intent.bump !== wb) { undo(); return; } }
        const { error, paymentIntent } = await co.stripe.confirmPayment({
          elements: co.elements, clientSecret: intent.clientSecret, redirect: 'if_required',
          confirmParams: { return_url: new URL('university.html?paid=kit', location.href).toString(), shipping: shippingOf(data), payment_method_data: { billing_details: billing(data) } },
        });
        if (error) {
          // The answer was lost but the charge went through (a dropped in-app connection; a second tap then says
          // the intent is in an unexpected state): the order is paid, go on. Field and card errors skip the lookup.
          const known = error.payment_intent && (error.payment_intent.status === 'succeeded' || error.payment_intent.status === 'processing') ? error.payment_intent : null;
          const done = known || (error.type === 'validation_error' || error.type === 'card_error' ? null : await paidAfterAll());
          if (done) { finish(done); return; }
          failed(error.type === 'validation_error' ? 'Please fill in the highlighted fields above.' : (error.message || 'The card did not go through. Check the details and try again.'), error.type === 'validation_error');
          undo(); return;
        }
        finish(paymentIntent);
      } catch (err) {
        const done = await paidAfterAll();
        if (done) { finish(done); return; }
        failed(err.message || 'Something went wrong. Try again.', false); undo();
      }
      return;
    }

    const url = wb ? CONFIG.checkoutUrlWithBump : CONFIG.checkoutUrl; // hosted fallback; both links must be set
    if (url) {
      const u = new URL(url);
      if (/\/cart\//.test(u.pathname)) {
        // Shopify cart permalink: prefill what step 1 collected; Shopify asks for the address and card
        if (order.email) u.searchParams.set('checkout[email]', order.email);
        if (order.first) u.searchParams.set('checkout[shipping_address][first_name]', order.first);
        if (order.last) u.searchParams.set('checkout[shipping_address][last_name]', order.last);
        if (order.phone) u.searchParams.set('checkout[shipping_address][phone]', order.phone);
      } else if (order.email) u.searchParams.set('prefilled_email', order.email);
      location.href = u.toString();
    } else {
      // preview mode: no processor wired, walk the funnel
      toast('Preview: no payment connected yet');
      setTimeout(() => location.href = 'university.html', 900);
    }
  });
}

// ---------- upsell pages: one click on the saved card, hosted link as the fallback ----------
export function upsell(kind) {
  const url = kind === 'university' ? CONFIG.universityTrialUrl : CONFIG.certifyUrl;
  const next = kind === 'university' ? 'certify.html' : 'thanks.html';
  // A card that needed the bank's check and came back failed or abandoned: nothing was paid, so the parent goes back
  // to the order form instead of reading an offer whose one-click cannot work.
  const rs = RETURN_Q.get('redirect_status');
  if (kind === 'university' && rs && rs !== 'succeeded') { location.replace(new URL('./?pay=failed#order', location.href).toString()); return; }
  markPaid(); // the step before this page, when it came back paid
  const yesAll = $$('[data-yes]'); let yesBusy = false; // one tap at a time across every yes button on the page
  $$('[data-trial-date]').forEach(el => el.textContent = day(new Date(Date.now() + 14 * 864e5)));
  const o0 = loadOrder() || {};
  const oneClick = onPage() && !!(o0.intentId && o0.clientSecret);
  // the one-click line sits under the page's yes buttons, never inside the sticky bar
  if (oneClick) $$('[data-yes]').filter(b => !b.closest('.sticky-cta')).forEach(b => {
    const n = document.createElement('p'); n.className = 'oneclick-note';
    n.textContent = kind === 'university' ? 'One click. Your free 14 days start now on the card from your kit order. Cancel from your account page.' : 'One click. $297 goes on the card from your kit order.';
    b.insertAdjacentElement('afterend', n);
  });
  $$('[data-yes]').forEach(b => b.addEventListener('click', async e => {
    e.preventDefault();
    if (yesBusy) return;
    yesBusy = true;
    const o = loadOrder() || {}; o[kind] = (url || oneClick) ? 'pending' : true; saveOrder(o);
    const base = o.intentId || o.eventId;
    track('InitiateCheckout', { content_name: kind === 'university' ? 'university-trial' : 'certification', value: kind === 'university' ? 0 : 297, currency: 'USD' }, base ? base + '-' + kind : undefined);
    ph('upsell_yes', { kind }, true);
    if (oneClick) {
      const label = b.firstChild.textContent; yesAll.forEach(x => x.classList.add('busy')); b.firstChild.textContent = kind === 'university' ? 'Starting your test drive… ' : 'Adding it to your order… ';
      try {
        await api({ action: 'upsell', kind, intentId: o.intentId, clientSecret: o.clientSecret });
        location.href = next + '?paid=' + kind; return;
      } catch (err) {
        // Only a declined card (402) or an order too old or unknown for one click (400/404) earns the hosted page,
        // where the parent types a card. Anything else (a dropped answer, 409 busy, 503, offline) may mean the
        // charge went through or is still running: wait, ask once more (a repeat answers { already: true }), and
        // never offer a second checkout on a guess.
        let e = err || {};
        const hostedOk = x => x.status === 402 || x.status === 400 || x.status === 404;
        if (!hostedOk(e)) {
          await new Promise(r => setTimeout(r, 3000));
          try {
            await api({ action: 'upsell', kind, intentId: o.intentId, clientSecret: o.clientSecret });
            location.href = next + '?paid=' + kind; return;
          } catch (e2) { e = e2 || e; }
        }
        yesAll.forEach(x => x.classList.remove('busy')); b.firstChild.textContent = label; yesBusy = false;
        if (url && hostedOk(e)) {
          // the hosted page asks for the card again (and runs the bank's check), so drop any 'button below' wording
          toast(String(e.message || 'That card did not go through.').replace(/\s*Use the button below to confirm it\.?/i, ' We are opening a secure page so you can confirm it.'), 3600);
          setTimeout(() => { const u = new URL(url); if (o.email) u.searchParams.set('prefilled_email', o.email); location.href = u.toString(); }, 1600);
          return;
        }
        toast('We could not confirm this step yet. Check your email for a receipt before you try again.', 6500);
        ph('upsell_unconfirmed', { kind, status: e.status || 0 });
        return;
      }
    }
    if (url) { const u = new URL(url); if (o.email) u.searchParams.set('prefilled_email', o.email); location.href = u.toString(); }
    else { toast('Preview: no payment connected yet'); setTimeout(() => location.href = next, 900); }
  }));
  $$('[data-no]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); const o = loadOrder() || {}; o[kind] = false; saveOrder(o); ph('upsell_no', { kind }, true); location.href = next; }));
  const first = (load(LEAD_KEY) || {}).first; if (first) $$('[data-first]').forEach(el => el.textContent = first);
}

// A paid return (?paid=<kind>) marks the item bought. The pixel and PostHog count it only for a payment this browser
// really made: the card form confirmed it (order.paid), the hosted Payment Link sent the parent back (order.mode
// 'hosted'; the link redirects here only after payment), or this order's yes button was pressed (order[kind] 'pending').
function markPaid() {
  const q = RETURN_Q, kind = q.get('paid');
  if (!['kit', 'university', 'certify'].includes(kind)) return loadOrder();
  const o = loadOrder() || sload(RECEIPT_KEY) || {}, now = new Date().toISOString();
  let real;
  if (kind === 'kit') {
    // a redirect-based payment method comes back with the intent in the URL; keep it so the upsells stay one click
    if (q.get('payment_intent') && q.get('payment_intent_client_secret')) {
      o.intentId = q.get('payment_intent'); o.clientSecret = q.get('payment_intent_client_secret');
      if (q.get('redirect_status') === 'succeeded') { o.paid = true; o.mode = 'onpage'; }
    }
    if (o.mode === 'hosted') o.paid = true;
    real = !!o.paid; if (real && !o.paidAt) o.paidAt = now;
  } else {
    real = o[kind] === 'pending'; // set by this page's yes button; a reload finds true here and does not count again
    if (real && !o[kind + 'At']) o[kind + 'At'] = now;
  }
  o[kind] = true; saveOrder(o);
  if (real) conversion(kind, o);
  if (q.has('payment_intent_client_secret')) history.replaceState(null, '', location.pathname + '?paid=' + kind);
  return o;
}

// One event per order, with an eventID the Conversions API can match: the kit intent id, or the order's own id
// when it was paid on a hosted link. The upsells add -university / -certify (the server's idempotency keys).
function conversion(kind, o) {
  const base = o.intentId || o.eventId; if (!base) return; // no order from this browser: nothing to count
  if (kind === 'kit') {
    const value = o.total || CONFIG.shipping;
    trackOnce('purchase:' + base, 'Purchase', { content_name: o.bump ? 'kit+playbook' : 'kit', value, currency: 'USD', num_items: o.bump ? 2 : 1 }, base);
    phOnce('purchase:' + base, 'purchase', { total: value, bump: !!o.bump, intent_id: o.intentId || '', mode: o.mode || '' });
  }
  if (kind === 'university') trackOnce('trial:' + base, 'StartTrial', { content_name: 'university-trial', value: 0, currency: 'USD', predicted_ltv: 67 }, base + '-university');
  if (kind === 'certify') trackOnce('purchase:' + base + '-certify', 'Purchase', { content_name: 'certification', value: 297, currency: 'USD', num_items: 1 }, base + '-certify');
}

export function thanks() {
  const o = markPaid() || sload(RECEIPT_KEY) || load(LEAD_KEY) || {};
  if (o.first) $$('[data-first]').forEach(el => el.textContent = o.first);
  const uni = o.university === true, cert = o.certify === true;
  // the next steps follow what was bought
  const show = (sel, on) => $$(sel).forEach(el => el.classList.toggle('hide', !on));
  show('[data-if-bump]', !!o.bump); show('[data-if-university]', uni); show('[data-if-certify]', cert); show('[data-if-upsell]', uni || cert);
  // with the certification the University billing is paused for the free year, so day 14 is not a charge date
  show('[data-trial-charge]', uni && !cert);
  // the trial's first charge: 14 days after the University was added (today, when this browser did not record it)
  const t0 = Date.parse(o.universityAt) || Date.now();
  $$('[data-trial-date]').forEach(el => el.textContent = day(new Date(t0 + 14 * 864e5)));
  // the stack: every piece of the order with its picture, then what was paid today
  const rows = $('[data-order-rows]');
  if (rows) {
    const img = f => '../img/funnel/' + f;
    const items = [
      [img('abacus-800.webp'), 'The Child Prodigy Starter Kit', 'The abacus, shipped to your door with tracking.', 'FREE', true],
      [img('kitbox-v6-800.webp'), 'The 3-Night Quick-Start', 'Your first three nights, open tonight in your account.', 'Included', true],
    ];
    if (o.bump) items.push([img('playbook.webp'), 'Child Prodigy Secrets Playbook + Audiobook', 'Read it and listen to it in your account, under Resources.', '$' + CONFIG.bumpPrice, false]);
    if (uni) items.push([img('university.webp'), 'Child Phenom University', cert ? 'Stages 2 to 10, the library, the handouts and two guides. Free for a year with your certification.' : 'Stages 2 to 10, the library, the handouts and two guides. 14 days free, then $67 a month.', cert ? 'FREE' : 'FREE today', true]);
    if (cert) items.push([img('certificate.webp'), 'Certified Phenom Instructor', 'The course, the Launch Kit and your certificate, under Resources.', '$297', false]);
    rows.innerHTML = items.map(([src, n, d, v, free]) => `<li><img src="${src}" alt=""><div><div class="n">${n}</div><div class="d">${d}</div></div><span class="v${free ? ' free' : ''}">${v}</span></li>`).join('');
    const paid = CONFIG.shipping + (o.bump ? CONFIG.bumpPrice : 0) + (cert ? 297 : 0);
    $$('[data-paid-total]').forEach(el => el.textContent = money(paid) + (o.bump || cert ? '' : ' shipping'));
  }
  $$('[data-ship-days]').forEach(el => el.textContent = CONFIG.shipDays);
  // the rows are drawn and the upsells are behind us: the order (intent id, client secret, contact details) leaves
  // storage; the tab keeps only what this page shows, so a reload still shows the whole order
  try { sessionStorage.removeItem(ORDER_KEY); } catch {}
  if (o.kit || o.bump || uni || cert) ssave(RECEIPT_KEY, { first: o.first || '', kit: true, bump: !!o.bump, university: uni, certify: cert, universityAt: o.universityAt || '' });
}

// shared bits
export function common() {
  captureAttribution(); captureRef(); pixel(); toastRegion();
  // PostHog (about 200 KB with session replay) waits for the page's own load, so the hero and the form come first
  if (document.readyState === 'complete') posthogWhenShown(); else { addEventListener('load', posthogWhenShown, { once: true }); setTimeout(posthogWhenShown, 5000); }
  $$('[data-support]').forEach(el => { el.textContent = CONFIG.supportEmail; el.href = 'mailto:' + CONFIG.supportEmail; });
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
}

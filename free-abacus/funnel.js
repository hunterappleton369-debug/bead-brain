// funnel.js — two-step order form, order bump, sticky CTA, upsell routing, Meta Pixel and PostHog. No framework.
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
    window.posthog.capture('$pageview', {}, { send_instantly: true, transport: 'sendBeacon' });
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
// beforeNav: the page changes right after this, so send the event now instead of with the next batch
function ph(name, props, beforeNav) {
  if (!phOn || !window.posthog) return;
  try { window.posthog.capture(name, props || {}, beforeNav ? { send_instantly: true, transport: 'sendBeacon' } : undefined); } catch {}
}
function phOnce(key, name, props) { if (phOn) once('ph:' + key, () => ph(name, props)); }
function phIdentify(email) { if (!phOn || !window.posthog || !email) return; try { window.posthog.identify(email, { email }); } catch {} }

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
  return out;
}

// toasts go into one polite live region, made when the page starts, so screen readers announce each one
let toastBox = null;
const toastRegion = () => { if (!toastBox) { toastBox = document.createElement('div'); toastBox.setAttribute('aria-live', 'polite'); toastBox.setAttribute('role', 'status'); document.body.appendChild(toastBox); } return toastBox; };
export function toast(msg, ms = 2600) {
  const t = document.createElement('div'); t.className = 'toast-fn'; t.textContent = msg; toastRegion().appendChild(t);
  setTimeout(() => t.remove(), ms);
}

// ---------- sticky CTA: shows once the hero CTA scrolls away, hides while the form is on screen ----------
export function stickyCTA(target = '#order') {
  const bar = $('.sticky-cta'); const form = $(target); const hero = $('[data-hero-cta]');
  if (!bar) return;
  // keep the page's last lines clear of the bar, whatever its button text wraps to on this phone
  const pad = () => { const h = bar.offsetHeight; document.body.style.paddingBottom = h ? (h + 8) + 'px' : ''; };
  pad(); addEventListener('resize', pad, { passive: true }); if (document.fonts) document.fonts.ready.then(pad, () => {});
  const io = new IntersectionObserver(() => {
    const heroGone = hero ? hero.getBoundingClientRect().bottom < 0 : true;
    const formOn = form ? (form.getBoundingClientRect().top < innerHeight * 0.8 && form.getBoundingClientRect().bottom > 120) : false;
    bar.classList.toggle('show', heroGone && !formOn);
  }, { threshold: [0, .1, .5, 1] });
  [hero, form].filter(Boolean).forEach(el => io.observe(el));
  addEventListener('scroll', () => {
    const heroGone = hero ? hero.getBoundingClientRect().bottom < 0 : true;
    const formOn = form ? (form.getBoundingClientRect().top < innerHeight * 0.8 && form.getBoundingClientRect().bottom > 120) : false;
    bar.classList.toggle('show', heroGone && !formOn);
  }, { passive: true });
}

// ---------- smooth scroll for in-page CTAs ----------
export function scrollLinks() {
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const h = a.getAttribute('href'); if (h.length < 2) return;
    const el = $(h); if (!el) return;
    e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // CTAs aimed at the order form put the cursor in its first field; the logo (#top) does not
    const first = el.matches('.order') ? el.querySelector('.pane.on input') : null;
    if (first) setTimeout(() => first.focus({ preventScroll: true }), 500);
  }));
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
const MOUNT_MS = 12000; // no card form 12 seconds after step 2 opens: the hosted checkout takes over

// ---------- the two-step order form ----------
export function orderForm() {
  const form = $('#order'); if (!form) return;
  const pane1 = $('[data-pane="1"]', form), pane2 = $('[data-pane="2"]', form);
  const ind = $$('.step-ind span, .tabs span', form);
  const bump = $('#bump', form);
  const lead = load(LEAD_KEY) || {};
  // prefill from an earlier visit
  $$('input', pane1).forEach(i => { if (lead[i.name]) i.value = lead[i.name]; });
  // Warm up Stripe.js (250 KB) once the page's own images and fonts are in, or as soon as the parent touches the
  // form, whichever comes first, so it never competes with the hero image for a slow connection's first seconds.
  if (onPage()) {
    let warmed = false; const warm = () => { if (warmed) return; warmed = true; loadStripe().catch(() => {}); };
    if (document.readyState === 'complete') warm(); else addEventListener('load', warm, { once: true });
    pane1.addEventListener('focusin', warm, { once: true });
    setTimeout(warm, 4000); // a load event held up by a slow third-party script still warms up in time
  }
  // Back from a card check that failed or was abandoned (university.html sends ?pay=failed): say so, once
  if (RETURN_Q.get('pay') === 'failed') {
    try { const u = new URL(location.href); u.searchParams.delete('pay'); history.replaceState(null, '', u.pathname + u.search + u.hash); } catch {}
    setTimeout(() => toast('That payment did not go through. Check the card and try again.', 5000), 600);
  }

  const valid = pane => {
    let ok = true;
    $$('input[required], select[required]', pane).forEach(i => {
      const fld = i.closest('.fld'); const bad = !i.value.trim() || (i.type === 'email' && !EMAIL.test(i.value)) || (i.name === 'phone' && i.value.replace(/\D/g, '').length < 10);
      fld.classList.toggle('bad', bad); if (bad) { if (ok) i.focus({ preventScroll: false }); ok = false; }
    });
    return ok;
  };
  const totals = () => {
    const withBump = bump && bump.checked;
    const total = CONFIG.shipping + (withBump ? CONFIG.bumpPrice : 0);
    $$('[data-bump-row]', form).forEach(r => r.classList.toggle('hide', !withBump));
    $$('[data-total]', form).forEach(t => t.textContent = money(total));
    $$('[data-ship]', form).forEach(t => t.textContent = money(CONFIG.shipping));
    $$('[data-bump-price]').forEach(t => t.textContent = '$' + CONFIG.bumpPrice);
  };
  totals();

  // ----- the card form on the page -----
  const payBlock = $('[data-pay-block]', form), payErr = $('[data-pay-error]', form), payLoading = $('[data-pay-loading]', form);
  const complete = $('[data-complete]', form);
  let co = null;          // { stripe, elements, intentId, clientSecret, email, amount, bump } once the card form is mounted
  let els = null;         // the mounted Address and Payment Elements
  let pre = null;         // { email, p } the start call made while the parent was still typing, so step 2 opens fast
  let hosted = !onPage(); // true = the Complete button sends the parent to the hosted checkout links
  let seq = 0, mounting = null, timer = 0, syncing = null;
  const showErr = msg => { if (!payErr) return; payErr.textContent = msg || ''; payErr.hidden = !msg; };
  const setState = (mode, reason) => { window.cpCheckoutState = { mode, reason: reason || '' }; };
  const setBusy = on => { complete.classList.toggle('busy', on); if (on) complete.setAttribute('aria-disabled', 'true'); else complete.removeAttribute('aria-disabled'); };
  const fullName = d => [d.first, d.last].filter(Boolean).join(' ');
  // In hosted mode the button opens Stripe's page, where the address and card are typed: its label says so
  const LABEL_HOSTED = 'CONTINUE TO SECURE CHECKOUT →';
  if (!complete.dataset.label) complete.dataset.label = complete.firstChild.textContent;
  const setLabel = hostedMode => { complete.firstChild.textContent = hostedMode ? LABEL_HOSTED : complete.dataset.label; };
  // An error the parent can see: the line under the card fields, a toast by the thumb, and the page scrolls up to the
  // fields (a phone shows the button about a screen below them, so a message left there was never seen).
  const failed = (msg, toFields) => {
    showErr(msg); toast(msg, 4200);
    const target = toFields ? payBlock : payErr;
    if (target) setTimeout(() => window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - (toFields ? 84 : innerHeight / 2), behavior: 'smooth' }), 50);
  };
  // After a confirm that ended in an error: whether Stripe shows the kit as paid anyway (the answer was lost on the way
  // back, which a dropped in-app connection does). Never a guess: a lookup that fails answers null.
  const paidAfterAll = async c => {
    try { const r = await c.stripe.retrievePaymentIntent(c.clientSecret); const pi = r && r.paymentIntent; return pi && (pi.status === 'succeeded' || pi.status === 'processing') ? pi : null; }
    catch { return null; }
  };
  // The card form could not start or is too slow: a calm line in its place, and the bump, the summary and the
  // button stay. Complete then opens the hosted Payment Link.
  const useHosted = reason => {
    hosted = true; mounting = null; pre = null; clearTimeout(timer); // a start still on its way is dropped: the next Next starts fresh
    if (payBlock) payBlock.classList.add('hosted');
    setLabel(true);
    if (payLoading) payLoading.classList.add('hide');
    pane2.classList.remove('loading'); showErr('');
    setState('hosted', reason); ph('checkout_hosted_fallback', { reason });
    console.warn('on-page checkout off:', reason);
  };
  if (hosted) { if (payBlock) payBlock.classList.add('hosted'); setLabel(true); setState('hosted', 'not_configured'); }
  const destroyEls = () => { if (!els) return; [els.ship, els.pay].forEach(x => { try { x.destroy(); } catch {} }); els = null; };
  const startCall = d => {
    const b = !!(bump && bump.checked);
    // the start call goes out at once, in parallel with Stripe.js: the server saves the lead first, so even a page whose
    // Stripe.js never loads keeps the parent's contact details
    const started = api({ action: 'start', email: d.email, first: d.first, last: d.last, phone: d.phone, bump: b, attribution: attribution(), lead_event_id: gpc() ? undefined : leadEventId(d.email), gpc: gpc() });
    started.catch(() => {});
    return Promise.all([loadStripe(), started]).then(([S, st]) => ({ S, started: st, bump: b }));
  };

  function prefetch(d) {
    if (!onPage() || !d.email || !EMAIL.test(d.email)) return;
    if (pre && pre.email === d.email) return;
    const p = startCall(d);
    pre = { email: d.email, p, sent: d }; p.catch(() => { if (pre && pre.p === p) pre = null; });
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
    const s0 = pre && pre.email === d.email ? pre.sent : null;
    if (s0 && s0.first === d.first && s0.last === d.last && s0.phone === d.phone) return; // the start already carried these
    api({ action: 'update', intentId: st.intentId, clientSecret: st.clientSecret, first: d.first, last: d.last, phone: d.phone }).catch(() => { if (contactSent === key) contactSent = ''; });
  };
  async function mountCheckout(data) {
    if (!hosted && co && co.email === data.email) { syncContact(co, data); if (bump && co.bump !== bump.checked) await syncBump(); return; }
    if (mounting && mounting.email === data.email) return; // this email's card form is already on its way
    const my = ++seq; mounting = { email: data.email };
    const live = () => my === seq && !hosted; // false once a newer try or the fallback has taken over
    hosted = false; co = null; destroyEls();
    if (payBlock) payBlock.classList.remove('hosted');
    setLabel(false);
    showErr(''); if (payLoading) payLoading.classList.remove('hide');
    pane2.classList.add('loading');
    clearTimeout(timer);
    timer = setTimeout(() => { if (my === seq && mounting) useHosted('timeout'); }, MOUNT_MS);
    try {
      if (!(pre && pre.email === data.email)) prefetch(data); // no start on its way for this email: one goes out now
      const got = (pre && pre.email === data.email) ? await pre.p : await startCall(data);
      if (!live()) return;
      const started = got.started;
      syncContact(started, data);
      const stripe = got.S(CONFIG.stripePublishableKey);
      const elements = stripe.elements({ clientSecret: started.clientSecret, appearance: APPEARANCE, fonts: FONTS, loader: 'auto' });
      const ship = elements.create('address', { mode: 'shipping', allowedCountries: ['US'], fields: { phone: 'always' }, validation: { phone: { required: 'always' } }, defaultValues: { name: fullName(data), phone: data.phone || '' }, display: { name: 'full' } });
      const pay = elements.create('payment', {
        layout: { type: 'accordion', defaultCollapsed: false, radios: true, spacedAccordionItems: false },
        business: { name: 'Child Phenoms' },
        fields: { billingDetails: { name: 'never', email: 'never', phone: 'never' } },
        defaultValues: { billingDetails: { name: fullName(data), email: data.email, phone: data.phone || '' } },
        // 'auto': Stripe prints its sentence that the card is saved for the one-click offers on the next pages
        terms: { card: 'auto', applePay: 'auto', googlePay: 'auto', link: 'auto' },
      });
      $$('#ship-el, #pay-el', form).forEach(el => el.innerHTML = '');
      ship.mount('#ship-el'); pay.mount('#pay-el');
      els = { ship, pay };
      co = { stripe, elements, intentId: started.intentId, clientSecret: started.clientSecret, email: data.email, amount: started.amount, bump: got.bump };
      pay.on('ready', () => {
        if (!live()) return;
        clearTimeout(timer); mounting = null;
        if (payLoading) payLoading.classList.add('hide'); pane2.classList.remove('loading');
        setState('onpage', ''); ph('checkout_mounted');
        if (bump && co.bump !== bump.checked) syncBump();
      });
      const loadErr = e => { if (live()) useHosted('loaderror: ' + String((e && e.error && e.error.message) || '').slice(0, 120)); };
      pay.on('loaderror', loadErr); ship.on('loaderror', loadErr);
    } catch (e) {
      if (live()) useHosted(reasonOf(e));
    }
  }
  // Start the payment while the parent is still on step 1, so the card fields are ready when step 2 opens.
  const p1 = () => { const d = {}; $$('input', pane1).forEach(i => d[i.name] = i.value.trim()); return d; };
  const emailEl = $('#email', pane1), phoneEl = $('#phone', pane1);
  // The start goes out on the email's blur (speed: the card form is ready by the time Next is tapped) or once the phone
  // has 10 digits (the in-app browsers' autofill fills every field at once, and some parents type the phone first).
  // A start made before the phone was typed is the one the card form keeps, so the saved lead often has no phone;
  // the paid order still gets it from the shipping form. Filling it in would take a lead-only call to the server.
  const phoneReady = () => !!phoneEl && phoneEl.value.replace(/\D/g, '').length >= 10;
  emailEl && emailEl.addEventListener('blur', () => prefetch(p1()));
  phoneEl && phoneEl.addEventListener('input', () => { if (phoneReady()) prefetch(p1()); });
  // the step-1 fields are a form, so the keyboard's Go key is the same as the button
  const step1 = form.querySelector('form[data-step1]');
  step1 && step1.addEventListener('submit', e => { e.preventDefault(); $('[data-next]', form).click(); });
  // The bump changed: move the intent to the new total. Complete stays busy until Stripe has it, and the loop
  // re-reads the box after each answer, so quick taps end on the box's last state.
  function syncBump() {
    if (!co || hosted) return Promise.resolve();
    if (syncing) return syncing;
    setBusy(true);
    syncing = (async () => {
      try {
        let c, want;
        do {
          c = co; want = !!(bump && bump.checked);
          const u = await api({ action: 'update', intentId: c.intentId, clientSecret: c.clientSecret, bump: want });
          c.amount = u.amount; c.bump = want;
          await c.elements.fetchUpdates();
        } while (c === co && !hosted && want !== !!(bump && bump.checked));
        showErr('');
      } catch (e) {
        // the total on the page must be the total Stripe will charge: the box goes back to what Stripe has
        if (bump && co) { bump.checked = !!co.bump; totals(); }
        failed(e.message, false);
      }
      finally { syncing = null; setBusy(false); }
    })();
    return syncing;
  }

  bump && bump.addEventListener('change', () => {
    totals();
    if (bump.checked) track('AddToCart', { content_name: 'playbook', value: CONFIG.bumpPrice, currency: 'USD' });
    ph('bump_toggled', { state: bump.checked ? 'on' : 'off' });
    if (co && !hosted) syncBump();
  });

  $('[data-next]', form).addEventListener('click', e => {
    e.preventDefault();
    if (!valid(pane1)) { toast('Check the highlighted fields'); return; }
    const data = p1();
    data.at = new Date().toISOString(); save(LEAD_KEY, data);
    const email = data.email.toLowerCase();
    trackOnce('lead:' + email, 'Lead', { content_name: 'free-abacus-kit' }, leadEventId(email)); // once per lead email, same id as the server's copy
    phIdentify(email); ph('funnel_lead', { has_phone: !!data.phone });
    if (CONFIG.leadWebhook) fetch(CONFIG.leadWebhook, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'lead', ...data }) }).catch(() => {});
    pane1.classList.remove('on'); pane2.classList.add('on');
    ind[0].classList.replace('on', 'done'); ind[1].classList.add('on');
    const ttl = $('[data-pane="2"] h3', form); if (ttl) ttl.textContent = 'Almost done, ' + (data.first || 'friend') + '.';
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // every Next tries the card form again, so one failed start does not leave the parent on the hosted link
    if (onPage()) mountCheckout(data); else setTimeout(() => { const f = $('input', pane2); f && f.focus({ preventScroll: true }); }, 450);
  });
  $('[data-back]', form) && $('[data-back]', form).addEventListener('click', e => { e.preventDefault(); pane2.classList.remove('on'); pane1.classList.add('on'); ind[1].classList.remove('on'); ind[0].classList.replace('done', 'on'); form.scrollIntoView({ behavior: 'smooth', block: 'start' }); });

  complete.addEventListener('click', async e => {
    e.preventDefault();
    if (complete.classList.contains('busy')) return; // the bump total or the payment is still on its way
    if (!valid(pane2)) { toast('Check the highlighted fields'); return; }
    const ship = {}; $$('input, select', pane2).forEach(i => { if (i.name && i.type !== 'checkbox') ship[i.name] = i.value.trim(); });
    const withBump = !!(bump && bump.checked);
    const payHere = !hosted && !!co;
    // never charge a total the parent did not see: a bump update that failed gets one more try first
    if (payHere && co.bump !== withBump) { await syncBump(); if (!co || co.bump !== withBump) return; }
    const order = { ...(load(LEAD_KEY) || {}), ...ship, bump: withBump, total: CONFIG.shipping + (withBump ? CONFIG.bumpPrice : 0), at: new Date().toISOString(), mode: payHere ? 'onpage' : 'hosted', eventId: rid() };
    saveOrder(order);
    track('InitiateCheckout', { content_name: withBump ? 'kit+playbook' : 'kit', value: order.total, currency: 'USD', num_items: withBump ? 2 : 1 }, payHere ? co.intentId : order.eventId);
    ph('checkout_submitted', { total: order.total, bump: withBump }, !payHere);

    if (payHere) {
      // pay here: the card form on the page; the saved card makes the next two pages one click
      showErr(''); setBusy(true); if (bump) bump.disabled = true;
      const label = complete.firstChild.textContent; complete.firstChild.textContent = 'Processing your order… ';
      const undo = () => { setBusy(false); if (bump) bump.disabled = false; complete.firstChild.textContent = label; };
      const finish = pi => { saveOrder({ ...order, intentId: co.intentId, clientSecret: co.clientSecret, kit: true, paid: true, paidAt: new Date().toISOString(), status: pi && pi.status }); location.href = 'university.html?paid=kit'; };
      try {
        const lead = { ...(load(LEAD_KEY) || {}), ...p1() }; // the fields as typed, even where storage is blocked
        const { error, paymentIntent } = await co.stripe.confirmPayment({
          elements: co.elements, redirect: 'if_required',
          confirmParams: { return_url: new URL('university.html?paid=kit', location.href).toString(), payment_method_data: { billing_details: { name: fullName(lead) || undefined, email: lead.email || undefined, phone: lead.phone || undefined } } },
        });
        if (error) {
          // The answer was lost but the charge went through (a dropped in-app connection; a second tap then says
          // the intent is in an unexpected state): the order is paid, go on. Field and card errors skip the lookup.
          const known = error.payment_intent && (error.payment_intent.status === 'succeeded' || error.payment_intent.status === 'processing') ? error.payment_intent : null;
          const done = known || (error.type === 'validation_error' || error.type === 'card_error' ? null : await paidAfterAll(co));
          if (done) { finish(done); return; }
          failed(error.type === 'validation_error' ? 'Please fill in the highlighted fields above.' : (error.message || 'The card did not go through. Check the details and try again.'), error.type === 'validation_error');
          undo(); return;
        }
        finish(paymentIntent);
      } catch (err) {
        const done = await paidAfterAll(co);
        if (done) { finish(done); return; }
        failed(err.message || 'Something went wrong. Try again.', false); undo();
      }
      return;
    }

    const url = withBump ? CONFIG.checkoutUrlWithBump : CONFIG.checkoutUrl; // hosted fallback; both links must be set
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
  const rows = $('[data-order-rows]');
  if (rows) {
    const items = [['Child Prodigy Starter Kit', 'FREE (shipping ' + money(CONFIG.shipping) + ')']];
    if (o.bump) items.push(['Child Prodigy Secrets Playbook + Audiobook', '$' + CONFIG.bumpPrice]);
    if (uni) items.push(['Child Phenom University — 14-day test drive', cert ? 'FREE for a year with your certification' : 'FREE, then $67/mo']);
    if (cert) items.push(['Certified Phenom Instructor', '$297']);
    rows.innerHTML = items.map(([n, p]) => `<div><span>${n}</span><b>${p}</b></div>`).join('');
  }
  $$('[data-ship-days]').forEach(el => el.textContent = CONFIG.shipDays);
  // the rows are drawn and the upsells are behind us: the order (intent id, client secret, contact details) leaves
  // storage; the tab keeps only what this page shows, so a reload still shows the whole order
  try { sessionStorage.removeItem(ORDER_KEY); } catch {}
  if (o.kit || o.bump || uni || cert) ssave(RECEIPT_KEY, { first: o.first || '', kit: true, bump: !!o.bump, university: uni, certify: cert, universityAt: o.universityAt || '' });
}

// shared bits
export function common() {
  captureAttribution(); pixel(); toastRegion();
  // PostHog (about 200 KB with session replay) waits for the page's own load, so the hero and the form come first
  if (document.readyState === 'complete') posthogWhenShown(); else { addEventListener('load', posthogWhenShown, { once: true }); setTimeout(posthogWhenShown, 5000); }
  $$('[data-support]').forEach(el => { el.textContent = CONFIG.supportEmail; el.href = 'mailto:' + CONFIG.supportEmail; });
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
}

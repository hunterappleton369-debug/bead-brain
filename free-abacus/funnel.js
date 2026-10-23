// funnel.js — two-step order form, order bump, sticky CTA, upsell routing. No framework.
import { CONFIG } from './config.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => '$' + n.toFixed(2);
const LEAD_KEY = 'cp.funnel.lead';
const ORDER_KEY = 'cp.funnel.order';
const load = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// ---------- Meta Pixel (loads only when CONFIG.metaPixelId is set) ----------
const PX_KEY = 'cp.px.fired';
export function pixel() {
  if (!CONFIG.metaPixelId || window.fbq) return;
  if (navigator.globalPrivacyControl) return; // the privacy policy promises to honour Global Privacy Control
  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  const lead = load(LEAD_KEY) || {};
  const am = {}; if (lead.email) am.em = lead.email.trim().toLowerCase(); if (lead.first) am.fn = lead.first.trim().toLowerCase(); if (lead.last) am.ln = lead.last.trim().toLowerCase(); if (lead.phone) am.ph = lead.phone.replace(/\D/g, '');
  window.fbq('init', CONFIG.metaPixelId, am);
  window.fbq('track', 'PageView');
}
export function track(name, params) { if (window.fbq) window.fbq('track', name, params || {}); }
// Fire a conversion once per browser (reloads of a thank-you page must not double count).
function trackOnce(key, name, params) {
  if (!window.fbq) return; // no pixel yet: do not record, so the event still fires once the ID is set
  const fired = load(PX_KEY) || {}; if (fired[key]) return;
  fired[key] = new Date().toISOString(); save(PX_KEY, fired); track(name, params);
}

export function toast(msg, ms = 2600) {
  const t = document.createElement('div'); t.className = 'toast-fn'; t.textContent = msg; document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
}

// ---------- sticky CTA: shows once the hero CTA scrolls away, hides while the form is on screen ----------
export function stickyCTA(target = '#order') {
  const bar = $('.sticky-cta'); const form = $(target); const hero = $('[data-hero-cta]');
  if (!bar) return;
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
    const first = el.querySelector('.pane.on input'); if (first) setTimeout(() => first.focus({ preventScroll: true }), 500);
  }));
}

// ---------- on-page checkout: Stripe Elements in step 2, the card saved for one-click upsells ----------
const onPage = () => !!(CONFIG.checkoutApi && CONFIG.stripePublishableKey);
async function api(payload) {
  const r = await fetch(CONFIG.checkoutApi, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  let data = {}; try { data = await r.json(); } catch {}
  if (!r.ok || data.error) throw new Error(data.error || 'Something went wrong. Try again in a moment.');
  return data;
}
let stripeJs = null;
function loadStripe() {
  if (stripeJs) return stripeJs;
  stripeJs = new Promise((res, rej) => {
    if (window.Stripe) return res(window.Stripe);
    const t = document.createElement('script'); t.src = 'https://js.stripe.com/v3/'; t.async = true;
    t.onload = () => res(window.Stripe); t.onerror = () => { stripeJs = null; rej(new Error('Stripe.js did not load')); };
    document.head.appendChild(t);
  });
  return stripeJs;
}
const APPEARANCE = { theme: 'stripe', variables: { colorPrimary: '#2457f5', colorText: '#121826', colorDanger: '#f03e3e', borderRadius: '10px', fontFamily: 'Inter, system-ui, sans-serif', fontSizeBase: '16px', spacingUnit: '4px' } };
const FONTS = [{ cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap' }];

// ---------- the two-step order form ----------
export function orderForm() {
  const form = $('#order'); if (!form) return;
  const pane1 = $('[data-pane="1"]', form), pane2 = $('[data-pane="2"]', form);
  const ind = $$('.step-ind span, .tabs span', form);
  const bump = $('#bump', form);
  const lead = load(LEAD_KEY) || {};
  // prefill from an earlier visit
  $$('input', pane1).forEach(i => { if (lead[i.name]) i.value = lead[i.name]; });
  if (onPage()) loadStripe().catch(() => {}); // warm up while the parent types

  const valid = pane => {
    let ok = true;
    $$('input[required], select[required]', pane).forEach(i => {
      const fld = i.closest('.fld'); const bad = !i.value.trim() || (i.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value)) || (i.name === 'phone' && i.value.replace(/\D/g, '').length < 10);
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
  let co = null;          // { stripe, elements, intentId, clientSecret, email, amount }
  let hosted = !onPage(); // true = fall back to the hosted checkout links
  const showErr = msg => { if (!payErr) return; payErr.textContent = msg || ''; payErr.hidden = !msg; };
  const useHosted = why => { hosted = true; if (payBlock) payBlock.classList.add('hosted'); if (why) console.warn('on-page checkout off:', why); };
  const fullName = d => [d.first, d.last].filter(Boolean).join(' ');

  async function mountCheckout(data) {
    if (co && co.email === data.email) { if (bump) await syncBump(); return; }
    if (payBlock) payBlock.classList.remove('hosted');
    showErr(''); if (payLoading) payLoading.classList.remove('hide');
    try {
      const Stripe = await loadStripe();
      const started = await api({ action: 'start', email: data.email, first: data.first, last: data.last, phone: data.phone, bump: !!(bump && bump.checked) });
      const stripe = Stripe(CONFIG.stripePublishableKey);
      const elements = stripe.elements({ clientSecret: started.clientSecret, appearance: APPEARANCE, fonts: FONTS, loader: 'auto' });
      const ship = elements.create('address', { mode: 'shipping', allowedCountries: ['US'], fields: { phone: 'always' }, validation: { phone: { required: 'always' } }, defaultValues: { name: fullName(data), phone: data.phone || '' }, display: { name: 'full' } });
      const pay = elements.create('payment', {
        layout: { type: 'accordion', defaultCollapsed: false, radios: true, spacedAccordionItems: false },
        business: { name: 'Child Phenoms' },
        fields: { billingDetails: { name: 'never', email: 'never', phone: 'never' } },
        defaultValues: { billingDetails: { name: fullName(data), email: data.email, phone: data.phone || '' } },
        terms: { card: 'never', applePay: 'never', googlePay: 'never', link: 'never' },
      });
      $$('#ship-el, #pay-el', form).forEach(el => el.innerHTML = '');
      ship.mount('#ship-el'); pay.mount('#pay-el');
      pay.on('ready', () => { if (payLoading) payLoading.classList.add('hide'); });
      pay.on('loaderror', e => { useHosted(e && e.error && e.error.message); if (payLoading) payLoading.classList.add('hide'); });
      co = { stripe, elements, intentId: started.intentId, clientSecret: started.clientSecret, email: data.email, amount: started.amount };
    } catch (e) {
      useHosted(e.message); if (payLoading) payLoading.classList.add('hide');
    }
  }
  async function syncBump() {
    if (!co) return;
    try {
      const u = await api({ action: 'update', intentId: co.intentId, clientSecret: co.clientSecret, bump: !!(bump && bump.checked) });
      co.amount = u.amount; await co.elements.fetchUpdates();
    } catch (e) { showErr(e.message); }
  }

  bump && bump.addEventListener('change', () => { totals(); if (bump.checked) track('AddToCart', { content_name: 'playbook', value: CONFIG.bumpPrice, currency: 'USD' }); if (co && !hosted) syncBump(); });

  $('[data-next]', form).addEventListener('click', e => {
    e.preventDefault();
    if (!valid(pane1)) { toast('Check the highlighted fields'); return; }
    const data = {}; $$('input', pane1).forEach(i => data[i.name] = i.value.trim());
    data.at = new Date().toISOString(); save(LEAD_KEY, data);
    track('Lead', { content_name: 'free-abacus-kit' });
    if (CONFIG.leadWebhook) fetch(CONFIG.leadWebhook, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'lead', ...data }) }).catch(() => {});
    pane1.classList.remove('on'); pane2.classList.add('on');
    ind[0].classList.replace('on', 'done'); ind[1].classList.add('on');
    const ttl = $('[data-pane="2"] h3', form); if (ttl) ttl.textContent = 'Almost done, ' + (data.first || 'friend') + '.';
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (!hosted) mountCheckout(data); else setTimeout(() => { const f = $('input', pane2); f && f.focus({ preventScroll: true }); }, 450);
  });
  $('[data-back]', form) && $('[data-back]', form).addEventListener('click', e => { e.preventDefault(); pane2.classList.remove('on'); pane1.classList.add('on'); ind[1].classList.remove('on'); ind[0].classList.replace('done', 'on'); form.scrollIntoView({ behavior: 'smooth', block: 'start' }); });

  complete.addEventListener('click', async e => {
    e.preventDefault();
    if (!valid(pane2)) { toast('Check the highlighted fields'); return; }
    const ship = {}; $$('input, select', pane2).forEach(i => { if (i.name && i.type !== 'checkbox') ship[i.name] = i.value.trim(); });
    const withBump = !!(bump && bump.checked);
    const order = { ...(load(LEAD_KEY) || {}), ...ship, bump: withBump, total: CONFIG.shipping + (withBump ? CONFIG.bumpPrice : 0), at: new Date().toISOString() };
    save(ORDER_KEY, order);
    track('InitiateCheckout', { content_name: withBump ? 'kit+playbook' : 'kit', value: order.total, currency: 'USD', num_items: withBump ? 2 : 1 });

    if (!hosted && co) {
      // pay here: the card form on the page; the saved card makes the next two pages one click
      showErr(''); complete.classList.add('busy'); const label = complete.firstChild.textContent; complete.firstChild.textContent = 'Processing your order… ';
      try {
        const lead = load(LEAD_KEY) || {};
        const { error, paymentIntent } = await co.stripe.confirmPayment({
          elements: co.elements, redirect: 'if_required',
          confirmParams: { return_url: new URL('university.html?paid=kit', location.href).toString(), payment_method_data: { billing_details: { name: fullName(lead) || undefined, email: lead.email || undefined, phone: lead.phone || undefined } } },
        });
        if (error) { showErr(error.message || 'The card did not go through. Check the details and try again.'); complete.classList.remove('busy'); complete.firstChild.textContent = label; return; }
        save(ORDER_KEY, { ...order, intentId: co.intentId, clientSecret: co.clientSecret, kit: true, status: paymentIntent && paymentIntent.status });
        location.href = 'university.html?paid=kit';
      } catch (err) {
        showErr(err.message || 'Something went wrong. Try again.'); complete.classList.remove('busy'); complete.firstChild.textContent = label;
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
  const q = new URLSearchParams(location.search);
  // A paid return (?paid=<kind>) is the only thing that marks the item bought. A redirect-based payment method
  // comes back with the intent in the URL too; keep it so the upsells stay one click.
  const paid = q.get('paid');
  if (paid) {
    const o = load(ORDER_KEY) || {}; o[paid] = true;
    if (q.get('payment_intent') && q.get('payment_intent_client_secret')) { o.intentId = q.get('payment_intent'); o.clientSecret = q.get('payment_intent_client_secret'); }
    save(ORDER_KEY, o); conversion(paid, o);
    if (q.has('payment_intent_client_secret')) history.replaceState(null, '', location.pathname + '?paid=' + paid);
  }
  const d = new Date(Date.now() + 14 * 864e5);
  $$('[data-trial-date]').forEach(el => el.textContent = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }));
  const o0 = load(ORDER_KEY) || {};
  const oneClick = onPage() && !!(o0.intentId && o0.clientSecret);
  if (oneClick) $$('[data-yes]').forEach(b => {
    const n = document.createElement('p'); n.className = 'oneclick-note';
    n.textContent = kind === 'university' ? 'One click. Your free 14 days start now on the card from your kit order. Cancel from your account page.' : 'One click. $297 goes on the card from your kit order.';
    b.insertAdjacentElement('afterend', n);
  });
  $$('[data-yes]').forEach(b => b.addEventListener('click', async e => {
    e.preventDefault();
    const o = load(ORDER_KEY) || {}; o[kind] = (url || oneClick) ? 'pending' : true; save(ORDER_KEY, o);
    track('InitiateCheckout', { content_name: kind === 'university' ? 'university-trial' : 'certification', value: kind === 'university' ? 0 : 297, currency: 'USD' });
    if (oneClick) {
      const label = b.firstChild.textContent; b.classList.add('busy'); b.firstChild.textContent = kind === 'university' ? 'Starting your test drive… ' : 'Adding it to your order… ';
      try {
        await api({ action: 'upsell', kind, intentId: o.intentId, clientSecret: o.clientSecret });
        location.href = next + '?paid=' + kind; return;
      } catch (err) {
        b.classList.remove('busy'); b.firstChild.textContent = label;
        toast(err.message || 'That did not go through.', 3200);
        if (!url) return;
        // the saved card failed: let the parent enter another one on the hosted page
        setTimeout(() => { const u = new URL(url); if (o.email) u.searchParams.set('prefilled_email', o.email); location.href = u.toString(); }, 1600);
        return;
      }
    }
    if (url) { const u = new URL(url); if (o.email) u.searchParams.set('prefilled_email', o.email); location.href = u.toString(); }
    else { toast('Preview: no payment connected yet'); setTimeout(() => location.href = next, 900); }
  }));
  $$('[data-no]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); const o = load(ORDER_KEY) || {}; o[kind] = false; save(ORDER_KEY, o); location.href = next; }));
  const first = load(LEAD_KEY)?.first; if (first) $$('[data-first]').forEach(el => el.textContent = first);
}

// What a hosted checkout's ?paid=<kind> return means for the pixel.
function conversion(kind, o) {
  if (kind === 'kit') trackOnce('kit', 'Purchase', { content_name: o.bump ? 'kit+playbook' : 'kit', value: o.total || CONFIG.shipping, currency: 'USD', num_items: o.bump ? 2 : 1 });
  if (kind === 'university') { trackOnce('university', 'StartTrial', { content_name: 'university-trial', value: 0, currency: 'USD', predicted_ltv: 67 }); }
  if (kind === 'certify') trackOnce('certify', 'Purchase', { content_name: 'certification', value: 297, currency: 'USD', num_items: 1 });
}

export function thanks() {
  const o = load(ORDER_KEY) || load(LEAD_KEY) || {};
  if (o.first) $$('[data-first]').forEach(el => el.textContent = o.first);
  const rows = $('[data-order-rows]'); if (!rows) return;
  const items = [['Child Phenoms Abacus Kit', 'FREE (shipping ' + money(CONFIG.shipping) + ')']];
  if (o.bump) items.push(['Child Prodigy Secrets Playbook + Audiobook', '$' + CONFIG.bumpPrice]);
  $$('[data-if-bump]').forEach(el => el.classList.toggle('hide', !o.bump));
  const paid = new URLSearchParams(location.search).get('paid'); if (paid) { o[paid] = true; save(ORDER_KEY, o); conversion(paid, o); }
  if (o.university === true) items.push(['Child Phenom University — 14-day test drive', 'FREE, then $67/mo']);
  if (o.certify === true) items.push(['Certified Phenom Instructor', '$297']);
  rows.innerHTML = items.map(([n, p]) => `<div><span>${n}</span><b>${p}</b></div>`).join('');
  $$('[data-ship-days]').forEach(el => el.textContent = CONFIG.shipDays);
}

// shared bits
export function common() {
  pixel();
  $$('[data-support]').forEach(el => { el.textContent = CONFIG.supportEmail; el.href = 'mailto:' + CONFIG.supportEmail; });
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
}

// funnel.js — two-step order form, order bump, sticky CTA, upsell routing. No framework.
import { CONFIG } from './config.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => '$' + n.toFixed(2);
const LEAD_KEY = 'cp.funnel.lead';
const ORDER_KEY = 'cp.funnel.order';
const load = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

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

// ---------- the two-step order form ----------
export function orderForm() {
  const form = $('#order'); if (!form) return;
  const pane1 = $('[data-pane="1"]', form), pane2 = $('[data-pane="2"]', form);
  const ind = $$('.step-ind span, .tabs span', form);
  const bump = $('#bump', form);
  const lead = load(LEAD_KEY) || {};
  // prefill from an earlier visit
  $$('input', pane1).forEach(i => { if (lead[i.name]) i.value = lead[i.name]; });

  const valid = pane => {
    let ok = true;
    $$('input[required], select[required]', pane).forEach(i => {
      const fld = i.closest('.fld'); const bad = !i.value.trim() || (i.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value)) || (i.name === 'phone' && i.value.replace(/\D/g, '').length < 10);
      fld.classList.toggle('bad', bad); if (bad) ok = false;
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
  bump && bump.addEventListener('change', totals);

  $('[data-next]', form).addEventListener('click', e => {
    e.preventDefault();
    if (!valid(pane1)) { toast('Check the highlighted fields'); return; }
    const data = {}; $$('input', pane1).forEach(i => data[i.name] = i.value.trim());
    data.at = new Date().toISOString(); save(LEAD_KEY, data);
    if (CONFIG.leadWebhook) fetch(CONFIG.leadWebhook, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'lead', ...data }) }).catch(() => {});
    pane1.classList.remove('on'); pane2.classList.add('on');
    ind[0].classList.replace('on', 'done'); ind[1].classList.add('on');
    const ttl = $('[data-pane="2"] h3', form); if (ttl) ttl.textContent = 'Almost done, ' + (data.first || 'friend') + '.';
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => { const f = $('input', pane2); f && f.focus({ preventScroll: true }); }, 450);
  });
  $('[data-back]', form) && $('[data-back]', form).addEventListener('click', e => { e.preventDefault(); pane2.classList.remove('on'); pane1.classList.add('on'); ind[1].classList.remove('on'); ind[0].classList.replace('done', 'on'); form.scrollIntoView({ behavior: 'smooth', block: 'start' }); });

  $('[data-complete]', form).addEventListener('click', e => {
    e.preventDefault();
    if (!valid(pane2)) { toast('Check the highlighted fields'); return; }
    const ship = {}; $$('input, select', pane2).forEach(i => { if (i.name) ship[i.name] = i.value.trim(); });
    const withBump = !!(bump && bump.checked);
    const order = { ...(load(LEAD_KEY) || {}), ...ship, bump: withBump, total: CONFIG.shipping + (withBump ? CONFIG.bumpPrice : 0), at: new Date().toISOString() };
    save(ORDER_KEY, order);
    const url = withBump ? (CONFIG.checkoutUrlWithBump || CONFIG.checkoutUrl) : CONFIG.checkoutUrl;
    if (url) {
      const u = new URL(url); if (order.email) u.searchParams.set('prefilled_email', order.email);
      location.href = u.toString();
    } else {
      // preview mode: no processor wired, walk the funnel
      toast('Preview: no payment connected yet');
      setTimeout(() => location.href = 'university.html', 900);
    }
  });
}

// ---------- upsell pages ----------
export function upsell(kind) {
  const url = kind === 'university' ? CONFIG.universityTrialUrl : CONFIG.certifyUrl;
  const next = kind === 'university' ? 'certify.html' : 'thanks.html';
  $$('[data-yes]').forEach(b => b.addEventListener('click', e => {
    e.preventDefault();
    const o = load(ORDER_KEY) || {}; o[kind] = true; save(ORDER_KEY, o);
    if (url) { const u = new URL(url); if (o.email) u.searchParams.set('prefilled_email', o.email); location.href = u.toString(); }
    else { toast('Preview: no payment connected yet'); setTimeout(() => location.href = next, 900); }
  }));
  $$('[data-no]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); const o = load(ORDER_KEY) || {}; o[kind] = false; save(ORDER_KEY, o); location.href = next; }));
  const first = load(LEAD_KEY)?.first; if (first) $$('[data-first]').forEach(el => el.textContent = first);
}

export function thanks() {
  const o = load(ORDER_KEY) || load(LEAD_KEY) || {};
  if (o.first) $$('[data-first]').forEach(el => el.textContent = o.first);
  const rows = $('[data-order-rows]'); if (!rows) return;
  const items = [['Child Phenoms Abacus + Child Prodigy Secrets Playbook', 'FREE (shipping ' + money(CONFIG.shipping) + ')']];
  if (o.bump) items.push(['Prodigy Maker Workbook + Audiobook', '$' + CONFIG.bumpPrice]);
  if (o.university) items.push(['Child Phenom University — 14-day test drive', 'FREE, then $67/mo']);
  if (o.certify) items.push(['Certified Phenom Instructor', '$297']);
  rows.innerHTML = items.map(([n, p]) => `<div><span>${n}</span><b>${p}</b></div>`).join('');
  $$('[data-ship-days]').forEach(el => el.textContent = CONFIG.shipDays);
}

// shared bits
export function common() {
  $$('[data-support]').forEach(el => { el.textContent = CONFIG.supportEmail; el.href = 'mailto:' + CONFIG.supportEmail; });
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
}

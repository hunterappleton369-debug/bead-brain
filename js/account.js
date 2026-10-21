// account.js — #/account: the parent, what they own (kit, Playbook, University, instructor), the membership
// (and plainly what day 14 means), the billing buttons, the children. Billing itself lives in Stripe's hosted customer portal (STRIPE_PORTAL_URL in config.js);
// pauses go to support, because the portal cannot pause (docs/products/legal-and-ops/ops-runbook.md §3.8).
import { h, esc, tip, crumbs, day, shortDay, mailto } from './ui.js';
import { auth } from './auth.js';
import { store, levelFromXP } from './store.js';
import { membership, isLocal, fromToday } from './membership.js';
import { STRIPE_PORTAL_URL, SUPPORT_EMAIL, JOIN_URL } from './config.js';
import { toast } from './drills.js';

const ordinal = n => n + (n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th');
const portalURL = email => STRIPE_PORTAL_URL && STRIPE_PORTAL_URL + (email ? `${STRIPE_PORTAL_URL.includes('?') ? '&' : '?'}prefilled_email=${encodeURIComponent(email)}` : '');

// Each billing button: the portal when it is set up, an email to support when it is not.
function billingLinks(email) {
  const sig = `\n\nAccount email: ${email || '(the email I paid with)'}`;
  const portal = portalURL(email);
  const out = (subject, body) => ({ href: mailto(SUPPORT_EMAIL, subject, body + sig), ext: false });
  return {
    manage: portal ? { href: portal, ext: true } : out('Billing question', 'Hi, I have a question about my Phenom University billing.'),
    cancel: portal ? { href: portal, ext: true } : out('Cancel my membership', 'Hi, please cancel my Phenom University membership.'),
    card: portal ? { href: portal, ext: true } : out('Update my card', 'Hi, my last payment did not go through. Please send me a link to update my card.'),
    renew: portal ? { href: portal, ext: true } : out('Keep my membership', 'Hi, I cancelled but changed my mind. Please keep my membership going.'),
    pause: out('Pause my membership for a month', 'Hi, please pause my Phenom University membership for one month. Nothing should be charged while it is paused.'),
    resume: out('Resume my membership', 'Hi, please end my pause and start my Phenom University membership again.'),
    restart: out('Start my membership again', 'Hi, I would like to start my Phenom University membership again.'),
  };
}
const btn = (link, label, cls = 'secondary') => `<a class="btn ${cls}" href="${esc(link.href)}"${link.ext ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`;

function trialStrip(s) {
  const cells = Array.from({ length: 14 }, (_, i) => {
    const n = i + 1, cls = n < s.trialDay ? 'past' : n === s.trialDay ? 'today' : '';
    return `<span class="${cls}" title="Day ${n}">${n === s.trialDay ? n : ''}</span>`;
  }).join('');
  return `<div class="trial-strip" aria-label="Day ${s.trialDay} of 14"><div class="days">${cells}<span class="charge" title="First charge">$</span></div>
    <div class="ends"><span>Day 1 · ${shortDay(s.trialStart)}</span><span>Day 14 · ${shortDay(s.lastFreeDay)}</span><span class="c">${shortDay(s.trialEnd)}: first $${s.price}</span></div></div>`;
}

function day14(s) {
  return `<div class="day14">
    <span class="sticker">Day 14</span>
    <h3>What day 14 means</h3>
    <ul class="plain-list">
      <li>Your 14 free days run through <b>${day(s.lastFreeDay)}</b>.</li>
      <li>On <b>${day(s.trialEnd)}</b> your card is charged <b>$${s.price}</b>. After that, $${s.price} on the ${ordinal(s.trialEnd.getDate())} of each month.</li>
      <li>Cancel any time before ${shortDay(s.trialEnd)} and you pay nothing. It takes two taps in the billing page.</li>
      <li>Cancel or stay, the Prodigy Secrets library is yours to keep.</li>
    </ul>
  </div>`;
}

// The membership block: one color block, its words and buttons chosen by the state.
function planHTML(s) {
  if (!membership.loaded) return `<div class="block blue acct-plan"><span class="eyebrow blue">Membership</span><h2>Checking your membership…</h2><p class="muted">One moment.</p></div>`;
  const L = billingLinks(s.email);
  const name = s.plan === 'instructor' ? 'Instructor account' : 'Phenom University';
  const head = (color, chip) => `<span class="eyebrow ${color === 'yellow' ? 'orange' : color}">Membership</span><div class="plan-head"><h2>${name}</h2><span class="status-chip ${color}">${chip}</span></div>`;
  const keep = s.keepsLibrary ? `<p>The Prodigy Secrets library stays yours: every stage, on paper. <a class="link-arrow" href="#/library">Open the library</a></p>` : '';
  const note = `<p class="small muted acct-fine">Billing, receipts and cancelling happen on a secure Stripe page. Cancelling stops the next charge; you keep everything until the end of the time you have.</p>`;
  switch (s.status) {
    case 'trialing': {
      if (!s.trialEnd) return `<div class="block blue acct-plan">${head('blue', 'Test drive')}<p class="lede">Your 14 free days are running. The first $${s.price} charge comes when they end.</p><div class="btn-row">${btn(L.manage, 'Manage billing', 'blue')}${btn(L.pause, 'Pause for a month')}${btn(L.cancel, 'Cancel membership')}</div>${note}</div>`;
      if (s.cancelAt) return `<div class="block blue acct-plan">${head('blue', 'Test drive · cancelled')}
        <p class="lede">Your test drive ends <b>${day(s.cancelAt)}</b>. You will not be charged.</p>
        <p>Everything stays open until then.</p>${keep}
        <div class="btn-row">${btn(L.renew, 'Keep my membership', 'blue')}${btn(L.manage, 'Billing page')}</div></div>`;
      if (s.trialOver) return `<div class="block blue acct-plan">${head('blue', 'Test drive over')}
        <p class="lede">Your free days ended on ${day(s.lastFreeDay)}. Your billing page shows the first charge.</p>
        <div class="btn-row">${btn(L.manage, 'Manage billing', 'blue')}${btn(L.pause, 'Pause for a month')}${btn(L.cancel, 'Cancel membership')}</div>${note}</div>`;
      return `<div class="block blue acct-plan">${head('blue', `Test drive · day ${s.trialDay} of 14`)}
        <p class="lede">Free through <b>${day(s.lastFreeDay)}</b>. ${s.daysLeft === 1 ? 'Today is your last free day.' : `${s.daysLeft} free days left.`}</p>
        ${trialStrip(s)}${day14(s)}
        <div class="btn-row">${btn(L.manage, 'Manage billing', 'blue')}${btn(L.pause, 'Pause for a month')}${btn(L.cancel, 'Cancel before day 14')}</div>${note}</div>`;
    }
    case 'active': {
      if (s.cancelAt) return `<div class="block green acct-plan">${head('green', 'Cancelled')}
        <p class="lede">Everything stays open until <b>${day(s.cancelAt)}</b>, then stops. No more charges.</p>${keep}
        <div class="btn-row">${btn(L.renew, 'Keep my membership', 'blue')}${btn(L.manage, 'Billing page')}</div></div>`;
      // The instructor's free year is part of the $297 certification: nothing renews or bills until it ends.
      if (s.plan === 'instructor') return `<div class="block green acct-plan">${head('green', 'Free year')}
        <p class="lede">${s.periodEnd ? `Your free year runs until <b>${day(s.periodEnd)}</b>.` : 'Your free year is running.'} After that it renews at the member rate, $${s.price} a month, and you can stop any time.</p>
        <div class="btn-row">${btn(L.manage, 'Receipts')}<a class="btn secondary" href="#/instructors">The directory</a></div></div>`;
      return `<div class="block green acct-plan">${head('green', 'Active')}
        <p class="lede">${s.periodEnd ? `$${s.price} a month. Next charge: <b>${day(s.periodEnd)}</b>.` : `$${s.price} a month.`}</p>
        <div class="btn-row">${btn(L.manage, 'Manage billing', 'blue')}${btn(L.pause, 'Pause for a month')}${btn(L.cancel, 'Cancel membership')}</div>${note}</div>`;
    }
    case 'past_due': return `<div class="block red acct-plan">${head('red', 'Payment missed')}
        <p class="lede">Your last payment did not go through. Update your card and nothing is lost.</p>
        <p>Stripe tries the card again over the next few days. Everything stays open while it does.</p>
        <div class="btn-row">${btn(L.card, 'Update my card', 'red')}${btn(L.cancel, 'Cancel membership')}</div></div>`;
    case 'paused': return `<div class="block yellow acct-plan">${head('yellow', 'Paused')}
        <p class="lede">Paused. Nothing is charged while it rests.${s.pausedUntil ? ` It starts again on <b>${day(s.pausedUntil)}</b>.` : ''}</p>${keep}
        <div class="btn-row">${btn(L.resume, 'Start again now', 'blue')}${btn(L.manage, 'Billing page')}${btn(L.cancel, 'Cancel membership')}</div></div>`;
    case 'canceled': return `<div class="block purple acct-plan">${head('purple', 'Ended')}
        <p class="lede">Your membership has ended. Nothing more is charged.</p>${keep}
        <div class="btn-row">${btn(L.restart, 'Start again', 'blue')}${btn(L.manage, 'Receipts')}</div></div>`;
  }
  // No membership row.
  if (!auth.user && !s.preview) return `<div class="block yellow acct-plan">${head('yellow', 'Not signed in')}
      <p class="lede">Sign in with the email you used at checkout. Your membership and every child's progress come with it.</p>
      <div class="btn-row"><a class="btn blue" href="#/start/signin">Email me a sign-in link →</a></div></div>`;
  return `<div class="block yellow acct-plan">${head('yellow', 'No membership')}
      <p class="lede">We do not see a membership for ${s.email ? `<b>${esc(s.email)}</b>` : 'this account'}.</p>
      <p>Paid with a different email? Sign in with that one, or email us and we will link them.</p>
      <div class="btn-row"><a class="btn blue" href="${JOIN_URL}">Start with a free abacus kit</a>${btn({ href: mailto(SUPPORT_EMAIL, 'Link my membership', `Hi, I paid with a different email. Please link my membership to ${s.email}.\n\nThe email I paid with: `) }, 'Email us')}</div></div>`;
}

// "What you own": one line per thing, from the purchases row (kit, Playbook) and the memberships row.
function uniState(s) {
  switch (s.status) {
    case 'trialing':
      if (s.cancelAt) return ['blue', 'Test drive, cancelled', `Open until ${shortDay(s.cancelAt)}. No charge.`];
      if (s.trialOver || !s.trialDay) return ['blue', 'Test drive', 'Your billing page shows the first charge.'];
      return ['blue', `Test drive · day ${s.trialDay} of 14`, `Free through ${shortDay(s.lastFreeDay)}.`];
    case 'active':
      if (s.cancelAt) return ['green', 'Cancelled', `Open until ${shortDay(s.cancelAt)}.`];
      if (s.plan === 'instructor') return ['green', 'Free year', s.periodEnd ? `Runs until ${shortDay(s.periodEnd)}.` : 'Comes with your certificate.'];
      return ['green', 'Active', s.periodEnd ? `Next charge ${shortDay(s.periodEnd)}.` : `$${s.price} a month.`];
    case 'past_due': return ['red', 'Payment missed', 'Update your card below.'];
    case 'paused': return ['yellow', 'Paused', s.pausedUntil ? `Starts again ${shortDay(s.pausedUntil)}.` : 'Nothing is charged.'];
    case 'canceled': return ['purple', 'Ended', s.keepsLibrary ? 'The library is yours to keep.' : 'Nothing more is charged.'];
  }
  return null;
}
function ownedHTML(s) {
  const head = `<div class="section-head"><span class="eyebrow">Yours</span><h2>What you own</h2></div>`;
  if (!membership.loaded) return `<section class="section acct-own">${head}<p class="muted">Checking…</p></section>`;
  const row = (title, meta, extra = '', chip = '') => `<li><span class="ix">✓</span><div><b>${title}</b>${chip}<div class="meta">${meta}</div>${extra}</div></li>`;
  const items = [];
  if (s.kit) items.push(row('Abacus kit', `The abacus and the welcome card.${s.kitPaidAt ? ` Ordered ${shortDay(s.kitPaidAt)}.` : ''}`));
  if (membership.can('playbook')) items.push(row('Child Prodigy Secrets Playbook',
    s.boughtPlaybook ? 'The book in your box, the audiobook, and a copy to read here.' : 'Comes with your membership. Read it here.',
    '<a class="link-arrow own-go" href="#/playbook">Open the Playbook</a>'));
  const uni = uniState(s);
  if (uni) items.push(row('Child Phenom University', uni[2], '', ` <span class="status-chip ${uni[0]}">${uni[1]}</span>`));
  if (s.status !== 'none' && s.plan === 'instructor') items.push(row('Certified Phenom Instructor', 'Your listing in the instructor directory.', '<a class="link-arrow own-go" href="#/instructors">The directory</a>'));
  if (items.length) return `<section class="section acct-own">${head}<ul class="lesson-list own-list">${items.join('')}</ul></section>`;
  const none = !auth.user && !s.preview
    ? 'Sign in with the email you ordered with. What you bought shows up here.'
    : `We do not see an order for ${s.email ? `<b>${esc(s.email)}</b>` : 'this account'}. Ordered with another email? Sign in with that one.`;
  return `<section class="section acct-own">${head}<p class="own-none">${none}</p></section>`;
}

function perksHTML(s) {
  const lib = membership.can('library'), sheets = membership.can('handouts');
  const row = (ix, title, meta, href, on, label) => `<li class="${on ? 'done' : ''}"><span class="ix">${ix}</span><div><a href="${href}">${title}</a><div class="meta">${meta}</div></div><a class="btn sm ${on ? 'secondary' : 'ghost'} go" href="${href}">${label}</a></li>`;
  return `<section class="section acct-sec">
    <div class="section-head"><span class="eyebrow">What comes with it</span><h2>Your member library</h2></div>
    <ul class="lesson-list">
      ${row(lib ? '✓' : '1', 'Prodigy Secrets library', 'All 10 stages on paper, every lesson and boss. Yours to keep, even if you cancel.', '#/library', lib, lib ? 'Open' : 'See it')}
      ${row(sheets ? '✓' : '2', 'Practice handouts', 'A fresh, checked sheet for any lesson, printed on demand.', '#/library', sheets, sheets ? 'Print one' : 'See it')}
      ${row('3', 'Every child in the house', 'One membership covers them all. Each child gets a profile, a chart and badges.', '#/family', s.member, 'Family')}
      ${s.plan === 'instructor' ? row('4', 'Your directory listing', 'Where parents find Certified Phenom Instructors.', '#/instructors', true, 'Directory') : ''}
    </ul></section>`;
}

function childrenHTML() {
  const kids = store.profiles();
  return `<section class="section acct-sec">
    <div class="section-head"><span class="eyebrow">Children</span><h2>${kids.length ? `${kids.length} ${kids.length === 1 ? 'child' : 'children'} on this account` : 'No children yet'}</h2><p>${auth.user ? 'These follow you to every device you sign in on.' : 'Saved on this device. Sign in to keep them on every device.'}</p></div>
    ${kids.length ? `<ul class="lesson-list">${kids.map(x => `<li><span class="ix">${esc(x.name[0] || '?')}</span><div><b>${esc(x.name)}</b><div class="meta">age ${x.age} · level ${levelFromXP(x.xp).level} · ${Object.values(x.lessons).filter(l => l.done).length} lessons done${x.streak ? ` · ${x.streak}-day streak` : ''}</div></div><a class="btn sm ghost go" href="#/family">Edit</a></li>`).join('')}</ul>` : ''}
    <div class="btn-row"><a class="btn blue" href="#/start">+ Add a child</a><a class="btn secondary" href="#/family">Manage children</a></div>
  </section>`;
}

function whoHTML() {
  const u = auth.user;
  if (!u && membership.demo) return `<div class="acct-who"><span class="ix">D</span><div><b>${esc(membership.state().email)}</b><div class="meta">Demo family (?demo=${esc(membership.demo)}) · localhost only, not signed in</div></div></div>`;
  if (u) return `<div class="acct-who"><span class="ix">${esc(u.email[0].toUpperCase())}</span><div><b>${esc(u.email)}</b><div class="meta"><span class="sync-dot ${auth.lastError ? 'off' : ''}" aria-hidden="true"></span>Parent account · signed in on this device</div></div><button class="btn sm secondary" id="acct-signout">Sign out</button></div>`;
  if (!auth.enabled || auth.offline) return `<div class="acct-who"><span class="ix">?</span><div><b>Accounts are off right now</b><div class="meta">Progress saves on this device. Billing still works through the buttons below.</div></div></div>`;
  return `<div class="acct-who"><span class="ix">?</span><div><b>Not signed in</b><div class="meta">Use the email you paid with.</div></div><a class="btn sm blue" href="#/start/signin">Sign in</a></div>`;
}

// Localhost only: try every membership state without a real payment.
const PRESETS = [
  ['Test drive, day 3', { status: 'trialing', trial_end: fromToday(12) }],
  ['Test drive, day 14', { status: 'trialing', trial_end: fromToday(1) }],
  ['Test drive, cancelled', { status: 'trialing', trial_end: fromToday(9), cancel_at: fromToday(9) }],
  ['Active', { status: 'active', current_period_end: fromToday(20) }],
  ['Active, cancelled', { status: 'active', current_period_end: fromToday(20), cancel_at: fromToday(20) }],
  ['Payment missed', { status: 'past_due', current_period_end: fromToday(-2) }],
  ['Paused', { status: 'paused', paused_until: fromToday(25) }],
  ['Ended, keeps library', { status: 'canceled', keeps_library: true }],
  ['Instructor year', { status: 'active', plan: 'instructor', current_period_end: fromToday(300) }],
  ['No membership', null],
];
function previewHTML() {
  if (!isLocal) return '';
  const cur = membership.preview ? JSON.stringify(membership.row) : 'off';
  return `<section class="section acct-sec dev-panel"><div class="try-box">
    <span class="eyebrow">Localhost only · not on the live site</span>
    <h3>Preview a membership state</h3>
    <p class="small muted">Stands in for the <code>memberships</code> row so the account page, the library and the print pages can be checked without a payment. ${membership.setupMissing ? '<b>The memberships table is not on the server yet</b> (apply <code>supabase/memberships.sql</code>). ' : ''}${STRIPE_PORTAL_URL ? '' : '<b>[HUNTER] STRIPE_PORTAL_URL is empty in js/config.js</b>, so the billing buttons open an email to support. '}</p>
    <div class="btn-row">${PRESETS.map(([label], i) => `<button class="btn sm secondary" data-preset="${i}">${label}</button>`).join('')}<button class="btn sm ghost" data-preset="off">Use the real account</button></div>
    <p class="small faint" style="margin:0">Now: ${esc(cur)}${membership.demo ? ` · <b>?demo=${esc(membership.demo)} is on</b>: it wins while nobody is signed in. Take it out of the address to use these buttons.` : ''}</p>
    <p class="small faint" style="margin:6px 0 0">Whole family without a session: add <code>?demo=member</code>, <code>?demo=playbook</code> or <code>?demo=kit</code> before the <code>#</code>.</p>
  </div></section>`;
}

export function account(app) {
  const s = membership.state();
  const el = h(`<div class="acct">
    ${crumbs('<a href="#/">Home</a>', 'Account')}
    <section class="page-head acct-head"><div>
      <span class="eyebrow blue">Account &amp; billing</span>
      <h1>Your account</h1>
      <p class="lede">Your membership, your children, and the buttons to change, pause or cancel. No phone call needed.</p>
    </div></section>
    ${whoHTML()}
    ${ownedHTML(s)}
    <section class="section" style="margin-top:28px">${planHTML(s)}</section>
    ${membership.error && !membership.preview ? tip(`We could not check your membership just now (${esc(membership.error)}). Try again in a minute.`, 'warn', 'Heads up') : ''}
    ${perksHTML(s)}
    ${childrenHTML()}
    <section class="section acct-sec"><div class="section-head"><span class="eyebrow">Questions</span><h2>Need a hand?</h2><p>Email <a href="${mailto(SUPPORT_EMAIL, 'Question about my account')}">${SUPPORT_EMAIL}</a>.</p></div></section>
    ${previewHTML()}
  </div>`);
  app.appendChild(el);
  const out = el.querySelector('#acct-signout');
  if (out) out.onclick = async () => { out.disabled = true; out.textContent = 'Signing out…'; await auth.signOut(); toast('Signed out. Progress stays on this device.'); };
  el.querySelectorAll('[data-preset]').forEach(b => b.onclick = () => {
    if (b.dataset.preset === 'off') return membership.setPreview(undefined);
    const [, row] = PRESETS[Number(b.dataset.preset)];
    membership.setPreview(row && { email: auth.user?.email || 'preview-parent@example.com', plan: 'university', keeps_library: true, ...row });
  });
}

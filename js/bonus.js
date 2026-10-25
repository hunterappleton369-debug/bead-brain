// bonus.js — #/bonus: the two bonus guides that come with Child Phenom University (free-abacus/university.html).
//   #/bonus                          both covers, one line each
//   #/bonus/valedictorian[/<n>]      Valedictorian Secrets, one chapter at a time (js/reader.js)
//   #/bonus/future[/<n>]             Win the Future: The Career-Picking Guide
// Who may open them: ACCESS.bonus in js/membership.js (members, past members who keep the library, instructors).
// The pages are library/bonus-valedictorian.json and library/bonus-future.json, built by tools/build-members.mjs
// from docs/products/bonus-guides/. Print rules: css/members.css (body.printing-book).
import { h, esc, tip, crumbs } from './ui.js';
import { membership } from './membership.js';
import { memberGate, loadBook } from './library.js';
import { readBook } from './reader.js';
import { UNIVERSITY_URL } from './config.js';

export const BONUS_GUIDES = [
  { slug: 'valedictorian', id: 'bonus-valedictorian', title: 'Valedictorian Secrets', cover: 'img/funnel/valedictorian.webp', color: 'blue',
    line: 'What the top 1% of parents do differently, from week one of school.' },
  { slug: 'future', id: 'bonus-future', title: 'Win the Future', cover: 'img/funnel/career.webp', color: 'orange',
    line: 'How to spot and feed the talent your child already has.' },
];
const ROUTE = '#/bonus';
const HOME = '<a href="#/">Home</a>';

const coversHTML = () => `<div class="bonus-fan">${BONUS_GUIDES.map(g => `<img class="pb-cover" src="${g.cover}" alt="${esc(g.title)}">`).join('')}</div>`;
// What a non-member sees under the lock: the two titles.
const previewHTML = () => `<section class="section"><div class="section-head"><span class="eyebrow">Inside</span><h2>Two guides for parents</h2><p>Short chapters you can read in a few minutes. Each one ends with what to do tonight.</p></div>
  <ul class="lesson-list">${BONUS_GUIDES.map(g => `<li><img class="bonus-mini" src="${g.cover}" alt="" width="40" height="52" loading="lazy"><div><b>${g.title}</b><div class="meta">${g.line}</div></div></li>`).join('')}</ul></section>`;

function gate(app, trail) {
  return memberGate(app, 'bonus', trail, {
    title: 'The bonus guides come with Phenom University.',
    signedOut: 'Already a member? Sign in with the email you used at checkout and they open.',
    art: coversHTML(),
    preview: previewHTML(),
    cta: { href: UNIVERSITY_URL, label: 'Start the free test drive' },
  });
}

const chip = () => { const s = membership.state(); return `<p class="lib-status"><span class="status-chip ${s.member ? 'green' : 'purple'}">${s.member ? 'With your membership' : 'Yours to keep'}</span>${s.preview ? '<span class="status-chip">Preview</span>' : ''} <a href="#/bonus">Both guides</a></p>`; };

export function bonus(app, slug, n) {
  if (!slug) return bonusIndex(app);
  const g = BONUS_GUIDES.find(x => x.slug === slug);
  if (!g) { app.appendChild(h(`<div class="try-box"><h2>No guide here</h2><a class="btn blue" href="${ROUTE}">The bonus guides</a></div>`)); return; }
  if (!gate(app, [`<a href="${ROUTE}">Bonus guides</a>`, g.title])) return;
  readBook(app, {
    id: g.id, route: `${ROUTE}/${g.slug}`, trail: [HOME, `<a href="${ROUTE}">Bonus guides</a>`], crumb: g.title, noun: 'This guide',
    eyebrow: 'Bonus guide', color: g.color, title: doc => esc(doc.title || g.title), barTitle: g.title,
    lede: doc => esc(doc.subtitle || g.line), cover: doc => doc.cover || g.cover, chip,
    introOnIndex: true,
    rowMeta: p => (p.no ? `Chapter ${p.no}` : 'At the back of the guide'),
    tip: tip('Pick one habit. Run it for two weeks. Then add the next one.', 'parent', 'Parent tip'),
    printAllLabel: 'Print the whole guide',
    loading: `Loading ${g.title}…`,
    failed: `${g.title} did not load. Check the connection and try again.`,
  }, n);
}

function bonusIndex(app) {
  if (!gate(app, ['Bonus guides'])) return;
  const el = h(`<div class="bonus-page">
    ${crumbs(HOME, 'Bonus guides')}
    <section class="page-head"><div>
      <span class="eyebrow blue">Bonus guides</span>
      <h1>Two guides for parents</h1>
      <p class="lede">Read them here, one short chapter at a time. Print any page you want on the fridge.</p>
      ${chip()}
    </div></section>
    <div class="bonus-grid">${BONUS_GUIDES.map(g => `<a class="bonus-card" href="${ROUTE}/${g.slug}">
        <img class="pb-cover" src="${g.cover}" alt="${esc(g.title)} cover">
        <b>${g.title}</b>
        <span class="line" data-line="${g.slug}">${g.line}</span>
        <span class="link-arrow">Read it</span>
      </a>`).join('')}</div>
    ${tip('Start with Valedictorian Secrets. It has the habits you can begin tonight.', 'parent', 'Parent tip')}
  </div>`);
  app.appendChild(el);
  // The guide's own subtitle, once its pages are here (the line above is the same words until then).
  for (const g of BONUS_GUIDES) loadBook(g.id).then(doc => { const sp = el.querySelector(`[data-line="${g.slug}"]`); if (sp && doc.subtitle) sp.textContent = doc.subtitle; }).catch(() => {});
}

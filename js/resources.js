// resources.js — #/resources: everything a family owns, or can own, in one place. A bookshelf: one picture per
// resource with its name under it (the way a Kindle library looks), what is open drawn in full and what is not
// drawn grey with a lock. Above the shelf, the one thing to do next. Every picture is the real render of the
// product; a locked picture leads to that product's own page, which says what it comes with.
// Who may open what comes from js/membership.js (ACCESS); the kit and Playbook rows from the purchases table.
// The three images under img/resources/ are cut from the funnel's stack renders (img/funnel/ubundle.webp and
// cbundle.webp) with tools/cut-resource-images.sh.
import { h, esc, tip, crumbs, shortDay } from './ui.js';
import { icon } from './art.js';
import { auth } from './auth.js';
import { store } from './store.js';
import { membership, instructor } from './membership.js';
import { uniState } from './owned.js';
import { STAGES, lessonKey } from './curriculum.js';
import { hasAudio } from './playbook.js';
import { UNIVERSITY_URL, JOIN_URL, CERTIFY_URL, MEMBER_PRICE, PLAYBOOK_PRICE, SUPPORT_EMAIL } from './config.js';

const ROUTE = '#/resources';

// The shelves. `feature` is the ACCESS key that opens the tile (none = open to everyone); `locked` is the one line
// under a grey tile. `href` may be a function of the membership state.
const SHELVES = [
  { key: 'start', eyebrow: 'green', title: 'Your Starter Kit', lede: 'The box, and the three nights that start before it lands.' },
  { key: 'university', eyebrow: 'blue', title: 'Child Phenom University', lede: 'Stages 2 to 10 in the trainer, the whole program on paper, fresh practice sheets and two guides for you.' },
  { key: 'instructor', eyebrow: 'orange', title: 'Certified Phenom Instructor', lede: 'The course, the Launch Kit and your certificate.' },
];
const TILES = [
  { key: 'quickstart', shelf: 'start', title: '3-Night Quick-Start', line: 'Your first three nights with the beads, on the screen abacus tonight.',
    img: 'img/funnel/kitbox-v6-800.webp', alt: 'The Child Prodigy Starter Kit, open', href: '#/quickstart' },
  { key: 'playbook', shelf: 'start', title: 'Child Prodigy Secrets Playbook', line: 'The book, and the audiobook to listen to on the school run.',
    img: 'img/funnel/playbook.webp', alt: 'Child Prodigy Secrets Playbook', portrait: true, href: '#/playbook', feature: 'playbook',
    locked: `The $${PLAYBOOK_PRICE} add-on on the kit order form` },
  { key: 'trainer', shelf: 'university', title: 'The Trainer: Stages 2 to 10', line: 'Every lesson, drill, quest and boss, picked and graded for you.',
    img: 'img/funnel/university.webp', alt: 'Child Phenom University on a laptop, a tablet and a phone', href: trainerHref, feature: 'stages', locked: 'Opens with the free 14-day test drive' },
  { key: 'library', shelf: 'university', title: 'Prodigy Secrets Program', line: 'All 10 stages on paper: every lesson, quest card and boss, ready to print.',
    img: 'img/resources/prodigy-secrets-program.webp', alt: 'The Prodigy Secrets Program box set', href: '#/library', feature: 'library', locked: 'Comes with University. Yours to keep, even if you cancel.' },
  { key: 'handouts', shelf: 'university', title: 'Practice Handouts', line: 'A fresh, checked 20-problem sheet for any lesson, printed when you need it.',
    img: 'img/funnel/worksheets.webp', alt: 'A binder of practice worksheets', href: '#/library', feature: 'handouts', locked: 'Comes with a running membership' },
  { key: 'valedictorian', shelf: 'university', title: 'Valedictorian Secrets', line: 'What the top 1% of parents do differently, from week one of school.',
    img: 'img/funnel/valedictorian.webp', alt: 'Valedictorian Secrets', portrait: true, href: '#/bonus/valedictorian', feature: 'bonus', locked: 'Bonus guide with University' },
  { key: 'future', shelf: 'university', title: 'Win the Future', line: 'The career-picking guide: spot and feed the talent your child already has.',
    img: 'img/funnel/career.webp', alt: 'Win the Future', portrait: true, href: '#/bonus/future', feature: 'bonus', locked: 'Bonus guide with University' },
  { key: 'course', shelf: 'instructor', title: 'Certification Course', line: '20 lessons over six weeks, then the test. Go at your own pace.',
    img: 'img/resources/certification-course.webp', alt: 'The Certification Course binder', href: '#/course', feature: 'course', locked: 'Comes with certification' },
  { key: 'launch-kit', shelf: 'instructor', title: 'Instructor Launch Kit', line: 'Class plans, drills, a price sheet, a parent flyer and more, ready to print.',
    img: 'img/resources/instructor-launch-kit.webp', alt: 'The Instructor Launch Kit box', href: '#/kit', feature: 'kit', locked: 'Comes with certification' },
  { key: 'certificate', shelf: 'instructor', title: 'Your Certificate', line: 'Certified Phenom Instructor, with your name on it and a place in the directory.',
    img: 'img/funnel/certificate.webp', alt: 'A framed Certified Phenom Instructor certificate and medal', href: s => (s.certified ? '#/certificate' : '#/exam'), feature: 'certificate',
    locked: s => (membership.can('exam') ? 'Yours when you pass the test' : 'Comes with certification') },
];
function trainerHref() {
  const p = store.profile;
  if (!p) return '#/stage/2';
  const cur = STAGES.find(s => !p.bosses[s.n]?.passed) || STAGES[STAGES.length - 1];
  return `#/stage/${Math.max(2, cur.n)}`;
}
const val = (v, s) => (typeof v === 'function' ? v(s) : v);

// ───────── the next step ─────────
// One thing, chosen from what they own and what is done: [eyebrow, title, line, button label, href].
function nextStep(s) {
  const signedIn = !!(auth.user || s.preview || s.demo);
  const p = store.profile;
  const done = p ? Object.values(p.lessons).filter(l => l.done).length : 0;
  if (!signedIn && auth.enabled && !auth.offline) return ['Start here', 'Sign in to open what you bought', 'Use the email you ordered with. We email you a link; no password. Night 1 works without it.', 'Email me a sign-in link', '#/start/signin'];
  if (!p) return ['Start here', "Make your child's profile", 'Thirty seconds: a first name and an age. It keeps the streak, the badges and the Bead Score chart.', 'Make a profile', '#/start'];
  if (done === 0) return ['Tonight', 'Do Night 1 on the screen abacus', `Ten minutes, beside ${esc(p.name)}. See it, move it, say it. The box can arrive next week.`, 'Open Night 1', '#/quickstart'];
  if (instructor(s) && !s.certified) return ['Your course', 'Start the next course lesson', 'Twenty lessons, then the test. Your certificate is ready the day you pass.', 'Open the course', '#/course'];
  const cur = STAGES.find(st => !p.bosses[st.n]?.passed) || STAGES[STAGES.length - 1];
  const next = cur.lessons.find(l => !p.lessons[lessonKey(cur, l)]?.done);
  if (cur.n > 1 && !membership.can('stages')) return ['Next', `${esc(p.name)} finished Stage 1`, `Stage 2 opens with Child Phenom University. Free for 14 days, then $${MEMBER_PRICE} a month. Cancel from your account page.`, 'Start the free test drive', UNIVERSITY_URL];
  if (next) return ['Up next', esc(next.title), `Stage ${cur.n} · ${esc(cur.name)}, about ${next.minutes} minutes. Sit beside, not across.`, 'Continue', `#/stage/${cur.n}/lesson/${next.key}`];
  return ['Up next', `${esc(cur.boss.title)}`, `Every ${esc(cur.name)} lesson is done. Beat the boss to earn the badge and open Stage ${Math.min(10, cur.n + 1)}.`, 'Fight the boss', `#/stage/${cur.n}/boss`];
}

// ───────── one tile ─────────
function tileHTML(t, s) {
  const checking = !!t.feature && !membership.loaded && (auth.user || (auth.enabled && !auth.ready));
  const open = !t.feature || membership.can(t.feature);
  const href = val(t.href, s);
  const sub = open ? t.line : checking ? 'Checking what you own…' : val(t.locked, s);
  const badge = open ? (t.feature ? '<span class="badge own" title="Yours">✓</span>' : '') : checking ? '' : `<span class="badge lock" title="Not open yet">${icon('lock', 'ic')}</span>`;
  let extra = '';
  if (t.key === 'quickstart' && s.kit) extra = `<span class="tag green">Kit ordered${s.kitPaidAt ? ` ${shortDay(s.kitPaidAt)}` : ''}</span>`;
  if (t.key === 'playbook' && open) extra = `<span class="tag" data-audio hidden>Audiobook inside</span>`;
  if (t.key === 'trainer' && open) { const u = uniState(s); if (u) extra = `<span class="tag ${u[0]}">${u[1]}</span>`; }
  if (t.key === 'certificate' && s.certified) extra = `<span class="tag green">${esc(s.cert.cert_id || 'Passed')}</span>`;
  return `<a class="res-tile ${open ? 'open' : checking ? 'checking' : 'locked'} ${t.portrait ? 'portrait' : ''}" href="${href}" data-tile="${t.key}">
    <span class="pic"><img src="${t.img}" alt="${esc(t.alt)}" loading="lazy">${badge}</span>
    <span class="t">${t.title}</span>
    <span class="m">${sub}</span>${extra}
  </a>`;
}

function shelfHTML(shelf, s) {
  const tiles = TILES.filter(t => t.shelf === shelf.key);
  const opened = tiles.filter(t => !t.feature || membership.can(t.feature)).length;
  const allLocked = membership.loaded && opened === 0;
  // A shelf nothing on it is open: one button to what opens it.
  let cta = '';
  if (shelf.key === 'university' && allLocked) cta = `<a class="btn sm blue" href="${UNIVERSITY_URL}">Start the free 14-day test drive</a>`;
  if (shelf.key === 'instructor' && allLocked) cta = `<a class="btn sm secondary" href="${CERTIFY_URL}">How certification works</a>`;
  if (shelf.key === 'start' && membership.loaded && !s.kit && !membership.can('playbook')) cta = `<a class="btn sm secondary" href="${JOIN_URL}">Get the free Starter Kit</a>`;
  const count = membership.loaded ? `<span class="res-count">${opened} of ${tiles.length} open</span>` : '';
  return `<section class="res-shelf ${allLocked ? 'all-locked' : ''}" id="res-${shelf.key}">
    <div class="res-shelf-head"><div><span class="eyebrow ${shelf.eyebrow}">${shelf.title}</span><h2>${shelf.title}</h2><p>${shelf.lede}</p></div><div class="res-shelf-cta">${count}${cta}</div></div>
    <div class="res-grid">${tiles.map(t => tileHTML(t, s)).join('')}</div>
  </section>`;
}

// ───────── #/resources ─────────
export function resources(app) {
  const s = membership.state();
  const [eyebrow, title, line, label, href] = nextStep(s);
  const who = auth.user ? `Signed in as <b>${esc(auth.user.email)}</b>` : s.preview || s.demo ? `Preview family <b>${esc(s.email)}</b>` : 'Not signed in';
  const el = h(`<div class="res">
    ${crumbs('<a href="#/">Home</a>', 'Resources')}
    <section class="page-head res-head"><div>
      <span class="eyebrow blue">Everything in one place</span>
      <h1>Your resources</h1>
      <p class="lede">Every book, kit, course and guide you own, and the ones you can add. Tap a picture to open it.</p>
      <p class="lib-status">${who} · <a href="#/account">Account &amp; billing</a> · <a href="#/family">Family</a></p>
    </div></section>
    <section class="block green res-next" aria-labelledby="res-next-h">
      <div><span class="eyebrow green">${eyebrow}</span><h2 id="res-next-h">${title}</h2><p class="lede">${line}</p></div>
      <div class="res-next-go"><a class="btn big blue" href="${href}">${label} →</a></div>
    </section>
    ${SHELVES.map(sh => shelfHTML(sh, s)).join('')}
    ${tip('Everything here follows you to any device. Sign in on the tablet or at grandma\'s and it is all there.', 'parent', 'Parent note')}
    <p class="small muted res-help">Bought something that is not open? Sign in with the email you ordered with, or email <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a> and we will link it.</p>
  </div>`);
  app.appendChild(el);
  hasAudio().then(ok => { if (ok && el.isConnected) el.querySelectorAll('[data-audio]').forEach(x => { x.hidden = false; }); }).catch(() => {});
}

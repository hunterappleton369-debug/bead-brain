// playbook.js — #/playbook: Child Prodigy Secrets Playbook, the $27 add-on on the free-abacus order form (the printed
// book ships in the box; this is the digital copy and the audiobook). Free for Child Phenom University members.
//   #/playbook        the audiobook, the chapter list, "Print the whole Playbook"
//   #/playbook/<n>    one page (a chapter, or one of the two pages at the back), readable on a phone
// Who may open it: ACCESS.playbook in js/membership.js. The pages are library/playbook.json, built from
// docs/products/playbook.md by tools/build-members.mjs (step 4). Print rules: css/members.css (body.printing-book).
import { h, esc, tip, crumbs } from './ui.js';
import { icon } from './art.js';
import { auth } from './auth.js';
import { membership } from './membership.js';
import { loadBook, printOne } from './library.js';
import { JOIN_URL, PLAYBOOK_AUDIO_URL, PLAYBOOK_PRICE } from './config.js';

const ROUTE = '#/playbook';
// The pages a parent reads one at a time: the chapters and the two pages at the back. The title page and the
// copyright page only print, with "Print the whole Playbook".
const readable = doc => doc.sections.filter(s => s.kind === 'chapter' || s.kind === 'appendix');
const short = s => (s.no ? `Chapter ${s.no}` : s.title);

// ───────── the gate ─────────
function gate(app) {
  if (membership.can('playbook')) return true;
  const s = membership.state();
  const signedIn = !!(auth.user || s.preview);
  let body;
  if (!membership.loaded) body = `<span class="eyebrow blue">The Playbook</span><h2>Checking what you own…</h2><p class="muted">One moment.</p>`;
  else {
    const signin = `<p class="pb-signin"><a class="link-arrow" href="#/start/signin" id="pb-signin">Already bought it? Sign in with the email you ordered with</a></p>`;
    const buy = `<div class="btn-row"><a class="btn blue" href="${JOIN_URL}">Get the free abacus kit</a></div>`;
    body = `<span class="eyebrow blue">The Playbook</span>
      <h2>The Playbook comes with the kit</h2>
      <p class="lede">It is the $${PLAYBOOK_PRICE} add-on on the free abacus order form.</p>
      ${signedIn ? buy + signin + (s.email ? `<p class="small muted pb-who">You are signed in as <b>${esc(s.email)}</b>.</p>` : '') : signin + buy}`;
  }
  const el = h(`<div>${crumbs('<a href="#/">Home</a>', 'Playbook')}
    <section class="section" style="margin-top:24px"><div class="block yellow split lib-lock pb-lock"><div>${body}</div><div class="lock-art"><img class="pb-cover" src="img/funnel/playbook.webp" alt="Child Prodigy Secrets Playbook">${icon('lock', 'ic')}</div></div></section></div>`);
  app.appendChild(el);
  // Signed in with another email: sign out first, so the sign-in page asks for the email they ordered with.
  const link = el.querySelector('#pb-signin');
  if (link && auth.user) link.onclick = async e => { e.preventDefault(); link.textContent = 'One moment…'; await auth.signOut(); location.hash = '#/start/signin'; };
  return false;
}

// ───────── the audiobook ─────────
function audioHTML(compact) {
  if (PLAYBOOK_AUDIO_URL) return `<section class="pb-audio${compact ? ' compact' : ''}">
      <span class="eyebrow green">Audiobook</span>
      ${compact ? '' : '<h3>Listen to the Playbook</h3>'}
      <audio controls preload="none" src="${esc(PLAYBOOK_AUDIO_URL)}">Your browser cannot play audio here.</audio>
      ${compact ? '' : '<p class="small muted">Good for the car or the school run.</p>'}
    </section>`;
  if (compact) return '';
  return `<section class="pb-audio">
      <span class="eyebrow green">Audiobook</span>
      <p>The audiobook is not ready yet. When it is, it plays right here.</p>
    </section>`;
}

// Every page of the book, for printing. On screen only the page marked .on shows (none on the chapter list).
function pagesHTML(doc, on) {
  return `<div class="book-body pb-pages">${doc.sections.map((s, i) => `<section class="lib-page pb-page kind-${s.kind}${s === on ? ' on' : ''}" id="pb-p${i}">
      ${s === on ? `<div class="lib-tools"><span class="lbl">${esc(short(s))}</span><button class="btn sm secondary" data-print-one>Print this page</button><button class="btn sm ghost" data-print-all>Print the whole Playbook</button></div>` : ''}
      <div class="lib-doc">${s.html}</div></section>`).join('')}</div>`;
}

function printAll() {
  document.body.classList.add('pb-print-all');
  window.addEventListener('afterprint', () => document.body.classList.remove('pb-print-all'), { once: true });
  window.print();
}

// ───────── #/playbook and #/playbook/<n> ─────────
export function playbook(app, n) {
  if (!gate(app)) return;
  const s = membership.state();
  const el = h(`<div class="lib-book pb">${crumbs('<a href="#/">Home</a>', n ? `<a href="${ROUTE}">Playbook</a>` : 'Playbook', ...(n ? ['…'] : []))}<div class="pb-body"><p class="muted">Loading the Playbook…</p></div></div>`);
  const crumb = text => { el.querySelector('.crumbs > span:last-child').textContent = text; };
  app.appendChild(el);
  document.body.classList.add('printing-book');
  loadBook('playbook').then(doc => {
    if (!el.isConnected) return;
    const pages = readable(doc);
    const body = el.querySelector('.pb-body');
    if (!n) {
      const chapters = pages.filter(p => p.kind === 'chapter').length, back = pages.length - chapters;
      body.innerHTML = `<section class="page-head"><div>
          <span class="eyebrow purple">Child Prodigy Secrets</span>
          <img class="pb-cover pb-cover-top" src="img/funnel/playbook.webp" alt="">
          <h1>The Playbook</h1>
          <p class="lede">The parent's book for the abacus. Read a chapter here, print it, or listen.</p>
          <p class="lib-status"><span class="status-chip ${s.boughtPlaybook ? 'purple' : 'green'}">${s.boughtPlaybook ? 'Yours to keep' : 'With your membership'}</span>${s.preview ? '<span class="status-chip">Preview</span>' : ''} <a href="#/account">Your account</a></p>
        </div></section>
        ${audioHTML(false)}
        <div class="btn-row pb-start"><a class="btn blue" href="${ROUTE}/1">Start with Chapter 1 →</a><button class="btn secondary" data-print-all>Print the whole Playbook</button></div>
        <section class="section pb-list" style="margin-top:36px">
          <div class="section-head"><span class="eyebrow">Chapters</span><h2>${chapters} chapters${back ? `, ${back} ${back === 1 ? 'page' : 'pages'} at the back` : ''}</h2><p>Tap one to read it. One page at a time.</p></div>
          <ul class="lesson-list">${pages.map((p, i) => `<li><span class="ix">${p.no || '★'}</span><div><a href="${ROUTE}/${i + 1}">${esc(p.title)}</a><div class="meta">${p.no ? `Chapter ${p.no}` : 'At the back of the book'}</div></div><a class="btn sm secondary go" href="${ROUTE}/${i + 1}">Read</a></li>`).join('')}</ul>
        </section>
        ${tip('Read one chapter tonight. Do the first lesson tomorrow. The book is the map. The app is the road.', 'parent', 'Parent tip')}
        ${pagesHTML(doc, null)}`;
    } else {
      const i = Number(n) - 1, page = pages[i];
      if (!Number.isInteger(i) || !page) { body.innerHTML = `<div class="try-box"><h2>No page here</h2><p>The Playbook has ${pages.length} pages to read.</p><a class="btn blue" href="${ROUTE}">All chapters</a></div>`; crumb('Not found'); return; }
      crumb(short(page));
      const prev = pages[i - 1], next = pages[i + 1];
      body.innerHTML = `<div class="pb-bar"><span class="eyebrow purple">Child Prodigy Secrets · The Playbook</span><span class="faint small">Page ${i + 1} of ${pages.length}</span></div>
        ${audioHTML(true)}
        ${pagesHTML(doc, page)}
        <nav class="pb-nav" aria-label="Playbook pages">
          ${prev ? `<a class="btn secondary" href="${ROUTE}/${i}">← ${esc(short(prev))}</a>` : `<a class="btn secondary" href="${ROUTE}">← All chapters</a>`}
          ${next ? `<a class="btn blue" href="${ROUTE}/${i + 2}">${esc(short(next))} →</a>` : `<a class="btn blue" href="${ROUTE}">All chapters</a>`}
        </nav>
        ${next ? `<p class="center small pb-all"><a href="${ROUTE}">All chapters</a></p>` : ''}`;
      const on = body.querySelector('.pb-page.on');
      body.querySelector('[data-print-one]').onclick = () => printOne(on);
    }
    body.querySelectorAll('[data-print-all]').forEach(b => b.onclick = printAll);
  }).catch(e => {
    console.error(e);
    el.querySelector('.pb-body').innerHTML = '<p class="muted">The Playbook did not load. Check the connection and try again.</p>';
  });
}

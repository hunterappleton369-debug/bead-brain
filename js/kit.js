// kit.js — #/kit: the Instructor Launch Kit, everything for a first class, ready to print.
//   #/kit               the docs, for you and for parents (library/kit.json)
//   #/kit/<id>[/<n>]    one doc, one page at a time (library/kit-<id>.json, drawn by js/reader.js); a doc with
//                       one page opens straight on it
// Who may open it: ACCESS.kit in js/membership.js (the instructor year, or a certificate). Built by
// tools/build-members.mjs from docs/products/instructor-launch-kit/. Print rules: css/members.css.
import { h, esc, tip, crumbs } from './ui.js';
import { loadBook } from './library.js';
import { readBook } from './reader.js';
import { instructorGate } from './course.js';

const ROUTE = '#/kit';
const HOME = '<a href="#/">Home</a>';
const COURSE = '<a href="#/course">Course</a>';
const WHO = { instructor: 'For you', parent: 'For parents' };

export function kit(app, id, n) {
  if (!id) return kitIndex(app);
  if (!/^[a-z0-9-]+$/.test(id)) { app.appendChild(h(`<div class="try-box"><h2>Nothing here</h2><a class="btn blue" href="${ROUTE}">The Launch Kit</a></div>`)); return; }
  if (!instructorGate(app, 'kit', [COURSE, 'Launch Kit'])) return;
  // The doc's name for the crumbs comes from kit.json; the reader draws into this box once it is known.
  const box = h('<div></div>');
  app.appendChild(box);
  loadBook('kit').catch(() => null).then(index => {
    if (!box.isConnected) return; // they went somewhere else meanwhile
    const meta = index?.docs?.find(d => d.id === id);
    if (index?.docs && !meta) { box.innerHTML = `<div class="try-box" style="margin-top:24px"><h2>No doc here</h2><p>The Launch Kit has ${index.docs.length} docs.</p><a class="btn blue" href="${ROUTE}">The Launch Kit</a></div>`; return; }
    readBook(box, {
      id: `kit-${id}`, route: `${ROUTE}/${id}`, trail: [HOME, COURSE, `<a href="${ROUTE}">Launch Kit</a>`], crumb: esc(meta?.title || 'Kit page'), noun: 'This doc',
      eyebrow: 'Launch Kit', color: 'orange', title: doc => esc(doc.title), barTitle: doc => esc(doc.title),
      lede: doc => esc(doc.lede || ''), chip: doc => (doc.audience ? `<p class="lib-status"><span class="status-chip ${doc.audience === 'parent' ? 'yellow' : 'blue'}">${WHO[doc.audience] || 'For you'}</span> <a href="${ROUTE}">The whole kit</a></p>` : ''),
      readable: doc => doc.sections,
      short: (s, i) => { const t = String(s.title || ''), m = t.match(/^(Week \d+|Version [A-Z])\b/); return m ? m[1] : t.length <= 26 ? t : `Page ${i + 1}`; },
      rowIx: (p, i) => i + 1, rowMeta: (p, i) => `Page ${i + 1}`,
      listEyebrow: 'Pages', listTitle: pages => `${pages.length} ${pages.length === 1 ? 'page' : 'pages'}`, listLede: 'Tap one to read it. Print one page, or all of them.',
      allLabel: 'All pages', printAllLabel: 'Print all of it',
      single: true, up: ROUTE, upLabel: 'The Launch Kit',
      loading: 'Loading…', failed: 'This page did not load. Check the connection and try again.',
      cls: 'kit-doc',
    }, n);
  });
}

function kitIndex(app) {
  if (!instructorGate(app, 'kit', [COURSE, 'Launch Kit'])) return;
  const el = h(`<div class="kit-page">${crumbs(HOME, COURSE, 'Launch Kit')}<div class="kit-body"><p class="muted">Loading the Launch Kit…</p></div></div>`);
  app.appendChild(el);
  loadBook('kit').then(k => {
    if (!el.isConnected) return;
    const docs = k.docs || [];
    const row = (d, i) => `<li><span class="ix">${i + 1}</span><div><a href="${ROUTE}/${esc(d.id)}">${esc(d.title)}</a>${d.lede ? `<div class="lede-line">${esc(d.lede)}</div>` : ''}<div class="meta">${d.pages ? `${d.pages} ${Number(d.pages) === 1 ? 'page' : 'pages'}` : ''}</div></div><a class="btn sm secondary go" href="${ROUTE}/${esc(d.id)}">Open</a></li>`;
    const group = (aud, title, lede) => { const list = docs.filter(d => (d.audience || 'instructor') === aud); return list.length ? `<section class="section" style="margin-top:40px">
        <div class="section-head"><span class="eyebrow ${aud === 'parent' ? 'orange' : 'blue'}">${WHO[aud]}</span><h2>${title}</h2><p>${lede}</p></div>
        <ul class="lesson-list kit-list">${list.map(row).join('')}</ul></section>` : ''; };
    el.querySelector('.kit-body').innerHTML = `<section class="page-head"><div>
        <span class="eyebrow orange">Instructor Launch Kit</span>
        <h1>Your first class, ready to print</h1>
        <p class="lede">${docs.length} docs. Some are for you. Some you hand to parents. Print one page or all of them.</p>
      </div></section>
      ${tip('Start with the first-class checklist. It tells you what to print, and when.', 'parent', 'Coach tip')}
      ${group('instructor', 'To run your class', 'Plans, drills, prices and a checklist, for you.')}
      ${group('parent', 'To hand to parents', 'A flyer, a sign-up form and a progress report, for the families.')}`;
    // Number the rows straight down the page, across both groups.
    el.querySelectorAll('.kit-list .ix').forEach((x, k) => { x.textContent = k + 1; });
  }).catch(e => {
    console.error(e);
    el.querySelector('.kit-body').innerHTML = '<p class="muted">The Launch Kit did not load. Check the connection and try again.</p>';
  });
}

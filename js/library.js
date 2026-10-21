// library.js — the member library: #/library (every stage, every lesson's sheet), #/library/<book> (the
// Prodigy Secrets Program pages, printable one page or one stage at a time) and #/print/<stage>/<lesson>/<no>
// (a fresh practice sheet, built and re-checked in the browser by js/handouts.js, then window.print()).
// The book pages are library/*.json, built from docs/products by tools/build-members.mjs.
import { h, esc, tip, crumbs, mailto, stageColor } from './ui.js';
import { badge, icon } from './art.js';
import { STAGES, stageByN, lessonKey } from './curriculum.js';
import { store } from './store.js';
import { auth } from './auth.js';
import { membership } from './membership.js';
import { buildSheet, describeSheet, newSeed } from './handouts.js';
import { JOIN_URL, SUPPORT_EMAIL } from './config.js';

const pad2 = n => String(n).padStart(2, '0');
const bookId = id => (/^\d+$/.test(id) ? `stage-${pad2(id)}` : id);
const BOOKS = { start: 'How to use the program', bosses: 'All ten boss tests' };
const cache = new Map();
async function loadBook(id) {
  if (!cache.has(id)) cache.set(id, fetch(`library/${id}.json`).then(r => { if (!r.ok) throw new Error(`library/${id}.json: ${r.status}`); return r.json(); }));
  try { return await cache.get(id); } catch (e) { cache.delete(id); throw e; }
}

// ───────── the gate ─────────
// Renders the lock (or "checking…") and returns false when this family may not open `feature`.
function gate(app, feature, trail = ['Library']) {
  if (membership.can(feature)) return true;
  const s = membership.state();
  let body;
  if (!membership.loaded) body = `<span class="eyebrow blue">Members</span><h2>Checking your membership…</h2><p class="muted">One moment.</p>`;
  else if (feature === 'handouts' && s.keepsLibrary) body = `<span class="eyebrow orange">Members</span><h2>Fresh sheets come with a running membership.</h2>
      <p class="lede">Your library pages are still yours, and every lesson page has a ten-problem drill you can print any time.</p>
      <div class="btn-row"><a class="btn blue" href="#/library">Open the library</a><a class="btn secondary" href="#/account">Your account</a></div>`;
  else if (!auth.user && !s.preview) body = `<span class="eyebrow blue">Members</span><h2>The library comes with Phenom University.</h2>
      <p class="lede">Already a member? Sign in with the email you used at checkout and it opens.</p>
      <div class="btn-row"><a class="btn blue" href="#/start/signin">Email me a sign-in link →</a><a class="btn secondary" href="${JOIN_URL}">Start with a free abacus kit</a></div>`;
  else body = `<span class="eyebrow blue">Members</span><h2>The library comes with Phenom University.</h2>
      <p class="lede">We do not see a membership for <b>${esc(s.email)}</b>. Paid with a different email? Sign in with that one, or <a href="${mailto(SUPPORT_EMAIL, 'Link my membership', `Hi, please link my membership to ${s.email}.\n\nThe email I paid with: `)}">email us</a> and we will link them.</p>
      <div class="btn-row"><a class="btn blue" href="#/account">Your account</a><a class="btn secondary" href="${JOIN_URL}">Start with a free abacus kit</a></div>`;
  app.appendChild(h(`<div>${crumbs('<a href="#/">Home</a>', ...trail)}
    <section class="section" style="margin-top:24px"><div class="block yellow split lib-lock"><div>${body}</div><div class="lock-art">${icon('lock', 'ic')}</div></div></section>
    ${membership.loaded && !s.keepsLibrary ? libraryPreviewHTML() : ''}</div>`));
  return false;
}
// What is inside, shown under the lock so a non-member can see it (titles only).
function libraryPreviewHTML() {
  return `<section class="section"><div class="section-head"><span class="eyebrow">Inside</span><h2>Ten stages on paper</h2><p>Every lesson, quest card and boss from the app, as printable pages, plus a fresh practice sheet for any lesson.</p></div>
    <ul class="lesson-list">${STAGES.map(s => `<li><span class="ix">${s.n}</span><div><b>${s.name}</b><div class="meta">${esc(s.tagline)} · ${s.lessons.length} lessons</div></div></li>`).join('')}</ul></section>`;
}

// ───────── #/library ─────────
export function library(app) {
  if (!gate(app, 'library')) return;
  const s = membership.state(), sheets = membership.can('handouts');
  const cur = store.profile ? curStage() : 1;
  const el = h(`<div class="lib">
    ${crumbs('<a href="#/">Home</a>', 'Library')}
    <section class="page-head"><div>
      <span class="eyebrow purple">Prodigy Secrets Program</span>
      <h1>The member library</h1>
      <p class="lede">Every stage of the course on paper, and a fresh practice sheet for any lesson. Print what you need, when you need it.</p>
      <p class="lib-status"><span class="status-chip ${s.member ? 'green' : 'purple'}">${s.member ? (s.status === 'trialing' ? 'Test drive' : 'Member') : 'Yours to keep'}</span>${s.preview ? '<span class="status-chip">Preview</span>' : ''} <a href="#/account">Account &amp; billing</a></p>
    </div><div class="art">${badge(STAGES[cur - 1].key)}</div></section>
    ${tip(sheets ? 'Print a sheet the night before. Fold the answer strip under. Same lesson, new numbers every time you press print.' : 'Every lesson page in the book has a ten-problem drill and the answers at the back of its stage.', 'parent', 'Parent tip')}
    <section class="section" style="margin-top:36px">
      <div class="section-head"><span class="eyebrow">Start here</span><h2>Two pages first</h2></div>
      <ul class="lesson-list">
        <li><span class="ix">★</span><div><a href="#/library/start">How to use the program</a><div class="meta">The fifteen minutes, the week, the hand, the four move colors</div></div><a class="btn sm secondary go" href="#/library/start">Read</a></li>
        <li><span class="ix">B</span><div><a href="#/library/bosses">All ten boss tests</a><div class="meta">The printed boss for the end of every stage, with answers</div></div><a class="btn sm secondary go" href="#/library/bosses">Read</a></li>
      </ul>
    </section>
    <section class="section">
      <div class="section-head"><span class="eyebrow">The stages</span><h2>Ten stages, every lesson</h2><p>${sheets ? 'Each lesson has a practice sheet matched to it: 20 problems built to need exactly that move, with an answer strip to fold under.' : 'Open a stage to read and print its pages.'}</p></div>
      <div class="lib-stages">${STAGES.map(st => stageRow(st, st.n === cur, sheets)).join('')}</div>
    </section>
  </div>`);
  app.appendChild(el);
}
function curStage() {
  const p = store.profile; let n = 1;
  for (const s of STAGES) if (p.bosses[s.n]?.passed) n = Math.min(10, s.n + 1);
  return n;
}
function stageRow(st, open, sheets) {
  const p = store.profile;
  const rows = st.lessons.map((l, i) => {
    const d = describeSheet(st.n, l.key), done = p && p.lessons[lessonKey(st, l)]?.done;
    return `<li class="${done ? 'done' : ''}"><span class="ix">${done ? '✓' : i + 1}</span><div><span class="t">${esc(l.title)}</span><div class="meta">${esc(d.kind)} · ${d.label}${d.twoPages ? ' · 2 pages' : ''}</div></div>${sheets ? `<a class="btn sm secondary go-print" href="#/print/${st.n}/${l.key}">Print sheet</a>` : ''}</li>`;
  }).join('');
  const boss = describeSheet(st.n, 'boss');
  return `<details class="lib-stage ${stageColor(st)}" ${open ? 'open' : ''}>
    <summary><span class="sb">${badge(st.key)}</span><span class="nm"><b>Stage ${st.n} · ${st.name}</b><small>${esc(st.tagline)} · ${st.lessons.length} lessons</small></span></summary>
    <div class="lib-stage-body">
      <div class="btn-row"><a class="btn blue" href="#/library/${st.n}">Read and print the Stage ${st.n} pages →</a></div>
      <ul class="lesson-list">${rows}
        <li><span class="ix boss">!</span><div><span class="t">${esc(st.boss.title)}: practice run</span><div class="meta">Boss prep · ${boss.label}</div></div>${sheets ? `<a class="btn sm secondary go-print" href="#/print/${st.n}/boss">Print sheet</a>` : ''}</li>
      </ul>
    </div>
  </details>`;
}

// ───────── #/library/<book> ─────────
export function libraryBook(app, id) {
  const bid = bookId(id || '');
  const stage = /^stage-\d\d$/.test(bid) ? stageByN(Number(bid.slice(6))) : null;
  if (!stage && !BOOKS[bid]) { app.appendChild(h('<div class="try-box"><h2>Page not found</h2><a href="#/library">Back to the library</a></div>')); return; }
  const label = stage ? `Stage ${stage.n}` : BOOKS[bid];
  if (!gate(app, 'library', ['<a href="#/library">Library</a>', esc(label)])) return;
  const sheets = membership.can('handouts');
  const el = h(`<div class="lib-book">
    ${crumbs('<a href="#/">Home</a>', '<a href="#/library">Library</a>', esc(label))}
    <section class="page-head"><div>
      <span class="eyebrow ${stage ? (stageColor(stage) === 'yellow' ? 'orange' : stageColor(stage)) : 'purple'}">Prodigy Secrets Program${stage ? ` · Stage ${stage.n} of 10` : ''}</span>
      <h1 class="book-title">${esc(stage ? `${stage.name}: ${stage.tagline.toLowerCase()}` : BOOKS[bid])}</h1>
      <p class="lede book-lede">Loading the pages…</p>
      <div class="btn-row"><button class="btn blue" id="print-all" disabled>Print</button><a class="btn secondary" href="#/library">Back to the library</a></div>
    </div>${stage ? `<div class="art">${badge(stage.key)}</div>` : ''}</section>
    <div class="book-body"></div>
  </div>`);
  app.appendChild(el);
  document.body.classList.add('printing-book');
  loadBook(bid).then(doc => {
    if (!el.isConnected) return;
    const n = doc.sections.length;
    el.querySelector('.book-lede').textContent = stage
      ? `The stage opener, all ${doc.sections.filter(x => x.kind === 'lesson').length} lessons, the quest cards, the boss and the answers. Print the whole stage, or one page at a time. Every lesson starts on a fresh sheet of paper.`
      : n === 1 ? 'Read it once before Lesson 1.1. Print it for the fridge.' : 'Print them all, or one boss at a time. Every boss starts on a fresh sheet of paper.';
    const all = el.querySelector('#print-all'); all.disabled = false; all.textContent = stage ? 'Print the whole stage' : n === 1 ? 'Print it' : 'Print every boss';
    all.onclick = () => window.print();
    const toc = n > 2 ? `<details class="lib-toc" open><summary>Pages in this ${stage ? 'stage' : 'book'} (${n})</summary><ul class="lesson-list">${doc.sections.map((s, i) => `<li><span class="ix">${s.no ? s.no : i + 1}</span><div><a href="#" data-go="${i}">${esc(s.no ? s.title.replace(/^Lesson [\d.]+ · /, '') : s.title)}</a><div class="meta">${KIND[s.kind] || 'Page'}</div></div><span class="go"><button class="btn sm ghost" data-print="${i}">Print</button></span></li>`).join('')}</ul></details>` : '';
    const pages = doc.sections.map((s, i) => `<section class="lib-page kind-${s.kind}" id="lib-p${i}">
      <div class="lib-tools"><span class="lbl">${KIND[s.kind] || 'Page'}${s.no ? ` ${s.no}` : ''}</span><button class="btn sm secondary" data-print="${i}">Print this page</button>${s.key && sheets ? `<a class="btn sm ghost" href="#/print/${stage.n}/${s.key}">Fresh practice sheet</a>` : ''}${s.kind === 'boss' && s.stage && sheets ? `<a class="btn sm ghost" href="#/print/${s.stage}/boss">Fresh boss-prep sheet</a>` : ''}</div>
      <div class="lib-doc">${s.html}</div></section>`).join('');
    el.querySelector('.book-body').innerHTML = toc + pages;
    el.querySelectorAll('.beads[data-n]').forEach(sp => { sp.innerHTML = beadPicture(Number(sp.dataset.n)); });
    el.querySelectorAll('[data-go]').forEach(a => a.onclick = e => { e.preventDefault(); el.querySelector(`#lib-p${a.dataset.go}`).scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    el.querySelectorAll('[data-print]').forEach(b => b.onclick = () => printOne(el.querySelector(`#lib-p${b.dataset.print}`)));
  }).catch(e => {
    console.error(e);
    el.querySelector('.book-lede').textContent = 'The pages did not load. Check the connection and try again.';
  });
}
const KIND = { opener: 'Stage opener', lesson: 'Lesson', quests: 'Quest cards', 'boss-note': 'Boss', boss: 'Boss test', trainer: 'The trainer', answers: 'Answers' };

// Print one section: everything else is hidden by css/members.css while body.print-one is set.
function printOne(section) {
  section.classList.add('print-target');
  document.body.classList.add('print-one');
  const done = () => { section.classList.remove('print-target'); document.body.classList.remove('print-one'); };
  window.addEventListener('afterprint', done, { once: true });
  window.print();
}

// A soroban picture for the book's [beads: n] tokens. Beads touching the beam are filled; the rest are pale.
export function beadPicture(n) {
  const rods = Math.max(3, String(n).length + 1);
  const P = 18, W = rods * P + 8, H = 92, beam = 30, ry = 4.2, rx = 7;
  const digs = String(n).padStart(rods, '0').split('').map(Number);
  let g = `<rect class="fr" x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="5"/>`;
  digs.forEach((v, i) => {
    const x = 4 + P / 2 + i * P, heaven = v >= 5, e = v % 5;
    g += `<line class="rod" x1="${x}" y1="3" x2="${x}" y2="${H - 3}"/>`;
    g += `<ellipse class="b ${heaven ? 'on h' : ''}" cx="${x}" cy="${heaven ? beam - 2 - ry : 3 + ry + 2}" rx="${rx}" ry="${ry}"/>`;
    for (let j = 0; j < 4; j++) {
      const on = j < e;
      const y = on ? beam + 2 + ry + j * (2 * ry + 1) : H - 3 - ry - 1 - (3 - j) * (2 * ry + 1);
      g += `<ellipse class="b ${on ? 'on' : ''}" cx="${x}" cy="${y.toFixed(1)}" rx="${rx}" ry="${ry}"/>`;
    }
  });
  g += `<line class="beam" x1="1.5" y1="${beam}" x2="${W - 1.5}" y2="${beam}"/><circle class="dot" cx="${4 + P / 2 + (rods - 1) * P}" cy="${beam}" r="1.8"/>`;
  // A picture only, never the number: in the reading drills the number is the answer.
  return `<svg class="bead-pic" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${g}</svg>`;
}

// ───────── #/print/<stage>/<lesson or boss>/<sheet no.> ─────────
export function printSheet(app, stageN, key, seedArg) {
  const st = stageByN(stageN);
  const lesson = st && (key === 'boss' ? { title: `${st.boss.title}: practice run` } : st.lessons.find(l => l.key === key));
  if (!st || !lesson) { app.appendChild(h('<div class="try-box"><h2>No sheet here</h2><a href="#/library">Back to the library</a></div>')); return; }
  if (!gate(app, 'handouts', ['<a href="#/library">Library</a>', `Stage ${st.n} practice sheet`])) return;
  let seed = Number(seedArg);
  if (!Number.isInteger(seed) || seed < 1) { seed = newSeed(); history.replaceState(null, '', `#/print/${st.n}/${key}/${seed}`); }
  // Build it; if the re-check ever finds a problem, step to the next number rather than print it.
  let sheet, tries = 0;
  for (; tries < 5; tries++) { sheet = buildSheet(st.n, key, seed + tries); if (!sheet.problems.length) break; console.warn('sheet re-check', sheet.problems); }
  if (sheet.problems.length) { app.appendChild(h(`<div class="try-box"><h2>This sheet did not pass its check</h2><p>Try new numbers, or a different lesson. ${esc(sheet.problems[0])}</p><a class="btn blue" href="#/print/${st.n}/${key}/${newSeed()}">New numbers</a></div>`)); return; }
  if (tries) { seed += tries; history.replaceState(null, '', `#/print/${st.n}/${key}/${seed}`); }
  const d = describeSheet(st.n, key), idx = st.lessons.findIndex(l => l.key === key);
  const el = h(`<div class="print-sheet">
    ${crumbs('<a href="#/">Home</a>', '<a href="#/library">Library</a>', `<a href="#/library/${st.n}">Stage ${st.n}</a>`, 'Practice sheet')}
    <div class="print-bar">
      <div>
        <span class="eyebrow ${stageColor(st) === 'yellow' ? 'orange' : stageColor(st)}">Stage ${st.n} · ${st.name}${idx >= 0 ? ` · Lesson ${idx + 1}` : ' · Boss prep'}</span>
        <h1>${esc(lesson.title)}</h1>
        <p class="muted">${esc(d.kind)} · ${d.label} · ${sheet.pages.length} ${sheet.pages.length === 1 ? 'page' : 'pages'}. Sheet no. ${seed}: open this page again any time for the same numbers.</p>
      </div>
      <div class="btn-row"><button class="btn big blue" id="do-print">Print</button><a class="btn secondary" href="#/print/${st.n}/${key}/${newSeed()}">New numbers</a>${idx >= 0 ? `<a class="btn ghost" href="#/stage/${st.n}/lesson/${key}">Open the lesson</a>` : ''}</div>
    </div>
    ${tip('Print at actual size (100%) on Letter or A4. Fold the answer strip under before your child starts.', 'parent', 'Printing')}
    <div class="handout-preview"><div class="handout">${sheet.pages.map(p => `<div class="page">${p}</div>`).join('')}</div></div>
  </div>`);
  app.appendChild(el);
  document.body.classList.add('printing-sheet');
  el.querySelector('#do-print').onclick = () => window.print();
  fitPreview(el.querySelector('.handout-preview'));
}
// Show the Letter-size sheet whole on any screen: scale the preview down to the width there is.
function fitPreview(box) {
  const paper = box.querySelector('.handout');
  const fit = () => { if (!box.isConnected) return removeEventListener('resize', fit); paper.style.zoom = Math.min(1, box.clientWidth / 816).toFixed(3); };
  fit(); addEventListener('resize', fit);
}

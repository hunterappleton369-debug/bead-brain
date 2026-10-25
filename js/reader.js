// reader.js — the one-page-at-a-time book reader. The Playbook (#/playbook), the two bonus guides (#/bonus/…)
// and the Launch Kit docs (#/kit/…) all read the same way:
//   <route>        the index: cover, title, the page list, "Print the whole …"
//   <route>/<n>    one page, readable on a phone, with "Print this page" and buttons to the next and last page
// A book is library/<id>.json, { title, sections: [{ kind, no?, title, html }] }, built by tools/build-members.mjs.
// Every section is in the page for printing; on screen only the one marked .on shows (none on the index).
// Print rules: css/members.css (body.printing-book, body.print-one, body.pb-print-all).
import { h, esc, crumbs } from './ui.js';
import { loadBook, printOne, beadPicture } from './library.js';

// cfg (only id, route and crumb are needed; the rest falls back to the Playbook's way of doing things):
//   id            library/<id>.json
//   route         '#/playbook': the index; pages are route/1, route/2, …
//   trail, crumb  the crumbs before this book, and this book's own crumb
//   eyebrow, color, title, barTitle, lede, cover, chip, tip   the index head (title, lede and chip may be fn(doc))
//   top           html under the index head (fn(doc, extra)); pageTop: html above each page (fn(doc, page, i, extra))
//   introOnIndex  show the book's 'intro' section on the index
//   readable      fn(doc) → the pages read one at a time; short: fn(page, i) → "Chapter 3"
//   rowIx, rowMeta, listEyebrow, listTitle, listLede, allLabel, printOneLabel, printAllLabel, noun, loading, failed
//   single        a book with one page opens straight on it; up and upLabel: where its back button goes
//   prepare       fn() → a promise loaded beside the book; its value is `extra` above
//   after         fn(body, doc, page, extra) once the page is drawn (page is null on the index)
const DEFAULTS = {
  trail: ['<a href="#/">Home</a>'],
  eyebrow: '', color: 'purple', lede: '', cover: '', chip: '', tip: '', top: '', pageTop: '',
  readable: doc => doc.sections.filter(s => s.kind === 'chapter' || s.kind === 'appendix'),
  short: s => (s.no ? `Chapter ${s.no}` : s.title),
  rowIx: p => p.no || '★',
  rowMeta: p => (p.no ? `Chapter ${p.no}` : 'At the back of the book'),
  listEyebrow: 'Chapters',
  listTitle: pages => { const chapters = pages.filter(p => p.kind === 'chapter').length, back = pages.length - chapters; return `${chapters} chapters${back ? `, ${back} ${back === 1 ? 'page' : 'pages'} at the back` : ''}`; },
  listLede: 'Tap one to read it. One page at a time.',
  allLabel: 'All chapters',
  printOneLabel: 'Print this page',
  printAllLabel: 'Print it all',
  loading: 'Loading…',
  failed: 'This did not load. Check the connection and try again.',
};
const val = (v, ...args) => (typeof v === 'function' ? v(...args) : v) ?? '';

// Every page of the book, for printing. On screen only the page marked .on shows (none on the index).
function pagesHTML(c, doc, on, label, one) {
  return `<div class="book-body pb-pages">${doc.sections.map((s, i) => `<section class="lib-page pb-page kind-${s.kind}${s === on ? ' on' : ''}" id="pb-p${i}">
      ${s === on ? `<div class="lib-tools"><span class="lbl">${esc(label)}</span><button class="btn sm secondary" data-print-one>${c.printOneLabel}</button>${one ? '' : `<button class="btn sm ghost" data-print-all>${c.printAllLabel}</button>`}</div>` : ''}
      <div class="lib-doc">${s.html}</div></section>`).join('')}</div>`;
}

export function printAll() {
  document.body.classList.add('pb-print-all');
  window.addEventListener('afterprint', () => document.body.classList.remove('pb-print-all'), { once: true });
  window.print();
}

export function readBook(app, cfg, n) {
  const c = { ...DEFAULTS, noun: cfg.crumb, ...cfg };
  const el = h(`<div class="lib-book pb${c.cls ? ` ${c.cls}` : ''}">${crumbs(...c.trail, n ? `<a href="${c.route}">${c.crumb}</a>` : c.crumb, ...(n ? ['…'] : []))}<div class="pb-body"><p class="muted">${c.loading}</p></div></div>`);
  const crumb = text => { el.querySelector('.crumbs > span:last-child').textContent = text; };
  app.appendChild(el);
  document.body.classList.add('printing-book');
  Promise.all([loadBook(c.id), c.prepare ? c.prepare() : null]).then(([doc, extra]) => {
    if (!el.isConnected) return;
    const pages = c.readable(doc);
    const body = el.querySelector('.pb-body');
    const one = !n && !!c.single && pages.length === 1; // a one-page doc opens straight on its page
    let page = null;
    if (!pages.length) {
      body.innerHTML = `<div class="try-box"><h2>Nothing to read here yet</h2><a class="btn blue" href="${c.up || '#/'}">Back</a></div>`;
      return;
    }
    if (!n && !one) {
      const intro = c.introOnIndex ? doc.sections.filter(s => s.kind === 'intro') : [];
      const cover = val(c.cover, doc);
      body.innerHTML = `<section class="page-head"><div>
          <span class="eyebrow ${c.color}">${c.eyebrow}</span>
          ${cover ? `<img class="pb-cover pb-cover-top" src="${esc(cover)}" alt="">` : ''}
          <h1>${val(c.title, doc)}</h1>
          ${c.lede ? `<p class="lede">${val(c.lede, doc)}</p>` : ''}
          ${val(c.chip, doc)}
        </div></section>
        ${val(c.top, doc, extra)}
        ${intro.map(s => `<section class="pb-intro"><div class="lib-doc">${s.html}</div></section>`).join('')}
        <div class="btn-row pb-start"><a class="btn blue" href="${c.route}/1">Start with ${esc(c.short(pages[0], 0))} →</a><button class="btn secondary" data-print-all>${c.printAllLabel}</button></div>
        <section class="section pb-list" style="margin-top:36px">
          <div class="section-head"><span class="eyebrow">${c.listEyebrow}</span><h2>${c.listTitle(pages)}</h2><p>${c.listLede}</p></div>
          <ul class="lesson-list">${pages.map((p, i) => `<li><span class="ix">${c.rowIx(p, i)}</span><div><a href="${c.route}/${i + 1}">${esc(p.title)}</a><div class="meta">${c.rowMeta(p, i)}</div></div><a class="btn sm secondary go" href="${c.route}/${i + 1}">Read</a></li>`).join('')}</ul>
        </section>
        ${val(c.tip, doc)}
        ${pagesHTML(c, doc, null, '', false)}`;
    } else {
      const i = one ? 0 : Number(n) - 1;
      page = pages[i] || null;
      if (!Number.isInteger(i) || !page) { body.innerHTML = `<div class="try-box"><h2>No page here</h2><p>${c.noun} has ${pages.length} pages to read.</p><a class="btn blue" href="${c.route}">${c.allLabel}</a></div>`; crumb('Not found'); return; }
      const label = c.short(page, i);
      if (!one) crumb(label);
      const prev = pages[i - 1], next = pages[i + 1];
      body.innerHTML = `<div class="pb-bar"><span class="eyebrow ${c.color}">${c.eyebrow} · ${val(c.barTitle ?? c.title, doc)}</span>${one ? '' : `<span class="faint small">Page ${i + 1} of ${pages.length}</span>`}</div>
        ${val(c.pageTop, doc, page, i, extra)}
        ${pagesHTML(c, doc, page, label, one)}
        <nav class="pb-nav" aria-label="${esc(c.crumb)} pages">
          ${one ? `<a class="btn secondary" href="${c.up}">← ${c.upLabel}</a>`
            : `${prev ? `<a class="btn secondary" href="${c.route}/${i}">← ${esc(c.short(prev, i - 1))}</a>` : `<a class="btn secondary" href="${c.route}">← ${c.allLabel}</a>`}
          ${next ? `<a class="btn blue" href="${c.route}/${i + 2}">${esc(c.short(next, i + 1))} →</a>` : `<a class="btn blue" href="${c.route}">${c.allLabel}</a>`}`}
        </nav>
        ${next ? `<p class="center small pb-all"><a href="${c.route}">${c.allLabel}</a></p>` : ''}`;
      const on = body.querySelector('.pb-page.on');
      body.querySelector('[data-print-one]').onclick = () => printOne(on);
    }
    // On the index the page head already shows the title and the subtitle: the intro starts after them.
    body.querySelectorAll('.pb-intro .lib-doc').forEach(d => {
      d.querySelector(':scope > h2.page-title')?.remove();
      const p = d.querySelector(':scope > p'), sub = String(doc.subtitle || '').trim();
      if (p && sub && p.textContent.trim().startsWith(sub)) p.remove();
    });
    body.querySelectorAll('.beads[data-n]').forEach(sp => { sp.innerHTML = beadPicture(Number(sp.dataset.n)); });
    body.querySelectorAll('[data-print-all]').forEach(b => b.onclick = printAll);
    if (c.after) c.after(body, doc, page, extra);
  }).catch(e => {
    console.error(e);
    el.querySelector('.pb-body').innerHTML = `<p class="muted">${c.failed}</p>`;
  });
}

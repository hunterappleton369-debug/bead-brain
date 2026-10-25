// quickstart.js — #/quickstart: the 3-Night Quick-Start, the digital card every kit buyer gets inside the welcome
// email (docs/products/welcome-card.md). The order page promises it "in your welcome email and your parent account",
// so it lives here too, linked from #/family and #/account. No gate: Stage 1 is free, and the three nights run on it.
// The copy is library/quickstart.json, built from the card by tools/build-members.mjs (step 5), which also writes
// the same section into free-abacus/thanks.html.
import { h, esc, tip, crumbs } from './ui.js';
import { loadBook } from './library.js';

export function quickstart(app) {
  const el = h(`<div class="qs">${crumbs('<a href="#/">Home</a>', 'Quick-Start')}<div class="qs-body"><p class="muted">Loading your first three nights…</p></div></div>`);
  app.appendChild(el);
  loadBook('quickstart').then(doc => {
    if (!el.isConnected) return;
    el.querySelector('.qs-body').innerHTML = `<section class="page-head"><div>
        <span class="eyebrow green">Your kit</span>
        <h1>${esc(doc.title)}</h1>
        ${doc.intro.map(p => `<p class="lede">${p}</p>`).join('')}
      </div></section>
      ${tip(doc.every, 'parent', 'Every night')}
      <ul class="lesson-list qs-nights">${doc.nights.map(n => `<li><span class="ix">${n.n}</span><div><b>Night ${n.n} · ${n.title}</b><p>${n.body}</p><div class="meta">Why tonight matters: ${n.why}</div></div></li>`).join('')}</ul>
      <p>${doc.after}</p>
      <div class="btn-row"><a class="btn blue" href="#/stage/1">Start Night 1 on the screen abacus →</a><a class="btn secondary" href="#/stage/1/lesson/hold">Lesson 1</a><button class="btn secondary" id="qs-print">Print this page</button></div>
      <p class="small muted">The same three nights are in your welcome email. Do them again with the real beads when the box lands.</p>`;
    el.querySelector('#qs-print').onclick = () => window.print();
  }).catch(e => {
    console.error(e);
    el.querySelector('.qs-body').innerHTML = '<p class="muted">The Quick-Start did not load. Check the connection and try again.</p>';
  });
}

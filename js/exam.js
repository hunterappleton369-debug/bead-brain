// exam.js — the Certified Phenom Instructor test.
//   #/exam        where you stand: the rules, which form is next, tries left today, the last result and what to review
//   #/exam/take   the test, Parts A, B and C, saved on this device after every answer (cp.exam.draft.v1), then sent
//                 to grade_cert_exam on the server. The answer key never reaches the browser.
// Who may take it: ACCESS.exam in js/membership.js (a running instructor year). The questions are
// library/cert-exam.json (tools/build-members.mjs, from docs/products/certification-course/exam*.md). Past tries
// are the signed-in email's cert_exam_attempts rows (row-level security returns only theirs).
// Answers go out as { "1": "b", "13": "78", "22": "11r5", "25": "91|c" }: lower case, digits only for numbers,
// quotient r remainder for division, answer|move for the rod traces.
import { h, esc, tip, crumbs, mailto } from './ui.js';
import { auth } from './auth.js';
import { membership, isLocal, missingTable } from './membership.js';
import { loadBook } from './library.js';
import { instructorGate } from './course.js';
import { instructorBadge } from './instructors.js';
import { confetti } from './drills.js';
import { SUPPORT_EMAIL } from './config.js';

const ROUTE = '#/exam';
const HOME = '<a href="#/">Home</a>', COURSE = '<a href="#/course">Course</a>';
const DRAFT = 'cp.exam.draft.v1';   // { email, form, v: { "1": "b", "22q": "11", "22r": "5", … }, part, started, saved }
const NEXT = 'cp.exam.next.v1';     // { [email]: { form, after } }: the form grade_cert_exam named after attempt `after`
const PER_DAY = 3;                  // tries in any 24 hours, as grade_cert_exam counts them (cert-exam.json may set triesPerDay)
const MINUTES = 60;
const DAY = 864e5;
const ACOLS = 'id,form,part_a,part_b,part_c,total,passed,review_lessons,created_at';
let fresh = null;                   // what grade_cert_exam just sent back: shown on #/exam, with confetti on a pass

// ───────── small helpers ─────────
const rich = s => (/<\/?[a-z][^>]*>/i.test(String(s ?? '')) ? String(s) : esc(s)); // the builder may send text or a little HTML
const digits = x => String(x ?? '').replace(/\D/g, '').replace(/^0+(?=\d)/, '');
const dayName = d => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
const when = d => { const t = new Date(d); if (Number.isNaN(+t)) return 'soon'; const today = t.toDateString() === new Date().toDateString(); return `${today ? 'today' : t.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at ${t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`; };
const letters = exam => Object.keys(exam.forms || {}).sort();
const partSize = p => Number(p.to) - Number(p.from) + 1;
const partOf = (exam, n) => (exam.parts || []).find(p => n >= Number(p.from) && n <= Number(p.to))?.id;
const perDay = exam => Number(exam.triesPerDay) || PER_DAY;
const emailKey = () => membership.state().email || 'this-device';
function readJSON(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } }
function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

// ───────── past tries ─────────
const norm = r => ({ id: r.id, form: r.form, parts: { A: r.part_a, B: r.part_b, C: r.part_c }, total: r.total, passed: !!r.passed, review: Array.isArray(r.review_lessons) ? r.review_lessons : [], at: new Date(r.created_at) });
async function loadAttempts() {
  if (membership.demo) return demoAttempts();
  const sb = auth.client();
  if (!sb || !auth.user) return { list: [], error: null };
  try {
    const r = await sb.from('cert_exam_attempts').select(ACOLS).order('created_at', { ascending: false }).limit(50);
    if (r.error) return { list: [], error: missingTable(r.error) ? 'missing' : String(r.error.message || r.error) };
    return { list: (r.data || []).map(norm), error: null };
  } catch (e) { return { list: [], error: String(e?.message || e) }; }
}
// localhost only: ?demo=instructor&exam=miss1 (or miss2, pass) fakes past tries so the result card can be checked by eye.
function demoAttempts() {
  const k = isLocal ? new URLSearchParams(location.search).get('exam') : '';
  const mk = (form, A, B, C, passed, hours) => ({ id: `demo-${form}`, form, parts: { A, B, C }, total: A + B + C, passed, review: passed ? [] : [7, 9, 16], at: new Date(Date.now() - hours * 36e5) });
  const list = k === 'pass' ? [mk('B', 11, 12, 12, true, 1), mk('A', 8, 9, 12, false, 30)]
    : k === 'miss2' ? [mk('B', 9, 9, 11, false, 2), mk('A', 8, 9, 12, false, 30)]
    : k === 'miss1' ? [mk('A', 8, 9, 12, false, 2)] : [];
  return { list, error: null };
}
function withFresh(list) { return fresh && fresh.email === emailKey() && !list.some(a => String(a.id) === String(fresh.id)) ? [fresh, ...list] : list; }

// Which form comes next: the one the server named after the last try, else the way grade_cert_exam picks it
// (A, B, C, A… by the number of tries so far).
function nextForm(exam, list) {
  const L = letters(exam); if (!L.length) return null;
  const saved = (readJSON(NEXT) || {})[emailKey()];
  if (saved && L.includes(saved.form) && String(saved.after ?? '') === String(list[0]?.id ?? '')) return saved.form;
  return L[list.length % L.length];
}
function saveNext(form, after) { if (!form) return; const all = readJSON(NEXT) || {}; all[emailKey()] = { form, after }; writeJSON(NEXT, all); }
function tries(exam, list) {
  const recent = list.filter(a => Date.now() - a.at < DAY);
  const left = Math.max(0, perDay(exam) - recent.length);
  return { left, of: perDay(exam), nextAt: left ? null : new Date(Math.min(...recent.map(a => +a.at)) + DAY) };
}
function readDraft() { const d = readJSON(DRAFT); return d && d.email === emailKey() && d.v ? d : null; }
const clearDraft = () => { try { localStorage.removeItem(DRAFT); } catch {} };

// ───────── the result card (the boss result's pattern, app.js) ─────────
function resultHTML(exam, a, misses) {
  const floors = exam.pass?.floors || {}, of = exam.pass?.of || 40, need = exam.pass?.total || 32;
  const rows = (exam.parts || []).map(p => { const got = Number(a.parts?.[p.id] ?? 0), ok = got >= Number(floors[p.id] ?? 0);
    return `<tr><td>${ok ? '✅' : '❌'}</td><td>Part ${esc(p.id)} · ${esc(p.title)}</td><td>${got}/${partSize(p)}</td><td class="muted">need ${esc(floors[p.id] ?? '')}</td></tr>`; }).join('');
  const s = membership.state();
  const coach = a.passed ? '' : misses >= 2
    ? `<div class="exam-coach"><p><b>The Pass Promise:</b> free one-on-one coaching until you pass.</p><a class="btn blue" href="${mailto(SUPPORT_EMAIL, 'Book my free coaching (Pass Promise)', `Hi, I have taken the instructor test ${misses} times and have not passed yet. Please book my free coaching.\n\nLast try: ${a.id} (Form ${a.form}, ${a.total} of ${of})\nMy account email: ${s.email}`)}">Book your free coaching</a></div>`
    : `<div class="exam-coach"><p>Want a hand before the next try?</p><a class="btn secondary" href="${mailto(SUPPORT_EMAIL, 'Coach call: instructor test', `Hi, I took the instructor test and did not pass yet. I would like a coach call.\n\nTry: ${a.id} (Form ${a.form}, ${a.total} of ${of})\nMy account email: ${s.email}`)}">Ask for a coach call</a></div>`;
  return `<div class="result ${a.passed ? 'good' : 'meh'} center exam-result">
      <span class="eyebrow">Form ${esc(a.form)} · ${dayName(a.at)}</span>
      <h2>${a.passed ? 'You passed!' : 'Not yet'}</h2>
      ${a.passed ? instructorBadge({ year: String(a.at.getFullYear()), cls: 'ibadge exam-badge' }) : ''}
      <div class="bignum">${esc(a.total)}<small> of ${of}</small></div>
      <table class="table" style="margin:12px auto;max-width:520px">${rows}<tr class="me"><td>${a.total >= need ? '✅' : '❌'}</td><td><b>Total</b></td><td><b>${esc(a.total)}/${of}</b></td><td class="muted">need ${need}</td></tr></table>
      <p class="muted">${a.passed ? 'Your certificate is ready. Put your name on it and print it.' : `To pass: ${need} of ${of}, and every part at its line. Go over the lessons below, then take a fresh form.`}</p>
      ${!a.passed && a.review.length ? `<p class="exam-review">Go over: ${[...new Set(a.review.map(Number).filter(Boolean))].sort((x, y) => x - y).map(n => `<a href="#/course/${n}">Lesson ${n}</a>`).join(' ')}</p>` : ''}
      ${coach}
      ${a.passed ? '<div class="btn-row" style="justify-content:center"><a class="btn big green" href="#/certificate">Get your certificate →</a></div>' : ''}
    </div>`;
}

// ───────── #/exam and #/exam/take ─────────
export function exam(app, sub) {
  if (!instructorGate(app, 'exam', sub ? [COURSE, `<a href="${ROUTE}">The test</a>`, 'Take it'] : [COURSE, 'The test'])) return;
  return sub === 'take' ? takePage(app) : statusPage(app);
}

function statusPage(app) {
  const el = h(`<div class="exam-page">${crumbs(HOME, COURSE, 'The test')}<div class="exam-body"><p class="muted">Loading the test…</p></div></div>`);
  app.appendChild(el);
  Promise.all([loadBook('cert-exam'), loadAttempts()]).then(([ex, att]) => {
    if (!el.isConnected) return;
    const s = membership.state();
    const list = withFresh(att.list), last = list[0];
    const passed = list.find(a => a.passed);
    const misses = list.filter(a => !a.passed).length;
    const form = nextForm(ex, list), t = tries(ex, list);
    const draft = readDraft(), live = draft && (!last || draft.started > +last.at) && draft.form === form;
    const qs = form ? ex.forms[form]?.questions || [] : [];
    const answered = live ? qs.filter(q => answerOf(q, draft.v)).length : 0;
    const floors = ex.pass?.floors || {};
    const nextBox = passed || s.certified ? '' : `<section class="section exam-next" style="margin-top:32px"><div class="try-box">
        <span class="eyebrow blue">${list.length ? 'Your next try' : 'Ready when you are'}</span>
        <h2>Form ${esc(form || 'A')}</h2>
        <p>${t.left ? `${t.left} of ${t.of} ${t.of === 1 ? 'try' : 'tries'} left today.` : `You used today's tries. You can start again ${when(t.nextAt)}.`}${live && answered ? ` You have ${answered} of ${qs.length} answered on this device.` : ''}</p>
        <div class="btn-row">${t.left || membership.demo ? `<a class="btn big blue" href="${ROUTE}/take">${live ? 'Keep going' : 'Start the test'} →</a>` : ''}<a class="btn secondary" href="#/course">The lessons</a></div>
        ${membership.demo ? '<p class="small muted">Demo: you can try the test here, but grading needs a real sign-in.</p>' : ''}
      </div></section>`;
    el.querySelector('.exam-body').innerHTML = `<section class="page-head"><div>
        <span class="eyebrow blue">Instructor course · the test</span>
        <h1>The certification test</h1>
        <p class="lede">${ex.pass?.of || 40} questions in three parts. ${ex.minutes || MINUTES} minutes. Pass with ${ex.pass?.total || 32} of ${ex.pass?.of || 40}.</p>
      </div></section>
      ${att.error && att.error !== 'missing' ? tip('We could not load your past tries just now. Try again in a minute.', 'warn', 'Heads up') : ''}
      ${passed && !last?.passed ? resultHTML(ex, passed, 0) : last ? resultHTML(ex, last, misses) : ''}
      ${s.certified && !passed ? `<div class="result good center exam-result"><h2>You passed</h2><p>Your certificate is ready.</p><div class="btn-row" style="justify-content:center"><a class="btn big green" href="#/certificate">Your certificate →</a></div></div>` : ''}
      ${nextBox}
      <section class="section exam-rules" style="margin-top:48px">
        <div class="section-head"><span class="eyebrow">How it works</span><h2>The rules</h2></div>
        <div class="lib-doc">${ex.rulesHtml || ''}</div>
        <ul class="lesson-list exam-parts">${(ex.parts || []).map(p => `<li><span class="ix">${esc(p.id)}</span><div><b>${esc(p.title)}</b><div class="meta">Questions ${esc(p.from)} to ${esc(p.to)} · pass line ${esc(floors[p.id] ?? '')} of ${partSize(p)}</div></div></li>`).join('')}</ul>
      </section>`;
    if (fresh && fresh.passed && !fresh.cheered) { fresh.cheered = true; confetti(3000); }
  }).catch(e => {
    console.error(e);
    el.querySelector('.exam-body').innerHTML = '<p class="muted">The test did not load. Check the connection and try again.</p>';
  });
}

function answerOf(q, v) {
  const n = q.q;
  switch (q.type) {
    case 'choice': return v[n] ? String(v[n]).toLowerCase() : '';
    case 'divrem': { const a = digits(v[`${n}q`]), b = digits(v[`${n}r`]); return a && b ? `${a}r${b}` : ''; }
    case 'trace': { const a = digits(v[`${n}n`]), o = v[`${n}o`]; return a && o ? `${a}|${String(o).toLowerCase()}` : ''; }
    default: return digits(v[n]);
  }
}

function questionHTML(q, v) {
  const n = q.q;
  const radios = (opts, key, group) => `<div class="xo-list" role="radiogroup" aria-label="Question ${n}">${(opts || []).map(o => `<label class="xo"><input type="radio" name="${group}" value="${esc(o.id)}" data-k="${key}"${String(v[key] ?? '') === String(o.id) ? ' checked' : ''}><span class="xo-id">${esc(String(o.id).toUpperCase())}</span><span class="xo-t">${rich(o.label)}</span></label>`).join('')}</div>`;
  const box = (key, label, cls = '') => `<input class="x-num${cls}" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="done" data-k="${key}" value="${esc(v[key] ?? '')}" aria-label="${label}">`;
  let body;
  if (q.type === 'choice') body = radios(q.options, String(n), `q${n}`);
  else if (q.type === 'divrem') body = `<div class="x-row">${box(`${n}q`, `Question ${n}, the whole number`)}<span class="x-r">r</span>${box(`${n}r`, `Question ${n}, the remainder`, ' rem')}</div><p class="small muted x-help">The whole number in the first box, the remainder in the second.</p>`;
  else if (q.type === 'trace') body = `<div class="x-row"><span class="x-lbl">Answer</span>${box(`${n}n`, `Question ${n}, the answer`)}</div><p class="x-sub">The rod moves, in order</p>${radios(q.options, `${n}o`, `q${n}o`)}`;
  else body = `<div class="x-row">${box(String(n), `Question ${n}, your answer`)}</div>`;
  const mentalNote = q.mental && /mental/i.test(q.note || ''); // the note already says it: show it once, as the chip
  return `<li class="xq" id="xq-${n}" data-q="${n}">
      <div class="xq-head"><span class="xq-n">${n}</span><div class="xq-text">${rich(q.text)}${q.ask ? `<div class="xq-ask">${rich(q.ask)}</div>` : ''}${q.mental ? `<div><span class="chip ink xq-mental">${mentalNote ? rich(q.note) : 'Mental: no abacus, no paper'}</span></div>` : ''}${q.note && !mentalNote ? `<div class="xq-note">${rich(q.note)}</div>` : ''}</div></div>
      ${body}
    </li>`;
}

function takePage(app) {
  const el = h(`<div class="exam-take">${crumbs(HOME, COURSE, `<a href="${ROUTE}">The test</a>`, 'Take it')}<div class="exam-body"><p class="muted">Loading the test…</p></div></div>`);
  app.appendChild(el);
  Promise.all([loadBook('cert-exam'), loadAttempts()]).then(([ex, att]) => {
    if (!el.isConnected) return;
    const s = membership.state(), demo = !!membership.demo;
    const list = withFresh(att.list), last = list[0];
    const body = el.querySelector('.exam-body');
    if (s.certified || list.some(a => a.passed)) { body.innerHTML = `<div class="result good center"><h2>You passed already</h2><p>There is nothing more to take. Your certificate is ready.</p><div class="btn-row" style="justify-content:center"><a class="btn big green" href="#/certificate">Your certificate →</a></div></div>`; return; }
    const t = tries(ex, list);
    if (!t.left && !demo) { body.innerHTML = `<div class="try-box"><span class="eyebrow blue">The test</span><h2>You used today's tries</h2><p>You can start again ${when(t.nextAt)}. Until then, go over the lessons from your last try.</p><div class="btn-row"><a class="btn blue" href="${ROUTE}">Your last result</a><a class="btn secondary" href="#/course">The lessons</a></div></div>`; return; }
    const form = nextForm(ex, list), fq = form && ex.forms[form]?.questions;
    if (!fq || !fq.length) { body.innerHTML = '<div class="try-box"><h2>The test is not ready yet</h2><p>Check back soon.</p></div>'; return; }
    // The saved draft counts when it is for this form and newer than the last try sent (from any device).
    let draft = readDraft();
    if (draft && (draft.form !== form || (last && draft.started < +last.at))) draft = null;
    const fresh0 = !draft || !Object.keys(draft.v).length;
    const d = { email: emailKey(), form, v: draft?.v || {}, part: draft?.part || 'A', started: fresh0 ? Date.now() : draft.started };
    const save = () => { try { localStorage.setItem(DRAFT, JSON.stringify({ ...d, saved: Date.now() })); } catch {} };
    save();
    const parts = (ex.parts || []).map(p => ({ ...p, qs: fq.filter(q => (q.part || partOf(ex, q.q)) === p.id).sort((a, b) => a.q - b.q) }));
    const all = parts.flatMap(p => p.qs);
    const count = qs => qs.filter(q => answerOf(q, d.v)).length;
    body.innerHTML = `<div class="x-head">
        <span class="eyebrow blue">Form ${esc(form)} · ${all.length} questions</span>
        <h1>The test</h1>
        <p class="small muted">Your answers save on this device as you go. Close the page and come back any time.</p>
      </div>
      <div class="x-bar">
        <div class="x-status"><span class="x-count"></span><span class="x-clock" role="timer"></span></div>
        <nav class="pill-nav x-tabs" aria-label="Parts of the test">${parts.map(p => `<button type="button" data-part="${esc(p.id)}">Part ${esc(p.id)} <small></small></button>`).join('')}<button type="button" data-part="review">Review</button></nav>
      </div>
      <form class="x-form" autocomplete="off">
        ${parts.map(p => `<section class="x-part" data-part="${esc(p.id)}" hidden>
          <h2>Part ${esc(p.id)} · ${esc(p.title)}</h2>
          ${p.introHtml ? `<div class="lib-doc x-intro">${p.introHtml}</div>` : ''}
          <ol class="x-list">${p.qs.map(q => questionHTML(q, d.v)).join('')}</ol>
          <div class="btn-row x-next">${(() => { const i = parts.indexOf(p), nx = parts[i + 1]; return nx ? `<button type="button" class="btn big blue" data-go="${esc(nx.id)}">Part ${esc(nx.id)} →</button>` : '<button type="button" class="btn big blue" data-go="review">Check your answers →</button>'; })()}</div>
        </section>`).join('')}
        <section class="x-part x-review" data-part="review" hidden></section>
      </form>`;
    const form$ = body.querySelector('.x-form'), countEl = body.querySelector('.x-count'), clock = body.querySelector('.x-clock');
    const tabs = [...body.querySelectorAll('.x-tabs button')];
    const drawCounts = () => {
      countEl.textContent = `${count(all)} of ${all.length} answered`;
      tabs.forEach(b => { const p = parts.find(x => x.id === b.dataset.part); if (p) b.querySelector('small').textContent = `${count(p.qs)}/${p.qs.length}`; });
    };
    const reviewHTML = () => {
      const missing = all.filter(q => !answerOf(q, d.v));
      return `<h2>Check your answers</h2>
        <p class="lede">${missing.length ? `${all.length - missing.length} of ${all.length} answered. ${missing.length} ${missing.length === 1 ? 'is' : 'are'} empty.` : `All ${all.length} answered.`}</p>
        ${missing.length ? `<p class="small muted">Tap one to go to it.</p><div class="x-missing">${missing.map(q => `<button type="button" class="btn sm secondary" data-jump="${q.q}">Q${q.q}</button>`).join('')}</div>` : ''}
        <div class="btn-row"><button class="btn big blue" type="button" id="x-send"${demo ? ' disabled' : ''}>Send my answers</button></div>
        <p class="small muted x-fine">${demo ? 'Grading needs a real sign-in.' : 'You cannot change your answers after you send them.'}</p>
        <div class="x-msg" aria-live="polite"></div>`;
    };
    const show = (part, focusQ) => {
      d.part = part; save();
      tabs.forEach(b => { const on = b.dataset.part === part; b.classList.toggle('on', on); b.setAttribute('aria-current', on ? 'step' : 'false'); });
      body.querySelectorAll('.x-part').forEach(sec => { sec.hidden = sec.dataset.part !== part; });
      if (part === 'review') { const r = body.querySelector('.x-review'); r.innerHTML = reviewHTML(); wireReview(r); }
      const target = focusQ ? body.querySelector(`#xq-${focusQ}`) : body.querySelector('.x-bar');
      if (target) target.scrollIntoView({ block: 'start' });
      if (focusQ) setTimeout(() => body.querySelector(`#xq-${focusQ} input`)?.focus({ preventScroll: true }), 50);
    };
    tabs.forEach(b => b.onclick = () => show(b.dataset.part));
    body.querySelectorAll('[data-go]').forEach(b => b.onclick = () => show(b.dataset.go));
    // Every change goes into the draft at once.
    const onInput = e => {
      const k = e.target.dataset?.k; if (!k) return;
      if (e.target.type === 'radio') d.v[k] = e.target.value;
      else { const clean = e.target.value.replace(/\D/g, ''); if (clean !== e.target.value) e.target.value = clean; if (clean) d.v[k] = clean; else delete d.v[k]; }
      save(); drawCounts();
    };
    form$.onsubmit = e => e.preventDefault();
    form$.addEventListener('input', onInput);
    form$.addEventListener('change', onInput);
    // The soft clock: it counts down from 60 minutes and never stops the test.
    const end = d.started + (Number(ex.minutes) || MINUTES) * 60e3;
    const tick = () => {
      if (!clock.isConnected) return clearInterval(timer);
      const left = Math.round((end - Date.now()) / 1000);
      clock.classList.toggle('over', left <= 0);
      clock.textContent = left > 0 ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')} left` : 'Time is up. Send when you are ready.';
    };
    const timer = setInterval(tick, 1000); tick();
    function wireReview(r) {
      r.querySelectorAll('[data-jump]').forEach(b => b.onclick = () => { const q = all.find(x => String(x.q) === b.dataset.jump); show(q.part || partOf(ex, q.q), q.q); });
      const send = r.querySelector('#x-send'), msg = r.querySelector('.x-msg');
      if (!send || demo) return;
      const fail = html => { send.disabled = false; send.textContent = 'Send my answers'; msg.innerHTML = tip(html, 'warn', 'Not sent'); };
      send.onclick = async () => {
        const answers = {};
        for (const q of all) { const a = answerOf(q, d.v); if (a) answers[String(q.q)] = a; }
        const empty = all.length - Object.keys(answers).length;
        if (!confirm(`Send your answers for grading?${empty ? ` ${empty} ${empty === 1 ? 'question is' : 'questions are'} still empty.` : ''} You cannot change them after this.`)) return;
        const sb = auth.client();
        if (!sb || !auth.user) return fail('Sign in again to send your answers. They are saved on this device.');
        send.disabled = true; send.textContent = 'Grading…'; msg.innerHTML = '';
        let res;
        try { res = await sb.rpc('grade_cert_exam', { p_form: form, p_answers: answers }); } catch (e) { res = { error: e }; }
        if (res.error) { console.warn('grade_cert_exam', res.error); return fail('We could not send your answers. They are saved on this device. Try again in a minute.'); }
        const g = res.data || {};
        if (g.error === 'form') {
          saveNext(g.form, last?.id ?? ''); clearDraft();
          send.textContent = 'Not sent';
          msg.innerHTML = `${tip(`This try has to be Form ${esc(g.form)}. These answers were for Form ${esc(form)}, so they were not graded.`, 'warn', 'Not sent')}<div class="btn-row"><button class="btn blue" type="button" id="x-restart">Start Form ${esc(g.form)}</button></div>`;
          msg.querySelector('#x-restart').onclick = () => { app.innerHTML = ''; takePage(app); };
          return;
        }
        if (g.error === 'wait') return fail(`You can send again ${when(g.next_at)}. Your answers are saved on this device.`);
        if (g.error === 'signin') return fail('Sign in again to send your answers. They are saved on this device.');
        if (g.error === 'not_instructor') return fail(`The test needs a running instructor year, and we do not see one for <b>${esc(s.email)}</b>. <a href="${mailto(SUPPORT_EMAIL, 'My instructor test', `Hi, the test says I do not have an instructor year.\n\nMy account email: ${s.email}`)}">Email us</a> and we will sort it out. Your answers are saved on this device.`);
        if (g.error === 'not_ready') return fail(`The test is not open for your account yet. <a href="${mailto(SUPPORT_EMAIL, 'Open my instructor test', `Hi, the test says it is not open for my account yet.\n\nMy account email: ${s.email}`)}">Email us</a> and we will open it. Your answers are saved on this device.`);
        if (g.error === 'passed') { clearDraft(); send.textContent = 'Not sent'; msg.innerHTML = `${tip('You passed already, so there is nothing to grade. Your certificate is ready.', 'game', 'Good news')}<div class="btn-row"><a class="btn green" href="#/certificate">Your certificate →</a></div>`; membership.load(); return; }
        if (g.error) return fail(`That did not work (${esc(g.error)}). Your answers are saved on this device.`);
        fresh = { id: g.attempt, email: emailKey(), form: g.form || form, parts: g.parts || {}, total: Number(g.total) || 0, passed: !!g.passed, review: Array.isArray(g.review) ? g.review : [], at: new Date() };
        saveNext(g.next_form, g.attempt);
        clearDraft();
        location.hash = ROUTE;
        membership.load(); // a pass brings the certificate row
      };
    }
    drawCounts();
    show(parts.some(p => p.id === d.part) || d.part === 'review' ? d.part : parts[0].id);
    window.scrollTo(0, 0);
  }).catch(e => {
    console.error(e);
    el.querySelector('.exam-body').innerHTML = '<p class="muted">The test did not load. Check the connection and try again.</p>';
  });
}

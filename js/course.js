// course.js — #/course: the Certified Phenom Instructor course (twenty lessons over six weeks), and the gate every
// instructor page shares (#/course, #/exam, #/kit, #/certificate).
//   #/course       the weeks and their lessons, then the test, the Launch Kit and the certificate
//   #/course/<n>   one lesson: the video (COURSE_VIDEO_URLS in js/config.js), the script, drills, teach-back,
//                  check and answers (folded), "Practice in the trainer", "Print this lesson", "Mark done"
// Who may open it: ACCESS.course in js/membership.js (the instructor year, or a certificate). The words are
// library/course.json and library/course-01.json … course-20.json, built by tools/build-members.mjs from
// docs/products/certification-course/. "Mark done" lives on this device (cp.course.v1), per account email.
import { h, esc, tip, crumbs, mailto } from './ui.js';
import { auth } from './auth.js';
import { membership } from './membership.js';
import { loadBook, beadPicture } from './library.js';
import { stageByN } from './curriculum.js';
import { instructorBadge } from './instructors.js';
import { COURSE_VIDEO_URLS, CERTIFY_URL, SUPPORT_EMAIL } from './config.js';

const ROUTE = '#/course';
const HOME = '<a href="#/">Home</a>';
const DONE_KEY = 'cp.course.v1';
// The six weeks of docs/products/certification-course/syllabus.md (course.json may carry its own: weeks[{ n, title }]).
const WEEKS = { 1: 'Foundations', 2: 'Small friends and carrying', 3: 'Borrowing and all 34 moves', 4: 'Running sessions and classes', 5: 'Multiply, divide, and the mental picture', 6: 'Flash, stuck moments, and your first class' };
const pad2 = n => String(n).padStart(2, '0');
const lessonId = n => `L${pad2(n)}`;

// ───────── the instructor gate ─────────
// Draws the lock (or "checking…") and returns false when this account may not open `feature`
// (course, kit, exam or certificate).
const TITLES = { course: 'The instructor course comes with certification.', kit: 'The Launch Kit comes with certification.', exam: 'The test comes with certification.', certificate: 'Your certificate shows up here after you pass the test.' };
export function instructorGate(app, feature, trail) {
  if (membership.can(feature)) return true;
  const s = membership.state();
  const title = TITLES[feature] || 'This page comes with certification.';
  const eyebrow = '<span class="eyebrow blue">Instructors</span>';
  let body;
  if (!membership.loaded) body = `${eyebrow}<h2>Checking your account…</h2><p class="muted">One moment.</p>`;
  else if (feature === 'certificate' && membership.can('exam')) body = `${eyebrow}<h2>Your certificate comes when you pass the test.</h2>
      <p class="lede">Finish the lessons, then take the test. Pass with 32 of 40 and your certificate is ready to print.</p>
      <div class="btn-row"><a class="btn blue" href="#/exam">Go to the test</a><a class="btn secondary" href="${ROUTE}">The course</a></div>`;
  else if (feature === 'exam' && s.certified) body = `${eyebrow}<h2>You passed the test.</h2>
      <p class="lede">There is nothing more to take. Your certificate is ready.</p>
      <div class="btn-row"><a class="btn blue" href="#/certificate">Your certificate</a><a class="btn secondary" href="${ROUTE}">The course</a></div>`;
  else if (!auth.user && !s.preview) body = `${eyebrow}<h2>${title}</h2>
      <p class="lede">Already signed up? Sign in with the email you paid with and it opens.</p>
      <div class="btn-row"><a class="btn blue" href="#/start/signin">Email me a sign-in link →</a><a class="btn secondary" href="${CERTIFY_URL}">How certification works</a></div>`;
  else if (s.plan === 'instructor' && s.status === 'canceled') body = `${eyebrow}<h2>Your instructor year has ended.</h2>
      <p class="lede">Want to finish the course and the test? Email us and we will help.</p>
      <div class="btn-row"><a class="btn blue" href="${mailto(SUPPORT_EMAIL, 'My instructor course', `Hi, my instructor year has ended and I would like to finish the course.\n\nMy account email: ${s.email}`)}">Email us</a><a class="btn secondary" href="#/account">Your account</a></div>`;
  else body = `${eyebrow}<h2>${title}</h2>
      <p class="lede">We do not see a certification for <b>${esc(s.email)}</b>. Paid with a different email? Sign in with that one, or <a href="${mailto(SUPPORT_EMAIL, 'Link my certification', `Hi, please link my certification to ${s.email}.\n\nThe email I paid with: `)}">email us</a> and we will link them.</p>
      <div class="btn-row"><a class="btn blue" href="${CERTIFY_URL}">How certification works</a><a class="btn secondary" href="#/account">Your account</a></div>`;
  app.appendChild(h(`<div>${crumbs(HOME, ...trail)}
    <section class="section" style="margin-top:24px"><div class="block yellow split lib-lock cert-lock"><div>${body}</div><div class="lock-art">${instructorBadge({ cls: 'ibadge big' })}</div></div></section></div>`));
  return false;
}

// ───────── "Mark done", on this device ─────────
const who = () => membership.state().email || 'this-device';
function doneMap() { try { return (JSON.parse(localStorage.getItem(DONE_KEY)) || {})[who()] || {}; } catch { return {}; } }
function setDone(id, on) {
  try {
    const all = JSON.parse(localStorage.getItem(DONE_KEY)) || {}, mine = all[who()] || {};
    if (on) mine[id] = new Date().toISOString().slice(0, 10); else delete mine[id];
    all[who()] = mine; localStorage.setItem(DONE_KEY, JSON.stringify(all));
  } catch {}
}

// ───────── the video slot ─────────
// YouTube or Vimeo → a 16:9 player; an .mp4 → the browser's own player; nothing yet → a calm card.
export function videoHTML(url, title) {
  const u = String(url || '').trim();
  const frame = src => `<div class="course-video"><iframe src="${esc(src)}" title="${esc(title)}" loading="lazy" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
  let m;
  if (!u) return `<div class="course-video none"><div><span class="eyebrow">Video</span><p>The video is on its way. The words below are the same lesson.</p></div></div>`;
  if ((m = u.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/i))) return frame(`https://www.youtube-nocookie.com/embed/${m[1]}?rel=0`);
  if ((m = u.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/(\w+))?/i))) { const hh = u.match(/[?&]h=(\w+)/); const key = hh ? hh[1] : m[2]; return frame(`https://player.vimeo.com/video/${m[1]}${key ? `?h=${key}` : ''}`); }
  if (/^https?:\/\/\S+\.(mp4|m4v|webm)(\?\S*)?$/i.test(u) || /^[\w./-]+\.(mp4|m4v|webm)$/i.test(u)) return `<div class="course-video"><video playsinline controls preload="metadata" src="${esc(u)}">Your browser cannot play this video here.</video></div>`;
  if (/^https:\/\//i.test(u)) return `<div class="course-video none"><div><span class="eyebrow">Video</span><p><a class="link-arrow" href="${esc(u)}" target="_blank" rel="noopener">Watch the video</a></p><p class="small muted">The words below are the same lesson.</p></div></div>`;
  return `<div class="course-video none"><div><span class="eyebrow">Video</span><p>The video is on its way. The words below are the same lesson.</p></div></div>`;
}
// A note left for Hunter in the source ("[HUNTER: …]") never reaches the page.
const clean = html => String(html || '').replace(/\[HUNTER\b[^\]]*\]/g, '');

// ───────── #/course and #/course/<n> ─────────
export function course(app, n) {
  if (!instructorGate(app, 'course', n ? [`<a href="${ROUTE}">Course</a>`, `Lesson ${esc(n)}`] : ['Course'])) return;
  return n ? lessonPage(app, n) : courseIndex(app);
}

function courseIndex(app) {
  const s = membership.state();
  const el = h(`<div class="course-page">${crumbs(HOME, 'Course')}<div class="course-body"><p class="muted">Loading the course…</p></div></div>`);
  app.appendChild(el);
  loadBook('course').then(c => {
    if (!el.isConnected) return;
    const lessons = (c.lessons || []).slice().sort((a, b) => a.n - b.n);
    const done = doneMap(), count = lessons.filter(l => done[l.id || lessonId(l.n)]).length;
    const next = lessons.find(l => !done[l.id || lessonId(l.n)]);
    const weeks = [...new Set(lessons.map(l => l.week))].sort((a, b) => a - b);
    const weekName = w => (Array.isArray(c.weeks) && c.weeks.find(x => Number(x.n) === Number(w))?.title) || WEEKS[w] || '';
    const row = l => { const id = l.id || lessonId(l.n), isDone = !!done[id], isNext = next && next.n === l.n;
      return `<li class="${isDone ? 'done' : ''} ${isNext ? 'next' : ''}"><span class="ix">${isDone ? '✓' : l.n}</span><div><a href="${ROUTE}/${l.n}">${esc(l.title)}</a>${l.lede ? `<div class="lede-line">${esc(l.lede)}</div>` : ''}<div class="meta">${[l.video && COURSE_VIDEO_URLS[l.id || lessonId(l.n)] && `Video ${esc(l.video)}`, l.time && esc(l.time)].filter(Boolean).join(' · ')}</div></div><a class="btn sm ${isNext ? 'blue' : 'secondary'} go" href="${ROUTE}/${l.n}">${isDone ? 'Again' : isNext ? 'Next' : 'Open'}</a></li>`; };
    const passed = s.certified ? `You passed${s.cert.passedOn ? ` on ${s.cert.passedOn.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}.` : '';
    el.querySelector('.course-body').innerHTML = `<section class="page-head"><div>
        <span class="eyebrow blue">Certified Phenom Instructor</span>
        <h1>The instructor course</h1>
        <p class="lede">${lessons.length} lessons over six weeks, about five hours a week. Each lesson has the lesson to read, drills on your own soroban, a teach-back and a five-question check. Videos are being filmed and appear in each lesson as they are ready.</p>
        <div class="course-progress"><div class="bar"><i style="width:${lessons.length ? Math.round(100 * count / lessons.length) : 0}%"></i></div><span class="small">${count} of ${lessons.length} done</span></div>
        <div class="btn-row">${next ? `<a class="btn big blue" href="${ROUTE}/${next.n}">${count ? `Go on with Lesson ${next.n}` : 'Start Lesson 1'} →</a>` : `<a class="btn big blue" href="${s.certified ? '#/certificate' : '#/exam'}">${s.certified ? 'Your certificate' : 'Take the test'} →</a>`}</div>
      </div><div class="art">${instructorBadge({ year: s.certified ? String(s.cert.passedOn?.getFullYear() || '') : '', cls: 'ibadge head' })}</div></section>
      ${tip('Do one lesson at a time. Teach it to someone before you start the next one.', 'parent', 'Coach tip')}
      ${weeks.map(w => `<section class="section course-week" style="margin-top:44px">
        <div class="section-head"><span class="eyebrow">Week ${esc(w)}</span><h2>${esc(weekName(w))}</h2></div>
        <ul class="lesson-list course-list">${lessons.filter(l => l.week === w).map(row).join('')}</ul>
      </section>`).join('')}
      ${s.certified ? '' : `<section class="section" style="margin-top:56px"><div class="block blue course-test">
        <span class="eyebrow blue">The test</span>
        <h2>Take the test when the drills feel calm</h2>
        <p class="lede">40 questions in three parts, 60 minutes. Pass with 32 of 40. Not this time? We coach you until you pass.</p>
        <div class="btn-row"><a class="btn blue" href="#/exam">Go to the test</a></div>
      </div></section>`}
      <section class="section" style="margin-top:28px"><div class="block yellow course-kit">
        <span class="eyebrow orange">Launch Kit</span>
        <h2>Everything for your first class</h2>
        <p class="lede">Class plans, a price sheet, a parent flyer, a sign-up script and more. Print what you need.</p>
        <div class="btn-row"><a class="btn" href="#/kit">Open the Launch Kit</a></div>
      </div></section>
      <section class="section" style="margin-top:28px"><div class="block green course-cert">
        <span class="eyebrow green">Certificate</span>
        <h2>${s.certified ? 'Your certificate is ready' : 'Your certificate'}</h2>
        <p class="lede">${s.certified ? `${passed} Print it, or save it as a PDF. Then send your directory listing.` : 'It comes when you pass the test. Your name goes on it, and you print it at home.'}</p>
        <div class="btn-row">${s.certified ? '<a class="btn green" href="#/certificate">Your certificate</a><a class="btn secondary" href="#/certificate/listing">Get listed</a>' : '<a class="btn secondary" href="#/exam">Go to the test</a>'}</div>
      </div></section>`;
  }).catch(e => {
    console.error(e);
    el.querySelector('.course-body').innerHTML = '<p class="muted">The course did not load. Check the connection and try again.</p>';
  });
}

// The four parts of every lesson (syllabus.md), as the eyebrow over each part's own heading.
const SECTION_EYEBROW = { script: '1 · Watch or read', drills: '2 · Drills', teachback: '3 · Teach it back', check: '4 · Check yourself' };
function lessonPage(app, nArg) {
  const n = Number(nArg);
  const el = h(`<div class="course-lesson">${crumbs(HOME, `<a href="${ROUTE}">Course</a>`, `Lesson ${esc(nArg)}`)}<div class="course-body"><p class="muted">Loading the lesson…</p></div></div>`);
  app.appendChild(el);
  if (!Number.isInteger(n) || n < 1) { el.querySelector('.course-body').innerHTML = `<div class="try-box"><h2>No lesson here</h2><a class="btn blue" href="${ROUTE}">All lessons</a></div>`; return; }
  const none = () => { el.querySelector('.course-body').innerHTML = `<div class="try-box"><h2>No lesson here</h2><p>The course has 20 lessons.</p><a class="btn blue" href="${ROUTE}">All lessons</a></div>`; };
  loadBook('course').catch(() => null).then(c => {
    if (c?.lessons && !c.lessons.some(x => Number(x.n) === n)) { none(); return null; }
    return Promise.all([loadBook(`course-${pad2(n)}`), c]);
  }).then(res => {
    if (!res || !el.isConnected) return;
    const [l, c] = res;
    const total = c?.lessons?.length || 20, id = l.id || lessonId(n);
    const has = k => !c || c.lessons.some(x => Number(x.n) === k);
    const prev = n > 1 && has(n - 1) ? n - 1 : 0, next = n < total && has(n + 1) ? n + 1 : 0;
    const stages = (Array.isArray(l.stages) ? l.stages : []).map(Number).filter(k => stageByN(k));
    const isDone = () => !!doneMap()[id];
    const sec = s => s.kind === 'answers'
      ? `<details class="course-answers"><summary>${esc(s.title || 'Answers')}</summary><div class="lib-doc">${clean(s.html)}</div></details>`
      : `<section class="course-sec kind-${esc(s.kind)}">${SECTION_EYEBROW[s.kind] ? `<span class="eyebrow blue">${SECTION_EYEBROW[s.kind]}</span>` : ''}<div class="lib-doc">${/<h2[\s>]/.test(s.html) ? '' : `<h2 class="page-title">${esc(s.title || '')}</h2>`}${clean(s.html)}</div></section>`;
    const practice = stages.length === 1
      ? `<a class="btn blue" href="#/stage/${stages[0]}">Practice in the trainer</a>`
      : stages.length ? `<span class="course-practice">Practice in the trainer: ${stages.map(k => `<a class="btn sm secondary" href="#/stage/${k}">Stage ${k}</a>`).join('')}</span>` : '';
    el.querySelector('.course-body').innerHTML = `<span class="eyebrow blue">Week ${esc(l.week ?? '')} · Lesson ${n} of ${total}${l.time ? ` · ${esc(l.time)}` : ''}</span>
      <h1>${esc(l.title)} <span class="badge-xp course-tick"${isDone() ? '' : ' hidden'}>✓ done</span></h1>
      ${l.lede ? `<p class="lede">${esc(l.lede)}</p>` : ''}
      ${videoHTML(COURSE_VIDEO_URLS[id], `Lesson ${n}: ${l.title}`)}
      <div class="btn-row course-tools">${practice}<button class="btn secondary" type="button" id="course-print">Print this lesson</button></div>
      ${(l.sections || []).map(sec).join('')}
      <div class="course-foot"><button class="btn big" type="button" id="course-done"></button><span class="small muted" id="course-done-note" aria-live="polite"></span></div>
      <nav class="pb-nav" aria-label="Course lessons">
        ${prev ? `<a class="btn secondary" href="${ROUTE}/${prev}">← Lesson ${prev}</a>` : `<a class="btn secondary" href="${ROUTE}">← All lessons</a>`}
        ${next ? `<a class="btn blue" href="${ROUTE}/${next}">Lesson ${next} →</a>` : `<a class="btn blue" href="#/exam">The test →</a>`}
      </nav>
      <p class="center small pb-all"><a href="${ROUTE}">All lessons</a></p>`;
    const body = el.querySelector('.course-body');
    body.querySelectorAll('.course-answers .lib-doc > h2.page-title:first-child').forEach(x => x.remove()); // the fold already says "Answers"
    body.querySelectorAll('.beads[data-n]').forEach(sp => { sp.innerHTML = beadPicture(Number(sp.dataset.n)); });
    const btn = body.querySelector('#course-done'), note = body.querySelector('#course-done-note'), tick = body.querySelector('.course-tick');
    const draw = () => { const d = isDone(); btn.textContent = d ? 'Done ✓' : 'Mark done'; btn.className = `btn big ${d ? 'green' : 'blue'}`; btn.setAttribute('aria-pressed', String(d)); tick.hidden = !d; note.textContent = d ? 'Tap again to undo.' : ''; };
    draw();
    btn.onclick = () => { setDone(id, !isDone()); draw(); };
    // Print with the answers open, then fold them back the way they were.
    body.querySelector('#course-print').onclick = () => {
      const shut = [...body.querySelectorAll('details:not([open])')];
      shut.forEach(d => { d.open = true; });
      window.addEventListener('afterprint', () => shut.forEach(d => { d.open = false; }), { once: true });
      window.print();
    };
  }).catch(e => {
    console.error(e);
    el.querySelector('.course-body').innerHTML = `<div class="try-box"><h2>This lesson did not load</h2><p>Check the connection and try again.</p><a class="btn blue" href="${ROUTE}">All lessons</a></div>`;
  });
}

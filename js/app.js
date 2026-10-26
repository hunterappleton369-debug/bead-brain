// app.js — router and pages for Child Phenoms.
import { injectDefs, logo, badge, icon, burst } from './art.js';
import { AbacusView } from './abacus.js';
import { STAGES, stageByN, lessonKey } from './curriculum.js';
import { store, levelFromXP, today } from './store.js';
import { runDrill, runSequence, confetti, toast, makeProblem } from './drills.js';
import { MAIN_LADDER, TIMES_LADDER, runLadder, renderChart, percentile } from './ladder.js';
import { GUIDE_HTML, PLAN_INTRO, HOW_IT_MOVES, TRICKS, FORMULAS_HTML } from './guide.js';
import { STAGE_PLAIN, PARENT_LINE, FIRST_STEPS, needs, coachTip, stuckHelp } from './coach.js';
import { auth, isAuthHash } from './auth.js';
import { membership, instructor } from './membership.js';
import { account } from './account.js';
import { library, libraryBook, printSheet } from './library.js';
import { instructors } from './instructors.js';
import { playbook } from './playbook.js';
import { quickstart } from './quickstart.js';
import { bonus } from './bonus.js';
import { course } from './course.js';
import { exam } from './exam.js';
import { kit } from './kit.js';
import { certificate } from './certificate.js';
import { ownedItems, linksHTML, revealAudio } from './owned.js';
import { UNIVERSITY_URL, MEMBER_PRICE, SUPPORT_EMAIL } from './config.js';

injectDefs();
document.getElementById('logo').innerHTML = logo();
document.getElementById('logo-foot').innerHTML = logo();
const app = document.getElementById('app');
const h = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const COACH = '<img src="img/coach-bolt-sm.webp" alt="" width="56" height="56">';
const tip = (text, cls = '', who = 'Coach tip') => `<div class="tip ${cls}">${COACH}<div class="bubble"><span class="who">${who}</span>${text}</div></div>`;

// ───────────── helpers ─────────────
function ensureProfile() {
  if (store.profile) return store.profile;
  const p = store.addProfile('Player 1', 7);
  toast('Added "Player 1". Change the name under Family.');
  return p;
}
function stageUnlocked(n) {
  if (n === 1) return true;
  const p = store.profile; if (!p) return false;
  return !!(p.bosses[n - 1] && p.bosses[n - 1].passed);
}
function stageProgress(stage) {
  const p = store.profile; if (!p) return { done: 0, total: stage.lessons.length };
  const done = stage.lessons.filter(l => p.lessons[lessonKey(stage, l)]?.done).length;
  return { done, total: stage.lessons.length };
}
function currentStage() {
  for (const s of STAGES) { if (!stageUnlocked(s.n)) return STAGES[Math.max(0, s.n - 2)]; const p = store.profile; if (!p || !p.bosses[s.n]?.passed) return s; }
  return STAGES[STAGES.length - 1];
}
function nextLesson(stage) {
  const p = store.profile;
  return stage.lessons.find(l => !(p && p.lessons[lessonKey(stage, l)]?.done)) || null;
}
function lessonsDone() { const p = store.profile; return p ? Object.values(p.lessons).filter(l => l.done).length : 0; }
function upgradeCallouts(root) {
  root.querySelectorAll('.callout').forEach(el => {
    const lbl = el.querySelector('b.lbl');
    const who = lbl ? lbl.textContent : 'Coach tip';
    if (lbl) lbl.remove();
    const cls = el.classList.contains('parent') ? 'parent' : el.classList.contains('science') ? 'science' : el.classList.contains('warn') ? 'warn' : 'game';
    el.replaceWith(h(tip(el.innerHTML.trim(), cls, who)));
  });
}
function activateDemos(root) {
  upgradeCallouts(root);
  root.querySelectorAll('.demo').forEach(el => {
    if (el.classList.contains('free')) {
      const box = h('<div class="try-box"></div>');
      el.replaceWith(box);
      new AbacusView(box, { rods: Number(el.dataset.rods) || 5, interactive: true });
      box.classList.add('abacus-sm');
      return;
    }
    const start = Number(el.dataset.start || 0);
    const apply = (el.dataset.apply || '').split(',').filter(Boolean).map(Number);
    let notes = []; try { notes = JSON.parse(el.dataset.notes || '[]'); } catch {}
    const maxVal = Math.max(start, Math.abs(apply.reduce((a, b) => a + Math.max(b, 0), start)), ...apply.map(Math.abs));
    const rods = Math.max(3, String(maxVal).length + 1);
    const label = el.dataset.label || '';
    const wrap = h(`<div class="demo-card"><div class="lbl">${esc(label)}</div><div class="ab"></div><div class="btn-row" style="justify-content:center;margin:6px 0 0"><button class="btn sm blue play">▶ Play</button><button class="btn sm ghost reset">Reset</button></div></div>`);
    el.replaceWith(wrap);
    const ab = new AbacusView(wrap.querySelector('.ab'), { rods, interactive: false });
    wrap.classList.add('abacus-sm');
    ab.setValue(start);
    let busy = false;
    wrap.querySelector('.play').onclick = async () => {
      if (busy) return; busy = true;
      ab.setValue(start); ab.clearHighlights();
      for (let i = 0; i < apply.length; i++) {
        if (notes[i]) { ab.caption(esc(notes[i]), 'big'); await new Promise(r => setTimeout(r, 1400)); }
        await ab.play(apply[i], { speed: 1 });
        await new Promise(r => setTimeout(r, 400));
      }
      ab.caption(`= ${ab.value.toLocaleString()}`, 'big');
      busy = false;
    };
    wrap.querySelector('.reset').onclick = () => { if (!busy) { ab.setValue(start); ab.clearHighlights(); ab.caption(''); } };
  });
}
function setNav(path) {
  const first = path.split('/')[0];
  const tab = { exam: 'course', kit: 'course', certificate: 'course', bonus: 'library' }[first] || first; // pages that live under a nav tab
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#/' + tab));
  document.querySelectorAll('#nav [data-needs]').forEach(a => { a.hidden = !membership.can(a.dataset.needs); }); // Course: instructors only
  const p = store.profile;
  const u = auth.user;
  const dot = u ? `<span class="sync-dot ${auth.lastError ? 'off' : ''}" aria-hidden="true"></span>` : '';
  document.getElementById('topcta').innerHTML = p
    ? `<a class="btn sm secondary" href="#/family" title="${u ? `Signed in as ${esc(u.email)}` : 'Family'}">${dot}${esc(p.name)} · Lv ${levelFromXP(p.xp).level}</a>`
    : u ? `<a class="btn sm secondary" href="#/family" title="Signed in as ${esc(u.email)}">${dot}Family</a>`
    : `<a class="btn sm" href="#/start">Start free</a>`;
}
function syncStatusText() {
  if (auth.syncing) return 'Saving…';
  if (auth.lastError) return 'Could not reach the server. Progress is safe on this device.';
  if (auth.lastSync) { const m = Math.round((Date.now() - auth.lastSync) / 60000); return m < 1 ? 'Saved just now' : `Saved ${m} min ago`; }
  return 'Signed in';
}
const crumbs = (...items) => `<div class="crumbs">${items.map((it, i) => i ? `<span>${it}</span>` : it).join('')}</div>`;
const stageColor = s => ({ sprout: 'green', explorer: 'orange', apprentice: 'blue', adept: 'purple', ace: 'yellow', wizard: 'purple', champion: 'red', prodigy: 'pink', grandmaster: 'teal', legend: 'blue' }[s.key] || 'blue');

// ───────────── the University gate: stages 2 to 10 ─────────────
// Stage 1 (every lesson, drill and its boss) is free for everyone, signed in or not. Stages 2 to 10 need
// ACCESS.stages in js/membership.js. The gate only decides what renders: a child's saved progress in a later
// stage is never touched, so it is all there again when the membership starts again.
const stagePaid = n => Number(n) !== 1 && membership.loaded && !membership.can('stages'); // show the lock (only once we know)
// What a page that depends on stage access was drawn with (null when it does not); a change redraws it.
const accessSig = () => JSON.stringify([membership.loaded, membership.can('stages'), membership.can('library'), membership.state().email, !!auth.user]);
let accessShown = null;
const noteAccess = () => { accessShown = accessSig(); };
// The test and the listing form are half-filled forms: they redraw only when what the account may open changes.
const formSig = () => JSON.stringify([membership.loaded, membership.can('exam'), membership.can('certificate'), membership.state().email, !!auth.user]);
let formShown = null;
function stageGateBody(st) {
  if (!membership.loaded) return `<span class="eyebrow blue">Stage ${st.n} · ${esc(st.name)}</span><h2>Checking your membership…</h2><p class="muted">One moment.</p>`;
  const m = membership.state(), p = store.profile;
  const saved = p && (Object.keys(p.lessons).some(k => k.startsWith(`s${st.n}.`)) || p.bosses[st.n]);
  const signedIn = !!(auth.user || m.preview);
  return `<span class="eyebrow green">Stage ${st.n} · ${esc(st.name)}</span>
    <h2>Stage ${st.n} opens with Child Phenom University</h2>
    <p class="lede">Free for 14 days, then $${MEMBER_PRICE} a month. Cancel any time from your account page.</p>
    <div class="btn-row"><a class="btn green" href="${UNIVERSITY_URL}">Start the free test drive</a></div>
    <p class="stage-signin"><a class="link-arrow" href="#/start/signin" data-switch>Already a member? Sign in with the email you paid with</a></p>
    ${saved ? `<p class="small">${esc(p.name)}'s work in ${esc(st.name)} is saved. It comes back when the membership starts again.</p>` : ''}
    ${membership.can('library') ? `<p class="small">Your ${esc(st.name)} pages are still in the library. <a class="link-arrow" href="#/library/${st.n}">Open them</a></p>` : ''}
    ${signedIn && m.email ? `<p class="small muted stage-who">You are signed in as <b>${esc(m.email)}</b>.</p>` : ''}`;
}
function wireSwitch(root) {
  // Signed in with another email: sign out first, so the sign-in page asks for the email they paid with.
  root.querySelectorAll('[data-switch]').forEach(a => { if (auth.user) a.onclick = async e => { e.preventDefault(); a.textContent = 'One moment…'; await auth.signOut(); location.hash = '#/start/signin'; }; });
}
// Called by the router before any stage, lesson, drill, quest, boss or worksheet route. False = the gate was drawn.
function stageGate(n) {
  const st = stageByN(n);
  if (!st || st.n === 1) return true; // unknown stages fall through to "not found"; Stage 1 never asks
  noteAccess();
  if (membership.can('stages')) return true;
  const el = h(`<div>${crumbs('<a href="#/">Home</a>', `<a href="#/plan">The plan</a>`, `Stage ${st.n}`)}
    <section class="section" style="margin-top:24px"><div class="block yellow split lib-lock stage-lock"><div>${stageGateBody(st)}</div><div class="lock-art">${icon('lock', 'ic')}</div></div></section></div>`);
  app.appendChild(el);
  wireSwitch(el);
  return false;
}

// ───────────── home ─────────────
function home() { return store.profile ? dashboard() : marketing(); }

function trailHTML(preview = false) {
  const p = store.profile;
  const cur = p ? currentStage() : null;
  noteAccess();
  return `<div class="trail">${STAGES.map(s => {
    const paid = stagePaid(s.n); // stages 2 to 10 without a membership: a lock and one line, progress kept but not shown
    const unlocked = !paid && (preview || stageUnlocked(s.n)); const done = !preview && p && p.bosses[s.n]?.passed; const pr = stageProgress(s);
    const isCur = cur && cur.n === s.n;
    const foot = paid ? `<div class="sub lock-line">${icon('lock', 'ic')}<span>Opens with your University test drive</span></div>`
      : preview ? `<div class="sub faint">${s.time}</div>` : `<div class="bar"><i style="width:${Math.round(100 * pr.done / pr.total)}%"></i></div><div class="sub">${pr.done}/${pr.total} lessons</div>`;
    return `<a class="stage-node ${unlocked ? '' : 'locked'} ${paid ? 'paid' : ''} ${done ? 'done' : ''} ${isCur ? 'current' : ''}" href="${preview && !paid ? '#/plan' : '#/stage/' + s.n}"><span class="num">${s.n}</span>${done ? '<span class="check">✓</span>' : ''}${badge(s.key)}<div class="name">${s.name}</div><div class="sub">${esc(s.tagline)}</div>${foot}</a>`;
  }).join('')}</div>`;
}

function marketing() {
  const el = h(`<div>
    <section class="hero">
      <div>
        <span class="eyebrow blue">Mental math for ages 5 to 12</span>
        <h1>Math in their head. <span class="hi">Faster than a calculator.</span></h1>
        <p class="lede">Child Phenoms turns the Japanese abacus into a mental-math superpower. Ten stages, fifteen minutes a day, and a score you can watch climb.</p>
        <div class="btn-row"><a class="btn big blue" href="#/start">Start free</a><a class="btn big secondary" href="#/plan">See the plan</a></div>
        <p class="small faint">No account needed. Works on any laptop or tablet.</p>
      </div>
      <div class="hero-art">${burst('15 min\na day')}<img src="img/hero-kid.webp" alt="A child in a superhero cape holding a soroban abacus, picturing beads in a thought bubble" width="880" height="880" fetchpriority="high"></div>
    </section>
    <div class="strip"><span>10 stages</span><span>76 lessons</span><span>Progress you can see</span><span>Built for parents, not teachers</span></div>

    <section class="section">
      <div class="section-head"><span class="eyebrow">Why families do it</span><h2>Three things your child walks away with</h2></div>
      <div class="cols">
        <div>${icon('speed')}<h3>Real speed</h3><p>Adding, subtracting, multiplying and dividing in the head, in seconds. Not a trick. A picture of beads that does the work.</p></div>
        <div>${icon('confidence')}<h3>Confidence that shows</h3><p>A child who is fast at math walks into every classroom a little taller. Teachers notice in the first week.</p></div>
        <div>${icon('progress')}<h3>Progress you can see</h3><p>Every drill is scored. Every test adds a dot to the chart. You will watch it climb, and so will they.</p></div>
      </div>
    </section>

    <section class="section">
      <div class="section-head"><span class="eyebrow">How it works</span><h2>Learn the beads. Then take them away.</h2><p>The whole program in three moves.</p></div>
      <div class="zig"><div class="zig-art"><img src="img/soroban.webp" alt="A hand moving a bead on a soroban" loading="lazy"></div><div><div class="n">1</div><h3>Learn the beads</h3><p>Your child reads and sets numbers on a real soroban until it is instant. Then the 34 bead moves, one at a time, each drilled on problems built to need exactly that move.</p></div></div>
      <div class="zig"><div class="zig-art"><img src="img/mental-abacus.webp" alt="A child with eyes closed picturing an abacus" loading="lazy"></div><div><div class="n">2</div><h3>Take the beads away</h3><p>Eyes-closed games, numbers read aloud, and flash rounds grow a picture of the abacus in the mind, one column at a time. The picture does the math.</p></div></div>
      <div class="zig"><div class="zig-art"><img src="img/score-climb.webp" alt="A child superhero on top of a rising chart holding a trophy" loading="lazy"></div><div><div class="n">3</div><h3>Watch it climb</h3><p>Every few weeks, a short Bead Score test. The result lands on a chart against typical kids of the same age. Dots go up. Grandparents get a video.</p></div></div>
    </section>

    <section class="section">
      <div class="section-head"><span class="eyebrow">The journey</span><h2>Ten stages, Sprout to Legend</h2><p>Each stage ends with a boss test. Beat it, earn the badge, unlock the next.</p></div>
      ${trailHTML(true)}
      <div class="btn-row" style="margin-top:22px"><a class="link-arrow" href="#/plan">What they learn at each stage</a></div>
    </section>

    <section class="section">
      <div class="block yellow split">
        <div>
          <span class="eyebrow">For parents</span>
          <h2>You do not need to be a math person.</h2>
          <p class="lede">You need a chair next to your child and fifteen minutes. The lessons explain everything, the drills pick the right problems, and a coach tip tells you what to say when they get stuck.</p>
          <ul>
            <li><b>Sit beside, not across.</b> Ask "free beads, or friend?" and wait.</li>
            <li><b>One lesson a day, at most.</b> Short and daily beats long and weekly.</li>
            <li><b>Praise the move, not the answer.</b> The formula said out loud is the skill.</li>
          </ul>
          <div class="btn-row"><a class="btn secondary" href="#/guide">Read the parent guide</a></div>
        </div>
        <img src="img/parent-child.webp" alt="A parent beside a child using a soroban at a laptop" loading="lazy">
      </div>
    </section>

    <section class="section">
      <div class="section-head"><span class="eyebrow purple">The science</span><h2>Studied more than almost any kids' activity</h2></div>
      <div class="cols">
        <div><h3>Three randomized trials</h3><p>Children trained on the abacus beat children given extra ordinary math at arithmetic, in India, China and with older students.</p></div>
        <div><h3>A different part of the brain</h3><p>Expert calculators light up the areas for pictures and hand movement, not the language areas the rest of us use.</p></div>
        <div><h3>A picture that grows</h3><p>The mental abacus holds a few columns at a time, so this course adds one rod at a time. Slow at first, then very fast.</p></div>
      </div>
      <div class="btn-row"><a class="link-arrow" href="#/guide">The studies, in the parent guide</a></div>
    </section>

    <section class="section">
      <div class="block blue center">
        <span class="eyebrow blue">Start today</span>
        <h2>The first lesson takes ten minutes.</h2>
        <p class="lede" style="margin:0 auto 20px">Set up your child's profile, sit down together, and move the first bead. The soroban can arrive next week.</p>
        <div class="btn-row" style="justify-content:center"><a class="btn big" href="#/start">Start free</a><a class="btn big secondary" href="#/stage/1">Peek at stage 1</a></div>
      </div>
    </section>
  </div>`);
  app.appendChild(el);
}

function dashboard() {
  const p = store.profile;
  const cur = currentStage();
  const next = nextLesson(cur);
  const lvl = levelFromXP(p.xp);
  const lastTest = p.tests.filter(t => t.ladder === 'main').slice(-1)[0];
  const badges = Object.values(p.bosses).filter(b => b.passed).length;
  const fresh = lessonsDone() === 0;
  const steps = p.firstSteps || {};
  const el = h(`<div>
    <section class="page-head">
      <div>
        <span class="eyebrow blue">Stage ${cur.n} · ${esc(cur.tagline)}</span>
        <h1>Hi, ${esc(p.name)}!</h1>
        <p class="lede">${next ? `Up next: <b>${esc(next.title)}</b>, about ${next.minutes} minutes.` : (p.bosses[cur.n]?.passed ? 'Every lesson done. Keep climbing the ladder.' : `All ${cur.name} lessons done. Time for the boss.`)}</p>
        <div class="btn-row"><a class="btn big blue" href="#/stage/${cur.n}${next ? '/lesson/' + next.key : '/boss'}">${next ? 'Continue' : 'Fight the boss'} →</a><a class="btn big secondary" href="#/stage/${cur.n}">${cur.name} lessons</a></div>
      </div>
      <div class="art">${badge(cur.key)}</div>
    </section>

    <div class="stat-row">
      <div class="stat"><b>${lvl.level}</b><span>level · ${p.xp} XP</span><div class="bar" style="margin-top:8px"><i style="width:${lvl.pct}%"></i></div></div>
      <div class="stat"><b>${p.streak}</b><span>day streak</span></div>
      <div class="stat"><b>${badges}</b><span>badges</span></div>
      <div class="stat"><b>${lastTest ? lastTest.rung : '–'}</b><span>${lastTest ? `Bead Score rung · ahead of ~${percentile(lastTest.rung, lastTest.age || p.age)}% of age ${lastTest.age || p.age}` : 'Bead Score · take the test from Ace'}</span></div>
    </div>

    ${fresh ? `<section class="section" style="margin-top:48px"><div class="block green"><span class="eyebrow green">First steps</span><h2>Three things before the first lesson</h2>
      <ul class="checklist">${FIRST_STEPS.map(s => `<li class="${steps[s.key] ? 'done' : ''}" data-k="${s.key}"><span class="box">${steps[s.key] ? '✓' : ''}</span><span>${s.text}</span></li>`).join('')}</ul>
      <div class="btn-row"><a class="btn" href="#/stage/1/lesson/hold">Open the first lesson →</a></div></div></section>` : ''}

    ${stagePaid(cur.n) ? `<section class="section" style="margin-top:48px"><div class="block yellow lib-lock stage-lock">${stageGateBody(cur)}</div></section>` : dailyQuestHTML(cur)}

    <section class="section">
      <div class="section-head"><span class="eyebrow">The trail</span><h2>Ten stages</h2><p>Pass a boss to unlock the next stage. Tap a stage to see its lessons.</p></div>
      ${trailHTML(false)}
    </section>
  </div>`);
  app.appendChild(el);
  wireSwitch(el);
  el.querySelectorAll('.checklist li').forEach(li => li.onclick = () => { store.update(x => { x.firstSteps = x.firstSteps || {}; x.firstSteps[li.dataset.k] = !x.firstSteps[li.dataset.k]; }); render(); });
}

function dailyQuestHTML(stage) {
  const p = store.profile;
  const q = p.quest && p.quest.date === today() ? p.quest : { date: today(), done: [] };
  const items = stage.daily || [];
  const allDone = items.length && q.done.length >= items.length;
  return `<section class="section" style="margin-top:48px">
    <div class="section-head"><span class="eyebrow orange">${allDone ? 'Done for today' : 'Today'}</span><h2>Daily quest · ${stage.name}</h2><p>Three short drills. All three earns a bonus. On a busy day, this alone is enough.</p></div>
    <ul class="lesson-list">${items.map((d, i) => `<li class="${q.done.includes(i) ? 'done' : ''}"><span class="ix">${q.done.includes(i) ? '✓' : i + 1}</span><div><a href="#/quest/${stage.n}/${i}">${esc(d.label)}</a><div class="meta">${d.count} problems${d.mode === 'mental' ? ' · mental' : ''}${d.kind === 'flash' ? ' · flash' : ''}</div></div><a class="btn sm secondary go" href="#/quest/${stage.n}/${i}">${q.done.includes(i) ? 'Again' : 'Go'}</a></li>`).join('')}</ul>
  </section>`;
}

function quest(stageN, idx) {
  const stage = stageByN(stageN); const d = stage.daily[Number(idx)];
  ensureProfile();
  const el = h(`<div>${crumbs('<a href="#/">Home</a>', 'Daily quest')}<h1>${esc(d.label)}</h1>${tip(coachTip(d, stage))}<div class="holder"></div></div>`);
  app.appendChild(el);
  runDrill(el.querySelector('.holder'), { ...d, target: { acc: 0.7 } }, { xpKey: 'quest', onFinish: (r, summary) => {
    if (r.passed) {
      store.update(p => { const q = p.quest && p.quest.date === today() ? p.quest : { date: today(), done: [] }; if (!q.done.includes(Number(idx))) q.done.push(Number(idx)); p.quest = q; });
      const q = store.profile.quest;
      if (q.done.length >= stage.daily.length && !q.bonus) { store.update(p => { p.quest.bonus = true; }); store.addXP(50, 'quest bonus'); confetti(); toast('Daily quest complete! +50 XP'); }
    }
    const row = summary.querySelector('.btn-row'); row.appendChild(h('<a class="btn blue" href="#/">Back to today</a>'));
  } });
}

// ───────────── sign-up / onboarding ─────────────
const RESEND_WAIT = 30; // seconds before "Resend link" works (Supabase also limits how often a link can go out)
// Where to go after the magic link signs them in, when it is not #/family. Kept per tab (sessionStorage), and
// also on the device for an hour, because a link tapped in Gmail or Outlook usually opens in a new tab.
const NEXT_KEY = 'cp.after-signin';
const NEXT_OK = /^#\/(playbook(\/(\d+|listen))?|stage\/\d+(\/(lesson\/[\w-]+|boss))?|bonus(\/(valedictorian|future)(\/\d+)?)?|course(\/\d+)?|exam(\/take)?|certificate(\/listing)?|kit(\/[a-z0-9-]+(\/\d+)?)?|library|account|quickstart)$/; // only these may be sent back to
function rememberNext(hash) {
  try { if (NEXT_OK.test(hash)) { sessionStorage.setItem(NEXT_KEY, hash); localStorage.setItem(NEXT_KEY, JSON.stringify({ hash, at: Date.now() })); } else { sessionStorage.removeItem(NEXT_KEY); localStorage.removeItem(NEXT_KEY); } } catch {}
}
function takeNext() {
  let hash = '';
  try {
    hash = sessionStorage.getItem(NEXT_KEY) || '';
    if (!hash) { const l = JSON.parse(localStorage.getItem(NEXT_KEY) || 'null'); if (l && Date.now() - l.at < 3600e3) hash = l.hash; }
    sessionStorage.removeItem(NEXT_KEY); localStorage.removeItem(NEXT_KEY);
  } catch {}
  return NEXT_OK.test(hash) ? hash : '';
}
let prevHash = ''; // the page before this one: the sign-in page sends people back to the Playbook if they came from it
const cleanEmail = v => String(v || '').trim().toLowerCase();

// The "check your email" state after a magic link goes out. Replaces the sign-up form in place.
function checkEmailHTML(email, name) {
  return `<div class="try-box check-email" style="padding:28px">
    <span class="eyebrow blue">One tap to sign in</span>
    <h2 style="margin:0 0 10px">Check your email.</h2>
    <p style="margin:0 0 6px">We sent a sign-in link to <b class="ce-addr">${esc(email)}</b>.</p>
    <p style="margin:0 0 6px">Tap the link in that email. ${name ? `${esc(name)}'s progress comes with you to any device.` : 'You will be signed in.'}</p>
    <p class="ce-spam">Look in spam or promotions if it is not there in a minute.</p>
    <div class="btn-row ce-mail"><a class="btn secondary" href="https://mail.google.com" target="_blank" rel="noopener">Open Gmail</a><a class="btn secondary" href="https://outlook.live.com" target="_blank" rel="noopener">Open Outlook</a></div>
    <div class="ce-resend"><button class="btn ghost" type="button" id="resend" disabled>Resend link</button><span class="small muted" id="resend-note" aria-live="polite"></span></div>
    <p class="small faint" style="margin:10px 0 0">Wrong email? <a href="#/start/signin" id="ce-again">Type it again</a></p>
    ${name ? '<div class="btn-row" style="margin-bottom:0"><a class="btn big blue" href="#/">Start the first lesson →</a></div>' : ''}
  </div>`;
}
// "Resend link" stays off for RESEND_WAIT seconds after each send, counting down on the button.
function resendTimer(btn) {
  let left = RESEND_WAIT; btn.disabled = true;
  const tick = () => {
    if (!btn.isConnected) return clearInterval(t);
    if (left <= 0) { clearInterval(t); btn.disabled = false; btn.textContent = 'Resend link'; return; }
    btn.textContent = `Resend link in ${left--} s`;
  };
  const t = setInterval(tick, 1000); tick();
}
function linkFailedHTML(msg, name) {
  return `<div class="try-box" style="padding:28px">
    <span class="eyebrow red">The email did not go out</span>
    <h2 style="margin:0 0 10px">${name ? `${esc(name)} is set up on this device.` : 'No link this time.'}</h2>
    <p style="margin:0 0 6px">${esc(msg)}</p>
    ${tip(name ? 'You can add the email later from the Family page.' : 'Try again in a minute, or create a profile now and add the email later.', 'parent', 'Parent note')}
    <div class="btn-row" style="margin-bottom:0"><a class="btn big blue" href="${name ? '#/' : '#/start'}">${name ? 'Start the first lesson →' : 'Create a profile instead'}</a></div>
  </div>`;
}
// Send the magic link and swap the form for the "check your email" box.
async function sendLink(form, email, name, next = '') {
  email = cleanEmail(email);
  const btn = form.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Sending…';
  rememberNext(next); // before the link goes out: the tab that opens it reads this after sign-in
  const { error } = await auth.signIn(email);
  if (!error) auth.linkError = auth.linkCode = null;
  const box = h(error ? linkFailedHTML(error, name) : checkEmailHTML(email, name));
  form.replaceWith(box);
  const re = box.querySelector('#resend'), note = box.querySelector('#resend-note');
  if (re) {
    resendTimer(re);
    re.onclick = async () => {
      re.disabled = true; re.textContent = 'Sending…'; note.textContent = '';
      const r = await auth.signIn(email);
      note.textContent = r.error ? r.error : 'Sent again. Check your email.';
      resendTimer(re);
    };
  }
  const again = box.querySelector('#ce-again');
  if (again) again.onclick = e => { e.preventDefault(); if (location.hash === '#/start/signin') render(); else location.hash = '#/start/signin'; };
  if (!error && name) confetti(1400);
}

function start(mode = '') {
  const [route, query = ''] = String(mode || '').split('?'); // #/start/signin?email=… (our emails link there) fills the email box
  const user = auth.user;
  const signin = route === 'signin' && !user;
  const prefill = signin ? cleanEmail((new URLSearchParams(query).get('email') || '').replace(/ /g, '+')).slice(0, 254) : ''; // an unencoded + reads as a space
  const accounts = auth.enabled && !auth.offline;
  // A magic link that failed lands here (auth.js). Kept until a new link goes out or they leave this page.
  const linkError = auth.linkError;
  const expired = auth.linkCode === 'otp_expired' || /expired/i.test(linkError || '');
  const next = signin && NEXT_OK.test(prevHash) ? prevHash : ''; // came here from the Playbook: go back there after
  const emailField = user
    ? `<div class="field"><label>Parent</label><div class="help" style="font-size:15px;color:var(--ink-2)">Signed in as <b>${esc(user.email)}</b>. New children follow you to every device.</div></div>`
    : `<div class="field"><label for="f-email">Parent email${signin ? '' : ' <span class="faint" style="text-transform:none;letter-spacing:0;font-weight:500">(optional)</span>'}</label><input id="f-email" type="email" placeholder="you@example.com" autocomplete="email" ${signin ? 'required' : ''}${prefill ? ` value="${esc(prefill)}"` : ''}><div class="help">${accounts ? 'We email you a sign-in link. Progress follows you to any device.' : 'For progress updates and new stages.'}</div></div>`;
  const el = h(`<div>
    <section class="onboard">
      <div>
        <span class="eyebrow blue">${signin ? 'Welcome' : 'Set up in thirty seconds'}</span>
        <h1>${signin ? 'Open your account.' : "Let's meet your phenom."}</h1>
        <p class="lede">${signin ? 'Sign in with the email you ordered with. We email you a link; no password.' : 'A profile keeps the streak, the badges and the Bead Score chart. Add more than one child any time.'}</p>
        <ul>
          <li><b>No soroban yet?</b> The first lessons work on the screen abacus.</li>
          <li><b>Not sure of the level?</b> Everyone starts at Sprout. It takes a fast child a week.</li>
          ${accounts ? '<li><b>Progress follows you.</b> Add your email and every device shows the same streak.</li>' : '<li><b>Progress saves in this browser.</b> Use the same device each time.</li>'}
        </ul>
        <img src="img/hero-kid.webp" alt="" style="max-width:300px;margin-top:8px" loading="lazy">
      </div>
      <form id="signup" autocomplete="off">
        ${expired ? tip('That link expired. Enter your email and we will send a fresh one.', 'warn', 'That link') : linkError ? tip(`${esc(linkError)} Ask for a fresh one below.`, 'warn', 'That link') : ''}
        ${signin ? '' : `<div class="field"><label for="f-name">Child's first name</label><input id="f-name" type="text" maxlength="24" placeholder="e.g. Maya" required></div>
        <div class="field"><label>Age</label><div class="age-pick" id="ages">${[4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(a => `<button type="button" data-a="${a}" class="${a === 7 ? 'on' : ''}">${a === 13 ? '13+' : a}</button>`).join('')}</div></div>`}
        ${emailField}
        <button class="btn big blue" type="submit" style="width:100%">${signin ? 'Email me a sign-in link →' : 'Create profile →'}</button>
        ${accounts && !user ? `<p class="help center" style="margin:14px 0 0;font-size:14px;color:var(--ink-3)">${signin ? '<a href="#/start">New here? Create a profile</a>' : 'Already have an account? <a href="#/start/signin">Sign in</a>'}</p>` : ''}
      </form>
    </section>
  </div>`);
  app.appendChild(el);
  let age = 7;
  el.querySelectorAll('#ages button').forEach(b => b.onclick = () => { age = Number(b.dataset.a); el.querySelectorAll('#ages button').forEach(x => x.classList.toggle('on', x === b)); });
  const form = el.querySelector('#signup');
  form.onsubmit = e => {
    e.preventDefault();
    const email = cleanEmail(form.querySelector('#f-email')?.value);
    if (signin) { if (email) sendLink(form, email, '', next); return; }
    const name = form.querySelector('#f-name').value.trim() || 'Player';
    store.addProfile(name, age, { parentEmail: email || user?.email || '' });
    toast(`Welcome, ${name}!`);
    if (email && accounts && !user) { sendLink(form, email, name); return; }
    confetti(1400);
    location.hash = '#/';
  };
  setTimeout(() => el.querySelector(signin ? '#f-email' : '#f-name').focus(), 50);
}

// Lands here from a magic link (#access_token=…). auth.js finishes the sign-in and sends us to Family.
// The "ask for a new one" tip waits 8 seconds, so a sign-in that works never shows it.
function authCallback() {
  const el = h(`<div style="max-width:560px;margin:48px auto"><div class="try-box" style="padding:28px">
    <span class="eyebrow blue">One moment</span>
    <h2 style="margin:0 0 8px">Signing you in…</h2>
    <p style="margin:0 0 6px">Your children and their progress are on the way.</p>
    <div class="cb-tip" hidden>${tip('Still here after a few seconds? The link may have been used already. <a href="#/start/signin">Ask for a new one.</a>', 'parent', 'Parent note')}</div>
  </div></div>`);
  app.appendChild(el);
  setTimeout(() => { const t = el.querySelector('.cb-tip'); if (t && el.isConnected) t.hidden = false; }, 8000);
}

// Account box on the Family page: signed in, or the email form that sends a link.
function accountHTML() {
  if (!auth.enabled || auth.offline) return '';
  const u = auth.user;
  if (u) return `<div class="try-box" id="account" style="padding:22px 24px 18px;margin:22px 0 28px">
      <span class="eyebrow green">Account</span>
      <p style="margin:0 0 12px"><span class="sync-dot ${auth.lastError ? 'off' : ''}" aria-hidden="true"></span>Signed in as <b>${esc(u.email)}</b>. Every device you sign in on shows these children. <span class="faint" id="sync-status">${syncStatusText()}</span></p>
      <div class="btn-row" style="margin:0"><button class="btn sm secondary" id="signout">Sign out on this device</button></div>
    </div>`;
  const guess = store.profiles().map(x => x.parentEmail).find(Boolean) || '';
  return `<div class="try-box" id="account" style="padding:22px 24px 18px;margin:22px 0 28px">
      <span class="eyebrow blue">Account</span>
      <h3 style="margin:0 0 6px">Keep progress on every device</h3>
      <p style="margin:0 0 14px">Add your email and every child here follows you to the tablet, the laptop and grandma's phone.</p>
      <form class="inline-form" id="acct-form"><input type="email" id="acct-email" placeholder="you@example.com" autocomplete="email" value="${esc(guess)}" required><button class="btn blue" type="submit">Email me a link</button></form>
      ${tip('One tap in the email and you are in. No password to remember.', 'parent', 'Parent note')}
    </div>`;
}

// ───────── the welcome panel, at the top of Family ─────────
// After a first sign-in: what they own and what to do tonight, until they press "Got it" (cp.welcome.v1, per email).
const WELCOME_KEY = 'cp.welcome.v1';
function welcomeSeen(email) { try { return !!(JSON.parse(localStorage.getItem(WELCOME_KEY)) || {})[email]; } catch { return false; } }
function welcomeDone(email) { try { const all = JSON.parse(localStorage.getItem(WELCOME_KEY)) || {}; all[email] = today(); localStorage.setItem(WELCOME_KEY, JSON.stringify(all)); } catch {} }
function welcomeHTML() {
  if (!(auth.user || membership.demo) || !membership.loaded) return '';
  const s = membership.state(), items = ownedItems(s);
  if (!items.length || welcomeSeen(s.email)) return '';
  const steps = [];
  if (!store.profiles().length) steps.push(['Make a profile for your child.', '#/start']);
  steps.push(['Do Night 1. It takes 10 minutes.', '#/quickstart']);
  if (membership.can('playbook')) steps.push(['Read Chapter 1 after bedtime.', '#/playbook/1']);
  if (s.member) steps.push(['Stage 2 is open for you. Finish Stage 1 first.', '#/stage/2']);
  if (instructor(s)) steps.push(['Start Lesson 1 of your course.', '#/course/1']);
  return `<section class="block green welcome" id="welcome" aria-labelledby="welcome-h">
    <span class="eyebrow green">Welcome</span>
    <h2 id="welcome-h">Here is what you own and what to do tonight</h2>
    <ul class="welcome-own">${items.map(it => `<li><span class="tick" aria-hidden="true">✓</span><div><b>${it.title}</b>${it.chip ? ` <span class="status-chip ${it.chip[0]}">${it.chip[1]}</span>` : ''}${it.links.length ? `<div class="welcome-links">${linksHTML(it, 'link-arrow')}</div>` : ''}</div></li>`).join('')}</ul>
    <h3>Tonight</h3>
    <ol class="welcome-steps">${steps.map(([t, href]) => `<li><a href="${href}">${t}</a></li>`).join('')}</ol>
    <p class="welcome-help">Questions? <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
    <div class="btn-row"><button class="btn" type="button" id="welcome-ok">Got it</button></div>
  </section>`;
}

function family() {
  const p = store.profile;
  const el = h(`<div>
    ${crumbs('<a href="#/">Home</a>', 'Family')}
    ${welcomeHTML()}
    <h1>Family</h1>
    <p class="lede">Switch between children, fix a name or an age, or move progress to another device.</p>
    <p><a class="link-arrow" href="#/account">Membership and billing</a></p>
    <p><a class="link-arrow" href="#/quickstart">Your 3-Night Quick-Start</a></p>
    ${accountHTML()}
    <ul class="lesson-list">${store.profiles().map(x => `<li class="${p && x.id === p.id ? 'next' : ''}"><span class="ix">${esc(x.name[0] || '?')}</span><div><a href="#" data-sel="${esc(x.id)}">${esc(x.name)}</a><div class="meta">age ${esc(x.age)} · level ${levelFromXP(x.xp).level} · ${Object.values(x.lessons).filter(l => l.done).length} lessons done${x.parentEmail && !auth.user ? ' · ' + esc(x.parentEmail) : ''}</div></div><span class="go"><button class="btn sm ghost" data-edit="${esc(x.id)}">Edit</button><button class="btn sm ghost" data-del="${esc(x.id)}">Remove</button></span></li>`).join('')}</ul>
    <div class="btn-row"><a class="btn blue" href="#/start">+ Add a child</a><button class="btn secondary" id="export">Download progress</button><label class="btn secondary" for="import">Load progress<input id="import" type="file" accept="application/json" style="display:none"></label></div>
  </div>`);
  app.appendChild(el);
  const ok = el.querySelector('#welcome-ok');
  if (ok) { ok.onclick = () => { welcomeDone(membership.state().email); el.querySelector('#welcome').remove(); }; revealAudio(el); }
  el.querySelectorAll('[data-sel]').forEach(a => a.onclick = e => { e.preventDefault(); store.select(a.dataset.sel); toast(`Now playing as ${a.textContent}`); location.hash = '#/'; });
  el.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => { const x = store.db.profiles[b.dataset.edit]; const n = prompt('Name', x.name); if (n === null) return; const a = prompt('Age', x.age); store.updateProfile(x.id, y => { y.name = n.trim() || y.name; y.age = Number(a) || y.age; }); store.select(x.id); render(); });
  el.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { const x = store.db.profiles[b.dataset.del]; if (confirm(`Remove ${x.name} and all progress${auth.user ? ' on every device' : ''}? This cannot be undone.`)) { store.removeProfile(x.id); render(); } });
  el.querySelector('#export').onclick = () => { const a = document.createElement('a'); a.href = 'data:application/json,' + encodeURIComponent(store.exportJSON()); a.download = 'child-phenoms-progress.json'; a.click(); };
  el.querySelector('#import').onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(t => { try { store.importJSON(t); toast('Progress loaded'); render(); } catch { toast('That file did not load'); } }); };
  const out = el.querySelector('#signout'); if (out) out.onclick = async () => { out.disabled = true; out.textContent = 'Signing out…'; await auth.signOut(); toast('Signed out. Progress stays on this device.'); render(); };
  const acct = el.querySelector('#acct-form'); if (acct) acct.onsubmit = e => { e.preventDefault(); const email = cleanEmail(acct.querySelector('#acct-email').value); if (email) sendLink(acct, email, ''); };
}

// ───────────── plan ─────────────
function plan() {
  const el = h(`<div>
    <section class="hero" style="padding-top:36px">
      <div>
        <span class="eyebrow blue">${PLAN_INTRO.eyebrow}</span>
        <h1>${PLAN_INTRO.title}</h1>
        <p class="lede">${PLAN_INTRO.lede}</p>
        <div class="btn-row"><a class="btn blue" href="#/start">Start free</a><a class="btn secondary" href="#/stage/1">Open stage 1</a></div>
      </div>
      <div class="hero-art" style="--none:0"><img src="img/plan-path.webp" alt="A winding trail with ten milestone flags from a sprout to a mountain peak" style="max-width:520px"></div>
    </section>

    <section class="section">
      <div class="section-head"><span class="eyebrow">How it moves</span><h2>Every lesson works the same way</h2><p>Watch, try, pass, repeat. Ten stages, seventy-six lessons, one habit.</p></div>
      <div class="steps">${HOW_IT_MOVES.map(s => `<div>${icon(s.icon)}<h4>${s.title}</h4><p>${s.text}</p></div>`).join('')}</div>
    </section>

    <section class="section">
      <div class="section-head"><span class="eyebrow">What they will be able to do</span><h2>Stage by stage, in plain English</h2><p>Times assume fifteen to twenty minutes a day, six days a week, age seven or older. Younger kids take longer and that is fine.</p></div>
      <ol class="timeline">${STAGES.map(s => `<li><span class="tn">${String(s.n).padStart(2, '0')}</span>${badge(s.key)}<div><h3><a href="#/stage/${s.n}" style="color:inherit">${s.name}</a><small>${esc(s.tagline)}</small></h3><p>${esc(STAGE_PLAIN[s.key].can)}</p><p class="small faint" style="margin-top:4px">${esc(STAGE_PLAIN[s.key].feels)}</p></div><span class="tt">${s.time}</span></li>`).join('')}</ol>
    </section>

    <section class="section">
      <div class="block green split">
        <div>
          <span class="eyebrow green">The secret</span>
          <h2>The abacus is scaffolding. The picture is the skill.</h2>
          <p class="lede">From the first stage your child practises with eyes closed. Each stage grows the picture by one column. By Prodigy the real soroban is a warm-up toy and every drill happens in the head.</p>
        </div>
        <img src="img/mental-abacus.webp" alt="" loading="lazy">
      </div>
    </section>

    <section class="section">
      <div class="section-head"><span class="eyebrow">A day</span><h2>Fifteen minutes, like this</h2></div>
      <div class="daybar"><div class="d1">Warm-up<small>2 min</small></div><div class="d2">Lesson or drill<small>8–10 min</small></div><div class="d3">Mental<small>5 min</small></div><div class="d4">Log<small>1</small></div></div>
      <p class="muted measure">Monday to Thursday, a lesson. Friday, just the daily quest. Saturday, the boss if the lessons are done. Sunday off, or numbers in the car. Every two to four weeks, the Bead Score test.</p>
    </section>

    <section class="section">
      <div class="section-head"><span class="eyebrow">For curious parents</span><h2>There are only three tricks</h2><p>A rod holds one top bead worth 5 and four bottom beads worth 1. When the beads you need are not free, you trade with a friend.</p></div>
      <div class="cols">${TRICKS.map(t => `<div><span class="chip ${t.cls}">${t.name}</span><h3 style="margin-top:12px"><span class="num">${t.eg}</span></h3><p>${t.line}</p></div>`).join('')}</div>
      <div style="margin-top:22px"><details><summary>See all 34 bead moves</summary><div style="padding:8px 0 16px">${FORMULAS_HTML}</div></details></div>
    </section>

    <section class="section">
      <div class="block blue center">
        <h2>Ready when you are.</h2>
        <p class="lede" style="margin:0 auto 20px">Stage one is reading beads. It takes a fast child a week and it is the foundation for everything else.</p>
        <div class="btn-row" style="justify-content:center"><a class="btn big" href="#/start">Start free</a></div>
      </div>
    </section>
  </div>`);
  app.appendChild(el);
}

function guide() {
  const el = h(`<div>${GUIDE_HTML}
    <section class="section"><div class="block yellow center"><h2>Questions mid-lesson?</h2><p class="lede" style="margin:0 auto 20px">Every lesson has a coach tip and a "Stuck?" panel with the exact move. You will rarely need this page twice.</p><div class="btn-row" style="justify-content:center"><a class="btn" href="#/stage/1">Go to stage 1</a></div></div></section>
  </div>`);
  app.appendChild(el);
}

// ───────────── stage, lesson, boss ─────────────
function stage(n) {
  const s = stageByN(n); if (!s) return notFound();
  const p = store.profile; const unlocked = stageUnlocked(s.n); const pr = stageProgress(s);
  const bossPassed = p && p.bosses[s.n]?.passed;
  const prev = STAGES[s.n - 2], nxt = STAGES[s.n];
  const next = nextLesson(s);
  const plain = STAGE_PLAIN[s.key];
  const el = h(`<div>
    ${crumbs('<a href="#/">Home</a>', `<a href="#/plan">The plan</a>`, `Stage ${s.n}`)}
    <section class="page-head">
      <div>
        <span class="eyebrow ${stageColor(s) === 'yellow' ? 'orange' : stageColor(s)}">Stage ${s.n} of 10 · ${esc(s.tagline)} · ${s.time}</span>
        <h1>${s.name}</h1>
        <p class="lede"><b>By the end:</b> ${esc(plain.can)}</p>
        ${unlocked ? `<div class="btn-row"><a class="btn big blue" href="#/stage/${s.n}/${next ? 'lesson/' + next.key : 'boss'}">${next ? (pr.done ? 'Continue: ' + esc(next.title) : 'Start the first lesson') : (bossPassed ? 'Fight the boss again' : 'Fight the boss')} →</a>${bossPassed ? '<span class="badge-xp">✓ Badge earned</span>' : ''}</div>`
          : `<div class="tip warn">${COACH}<div class="bubble"><span class="who">Locked</span>Beat the ${prev.name} boss first. Already has this skill? <button class="btn sm secondary" id="unlock" style="vertical-align:middle">Unlock anyway</button></div></div>`}
      </div>
      <div class="art">${badge(s.key)}</div>
    </section>
    ${tip(esc(PARENT_LINE[s.key]), 'parent', 'Parent tip for this stage')}

    <section class="section measure" style="margin-top:48px">
      <span class="eyebrow">The idea</span>
      <h2>${esc(s.goal.split('.')[0].length < 60 ? s.goal.split('.')[0] : 'What this stage teaches')}</h2>
      ${s.intro}
    </section>

    <section class="section" style="margin-top:56px">
      <div class="section-head"><span class="eyebrow">Lessons</span><h2>${pr.done} of ${pr.total} done</h2><div class="bar" style="max-width:320px;margin-top:10px"><i style="width:${Math.round(100 * pr.done / pr.total)}%"></i></div></div>
      <ul class="lesson-list">${s.lessons.map((l, i) => { const st = p && p.lessons[lessonKey(s, l)]; const isNext = next && next.key === l.key; return `<li class="${st?.done ? 'done' : ''} ${isNext ? 'next' : ''}"><span class="ix">${st?.done ? '✓' : i + 1}</span><div><a href="#/stage/${s.n}/lesson/${l.key}">${esc(l.title)}</a><div class="meta">${l.minutes} min${l.drill.mode === 'mental' ? ' · mental' : ''}${l.drill.kind === 'flash' ? ' · flash' : ''}${st ? ` · best ${st.best}% · ${st.tries} ${st.tries === 1 ? 'try' : 'tries'}` : ''}</div></div><a class="btn sm ${isNext ? 'blue' : 'secondary'} go" href="#/stage/${s.n}/lesson/${l.key}">${st?.done ? 'Again' : isNext ? 'Next' : 'Open'}</a></li>`; }).join('')}</ul>
    </section>

    <section class="section">
      <div class="block red split">
        <div>
          <span class="eyebrow red">Boss</span>
          <h2>${esc(s.boss.title)}</h2>
          <p class="lede">${esc(s.boss.desc)} Each part is timed, no hints.</p>
          <ul>${s.boss.parts.map(pt => `<li><b>${esc(pt.title)}.</b> ${esc(pt.desc)} Need ${Math.round(pt.target.acc * pt.count)} of ${pt.count}${pt.timeLimit ? ` in ${Math.round(pt.timeLimit / 60 * 10) / 10} min` : ''}.</li>`).join('')}</ul>
          <div class="btn-row"><a class="btn big red" href="#/stage/${s.n}/boss">${bossPassed ? 'Fight the boss again' : 'Fight the boss'}</a><a class="btn secondary" href="#/worksheet/${s.n}">Print a worksheet</a></div>
          ${bossPassed ? `<p class="small muted">Beaten on ${p.bosses[s.n].date}.${nxt ? ` ${nxt.name} is open.` : ''}</p>` : ''}
        </div>
        <img src="img/boss.webp" alt="" loading="lazy" style="max-width:280px">
      </div>
    </section>
    <div class="btn-row">${prev ? `<a class="btn ghost" href="#/stage/${prev.n}">← ${prev.name}</a>` : ''}${nxt ? `<a class="btn ghost" href="#/stage/${nxt.n}">${nxt.name} →</a>` : ''}</div>
  </div>`);
  app.appendChild(el);
  activateDemos(el);
  const u = el.querySelector('#unlock'); if (u) u.onclick = () => { ensureProfile(); store.update(x => { x.bosses[s.n - 1] = { passed: true, skipped: true, date: today() }; }); render(); };
}

function lesson(n, key) {
  const s = stageByN(n); if (!s) return notFound();
  const idx = s.lessons.findIndex(l => l.key === key); const l = s.lessons[idx]; if (!l) return notFound();
  const nextL = s.lessons[idx + 1];
  const p = store.profile; const st = p && p.lessons[lessonKey(s, l)];
  const need = needs(l.drill);
  const el = h(`<div>
    ${crumbs('<a href="#/">Home</a>', `<a href="#/stage/${s.n}">${s.name}</a>`, `Lesson ${idx + 1}`)}
    <span class="eyebrow">Lesson ${idx + 1} of ${s.lessons.length} · ${l.minutes} min</span>
    <h1>${esc(l.title)} ${st?.done ? '<span class="badge-xp">✓ done</span>' : ''}</h1>
    <div class="needs">${need.map(x => `<span>${icon(x.icon, 'ic')}${x.text}</span>`).join('')}</div>
    <section class="measure">${l.teach}</section>
    <section class="section" style="margin-top:40px">
      <div class="try-box">
        <span class="sticker">Practice</span>
        <h2 style="margin-top:6px">${drillDesc(l.drill)}</h2>
        <p class="muted">Target: ${Math.round(l.drill.target.acc * 100)}% correct${l.drill.target.maxSec ? ` in under ${Math.round(l.drill.target.maxSec / 60)} min` : ''}.${l.drill.mode === 'mental' ? ' <b>No soroban, no paper.</b>' : (['addsub', 'mul', 'div'].includes(l.drill.kind) ? ' Use your real soroban.' : '')}</p>
        ${tip(coachTip(l.drill, s))}
        <div class="holder"><div class="btn-row"><button class="btn big blue start">Start practice →</button></div></div>
        <details><summary>Stuck? Read this.</summary>${stuckHelp(l.drill).map(x => `<p>${x}</p>`).join('')}</details>
      </div>
    </section>
    <div class="btn-row" style="margin-top:28px">${nextL ? `<a class="btn secondary" href="#/stage/${s.n}/lesson/${nextL.key}">Next lesson: ${esc(nextL.title)} →</a>` : `<a class="btn red" href="#/stage/${s.n}/boss">Fight the ${s.name} boss →</a>`}<a class="btn ghost" href="#/stage/${s.n}">All ${s.name} lessons</a><a class="btn ghost" data-needs="handouts" href="#/print/${s.n}/${l.key}" ${membership.can('handouts') ? '' : 'hidden'}>Print a practice sheet</a></div>
  </div>`);
  app.appendChild(el);
  activateDemos(el);
  el.querySelector('.start').onclick = () => {
    ensureProfile();
    runDrill(el.querySelector('.holder'), l.drill, { xpKey: lessonKey(s, l), onFinish: (r, summary) => {
      const first = !(store.profile.lessons[lessonKey(s, l)]?.done);
      store.lessonDone(lessonKey(s, l), r);
      if (r.passed && first) { confetti(); toast('Lesson complete! ' + (nextL ? 'Next one is open.' : 'Boss time.')); }
      const row = summary.querySelector('.btn-row');
      if (r.passed) row.appendChild(h(nextL ? `<a class="btn blue" href="#/stage/${s.n}/lesson/${nextL.key}">Next lesson →</a>` : `<a class="btn red" href="#/stage/${s.n}/boss">Fight the boss →</a>`));
    } });
  };
}
function drillDesc(d) {
  const s = d.spec || {};
  switch (d.kind) {
    case 'read': return `Read ${d.count} numbers${s.peekMs ? ` (shown for ${s.peekMs / 1000} s)` : ''}`;
    case 'set': return `Set ${d.count} numbers on the screen abacus`;
    case 'single': return `${d.count} single-column moves`;
    case 'twocol': return `${d.count} moves with a carry or borrow`;
    case 'addsub': return `${d.count} problems, ${s.terms} lines of ${Array.isArray(s.digits) ? s.digits.join('/') : s.digits}-digit numbers${s.ops === 'mix' ? ', plus and minus' : s.ops === 'sub' ? ', subtracting' : ''}${d.mode === 'spoken' ? ', read aloud' : ''}`;
    case 'flash': return `${d.count} rounds of ${s.count} ${s.digits}-digit numbers at ${s.ms / 1000} s`;
    case 'facts': return `${d.count} times-table facts`;
    case 'mul': return `${d.count} problems, ${s.aDigits}-digit × ${s.bDigits}-digit`;
    case 'div': return `${d.count} problems, ${s.qDigits + s.dDigits}-digit ÷ ${s.dDigits}-digit${s.remainder ? ' with remainders' : ''}`;
  }
  return '';
}

function boss(n) {
  const s = stageByN(n); if (!s) return notFound();
  const el = h(`<div>${crumbs('<a href="#/">Home</a>', `<a href="#/stage/${s.n}">${s.name}</a>`, 'Boss')}
    <div class="page-head"><div><span class="eyebrow red">Boss</span><h1>${esc(s.boss.title)}</h1><p class="lede">${esc(s.boss.desc)} Each part is timed. No hints. ${s.boss.parts.some(x => x.mode === 'mental' || x.kind === 'flash') ? 'Mental parts: no soroban, no paper.' : ''}</p></div><img class="art" src="img/boss.webp" alt="" width="150" height="150"></div>
    <div class="holder"></div></div>`);
  app.appendChild(el);
  ensureProfile();
  runSequence(el.querySelector('.holder'), s.boss.parts.map(pt => ({ ...pt, allowScreenAbacus: true })), { onFinish: results => {
    const passed = results.every(r => r.passed);
    const holder = el.querySelector('.holder'); holder.innerHTML = '';
    const card = h(`<div class="result ${passed ? 'good' : 'meh'} center">
      <h2>${passed ? `${s.name} badge earned!` : 'Not this time'}</h2>
      ${passed ? badge(s.key).replace('class="badge"', 'class="badge" style="width:140px;height:140px"') : ''}
      <table class="table" style="margin:12px auto;max-width:520px">${results.map(r => `<tr><td>${r.passed ? '✅' : '❌'}</td><td>${esc(r.title)}</td><td>${r.correct}/${r.count}</td><td>${Math.floor(r.sec / 60)}:${String(r.sec % 60).padStart(2, '0')}</td></tr>`).join('')}</table>
      <p class="muted">${passed ? (STAGES[s.n] ? `${STAGES[s.n].name} is unlocked.` : 'You have finished the trail. Keep climbing the ladder.') : 'Repeat the lessons for the parts that missed, then come back. Bosses usually take two or three tries.'}</p>
      <div class="btn-row" style="justify-content:center">${passed && STAGES[s.n] ? `<a class="btn big blue" href="#/stage/${s.n + 1}">Go to ${STAGES[s.n].name} →</a>` : ''}<a class="btn secondary" href="#/stage/${s.n}">Back to ${s.name}</a></div>
    </div>`);
    holder.appendChild(card);
    if (passed) { const first = !store.profile.bosses[s.n]?.passed; store.bossDone(s.n, { results: results.map(r => ({ t: r.title, c: r.correct, n: r.count, s: r.sec })) }); store.addXP(first ? 200 : 60, 'boss ' + s.key); confetti(3000); }
    else store.addXP(results.reduce((a, r) => a + r.correct * 5, 0), 'boss attempt');
  } });
}

// ───────────── Bead Score ─────────────
function test(which = 'main') {
  const ladder = which === 'times' ? TIMES_LADDER : MAIN_LADDER;
  const p = store.profile;
  const mine = p ? p.tests.filter(t => t.ladder === ladder.key) : [];
  const last = mine.slice(-1)[0];
  const suggested = last ? Math.max(1, last.rung - 1) : 1;
  const el = h(`<div>
    <div class="page-head" style="padding-top:28px"><div><span class="eyebrow blue">Bead Score</span><h1>How high can they climb?</h1><p class="lede">A ladder of ${ladder.rungs.length} rungs. Four problems a rung, three right to climb, the first miss ends the test. No soroban, no paper, a grown-up as referee. The score is the highest rung plus a speed bonus.</p></div><img class="art" src="img/score-climb.webp" alt="" width="150" height="150"></div>
    <div class="pill-nav"><a class="${which === 'main' ? 'on' : ''}" href="#/test">Add &amp; subtract</a><a class="${which === 'times' ? 'on' : ''}" href="#/test/times">Times &amp; divide</a></div>
    <div class="try-box">
      <div class="profile-row"><label>Start at rung <input type="number" id="start-rung" min="1" max="${ladder.rungs.length}" value="${suggested}" style="width:80px"></label><button class="btn big blue" id="go">Take the test</button><span class="small faint">Suggested: one below the last result.</span></div>
      <div class="holder" style="margin-top:12px"></div>
    </div>
    <section class="section">
      <div class="section-head"><span class="eyebrow">The chart</span><h2>${p ? esc(p.name) + "'s climb" : 'The climb'}</h2><p>Each test adds a dot. The lines show what is typical for the age, and the top 25%, 10% and 1%.</p></div>
      <div id="chart">${renderChart(mine, p ? p.age : 8, ladder.key)}</div>
      <p class="small faint">Age lines are estimates from grade-level expectations. Your child's dots are the real measure.</p>
      ${mine.length ? `<div class="table-wrap"><table class="table"><tr><th>Date</th><th>Age</th><th>Rung</th><th>Score</th><th>Estimated rank</th></tr>${mine.slice().reverse().map((t, i) => `<tr class="${i === 0 ? 'me' : ''}"><td>${t.date}</td><td>${t.age}</td><td>${t.rung}</td><td>${t.score}</td><td>ahead of ~${percentile(t.rung, t.age, ladder.key)}% of ${t.age}-year-olds</td></tr>`).join('')}</table></div>` : '<p class="muted">No tests yet. The first one usually happens in the Ace stage.</p>'}
    </section>
    <section class="section">
      <div class="section-head"><span class="eyebrow">The rungs</span><h2>What each rung means</h2></div>
      <div class="table-wrap"><table class="table"><tr><th>Rung</th><th>Task</th><th>What it means</th></tr>${ladder.rungs.map(r => `<tr class="${last && last.rung === r.n ? 'me' : ''}"><td><b class="num">${r.n}</b></td><td>${esc(r.label)}</td><td class="muted">${esc(r.means)}</td></tr>`).join('')}</table></div>
    </section>
  </div>`);
  app.appendChild(el);
  el.querySelector('#go').onclick = () => {
    ensureProfile();
    const holder = el.querySelector('.holder');
    runLadder(holder, ladder, { startRung: Number(el.querySelector('#start-rung').value) || 1, onFinish: res => {
      store.addTest(res); store.addXP(100 + res.rung * 10, 'test');
      const pct = percentile(res.rung, store.profile.age, ladder.key);
      const improved = last && res.rung > last.rung;
      holder.innerHTML = '';
      holder.appendChild(h(`<div class="result good center"><span class="sticker">${improved ? 'New best!' : 'Logged'}</span><span class="eyebrow">Bead Score</span><div class="bignum">${res.score}</div><p class="hand" style="margin-top:10px">Rung ${res.rung}${res.rung ? ` · ${esc(ladder.rungs[res.rung - 1].means)}` : ''}</p><p>Ahead of about <b>${pct}%</b> of ${store.profile.age}-year-olds. ${res.rung < ladder.rungs.length ? `Next goal: rung ${res.rung + 1}, ${esc(ladder.rungs[res.rung].label)}.` : 'Top of the ladder.'}</p><div class="btn-row" style="justify-content:center"><a class="btn blue" href="#/test/${which}">See the chart</a></div></div>`));
      if (improved || !last) confetti();
    } });
  };
}

// ───────────── practice & flash ─────────────
function practice() {
  const el = h(`<div>
    <div class="page-head" style="padding-top:28px"><div><span class="eyebrow blue">Practice</span><h1>Build any drill</h1><p class="lede">Extra reps on one move, harder numbers for an older kid, or a worksheet to print.</p></div></div>
    <div class="try-box">
      <div class="profile-row">
        <label>Kind <select id="kind"><option value="addsub">Add &amp; subtract</option><option value="single">Single column (screen abacus)</option><option value="twocol">Carry / borrow (screen abacus)</option><option value="flash">Flash</option><option value="mul">Multiply</option><option value="div">Divide</option><option value="facts">Times tables</option><option value="read">Read the beads</option></select></label>
        <label>Mode <select id="mode"><option value="abacus">With soroban</option><option value="mental">Mental</option><option value="spoken">Read aloud</option></select></label>
        <label>Problems <input id="count" type="number" value="10" min="1" max="50" style="width:76px"></label>
      </div>
      <div class="profile-row" style="margin-top:10px">
        <label>Digits <input id="digits" type="number" value="2" min="1" max="6" style="width:70px"></label>
        <label>Lines <input id="terms" type="number" value="5" min="2" max="20" style="width:70px"></label>
        <label>Ops <select id="ops"><option value="add">Add only</option><option value="mix" selected>Plus and minus</option></select></label>
        <label>Flash ms <input id="ms" type="number" value="1000" min="100" max="5000" step="100" style="width:90px"></label>
        <label>× digits <input id="bdig" type="number" value="1" min="1" max="3" style="width:70px"></label>
      </div>
      <div style="margin-top:12px"><span class="small faint">Allowed moves:</span> ${['direct', 'small+', 'small-', 'big+', 'big-', 'combo+', 'combo-'].map(g => `<label class="chip ${g.replace(/[+-]/, '')}"><input type="checkbox" class="allow" value="${g}" checked> ${g}</label>`).join('')}</div>
      <div class="btn-row"><button class="btn big blue" id="go">Start</button><button class="btn secondary" id="print">Print worksheet (20 + answers)</button></div>
      <div class="holder"></div>
    </div>
  </div>`);
  app.appendChild(el);
  const build = () => {
    const kind = el.querySelector('#kind').value;
    const digits = Number(el.querySelector('#digits').value) || 2;
    const allow = [...el.querySelectorAll('.allow:checked')].map(x => x.value);
    const terms = Number(el.querySelector('#terms').value) || 5;
    const ops = el.querySelector('#ops').value;
    const ms = Number(el.querySelector('#ms').value) || 1000;
    const b = Number(el.querySelector('#bdig').value) || 1;
    const count = Number(el.querySelector('#count').value) || 10;
    const mode = el.querySelector('#mode').value;
    const spec = { addsub: { terms, digits, ops, allow }, single: { allow, sign: 'mix' }, twocol: { allow, sign: 'mix', min: 1, max: 99 }, flash: { count: terms, digits, ms, ops }, mul: { aDigits: digits, bDigits: b }, div: { qDigits: Math.max(1, digits - b), dDigits: b, remainder: false }, facts: { maxTable: 9 }, read: { digits } }[kind];
    return { kind, spec, count, mode: kind === 'addsub' ? mode : (['mul', 'div'].includes(kind) && mode === 'mental' ? 'mental' : 'abacus'), target: { acc: 0.8 } };
  };
  el.querySelector('#go').onclick = () => { ensureProfile(); runDrill(el.querySelector('.holder'), build(), { xpKey: 'practice' }); };
  el.querySelector('#print').onclick = () => printWorksheet(build());
}

function printWorksheet(drill, title = 'Child Phenoms worksheet') {
  const probs = [];
  for (let i = 0; i < 20; i++) {
    try { probs.push(makeProblem({ ...drill, kind: ['single', 'twocol', 'read', 'set', 'flash'].includes(drill.kind) ? 'addsub' : drill.kind, spec: ['single', 'twocol', 'read', 'set', 'flash'].includes(drill.kind) ? { terms: 5, digits: 2, ops: 'mix', allow: drill.spec.allow || ['direct', 'small+', 'small-', 'big+', 'big-', 'combo+', 'combo-'] } : drill.spec })); } catch (e) { break; }
  }
  const cell = (pr, i) => {
    if (pr.terms) return `<div class="p"><div class="n">${i + 1}</div><div class="stack">${pr.terms.map((t, k) => `<div>${k ? (t < 0 ? '−' : '+') : ''} ${Math.abs(t)}</div>`).join('')}<div class="line"></div></div></div>`;
    return `<div class="p"><div class="n">${i + 1}</div><div class="one">${pr.text} =</div></div>`;
  };
  const w = window.open('', '_blank');
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>
    body{font-family:Inter,system-ui,sans-serif;padding:20px;color:#121826} h1{font-weight:800;letter-spacing:-.02em;margin:0 0 4px} .meta{color:#666;font-size:13px;margin-bottom:14px}
    .grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px 18px} .p{display:flex;gap:8px;align-items:flex-start;padding:8px;border:1px solid #ccc;border-radius:8px;min-height:60px} .n{font-size:11px;color:#999} .stack{text-align:right;font-size:18px;line-height:1.3} .line{border-top:2px solid #121826;height:26px} .one{font-size:18px}
    .key{margin-top:24px;page-break-before:always;font-size:14px} .key span{display:inline-block;width:19%;padding:3px 0}
    @media print{button{display:none}}</style></head><body>
    <button onclick="print()">Print</button>
    <h1>${title}</h1><div class="meta">Name: ______________ &nbsp; Date: __________ &nbsp; Time: ______ &nbsp; Score: ___/20 &nbsp; · work left to right · say the move</div>
    <div class="grid">${probs.map(cell).join('')}</div>
    <div class="key"><b>Answer key</b><br>${probs.map((p, i) => `<span>${i + 1}. ${p.answer.toLocaleString()}</span>`).join('')}</div>
  </body></html>`);
  w.document.close();
}

function worksheet(n) {
  const s = stageByN(n); if (!s) return notFound();
  const part = s.boss.parts.find(p => ['addsub', 'mul', 'div'].includes(p.kind)) || s.daily.find(p => ['addsub', 'mul', 'div'].includes(p.kind));
  if (part) printWorksheet(part, `Child Phenoms · ${s.name} worksheet`);
  location.hash = `#/stage/${s.n}`;
}

function flash() {
  const presets = [
    ['Starter', { count: 5, digits: 1, ms: 1500 }], ['1-digit × 8 at 1 s', { count: 8, digits: 1, ms: 1000 }], ['2-digit × 5 at 1 s', { count: 5, digits: 2, ms: 1000 }], ['2-digit × 8 at 0.7 s', { count: 8, digits: 2, ms: 700 }], ['3-digit × 5 at 1 s', { count: 5, digits: 3, ms: 1000 }], ['3-digit × 10 at 0.7 s', { count: 10, digits: 3, ms: 700 }], ['3-digit × 10 at 0.5 s', { count: 10, digits: 3, ms: 500 }], ['3-digit × 15 at 0.3 s', { count: 15, digits: 3, ms: 300 }], ['World record pace (0.11 s)', { count: 15, digits: 3, ms: 110 }],
  ];
  const el = h(`<div>
    <div class="page-head" style="padding-top:28px"><div><span class="eyebrow blue">Flash</span><h1>Numbers flash. The total stays.</h1><p class="lede">Each number vanishes before the next. Keep the running total on the mental beads and type it at the end.</p></div><img class="art" src="img/mental-abacus.webp" alt="" width="150" height="150"></div>
    <div class="try-box">
      <div class="btn-row" style="margin-top:0">${presets.map((p, i) => `<button class="btn sm secondary preset" data-i="${i}">${p[0]}</button>`).join('')}</div>
      <div class="profile-row" style="margin-top:8px">
        <label>Numbers <input id="count" type="number" value="5" min="2" max="30" style="width:70px"></label>
        <label>Digits <input id="digits" type="number" value="1" min="1" max="4" style="width:70px"></label>
        <label>Seconds each <input id="sec" type="number" value="1.5" min="0.1" max="5" step="0.1" style="width:80px"></label>
        <label>Ops <select id="ops"><option value="add">Add</option><option value="mix">Plus and minus</option></select></label>
        <label>Rounds <input id="rounds" type="number" value="5" min="1" max="30" style="width:70px"></label>
        <label><input type="checkbox" id="beep" checked> beep</label>
      </div>
      ${tip('Do not say the numbers. Breathe out as each one lands. Raise the speed only when four of five rounds are right.')}
      <div class="btn-row"><button class="btn big blue" id="go">Flash!</button></div>
      <div class="holder"></div>
    </div>
  </div>`);
  app.appendChild(el);
  el.querySelectorAll('.preset').forEach(b => b.onclick = () => { const p = presets[Number(b.dataset.i)][1]; el.querySelector('#count').value = p.count; el.querySelector('#digits').value = p.digits; el.querySelector('#sec').value = p.ms / 1000; });
  el.querySelector('#go').onclick = () => {
    ensureProfile();
    const spec = { count: Number(el.querySelector('#count').value), digits: Number(el.querySelector('#digits').value), ms: Math.round(Number(el.querySelector('#sec').value) * 1000), ops: el.querySelector('#ops').value, beep: el.querySelector('#beep').checked };
    runDrill(el.querySelector('.holder'), { kind: 'flash', spec, count: Number(el.querySelector('#rounds').value) || 5, target: { acc: 0.8 } }, { xpKey: 'flash', onFinish: r => { if (r.passed) { const key = `flash:${spec.digits}d:${spec.count}n`; if (store.best(key, spec.ms, true)) toast(`New best: ${spec.count} ${spec.digits}-digit numbers at ${spec.ms / 1000} s`); } } });
  };
}

function notFound() { app.appendChild(h('<div class="try-box"><h2>Page not found</h2><a href="#/">Home</a></div>')); }

// ───────────── router ─────────────
function render() {
  const path = location.hash.replace(/^#\/?/, '');
  const parts = path.split('/').filter(Boolean);
  app.innerHTML = '';
  document.body.classList.remove('printing-sheet', 'printing-book', 'print-one', 'pb-print-all', 'printing-cert');
  accessShown = formShown = null;
  setNav(path);
  window.scrollTo(0, 0);
  if (isAuthHash(path)) return authCallback();
  const [a, b, c, d] = parts;
  if (a !== 'start') auth.linkError = auth.linkCode = null; // a failed-link note belongs to the sign-in page only
  try {
    if (!a) return home();
    if (a === 'start') return start(b);
    if (a === 'family') return family();
    if (a === 'plan') return plan();
    if (a === 'guide') return guide();
    if (a === 'practice') return practice();
    if (a === 'flash') return flash();
    if (a === 'test') return test(b || 'main');
    if (['stage', 'quest', 'worksheet'].includes(a) && !stageGate(b)) return; // stages 2 to 10: University only
    if (a === 'quest') return quest(b, c);
    if (a === 'worksheet') return worksheet(b);
    if (a === 'account') return account(app);
    if (a === 'library') return b ? libraryBook(app, b) : library(app);
    if (a === 'playbook') return playbook(app, b);
    if (a === 'bonus') return bonus(app, b, c);
    if (a === 'course') return course(app, b);
    if (a === 'exam') { if (b === 'take') formShown = formSig(); return exam(app, b); }
    if (a === 'kit') return kit(app, b, c);
    if (a === 'certificate') { if (b === 'listing') formShown = formSig(); return certificate(app, b); }
    if (a === 'quickstart') return quickstart(app);
    if (a === 'print') return printSheet(app, b, c, d);
    if (a === 'instructors') return instructors(app, b);
    if (a === 'stage') { if (c === 'lesson') return lesson(b, d); if (c === 'boss') return boss(b); return stage(b); }
    return notFound();
  } catch (e) { console.error(e); app.appendChild(h(`<div class="card tint-red"><h2>Something broke</h2><pre>${esc(e.stack || e)}</pre></div>`)); }
}
try { history.scrollRestoration = 'manual'; } catch {}
window.addEventListener('hashchange', e => { try { prevHash = new URL(e.oldURL).hash; } catch { prevHash = ''; } render(); requestAnimationFrame(() => window.scrollTo(0, 0)); });

// Accounts: keep the top-right chip honest and refresh the pages that show account state.
auth.on((ev, extra) => {
  const path = location.hash.replace(/^#\/?/, '');
  const first = path.split('/')[0];
  if (ev === 'link') { toast(auth.user ? `Signed in as ${auth.user.email}` : 'That link did not work'); const to = auth.user ? takeNext() || '#/family' : '#/start/signin'; if (location.hash === to) render(); else location.hash = to; return; }
  setNav(path);
  const quiet = ['', 'family', 'start', 'account'].includes(first) && !isAuthHash(path);
  if (ev === 'auth' || (ev === 'sync' && extra?.changed)) { if (quiet) render(); return; }
  if (ev === 'sync') { const s = document.getElementById('sync-status'); if (s) s.textContent = syncStatusText(); document.querySelectorAll('.sync-dot').forEach(d => d.classList.toggle('off', !!auth.lastError)); }
});
// Membership: the pages that open or lock on it redraw when it is known or changes. Elsewhere (a lesson
// mid-drill, say) only the member-only buttons marked data-needs switch on or off.
const REDRAW = ['account', 'library', 'print', 'playbook', 'family', 'bonus', 'course', 'exam', 'kit', 'certificate'];
membership.on(() => {
  const [first, second] = location.hash.replace(/^#\/?/, '').split('/');
  const formPage = (first === 'exam' && second === 'take') || (first === 'certificate' && second === 'listing');
  if (formPage ? formShown !== formSig() : REDRAW.includes(first)) render();
  else if (accessShown && accessShown !== accessSig()) render(); // a stage page, the gate or the trail
  else document.querySelectorAll('[data-needs]').forEach(el => { el.hidden = !membership.can(el.dataset.needs); });
});
auth.init(); // synchronous part first: it rewrites a failed magic-link hash before the first render
render();

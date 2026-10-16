// app.js — router and pages.
import { injectDefs, logo, badge } from './art.js';
import { AbacusView } from './abacus.js';
import { STAGES, stageByN, lessonKey } from './curriculum.js';
import { store, levelFromXP, today } from './store.js';
import { runDrill, runSequence, confetti, toast, makeProblem } from './drills.js';
import { MAIN_LADDER, TIMES_LADDER, runLadder, renderChart, percentile } from './ladder.js';
import { GUIDE_HTML, PLAN_HTML_TOP, PLAN_HTML_BOTTOM } from './guide.js';
import { genAddSub, genMul, genDiv } from './generator.js';

injectDefs();
document.getElementById('logo').innerHTML = logo();
const app = document.getElementById('app');
const h = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ───────────── helpers ─────────────
function ensureProfile() {
  if (store.profile) return store.profile;
  const p = store.addProfile('Player 1', 7);
  toast('Added "Player 1". Change the name on the home page.');
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
function activateDemos(root) {
  root.querySelectorAll('.demo').forEach(el => {
    if (el.classList.contains('free')) {
      const ab = new AbacusView(el, { rods: Number(el.dataset.rods) || 5, interactive: true });
      el.classList.add('abacus-sm');
      return;
    }
    const start = Number(el.dataset.start || 0);
    const apply = (el.dataset.apply || '').split(',').filter(Boolean).map(Number);
    let notes = []; try { notes = JSON.parse(el.dataset.notes || '[]'); } catch {}
    const maxVal = Math.max(start, Math.abs(apply.reduce((a, b) => a + Math.max(b, 0), start)), ...apply.map(Math.abs));
    const rods = Math.max(3, String(maxVal).length + 1);
    const label = el.dataset.label || '';
    const wrap = h(`<div class="card alt demo-card"><div class="hand" style="font-size:1.3rem">${esc(label)}</div><div class="ab"></div><div class="btn-row" style="justify-content:center"><button class="btn sm primary play">▶ Play</button><button class="btn sm ghost reset">Reset</button></div></div>`);
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
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#/' + path.split('/')[0]));
}

// ───────────── pages ─────────────
function home() {
  const p = store.profile;
  const cur = currentStage();
  const next = nextLesson(cur);
  const lvl = p ? levelFromXP(p.xp) : null;
  const lastTest = p && p.tests.filter(t => t.ladder === 'main').slice(-1)[0];
  const el = h(`<div>
    <section class="hero">
      <div>
        <h1><span class="line">Mental math,</span><span class="line"><span class="hi">faster than a calculator.</span></span></h1>
        <p>Bead Brain teaches a child the Japanese abacus, then takes the abacus away. What is left is a picture of beads in the mind that adds, subtracts, multiplies and divides at a speed that looks like a trick. It is not a trick. It is practice, fifteen minutes a day, in the right order.</p>
        <div class="btn-row">
          <a class="btn big primary" href="#/stage/${cur.n}${next ? '/lesson/' + next.key : ''}">${p ? (next ? `Continue: ${esc(next.title)}` : 'Continue') : 'Start at Sprout'}</a>
          <a class="btn" href="#/guide">Parent guide</a>
        </div>
      </div>
      <div class="card alt" id="home-abacus"><div class="hand center" style="font-size:1.2rem">Try the beads</div><div class="ab abacus-sm"></div><p class="small muted center">Tap beads. Thumb up, index finger down.</p></div>
    </section>

    <section class="card" id="profile-card">
      <div class="profile-row">
        <span class="hand" style="font-size:1.3rem">Who is playing?</span>
        <select id="profile-select">${store.profiles().map(x => `<option value="${x.id}" ${p && x.id === p.id ? 'selected' : ''}>${esc(x.name)} (age ${x.age})</option>`).join('')}<option value="__new">+ Add a child</option></select>
        <span id="new-profile" style="display:${store.profiles().length ? 'none' : ''}"><input id="np-name" placeholder="Name" size="10"> <input id="np-age" type="number" min="4" max="16" placeholder="Age" style="width:80px"> <button class="btn sm primary" id="np-add">Add</button></span>
        ${p ? `<button class="btn sm ghost" id="edit-age">Age ${p.age} ✎</button>` : ''}
      </div>
      ${p ? `<div class="stat-row" style="margin-top:12px">
        <div class="stat"><b>${lvl.level}</b><span>level · ${p.xp} XP</span><div class="bar" style="margin-top:6px"><i style="width:${lvl.pct}%"></i></div></div>
        <div class="stat"><b>${p.streak}🔥</b><span>day streak</span></div>
        <div class="stat"><b>${Object.values(p.bosses).filter(b => b.passed).length}</b><span>badges</span></div>
        <div class="stat"><b>${lastTest ? lastTest.rung : '–'}</b><span>Bead Score rung ${lastTest ? `· ahead of ~${percentile(lastTest.rung, lastTest.age || p.age)}% of age ${lastTest.age || p.age}` : ''}</span></div>
      </div>` : ''}
    </section>

    ${p ? dailyQuestHTML(cur) : ''}

    <section>
      <h2>The trail</h2>
      <p class="muted">Ten stages. Each ends with a boss. Pass it, earn the badge, unlock the next.</p>
      <div class="trail">${STAGES.map(s => {
        const unlocked = stageUnlocked(s.n); const done = p && p.bosses[s.n]?.passed; const pr = stageProgress(s);
        return `<a class="stage-node ${unlocked ? '' : 'locked'} ${done ? 'done' : ''}" href="#/stage/${s.n}"><span class="num">${s.n}</span>${done ? '<span class="check">✅</span>' : ''}${badge(s.key)}<div class="name">${s.name}</div><div class="sub">${esc(s.tagline)}</div><div class="bar" style="width:100%;margin-top:8px;height:9px"><i style="width:${Math.round(100 * pr.done / pr.total)}%"></i></div><div class="sub">${pr.done}/${pr.total} lessons · ${s.time}</div></a>`;
      }).join('')}</div>
    </section>

    <section class="steps-row" style="margin-top:22px">
      <div class="card tint-green"><div class="n">1</div><h3>Learn the beads</h3><p>Read and set numbers until it is instant, then the 34 formulas, one at a time, with problems built to need exactly that move.</p></div>
      <div class="card tint-blue"><div class="n">2</div><h3>Take the beads away</h3><p>Eyes-closed games, dictation and flash anzan grow a mental abacus one rod at a time. The picture does the math.</p></div>
      <div class="card tint-orange"><div class="n">3</div><h3>Measure it</h3><p>A ladder test every few weeks gives a Bead Score and an age-ranked chart. The dots climb. That is the proof.</p></div>
    </section>
  </div>`);
  app.appendChild(el);
  const ab = new AbacusView(el.querySelector('#home-abacus .ab'), { rods: 5, interactive: true }); ab.setValue(2026);
  el.querySelector('#profile-select').onchange = e => { if (e.target.value === '__new') { el.querySelector('#new-profile').style.display = ''; } else { store.select(e.target.value); render(); } };
  el.querySelector('#np-add').onclick = () => { const n = el.querySelector('#np-name').value.trim() || 'Player'; const a = el.querySelector('#np-age').value || 7; store.addProfile(n, a); render(); };
  const ea = el.querySelector('#edit-age'); if (ea) ea.onclick = () => { const a = prompt('Age of ' + p.name + '?', p.age); if (a) { store.update(x => { x.age = Number(a); }); render(); } };
  bindQuest(el, cur);
}

function dailyQuestHTML(stage) {
  const p = store.profile;
  const q = p.quest && p.quest.date === today() ? p.quest : { date: today(), done: [] };
  const items = stage.daily || [];
  const allDone = items.length && q.done.length >= items.length;
  return `<section class="card tint-orange" id="quest">
    <div class="sticker">${allDone ? 'Done today!' : 'Today'}</div>
    <h2>Daily quest · ${stage.name}</h2>
    <p class="muted">Three short drills. Finish all three for a bonus. On a busy day, this is enough.</p>
    <ul class="lesson-list">${items.map((d, i) => `<li class="${q.done.includes(i) ? 'done' : ''}"><span class="ix">${q.done.includes(i) ? '✓' : i + 1}</span><div><a href="#/quest/${stage.n}/${i}">${esc(d.label)}</a><div class="meta">${d.count} problems${d.mode === 'mental' ? ' · mental' : ''}${d.kind === 'flash' ? ' · flash' : ''}</div></div></li>`).join('')}</ul>
  </section>`;
}
function bindQuest() {}

function quest(stageN, idx) {
  const stage = stageByN(stageN); const d = stage.daily[Number(idx)];
  ensureProfile();
  const el = h(`<div><a href="#/" class="muted small">← Home</a><h1>Quest: ${esc(d.label)}</h1><div class="holder"></div></div>`);
  app.appendChild(el);
  runDrill(el.querySelector('.holder'), { ...d, target: { acc: 0.7 } }, { xpKey: 'quest', onFinish: (r, summary) => {
    if (r.passed) {
      store.update(p => { const q = p.quest && p.quest.date === today() ? p.quest : { date: today(), done: [] }; if (!q.done.includes(Number(idx))) q.done.push(Number(idx)); p.quest = q; });
      const q = store.profile.quest;
      if (q.done.length >= stage.daily.length && !q.bonus) { store.update(p => { p.quest.bonus = true; }); store.addXP(50, 'quest bonus'); confetti(); toast('Daily quest complete! +50 XP'); }
    }
    const row = summary.querySelector('.btn-row'); row.appendChild(h('<a class="btn primary" href="#/">Back to quest</a>'));
  } });
}

function stage(n) {
  const s = stageByN(n); if (!s) return notFound();
  const p = store.profile; const unlocked = stageUnlocked(s.n); const pr = stageProgress(s);
  const bossPassed = p && p.bosses[s.n]?.passed;
  const prev = STAGES[s.n - 2], nxt = STAGES[s.n];
  const el = h(`<div>
    <div class="btn-row"><a class="btn sm ghost" href="#/">← Trail</a>${prev ? `<a class="btn sm ghost" href="#/stage/${prev.n}">← ${prev.name}</a>` : ''}${nxt ? `<a class="btn sm ghost" href="#/stage/${nxt.n}">${nxt.name} →</a>` : ''}</div>
    <section class="hero">
      <div>
        <h1>${s.n}. ${s.name} <span class="muted" style="font-size:1.4rem">· ${esc(s.tagline)}</span></h1>
        <p><b>Goal:</b> ${esc(s.goal)}</p>
        <p class="muted">Typical time: ${s.time} at 15–20 minutes a day.</p>
        <div class="callout"><b class="lbl">Why this stage</b>${esc(s.why)}</div>
        ${!unlocked ? `<div class="callout warn"><b class="lbl">Locked</b>Pass the ${prev.name} boss first. Already know this? <button class="btn sm" id="unlock">Unlock anyway</button></div>` : ''}
      </div>
      <div class="center">${badge(s.key).replace('class="badge"', 'class="badge" style="width:180px;height:180px"')}${bossPassed ? '<div class="badge-xp">✅ Badge earned</div>' : ''}</div>
    </section>
    <section class="card">${s.intro}</section>
    <section class="card alt">
      <h2>Lessons <span class="muted" style="font-size:1rem">${pr.done}/${pr.total} done</span></h2>
      <ul class="lesson-list">${s.lessons.map((l, i) => { const st = p && p.lessons[lessonKey(s, l)]; return `<li class="${st?.done ? 'done' : ''}"><span class="ix">${st?.done ? '✓' : i + 1}</span><div><a href="#/stage/${s.n}/lesson/${l.key}">${esc(l.title)}</a><div class="meta">${l.minutes} min${st ? ` · best ${st.best}% · ${st.tries} tries` : ''}</div></div></li>`; }).join('')}</ul>
    </section>
    <section class="card tint-red">
      <h2>${esc(s.boss.title)}</h2>
      <p>${esc(s.boss.desc)}</p>
      <ul>${s.boss.parts.map(pt => `<li><b>${esc(pt.title)}:</b> ${esc(pt.desc)} Need ${Math.round(pt.target.acc * pt.count)}/${pt.count}${pt.timeLimit ? ` in ${Math.round(pt.timeLimit / 60 * 10) / 10} min` : ''}.</li>`).join('')}</ul>
      <div class="btn-row"><a class="btn red big" href="#/stage/${s.n}/boss">${bossPassed ? 'Fight the boss again' : 'Fight the boss'}</a><a class="btn" href="#/worksheet/${s.n}">Print a worksheet</a></div>
      ${bossPassed ? `<p class="small muted">Passed on ${p.bosses[s.n].date}.</p>` : ''}
    </section>
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
  const el = h(`<div>
    <div class="btn-row"><a class="btn sm ghost" href="#/stage/${s.n}">← ${s.name}</a><span class="muted small">Lesson ${idx + 1} of ${s.lessons.length} · ${l.minutes} min</span></div>
    <h1>${esc(l.title)} ${st?.done ? '<span class="badge-xp">✓ done</span>' : ''}</h1>
    <section class="card">${l.teach}</section>
    <section class="card tint-teal">
      <h2>Practice</h2>
      <p class="muted small">${drillDesc(l.drill)} Target: ${Math.round(l.drill.target.acc * 100)}% correct${l.drill.target.maxSec ? ` in under ${Math.round(l.drill.target.maxSec / 60)} min` : ''}.${l.drill.mode === 'mental' ? ' <b>No soroban, no paper.</b>' : (['addsub', 'mul', 'div'].includes(l.drill.kind) ? ' Use your real soroban.' : '')}</p>
      <div class="holder"><button class="btn primary big start">Start practice</button></div>
    </section>
    <div class="btn-row">${nextL ? `<a class="btn" href="#/stage/${s.n}/lesson/${nextL.key}">Next lesson: ${esc(nextL.title)} →</a>` : `<a class="btn red" href="#/stage/${s.n}/boss">Fight the ${s.name} boss →</a>`}</div>
  </div>`);
  app.appendChild(el);
  activateDemos(el);
  el.querySelector('.start').onclick = () => {
    ensureProfile();
    runDrill(el.querySelector('.holder'), l.drill, { xpKey: lessonKey(s, l), onFinish: (r, summary) => {
      const first = !(store.profile.lessons[lessonKey(s, l)]?.done);
      store.lessonDone(lessonKey(s, l), r);
      if (r.passed && first) { confetti(); toast('Lesson complete! ' + (nextL ? 'Next one is unlocked.' : 'Boss time.')); }
      const row = summary.querySelector('.btn-row');
      if (r.passed) row.appendChild(h(nextL ? `<a class="btn primary" href="#/stage/${s.n}/lesson/${nextL.key}">Next lesson →</a>` : `<a class="btn red" href="#/stage/${s.n}/boss">Fight the boss →</a>`));
    } });
  };
}
function drillDesc(d) {
  const s = d.spec || {};
  switch (d.kind) {
    case 'read': return `${d.count} numbers to read${s.peekMs ? ` (shown for ${s.peekMs / 1000} s)` : ''}.`;
    case 'set': return `${d.count} numbers to set on the screen abacus.`;
    case 'single': return `${d.count} single-column moves on the screen abacus.`;
    case 'twocol': return `${d.count} moves with a carry or borrow, on the screen abacus.`;
    case 'addsub': return `${d.count} problems, ${s.terms} lines of ${Array.isArray(s.digits) ? s.digits.join('/') : s.digits}-digit numbers${s.ops === 'mix' ? ', plus and minus' : s.ops === 'sub' ? ', subtracting' : ', adding'}${d.mode === 'spoken' ? ', read aloud' : ''}.`;
    case 'flash': return `${d.count} rounds of ${s.count} ${s.digits}-digit numbers at ${s.ms / 1000} s each.`;
    case 'facts': return `${d.count} times-table facts.`;
    case 'mul': return `${d.count} problems, ${s.aDigits}-digit × ${s.bDigits}-digit.`;
    case 'div': return `${d.count} problems, ${s.qDigits + s.dDigits}-digit ÷ ${s.dDigits}-digit${s.remainder ? ' with remainders' : ''}.`;
  }
  return '';
}

function boss(n) {
  const s = stageByN(n); if (!s) return notFound();
  const el = h(`<div><div class="btn-row"><a class="btn sm ghost" href="#/stage/${s.n}">← ${s.name}</a></div><h1>${esc(s.boss.title)}</h1><p>${esc(s.boss.desc)} Each part is timed. No hints. ${s.boss.parts.some(x => x.mode === 'mental' || x.kind === 'flash') ? 'Mental parts: no soroban, no paper.' : ''}</p><div class="holder"></div></div>`);
  app.appendChild(el);
  ensureProfile();
  runSequence(el.querySelector('.holder'), s.boss.parts.map(pt => ({ ...pt, allowScreenAbacus: true })), { onFinish: results => {
    const passed = results.every(r => r.passed);
    const holder = el.querySelector('.holder'); holder.innerHTML = '';
    const card = h(`<div class="card ${passed ? 'tint-green' : 'tint-orange'} center">
      <h2>${passed ? `${s.name} badge earned!` : 'Not this time'}</h2>
      ${passed ? badge(s.key).replace('class="badge"', 'class="badge" style="width:140px;height:140px"') : ''}
      <table class="table" style="margin:12px auto;max-width:520px">${results.map(r => `<tr><td>${r.passed ? '✅' : '❌'}</td><td>${esc(r.title)}</td><td>${r.correct}/${r.count}</td><td>${Math.floor(r.sec / 60)}:${String(r.sec % 60).padStart(2, '0')}</td></tr>`).join('')}</table>
      <p class="muted">${passed ? (STAGES[s.n] ? `${STAGES[s.n].name} is unlocked.` : 'You have finished the trail. Keep climbing the ladder.') : 'Repeat the lessons for the parts that failed, then come back. Bosses usually take two or three tries.'}</p>
      <div class="btn-row" style="justify-content:center">${passed && STAGES[s.n] ? `<a class="btn primary big" href="#/stage/${s.n + 1}">Go to ${STAGES[s.n].name} →</a>` : ''}<a class="btn" href="#/stage/${s.n}">Back to ${s.name}</a></div>
    </div>`);
    holder.appendChild(card);
    if (passed) { const first = !store.profile.bosses[s.n]?.passed; store.bossDone(s.n, { results: results.map(r => ({ t: r.title, c: r.correct, n: r.count, s: r.sec })) }); store.addXP(first ? 200 : 60, 'boss ' + s.key); confetti(3000); }
    else store.addXP(results.reduce((a, r) => a + r.correct * 5, 0), 'boss attempt');
  } });
}

function test(which = 'main') {
  const ladder = which === 'times' ? TIMES_LADDER : MAIN_LADDER;
  const p = store.profile;
  const mine = p ? p.tests.filter(t => t.ladder === ladder.key) : [];
  const last = mine.slice(-1)[0];
  const suggested = last ? Math.max(1, last.rung - 1) : 1;
  const el = h(`<div>
    <h1>Bead Score</h1>
    <div class="btn-row"><a class="btn sm ${which === 'main' ? 'primary' : ''}" href="#/test">Add &amp; subtract ladder</a><a class="btn sm ${which === 'times' ? 'primary' : ''}" href="#/test/times">Times &amp; divide ladder</a></div>
    <section class="card">
      <p>A ladder of ${ladder.rungs.length} rungs. Each rung is four problems with a time limit. Clear three of four to climb. The first miss ends the test. Your Bead Score is the highest rung cleared, plus a speed bonus. <b>No soroban, no paper, no help</b>: a parent should sit beside and referee.</p>
      <div class="profile-row">Start at rung <input type="number" id="start-rung" min="1" max="${ladder.rungs.length}" value="${suggested}" style="width:80px"> <button class="btn primary big" id="go">Take the test</button> <span class="small muted">Suggested: one below your last result.</span></div>
      <div class="holder" style="margin-top:12px"></div>
    </section>
    <section class="card alt">
      <h2>${p ? esc(p.name) + "'s" : 'Your'} chart</h2>
      <div id="chart">${renderChart(mine, p ? p.age : 8, ladder.key)}</div>
      <p class="small muted">Lines are estimates from grade-level expectations for mental arithmetic, not a measured sample. Your child's dots are the real data. <a href="#/guide">How to read this</a>.</p>
      ${mine.length ? `<table class="table"><tr><th>Date</th><th>Age</th><th>Rung</th><th>Score</th><th>Estimated rank</th></tr>${mine.slice().reverse().map((t, i) => `<tr class="${i === 0 ? 'me' : ''}"><td>${t.date}</td><td>${t.age}</td><td>${t.rung}</td><td>${t.score}</td><td>ahead of ~${percentile(t.rung, t.age, ladder.key)}% of ${t.age}-year-olds</td></tr>`).join('')}</table>` : '<p class="muted">No tests yet.</p>'}
    </section>
    <section class="card">
      <h2>The rungs</h2>
      <table class="table"><tr><th>Rung</th><th>Task</th><th>What it means</th></tr>${ladder.rungs.map(r => `<tr class="${last && last.rung === r.n ? 'me' : ''}"><td>${r.n}</td><td>${esc(r.label)}</td><td class="muted">${esc(r.means)}</td></tr>`).join('')}</table>
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
      holder.appendChild(h(`<div class="card tint-green center"><div class="sticker">${improved ? 'New best!' : 'Logged'}</div><h2>Bead Score ${res.score}</h2><p class="hand" style="font-size:1.6rem">Rung ${res.rung}${res.rung ? ` · ${esc(ladder.rungs[res.rung - 1].means)}` : ''}</p><p>Estimated: ahead of about <b>${pct}%</b> of ${store.profile.age}-year-olds. ${res.rung < ladder.rungs.length ? `Next goal: rung ${res.rung + 1}, ${esc(ladder.rungs[res.rung].label)}.` : 'Top of the ladder.'}</p><div class="btn-row" style="justify-content:center"><a class="btn primary" href="#/test/${which}">See the chart</a></div></div>`));
      if (improved || !last) confetti();
    } });
  };
}

function practice() {
  const el = h(`<div>
    <h1>Free practice</h1>
    <p class="muted">Build any drill. Useful for extra reps on a formula, for older kids who want harder numbers, and for printing worksheets.</p>
    <section class="card">
      <div class="profile-row">
        <label>Kind <select id="kind"><option value="addsub">Add &amp; subtract</option><option value="single">Single column (screen abacus)</option><option value="twocol">Carry / borrow (screen abacus)</option><option value="flash">Flash anzan</option><option value="mul">Multiply</option><option value="div">Divide</option><option value="facts">Times tables</option><option value="read">Read the beads</option></select></label>
        <label>Mode <select id="mode"><option value="abacus">With soroban</option><option value="mental">Mental</option><option value="spoken">Read aloud</option></select></label>
        <label>Problems <input id="count" type="number" value="10" min="1" max="50" style="width:70px"></label>
      </div>
      <div class="profile-row" style="margin-top:8px">
        <label>Digits <input id="digits" type="number" value="2" min="1" max="6" style="width:70px"></label>
        <label>Lines <input id="terms" type="number" value="5" min="2" max="20" style="width:70px"></label>
        <label>Ops <select id="ops"><option value="add">Add only</option><option value="mix" selected>Plus and minus</option></select></label>
        <label>Flash ms <input id="ms" type="number" value="1000" min="100" max="5000" step="100" style="width:90px"></label>
        <label>× digits <input id="bdig" type="number" value="1" min="1" max="3" style="width:70px"></label>
      </div>
      <div style="margin-top:8px"><span class="small muted">Allowed formulas:</span> ${['direct', 'small+', 'small-', 'big+', 'big-', 'combo+', 'combo-'].map(g => `<label class="chip ${g.replace(/[+-]/, '')}"><input type="checkbox" class="allow" value="${g}" checked> ${g}</label>`).join('')}</div>
      <div class="btn-row"><button class="btn primary big" id="go">Start</button><button class="btn" id="print">Print worksheet (20 + answers)</button></div>
      <div class="holder"></div>
    </section>
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

function printWorksheet(drill, title = 'Bead Brain worksheet') {
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
    body{font-family:Nunito,system-ui,sans-serif;padding:20px;color:#222} h1{font-family:'Patrick Hand',cursive;font-weight:400;margin:0 0 4px} .meta{color:#666;font-size:13px;margin-bottom:14px}
    .grid{display:grid;grid-template-columns:repeat(5,1fr);gap:14px 18px} .p{display:flex;gap:8px;align-items:flex-start;padding:8px;border:1px dashed #bbb;border-radius:8px;min-height:60px} .n{font-size:11px;color:#999} .stack{text-align:right;font-size:18px;line-height:1.3} .line{border-top:2px solid #222;height:26px} .one{font-size:18px}
    .key{margin-top:24px;page-break-before:always;font-size:14px} .key span{display:inline-block;width:19%;padding:3px 0}
    @media print{button{display:none}}</style></head><body>
    <button onclick="print()">Print</button>
    <h1>${title}</h1><div class="meta">Name: ______________ &nbsp; Date: __________ &nbsp; Time: ______ &nbsp; Score: ___/20 &nbsp; · work left to right · say the formula</div>
    <div class="grid">${probs.map(cell).join('')}</div>
    <div class="key"><b>Answer key</b><br>${probs.map((p, i) => `<span>${i + 1}. ${p.answer.toLocaleString()}</span>`).join('')}</div>
  </body></html>`);
  w.document.close();
}

function worksheet(n) {
  const s = stageByN(n); if (!s) return notFound();
  const part = s.boss.parts.find(p => ['addsub', 'mul', 'div'].includes(p.kind)) || s.daily.find(p => ['addsub', 'mul', 'div'].includes(p.kind));
  if (part) printWorksheet(part, `Bead Brain · ${s.name} worksheet`);
  location.hash = `#/stage/${s.n}`;
}

function flash() {
  const presets = [
    ['Starter', { count: 5, digits: 1, ms: 1500 }], ['1-digit × 8 at 1 s', { count: 8, digits: 1, ms: 1000 }], ['2-digit × 5 at 1 s', { count: 5, digits: 2, ms: 1000 }], ['2-digit × 8 at 0.7 s', { count: 8, digits: 2, ms: 700 }], ['3-digit × 5 at 1 s', { count: 5, digits: 3, ms: 1000 }], ['3-digit × 10 at 0.7 s', { count: 10, digits: 3, ms: 700 }], ['3-digit × 10 at 0.5 s', { count: 10, digits: 3, ms: 500 }], ['3-digit × 15 at 0.3 s', { count: 15, digits: 3, ms: 300 }], ['World record pace (0.11 s)', { count: 15, digits: 3, ms: 110 }],
  ];
  const el = h(`<div>
    <h1>Flash anzan</h1>
    <p class="muted">Numbers flash and vanish. Keep the total on your mental beads. Type it at the end.</p>
    <section class="card">
      <div class="btn-row">${presets.map((p, i) => `<button class="btn sm preset" data-i="${i}">${p[0]}</button>`).join('')}</div>
      <div class="profile-row" style="margin-top:8px">
        <label>Numbers <input id="count" type="number" value="5" min="2" max="30" style="width:70px"></label>
        <label>Digits <input id="digits" type="number" value="1" min="1" max="4" style="width:70px"></label>
        <label>Seconds each <input id="sec" type="number" value="1.5" min="0.1" max="5" step="0.1" style="width:80px"></label>
        <label>Ops <select id="ops"><option value="add">Add</option><option value="mix">Plus and minus</option></select></label>
        <label>Rounds <input id="rounds" type="number" value="5" min="1" max="30" style="width:70px"></label>
        <label><input type="checkbox" id="beep" checked> beep</label>
      </div>
      <div class="btn-row"><button class="btn primary big" id="go">Flash!</button></div>
      <div class="holder"></div>
    </section>
    <section class="card alt"><h3>How to practise flash</h3><ul><li>Only raise speed or digits when you get 4 of 5 rounds right.</li><li>Sit still and breathe out as each number lands. Do not say the numbers.</li><li>If a round falls apart, let it go and start the next. Chasing a lost picture teaches nothing.</li><li>Japanese flash grades go from 20th kyu (three 1-digit numbers in 5 seconds) to 10th dan (fifteen 3-digit numbers in 3 seconds). The presets above follow that ladder.</li></ul></section>
  </div>`);
  app.appendChild(el);
  el.querySelectorAll('.preset').forEach(b => b.onclick = () => { const p = presets[Number(b.dataset.i)][1]; el.querySelector('#count').value = p.count; el.querySelector('#digits').value = p.digits; el.querySelector('#sec').value = p.ms / 1000; });
  el.querySelector('#go').onclick = () => {
    ensureProfile();
    const spec = { count: Number(el.querySelector('#count').value), digits: Number(el.querySelector('#digits').value), ms: Math.round(Number(el.querySelector('#sec').value) * 1000), ops: el.querySelector('#ops').value, beep: el.querySelector('#beep').checked };
    runDrill(el.querySelector('.holder'), { kind: 'flash', spec, count: Number(el.querySelector('#rounds').value) || 5, target: { acc: 0.8 } }, { xpKey: 'flash', onFinish: r => { if (r.passed) { const key = `flash:${spec.digits}d:${spec.count}n`; if (store.best(key, spec.ms, true)) toast(`New best: ${spec.count} ${spec.digits}-digit numbers at ${spec.ms / 1000} s`); } } });
  };
}

function plan() {
  const el = h(`<div>${PLAN_HTML_TOP}
    <div class="card">
      <h2>The ten stages</h2>
      <table class="table">
        <tr><th>Stage</th><th>What is learned</th><th>Mental track</th><th>Boss</th><th>Time</th></tr>
        ${STAGES.map(s => `<tr><td><a href="#/stage/${s.n}"><b>${s.n}. ${s.name}</b></a><br><span class="small muted">${esc(s.tagline)}</span></td><td>${esc(s.goal)}</td><td class="small">${s.lessons.filter(l => l.drill.mode === 'mental' || l.drill.kind === 'flash' || l.drill.mode === 'spoken').map(l => esc(l.title)).join('; ') || '—'}</td><td class="small">${s.boss.parts.map(p => esc(p.title)).join(' · ')}</td><td>${s.time}</td></tr>`).join('')}
      </table>
      <p class="small muted">Times assume 15–20 minutes a day, six days a week, age seven or older. Total to Prodigy: about 14–18 months.</p>
    </div>
    <div class="card alt">
      <h2>A week at a glance</h2>
      <table class="table"><tr><th>Day</th><th>Plan (15–20 min)</th></tr>
      <tr><td>Mon–Thu</td><td>Warm-up read (2 min) · next lesson or repeat yesterday's drill until it passes (8–10 min) · mental or flash drill (5 min)</td></tr>
      <tr><td>Fri</td><td>Daily quest only (three short drills)</td></tr>
      <tr><td>Sat</td><td>Boss attempt if all lessons are done, otherwise the longest drill of the week, timed, with the time written on the fridge</td></tr>
      <tr><td>Sun</td><td>Rest, or dictation in the car</td></tr>
      <tr><td>Every 2–4 weeks</td><td>Bead Score test instead of the mental drill</td></tr></table>
    </div>
    ${PLAN_HTML_BOTTOM}</div>`);
  app.appendChild(el);
}

function guide() { app.appendChild(h(`<div>${GUIDE_HTML}</div>`)); }
function notFound() { app.appendChild(h('<div class="card"><h2>Page not found</h2><a href="#/">Home</a></div>')); }

// ───────────── router ─────────────
function render() {
  const path = location.hash.replace(/^#\/?/, '');
  const parts = path.split('/').filter(Boolean);
  app.innerHTML = '';
  setNav(path);
  window.scrollTo(0, 0);
  const [a, b, c, d] = parts;
  try {
    if (!a) return home();
    if (a === 'plan') return plan();
    if (a === 'guide') return guide();
    if (a === 'practice') return practice();
    if (a === 'flash') return flash();
    if (a === 'test') return test(b || 'main');
    if (a === 'quest') return quest(b, c);
    if (a === 'worksheet') return worksheet(b);
    if (a === 'stage') { if (c === 'lesson') return lesson(b, d); if (c === 'boss') return boss(b); return stage(b); }
    return notFound();
  } catch (e) { console.error(e); app.appendChild(h(`<div class="card tint-red"><h2>Something broke</h2><pre>${esc(e.stack || e)}</pre></div>`)); }
}
try { history.scrollRestoration = 'manual'; } catch {}
window.addEventListener('hashchange', () => { render(); requestAnimationFrame(() => window.scrollTo(0, 0)); });
render();

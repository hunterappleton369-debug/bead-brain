// drills.js — runs a set of problems of one kind, scores them, explains mistakes.
import { AbacusView, describeStep } from './abacus.js';
import { genAddSub, genSingleColumn, genTwoColumn, genMul, genDiv, genFlash, genFact, genRead } from './generator.js';
import { Soroban, FORMULAS } from './soroban.js';
import { store } from './store.js';

const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const fmt = n => Number(n).toLocaleString();
const sleep = ms => new Promise(r => setTimeout(r, ms));

export function speak(text, rate = 1) {
  try {
    if (!window.speechSynthesis) return Promise.resolve();
    return new Promise(res => {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate; u.onend = res; u.onerror = res;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    });
  } catch { return Promise.resolve(); }
}

export function makeProblem(drill) {
  const s = drill.spec || {};
  switch (drill.kind) {
    case 'read': { const p = genRead(s.digits || 1); return { ...p, prompt: 'What number is this?' }; }
    case 'set': { const p = genRead(s.digits || 1); return { ...p, prompt: `Show <b>${fmt(p.n)}</b> on the abacus` }; }
    case 'single': { const p = genSingleColumn(s); return { ...p, prompt: `Start at <b>${p.v}</b>. Now <b>${p.sign === '+' ? 'add' : 'take away'} ${p.d}</b>.` }; }
    case 'twocol': { const p = genTwoColumn(s); return { ...p, v: p.start, prompt: `Start at <b>${p.start}</b>. Now <b>${p.sign === '+' ? 'add' : 'take away'} ${p.d}</b>.` }; }
    case 'addsub': { const p = genAddSub(s); return { ...p, prompt: '' }; }
    case 'flash': { const p = genFlash(s); return { ...p, prompt: '' }; }
    case 'facts': { const p = genFact(s.maxTable || 9); return { ...p, prompt: '' }; }
    case 'mul': { const p = genMul(s); return { ...p, prompt: '' }; }
    case 'div': { const p = genDiv(s); return { ...p, prompt: '' }; }
  }
  throw new Error('unknown drill kind ' + drill.kind);
}

/**
 * runDrill(container, drill, opts)
 * drill = { kind, spec, count, mode:'abacus'|'mental'|'spoken', target:{acc, maxSec}, timeLimit, title, hint:boolean }
 * opts  = { onFinish(result), xpKey, allowScreenAbacus }
 */
export function runDrill(container, drill, opts = {}) {
  const count = drill.count || 10;
  const mode = drill.mode || 'abacus';
  let i = 0, correct = 0, startAll = 0, answeredAt = 0, cur = null, timerId = null, finished = false, times = [];
  const wrongs = [];

  container.innerHTML = '';
  const root = h(`<div class="drill">
    <div class="hud"><span>Problem <b class="ix">1</b>/${count}</span><span>Right <b class="ok">0</b></span><span class="timer">⏱ <b class="t">0:00</b></span></div>
    <div class="prompt muted"></div>
    <div class="problem"></div>
    <div class="screen-abacus"></div>
    <div class="answer-row"><input type="number" inputmode="numeric" placeholder="?" autocomplete="off"><button class="btn blue check">Check</button></div>
    <div class="feedback"></div>
    <div class="btn-row center" style="justify-content:center"><button class="btn sm ghost hint" style="display:none">Hint</button><button class="btn sm ghost showme" style="display:none">Show me</button><button class="btn sm ghost toggle-ab" style="display:none">Use screen abacus</button></div>
  </div>`);
  container.appendChild(root);
  const $ = sel => root.querySelector(sel);
  const input = $('input');
  const problemEl = $('.problem'), promptEl = $('.prompt'), fb = $('.feedback'), abWrap = $('.screen-abacus');
  let ab = null, demoAb = null;

  const needsScreenAbacus = ['read', 'set', 'single', 'twocol'].includes(drill.kind);
  if (needsScreenAbacus) {
    ab = new AbacusView(abWrap, { rods: drill.kind === 'read' || drill.kind === 'set' ? Math.max(3, (drill.spec?.digits || 1) + 1) : 3, interactive: drill.kind !== 'read', showValue: drill.kind !== 'read' && drill.kind !== 'set' });
    if (drill.kind === 'single' || drill.kind === 'twocol') { ab.valueEl.style.display = 'none'; }
  } else if (drill.kind === 'addsub' && mode === 'abacus' && opts.allowScreenAbacus !== false) {
    $('.toggle-ab').style.display = '';
    $('.toggle-ab').onclick = () => {
      if (ab) { abWrap.innerHTML = ''; ab = null; $('.toggle-ab').textContent = 'Use screen abacus'; }
      else { ab = new AbacusView(abWrap, { rods: 9, interactive: true }); $('.toggle-ab').textContent = 'Hide screen abacus'; }
    };
  }

  function tick() { const s = Math.floor((Date.now() - startAll) / 1000); $('.t').textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; if (drill.timeLimit && s >= drill.timeLimit && !finished) finish(true); }

  async function show() {
    cur = makeProblem(drill);
    fb.textContent = ''; fb.className = 'feedback';
    $('.showme').style.display = 'none'; $('.hint').style.display = 'none';
    input.value = ''; input.disabled = false; $('.check').disabled = false;
    promptEl.innerHTML = cur.prompt || '';
    $('.ix').textContent = i + 1;
    problemEl.className = 'problem';
    problemEl.innerHTML = '';
    switch (drill.kind) {
      case 'read':
        ab.setValue(cur.n); ab.clearHighlights(); abWrap.style.visibility = '';
        if (drill.spec?.peekMs) { const me = cur; setTimeout(() => { if (cur === me && !finished) abWrap.style.visibility = 'hidden'; }, drill.spec.peekMs); }
        break;
      case 'set': ab.setValue(0); input.style.display = 'none'; break;
      case 'single': case 'twocol':
        ab.setValue(cur.v); ab.clearHighlights(); ab.caption(`${cur.sign} ${cur.d}`, 'big');
        input.style.display = 'none';
        if (drill.hint !== false) { $('.hint').style.display = ''; }
        break;
      case 'addsub':
        if (mode === 'spoken') {
          problemEl.innerHTML = '<span class="muted">Listen…</span>'; input.disabled = true; $('.check').disabled = true;
          for (const t of cur.terms) { await speak((t < 0 ? 'minus ' : 'plus ') + Math.abs(t), drill.spec.rate || 1); await sleep(drill.spec.gapMs || 400); }
          problemEl.innerHTML = '<span class="muted">Type the total</span>'; input.disabled = false; $('.check').disabled = false;
        } else {
          problemEl.classList.add('stack');
          problemEl.innerHTML = cur.terms.map((t, k) => `<div>${k === 0 ? '' : (t < 0 ? '−' : '+')} ${fmt(Math.abs(t))}</div>`).join('') + '<div>&nbsp;</div>';
          if (mode === 'mental') promptEl.innerHTML = '<span class="chip ink">Mental only. Picture the beads.</span>';
        }
        break;
      case 'flash': {
        input.disabled = true; $('.check').disabled = true;
        const stage = h('<div class="flash-stage"><div class="ready">Ready…</div></div>');
        problemEl.appendChild(stage);
        await sleep(700);
        for (const n of cur.nums) {
          stage.innerHTML = `<div class="num ${n < 0 ? 'neg' : ''}">${n < 0 ? '−' : ''}${Math.abs(n)}</div>`;
          if (drill.spec.beep) beep();
          await sleep(drill.spec.ms);
          stage.innerHTML = '';
          await sleep(Math.min(120, drill.spec.ms * 0.25));
        }
        stage.innerHTML = '<div class="ready">Total?</div>';
        input.disabled = false; $('.check').disabled = false;
        break;
      }
      case 'facts': case 'mul': problemEl.innerHTML = cur.text; break;
      case 'div': problemEl.innerHTML = cur.text + (cur.remainder ? ' <span class="muted small">(give the whole number part)</span>' : ''); break;
    }
    answeredAt = Date.now();
    if (!input.disabled && input.style.display !== 'none') input.focus();
  }

  function userAnswer() {
    if (drill.kind === 'set' || drill.kind === 'single' || drill.kind === 'twocol') return ab.value;
    const v = input.value.trim();
    return v === '' ? null : Number(v);
  }

  async function check() {
    if (finished || !cur) return;
    const a = userAnswer();
    if (a === null) { input.focus(); return; }
    const right = a === cur.answer;
    const dt = (Date.now() - answeredAt) / 1000; times.push(dt);
    input.disabled = true; $('.check').disabled = true;
    if (drill.kind === 'read') abWrap.style.visibility = '';
    if (right) { correct++; $('.ok').textContent = correct; fb.textContent = pick(['Yes!', 'Got it!', 'Nice!', 'Correct!', 'Boom!']) + ' ' + fmt(cur.answer); fb.className = 'feedback good'; }
    else {
      fb.innerHTML = `Not yet. It's <b>${fmt(cur.answer)}</b>`; fb.className = 'feedback bad';
      wrongs.push({ p: cur, a });
      if (['addsub', 'single', 'twocol', 'flash'].includes(drill.kind)) $('.showme').style.display = '';
    }
    i++;
    if (i >= count) { await sleep(right ? 700 : 1500); finish(false); }
    else { await sleep(right ? 700 : (($('.showme').style.display === '') ? 2600 : 1500)); if (!finished && !showingDemo) show(); }
  }

  let showingDemo = false;
  async function showMe() {
    showingDemo = true;
    $('.showme').style.display = 'none';
    let terms = cur.terms || cur.nums;
    let target = ab;
    if (!target) { demoAb = new AbacusView(abWrap, { rods: 7, interactive: false }); target = demoAb; }
    target.setValue(0);
    if (drill.kind === 'single' || drill.kind === 'twocol') { target.setValue(cur.v); terms = [cur.sign === '+' ? cur.d : -cur.d]; }
    for (const t of terms) { await target.play(t, { speed: 1 }); await sleep(300); }
    target.caption(`= ${fmt(cur.answer)}`, 'big');
    await sleep(1500);
    if (demoAb) { abWrap.innerHTML = ''; demoAb = null; }
    showingDemo = false;
    if (!finished) { if (i >= count) finish(false); else show(); }
  }

  function hint() {
    if (!cur) return;
    const f = FORMULAS[cur.id];
    fb.innerHTML = f ? `<span class="chip ${f.type}">${f.text}</span> <span class="small muted">${f.says}</span>` : `<span class="chip direct">Just move the beads</span>`;
    fb.className = 'feedback';
  }

  function finish(timeUp) {
    if (finished) return; finished = true; clearInterval(timerId);
    const sec = Math.round((Date.now() - startAll) / 1000);
    const acc = count ? correct / count : 0;
    const target = drill.target || { acc: 0.8 };
    const passed = acc >= (target.acc ?? 0.8) && (!target.maxSec || sec <= target.maxSec) && !timeUp;
    const mult = mode === 'mental' || drill.kind === 'flash' ? 1.5 : 1;
    const xp = Math.round(correct * 10 * mult + (passed ? 30 : 0));
    const result = { kind: drill.kind, count, correct, acc, sec, passed, xp, timeUp, wrongs, avg: times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0, score: Math.round(acc * 100) };
    if (opts.silent !== true) store.addXP(xp, opts.xpKey || drill.kind);
    root.innerHTML = '';
    const summary = h(`<div class="result ${passed ? 'good' : 'meh'} center">
      <h2>${timeUp ? 'Time!' : passed ? pick(['Great work!', 'Phenom move!', 'That was strong!']) : 'Good try'}</h2>
      <div class="stat-row">
        <div class="stat"><b>${correct}/${count}</b><span>correct</span></div>
        <div class="stat"><b>${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}</b><span>time</span></div>
        <div class="stat"><b>${result.avg.toFixed(1)}s</b><span>per problem</span></div>
        ${opts.silent ? '' : `<div class="stat"><b>+${xp}</b><span>XP</span></div>`}
      </div>
      <p class="muted">${passed ? 'Target reached.' : `Target: ${Math.round((target.acc ?? 0.8) * 100)}% correct${target.maxSec ? ` in under ${Math.round(target.maxSec / 60)} min` : ''}. Try again. Repetition is the whole trick.`}</p>
      <div class="btn-row" style="justify-content:center"><button class="btn secondary again">Again</button></div>
    </div>`);
    root.appendChild(summary);
    summary.querySelector('.again').onclick = () => runDrill(container, drill, opts);
    if (opts.onFinish) opts.onFinish(result, summary);
  }

  $('.check').onclick = check;
  $('.showme').onclick = showMe;
  $('.hint').onclick = hint;
  input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
  root.addEventListener('keydown', e => { if (e.key === 'Enter' && (drill.kind === 'set' || drill.kind === 'single' || drill.kind === 'twocol')) check(); });
  startAll = Date.now(); timerId = setInterval(tick, 500);
  show();
  return { stop: () => { finished = true; clearInterval(timerId); } };
}

function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

let audioCtx = null;
export function beep(freq = 880, ms = 60) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.frequency.value = freq; o.connect(g); g.connect(audioCtx.destination); g.gain.value = 0.05;
    o.start(); o.stop(audioCtx.currentTime + ms / 1000);
  } catch {}
}

/** Run several drills one after another; collect results. */
export function runSequence(container, parts, opts = {}) {
  const results = [];
  let k = 0;
  const next = () => {
    if (k >= parts.length) { opts.onFinish && opts.onFinish(results); return; }
    const part = parts[k++];
    container.innerHTML = '';
    const head = h(`<div class="card ink-edge"><span class="eyebrow">Part ${k} of ${parts.length}</span><h3>${part.title || `Part ${k}`}</h3><p class="muted">${part.desc || ''}</p><div class="btn-row"><button class="btn blue">Start</button></div></div>`);
    container.appendChild(head);
    head.querySelector('button').onclick = () => {
      container.innerHTML = '';
      const holder = document.createElement('div'); container.appendChild(holder);
      runDrill(holder, part, { silent: true, allowScreenAbacus: part.allowScreenAbacus, onFinish: (r, summary) => {
        results.push({ ...r, title: part.title, passed: r.passed });
        const row = summary.querySelector('.btn-row'); row.innerHTML = '';
        const b = h(`<button class="btn blue">${k >= parts.length ? 'See results' : 'Next part'}</button>`);
        b.onclick = next; row.appendChild(b);
      } });
    };
  };
  next();
}

export function confetti(ms = 1800) {
  const c = document.createElement('canvas'); c.className = 'confetti'; document.body.appendChild(c);
  c.width = innerWidth; c.height = innerHeight;
  const ctx = c.getContext('2d');
  const colors = ['#f03e3e', '#ff8a1f', '#ffd23f', '#22c55e', '#0fb5c9', '#2457f5', '#7c5cff', '#ff4fa3'];
  const parts = Array.from({ length: 140 }, () => ({ x: Math.random() * c.width, y: -20 - Math.random() * 200, vx: (Math.random() - 0.5) * 3, vy: 2 + Math.random() * 4, r: 4 + Math.random() * 6, c: colors[Math.floor(Math.random() * colors.length)], a: Math.random() * Math.PI }));
  const t0 = Date.now();
  (function frame() {
    ctx.clearRect(0, 0, c.width, c.height);
    for (const p of parts) { p.x += p.vx; p.y += p.vy; p.a += 0.1; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6); ctx.restore(); }
    if (Date.now() - t0 < ms) requestAnimationFrame(frame); else c.remove();
  })();
}

export function toast(msg, ms = 2200) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = String(msg ?? ''); // text only, never markup
  document.body.appendChild(t); setTimeout(() => t.remove(), ms);
}

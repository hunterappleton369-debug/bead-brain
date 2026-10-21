// handouts.js — Phenom-U practice handouts, printed on demand in the browser.
// A port of docs/products/practice-handouts/tools/make-handouts.mjs (the CLI that built the 86 samples):
// the same page shapes, generators, seeds and checks, minus the file writing. For the same seed this module
// prints the same sheet as the CLI; `node tools/build-members.mjs` re-checks that against the samples.
// If the CLI's rules change, change them here too and run that check.
import { STAGES, stageByN } from './curriculum.js';
import { genAddSub, genTwoColumn, genMul, genDiv, genFlash, genFact, genRead } from './generator.js';
import { analyzeProblem, classifyAdd, classifySub, expandGroups, FORMULAS, Soroban } from './soroban.js';
import * as coach from './coach.js';
import { NOTES, howTo, stuckLine } from './lesson-notes.js';

export const BASE_SEED = 20261021; // the seed the sample sheets in docs/products were built with
export const SHEET_COUNT = 20;

// ───────────────────────── seeded Math.random (mulberry32) ─────────────────────────
// The app's generators call Math.random, so a sheet is built with it swapped for a seeded one,
// then the real one goes back.
let _s = 1;
const seeded = () => {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
function withSeed(s, fn) {
  const real = Math.random;
  _s = s >>> 0; Math.random = seeded;
  try { return fn(); } finally { Math.random = real; }
}
const hash = str => { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
const sheetSeed = (seed, stage, key) => hash(`${seed}:${stage}.${key}`);
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fmt = n => Number(n).toLocaleString('en-US');
const digitsOf = n => String(Math.abs(n)).length;
const pad2 = n => String(n).padStart(2, '0');
const ALL = ['direct', 'small+', 'small-', 'big+', 'big-', 'combo+', 'combo-'];
// A short number a parent can read off the sheet to print the same numbers again.
export const newSeed = () => 1000 + Math.floor(Math.random() * 9000);

// ───────────────────────── which page shape a drill gets ─────────────────────────
function layoutOf(d, key) {
  if (key === 'p-decimals') return 'money';
  if (key === 'p-negative') return 'below';
  if (d.kind === 'set') return 'set';
  if (d.kind === 'read') return 'beads';
  if (['single', 'twocol', 'addsub'].includes(d.kind)) return d.mode === 'spoken' ? 'spoken' : 'stack';
  return d.kind; // facts | mul | div | flash
}
// Lesson titles promise a size ("4-digit ÷ 2-digit"); the app's genDiv does not enforce it, the page does.
const DIV_MIN = { '3-digit ÷ 1-digit': 100, 'div-2x1': 10, 'div-3x1': 100, 'div-rem': 100, 'div-mental': 100, 'p-div': 100, 'g-div-4x2': 1000, '4-digit ÷ 2-digit': 1000, 'Mental 4 ÷ 2': 1000 };

function drillOf(src, key, count) {
  const d = { kind: src.kind, spec: src.spec || {}, mode: src.mode || 'abacus', target: src.target || { acc: 0.8 }, appCount: src.count, timeLimit: src.timeLimit || null, key, count };
  d.layout = layoutOf(d, key);
  d.divMin = DIV_MIN[key] || 0;
  return d;
}

// ───────────────────────── generators (the app's own, plus the page rules) ─────────────────────────
function uniq(make, n, keyOf, tries = 6000, ok = () => true) {
  const out = [], seen = new Set();
  for (let t = 0; t < tries && out.length < n; t++) {
    const p = make(); if (!p || !ok(p)) continue;
    const k = keyOf(p); if (seen.has(k)) continue;
    seen.add(k); out.push(p);
  }
  return out;
}
// Fill n slots from a small pool: shuffled decks, never the same problem twice in a row.
function deal(pool, n, keyOf) {
  if (!pool.length) throw new Error('empty pool');
  const out = [];
  while (out.length < n) {
    const deck = shuffle(pool.slice());
    if (out.length && deck.length > 1 && keyOf(deck[0]) === keyOf(out[out.length - 1])) deck.push(deck.shift());
    out.push(...deck.slice(0, n - out.length));
  }
  return out;
}
// Single-column pool, exactly as genSingleColumn enumerates it, minus the trivial "0 + d" and "d − d".
function singlePool(allow, require, sign) {
  const ok = expandGroups(allow), req = require ? expandGroups(require) : null, out = [];
  for (let v = 0; v <= 9; v++) for (let d = 1; d <= 9; d++) for (const s of (sign === 'mix' ? ['+', '-'] : [sign || '+'])) {
    if (s === '-' && v - d < 0) continue; if (s === '+' && v + d > 9) continue;
    const r = s === '+' ? classifyAdd(v, d) : classifySub(v, d);
    if (!ok.has(r.id) || (req && !req.has(r.id))) continue;
    if (r.id === 'direct' && ((s === '+' && v === 0) || (s === '-' && v === d))) continue;
    out.push({ terms: [v, s === '+' ? d : -d], answer: s === '+' ? v + d : v - d });
  }
  return out;
}
// Every ordered tuple of 1-digit terms whose moves sit inside `allow` (and touch `require`, if set), in the
// order the CLI's brute force lists them. A term's moves depend only on the running total (the beads for a
// value are always the same), so a prefix that already breaks the rules is cut off. Same list, same order,
// milliseconds instead of the CLI's three seconds on the 5-line Stage 4 sheet: it has to run on a phone.
function enumRound(terms, ops, allow, require) {
  const ok = expandGroups(allow), req = require ? expandGroups(require) : null, out = [];
  const signs = ops === 'add' ? [1] : ops === 'sub' ? [-1] : [1, -1];
  const memo = new Map();
  const movesOf = (v, t) => {
    const k = `${v}:${t}`;
    if (!memo.has(k)) memo.set(k, v + t < 0 ? null : new Soroban(12).setValue(v).apply(t).map(st => st.id));
    return memo.get(k);
  };
  const rec = (acc, v, hit) => {
    if (acc.length === terms) { if (!req || hit) out.push({ terms: acc.slice(), answer: v }); return; }
    for (const sg of (acc.length ? signs : [1])) for (let x = 1; x <= 9; x++) {
      const ids = movesOf(v, sg * x);
      if (!ids || ids.some(id => !ok.has(id))) continue;
      acc.push(sg * x); rec(acc, v + sg * x, hit || (!!req && ids.some(id => req.has(id)))); acc.pop();
    }
  };
  rec([], 0, false);
  return out;
}
const tkey = p => p.terms.join(',');
function okAddSub(spec) {
  const allow = expandGroups(spec.allow || ['direct']), req = spec.require ? expandGroups(spec.require) : null;
  return p => {
    if (p.terms.length !== spec.terms) return false;
    let a; try { a = analyzeProblem(p.terms); } catch { return false; }
    if ([...a.used].some(id => !allow.has(id))) return false;
    if (req && ![...a.used].some(id => req.has(id))) return false;
    return p.terms.every((t, i) => digitsOf(t) === (i === 0 && spec.firstDigits ? spec.firstDigits : (Array.isArray(spec.digits) ? spec.digits[i % spec.digits.length] : spec.digits)));
  };
}
function addSubItems(spec, n) {
  if (spec.digits === 1 && !spec.firstDigits) {
    const pool = enumRound(spec.terms, spec.ops, spec.allow || ['direct'], spec.require);
    return pool.length >= n ? shuffle(pool).slice(0, n) : deal(pool, n, tkey);
  }
  const items = uniq(() => { const p = genAddSub(spec); return { terms: p.terms, answer: p.answer }; }, n, tkey, n * 300, okAddSub(spec));
  if (items.length < n) throw new Error(`only ${items.length}/${n} add/sub problems for ${JSON.stringify(spec)}`);
  return items;
}

function makeItems(d) {
  const s = d.spec, n = d.count;
  switch (d.layout) {
    case 'set': case 'beads': {
      if (s.digits === 1) return deal([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(x => ({ n: x, answer: x })), n, p => p.n);
      return uniq(() => { const p = genRead(s.digits); return { n: p.n, answer: p.n }; }, n, p => p.n);
    }
    case 'stack': case 'spoken': {
      if (d.kind === 'single') {
        // Lessons that teach a new friend: most problems need it, about a third are free-bead decoys,
        // so the child has to decide every time ("free beads, or friend?").
        const decoys = s.require ? Math.round(n * 0.3) : 0;
        const req = deal(singlePool(s.allow, s.require, s.sign), n - decoys, tkey);
        const dir = decoys ? deal(singlePool(['direct'], null, s.sign), decoys, tkey).map(p => ({ ...p, decoy: true })) : [];
        let all = shuffle([...req, ...dir]);
        for (let t = 0; t < 200 && all.some((p, i) => i && tkey(p) === tkey(all[i - 1])); t++) all = shuffle(all);
        return all;
      }
      if (d.kind === 'twocol') {
        const items = uniq(() => { const p = genTwoColumn(s); return p.steps?.length ? { terms: [p.start, p.sign === '+' ? p.d : -p.d], answer: p.answer } : null; }, n, tkey, 20000);
        if (items.length < n) throw new Error(`only ${items.length}/${n} two-column problems for ${d.key}`);
        return items;
      }
      return addSubItems(s, n);
    }
    case 'money': return addSubItems(s, n);
    case 'below': {
      // Totals that end below zero (−1 … −99), so one borrowed 100 covers them, as the lesson teaches.
      const make = () => {
        const terms = [rnd(10, 99)]; let run = terms[0];
        for (let i = 1; i < s.terms; i++) {
          let x = rnd(10, 99), sg = Math.random() < 0.55 ? -1 : 1;
          if (run - x < -99) sg = 1;
          if (i === s.terms - 1 && run - x > -1) { x = Math.min(99, Math.max(10, run + rnd(1, 40))); sg = -1; if (run - x > -1 || run - x < -99) return null; }
          terms.push(sg * x); run += sg * x;
        }
        return { terms, answer: run };
      };
      const items = uniq(make, n, tkey, 20000, p => p.answer < 0 && p.answer >= -99);
      if (items.length < n) throw new Error('below-zero pool too small');
      return items;
    }
    case 'flash': {
      const items = uniq(() => { const p = genFlash(s); return { terms: p.nums, answer: p.answer }; }, n, tkey);
      if (items.length < n) throw new Error('flash pool too small');
      return items;
    }
    case 'facts': return uniq(() => { const p = genFact(s.maxTable || 9); return { a: p.a, b: p.b, answer: p.answer }; }, n, p => `${p.a}x${p.b}`);
    case 'mul': return uniq(() => { const p = genMul(s); return { a: p.a, b: p.b, answer: p.answer }; }, n, p => `${p.a}x${p.b}`, 6000, p => p.b >= 2 && p.a >= 2 && p.a % 10 !== 0 && p.b % 10 !== 0);
    case 'div': {
      const items = uniq(() => { const p = genDiv(s); return { n: p.n, d: p.d, q: p.q, r: p.r, answer: p.q }; }, n, p => `${p.n}/${p.d}`, 20000,
        p => p.n >= d.divMin && p.q >= 2 && (!s.remainder || p.r > 0));
      if (items.length < n) throw new Error(`only ${items.length}/${n} division problems for ${d.key}`);
      return items;
    }
  }
  throw new Error('no generator for ' + d.layout);
}

// ───────────────────────── independent re-check ─────────────────────────
// Recomputes every problem from its printed numbers with js/soroban.js. Shares no code with the generators above.
function verifyItem(d, p) {
  const errs = [], s = d.spec;
  const allow = expandGroups(s.allow || ALL), req = s.require ? expandGroups(s.require) : null;
  const want = i => (i === 0 && s.firstDigits ? s.firstDigits : (Array.isArray(s.digits) ? s.digits[i % s.digits.length] : s.digits));
  switch (d.layout) {
    case 'set': case 'beads':
      if (p.answer !== p.n) errs.push('answer');
      if (s.digits === 1 ? !(p.n >= 0 && p.n <= 9) : digitsOf(p.n) !== s.digits) errs.push('digits');
      break;
    case 'stack': case 'spoken': case 'money': {
      let a; try { a = analyzeProblem(p.terms); } catch { errs.push('negative running total'); break; }
      if (a.answer !== p.answer) errs.push(`answer ${p.answer} != ${a.answer}`);
      if (d.kind === 'single' || d.kind === 'twocol') {
        const moves = a.perTerm[1];                    // setting the start number is always direct
        if (p.terms.length !== 2) errs.push('shape');
        if (d.kind === 'single' && (p.terms[0] > 9 || p.answer > 9 || p.answer < 0)) errs.push('leaves the column');
        for (const st of moves) if (!allow.has(st.id)) errs.push(`outside: ${st.id}`);
        if (p.decoy) { if (moves.some(st => st.id !== 'direct')) errs.push('decoy is not a free-bead move'); }
        else if (req && !moves.some(st => req.has(st.id))) errs.push('misses the lesson move');
      } else {
        for (const id of a.used) if (!allow.has(id)) errs.push(`outside: ${id}`);
        if (req && ![...a.used].some(id => req.has(id))) errs.push('misses the lesson move');
        if (p.terms.length !== s.terms) errs.push('line count');
        p.terms.forEach((t, i) => { if (digitsOf(t) !== want(i)) errs.push(`digits line ${i + 1}`); });
        if (s.ops === 'add' && p.terms.some(t => t < 0)) errs.push('minus in an add-only drill');
      }
      break;
    }
    case 'below': {
      let a; try { a = analyzeProblem([100, ...p.terms]); } catch { errs.push('needs more than one borrowed 100'); break; }
      for (const id of a.used) if (!allow.has(id)) errs.push(`outside: ${id}`);
      if (a.answer - 100 !== p.answer) errs.push('answer');
      if (!(p.answer < 0 && p.answer >= -99)) errs.push('not below zero');
      if (p.terms.length !== s.terms || p.terms.some(t => digitsOf(t) !== s.digits)) errs.push('shape');
      break;
    }
    case 'flash': {
      let run = 0; for (const t of p.terms) { run += t; if (run < 0) errs.push('negative'); }
      if (run !== p.answer) errs.push('answer');
      if (p.terms.length !== s.count || p.terms.some(t => digitsOf(t) !== s.digits)) errs.push('shape');
      break;
    }
    case 'facts':
      if (p.a * p.b !== p.answer) errs.push('answer');
      if (p.a < 2 || p.a > (s.maxTable || 9) || p.b < 2 || p.b > 9) errs.push('outside the tables');
      break;
    case 'mul':
      if (p.a * p.b !== p.answer) errs.push('answer');
      if (digitsOf(p.a) !== s.aDigits || digitsOf(p.b) !== s.bDigits) errs.push('digits');
      break;
    case 'div':
      if (p.d * p.q + p.r !== p.n) errs.push('n != d*q+r');
      if (p.r < 0 || p.r >= p.d) errs.push('remainder');
      if (!s.remainder && p.r !== 0) errs.push('remainder in an exact drill');
      if (digitsOf(p.d) !== s.dDigits || digitsOf(p.q) !== s.qDigits) errs.push('digits');
      if (p.n < d.divMin) errs.push('dividend smaller than the lesson title');
      break;
  }
  return errs;
}
const itemKey = p => p.terms ? tkey(p) : p.a !== undefined ? `${p.a}x${p.b}` : p.d !== undefined ? `${p.n}/${p.d}` : String(p.n);
// Every problem on a sheet, re-checked. Returns a list of problems found (empty = good to print).
export function verifySheet(sheet) {
  const log = [];
  for (const x of sheet.drills) {
    if (x.items.length !== x.d.count) log.push(`${x.part || sheet.key}: ${x.items.length} problems, wanted ${x.d.count}`);
    x.items.forEach((p, i) => {
      const e = verifyItem(x.d, p);
      if (e.length) log.push(`${x.part || sheet.key} #${i + 1} ${itemKey(p)}: ${e.join('; ')}`);
      if (i && itemKey(p) === itemKey(x.items[i - 1])) log.push(`${x.part || sheet.key} #${i + 1}: same as the one before`);
    });
  }
  return log;
}

// ───────────────────────── rendering ─────────────────────────
const passOf = (acc, n) => Math.max(1, Math.ceil(acc * n - 1e-9));
const mmss = sec => { sec = Math.round(sec); const m = Math.floor(sec / 60), s = sec % 60; return s ? `${m}:${pad2(s)}` : `${m} min`; };
function timeGoal(d) {
  if (d.timeLimit) return d.timeLimit;
  if (d.target.maxSec) return d.target.maxSec * d.count / (d.appCount || d.count);
  return null;
}
function typeLabel(d) {
  const t = { set: 'Setting', beads: d.spec.peekMs ? 'Bead reading · Flash peek' : 'Bead reading', money: 'Mental', below: 'Mental', facts: 'Times tables', flash: 'Flash', spoken: 'Listening' }[d.layout]
    || (d.mode === 'mental' ? 'Mental' : 'Written · Soroban');
  return timeGoal(d) && !/Timed/.test(t) ? `${t} · Timed` : t;
}
function beadsSVG(n, rods) {
  // Colors and stroke widths live in css/members.css (svg.sb …).
  const P = 14, W = rods * P + 6, H = 78, beam = 24, ry = 3.4, rx = 5.3;
  const digs = String(n).padStart(rods, '0').split('').map(Number);
  const bead = (x, y) => `<ellipse class="b" cx="${x}" cy="${(+y).toFixed(1)}" rx="${rx}" ry="${ry}"/>`;
  let g = `<rect class="fr" x="1" y="1" width="${W - 2}" height="${H - 2}" rx="3"/>`;
  digs.forEach((v, i) => {
    const x = 3 + P / 2 + i * P, h = v >= 5, e = v % 5;
    g += `<line class="rod" x1="${x}" y1="2" x2="${x}" y2="${H - 2}"/>`;
    g += bead(x, h ? beam - 1.3 - ry - 0.4 : 1 + ry + 1.6);
    for (let j = 0; j < e; j++) g += bead(x, beam + 1.3 + ry + 0.4 + j * 7.3);
    for (let j = 0; j < 4 - e; j++) g += bead(x, H - 2 - ry - 0.6 - j * 7.3);
  });
  g += `<line class="beam" x1="1" y1="${beam}" x2="${W - 1}" y2="${beam}"/>`;
  g += `<circle class="dot" cx="${3 + P / 2 + (rods - 1) * P}" cy="${beam}" r="1.5"/>`;
  return `<svg class="sb" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
}
const SIGN = t => (t < 0 ? '−' : '+');
const money = c => (Math.abs(c) / 100).toFixed(2);
function stackClass(d) {
  const lines = d.spec.terms || 2;
  return lines >= 15 ? 'l15' : lines >= 10 ? 'l10' : lines >= 6 ? 'l6' : 'l5';
}
function cell(d, p, label) {
  const n = `<span class="n">${label}</span>`;
  switch (d.layout) {
    case 'set': return `<div class="p set">${n}<div class="big">${p.n}</div><div class="tick"></div></div>`;
    case 'beads': return `<div class="p beads">${n}${beadsSVG(p.n, Math.max(3, (d.spec.digits || 1) + 1))}<div class="box"></div></div>`;
    case 'stack': case 'money': case 'below': {
      const show = t => d.layout === 'money' ? `$${money(t)}` : String(Math.abs(t));
      const rows = p.terms.map((t, k) => `<div class="t"><i>${k ? SIGN(t) : ''}</i>${show(t)}</div>`).join('');
      return `<div class="p">${n}<div class="st ${stackClass(d)}">${rows}<div class="rule"></div></div><div class="box"></div></div>`;
    }
    case 'facts': case 'mul': return `<div class="p line">${n}<span class="q">${p.a} × ${p.b} =</span><div class="ab"><div class="box"></div></div></div>`;
    case 'div': return d.spec.remainder
      ? `<div class="p line">${n}<span class="q">${fmt(p.n)} ÷ ${p.d} =</span><div class="ab"><div class="box"></div><span class="r">r</span><div class="box rem"></div></div></div>`
      : `<div class="p line">${n}<span class="q">${fmt(p.n)} ÷ ${p.d} =</span><div class="ab"><div class="box"></div></div></div>`;
    case 'flash': case 'spoken': return `<div class="p ans">${n}<div class="box"></div></div>`;
  }
}
const gridClass = d => (['facts', 'mul', 'div'].includes(d.layout) ? 'grid g4' : 'grid');
const answerText = (d, p) => d.layout === 'money' ? `$${money(p.answer)}` : d.layout === 'below' ? `−${Math.abs(p.answer)}`
  : d.layout === 'div' && d.spec.remainder ? `${fmt(p.q)} r ${p.r}` : fmt(p.answer);

function readAloud(d, items, labels) {
  const s = d.spec, flash = d.layout === 'flash';
  const lines = flash ? s.count : s.terms, digits = s.digits;
  let tempo;
  if (flash) {
    const bpm = Math.round(60000 / s.ms), secs = s.ms >= 1000 ? `${s.ms / 1000} second${s.ms === 1000 ? '' : 's'}` : `${s.ms / 1000} seconds`;
    const tooFast = s.ms < 700 || (digits >= 3 && s.ms < 1000);
    tempo = `<p><b>The beat:</b> one number every ${secs}. Set a free metronome app to ${bpm} beats a minute and read one number on each beat. Say the numbers only, no "plus".</p>`
      + (tooFast ? `<p><b>Too fast to read out loud?</b> It is, at this speed. Read the page at your quickest clear pace as a warm-up. Then run the true speed on the flash trainer in the app.</p>` : '');
  } else {
    tempo = s.rate > 1
      ? `<p><b>The beat:</b> a little faster than you talk, about one number a second, with no extra pause. Read take-aways as "minus 347".</p>`
      : `<p><b>The beat:</b> your normal talking pace, with a short pause between numbers.${s.ops === 'add' ? '' : ' Read take-aways as "minus 34".'}</p>`;
  }
  tempo += `<p>Say "that is" after the last number. Your child writes the total in the box with the same number. Do not repeat a number.</p>`;
  const head = `<tr><th></th>${Array.from({ length: lines }, (_, i) => `<th>${i + 1}</th>`).join('')}<th>Total</th></tr>`;
  const rows = items.map((p, i) => `<tr><td class="r">${labels[i]}</td>${p.terms.map((t, k) => `<td>${k && t < 0 ? '−' : ''}${Math.abs(t)}</td>`).join('')}<td class="a">${fmt(p.answer)}</td></tr>`).join('');
  const size = lines >= 15 ? 'l15' : lines >= 10 ? 'l10' : 'l5';
  return `<div class="tempo">${tempo}</div>\n<table class="readaloud ${size}">${head}${rows}</table>`;
}

function header(stage, right) {
  return `<div class="top"><span><b>Child Phenoms</b> \u00a0Phenom-U practice handout</span><span>${right}</span></div>`;
}
function fields(scoreText, passText) {
  return `<div class="fields"><span>Name <u></u></span><span>Date <u class="s"></u></span><span>Time <u class="s"></u></span><span>Score <u class="s"></u> ${scoreText}</span>${passText ? `<span class="pass">${passText}</span>` : ''}</div>`;
}
function formulaChips(d) {
  const ids = d.spec.require ? [...expandGroups(d.spec.require)] : [];
  if (!ids.length || ids.length > 6) return '';
  return `<div class="formulas">${ids.map(id => `<span class="f ${FORMULAS[id].type}">${FORMULAS[id].text}</span>`).join('')}</div>`;
}

// One HTML block per page (no blank lines inside a block), the same strings the CLI writes into the .md samples.
const block = lines => lines.filter(Boolean).join('\n');

function renderLesson(stage, lesson, idx, d, items) {
  const pass = passOf(d.target.acc, d.count), t = timeGoal(d);
  const passText = `Pass: ${pass} of ${d.count}` + (t ? ` in ${mmss(t)}` : '');
  const chips = `<span class="chip">${typeLabel(d)}</span>`;
  const labels = items.map((_, i) => String(i + 1));
  const aloud = d.layout === 'flash' || d.layout === 'spoken';
  const keyStrip = d.layout === 'set'
    ? `<div class="fold"><span>For the grown-up</span><span>Check the beads against the number, then tick the box.</span></div>`
    : aloud ? `<div class="fold"><span>Answers</span><span>On page 2, beside each problem.</span></div>`
    : `<div class="fold"><span>✂ Fold this strip under before you start.</span><span>Answers for the grown-up</span></div>\n<div class="key">${items.map((p, i) => `<span><b>${labels[i]}.</b>${answerText(d, p)}</span>`).join('')}</div>`;
  const strip = `<div class="strip">\n${keyStrip}\n</div>`;
  const page1 = [
    `<div class="sheet ${stage.color}">`,
    header(stage, chips),
    `<h1><small>Stage ${stage.n} · ${stage.name} · Lesson ${idx} of ${stage.lessons.length}</small>${lesson.title}</h1>`,
    fields(`/ ${d.count}`, passText),
    `<div class="howto"><p><b>Today's move.</b> ${NOTES[lesson.key]}</p><p><b>How.</b> ${howTo(d)}</p><p><b>Stuck?</b> ${stuckLine(d, coach)}</p></div>`,
    formulaChips(d),
    `<div class="${gridClass(d)}">${items.map((p, i) => cell(d, p, labels[i])).join('')}</div>`,
    `<div class="foot"><span class="say">Work left to right. Say the move.</span><span class="parent">${coach.PARENT_LINE[stage.key]}</span></div>`,
    strip,
    `</div>`,
  ];
  const page2 = aloud ? [
    `<div class="sheet ${stage.color}">`, header(stage, '<span class="chip">Page 2 · for the grown-up</span>'),
    `<h1><small>Stage ${stage.n} · ${stage.name} · Lesson ${idx}</small>${lesson.title}: read-aloud page</h1>`,
    readAloud(d, items, labels), `</div>`] : null;
  return [block(page1), page2 && block(page2)].filter(Boolean);
}

function renderBoss(stage, parts) {
  const letters = 'ABCD';
  const total = parts.reduce((a, x) => a + x.d.count, 0);
  const secs = parts.reduce((a, x) => a + (x.d.timeLimit || 0), 0);
  const chips = [...new Set(parts.map(x => typeLabel(x.d).replace(' · Timed', '')))].map(t => `<span class="chip">${t}</span>`).join('') + '<span class="chip">Timed</span>';
  const body = [], keys = [], aloud = [];
  parts.forEach((x, pi) => {
    const L = letters[pi], d = x.d, labels = x.items.map((_, i) => `${L}${i + 1}`);
    const pass = passOf(d.target.acc, d.count);
    body.push(`<div class="part"><h2>Part ${L} · ${x.part.title}<span class="meta">${d.count} problems · ${mmss(d.timeLimit)} · pass ${pass} of ${d.count} · ${typeLabel(d).replace(' · Timed', '')}</span></h2>`
      + `<div class="howto"><p>${howTo(d)}</p></div>`
      + `<div class="${gridClass(d)}">${x.items.map((p, i) => cell(d, p, labels[i])).join('')}</div></div>`);
    if (d.layout === 'flash' || d.layout === 'spoken') aloud.push(`<h2>Part ${L} · ${x.part.title}</h2>\n${readAloud(d, x.items, labels)}`);
    else if (d.layout !== 'set') keys.push(...x.items.map((p, i) => `<span><b>${labels[i]}.</b>${answerText(d, p)}</span>`));
  });
  const page1 = [
    `<div class="sheet ${stage.color}">`,
    header(stage, chips),
    `<h1><small>Stage ${stage.n} · ${stage.name} · Boss prep</small>${stage.boss.title}: practice run</h1>`,
    fields(`/ ${total}`, `Pass every part · about ${Math.round(secs / 60)} min in all`),
    `<div class="howto"><p><b>What this is.</b> A paper copy of the ${stage.boss.title}. Same parts, same pass marks, same time limits. Do it the day before the boss.</p><p><b>How.</b> Time each part on its own. No hints and no going back. Pass every part and you are ready for the real test.</p><p><b>Missed a part?</b> Go back to that lesson's sheet for two days, then try this page again.</p></div>`,
    ...body,
    `<div class="foot"><span class="say">Work left to right. Say the move.</span><span class="parent">${coach.PARENT_LINE[stage.key]}</span></div>`,
    keys.length ? `<div class="strip"><div class="fold"><span>✂ Fold this strip under before you start.</span><span>Answers for the grown-up${aloud.length ? ' (read-aloud answers are on page 2)' : ''}</span></div>\n<div class="key">${keys.join('')}</div></div>` : '',
    `</div>`,
  ];
  const page2 = aloud.length ? [`<div class="sheet ${stage.color}">`, header(stage, '<span class="chip">Page 2 · for the grown-up</span>'),
    `<h1><small>Stage ${stage.n} · ${stage.name} · Boss prep</small>Read-aloud page</h1>`, ...aloud, `</div>`] : null;
  return [block(page1), page2 && block(page2)].filter(Boolean);
}

// ───────────────────────── building sheets ─────────────────────────
function buildLesson(stage, key, count, seed) {
  const idx = stage.lessons.findIndex(l => l.key === key);
  if (idx < 0) throw new Error(`no lesson "${key}" in stage ${stage.n}`);
  const lesson = stage.lessons[idx];
  const d = drillOf(lesson.drill, key, count);
  const s = sheetSeed(seed, stage.n, key);
  const items = withSeed(s, () => makeItems(d));
  return { stage: stage.n, key, title: lesson.title, lessonNo: idx + 1, seed, pages: renderLesson(stage, lesson, idx + 1, d, items), drills: [{ d, items }] };
}
function buildBoss(stage, seed) {
  const s = sheetSeed(seed, stage.n, 'boss');
  const parts = withSeed(s, () => stage.boss.parts.map(part => {
    const d = drillOf(part, part.title, part.count);
    return { part, d, items: makeItems(d) };
  }));
  return { stage: stage.n, key: 'boss', title: `${stage.boss.title}: practice run`, seed, pages: renderBoss(stage, parts), drills: parts.map(x => ({ d: x.d, items: x.items, part: x.part.title })) };
}

/**
 * One printable sheet. key = a lesson key from js/curriculum.js, or 'boss' for the boss-prep sheet.
 * Returns { stage, key, title, seed, pages: [html, html?], drills, problems: [] } where `problems` is the
 * re-check's list (empty when every problem passed).
 */
export function buildSheet(stageN, key, seed = BASE_SEED, count = SHEET_COUNT) {
  const stage = stageByN(stageN);
  if (!stage) throw new Error(`no stage ${stageN}`);
  const sheet = key === 'boss' ? buildBoss(stage, seed) : buildLesson(stage, key, count, seed);
  sheet.problems = verifySheet(sheet);
  return sheet;
}

// What a sheet will be, without building it: for lists in the member library.
export function describeSheet(stageN, key) {
  const stage = stageByN(stageN);
  if (key === 'boss') return { kind: 'Boss prep', label: `${stage.boss.parts.length} parts, timed` };
  const l = stage.lessons.find(x => x.key === key);
  const d = drillOf(l.drill, key, SHEET_COUNT);
  return { kind: typeLabel(d), label: `${d.count} problems · pass ${passOf(d.target.acc, d.count)} of ${d.count}`, twoPages: d.layout === 'flash' || d.layout === 'spoken' };
}

export const SHEETS = STAGES.map(s => ({ stage: s.n, keys: [...s.lessons.map(l => l.key), 'boss'] }));

// problems.mjs — makes the printed drills for the Prodigy Secrets Program.
// Every problem comes from the app's own generators (js/generator.js) and is checked on the
// app's own soroban model (js/soroban.js) against the lesson's allowed and required moves,
// exactly like docs/products/tools/gen.js does for the workbook. Seeded per lesson key, so a
// rebuild prints the same book and changing one lesson does not reshuffle the others.
import { genAddSub, genTwoColumn, genMul, genDiv, genFlash, genFact, genRead } from '../../../../js/generator.js';
import { Soroban, analyzeProblem, classifyAdd, classifySub, expandGroups } from '../../../../js/soroban.js';

// ---- seeded Math.random (mulberry32), reseeded per drill from a string ----
let seed = 1;
Math.random = () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export function reseed(str) {
  let h = 2166136261;
  for (const c of 'prodigy-secrets|' + str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  seed = h | 0;
}
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function uniq(make, n, key, maxTries = 6000) {
  const out = [], seen = new Set();
  for (let t = 0; t < maxTries && out.length < n; t++) {
    const p = make();
    if (!p) continue;
    const k = key(p);
    if (seen.has(k)) continue;
    seen.add(k); out.push(p);
  }
  if (out.length < n) throw new Error(`could not fill ${n} unique items (got ${out.length})`);
  return out;
}

// ---- checks (the same rules verify.mjs applies again, independently) ----
export function stepsFor(start, term, rods = 6) {
  const s = new Soroban(rods).setValue(start);
  const steps = s.apply(term);
  return { steps, value: s.value };
}
function allowedSteps(steps, allow, require) {
  const ok = expandGroups(allow);
  if (!steps.every(st => ok.has(st.id))) return false;
  if (require) { const rq = expandGroups(require); if (!steps.some(st => rq.has(st.id))) return false; }
  return true;
}
export function mulOnBeads(a, b) {
  // add every small product in its landing column, left to right, on a model soroban
  const s = new Soroban(14), A = String(a), B = String(b);
  for (let i = 0; i < A.length; i++) for (let j = 0; j < B.length; j++) {
    const p = Number(A[i]) * Number(B[j]);
    const shift = (A.length - 1 - i) + (B.length - 1 - j);
    if (p) s.apply(p * 10 ** shift);
  }
  return s.value;
}
export function divOnBeads(n, d) {
  // dividend on the beads; guess a digit, take away divisor × digit at its place, repeat
  const s = new Soroban(14).setValue(n);
  let q = 0;
  for (let k = String(n).length - 1; k >= 0; k--) {
    const digit = Math.floor(s.value / (d * 10 ** k));
    if (digit) s.apply(-(d * digit * 10 ** k));
    q = q * 10 + digit;
  }
  return { q, r: s.value };
}

// ---- single-rod pools (the same enumeration genSingleColumn uses) ----
function pool(allow, require, sign) {
  const ok = expandGroups(allow), req = require ? expandGroups(require) : null, out = [];
  for (let v = 0; v <= 9; v++) for (let d = 1; d <= 9; d++) for (const s of (sign === 'mix' ? ['+', '-'] : [sign || '+'])) {
    if (s === '-' && v - d < 0) continue; if (s === '+' && v + d > 9) continue;
    const r = s === '+' ? classifyAdd(v, d) : classifySub(v, d);
    if (!ok.has(r.id) || (req && !req.has(r.id))) continue;
    if (r.id === 'direct' && ((s === '+' && v === 0) || (s === '-' && v === d))) continue; // "0 + d" and "d − d" are trivial on paper
    out.push({ v, d, sign: s, id: r.id, answer: s === '+' ? v + d : v - d });
  }
  return out;
}
const skey = p => `${p.v}${p.sign}${p.d}`;
function deal(opts, n) {
  const out = [];
  while (out.length < n) {
    const deck = shuffle(opts.slice());
    if (out.length && deck.length > 1 && skey(deck[0]) === skey(out[out.length - 1])) deck.push(deck.shift());
    out.push(...deck.slice(0, n - out.length));
  }
  return out;
}
function singles(spec, n) {
  const allow = spec.allow || ['direct'];
  // the moves being practised: the lesson's `require`, or every non-direct move it allows
  const nonDirect = allow.filter(a => a !== 'direct');
  const require = spec.require || (nonDirect.length ? nonDirect : null);
  const decoys = require && allow.includes('direct') ? 3 : 0;
  const req = deal(pool(allow, require, spec.sign), n - decoys);
  const dir = decoys ? deal(pool(['direct'], null, spec.sign), decoys) : [];
  let all = shuffle([...req, ...dir]);
  for (let t = 0; t < 80 && all.some((p, i) => i && skey(p) === skey(all[i - 1])); t++) all = shuffle(all);
  return all;
}

// dividend size by drill, from the lesson titles ("3-digit ÷ 1-digit", "4-digit ÷ 2-digit")
export const DIV_DIGITS = {
  'div-2x1': 2, 'div-3x1': 3, 'div-rem': 3, 'div-by-2': 4, 'p-div': 3, 'g-div-4x2': 4,
  'boss7-0': 3, 'boss7-1': 4, 'boss8-3': 3, 'boss9-3': 4,
};

/** Build n problems for one drill config from curriculum.js. `where` names it (seed + div size). */
export function makeDrill(drill, n, where) {
  reseed(where);
  const spec = drill.spec || {};
  const kind = drill.kind;
  let items;
  switch (kind) {
    case 'set':
    case 'read':
      items = spec.digits === 1
        ? shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, n).map(x => ({ n: x, answer: x }))
        : uniq(() => genRead(spec.digits), n, p => p.n).map(p => ({ n: p.n, answer: p.n }));
      break;
    case 'single':
      items = singles(spec, n).map(p => ({ v: p.v, sign: p.sign, d: p.d, answer: p.answer, ids: [p.id] }));
      break;
    case 'twocol':
      items = uniq(() => {
        const p = genTwoColumn(spec);
        const term = p.sign === '+' ? p.d : -p.d;
        const r = stepsFor(p.start, term);
        if (!allowedSteps(r.steps, spec.allow, spec.require)) return null;
        return { start: p.start, sign: p.sign, d: p.d, answer: r.value, ids: r.steps.map(s => s.id) };
      }, n, p => `${p.start}${p.sign}${p.d}`);
      break;
    case 'addsub':
      items = uniq(() => {
        const p = genAddSub(spec);
        let a; try { a = analyzeProblem(p.terms); } catch { return null; }
        if (p.terms.length !== spec.terms) return null;
        if (!allowedSteps([...a.used].map(id => ({ id })), spec.allow, spec.require)) return null;
        return { terms: p.terms, answer: a.answer, used: [...a.used] };
      }, n, p => p.terms.join(','));
      break;
    case 'flash':
      items = uniq(() => {
        const p = genFlash(spec);
        if (p.nums.length !== spec.count) return null;
        return { nums: p.nums, answer: p.nums.reduce((s, x) => s + x, 0) };
      }, n, p => p.nums.join(','));
      break;
    case 'facts':
      items = uniq(() => genFact(spec.maxTable || 9), n, p => `${p.a}x${p.b}`).map(p => ({ a: p.a, b: p.b, answer: p.a * p.b }));
      break;
    case 'mul':
      items = uniq(() => {
        const p = genMul(spec);
        if (spec.bDigits === 1 && p.b < 2) return null; // × 1 is not a drill
        if (mulOnBeads(p.a, p.b) !== p.a * p.b) throw new Error('mul bead check failed ' + p.text);
        return { a: p.a, b: p.b, answer: p.a * p.b };
      }, n, p => `${p.a}x${p.b}`);
      break;
    case 'div': {
      const want = DIV_DIGITS[where.split('|').pop()] || null;
      items = uniq(() => {
        const p = genDiv(spec);
        if (want && String(p.n).length !== want) return null;
        const b = divOnBeads(p.n, p.d);
        if (b.q !== p.q || b.r !== p.r) throw new Error('div bead check failed ' + p.text);
        return { n: p.n, d: p.d, q: p.q, r: p.r, answer: p.q };
      }, n, p => `${p.n}/${p.d}`);
      break;
    }
    default: throw new Error('unknown drill kind ' + kind);
  }
  return { kind, mode: drill.mode || 'abacus', spec, items };
}

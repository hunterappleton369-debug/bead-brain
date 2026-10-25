// generator.js — makes fresh problems that obey the rules of each stage.
import { Soroban, classifyAdd, classifySub, analyzeProblem, expandGroups } from './soroban.js';

const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

function randomWithDigits(digits) {
  if (digits === 1) return rnd(1, 9);
  return rnd(10 ** (digits - 1), 10 ** digits - 1);
}

// Classify one signed term applied to a soroban state WITHOUT mutating it.
function trialApply(sor, term) {
  const copy = new Soroban(sor.rods);
  copy.columns = sor.columns.slice();
  if (copy.value + term < 0) return null;
  let steps;
  try { steps = copy.apply(term); } catch (e) { return null; }
  return { steps, value: copy.value };
}

/**
 * Generate an add/subtract (mitorizan) problem.
 * spec = {
 *   terms: 5,                 // how many numbers
 *   digits: 2 | [2,1,2],      // digits per term (number or list, cycled)
 *   ops: 'add' | 'sub' | 'mix',
 *   allow: ['direct','small+'] // formula groups or ids the learner knows
 *   require: ['small+3']       // at least one step must use one of these (optional)
 *   firstDigits: 2             // digits of the first term (optional)
 * }
 * Returns { terms:[signed numbers], answer, used:Set, types, steps }
 */
export function genAddSub(spec, attempts = 400) {
  const allow = expandGroups(spec.allow || ['direct']);
  const require = spec.require ? expandGroups(spec.require) : null;
  const digitsAt = i => Array.isArray(spec.digits) ? spec.digits[i % spec.digits.length] : spec.digits;
  let best = null;
  for (let a = 0; a < attempts; a++) {
    const sor = new Soroban(12);
    const terms = [];
    let ok = true;
    const usedAll = new Set();
    for (let i = 0; i < spec.terms; i++) {
      const digs = i === 0 && spec.firstDigits ? spec.firstDigits : digitsAt(i);
      let placed = false;
      // try a handful of random candidates for this slot
      for (let tries = 0; tries < 60; tries++) {
        let n = randomWithDigits(digs);
        let sign = 1;
        if (i > 0) {
          if (spec.ops === 'sub') sign = -1;
          else if (spec.ops === 'mix') sign = Math.random() < 0.45 ? -1 : 1;
        }
        if (sign < 0 && sor.value - n < 0) {
          // too big to subtract; try smaller or flip to add
          if (spec.ops === 'sub' && sor.value >= 10 ** (digs - 1)) n = rnd(10 ** (digs - 1), Math.min(sor.value, 10 ** digs - 1));
          else if (spec.ops === 'sub') { ok = false; break; }
          else sign = 1;
        }
        const r = trialApply(sor, sign * n);
        if (!r) continue;
        if (r.steps.every(st => allow.has(st.id))) {
          sor.apply(sign * n);
          terms.push(sign * n);
          r.steps.forEach(st => usedAll.add(st.id));
          placed = true;
          break;
        }
      }
      if (!placed || !ok) { ok = false; break; }
    }
    if (!ok) continue;
    const hasReq = !require || [...usedAll].some(id => require.has(id));
    const result = { terms, answer: sor.value, used: usedAll };
    if (hasReq) return finish(result);
    if (!best) best = result; // keep a fallback that at least obeys allow
  }
  if (best) return finish(best);
  // Last resort: a tiny direct problem (should not happen with sane specs)
  return finish({ terms: [1, 1], answer: 2, used: new Set(['direct']) });
}

function finish(p) {
  const a = analyzeProblem(p.terms);
  p.types = a.types;
  p.steps = a.perTerm;
  return p;
}

/** Single-column drill: start value v, add/sub digit d, constrained to a formula list. */
export function genSingleColumn(spec) {
  // spec: { allow:[...], require:[...] (optional), sign:'+'|'-'|'mix' }
  const allow = expandGroups(spec.allow || ['direct']);
  const require = spec.require ? expandGroups(spec.require) : null;
  const options = [];
  for (let v = 0; v <= 9; v++) for (let d = 1; d <= 9; d++) {
    const signs = spec.sign === 'mix' ? ['+', '-'] : [spec.sign || '+'];
    for (const s of signs) {
      if (s === '-' && v - d < 0) continue;
      if (s === '+' && v + d > 9) continue; // keep to one column
      const r = s === '+' ? classifyAdd(v, d) : classifySub(v, d);
      if (!allow.has(r.id)) continue;
      if (require && !require.has(r.id)) continue;
      options.push({ v, d, sign: s, id: r.id, answer: s === '+' ? v + d : v - d });
    }
  }
  if (!options.length) return { v: 1, d: 1, sign: '+', id: 'direct', answer: 2 };
  return pick(options);
}

/** Two-column drill where the ones column carries/borrows (big friends & combos). */
export function genTwoColumn(spec) {
  // start value 0..99, add or subtract a single digit; constrained by allow/require
  const allow = expandGroups(spec.allow || ['direct']);
  const require = spec.require ? expandGroups(spec.require) : null;
  for (let tries = 0; tries < 500; tries++) {
    const start = rnd(spec.min ?? 1, spec.max ?? 99);
    const d = rnd(1, 9);
    const sign = spec.sign === 'mix' ? pick(['+', '-']) : (spec.sign || '+');
    const term = sign === '+' ? d : -d;
    const sor = new Soroban(4).setValue(start);
    const r = trialApply(sor, term);
    if (!r) continue;
    if (!r.steps.every(st => allow.has(st.id))) continue;
    if (require && !r.steps.some(st => require.has(st.id))) continue;
    return { start, d, sign, answer: start + term, steps: r.steps };
  }
  return { start: 5, d: 1, sign: '+', answer: 6, steps: [] };
}

/** Multiplication problem. spec = { aDigits, bDigits } */
export function genMul(spec) {
  const a = randomWithDigits(spec.aDigits);
  const b = randomWithDigits(spec.bDigits);
  return { a, b, answer: a * b, text: `${a} × ${b}` };
}

/** Division problem with exact quotient. spec = { qDigits, dDigits, remainder:false } */
export function genDiv(spec) {
  const d = Math.max(2, randomWithDigits(spec.dDigits));
  const q = randomWithDigits(spec.qDigits);
  let r = 0;
  if (spec.remainder) r = rnd(0, d - 1);
  const n = d * q + r;
  return { n, d, q, r, answer: q, remainder: r, text: `${n} ÷ ${d}` };
}

/** Flash anzan sequence. spec = { count, digits, ops:'add'|'mix' } */
export function genFlash(spec) {
  for (let tries = 0; tries < 200; tries++) {
    const nums = [];
    let total = 0, ok = true;
    for (let i = 0; i < spec.count; i++) {
      let n = randomWithDigits(spec.digits);
      let sign = 1;
      if (i > 0 && spec.ops === 'mix' && Math.random() < 0.4) sign = -1;
      if (sign < 0 && total - n < 0) sign = 1;
      nums.push(sign * n); total += sign * n;
    }
    if (ok) return { nums, answer: total };
  }
  return { nums: [1, 1], answer: 2 };
}

/** Times-table fact. */
export function genFact(maxTable = 9) {
  const a = rnd(2, maxTable), b = rnd(2, 9);
  return { a, b, answer: a * b, text: `${a} × ${b}` };
}

/** Read-the-abacus: random number with N digits to display on beads. */
export function genRead(digits) {
  const n = digits === 1 ? rnd(0, 9) : randomWithDigits(digits);
  return { n, answer: n };
}

export const _internal = { rnd, pick, randomWithDigits };

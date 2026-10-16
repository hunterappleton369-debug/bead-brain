// soroban.js — pure soroban arithmetic model.
// Columns: index 0 is the ones column (rightmost). Each column holds 0..9 as
// one heaven bead (worth 5) and up to four earth beads (worth 1 each).
//
// Every single-digit change on a column is classified the way soroban
// teachers classify it:
//   direct  : beads move straight up or down, no trick needed
//   small   : "small friend" (5-complement)   e.g. +4 = +5 -1
//   big     : "big friend" (10-complement)    e.g. +7 = +10 -3
//   combo   : big friend that needs a small friend inside e.g. +6 on 6 = +10 -5 +1
// A carry/borrow into the next column is itself classified recursively.

export const FORMULAS = (() => {
  const f = {};
  for (let d = 1; d <= 4; d++) {
    f[`small+${d}`] = { id: `small+${d}`, type: 'small', sign: '+', d, text: `+${d} = +5 −${5 - d}`, says: `Plus ${d}: add 5, take away ${5 - d}` };
    f[`small-${d}`] = { id: `small-${d}`, type: 'small', sign: '-', d, text: `−${d} = −5 +${5 - d}`, says: `Minus ${d}: take away 5, add ${5 - d}` };
  }
  for (let d = 1; d <= 9; d++) {
    f[`big+${d}`] = { id: `big+${d}`, type: 'big', sign: '+', d, text: `+${d} = −${10 - d} +10`, says: `Plus ${d}: take away ${10 - d}, carry 1 to the left` };
    f[`big-${d}`] = { id: `big-${d}`, type: 'big', sign: '-', d, text: `−${d} = +${10 - d} −10`, says: `Minus ${d}: add ${10 - d}, borrow 1 from the left` };
  }
  for (let d = 6; d <= 9; d++) {
    const c = 10 - d; // 4,3,2,1 — the amount to remove, which needs a small friend
    f[`combo+${d}`] = { id: `combo+${d}`, type: 'combo', sign: '+', d, text: `+${d} = −5 +${5 - c} +10`, says: `Plus ${d}: take away 5, add ${5 - c}, carry 1` };
    f[`combo-${d}`] = { id: `combo-${d}`, type: 'combo', sign: '-', d, text: `−${d} = +5 −${5 - c} −10`, says: `Minus ${d}: add 5, take away ${5 - c}, borrow 1` };
  }
  return f;
})();

export const FORMULA_GROUPS = {
  direct: ['direct'],
  'small+': [1, 2, 3, 4].map(d => `small+${d}`),
  'small-': [1, 2, 3, 4].map(d => `small-${d}`),
  'big+': [1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => `big+${d}`),
  'big-': [1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => `big-${d}`),
  'combo+': [6, 7, 8, 9].map(d => `combo+${d}`),
  'combo-': [6, 7, 8, 9].map(d => `combo-${d}`),
};

export function expandGroups(list) {
  const out = new Set();
  for (const g of list) {
    if (FORMULA_GROUPS[g]) FORMULA_GROUPS[g].forEach(x => out.add(x));
    else out.add(g);
  }
  return out;
}

const parts = v => ({ h: v >= 5 ? 1 : 0, e: v % 5 });

// Classify adding digit d (1..9) to a column holding v (0..9).
// Returns { id, type, moves:{heaven, earth}, carry }
export function classifyAdd(v, d) {
  const { h, e } = parts(v);
  const { h: hd, e: ed } = parts(d);
  if (v + d <= 9) {
    if (e + ed <= 4) return { id: 'direct', type: 'direct', moves: { heaven: hd, earth: ed }, carry: 0 };
    // small friend: +d = +5 -(5-d)   (here d <= 4 and h == 0 necessarily)
    return { id: `small+${d}`, type: 'small', moves: { heaven: +1, earth: -(5 - d) }, carry: 0 };
  }
  const c = 10 - d; // remove c from this column, carry 1
  const { h: hc, e: ec } = parts(c);
  if (hc <= h && ec <= e) return { id: `big+${d}`, type: 'big', moves: { heaven: -hc, earth: -ec }, carry: 1 };
  // combo: removing c needs a small friend: -c = -5 +(5-c)
  return { id: `combo+${d}`, type: 'combo', moves: { heaven: -1, earth: +(5 - c) }, carry: 1 };
}

// Classify subtracting digit d (1..9) from a column holding v (0..9).
// Returns { id, type, moves, borrow }
export function classifySub(v, d) {
  const { h, e } = parts(v);
  const { h: hd, e: ed } = parts(d);
  if (v >= d) {
    if (hd <= h && ed <= e) return { id: 'direct', type: 'direct', moves: { heaven: -hd, earth: -ed }, borrow: 0 };
    // small friend: -d = -5 +(5-d)
    return { id: `small-${d}`, type: 'small', moves: { heaven: -1, earth: +(5 - d) }, borrow: 0 };
  }
  const c = 10 - d; // add c to this column, borrow 1
  const { h: hc, e: ec } = parts(c);
  if (h + hc <= 1 && e + ec <= 4) return { id: `big-${d}`, type: 'big', moves: { heaven: +hc, earth: +ec }, borrow: 1 };
  // combo: adding c needs a small friend: +c = +5 -(5-c)
  return { id: `combo-${d}`, type: 'combo', moves: { heaven: +1, earth: -(5 - c) }, borrow: 1 };
}

// A Soroban holds an array of column digits. columns[0] = ones.
export class Soroban {
  constructor(rods = 9) {
    this.rods = rods;
    this.columns = new Array(rods).fill(0);
  }
  clear() { this.columns.fill(0); }
  get value() {
    let v = 0;
    for (let i = this.rods - 1; i >= 0; i--) v = v * 10 + this.columns[i];
    return v;
  }
  setValue(n) {
    this.clear();
    n = Math.max(0, Math.floor(n));
    for (let i = 0; i < this.rods && n > 0; i++) { this.columns[i] = n % 10; n = Math.floor(n / 10); }
    return this;
  }
  digitsOf(n) {
    // most-significant first, as a soroban user reads it
    const s = String(Math.floor(Math.abs(n)));
    return s.split('').map(Number);
  }
  // Apply +n or -n the way a soroban user does: leftmost digit first.
  // Returns a list of steps: {col, v, d, sign, id, type, moves, chain}
  apply(n) {
    const steps = [];
    const sign = n < 0 ? -1 : 1;
    const digs = this.digitsOf(n);
    const len = digs.length;
    if (len > this.rods) throw new Error('number too wide for this soroban');
    for (let k = 0; k < len; k++) {
      const d = digs[k];
      const col = len - 1 - k;
      if (d === 0) continue;
      this._applyDigit(col, d, sign, steps, false);
    }
    return steps;
  }
  _applyDigit(col, d, sign, steps, chain) {
    if (col >= this.rods) throw new Error('overflow');
    const v = this.columns[col];
    if (sign > 0) {
      const r = classifyAdd(v, d);
      this.columns[col] = (v + d) % 10;
      steps.push({ col, v, d, sign: '+', id: r.id, type: r.type, moves: r.moves, chain, after: this.columns[col] });
      if (r.carry) this._applyDigit(col + 1, 1, +1, steps, true);
    } else {
      const r = classifySub(v, d);
      this.columns[col] = (v - d + 10) % 10;
      steps.push({ col, v, d, sign: '-', id: r.id, type: r.type, moves: r.moves, chain, after: this.columns[col] });
      if (r.borrow) {
        if (col + 1 >= this.rods) throw new Error('negative result');
        this._applyDigit(col + 1, 1, -1, steps, true);
      }
    }
  }
}

// Run a whole add/subtract problem (list of signed terms) from 0 and collect
// which formulas were used. Throws if the running total goes negative.
export function analyzeProblem(terms, rods = 12) {
  const s = new Soroban(rods);
  const used = new Set();
  const perTerm = [];
  const types = { direct: 0, small: 0, big: 0, combo: 0 };
  for (const t of terms) {
    if (s.value + t < 0) throw new Error('negative running total');
    const steps = s.apply(t);
    for (const st of steps) { used.add(st.id); types[st.type]++; }
    perTerm.push(steps);
  }
  return { answer: s.value, used, types, perTerm };
}

// Which digits d (1..9) added to v use formula id? (helper for generators)
export function digitsThatTrigger(v, id, sign) {
  const out = [];
  for (let d = 1; d <= 9; d++) {
    const r = sign === '+' ? classifyAdd(v, d) : classifySub(v, d);
    if (r.id === id) out.push(d);
  }
  return out;
}

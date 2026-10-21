// gen.js — builds the 90 days of workbook drills using the site's own
// soroban classifier and generators (js/soroban.js, js/generator.js), so every
// problem needs only the moves taught so far. Seeded so the output is stable.
import { genAddSub, genSingleColumn, genRead } from '../../../js/generator.js';
import { analyzeProblem, classifyAdd, classifySub, expandGroups } from '../../../js/soroban.js';
import { writeFileSync } from 'node:fs';

// ---- seeded Math.random (mulberry32) so the book is reproducible ----
let seed = 20261020;
Math.random = () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const SMALL = ['direct', 'small+', 'small-'];

// ---- helpers ----
function uniq(make, n, key, maxTries = 400) {
  const out = [], seen = new Set();
  for (let t = 0; t < maxTries && out.length < n; t++) {
    const p = make();
    const k = key(p);
    if (seen.has(k)) continue;
    seen.add(k); out.push(p);
  }
  if (out.length < n) throw new Error('could not fill ' + n + ' unique items');
  return out;
}
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// verify a stacked problem uses only allowed ids (belt and braces)
function check(terms, allow) {
  const ok = expandGroups(allow);
  const a = analyzeProblem(terms);
  for (const id of a.used) if (!ok.has(id)) throw new Error(`problem ${terms.join(' ')} uses ${id}, not in ${allow}`);
  return a.answer;
}
function checkSingle(p, allow) {
  const ok = expandGroups(allow);
  const r = p.sign === '+' ? classifyAdd(p.v, p.d) : classifySub(p.v, p.d);
  if (!ok.has(r.id)) throw new Error(`single ${p.v}${p.sign}${p.d} uses ${r.id}`);
  return r.id;
}

// ---- drill builders ----
const readNums = (digits, n) => uniq(() => genRead(digits).n, n, x => x);
const setNums = (digits, n) => digits === 1 ? shuffle([0,1,2,3,4,5,6,7,8,9]).slice(0, n) : uniq(() => genRead(digits).n, n, x => x);

// Enumerate the single-column pool exactly as genSingleColumn does, then deal from
// shuffled copies of it: when the pool is tiny (+1 and +4 have four cases) the page
// repeats fairly, no two neighbours alike.
function pool(allow, require, sign) {
  const ok = expandGroups(allow), req = require ? expandGroups(require) : null, out = [];
  for (let v = 0; v <= 9; v++) for (let d = 1; d <= 9; d++) for (const s of (sign === 'mix' ? ['+', '-'] : [sign])) {
    if (s === '-' && v - d < 0) continue; if (s === '+' && v + d > 9) continue;
    const r = s === '+' ? classifyAdd(v, d) : classifySub(v, d);
    if (!ok.has(r.id) || (req && !req.has(r.id))) continue;
    if (r.id === 'direct' && ((s === '+' && v === 0) || (s === '-' && v === d))) continue; // skip "0 + d" and "d − d": trivial on a page
    out.push({ v, d, sign: s, id: r.id, answer: s === '+' ? v + d : v - d });
  }
  return out;
}
function deal(opts, n) {
  const out = [];
  while (out.length < n) {
    let deck = shuffle(opts.slice());
    if (out.length && deck.length > 1 && key(deck[0]) === key(out[out.length - 1])) deck.push(deck.shift());
    out.push(...deck.slice(0, n - out.length));
  }
  return out;
}
const key = p => `${p.v}${p.sign}${p.d}`;
function single(allow, require, sign, n, directCount = 0) {
  // `require` problems use the new formula; `directCount` are free-bead decoys so the child must decide
  const req = deal(pool(allow, require, sign), n - directCount);
  const dir = directCount ? deal(pool(['direct'], null, sign), directCount) : [];
  let all = shuffle([...req, ...dir]);
  for (let t = 0; t < 80 && all.some((p, i) => i && key(p) === key(all[i - 1])); t++) all = shuffle(all);
  return all.map(p => ({ v: p.v, sign: p.sign, d: p.d, answer: p.answer, id: checkSingle(p, allow) }));
}

// pick n items whose answers are spread across the pool's range (evenly spaced quantiles), then shuffle
function spreadPick(pool, n) {
  const byAns = new Map();
  for (const p of pool) if (!byAns.has(p.answer)) byAns.set(p.answer, []); 
  for (const p of pool) byAns.get(p.answer).push(p);
  const answersSorted = [...byAns.keys()].sort((a, b) => a - b);
  const out = [], taken = new Set();
  const take = a => { // a random not-yet-used problem with this answer, else any
    const arr = byAns.get(a), fresh = arr.filter(p => !taken.has(p.terms.join(',')));
    const p = (fresh.length ? fresh : arr)[rnd(0, (fresh.length ? fresh : arr).length - 1)];
    taken.add(p.terms.join(',')); out.push(p);
  };
  if (answersSorted.length >= n) for (let i = 0; i < n; i++) take(answersSorted[Math.floor((i + 0.5) * answersSorted.length / n)]);
  else {
    // few distinct totals (1-digit rounds): draw from the natural pool, but no repeated problem and at most 3 of any total
    const count = new Map();
    for (let t = 0; t < 2000 && out.length < n; t++) {
      const p = pool[rnd(0, pool.length - 1)];
      if (taken.has(p.terms.join(',')) || (count.get(p.answer) || 0) >= 3) continue;
      taken.add(p.terms.join(',')); count.set(p.answer, (count.get(p.answer) || 0) + 1); out.push(p);
    }
    if (out.length < n) throw new Error('spreadPick: pool too small');
  }
  return shuffle(out);
}
function stacked(spec, n) {
  const pool = spec.digits === 1 ? enumRound(spec.terms, spec.ops, spec.allow) : uniq(() => genAddSub(spec), 120, p => p.terms.join(','), 4000);
  const items = spreadPick(pool, n);
  return items.map(p => ({ terms: p.terms, answer: check(p.terms, spec.allow), used: [...(p.used || analyzeProblem(p.terms).used)] }));
}
// every ordered tuple of 1-digit terms (signs per ops) whose moves all sit inside `allow` (and, if the
// spec requires it, whose steps touch a required formula). Small enough to enumerate fully.
function enumRound(terms, ops, allow, require = null) {
  const ok = expandGroups(allow), req = require ? expandGroups(require) : null, out = [];
  const signs = ops === 'add' ? [1] : ops === 'sub' ? [-1] : [1, -1];
  const rec = (acc) => {
    if (acc.length === terms) {
      let a; try { a = analyzeProblem(acc); } catch { return; }
      for (const id of a.used) if (!ok.has(id)) return;
      if (req && ![...a.used].some(id => req.has(id))) return;
      out.push({ terms: acc.slice(), answer: a.answer, used: [...a.used] }); return;
    }
    for (const sg of (acc.length ? signs : [1])) for (let d = 1; d <= 9; d++) rec([...acc, sg * d]);
  };
  rec([]);
  return out;
}

// ---- flash builders ----
const peek = (digits, n, seconds) => ({ kind: 'peek', digits, seconds, nums: readNums(digits, n) });
function spoken(terms, digits, ops, rounds, allow = ['direct']) {
  // round 1 has one fewer number than the rest; totals are spread across the possible range
  const out = [];
  for (let r = 0; r < rounds; r++) {
    const t = r === 0 && terms > 2 ? terms - 1 : terms;
    const pool = digits === 1 ? enumRound(t, ops, allow) : uniq(() => genAddSub({ terms: t, digits, ops, allow }), 60, p => p.terms.join(','), 2000);
    const picked = spreadPick(pool.filter(p => !out.some(o => o.terms.join(',') === p.terms.join(','))), Math.min(5, pool.length));
    const p = picked[rnd(0, picked.length - 1)];
    out.push({ terms: p.terms, answer: check(p.terms, allow) });
  }
  return { kind: 'spoken', rounds: out };
}

// ---- the 90-day plan ----
const days = [];
const push = (day, block, drill, flash) => days.push({ day, block, drill, flash });

for (let d = 1; d <= 90; d++) {
  let block, drill, flash;
  if (d <= 4) { block = 'hold'; drill = { kind: "set", digits: 1, nums: setNums(1, 10) }; flash = peek(1, 5, 2); if (d === 1) drill.nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]; }
  else if (d <= 9) { block = 'read2'; drill = { kind: 'read', digits: 2, nums: readNums(2, 10) }; flash = peek(2, 5, 2); }
  else if (d <= 14) { block = 'read3'; drill = { kind: 'read', digits: 3, nums: readNums(3, 10) }; flash = peek(3, 5, 2); }
  else if (d <= 18) { block = 'set3'; drill = { kind: 'set', digits: 3, nums: setNums(3, 10) }; flash = peek(3, 5, 1); }
  else if (d <= 24) { block = 'dadd'; drill = { kind: 'single', allow: ['direct'], items: single(['direct'], null, '+', 10) }; flash = spoken(3, 1, 'add', 3); }
  else if (d <= 29) { block = 'dsub'; drill = { kind: 'single', allow: ['direct'], items: single(['direct'], null, '-', 10) }; flash = spoken(3, 1, 'mix', 3); }
  else if (d <= 36) { block = 'twocol'; const spec = { terms: 3, digits: 2, ops: 'mix', allow: ['direct'] }; drill = { kind: 'stacked', spec, items: stacked(spec, 10) }; flash = spoken(3, 1, 'mix', 3); }
  else if (d <= 39) { block = 'eyes'; drill = { kind: 'single', allow: ['direct'], items: single(['direct'], null, 'mix', 10) }; flash = spoken(4, 1, 'mix', 3); }
  else if (d === 40) {
    block = 'boss1';
    const spec = { terms: 3, digits: 2, ops: 'mix', allow: ['direct'] };
    drill = { kind: 'boss', parts: [
      { title: 'Read hundreds', kind: 'read', digits: 3, nums: readNums(3, 6), limit: 'under a minute' },
      { title: 'Set hundreds', kind: 'set', digits: 3, nums: setNums(3, 5), limit: 'a minute and a half' },
      { title: 'Direct add and take away', kind: 'stacked', spec, items: stacked(spec, 6), limit: 'four minutes' },
    ] };
    flash = spoken(3, 1, 'add', 3);
  }
  else if (d <= 46) { block = 'sf14'; const allow = ['direct', 'small+1', 'small+4']; drill = { kind: 'single', allow, items: single(allow, ['small+1', 'small+4'], '+', 10, 3) }; flash = spoken(3, 1, 'add', 3); }
  else if (d <= 52) { block = 'sf23'; const allow = ['direct', 'small+']; drill = { kind: 'single', allow, items: single(allow, ['small+2', 'small+3'], '+', 10, 3) }; flash = spoken(3, 1, 'add', 3); }
  else if (d <= 59) { block = 'sfadd2d'; const spec = { terms: 4, digits: 2, ops: 'add', allow: ['direct', 'small+'], require: ['small+'] }; drill = { kind: 'stacked', spec, items: stacked(spec, 10) }; flash = spoken(3, 1, 'add', 3); }
  else if (d <= 65) { block = 'sfsub14'; const allow = ['direct', 'small-1', 'small-4']; drill = { kind: 'single', allow, items: single(allow, ['small-1', 'small-4'], '-', 10, 3) }; flash = spoken(4, 1, 'mix', 3); }
  else if (d <= 71) { block = 'sfsub23'; const allow = ['direct', 'small-']; drill = { kind: 'single', allow, items: single(allow, ['small-2', 'small-3'], '-', 10, 3) }; flash = spoken(4, 1, 'mix', 3); }
  else if (d <= 79) { block = 'sfmix'; const spec = { terms: 4, digits: 2, ops: 'mix', allow: SMALL, require: ['small+', 'small-'] }; drill = { kind: 'stacked', spec, items: stacked(spec, 10) }; flash = d % 2 ? spoken(4, 1, 'mix', 3) : spoken(3, 2, 'add', 3); }
  else if (d <= 85) { block = 'speed'; const spec = { terms: 5, digits: 2, ops: 'mix', allow: SMALL }; drill = { kind: 'stacked', spec, items: stacked(spec, 10), timed: true }; flash = d % 2 ? spoken(4, 1, 'mix', 3) : spoken(3, 2, 'mix', 3); }
  else if (d <= 89) { block = 'mental'; const spec = { terms: 3, digits: 1, ops: 'add', allow: ['direct'] }; drill = { kind: 'mental', spec, items: stacked(spec, 10) }; flash = spoken(4, 1, 'mix', 3); }
  else {
    block = 'boss2';
    const spec = { terms: 4, digits: 2, ops: 'mix', allow: SMALL };
    const mspec = { terms: 3, digits: 1, ops: 'add', allow: ['direct'] };
    drill = { kind: 'boss', parts: [
      { title: 'Friend or free?', kind: 'single', allow: SMALL, items: single(SMALL, ['small+', 'small-'], 'mix', 10, 3), limit: 'two minutes' },
      { title: '2-digit, 4 lines', kind: 'stacked', spec, items: stacked(spec, 6), limit: 'four minutes' },
      { title: 'Mental', kind: 'mental', spec: mspec, items: stacked(mspec, 5), limit: 'two minutes' },
    ] };
    flash = spoken(3, 1, 'add', 3);
  }
  push(d, block, drill, flash);
}

writeFileSync(new URL('./days.json', import.meta.url), JSON.stringify(days, null, 1));

// ---- report ----
const counts = {};
for (const d of days) counts[d.block] = (counts[d.block] || 0) + 1;
console.log(counts);
// sanity: every stacked/single item re-verified above via check/checkSingle. Print a sample.
for (const d of [1, 5, 19, 30, 41, 53, 60, 72, 80, 86, 90]) {
  const x = days[d - 1];
  console.log(`\nDay ${d} [${x.block}]`);
  if (x.drill.items) console.log(x.drill.items.slice(0, 4).map(i => i.terms ? `${i.terms.join(' ')} = ${i.answer} (${i.used.join(',')})` : `${i.v} ${i.sign} ${i.d} = ${i.answer} (${i.id})`).join(' | '));
  if (x.drill.nums) console.log(x.drill.nums.join(' '));
  if (x.drill.parts) console.log(x.drill.parts.map(p => p.title + ': ' + (p.nums ? p.nums.join(' ') : p.items.length + ' items')).join(' | '));
  console.log('flash:', x.flash.kind === 'peek' ? x.flash.nums.join(' ') : x.flash.rounds.map(r => r.terms.join(' ') + ' = ' + r.answer).join(' | '));
}

// make-class-drills.mjs — builds the printable drill pages for the 8-week starter course
// (class-drills.md) from the site's own generator and soroban classifier, so every problem
// needs only the moves taught by that week. Seeded, so the output is stable.
//
//   node docs/products/instructor-launch-kit/tools/make-class-drills.mjs          (build + verify)
//   node docs/products/instructor-launch-kit/tools/make-class-drills.mjs --check  (verify only)
//
// Pattern copied from docs/products/tools/gen.js (same mulberry32 seed trick, same checks).
import { genAddSub, genRead } from '../../../../js/generator.js';
import { analyzeProblem, classifyAdd, classifySub, expandGroups } from '../../../../js/soroban.js';
import { writeFileSync, readFileSync } from 'node:fs';

const HERE = new URL('.', import.meta.url);
const OUT_MD = new URL('../class-drills.md', HERE);
const OUT_JSON = new URL('./class-drills.json', HERE);

// ---- seeded Math.random (mulberry32) ----
let seed = 20261021;
Math.random = () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const SMALL = ['direct', 'small+', 'small-'];

function uniq(make, n, key, maxTries = 4000) {
  const out = [], seen = new Set();
  for (let t = 0; t < maxTries && out.length < n; t++) {
    const p = make(); const k = key(p);
    if (seen.has(k)) continue;
    seen.add(k); out.push(p);
  }
  if (out.length < n) throw new Error('could not fill ' + n + ' unique items');
  return out;
}

// ---- checks (used at build time and again by --check) ----
function checkStacked(terms, allow, require) {
  const ok = expandGroups(allow);
  const a = analyzeProblem(terms);
  for (const id of a.used) if (!ok.has(id)) throw new Error(`problem ${terms.join(' ')} uses ${id}, not in ${allow}`);
  if (require) {
    const req = expandGroups(require);
    if (![...a.used].some(id => req.has(id))) throw new Error(`problem ${terms.join(' ')} misses required ${require}`);
  }
  return a.answer;
}
function checkSingle(p, allow, require) {
  const r = p.sign === '+' ? classifyAdd(p.v, p.d) : classifySub(p.v, p.d);
  if (!expandGroups(allow).has(r.id)) throw new Error(`single ${p.v}${p.sign}${p.d} uses ${r.id}`);
  if (require && p.req && !expandGroups(require).has(r.id)) throw new Error(`single ${p.v}${p.sign}${p.d} should use ${require}`);
  const ans = p.sign === '+' ? p.v + p.d : p.v - p.d;
  if (ans < 0 || ans > 9) throw new Error(`single ${p.v}${p.sign}${p.d} leaves the rod`);
  return ans;
}

// ---- builders ----
const nums = (digits, n) => uniq(() => genRead(digits).n, n, x => x).filter(x => x !== 0 || digits === 1);

function singlePool(allow, require, sign) {
  const ok = expandGroups(allow), req = require ? expandGroups(require) : null, out = [];
  for (let v = 0; v <= 9; v++) for (let d = 1; d <= 9; d++) for (const s of (sign === 'mix' ? ['+', '-'] : [sign])) {
    if (s === '-' && v - d < 0) continue; if (s === '+' && v + d > 9) continue;
    const r = s === '+' ? classifyAdd(v, d) : classifySub(v, d);
    if (!ok.has(r.id) || (req && !req.has(r.id))) continue;
    if (r.id === 'direct' && ((s === '+' && v === 0) || (s === '-' && v === d))) continue;
    out.push({ v, sign: s, d });
  }
  return out;
}
const k = p => `${p.v}${p.sign}${p.d}`;
function deal(pool, n) {
  const out = [];
  while (out.length < n) {
    const deck = shuffle(pool.slice());
    if (out.length && deck.length > 1 && k(deck[0]) === k(out[out.length - 1])) deck.push(deck.shift());
    out.push(...deck.slice(0, n - out.length));
  }
  return out;
}
// n problems; `decoys` of them are free-bead (direct) moves so the child must choose "free beads, or friend?"
function single(allow, require, sign, n, decoys = 0) {
  const req = deal(singlePool(allow, require, sign), n - decoys).map(p => ({ ...p, req: true }));
  const dir = decoys ? deal(singlePool(['direct'], null, sign), decoys).map(p => ({ ...p, req: false })) : [];
  let all = shuffle([...req, ...dir]);
  for (let t = 0; t < 80 && all.some((p, i) => i && k(p) === k(all[i - 1])); t++) all = shuffle(all);
  return all.map(p => ({ ...p, answer: checkSingle(p, allow, require) }));
}
function enumRound(terms, ops, allow) {
  const ok = expandGroups(allow), out = [];
  const signs = ops === 'add' ? [1] : [1, -1];
  const rec = acc => {
    if (acc.length === terms) {
      let a; try { a = analyzeProblem(acc); } catch { return; }
      for (const id of a.used) if (!ok.has(id)) return;
      out.push(acc.slice()); return;
    }
    for (const sg of (acc.length ? signs : [1])) for (let d = 1; d <= 9; d++) rec([...acc, sg * d]);
  };
  rec([]);
  return out;
}
function stacked(spec, n) {
  const pool = spec.digits === 1
    ? enumRound(spec.terms, spec.ops, spec.allow)
    : uniq(() => genAddSub(spec).terms, 200, t => t.join(','));
  const fit = pool.filter(t => { try { checkStacked(t, spec.allow, spec.require); return true; } catch { return false; } });
  if (fit.length < n) throw new Error('pool too small for ' + JSON.stringify(spec));
  // spread totals: sort by answer, take evenly spaced items, then shuffle
  const byAns = fit.map(t => ({ t, a: analyzeProblem(t).answer })).sort((x, y) => x.a - y.a);
  const picked = [], used = new Set();
  for (let i = 0; i < n; i++) {
    let j = Math.floor((i + 0.5) * byAns.length / n);
    while (used.has(j)) j = (j + 1) % byAns.length;
    used.add(j); picked.push(byAns[j].t);
  }
  return shuffle(picked).map(terms => ({ terms, answer: checkStacked(terms, spec.allow, spec.require) }));
}
function spoken(terms, digits, ops, rounds, allow = ['direct']) {
  const pool = digits === 1
    ? enumRound(terms, ops, allow)
    : uniq(() => genAddSub({ terms, digits, ops, allow }).terms, 80, t => t.join(','));
  const fit = pool.filter(t => { try { checkStacked(t, allow); return true; } catch { return false; } });
  const out = [], seen = new Set();
  while (out.length < rounds) {
    const t = fit[rnd(0, fit.length - 1)]; const key = t.join(',');
    if (seen.has(key)) continue; seen.add(key);
    out.push({ terms: t, answer: checkStacked(t, allow) });
  }
  return out;
}

// ---- the 8 weeks (lesson keys and specs copied from js/curriculum.js) ----
function build() {
  const W = [];
  W.push({ week: 1, title: 'Meet the beads', lessons: ['hold', 'read'],
    warm: { kind: 'set', label: 'Set and clear: call each number, the group sets it on one rod', nums: shuffle([0,1,2,3,4,5,6,7,8,9]) },
    drills: [
      { kind: 'set', label: 'A. Set each number. Partner checks. (target 9 of 10)', digits: 1, nums: shuffle([1,2,3,4,5,6,7,8,9,0]) },
      { kind: 'read', label: 'B. Partner sets it, you read it out loud. (target 9 of 10)', digits: 2, nums: nums(2, 10) },
    ],
    flash: { kind: 'peek', label: 'Bead Peek: show each number on the screen abacus for 2 seconds, cover it, the group says it', digits: 1, seconds: 2, nums: nums(1, 6) },
  });
  W.push({ week: 2, title: 'Read and set hundreds', lessons: ['read3', 'set'],
    warm: { kind: 'read', label: 'Read it fast: show each 2-digit number, the group says it together', nums: nums(2, 8) },
    drills: [
      { kind: 'read', label: 'A. Read hundreds. Partner sets, you read, under 3 seconds each. (target 8 of 10)', digits: 3, nums: nums(3, 10) },
      { kind: 'set', label: 'B. Set hundreds from the left: hundreds, tens, ones. (target 7 of 8)', digits: 3, nums: nums(3, 8) },
    ],
    flash: { kind: 'peek', label: 'Bead Peek: 3-digit numbers, 2 seconds each', digits: 3, seconds: 2, nums: nums(3, 6) },
  });
  W.push({ week: 3, title: 'Add and take away when the beads are free', lessons: ['direct-add', 'direct-sub'],
    warm: { kind: 'set', label: 'Dictation: call each 3-digit number once, the group sets it', nums: nums(3, 6) },
    drills: [
      { kind: 'single', label: 'A. One rod. Set the first number, add the second. (target 9 of 10)', allow: ['direct'], items: single(['direct'], null, '+', 10) },
      { kind: 'single', label: 'B. One rod. Set the first number, take away the second. (target 9 of 10)', allow: ['direct'], items: single(['direct'], null, '-', 10) },
    ],
    flash: { kind: 'spoken', label: 'Flash Round: say three numbers, one a second, eyes on the beads in your head', items: spoken(3, 1, 'add', 5) },
  });
  const s2 = { terms: 3, digits: 2, ops: 'mix', allow: ['direct'] };
  W.push({ week: 4, title: 'Two columns, eyes closed, and the Sprout Boss', lessons: ['two-col', 'eyes-closed'],
    warm: { kind: 'read', label: 'Read it fast: 3-digit numbers, group says each one', nums: nums(3, 6) },
    drills: [
      { kind: 'stacked', label: 'A. Two columns, left to right. Tens first, then ones. (target 7 of 8)', spec: s2, items: stacked(s2, 8) },
    ],
    flash: { kind: 'peek', label: 'Eyes Closed: show a number for 1 second, eyes shut, say it', digits: 1, seconds: 1, nums: nums(1, 6) },
    boss: { title: 'Sprout Boss (practice version of the app test)', parts: [
      { kind: 'read', title: 'Read hundreds: 6 numbers in under a minute. Pass: 5 of 6.', digits: 3, nums: nums(3, 6) },
      { kind: 'set', title: 'Set hundreds: 5 numbers in a minute and a half. Pass: 4 of 5.', digits: 3, nums: nums(3, 5) },
      { kind: 'stacked', title: 'Direct add and take away: 6 problems in four minutes. Pass: 5 of 6.', spec: s2, items: stacked(s2, 6) },
    ] },
  });
  W.push({ week: 5, title: 'Small friends for adding', lessons: ['sf-1-4', 'sf-2-3'],
    warm: { kind: 'single', label: 'Free beads warm-up: one rod, call it out', allow: ['direct'], items: single(['direct'], null, 'mix', 6) },
    drills: [
      { kind: 'single', label: 'A. +1 and +4. Free beads, or friend? (target 9 of 10)', allow: ['direct', 'small+1', 'small+4'], require: ['small+1', 'small+4'], items: single(['direct', 'small+1', 'small+4'], ['small+1', 'small+4'], '+', 10, 3) },
      { kind: 'single', label: 'B. +2 and +3. Free beads, or friend? (target 9 of 10)', allow: ['direct', 'small+'], require: ['small+2', 'small+3'], items: single(['direct', 'small+'], ['small+2', 'small+3'], '+', 10, 3) },
    ],
    flash: { kind: 'spoken', label: 'Flash Round: three numbers, one a second', items: spoken(3, 1, 'add', 5) },
  });
  const sfa = { terms: 4, digits: 2, ops: 'add', allow: ['direct', 'small+'], require: ['small+'] };
  W.push({ week: 6, title: 'Small friends in real problems, and taking away', lessons: ['sf-add-2d', 'sf-sub-1-4'],
    warm: { kind: 'single', label: 'Friend or free? Adding only, call it out', allow: ['direct', 'small+'], items: single(['direct', 'small+'], ['small+'], '+', 6, 2) },
    drills: [
      { kind: 'stacked', label: 'A. Four lines, two digits. Say each friend out loud. (target 7 of 8)', spec: sfa, items: stacked(sfa, 8) },
      { kind: 'single', label: 'B. −1 and −4. Free beads, or friend? (target 9 of 10)', allow: ['direct', 'small-1', 'small-4'], require: ['small-1', 'small-4'], items: single(['direct', 'small-1', 'small-4'], ['small-1', 'small-4'], '-', 10, 3) },
    ],
    flash: { kind: 'spoken', label: 'Flash Round: four numbers, plus and minus', items: spoken(4, 1, 'mix', 5) },
  });
  const sfm = { terms: 4, digits: 2, ops: 'mix', allow: SMALL, require: ['small+', 'small-'] };
  W.push({ week: 7, title: 'All eight small friends', lessons: ['sf-sub-2-3', 'sf-mix'],
    warm: { kind: 'single', label: 'Friend or free? Take-aways, call it out', allow: ['direct', 'small-1', 'small-4'], items: single(['direct', 'small-1', 'small-4'], ['small-1', 'small-4'], '-', 6, 2) },
    drills: [
      { kind: 'single', label: 'A. −2 and −3. Free beads, or friend? (target 9 of 10)', allow: ['direct', 'small-'], require: ['small-2', 'small-3'], items: single(['direct', 'small-'], ['small-2', 'small-3'], '-', 10, 3) },
      { kind: 'stacked', label: 'B. All eight friends, plus and minus, four lines. (target 7 of 8)', spec: sfm, items: stacked(sfm, 8) },
    ],
    flash: { kind: 'spoken', label: 'Flash Round: three 2-digit numbers, one every 2 seconds', items: spoken(3, 2, 'add', 4) },
  });
  const sp = { terms: 5, digits: 2, ops: 'mix', allow: SMALL };
  const ml = { terms: 3, digits: 1, ops: 'add', allow: ['direct'] };
  const eb = { terms: 4, digits: 2, ops: 'mix', allow: SMALL };
  W.push({ week: 8, title: 'Speed, the mental picture, and the Explorer Boss', lessons: ['speed-sf', 'mental-1'],
    warm: { kind: 'single', label: 'Friend or free? Plus and minus, call it out', allow: SMALL, items: single(SMALL, ['small+', 'small-'], 'mix', 6, 2) },
    drills: [
      { kind: 'stacked', label: 'A. Speed round: five lines, timed. Write your time. (target 8 of 10)', spec: sp, items: stacked(sp, 10) },
      { kind: 'mental', label: 'B. Mental: soroban away, picture one rod. (target 7 of 8)', spec: ml, items: stacked(ml, 8) },
    ],
    flash: { kind: 'spoken', label: 'Flash Round, family edition: four numbers, plus and minus', items: spoken(4, 1, 'mix', 5) },
    boss: { title: 'Explorer Boss (practice version of the app test)', parts: [
      { kind: 'single', title: 'Friend or free? 10 one-rod moves in two minutes. Pass: 9 of 10.', allow: SMALL, items: single(SMALL, ['small+', 'small-'], 'mix', 10, 3) },
      { kind: 'stacked', title: '2-digit, 4 lines: 6 problems in four minutes. Pass: 5 of 6.', spec: eb, items: stacked(eb, 6) },
      { kind: 'mental', title: 'Mental: 5 problems, no soroban, two minutes. Pass: 4 of 5.', spec: ml, items: stacked(ml, 5) },
    ] },
  });
  return W;
}

// ---- verify (independent re-check of every printed item) ----
function verify(W) {
  let n = 0;
  const chk = (d) => {
    if (d.kind === 'single') for (const p of d.items) { if (checkSingle(p, d.allow, d.require) !== p.answer) throw new Error('bad answer ' + k(p)); n++; }
    else if (d.kind === 'stacked' || d.kind === 'mental') {
      const seen = new Set();
      for (const p of d.items) {
        if (checkStacked(p.terms, d.spec.allow, d.spec.require) !== p.answer) throw new Error('bad answer ' + p.terms);
        const key = p.terms.join(','); if (seen.has(key)) throw new Error('duplicate ' + key); seen.add(key); n++;
      }
    }
    else if (d.kind === 'spoken') for (const p of d.items) { if (checkStacked(p.terms, ['direct']) !== p.answer) throw new Error('bad flash ' + p.terms); n++; }
    else if (d.nums) {
      if (new Set(d.nums).size !== d.nums.length) throw new Error('duplicate number in ' + d.label);
      if (d.digits) for (const x of d.nums) if (String(x).length !== d.digits) throw new Error(`${x} is not ${d.digits}-digit`);
      n += d.nums.length;
    }
  };
  for (const w of W) {
    chk(w.warm); w.drills.forEach(chk); chk(w.flash);
    if (w.boss) w.boss.parts.forEach(chk);
  }
  return n;
}

// ---- markdown ----
const sgn = x => (x < 0 ? '−' + Math.abs(x) : (x === 0 ? '0' : String(x)));
const signed = (x, i) => (i === 0 ? String(x) : (x < 0 ? '− ' + Math.abs(x) : '+ ' + x));
function stackTable(items, startNo) {
  // problems as columns, five per table: each column is one stacked problem
  const out = [];
  for (let s = 0; s < items.length; s += 5) {
    const chunk = items.slice(s, s + 5);
    const rows = Math.max(...chunk.map(p => p.terms.length));
    out.push('| ' + chunk.map((_, i) => `**${startNo + s + i}**`).join(' | ') + ' |');
    out.push('|' + chunk.map(() => '---:').join('|') + '|');
    for (let r = 0; r < rows; r++) out.push('| ' + chunk.map(p => (p.terms[r] !== undefined ? signed(p.terms[r], r) : ' ')).join(' | ') + ' |');
    out.push('| ' + chunk.map(() => '____').join(' | ') + ' |');
    out.push('');
  }
  return out.join('\n');
}
function block(d) {
  const L = [];
  if (d.kind === 'single') L.push(d.items.map((p, i) => `${i + 1}. ${p.v} ${p.sign === '+' ? '+' : '−'} ${p.d} = ____`).join('\n'));
  else if (d.kind === 'stacked' || d.kind === 'mental') L.push(stackTable(d.items, 1));
  else if (d.kind === 'set' || d.kind === 'read' || d.kind === 'peek') L.push(d.nums.map(sgn).join(' · '));
  else if (d.kind === 'spoken') L.push(d.items.map((p, i) => `${i + 1}. ${p.terms.map(sgn).join(', ')}`).join('\n'));
  return L.join('\n');
}
function answers(d) {
  if (d.kind === 'single' || d.kind === 'stacked' || d.kind === 'mental' || d.kind === 'spoken') return d.items.map((p, i) => `${i + 1}) ${p.answer}`).join(' · ');
  return 'the number itself';
}
function render(W) {
  const L = [];
  L.push('# Class drills: the 8-week starter course');
  L.push('');
  L.push('One printable page per class for the instructor, matched to `class-plans.md`. Every problem was made by the site\'s own generator and checked against the bead moves taught that week, so no child meets a move they have not learned.');
  L.push('');
  L.push('Print the week\'s page for each child (drill A and B), and keep one copy with the warm-up and flash lists for yourself. Answers are at the end of the file. Rebuild with `node docs/products/instructor-launch-kit/tools/make-class-drills.mjs`.');
  L.push('');
  for (const w of W) {
    L.push('<div class="page-break"></div>');
    L.push('');
    L.push(`## Week ${w.week}: ${w.title}`);
    L.push('');
    L.push('Name: ______________________  Date: __________  Time: ______  Score: ____');
    L.push('');
    L.push(`### Warm-up (instructor reads)`);
    L.push('');
    L.push(`${w.warm.label}.`);
    L.push('');
    L.push(block(w.warm));
    L.push('');
    for (const d of w.drills) {
      L.push(`### Drill ${d.label}`);
      L.push('');
      L.push(block(d));
      L.push('');
    }
    L.push(`### Flash game (instructor reads)`);
    L.push('');
    L.push(`${w.flash.label}.`);
    L.push('');
    L.push(block(w.flash));
    L.push('');
    if (w.boss) {
      L.push(`### ${w.boss.title}`);
      L.push('');
      for (const p of w.boss.parts) { L.push(`**${p.title}**`); L.push(''); L.push(block(p)); L.push(''); }
    }
    L.push('Work left to right. Say the move. Finish the problem before you check.');
    L.push('');
  }
  L.push('<div class="page-break"></div>');
  L.push('');
  L.push('## Answer key');
  L.push('');
  for (const w of W) {
    L.push(`**Week ${w.week}.** Warm-up: ${answers(w.warm)}.`);
    w.drills.forEach(d => L.push(`Drill ${d.label.slice(0, 1)}: ${answers(d)}.`));
    L.push(`Flash: ${answers(w.flash)}.`);
    if (w.boss) w.boss.parts.forEach((p, i) => L.push(`Boss part ${i + 1}: ${answers(p)}.`));
    L.push('');
  }
  L.push('<!-- status: ready -->');
  return L.join('\n') + '\n';
}

if (process.argv.includes('--check')) {
  const W = JSON.parse(readFileSync(OUT_JSON, 'utf8'));
  console.log(`checked ${verify(W)} items, 0 outside the week's allowed moves`);
} else {
  const W = build();
  const n = verify(W);
  writeFileSync(OUT_JSON, JSON.stringify(W, null, 1));
  writeFileSync(OUT_MD, render(W));
  console.log(`wrote class-drills.md: ${n} items across ${W.length} weeks, all verified`);
}

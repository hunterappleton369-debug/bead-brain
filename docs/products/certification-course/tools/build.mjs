// build.mjs: fills every generated drill set and every worked exam problem in the
// certification course, using the app's own soroban model (js/soroban.js) and
// generators (js/generator.js). Seeded per lesson, so the output is stable and a
// change to one lesson never reshuffles another. Every item is re-checked before
// it is written: stacked sums against the lesson's allowed moves, products and
// quotients by plain arithmetic, flash totals by re-adding.
//
//   node tools/build.mjs            fill lessons/L01..L20, exam.md, exam-key.md
//   node tools/build.mjs --check    verify only, write nothing
//   node tools/build.mjs --form B   write a fresh retake form to exam-form-b.md / exam-key-form-b.md
//   node tools/build.mjs --stats    print script word counts and run times
import { genAddSub, genTwoColumn, genMul, genDiv, genFlash, genRead } from '../../../../js/generator.js';
import { analyzeProblem, classifyAdd, classifySub, expandGroups, FORMULAS } from '../../../../js/soroban.js';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const CHECK_ONLY = args.includes('--check');
const FORM = args.includes('--form') ? args[args.indexOf('--form') + 1].toUpperCase() : 'A';

// ---- seeded Math.random (mulberry32), reset per block ----
let seed = 1;
const setSeed = s => { seed = s >>> 0; };
Math.random = () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const ALL = ['direct', 'small+', 'small-', 'big+', 'big-', 'combo+', 'combo-'];
const NOCOMBO = ['direct', 'small+', 'small-', 'big+', 'big-'];
const SMALL = ['direct', 'small+', 'small-'];

// ---- verification tallies ----
const tally = { items: 0, bad: 0 };
const fail = msg => { tally.bad++; console.error('BAD', msg); };

// ---- formatting ----
const MINUS = '−';
const fmt = n => n.toLocaleString('en-US');
const term = (t, i) => i === 0 ? fmt(t) : (t < 0 ? `${MINUS} ${fmt(-t)}` : `+ ${fmt(t)}`);
const stackedText = terms => terms.map(term).join(' ');
const COL = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands'];
function moveName(id) {
  if (id === 'direct') return 'free beads';
  const f = FORMULAS[id];
  const group = { small: 'small friend', big: 'big friend', combo: 'both friends' }[f.type];
  return `${group} ${f.text}`;
}
const say = id => id === 'direct' ? 'Free beads: move them straight on or off.' : FORMULAS[id].says + '.';

// ---- generators with verification ----
function uniqBy(make, n, key, tries = 3000) {
  const out = [], seen = new Set();
  for (let t = 0; t < tries && out.length < n; t++) { const p = make(); const k = key(p); if (seen.has(k)) continue; seen.add(k); out.push(p); }
  if (out.length < n) throw new Error(`could not fill ${n} unique items`);
  return out;
}
function stacked(spec, n) {
  const items = uniqBy(() => genAddSub(spec), n, p => p.terms.join(','));
  const ok = expandGroups(spec.allow), req = spec.require ? expandGroups(spec.require) : null;
  return items.map(p => {
    tally.items++;
    const a = analyzeProblem(p.terms);
    for (const id of a.used) if (!ok.has(id)) fail(`${p.terms} uses ${id}`);
    if (req && ![...a.used].some(id => req.has(id))) fail(`${p.terms} misses required ${spec.require}`);
    if (a.answer !== p.terms.reduce((s, x) => s + x, 0)) fail(`${p.terms} answer`);
    return { terms: p.terms, answer: a.answer, used: [...a.used] };
  });
}
// single rod: every (v, sign, d) whose move sits in allow; `require` ones first, `decoys` free-bead items mixed in
function singleRod(allow, require, sign, n, decoys = 0) {
  const ok = expandGroups(allow), req = require ? expandGroups(require) : null;
  const pool = (needReq, direct) => {
    const out = [];
    for (let v = 0; v <= 9; v++) for (let d = 1; d <= 9; d++) for (const s of (sign === 'mix' ? ['+', '-'] : [sign])) {
      if (s === '-' && v - d < 0) continue; if (s === '+' && v + d > 9) continue;
      const r = s === '+' ? classifyAdd(v, d) : classifySub(v, d);
      if (direct) { if (r.id !== 'direct' || (s === '+' && v === 0) || (s === '-' && v === d)) continue; }
      else { if (!ok.has(r.id) || (needReq && req && !req.has(r.id))) continue; }
      out.push({ v, d, sign: s, id: r.id, answer: s === '+' ? v + d : v - d });
    }
    return out;
  };
  const deal = (p, k) => { const out = []; while (out.length < k) out.push(...shuffle(p.slice()).slice(0, k - out.length)); return out; };
  let all = shuffle([...deal(pool(true, false), n - decoys), ...(decoys ? deal(pool(false, true), decoys) : [])]);
  const key = p => `${p.v}${p.sign}${p.d}`;
  for (let t = 0; t < 80 && all.some((p, i) => i && key(p) === key(all[i - 1])); t++) all = shuffle(all);
  return all.map(p => {
    tally.items++;
    const r = p.sign === '+' ? classifyAdd(p.v, p.d) : classifySub(p.v, p.d);
    if (r.id !== p.id) fail(`single ${key(p)}`);
    if (!ok.has(r.id) && r.id !== 'direct') fail(`single ${key(p)} uses ${r.id}`);
    return p;
  });
}
function twoCol(spec, n) {
  const items = uniqBy(() => genTwoColumn(spec), n, p => `${p.start}${p.sign}${p.d}`);
  const ok = expandGroups(spec.allow), req = spec.require ? expandGroups(spec.require) : null;
  return items.map(p => {
    tally.items++;
    const t = p.sign === '+' ? p.d : -p.d;
    const a = analyzeProblem([p.start, t]);
    const steps = a.perTerm[1];
    for (const st of steps) if (!ok.has(st.id)) fail(`twocol ${p.start}${p.sign}${p.d} uses ${st.id}`);
    if (req && !steps.some(st => req.has(st.id))) fail(`twocol ${p.start}${p.sign}${p.d} misses ${spec.require}`);
    if (a.answer !== p.start + t) fail('twocol answer');
    return { ...p, answer: a.answer, steps };
  });
}
function mul(spec, n) {
  // skip trivial multipliers (× 1, × 2) and multiplicands ending in 0, which teach nothing on the beads
  const make = () => { for (;;) { const p = genMul(spec); if (p.b >= 3 && p.a % 10 !== 0 && p.b % 10 !== 0) return p; } };
  return uniqBy(make, n, p => p.text).map(p => { tally.items++; if (p.a * p.b !== p.answer) fail('mul ' + p.text); return p; });
}
function div(spec, n) {
  return uniqBy(() => genDiv(spec), n, p => p.text).map(p => {
    tally.items++;
    if (p.d * p.q + p.r !== p.n || p.r >= p.d) fail('div ' + p.text);
    return p;
  });
}
function flash(spec, n) {
  return uniqBy(() => genFlash(spec), n, p => p.nums.join(',')).map(p => {
    tally.items++;
    if (p.nums.reduce((s, x) => s + x, 0) !== p.answer) fail('flash');
    return p;
  });
}
function readNums(digits, n, zeroInside = 0) {
  const plain = uniqBy(() => genRead(digits).n, n - zeroInside, x => x);
  const zeros = [];
  while (zeros.length < zeroInside) { const x = genRead(digits).n; if (String(x).slice(1, -1).includes('0') && !zeros.includes(x) && !plain.includes(x)) zeros.push(x); }
  return shuffle([...plain, ...zeros]).map(x => { tally.items++; return x; });
}

// ---- markdown blocks ----
const ol = lines => lines.map((l, i) => `${i + 1}. ${l}`).join('\n');
const ansLine = arr => arr.map((a, i) => `${i + 1}) ${a}`).join(' · ');
const rodQ = p => `The rod shows ${p.v}. ${p.sign === '+' ? 'Add' : 'Take away'} ${p.d}.`;
const rodA = p => `${p.answer}, ${moveName(p.id)}`;
const twoQ = p => `Start at ${p.start}. ${p.sign === '+' ? 'Add' : 'Take away'} ${p.d}.`;
const stepsText = steps => steps.map(st => `${COL[st.col]} ${st.sign === '-' ? MINUS : '+'}${st.d}: ${moveName(st.id)}`).join(', then ');
const twoA = p => `${p.answer} (${stepsText(p.steps)})`;
const flashQ = p => p.nums.map((x, i) => i === 0 ? fmt(x) : (x < 0 ? `minus ${fmt(-x)}` : fmt(x))).join(', ');

// Each section: { title, intro, items:[question strings], answers:[answer strings] }
const section = (letter, title, intro, items, answers) => ({ letter, title, intro, items, answers });

// ---- per-lesson drill builders ----
const LESSONS = {
  2: () => {
    const r2 = readNums(2, 10), r3 = readNums(3, 10, 3), s3 = readNums(3, 10, 2);
    return [
      section('A', 'Read 2-digit numbers', 'Have someone set these on your soroban, or set each one, cover it, uncover it for two seconds, and say it. Under three seconds each.', r2.map(x => `${x}`), r2.map(fmt)),
      section('B', 'Read 3-digit numbers', 'Same drill, three rods. Watch for the empty rod in the middle.', r3.map(x => `${x}`), r3.map(fmt)),
      section('C', 'Set 3-digit numbers', 'Hear it, set it from the left: hundreds, tens, ones. Thumb up, index finger down. Clear between each one.', s3.map(x => `${x}`), s3.map(x => `${fmt(x)}: ${String(x).split('').map((d, i) => `${['hundreds', 'tens', 'ones'][i]} ${d}`).join(', ')}`)),
    ];
  },
  3: () => {
    const add = singleRod(['direct'], null, '+', 10, 10), sub = singleRod(['direct'], null, '-', 10, 10);
    return [
      section('A', 'Direct adds on one rod', 'Set the first number. Add the second. Every one of these has the beads free.', add.map(rodQ), add.map(rodA)),
      section('B', 'Direct take-aways on one rod', 'Set the first number. Take away the second. The beads you need are always on the beam.', sub.map(rodQ), sub.map(rodA)),
    ];
  },
  4: () => {
    const two = stacked({ terms: 3, digits: 2, ops: 'mix', allow: ['direct'] }, 10);
    const tens = singleRod(['direct'], null, 'mix', 10, 10);
    return [
      section('A', 'Mixed direct moves, one rod', 'Warm-up. Say "free beads" before every move.', tens.map(rodQ), tens.map(rodA)),
      section('B', '2-digit, three lines, free beads only', 'The Sprout boss format. Set the first number, then add or take away each line, tens first. Read the answer off the beads.', two.map(p => stackedText(p.terms)), two.map(p => fmt(p.answer))),
    ];
  },
  5: () => {
    const s14 = singleRod(['direct', 'small+1', 'small+4'], ['small+1', 'small+4'], '+', 10, 2);
    const s23 = singleRod(['direct', 'small+'], ['small+2', 'small+3'], '+', 10, 2);
    const two = stacked({ terms: 4, digits: 2, ops: 'add', allow: ['direct', 'small+'], require: ['small+'] }, 8);
    return [
      section('A', 'Plus 1 and plus 4', 'Two of these are free-bead decoys. Ask yourself the question out loud before each move: free beads, or friend?', s14.map(rodQ), s14.map(rodA)),
      section('B', 'Plus 2 and plus 3', 'Same drill, the other pair. Say the line as you move: "Plus three: add five, take away two."', s23.map(rodQ), s23.map(rodA)),
      section('C', '2-digit adds, four lines', 'Each one needs at least one small friend somewhere. Tens rod first.', two.map(p => stackedText(p.terms)), two.map(p => fmt(p.answer))),
    ];
  },
  6: () => {
    const sub = singleRod(['direct', 'small-'], ['small-'], '-', 10, 2);
    const mix = stacked({ terms: 4, digits: 2, ops: 'mix', allow: SMALL, require: ['small+', 'small-'] }, 8);
    const mental = stacked({ terms: 3, digits: 1, ops: 'add', allow: ['direct'] }, 5);
    return [
      section('A', 'Take away with small friends', 'Two free-bead decoys again. "Minus four: take away five, add one."', sub.map(rodQ), sub.map(rodA)),
      section('B', 'All eight friends, 2-digit, four lines', 'The Explorer boss format. Plus and minus mixed.', mix.map(p => stackedText(p.terms)), mix.map(p => fmt(p.answer))),
      section('C', 'Mental: three small numbers', 'Soroban away. Have someone read each line once, at one number a second. Say only the total.', mental.map(p => p.terms.join(', ')), mental.map(p => fmt(p.answer))),
    ];
  },
  7: () => {
    const big = twoCol({ allow: ['direct', 'small+', 'big+'], require: ['big+'], sign: '+', min: 1, max: 89 }, 12);
    const chain = stacked({ terms: 5, digits: 2, ops: 'add', allow: ['direct', 'small+', 'big+'], require: ['big+'] }, 6);
    return [
      section('A', 'Carry with big friends', 'Take the friend away on this rod first, then carry one to the left. Name the move on every rod that changes.', big.map(twoQ), big.map(twoA)),
      section('B', 'Carry chains, 2-digit, five lines', 'Adding only. Some carries land on a full tens rod and carry again.', chain.map(p => stackedText(p.terms)), chain.map(p => fmt(p.answer))),
    ];
  },
  8: () => {
    const big = twoCol({ allow: ['direct', 'small-', 'big-'], require: ['big-'], sign: '-', min: 10, max: 99 }, 12);
    const chain = stacked({ terms: 5, digits: 2, ops: 'mix', allow: NOCOMBO, require: ['big-'] }, 6);
    const mental = stacked({ terms: 4, digits: 1, ops: 'mix', allow: NOCOMBO }, 5);
    return [
      section('A', 'Borrow with big friends', 'Add the friend on this rod first, then borrow one from the left. Name the move on every rod that changes.', big.map(twoQ), big.map(twoA)),
      section('B', 'Borrow chains and mixed lines, 2-digit, five lines', 'The Apprentice boss format.', chain.map(p => stackedText(p.terms)), chain.map(p => fmt(p.answer))),
      section('C', 'Mental: crossing ten', 'Four 1-digit numbers, read aloud once each. Say only the total.', mental.map(p => p.terms.map(x => x < 0 ? `minus ${-x}` : `${x}`).join(', ')), mental.map(p => fmt(p.answer))),
    ];
  },
  9: () => {
    const combo = twoCol({ allow: ALL, require: ['combo+', 'combo-'], sign: 'mix', min: 1, max: 99 }, 12);
    const six = stacked({ terms: 6, digits: 2, ops: 'mix', allow: ALL, require: ['combo+', 'combo-'] }, 5);
    const three = stacked({ terms: 5, digits: 3, ops: 'mix', allow: ALL }, 4);
    const ten = stacked({ terms: 10, digits: 2, ops: 'mix', allow: ALL }, 2);
    return [
      section('A', 'Both friends at once', 'Each one needs a combination move. Say all three parts in one breath.', combo.map(twoQ), combo.map(twoA)),
      section('B', 'All 34, 2-digit, six lines', 'Every move is allowed. Each problem uses at least one combination.', six.map(p => stackedText(p.terms)), six.map(p => fmt(p.answer))),
      section('C', '3-digit, five lines', 'The Adept boss format.', three.map(p => stackedText(p.terms)), three.map(p => fmt(p.answer))),
      section('D', 'Ten rows, 2-digit', 'Time yourself. Keep your eyes one line ahead of your hand.', ten.map(p => stackedText(p.terms)), ten.map(p => fmt(p.answer))),
    ];
  },
  10: () => {
    // 20 single moves spread across the four groups; the tens rod always has room
    const pick = (type, n) => {
      const pool = [];
      for (let v = 0; v <= 9; v++) for (let d = 1; d <= 9; d++) for (const s of ['+', '-']) {
        if (s === '-' && type !== 'big' && type !== 'combo' && v - d < 0) continue;
        const r = s === '+' ? classifyAdd(v, d) : classifySub(v, d);
        if (r.type !== type) continue;
        if ((type === 'direct') && ((s === '+' && v === 0) || (s === '-' && v === d))) continue;
        pool.push({ v, d, sign: s, id: r.id });
      }
      return shuffle(pool).slice(0, n);
    };
    const items = shuffle([...pick('direct', 4), ...pick('small', 6), ...pick('big', 6), ...pick('combo', 4)]);
    items.forEach(p => { tally.items++; const r = p.sign === '+' ? classifyAdd(p.v, p.d) : classifySub(p.v, p.d); if (r.id !== p.id) fail('classify'); });
    return [
      section('A', 'Name the move', 'The ones rod shows the first number. The tens rod has room to carry and beads to lend. For each one, run the four questions in order and name the move. Then say its line out loud.',
        items.map(p => `Ones rod shows ${p.v}. ${p.sign === '+' ? 'Add' : 'Take away'} ${p.d}.`), items.map(p => `${moveName(p.id)}. "${say(p.id).replace(/\.$/, '')}"`)),
    ];
  },
  11: () => {
    const written = stacked({ terms: 5, digits: 2, ops: 'mix', allow: SMALL }, 3);
    const dict = stacked({ terms: 4, digits: 2, ops: 'add', allow: ALL }, 5);
    const fl = flash({ count: 5, digits: 1, ops: 'add' }, 5);
    const mental = stacked({ terms: 3, digits: 1, ops: 'add', allow: ['direct'] }, 5);
    return [
      section('A', 'Written: 2-digit, five lines, small friends', 'On the soroban, from the page. Say the move, left to right.', written.map(p => stackedText(p.terms)), written.map(p => fmt(p.answer))),
      section('B', 'Dictation: four 2-digit numbers', 'Read these aloud to a partner at one number every two seconds, or record yourself and play it back. The listener works on the soroban with nothing written down.', dict.map(p => p.terms.join(', ')), dict.map(p => fmt(p.answer))),
      section('C', 'Flash: five 1-digit numbers at 1.5 seconds', 'Say each number once on the beat. The listener says only the total.', fl.map(flashQ), fl.map(p => fmt(p.answer))),
      section('D', 'Mental: three small numbers, free beads only', 'The first mental round a Stage 2 child gets. Practise the voice and the pause.', mental.map(p => p.terms.join(', ')), mental.map(p => fmt(p.answer))),
    ];
  },
  12: () => {
    const warm = readNums(3, 5, 1);
    const lesson = singleRod(['direct', 'small+'], ['small+2', 'small+3'], '+', 10, 2);
    const mental = stacked({ terms: 3, digits: 1, ops: 'add', allow: ['direct'] }, 5);
    const fast = stacked({ terms: 10, digits: 3, ops: 'add', allow: ALL }, 2);
    const ahead = stacked({ terms: 10, digits: 3, ops: 'mix', allow: ALL }, 2);
    return [
      section('A', 'Session pack: warm-up (2 minutes)', 'A ready-made 15-minute session for a Stage 2 child on "+2 and +3". Read each number aloud, the child sets it.', warm.map(String), warm.map(fmt)),
      section('B', 'Session pack: lesson drill (8 minutes)', 'Ten single-rod moves, two of them free-bead decoys. Nine right moves the child on.', lesson.map(rodQ), lesson.map(rodA)),
      section('C', 'Session pack: mental (5 minutes)', 'Read each round once at one number a second.', mental.map(p => p.terms.join(', ')), mental.map(p => fmt(p.answer))),
      section('D', 'Your own speed: 3-digit, ten lines, adding', 'Time each one. Under four minutes is a good first mark. Stay one line ahead.', fast.map(p => stackedText(p.terms)), fast.map(p => fmt(p.answer))),
      section('E', 'Your own speed: 3-digit, ten lines, plus and minus', 'Same, with take-aways.', ahead.map(p => stackedText(p.terms)), ahead.map(p => fmt(p.answer))),
    ];
  },
  13: () => {
    const verdict = sh => {
      const marks = sh.map(p => p.child === p.answer ? `${fmt(p.answer)}, right` : `${fmt(p.answer)}, wrong (off by ${Math.abs(p.child - p.answer)})`);
      const right = sh.filter(p => p.child === p.answer).length;
      marks[marks.length - 1] += `. Verdict: ${right} of ${sh.length}, ${right >= 5 ? 'pass' : 'not yet'}`;
      return marks;
    };
    // a mock Explorer boss part 2 sheet with made-up child answers; the instructor marks it
    const probs = stacked({ terms: 4, digits: 2, ops: 'mix', allow: SMALL }, 6);
    const errs = [0, 5, 0, 0, 0, -5];
    const sheet = probs.map((p, i) => ({ ...p, child: p.answer + errs[i] < 0 ? p.answer - errs[i] : p.answer + errs[i] }));
    const probs2 = stacked({ terms: 5, digits: 2, ops: 'mix', allow: NOCOMBO }, 6);
    const errs2 = [0, 0, 10, 0, 0, 0];
    const sheet2 = probs2.map((p, i) => ({ ...p, child: p.answer + errs2[i] < 0 ? p.answer - errs2[i] : p.answer + errs2[i] }));
    return [
      section('A', 'Mark a practice boss sheet: Explorer, part 2', 'The child answers are made up for this drill. Work each problem, mark it right or wrong, then decide: pass or not yet? The pass mark is 5 of 6 (83%).',
        sheet.map(p => `${stackedText(p.terms)}  · child wrote ${fmt(p.child)}`), verdict(sheet)),
      section('B', 'Mark a practice boss sheet: Apprentice, part 2', 'Same job. Pass mark 5 of 6.',
        sheet2.map(p => `${stackedText(p.terms)}  · child wrote ${fmt(p.child)}`), verdict(sheet2)),
    ];
  },
  14: () => {
    const A = (terms, digits, ops, allow = ALL) => stacked({ terms, digits, ops, allow }, 4);
    const rungs = [
      ['Rung 1: two small numbers, no crossing ten', A(2, 1, 'add', ['direct', 'small+'])],
      ['Rung 2: any two digits', A(2, 1, 'add')],
      ['Rung 3: three 1-digit numbers', A(3, 1, 'add')],
      ['Rung 4: a 2-digit and a 1-digit number', stacked({ terms: 2, digits: [2, 1], ops: 'add', allow: ALL }, 4)],
      ['Rung 5: two 2-digit numbers', A(2, 2, 'add')],
      ['Rung 6: three 2-digit numbers, plus and minus', A(3, 2, 'mix')],
    ];
    return rungs.map(([t, ps], i) => section(String.fromCharCode(65 + i), t, i === 0 ? 'Take your own Bead Score, rungs 1 to 6, in the head. A partner reads each line once. Three of four right clears the rung. Stop at the first rung you miss.' : 'Three of four right clears the rung.',
      ps.map(p => p.terms.map(x => x < 0 ? `minus ${-x}` : `${x}`).join(', ')), ps.map(p => fmt(p.answer))));
  },
  15: () => {
    const a = mul({ aDigits: 2, bDigits: 1 }, 8), b = mul({ aDigits: 3, bDigits: 1 }, 6), c = mul({ aDigits: 2, bDigits: 2 }, 6), d = mul({ aDigits: 3, bDigits: 2 }, 4), m = mul({ aDigits: 2, bDigits: 1 }, 6);
    const q = arr => arr.map(p => p.text), ans = arr => arr.map(p => fmt(p.answer));
    return [
      section('A', '2-digit × 1-digit on the soroban', 'Problem on paper, answer on the beads. Every small product is two digits.', q(a), ans(a)),
      section('B', '3-digit × 1-digit', 'Three small products, each one rod to the right of the last.', q(b), ans(b)),
      section('C', '2-digit × 2-digit', 'Four small products.', q(c), ans(c)),
      section('D', '3-digit × 2-digit', 'Six small products. Keep a steady rhythm.', q(d), ans(d)),
      section('E', 'Mental: 2-digit × 1-digit', 'No soroban. Picture the first product, add the second.', q(m), ans(m)),
    ];
  },
  16: () => {
    const a = div({ qDigits: 1, dDigits: 1 }, 6), b = div({ qDigits: 2, dDigits: 1 }, 8), r = div({ qDigits: 2, dDigits: 1, remainder: true }, 6), c = div({ qDigits: 2, dDigits: 2 }, 5), m = div({ qDigits: 2, dDigits: 1 }, 5);
    const q = arr => arr.map(p => p.text), ans = arr => arr.map(p => p.r ? `${fmt(p.q)} r ${p.r}` : fmt(p.q));
    return [
      section('A', '2-digit ÷ 1-digit', 'Dividend on the right, quotient built to the left. Guess, multiply, take away.', q(a), ans(a)),
      section('B', '3-digit ÷ 1-digit', 'Check the first digit: does the divisor fit? If not, start with the first two.', q(b), ans(b)),
      section('C', 'Remainders', 'Give the quotient and the remainder.', q(r), ans(r)),
      section('D', '4-digit ÷ 2-digit', 'Estimate from the first digits. A guess that is too big is normal. Lower it by one.', q(c), ans(c)),
      section('E', 'Mental: divide by 1-digit', 'No soroban.', q(m), ans(m)),
    ];
  },
  17: () => {
    const a = stacked({ terms: 5, digits: 1, ops: 'mix', allow: ALL }, 6);
    const b = stacked({ terms: 2, digits: 2, ops: 'add', allow: ALL }, 6);
    const c = stacked({ terms: 3, digits: 2, ops: 'add', allow: ALL }, 6);
    const d = stacked({ terms: 3, digits: 3, ops: 'add', allow: ALL }, 4);
    const spoken = p => p.terms.map(x => x < 0 ? `minus ${fmt(-x)}` : fmt(x)).join(', ');
    return [
      section('A', 'One rod and a carry rod: five 1-digit numbers', 'Eyes closed. Let your fingers move.', a.map(spoken), a.map(p => fmt(p.answer))),
      section('B', 'Two rods: two 2-digit numbers', 'Each number lands as one shape on two rods.', b.map(spoken), b.map(p => fmt(p.answer))),
      section('C', 'Two rods: three 2-digit numbers', 'Rung 6 territory if you add a minus.', c.map(spoken), c.map(p => fmt(p.answer))),
      section('D', 'Three rods: three 3-digit numbers', 'The edge of what most people can hold. Slow is fine.', d.map(spoken), d.map(p => fmt(p.answer))),
    ];
  },
  18: () => {
    const lv1 = stacked({ terms: 3, digits: 1, ops: 'add', allow: ['direct'] }, 4);
    const a = flash({ count: 5, digits: 1, ops: 'add' }, 4), b = flash({ count: 8, digits: 1, ops: 'add' }, 4), c = flash({ count: 5, digits: 2, ops: 'add' }, 4), d = flash({ count: 8, digits: 2, ops: 'add' }, 4), e = flash({ count: 5, digits: 3, ops: 'add' }, 3);
    return [
      section('A', 'Level 1 at the table: three numbers, free beads only', 'A Stage 2 child. One number a second.', lv1.map(p => p.terms.join(', ')), lv1.map(p => fmt(p.answer))),
      section('B', 'Five 1-digit numbers at 1.5 seconds', 'The trainer\'s first flash lesson.', a.map(flashQ), a.map(p => fmt(p.answer))),
      section('C', 'Eight 1-digit numbers at 1.0 second', 'The Ace boss flash part.', b.map(flashQ), b.map(p => fmt(p.answer))),
      section('D', 'Five 2-digit numbers at 1.0 second', 'Bead Score rung 11.', c.map(flashQ), c.map(p => fmt(p.answer))),
      section('E', 'Eight 2-digit numbers at 0.7 seconds', 'Bead Score rung 13 and the Champion boss flash part.', d.map(flashQ), d.map(p => fmt(p.answer))),
      section('F', 'Five 3-digit numbers at 1.0 second', 'Bead Score rung 14 and the Prodigy boss flash part.', e.map(flashQ), e.map(p => fmt(p.answer))),
    ];
  },
  19: () => {
    // problems with a planted error; the instructor names the likely cause and the line to say
    const ps = [
      ...stacked({ terms: 4, digits: 2, ops: 'mix', allow: SMALL, require: ['small+', 'small-'] }, 3),
      ...stacked({ terms: 5, digits: 2, ops: 'add', allow: NOCOMBO, require: ['big+'] }, 3),
      ...stacked({ terms: 5, digits: 2, ops: 'mix', allow: NOCOMBO, require: ['big-'] }, 2),
    ];
    const plan = [5, -5, 0, -10, 'drop', -10, 10, 0];
    const items = ps.map((p, i) => {
      const e = plan[i];
      let child, cause;
      if (e === 'drop') { child = p.answer - p.terms[p.terms.length - 1]; cause = 'skipped the last line: lost place on the page. Line: "Finger under the line you are on."'; }
      else if (e === 0) { child = p.answer; cause = 'right. Praise the move, not the answer: "You went left to right without me saying it."'; }
      else if (Math.abs(e) === 5) { child = p.answer + e; cause = 'off by five: one heaven bead in the wrong place, usually a small-friend move done halfway. Line: "Free beads, or friend?"'; }
      else if (e === 10) { child = p.answer + e; cause = 'ten too many: the friend added on the ones rod but the borrow from the tens never made. Line: "Add the friend, then borrow one from the left."'; }
      else { child = p.answer + e; cause = 'ten too few: a friend taken away but the carry never made. Line: "Take away the friend, then carry one to the left."'; }
      if (child < 0) { child = p.answer + 5; cause = 'off by five: one heaven bead in the wrong place, usually a small-friend move done halfway. Line: "Free beads, or friend?"'; }
      tally.items++;
      return { q: `${stackedText(p.terms)}  · child wrote ${fmt(child)}`, a: `${fmt(p.answer)}. ${cause}` };
    });
    return [section('A', 'Read the mistake', 'The child answers are made up for this drill. Work each problem. If the child is wrong, name the likely cause from the size of the miss, and the one line you would say.', items.map(x => x.q), items.map(x => x.a))];
  },
  20: () => {
    const a = stacked({ terms: 4, digits: 2, ops: 'mix', allow: SMALL }, 2);
    const b = stacked({ terms: 5, digits: 2, ops: 'mix', allow: NOCOMBO }, 2);
    const c = stacked({ terms: 5, digits: 3, ops: 'mix', allow: ALL }, 2);
    const m = mul({ aDigits: 2, bDigits: 2 }, 2), d = div({ qDigits: 2, dDigits: 1 }, 2);
    const items = [...a, ...b, ...c].map(p => [stackedText(p.terms), fmt(p.answer)]).concat(m.map(p => [p.text, fmt(p.answer)]), d.map(p => [p.text, fmt(p.q)]));
    return [section('A', 'Mixed review before the exam', 'Ten problems, one of each kind on the exam. Time yourself. Aim for all ten right in under 20 minutes.', items.map(x => x[0]), items.map(x => x[1]))];
  },
};

function renderDrills(secs) {
  const q = secs.map(s => `### ${s.letter}. ${s.title}\n\n${s.intro}\n\n${ol(s.items)}`).join('\n\n');
  const a = secs.map(s => `**${s.letter}.** ${ansLine(s.answers)}`).join('\n\n');
  return { q, a };
}

function replaceBlock(text, name, body, file) {
  const re = new RegExp(`(<!-- ${name}:start -->)[\\s\\S]*?(<!-- ${name}:end -->)`);
  if (!re.test(text)) throw new Error(`${file}: no ${name} markers`);
  return text.replace(re, `$1\n${body}\n$2`);
}

// ---- exam ----
function examParts(form) {
  setSeed(form === 'A' ? 777001 : 777001 + form.charCodeAt(0) * 97);
  // Part A: 12 single-rod classifications, 2 direct, 3 small, 4 big, 3 combo, signs mixed
  const pick = (type, n) => {
    const pool = [];
    for (let v = 0; v <= 9; v++) for (let d = 1; d <= 9; d++) for (const s of ['+', '-']) {
      if (s === '-' && (type === 'direct' || type === 'small') && v - d < 0) continue;
      if (s === '+' && (type === 'direct' || type === 'small') && v + d > 9) continue;
      const r = s === '+' ? classifyAdd(v, d) : classifySub(v, d);
      if (r.type !== type) continue;
      if (type === 'direct' && ((s === '+' && v === 0) || (s === '-' && v === d))) continue;
      pool.push({ v, d, sign: s, id: r.id });
    }
    // balance signs: half plus, half minus where possible
    const plus = shuffle(pool.filter(p => p.sign === '+')), minus = shuffle(pool.filter(p => p.sign === '-'));
    const out = []; for (let i = 0; out.length < n; i++) { if (plus[i]) out.push(plus[i]); if (out.length < n && minus[i]) out.push(minus[i]); }
    return out;
  };
  const partA = shuffle([...pick('direct', 2), ...pick('small', 3), ...pick('big', 4), ...pick('combo', 3)]);
  partA.forEach(p => { tally.items++; const r = p.sign === '+' ? classifyAdd(p.v, p.d) : classifySub(p.v, p.d); if (r.id !== p.id) fail('exam A'); });

  // Part B: 14 worked problems
  const s = (spec, n = 1) => stacked(spec, n);
  const B = [];
  const push = (q, a, how) => B.push({ q, a, how });
  for (const p of s({ terms: 4, digits: 2, ops: 'mix', allow: SMALL, require: ['small+', 'small-'] })) push(stackedText(p.terms), fmt(p.answer), 'soroban');
  for (const p of s({ terms: 5, digits: 2, ops: 'mix', allow: NOCOMBO, require: ['big+', 'big-'] })) push(stackedText(p.terms), fmt(p.answer), 'soroban');
  for (const p of s({ terms: 6, digits: 2, ops: 'mix', allow: ALL, require: ['combo+', 'combo-'] })) push(stackedText(p.terms), fmt(p.answer), 'soroban');
  for (const p of s({ terms: 5, digits: 3, ops: 'mix', allow: ALL }, 2)) push(stackedText(p.terms), fmt(p.answer), 'soroban');
  for (const p of s({ terms: 10, digits: 2, ops: 'mix', allow: ALL })) push(stackedText(p.terms), fmt(p.answer), 'soroban');
  for (const p of mul({ aDigits: 3, bDigits: 1 }, 1)) push(p.text, fmt(p.answer), 'soroban');
  for (const p of mul({ aDigits: 2, bDigits: 2 }, 1)) push(p.text, fmt(p.answer), 'soroban');
  for (const p of mul({ aDigits: 3, bDigits: 2 }, 1)) push(p.text, fmt(p.answer), 'soroban');
  for (const p of div({ qDigits: 2, dDigits: 1, remainder: true }, 1)) push(`${p.text} (give quotient and remainder)`, p.r ? `${fmt(p.q)} r ${p.r}` : fmt(p.q), 'soroban');
  for (const p of div({ qDigits: 2, dDigits: 2 }, 1)) push(p.text, fmt(p.q), 'soroban');
  for (const p of s({ terms: 3, digits: 2, ops: 'add', allow: ALL })) push(p.terms.join(' + '), fmt(p.answer), 'mental');
  // two step traces: name every rod move, in order
  const tr1 = twoCol({ allow: NOCOMBO, require: ['big+'], sign: '+', min: 11, max: 89 }, 1)[0];
  const tr2 = twoCol({ allow: ALL, require: ['combo-'], sign: '-', min: 10, max: 99 }, 1)[0];
  for (const p of [tr1, tr2]) push(`${p.start} ${p.sign === '+' ? '+' : MINUS} ${p.d}: name every rod move, in order, and give the answer`, twoA(p), 'trace');
  if (B.length !== 14) throw new Error('Part B count ' + B.length);
  return { partA, B };
}

function renderExam(form) {
  const { partA, B } = examParts(form);
  const aQ = partA.map((p, i) => `${i + 1}. The ones rod shows ${p.v}. ${p.sign === '+' ? 'Add' : 'Take away'} ${p.d}. Name the move and write its line.`).join('\n');
  const aK = partA.map((p, i) => `${i + 1}. ${moveName(p.id)}. Line: "${say(p.id).replace(/\.$/, '')}"`).join('\n');
  const tag = { soroban: 'soroban allowed', mental: 'mental: no soroban, no paper', trace: 'soroban allowed' };
  const bQ = B.map((x, i) => `${13 + i}. ${x.q}  _(${tag[x.how]})_`).join('\n');
  const bK = B.map((x, i) => `${13 + i}. ${x.a}`).join('\n');
  return { aQ, aK, bQ, bK };
}

// ---- stats: script words and run time at 130 words a minute ----
function scriptWords(md) {
  const m = md.match(/## Video script\n([\s\S]*?)\n## /);
  if (!m) return 0;
  const body = m[1].replace(/\[(on screen|HUNTER|art|b-roll)[^\]]*\]/gi, ' ').replace(/[#*_>`|]/g, ' ');
  return (body.match(/[A-Za-z0-9][A-Za-z0-9'’.,−-]*/g) || []).length;
}

// ---- main ----
const pad = n => String(n).padStart(2, '0');
if (args.includes('--stats')) {
  let total = 0;
  for (let n = 1; n <= 20; n++) {
    const f = join(ROOT, 'lessons', `L${pad(n)}.md`);
    if (!existsSync(f)) { console.log(`L${pad(n)} missing`); continue; }
    const w = scriptWords(readFileSync(f, 'utf8'));
    const min = Math.round(w / 130 * 10) / 10; total += min;
    console.log(`L${pad(n)}  script ${w} words  ~${min} min`);
  }
  console.log(`total video ~${Math.round(total)} min`);
  process.exit(0);
}

if (FORM === 'A') {
  for (let n = 1; n <= 20; n++) {
    const builder = LESSONS[n];
    const f = join(ROOT, 'lessons', `L${pad(n)}.md`);
    if (!existsSync(f)) { console.log(`skip L${pad(n)} (no file yet)`); continue; }
    let text = readFileSync(f, 'utf8');
    if (!builder) {
      text = text.replace(/<!-- runtime:start -->[\s\S]*?<!-- runtime:end -->/, `<!-- runtime:start -->about ${Math.max(1, Math.round(scriptWords(text) / 130))} min<!-- runtime:end -->`);
      if (!CHECK_ONLY) writeFileSync(f, text);
      continue;
    }
    setSeed(20261021 + n * 1009);
    const secs = builder();
    const { q, a } = renderDrills(secs);
    text = text.replace(/<!-- runtime:start -->[\s\S]*?<!-- runtime:end -->/, `<!-- runtime:start -->about ${Math.max(1, Math.round(scriptWords(text) / 130))} min<!-- runtime:end -->`);
    text = replaceBlock(text, 'drills', q, f);
    text = replaceBlock(text, 'drill-answers', a, f);
    if (!CHECK_ONLY) writeFileSync(f, text);
  }
}
{
  const ex = renderExam(FORM);
  const srcExam = join(ROOT, 'exam.md'), srcKey = join(ROOT, 'exam-key.md');
  if (existsSync(srcExam) && existsSync(srcKey)) {
    let e = readFileSync(srcExam, 'utf8'), k = readFileSync(srcKey, 'utf8');
    e = replaceBlock(replaceBlock(e, 'exam-part-a', ex.aQ, srcExam), 'exam-part-b', ex.bQ, srcExam);
    k = replaceBlock(replaceBlock(k, 'key-part-a', ex.aK, srcKey), 'key-part-b', ex.bK, srcKey);
    if (FORM !== 'A') {
      e = e.replace(/^# (.*)$/m, `# $1 (retake form ${FORM})`); k = k.replace(/^# (.*)$/m, `# $1 (retake form ${FORM})`);
    }
    const outE = FORM === 'A' ? srcExam : join(ROOT, `exam-form-${FORM.toLowerCase()}.md`);
    const outK = FORM === 'A' ? srcKey : join(ROOT, `exam-key-form-${FORM.toLowerCase()}.md`);
    if (!CHECK_ONLY) { writeFileSync(outE, e); writeFileSync(outK, k); }
  } else console.log('skip exam (files not written yet)');
}
console.log(tally);
if (tally.bad) process.exit(1);

// build.mjs — assembles the Prodigy Secrets Program lesson library.
//   stage-01-sprout.md … stage-10-legend.md, boss-tests.md, lesson-index.md, tools/drills.json
// Hand-written words live in tools/content/stage-NN.mjs. Everything with a number in it that a
// child will compute (drills, quests, bosses, worked examples) is generated here from the app's
// own curriculum (js/curriculum.js), generators (js/generator.js) and soroban model (js/soroban.js).
// Run from anywhere:  node docs/products/prodigy-secrets-program/tools/build.mjs
import { writeFileSync } from 'node:fs';
import { STAGES } from '../../../../js/curriculum.js';
import { stuckHelp, coachTip, PARENT_LINE, STAGE_PLAIN } from '../../../../js/coach.js';
import { FORMULAS, expandGroups } from '../../../../js/soroban.js';
import { BLOCKS } from '../../tools/text.js';
import { makeDrill, stepsFor, reseed } from './problems.mjs';
import { Soroban } from '../../../../js/soroban.js';

const ROOT = new URL('../', import.meta.url);
const CONTENT = {};
for (const s of STAGES) {
  try { CONTENT[s.n] = (await import(`./content/stage-${String(s.n).padStart(2, '0')}.mjs`)).default; }
  catch (e) { if (process.env.PARTIAL) console.log('skip stage', s.n); else throw e; }
}

// ---------- print-only drills (documented in README) ----------
// The app's drill for two lessons does not exercise what the lesson teaches on paper, so the
// printed drill keeps the app's size and moves but adds the lesson's own requirement.
const PRINT_OVERRIDE = {
  // "Three one-digit numbers that need small friends" (teach text): require a small friend
  'mental-2': d => ({ ...d, spec: { ...d.spec, require: ['small+', 'small-'] } }),
  // "Now the imaginary total passes 10" (teach text): require a carry or borrow
  'mental-3': d => ({ ...d, spec: { ...d.spec, require: ['big+', 'big-', 'combo+', 'combo-'] } }),
  // "Decimals and money": the app drills 4-digit sums as cents; print them as dollars
  'p-decimals': d => ({ ...d, money: true }),
  // "Below zero": the app drill never goes below zero; print problems that do (see makeNeg)
  'p-negative': d => ({ ...d, kind: 'neg' }),
};

// ---------- small helpers ----------
const COL = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands', 'hundred thousands', 'millions'];
const beads = n => `[beads: ${n}]`;
const fmt = n => (Math.abs(n) >= 1000 ? n.toLocaleString('en-US') : String(n)).replace('-', '−');
const money = c => `$${(c / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
const term = (t, i) => (i === 0 ? `${t}` : t < 0 ? `−${-t}` : `+${t}`);
const passCount = (acc, n) => { for (let k = 0; k <= n; k++) if (k / n >= acc - 1e-9) return k; return n; };
const words = n => ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'][n] ?? String(n);
const secs = ms => (ms >= 1000 ? `${ms / 1000} second${ms === 1000 ? '' : 's'}` : `${ms / 1000} seconds`);
const minutes = s => (s % 60 === 0 ? `${s / 60} minute${s === 60 ? '' : 's'}` : s < 60 ? `${s} seconds` : `${Math.floor(s / 60)} minute${s < 120 ? '' : 's'} ${s % 60} seconds`);
const PB = '\n<div class="page-break"></div>\n';

// ---------- below zero (print-only kind) ----------
function makeNeg(n, where) {
  reseed(where);
  const out = [], seen = new Set();
  while (out.length < n) {
    const a = 10 + Math.floor(Math.random() * 60), b = Math.min(99, a + 1 + Math.floor(Math.random() * 60));
    const third = out.length >= 5 ? 1 + Math.floor(Math.random() * 30) : 0; // second half: three lines
    const terms = third ? [a, -b, Math.random() < 0.5 ? third : -third] : [a, -b];
    const k = terms.join(',');
    if (seen.has(k)) continue;
    const ans = terms.reduce((s, x) => s + x, 0);
    if (ans >= 0) continue;
    // check the bead method: borrow 100 from an imaginary rod, run the lines, give it back
    const s = new Soroban(8).setValue(100);
    for (const t of terms) s.apply(t);
    if (s.value - 100 !== ans) throw new Error('neg check failed ' + k);
    seen.add(k); out.push({ terms, answer: ans, beadsShow: s.value });
  }
  return { kind: 'neg', mode: 'mental', spec: {}, items: out };
}

// ---------- worked examples (generated, so the arithmetic is the model's, not mine) ----------
function stepWords(st) {
  const f = FORMULAS[st.id];
  const how = f ? f.says.split(': ')[1] : (st.sign === '+' ? 'the beads are free' : 'the beads are there');
  const what = `${st.sign === '+' ? 'plus' : 'minus'} ${st.d}`;
  return st.chain
    ? `${COL[st.col]} rod, ${st.sign === '+' ? 'the carry' : 'the borrow'} (${what}): ${how}`
    : `${COL[st.col]} rod, ${what}: ${how}`;
}
const cap = s => s[0].toUpperCase() + s.slice(1);
function exCalc(start, terms, asMoney = false) {
  const show = v => (asMoney ? `${beads(v)} (${money(v)})` : beads(v));
  const lines = [`- Start with ${show(start)}.`];
  let v = start;
  for (const t of terms) {
    const r = stepsFor(v, t, 8);
    lines.push(`- **${t < 0 ? '− ' + -t : '+ ' + t}.** ${r.steps.map(st => cap(stepWords(st))).join('. ')}. Now ${show(r.value)}.`);
    v = r.value;
  }
  lines.push(`- Read it: **${asMoney ? money(v) : fmt(v)}**.`);
  return lines;
}
function exMul(a, b) {
  const A = String(a), B = String(b), lines = [];
  const s = new Soroban(14);
  for (let i = 0; i < A.length; i++) for (let j = 0; j < B.length; j++) {
    const x = Number(A[i]), y = Number(B[j]), p = x * y;
    const shift = (A.length - 1 - i) + (B.length - 1 - j);
    if (p) s.apply(p * 10 ** shift);
    lines.push(`- ${x} × ${y} = ${String(p).padStart(2, '0')}. It lands on the ${COL[shift + 1]} and ${COL[shift]} rods. Beads: ${beads(s.value)}.`);
  }
  if (s.value !== a * b) throw new Error('example mul');
  lines.push(`- Read it: **${fmt(s.value)}**.`);
  return lines;
}
function exDiv(n, d) {
  const s = new Soroban(14).setValue(n), lines = [`- Set ${fmt(n)} on the beads: ${beads(n)}.`];
  let q = 0;
  for (let k = String(n).length - 1; k >= 0; k--) {
    const part = Math.floor(s.value / 10 ** k), digit = Math.floor(part / d);
    if (!digit && !q) { if (part) lines.push(`- ${d} does not go into ${part}. Use the next digit too.`); continue; }
    q = q * 10 + digit;
    if (digit) { s.apply(-(d * digit * 10 ** k)); lines.push(`- ${d} into ${part}: ${digit}. Take away ${fmt(d * digit * 10 ** k)}. Beads: ${beads(s.value)}. Answer so far: ${q}.`); }
    else lines.push(`- ${d} into ${part}: 0. Nothing to take away. Answer so far: ${q}.`);
  }
  if (q !== Math.floor(n / d) || s.value !== n % d) throw new Error('example div');
  lines.push(`- Read it: **${fmt(q)}**${s.value ? `, and ${s.value} left on the beads is the remainder` : ''}.`);
  return lines;
}
function exFlash(nums) {
  let t = 0;
  const lines = nums.map((x, i) => { t += x; return `- Number ${i + 1}: **${x}**. Mental beads: ${beads(t)}.`; });
  lines.push(`- Say **${fmt(t)}**.`);
  return lines;
}
function exNeg(a, b) {
  const s = new Soroban(8).setValue(100 + a); s.apply(-b);
  const ans = a - b;
  if (s.value - 100 !== ans) throw new Error('example neg');
  return [
    `- ${a} − ${b} will not fit. Borrow 100 from an empty rod on the left. Now it is ${100 + a} − ${b}.`,
    `- Work it on the beads: ${beads(s.value)}.`,
    `- You borrowed 100, so give it back: 100 − ${s.value} = ${100 - s.value}, and it is below zero.`,
    `- Read it: **${fmt(ans)}**.`,
  ];
}
function example(ex) {
  if (!ex) return [];
  switch (ex.t) {
    case 'read': return ex.nums.map(n => `- ${beads(n)} reads **${fmt(n)}**.`);
    case 'set': { const ds = String(ex.n).split('').map(Number); return [`- ${ds.map((d, i) => `${cap(COL[ds.length - 1 - i])} rod: ${d}`).join('. ')}. Done: ${beads(ex.n)}.`]; }
    case 'calc': return exCalc(ex.start, ex.terms, ex.money);
    case 'mul': return exMul(ex.a, ex.b);
    case 'div': return exDiv(ex.n, ex.d);
    case 'flash': return exFlash(ex.nums);
    case 'facts': return [ex.list.map(([a, b]) => `${a} × ${b} = ${a * b}`).join('. ') + '.'];
    case 'neg': return exNeg(ex.a, ex.b);
    default: throw new Error('example type ' + ex.t);
  }
}

// ---------- prose arithmetic check: every "a op b = c" written by hand must be true ----------
let proseChecks = 0;
function checkProse(text, where) {
  const re = /(\d[\d,]*(?:\.\d+)?) ([+−×÷-]) (\d[\d,]*(?:\.\d+)?) = (−?\d[\d,]*(?:\.\d+)?)/g;
  for (const m of text.matchAll(re)) {
    const a = Number(m[1].replace(/,/g, '')), b = Number(m[3].replace(/,/g, '')), c = Number(m[4].replace(/,/g, '').replace('−', '-'));
    const v = m[2] === '+' ? a + b : m[2] === '×' ? a * b : m[2] === '÷' ? a / b : a - b;
    proseChecks++;
    if (Math.abs(v - c) > 1e-9) throw new Error(`prose arithmetic wrong in ${where}: ${m[0]}`);
  }
}

// ---------- drills on the page ----------
function needs(d) {
  if (d.kind === 'read') return d.spec.peekMs ? 'the bead pictures on this page and a card to cover each one' : 'the bead pictures on this page and a pencil';
  if (d.kind === 'flash') return 'a grown-up to show or read the numbers. No soroban, no paper';
  if (d.mode === 'spoken') return 'a grown-up to read the numbers aloud. No soroban';
  if (d.mode === 'mental' || d.kind === 'neg') return 'no soroban. A pencil for the answers only';
  if (d.kind === 'facts') return 'a pencil and a stopwatch';
  if (d.kind === 'mul' || d.kind === 'div') return 'your soroban, with the problem on paper and only the answer on the beads';
  return 'your soroban and a grown-up beside you';
}
function instr(d, drill) {
  const sp = drill.spec || {};
  switch (d.kind) {
    case 'set': return sp.digits === 1 ? 'Set each number on one rod. Say it out loud as you set it, then clear the rod.' : 'Set each number, hundreds first. A grown-up reads the beads back and says "yes" or "look again".';
    case 'read': return sp.peekMs ? `A grown-up shows each picture for ${sp.peekMs < 1000 ? 'about one second' : secs(sp.peekMs)}, then covers it with a card. Say the number. Write it after.` : 'Say the number each picture shows. Then write it in the box.';
    case 'single': { const s = d.items.every(i => i.sign === '+') ? 'add' : d.items.every(i => i.sign === '-') ? 'take away' : 'add or take away'; return `Set the first number on one rod. Then ${s} the second.${(sp.allow || []).length > 1 ? ' Free beads, or friend?' : ''} Write what the rod shows.`; }
    case 'twocol': return `Set the first number on two rods. Then ${sp.sign === '-' ? 'take away' : sp.sign === 'mix' ? 'add or take away' : 'add'} the digit. Watch the tens rod. Write what the beads show.`;
    case 'addsub':
      if (d.mode === 'spoken') return `A grown-up reads each round aloud, one number about every second, once each. Your child adds on the mental beads and says only the total.`;
      if (d.mode === 'mental') return d.money ? 'No soroban. Each line is money. Picture the beads with the dot two rods from the right, and write only the total.' : 'No soroban. Read the column, move the beads in your head, write only the answer.';
      return 'Set the top number. Add or take away each line, left to right. Write the total in the box.';
    case 'flash': return `A grown-up shows each number for ${secs(sp.ms)} on a card, or says it at that beat, once each. Your child says only the total.${sp.ms < 700 ? ' This speed is hard to hit by hand. Use the trainer for the real tempo, and use this page as a listening drill at your fastest clear pace.' : ''}`;
    case 'facts': return 'Say or write each answer. Time the whole sheet.';
    case 'mul': return d.mode === 'mental' ? 'No soroban. Work each small product on the mental beads, left to right. Write only the answer.' : 'Keep the problem on paper and only the answer on the beads. Left digit first. Write the answer.';
    case 'div': return d.mode === 'mental' ? 'No soroban. Guess, multiply, take away, on the picture. Write only the answer.' : `Set the number to divide on the right of the soroban. Guess, multiply, take away. Write the answer${drill.spec.remainder ? ' and the remainder' : ''}.`;
    case 'neg': return 'No soroban. Borrow 100 from an empty rod when a line will not fit, then give it back at the end. Write the answer with its minus sign.';
  }
  return '';
}
function cells(d) {
  switch (d.kind) {
    case 'set': return d.items.map(p => `**${p.n}**`);  // blank row becomes a check box (see drillBody)
    case 'read': return d.items.map(p => beads(p.n));
    case 'single': return d.items.map(p => `${p.v} ${p.sign === '+' ? '+' : '−'} ${p.d}`);
    case 'twocol': return d.items.map(p => `${p.start} ${p.sign === '+' ? '+' : '−'} ${p.d}`);
    case 'facts': case 'mul': return d.items.map(p => `${fmt(p.a)} × ${p.b}`);
    case 'div': return d.items.map(p => `${fmt(p.n)} ÷ ${p.d}`);
  }
  return null;
}
function grid(cs, per = 5, blank = '____') {
  const out = [];
  for (let i = 0; i < cs.length; i += per) {
    const row = cs.slice(i, i + per);
    out.push('| ' + row.map((_, j) => `${i + j + 1}`).join(' | ') + ' |');
    out.push('|' + row.map(() => ':-:|').join(''));
    out.push('| ' + row.join(' | ') + ' |');
    if (blank) out.push('| ' + row.map(() => blank).join(' | ') + ' |');
    out.push('');
  }
  return out;
}
function stacked(d, per = d.items.length === 6 ? 6 : 5) {
  const out = [], show = t => (d.money ? money(Math.abs(t)) : String(Math.abs(t)));
  for (let i = 0; i < d.items.length; i += per) {
    const row = d.items.slice(i, i + per);
    out.push('| ' + row.map((_, j) => `${i + j + 1}`).join(' | ') + ' |');
    out.push('|' + row.map(() => '--:|').join(''));
    const rows = Math.max(...row.map(p => p.terms.length));
    for (let r = 0; r < rows; r++) out.push('| ' + row.map(p => (p.terms[r] === undefined ? '' : (r === 0 ? '' : p.terms[r] < 0 ? '−' : '+') + show(p.terms[r]))).join(' | ') + ' |');
    out.push('| ' + row.map(() => '____').join(' | ') + ' |');
    out.push('');
  }
  return out;
}
function rounds(d) {
  const out = ['| Round | Numbers, one at a time | Total |', '|:-:|---|:-:|'];
  d.items.forEach((p, i) => {
    const nums = d.kind === 'flash' ? p.nums : p.terms;
    out.push(`| ${i + 1} | ${nums.map((x, k) => (x < 0 ? `minus ${-x}` : k === 0 || d.kind === 'flash' ? `${x}` : `${x}`)).join(' · ')} | ____ |`);
  });
  out.push('');
  return out;
}
function drillBody(d) {
  if (d.kind === 'flash' || d.mode === 'spoken') return rounds(d);
  if (d.kind === 'addsub' || d.kind === 'neg') return stacked(d);
  return grid(cells(d), d.items.length === 6 ? 6 : 5, d.kind === 'set' ? '☐' : '____');
}
function answerText(d, p) {
  if (d.kind === 'div') return p.r ? `${p.q} r ${p.r}` : fmt(p.q);
  if (d.money) return money(p.answer);
  return fmt(p.answer);
}
function moveText(p) {
  const named = p.ids.filter(id => id !== 'direct').map(id => FORMULAS[id].text);
  return named.length ? named.join(' then ') : 'free';
}
function answers(d) {
  const out = [], per = 10;
  for (let i = 0; i < d.items.length; i += per) {
    const row = d.items.slice(i, i + per);
    out.push('| ' + row.map((_, j) => `${i + j + 1}`).join(' | ') + ' |');
    out.push('|' + row.map(() => ':-:|').join(''));
    out.push('| ' + row.map(p => answerText(d, p)).join(' | ') + ' |');
    if (d.kind === 'single' || d.kind === 'twocol') out.push('| ' + row.map(p => moveText(p)).join(' | ') + ' |');
    out.push('');
  }
  return out;
}
function stuckLine(drill) {
  // js/coach.js stuckHelp wording; where it falls back to the app-only "press Hint" line,
  // use the coach tip for that drill instead (same file), since paper has no Hint button.
  let parts = stuckHelp(drill);
  if (parts.length === 1 && /Press Hint/.test(parts[0])) parts = [coachTip(drill)];
  return parts.join(' ');
}

// ---------- assemble ----------
const DUMP = { lessons: [], quests: [], bosses: [] };
const INDEX = [];
let lessonNo = 0, questNo = 0;
const TOTAL_L = STAGES.reduce((s, x) => s + x.lessons.length, 0);
const TOTAL_Q = STAGES.reduce((s, x) => s + x.daily.length, 0);
const fileOf = s => `stage-${String(s.n).padStart(2, '0')}-${s.key}.md`;
const blockFor = title => Object.entries(BLOCKS).find(([, b]) => b.lesson === title)?.[1];

function lessonPage(s, l, li, c) {
  lessonNo++;
  const lc = c.lessons[l.key];
  if (!lc) throw new Error('no content for ' + l.key);
  const base = PRINT_OVERRIDE[l.key] ? PRINT_OVERRIDE[l.key](l.drill) : l.drill;
  const n = base.kind === 'facts' ? 20 : 10;
  const where = `s${s.n}|${l.key}`;
  const d = base.kind === 'neg' ? makeNeg(n, where) : { ...makeDrill(base, n, where), money: !!base.money };
  DUMP.lessons.push({ stage: s.n, key: l.key, title: l.title, allow: base.spec?.allow || null, require: base.spec?.require || null, kind: d.kind, mode: d.mode, money: !!base.money, spec: base.spec, items: d.items });
  const acc = l.drill.target?.acc ?? 0.8;
  const pass = passCount(acc, n);
  const maxSec = l.drill.target?.maxSec ? Math.round(l.drill.target.maxSec / l.drill.count * n) : null;
  const passText = l.key === 'first-test' ? 'No pass mark. This sheet is the warm-up. The score is the Bead Score test in the trainer.' : `**Pass mark:** ${pass} of ${n} right${maxSec ? `, in under ${minutes(maxSec)} for the sheet` : ''}. Not yet? Same page tomorrow.`;
  const next = s.lessons[li + 1];
  const nextText = next ? `Lesson ${s.n}.${li + 2} · ${next.title}.` : `the ${s.boss.title}, in boss-tests.md, once every lesson in this stage is passed.`;
  const block = s.n <= 2 ? blockFor(l.title) : null;
  for (const p of [lc.can, ...lc.move, lc.exLead || '', lc.parent, lc.note || '']) checkProse(p, l.key);
  const o = [];
  o.push(`## Lesson ${s.n}.${li + 1} · ${l.title}`, '');
  o.push(`*Lesson ${lessonNo} of ${TOTAL_L}. Stage ${s.n}, lesson ${li + 1} of ${s.lessons.length}. About ${l.minutes} minutes. You need ${needs(d)}.*`, '');
  o.push(`**By the end, your child can** ${lc.can}`, '');
  o.push('### The move', '', ...lc.move.flatMap(p => [p, '']));
  if (lc.ex?.t === 'calc' && base.spec?.allow) {
    // a worked example may only use moves this lesson allows
    const ok = expandGroups(base.spec.allow); let v = lc.ex.start;
    for (const t of lc.ex.terms) { const r = stepsFor(v, t, 8); for (const st of r.steps) if (!ok.has(st.id)) throw new Error(`example in ${l.key} uses ${st.id}`); v = r.value; }
  }
  const ex = example(lc.ex);
  if (ex.length) o.push(`**Worked example.** ${lc.exLead || ''}`.trim(), '', ...ex, '');
  o.push(`> ✎ ${lc.parent}`, '');
  o.push(`### Drill`, '', `${instr(d, base)} ${passText}`, '');
  if (lc.note) o.push(lc.note, '');
  o.push(...drillBody(d));
  o.push(`**Stuck?** ${stuckLine(l.drill)}`, '');
  if (block) o.push(`**In the workbook.** If you have the Prodigy Maker Workbook, Days ${block.days[0]}–${block.days[1]} drill this same lesson, one page a day.`, '');
  o.push(`**Next:** ${nextText}`);
  o.push(PB);
  INDEX.push({ type: 'lesson', no: lessonNo, label: `${s.n}.${li + 1}`, title: l.title, stage: s, minutes: l.minutes, kind: d.kind, mode: d.mode, file: fileOf(s) });
  return { md: o.join('\n'), answers: [`### Lesson ${s.n}.${li + 1} · ${l.title}`, '', ...answers(d)] };
}

function questCard(s, q, qi, c) {
  questNo++;
  const d = makeDrill(q, q.count, `q${s.n}|q${s.n}-${qi}`);
  DUMP.quests.push({ stage: s.n, label: q.label, allow: q.spec?.allow || null, require: q.spec?.require || null, kind: d.kind, mode: d.mode, spec: q.spec, items: d.items });
  const pass = passCount(0.8, q.count);
  const o = [];
  o.push(`## Quest Q${questNo} · ${q.label}`, '');
  o.push(`*Quest ${questNo} of ${TOTAL_Q}. Stage ${s.n}, quest ${qi + 1} of ${s.daily.length}. Fridays, or any day the lesson is done. You need ${needs(d)}.*`, '');
  o.push(`${c.quests[qi]} ${instr(d, q)} **Pass mark:** ${pass} of ${q.count}.`, '');
  checkProse(c.quests[qi], 'quest ' + q.label);
  o.push(...drillBody(d));
  o.push(`**Stuck?** ${stuckLine(q)}`, '');
  INDEX.push({ type: 'quest', no: questNo, title: q.label, stage: s, kind: d.kind, mode: d.mode, file: fileOf(s) });
  return { md: o.join('\n'), answers: [`### Quest Q${questNo} · ${q.label}`, '', ...answers(d)] };
}

function bossSection(s) {
  const o = [], a = [];
  o.push(`## Boss ${s.n} · ${s.boss.title}`, '');
  o.push(`*Stage ${s.n}, ${s.name}. ${s.boss.desc} Every part is timed. No hints. Pass every part to finish the stage.*`, '');
  s.boss.parts.forEach((p, i) => {
    const d = makeDrill(p, p.count, `b${s.n}|boss${s.n}-${i}`);
    const need = passCount(p.target.acc, p.count);
    DUMP.bosses.push({ stage: s.n, part: p.title, allow: p.spec?.allow || null, require: p.spec?.require || null, kind: d.kind, mode: d.mode, spec: p.spec, count: p.count, need, timeLimit: p.timeLimit, items: d.items });
    const desc = p.desc.replace('on the screen abacus', 'on your soroban, a grown-up checks each one');
    o.push(`### Part ${i + 1} · ${p.title}`, '');
    o.push(`${desc} **Pass:** ${need} of ${p.count} right in ${minutes(p.timeLimit)}. You need ${needs(d)}.`, '');
    o.push(instr(d, p), '');
    o.push(...drillBody(d));
    a.push(`### Boss ${s.n}, part ${i + 1} · ${p.title}`, '', ...answers(d));
  });
  o.push('| Part | Need | Time | Score | Passed? |', '|---|:-:|:-:|:-:|:-:|');
  s.boss.parts.forEach((p, i) => o.push(`| ${i + 1}. ${p.title} | ${passCount(p.target.acc, p.count)} of ${p.count} | ${minutes(p.timeLimit)} | ____ | ____ |`));
  o.push('');
  return { md: o.join('\n'), answers: a };
}

let totalWords = 0;
const stageWords = {};
for (const s of STAGES) {
  const c = CONTENT[s.n];
  if (!c) continue;
  const plain = STAGE_PLAIN[s.key];
  const o = [];
  o.push(`# Stage ${s.n} · ${s.name}: ${s.tagline.toLowerCase()}`, '');
  o.push(c.standfirst, '');
  o.push(`<!-- designer: stage opener in ${s.color} (DESIGN.md pop colors), stage badge from js/art.js. Every [beads: n] token is a soroban picture showing n (js/abacus.js can draw it). Lines starting "✎" are the parent line, set in Caveat in the coach speech bubble. Drill tables are soroban practice columns: numbers right-aligned, sign on the left, a big answer box under each. One lesson per spread; start each lesson on a new page. -->`, '');
  o.push(`## Where this stage goes`, '');
  o.push(`**The level goal.** ${s.goal}`, '');
  o.push(`**In plain words.** ${plain.can} ${plain.feels}`, '');
  o.push(`**How long.** ${s.time} at fifteen minutes a day, six days a week.`, '');
  o.push(...c.opener.flatMap(p => [p, '']));
  o.push('### The drills in this stage', '');
  o.push(...c.drillTypes.map(([k, v]) => `- **${k}.** ${v}`), '');
  o.push('### Accuracy before speed', '', c.accuracy, '');
  o.push('### Where this sits on the abacus ladders', '', c.kyu, '');
  if (c.formulaTable) {
    const colour = { small: 'orange', big: 'blue', combo: 'purple' };
    const ids = c.formulaTable.flatMap(g => Object.values(FORMULAS).filter(f => `${f.type}${f.sign}` === g).map(f => f.id));
    o.push(`### The ${ids.length} moves of this stage`, '', `In this book these moves are ${colour[FORMULAS[ids[0]].type]}. Adds first, then take-aways.`, '');
    o.push('| Move | On the beads | Say it |', '|---|---|---|');
    for (const id of ids) { const f = FORMULAS[id]; o.push(`| ${f.sign === '+' ? 'Plus' : 'Minus'} ${f.d} | ${f.text} | ${f.says.split(': ')[1]} |`); }
    o.push('');
  }
  o.push(`> ✎ ${PARENT_LINE[s.key]}`, '');
  for (const p of [s.goal, ...c.opener, c.accuracy, c.kyu, ...c.software, c.bossReady]) checkProse(p, `stage ${s.n}`);
  o.push(PB);
  const ans = [];
  s.lessons.forEach((l, li) => { const r = lessonPage(s, l, li, c); o.push(r.md); ans.push(...r.answers); });
  o.push(`# Stage ${s.n} quest cards`, '', c.questIntro, '');
  s.daily.forEach((q, qi) => { const r = questCard(s, q, qi, c); o.push(r.md, ''); ans.push(...r.answers); });
  o.push(PB);
  o.push(`## The ${s.boss.title}`, '', c.bossReady, '', `The printed test is **Boss ${s.n}** in boss-tests.md. It has ${s.boss.parts.length} parts:`, '');
  o.push(...s.boss.parts.map(p => `- **${p.title}.** ${p.desc.replace('on the screen abacus', 'on your soroban')} Need ${passCount(p.target.acc, p.count)} of ${p.count} in ${minutes(p.timeLimit)}.`), '');
  o.push(PB);
  o.push('## What the trainer adds to this stage', '', ...c.software.flatMap(p => [p, '']));
  o.push(PB);
  o.push(`## Answers for Stage ${s.n}`, '', 'Answers for every lesson drill and quest card in this stage. For one-rod and two-rod drills, the second row is the move your child should say.', '');
  o.push(...ans);
  o.push(`<!-- status: ready -->`, '');
  const md = o.join('\n');
  writeFileSync(new URL(fileOf(s), ROOT), md);
  stageWords[s.n] = md.split(/\s+/).filter(Boolean).length;
  totalWords += stageWords[s.n];
}

// ---------- boss-tests.md ----------
{
  let B; try { B = (await import('./content/bosses.mjs')).default; } catch (e) { if (!process.env.PARTIAL) throw e; B = { standfirst: '', how: [], notes: {} }; }
  const o = [], a = [];
  o.push('# Boss tests: all ten stages', '', B.standfirst, '');
  o.push('<!-- designer: one boss per spread. Part headers in the stage color. The score table at the end of each boss is a fill-in box. -->', '');
  o.push('## How a boss works', '', ...B.how.flatMap(p => [p, '']));
  o.push('| Boss | Parts | What it checks |', '|---|:-:|---|');
  for (const s of STAGES) o.push(`| ${s.n}. ${s.boss.title} | ${s.boss.parts.length} | ${s.boss.desc} |`);
  o.push('', PB);
  for (const s of STAGES) { if (!CONTENT[s.n]) continue; const r = bossSection(s); checkProse(B.notes[s.n] || '', 'boss ' + s.n); if (B.notes[s.n]) r.md = r.md.replace('\n\n', `\n\n${B.notes[s.n]}\n\n`); o.push(r.md, PB); a.push(...r.answers); }
  o.push('## Boss answers', '', ...a, '<!-- status: ready -->', '');
  const md = o.join('\n');
  writeFileSync(new URL('boss-tests.md', ROOT), md);
  stageWords.boss = md.split(/\s+/).filter(Boolean).length;
}

// ---------- lesson-index.md ----------
{
  const kindName = e => e.kind === 'flash' ? 'flash' : e.mode === 'spoken' ? 'listening' : e.mode === 'mental' ? 'mental' : ({ set: 'setting', read: 'reading', single: 'one rod', twocol: 'two rods', addsub: 'written', facts: 'times tables', mul: 'written', div: 'written', neg: 'mental' })[e.kind];
  const o = ['# Lesson index', '', `Every lesson and quest card in the Prodigy Secrets Program, in order. The program has **${TOTAL_L} lessons and ${TOTAL_Q} quest drills**, ${TOTAL_L + TOTAL_Q} pages of drills in all, plus ${STAGES.length} boss tests.`, ''];
  o.push('The lessons follow the trainer one for one. A lesson is done when the drill hits its pass mark. Quest cards are short review drills for Fridays. Boss tests close each stage.', '');
  for (const s of STAGES) {
    o.push(`## Stage ${s.n} · ${s.name}: ${s.tagline.toLowerCase()}`, '', `File: ${fileOf(s)}. About ${s.time}.`, '');
    o.push('| No. | Lesson | Minutes | Drill |', '|:-:|---|:-:|---|');
    for (const e of INDEX.filter(e => e.stage === s && e.type === 'lesson')) o.push(`| ${e.no} | ${e.label} ${e.title} | ${e.minutes} | ${kindName(e)} |`);
    o.push('', '| Quest | Card | Drill |', '|:-:|---|---|');
    for (const e of INDEX.filter(e => e.stage === s && e.type === 'quest')) o.push(`| Q${e.no} | ${e.title} | ${kindName(e)} |`);
    o.push('', `Boss: ${s.boss.title} (boss-tests.md, Boss ${s.n}).`, '');
  }
  o.push('## The count, plainly', '', `${TOTAL_L} lessons + ${TOTAL_Q} quest drills = ${TOTAL_L + TOTAL_Q} drill pages. Add the ${STAGES.length} boss tests and it is ${TOTAL_L + TOTAL_Q + STAGES.length}.`, '', '<!-- status: needs Hunter: the funnel page says "102 training lessons"; see README -->', '');
  writeFileSync(new URL('lesson-index.md', ROOT), o.join('\n'));
}

writeFileSync(new URL('./drills.json', import.meta.url), JSON.stringify(DUMP));
const probs = [...DUMP.lessons, ...DUMP.quests, ...DUMP.bosses].reduce((s, d) => s + d.items.length, 0);
console.log({ lessons: lessonNo, quests: questNo, bosses: DUMP.bosses.length, problems: probs, proseChecks, stageWords, totalWords });

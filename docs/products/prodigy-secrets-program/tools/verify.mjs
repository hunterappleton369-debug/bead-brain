// verify.mjs — independent re-check of tools/drills.json (written by build.mjs).
// Every printed problem must have the right answer, the right size, and use only the moves its
// lesson allows (and at least one it requires). Same idea as docs/products/tools/verify.js.
import { readFileSync } from 'node:fs';
import { STAGES } from '../../../../js/curriculum.js';
import { analyzeProblem, classifyAdd, classifySub, expandGroups, Soroban } from '../../../../js/soroban.js';

const D = JSON.parse(readFileSync(new URL('./drills.json', import.meta.url), 'utf8'));
let problems = 0, bad = 0;
const fail = (where, msg) => { bad++; console.log('BAD', where, msg); };
const len = n => String(Math.abs(n)).length;

function checkMoves(ids, allow, require, where) {
  if (allow) { const ok = expandGroups(allow); for (const id of ids) if (!ok.has(id)) fail(where, `uses ${id}`); }
  if (require) { const rq = expandGroups(require); if (!ids.some(id => rq.has(id))) fail(where, `misses required ${require}`); }
}
function check(d, where) {
  const keys = new Set(); let prev = null;
  d.items.forEach((p, i) => {
    problems++;
    const w = `${where} #${i + 1}`;
    const sp = d.spec || {};
    let key;
    switch (d.kind) {
      case 'set': case 'read':
        if (sp.digits > 1 && len(p.n) !== sp.digits) fail(w, 'digits');
        if (sp.digits === 1 && (p.n < 0 || p.n > 9)) fail(w, 'digit range');
        key = p.n; break;
      case 'single': {
        const r = p.sign === '+' ? classifyAdd(p.v, p.d) : classifySub(p.v, p.d);
        const ans = p.sign === '+' ? p.v + p.d : p.v - p.d;
        if (ans !== p.answer || ans < 0 || ans > 9) fail(w, 'answer');
        if (r.id !== p.ids[0]) fail(w, 'move label');
        checkMoves([r.id], d.allow, null, w);
        key = `${p.v}${p.sign}${p.d}`; break;
      }
      case 'twocol': {
        const s = new Soroban(6).setValue(p.start);
        const steps = s.apply(p.sign === '+' ? p.d : -p.d);
        if (s.value !== p.answer) fail(w, 'answer');
        checkMoves(steps.map(x => x.id), d.allow, d.require, w);
        key = `${p.start}${p.sign}${p.d}`; break;
      }
      case 'addsub': {
        let a; try { a = analyzeProblem(p.terms); } catch { fail(w, 'goes below zero'); break; }
        if (a.answer !== p.answer || p.terms.reduce((x, y) => x + y, 0) !== p.answer) fail(w, 'answer');
        if (p.terms.length !== sp.terms) fail(w, 'line count');
        if (p.terms.some(t => len(t) !== (Array.isArray(sp.digits) ? len(t) : sp.digits))) fail(w, 'digits per line');
        if (sp.ops === 'add' && p.terms.some(t => t < 0)) fail(w, 'minus in an adding drill');
        checkMoves([...a.used], d.allow, d.require, w);
        key = p.terms.join(','); break;
      }
      case 'flash':
        if (p.nums.length !== sp.count || p.nums.some(x => len(x) !== sp.digits)) fail(w, 'size');
        if (p.nums.reduce((x, y) => x + y, 0) !== p.answer) fail(w, 'answer');
        key = p.nums.join(','); break;
      case 'facts': case 'mul': {
        // long multiplication by place value, written out independently of build.mjs
        let total = 0;
        String(p.a).split('').reverse().forEach((x, i) => String(p.b).split('').reverse().forEach((y, j) => { total += Number(x) * Number(y) * 10 ** (i + j); }));
        if (total !== p.answer || p.a * p.b !== p.answer) fail(w, 'answer');
        if (d.kind === 'mul' && (len(p.a) !== sp.aDigits || len(p.b) !== sp.bDigits)) fail(w, 'digits');
        if (d.kind === 'facts' && (p.a > 9 || p.b > 9 || p.a < 2 || p.b < 2)) fail(w, 'fact range');
        key = `${p.a}x${p.b}`; break;
      }
      case 'div':
        if (p.q * p.d + p.r !== p.n || p.r < 0 || p.r >= p.d) fail(w, 'answer');
        if (!sp.remainder && p.r !== 0) fail(w, 'remainder in an exact drill');
        if (len(p.q) !== sp.qDigits) fail(w, 'quotient digits');
        key = `${p.n}/${p.d}`; break;
      case 'neg': {
        const ans = p.terms.reduce((x, y) => x + y, 0);
        if (ans !== p.answer || ans >= 0) fail(w, 'answer');
        key = p.terms.join(','); break;
      }
      default: fail(w, 'unknown kind ' + d.kind);
    }
    // one-rod pools are tiny (+1 and +4 together have four cases), so a one-rod page may
    // repeat a problem, like the workbook does, but never twice in a row
    if (d.kind === 'single') { if (i && key === prev) fail(w, 'same problem twice in a row'); }
    else if (keys.has(String(key))) fail(w, 'duplicate on the page');
    keys.add(String(key)); prev = key;
  });
}

// counts against the curriculum
const L = STAGES.flatMap(s => s.lessons.map(l => ({ s, l })));
if (D.lessons.length !== L.length) fail('count', `lessons ${D.lessons.length} vs ${L.length}`);
D.lessons.forEach((d, i) => {
  const { s, l } = L[i];
  if (d.key !== l.key || d.stage !== s.n) fail(`lesson ${i + 1}`, 'order');
  const want = l.drill.kind === 'facts' ? 20 : 10;
  if (d.items.length !== want) fail(`lesson ${l.key}`, `has ${d.items.length} problems`);
  // the printed drill keeps the lesson's own allowed moves (overrides may only add a requirement)
  if (JSON.stringify(d.allow) !== JSON.stringify(l.drill.spec?.allow || null)) fail(`lesson ${l.key}`, 'allow differs from curriculum');
  check(d, `s${s.n} ${l.key}`);
});
const Q = STAGES.flatMap(s => s.daily.map(q => ({ s, q })));
if (D.quests.length !== Q.length) fail('count', `quests ${D.quests.length} vs ${Q.length}`);
D.quests.forEach((d, i) => { if (d.items.length !== Q[i].q.count) fail(`quest ${i + 1}`, 'count'); check(d, `quest ${i + 1}`); });
const B = STAGES.flatMap(s => s.boss.parts.map(p => ({ s, p })));
if (D.bosses.length !== B.length) fail('count', `boss parts ${D.bosses.length} vs ${B.length}`);
D.bosses.forEach((d, i) => {
  const { s, p } = B[i];
  if (d.items.length !== p.count || d.timeLimit !== p.timeLimit) fail(`boss ${s.n}`, 'count or time');
  if (d.need / p.count < p.target.acc - 1e-9 || (d.need - 1) / p.count >= p.target.acc - 1e-9) fail(`boss ${s.n}`, 'pass mark');
  check(d, `boss ${s.n} ${p.title}`);
});
console.log({ lessons: D.lessons.length, quests: D.quests.length, bossParts: D.bosses.length, problems, bad });
process.exit(bad ? 1 : 0);

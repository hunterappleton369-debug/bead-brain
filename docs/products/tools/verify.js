// verify.js — independent re-check of days.json: every printed problem must use only its block's allowed moves.
import { readFileSync } from 'node:fs';
import { analyzeProblem, classifyAdd, classifySub, expandGroups } from '../../../js/soroban.js';
const days = JSON.parse(readFileSync(new URL('./days.json', import.meta.url), 'utf8'));
const SMALL = ['direct', 'small+', 'small-'];
// what each block may use, straight from curriculum.js lesson specs
const ALLOW = { hold: [], read2: [], read3: [], set3: [], dadd: ['direct'], dsub: ['direct'], twocol: ['direct'], eyes: ['direct'], boss1: ['direct'],
  sf14: ['direct', 'small+1', 'small+4'], sf23: ['direct', 'small+'], sfadd2d: ['direct', 'small+'], sfsub14: ['direct', 'small-1', 'small-4'],
  sfsub23: ['direct', 'small-'], sfmix: SMALL, speed: SMALL, mental: ['direct'], boss2: SMALL };
// mental/flash rounds are head-only: direct moves only, all 90 days (curriculum keeps mental drills direct through Stage 2)
let problems = 0, bad = 0, dup = 0;
const checkTerms = (terms, allow, where) => { problems++; const ok = expandGroups(allow); let a; try { a = analyzeProblem(terms); } catch (e) { bad++; console.log('NEG', where, terms); return; }
  for (const id of a.used) if (!ok.has(id)) { bad++; console.log('BAD', where, terms.join(' '), id); } };
const checkSingle = (p, allow, where) => { problems++; const ok = expandGroups(allow); const r = p.sign === '+' ? classifyAdd(p.v, p.d) : classifySub(p.v, p.d);
  if (!ok.has(r.id)) { bad++; console.log('BAD', where, p, r.id); } if (r.id !== p.id || p.answer !== (p.sign === '+' ? p.v + p.d : p.v - p.d)) { bad++; console.log('MISMATCH', where, p); } };
for (const d of days) {
  const allow = ALLOW[d.block]; const w = `day ${d.day}`;
  const dr = d.drill;
  const items = dr.items || [];
  if (dr.kind === 'single') items.forEach(p => checkSingle(p, allow, w));
  if (dr.kind === 'stacked' || dr.kind === 'mental') items.forEach(p => checkTerms(p.terms, dr.kind === 'mental' ? ['direct'] : allow, w));
  if (dr.kind === 'boss') for (const part of dr.parts) { (part.items || []).forEach(p => part.kind === 'single' ? checkSingle(p, allow, w) : checkTerms(p.terms, part.kind === 'mental' ? ['direct'] : allow, w)); }
  // duplicates on a page
  const keys = items.map(p => p.terms ? p.terms.join(',') : `${p.v}${p.sign}${p.d}`);
  for (let i = 1; i < keys.length; i++) if (keys[i] === keys[i - 1]) { dup++; console.log('ADJ DUP', w, keys[i]); }
  if (dr.kind === 'stacked' || dr.kind === 'mental') { if (new Set(keys).size !== keys.length) { dup++; console.log('DUP', w, keys); } }
  if (dr.nums && new Set(dr.nums).size !== dr.nums.length) { dup++; console.log('DUP nums', w); }
  // flash
  if (d.flash.kind === 'spoken') d.flash.rounds.forEach(r => { checkTerms(r.terms, ['direct'], w + ' flash'); if (r.answer !== analyzeProblem(r.terms).answer) { bad++; console.log('FLASH ANS', w); } });
  // every stacked item count
  if (['stacked', 'single', 'mental'].includes(dr.kind) && items.length !== 10) { bad++; console.log('COUNT', w, items.length); }
}
console.log({ problems, bad, dup });

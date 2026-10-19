// ladder.js — the Bead Score test: a ladder of rungs, climbed until one fails.
// Plus the age-ranked chart. Percentiles are ESTIMATES from grade-level
// expectations (see guide), not a measured sample. The child's own line over
// time is the honest number.
import { runDrill } from './drills.js';
import { store } from './store.js';

const F = (count, digits, ms, ops = 'add') => ({ kind: 'flash', spec: { count, digits, ms, ops }, count: 4, timeLimit: 240, target: { acc: 0.75 } });
const A = (terms, digits, ops, sec) => ({ kind: 'addsub', spec: { terms, digits, ops, allow: ['direct', 'small+', 'small-', 'big+', 'big-', 'combo+', 'combo-'] }, count: 4, timeLimit: sec, target: { acc: 0.75 }, mode: 'mental' });

export const MAIN_LADDER = {
  key: 'main', name: 'Bead Score ladder', unit: 'rung',
  rungs: [
    { n: 1, label: '1-digit + 1-digit (no crossing 10)', means: 'Adds two small numbers.', drill: { ...A(2, 1, 'add', 40), spec: { terms: 2, digits: 1, ops: 'add', allow: ['direct', 'small+'] } } },
    { n: 2, label: '1-digit + 1-digit (crossing 10)', means: 'Adds any two digits, like 7 + 8.', drill: A(2, 1, 'add', 40) },
    { n: 3, label: 'Three 1-digit numbers', means: 'Keeps a running total in the head.', drill: A(3, 1, 'add', 45) },
    { n: 4, label: '2-digit + 1-digit', means: 'Adds into the tens, like 47 + 8.', drill: A(2, [2, 1], 'add', 45) },
    { n: 5, label: '2-digit + 2-digit', means: 'Adds two 2-digit numbers with carrying, like 38 + 27.', drill: A(2, 2, 'add', 60) },
    { n: 6, label: '2-digit, 3 numbers, plus and minus', means: 'Mixed adding and subtracting, like 64 − 29 + 17.', drill: A(3, 2, 'mix', 60) },
    { n: 7, label: 'Flash: five 1-digit numbers at 1.0 s', means: 'Mental speed begins. Numbers vanish; only the total stays. About 18th kyu on the Japanese flash anzan ladder.', drill: F(5, 1, 1000) },
    { n: 8, label: '2-digit, 5 numbers added', means: 'Beyond what any school grade asks for. Most adults reach for a calculator here.', drill: A(5, 2, 'add', 75) },
    { n: 9, label: '2-digit, 5 numbers, plus and minus', means: 'Same, with subtraction mixed in.', drill: A(5, 2, 'mix', 75) },
    { n: 10, label: '3-digit, 3 numbers added', means: 'Adds hundreds in the head, like 386 + 457 + 229.', drill: A(3, 3, 'add', 75) },
    { n: 11, label: 'Flash: five 2-digit numbers at 1.0 s', means: 'Two-digit flash, about 7th kyu on the flash ladder. The abacus picture is now doing the work.', drill: F(5, 2, 1000) },
    { n: 12, label: '3-digit, 5 numbers, plus and minus', means: 'Serious mental arithmetic: the format of the Japanese 3rd-kyu mental calculation exam.', drill: A(5, 3, 'mix', 90) },
    { n: 13, label: 'Flash: eight 2-digit numbers at 0.7 s', means: 'Faster than most people can read the numbers. Around 3rd kyu on the flash ladder.', drill: F(8, 2, 700) },
    { n: 14, label: 'Flash: five 3-digit numbers at 1.0 s', means: 'Three columns of beads held in the mind at once. Around 2nd dan on the flash ladder.', drill: F(5, 3, 1000) },
    { n: 15, label: '3-digit, 10 numbers, plus and minus', means: 'The format of the Japanese 1st-kyu mental calculation exam, the top kyu grade.', drill: A(10, 3, 'mix', 120) },
    { n: 16, label: 'Flash: ten 3-digit numbers at 0.7 s', means: 'About 5th dan on the flash ladder. Competition entry level.', drill: F(10, 3, 700) },
    { n: 17, label: 'Flash: ten 3-digit numbers at 0.5 s', means: 'Around 7th dan on the flash ladder.', drill: F(10, 3, 500) },
    { n: 18, label: 'Flash: fifteen 3-digit numbers at 0.4 s', means: 'About 8th dan. National-competition territory.', drill: F(15, 3, 400) },
    { n: 19, label: 'Flash: fifteen 3-digit numbers at 0.3 s', means: 'About 9th dan. Elite; very few people on Earth can do this.', drill: F(15, 3, 300) },
    { n: 20, label: 'Flash: fifteen 3-digit numbers at 0.2 s', means: '10th dan on the flash ladder. The world record is about 0.1 s per number.', drill: F(15, 3, 200) },
  ],
};

export const TIMES_LADDER = {
  key: 'times', name: 'Times ladder', unit: 'rung',
  rungs: [
    { n: 1, label: 'Times tables to 5', means: 'Facts like 4 × 6.', drill: { kind: 'facts', spec: { maxTable: 5 }, count: 5, timeLimit: 40, target: { acc: 0.8 } } },
    { n: 2, label: 'Times tables to 9', means: 'All the facts, fast.', drill: { kind: 'facts', spec: { maxTable: 9 }, count: 5, timeLimit: 40, target: { acc: 0.8 } } },
    { n: 3, label: '2-digit × 1-digit', means: 'Like 47 × 6, in the head.', drill: { kind: 'mul', spec: { aDigits: 2, bDigits: 1 }, count: 4, timeLimit: 60, target: { acc: 0.75 } } },
    { n: 4, label: '2-digit ÷ 1-digit', means: 'Like 84 ÷ 7.', drill: { kind: 'div', spec: { qDigits: 1, dDigits: 1 }, count: 4, timeLimit: 60, target: { acc: 0.75 } } },
    { n: 5, label: '3-digit × 1-digit', means: 'Like 386 × 7.', drill: { kind: 'mul', spec: { aDigits: 3, bDigits: 1 }, count: 4, timeLimit: 75, target: { acc: 0.75 } } },
    { n: 6, label: '3-digit ÷ 1-digit', means: 'Like 532 ÷ 7.', drill: { kind: 'div', spec: { qDigits: 2, dDigits: 1 }, count: 4, timeLimit: 75, target: { acc: 0.75 } } },
    { n: 7, label: '2-digit × 2-digit', means: 'Like 47 × 36. Most adults need paper.', drill: { kind: 'mul', spec: { aDigits: 2, bDigits: 2 }, count: 4, timeLimit: 90, target: { acc: 0.75 } } },
    { n: 8, label: '4-digit ÷ 2-digit', means: 'Like 2,752 ÷ 32.', drill: { kind: 'div', spec: { qDigits: 2, dDigits: 2 }, count: 4, timeLimit: 120, target: { acc: 0.75 } } },
    { n: 9, label: '3-digit × 2-digit', means: 'Like 386 × 47.', drill: { kind: 'mul', spec: { aDigits: 3, bDigits: 2 }, count: 4, timeLimit: 120, target: { acc: 0.75 } } },
    { n: 10, label: '3-digit × 3-digit', means: 'Like 386 × 472. Dan-level.', drill: { kind: 'mul', spec: { aDigits: 3, bDigits: 3 }, count: 4, timeLimit: 180, target: { acc: 0.75 } } },
  ],
};

// Estimated median rung by age, from grade-level expectations for MENTAL
// (no paper) arithmetic. sd in rungs. Adults are "15+".
const MEDIAN = { 5: 0.7, 6: 1.5, 7: 2.4, 8: 3.3, 9: 4.0, 10: 4.6, 11: 5.0, 12: 5.4, 13: 5.7, 14: 5.9, 15: 6.0, 16: 6.2 };
const SD = 1.6;
const MEDIAN_TIMES = { 5: 0, 6: 0.2, 7: 0.6, 8: 1.2, 9: 2.0, 10: 2.6, 11: 3.0, 12: 3.4, 13: 3.6, 14: 3.8, 15: 4.0, 16: 4.0 };
const SD_TIMES = 1.3;

function phi(z) { // standard normal CDF
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  let p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}
export function medianRung(age, ladder = 'main') { const m = ladder === 'main' ? MEDIAN : MEDIAN_TIMES; const a = Math.min(16, Math.max(5, Math.round(age))); return m[a]; }
export function percentile(rung, age, ladder = 'main') {
  const sd = ladder === 'main' ? SD : SD_TIMES;
  const p = phi((rung - medianRung(age, ladder)) / sd);
  return Math.min(99, Math.max(1, Math.round(p * 100)));
}
export function rungForPercentile(pct, age, ladder = 'main') {
  // inverse by search
  const sd = ladder === 'main' ? SD : SD_TIMES;
  const z = { 50: 0, 75: 0.674, 90: 1.282, 99: 2.326 }[pct] ?? 0;
  return medianRung(age, ladder) + z * sd;
}

/** Run a ladder test. opts = { startRung, onFinish(result) } */
export function runLadder(container, ladder, opts = {}) {
  let rung = Math.max(1, opts.startRung || 1);
  let highest = 0, speed = 0, log = [];
  const h = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const next = () => {
    container.innerHTML = '';
    if (rung > ladder.rungs.length) return finish();
    const r = ladder.rungs[rung - 1];
    const card = h(`<div class="card ink-edge"><span class="sticker">Rung ${r.n}</span><span class="eyebrow">Rung ${r.n} of ${ladder.rungs.length}</span><h3>${r.label}</h3><p class="muted">${r.means}</p><p class="small faint">4 problems · ${r.drill.timeLimit}s total · need 3 of 4 · no abacus, no paper</p><div class="btn-row"><button class="btn blue">Go</button></div></div>`);
    container.appendChild(card);
    card.querySelector('button').onclick = () => {
      container.innerHTML = '';
      const holder = document.createElement('div'); container.appendChild(holder);
      runDrill(holder, r.drill, { silent: true, allowScreenAbacus: false, onFinish: (res, summary) => {
        log.push({ rung: r.n, correct: res.correct, sec: res.sec, passed: res.passed });
        const row = summary.querySelector('.btn-row'); row.innerHTML = '';
        if (res.passed) {
          highest = r.n; speed = res.avg;
          rung++;
          const b = h('<button class="btn blue">Climb to the next rung →</button>'); b.onclick = next; row.appendChild(b);
        } else {
          const b = h('<button class="btn yellow">See my Bead Score</button>'); b.onclick = finish; row.appendChild(b);
        }
      } });
    };
  };
  const finish = () => {
    // speed bonus 0..99 from average seconds per problem at the top rung (cap/4 per problem)
    const r = ladder.rungs[Math.max(0, highest - 1)];
    const cap = r ? r.drill.timeLimit / 4 : 10;
    const bonus = highest ? Math.round(Math.max(0, Math.min(99, 99 * (1 - speed / cap)))) : 0;
    const score = highest * 100 + bonus;
    const result = { ladder: ladder.key, rung: highest, bonus, score, log, age: store.profile ? store.profile.age : null };
    opts.onFinish && opts.onFinish(result);
  };
  next();
}

/** SVG chart: percentile bands by age, child's tests plotted. */
export function renderChart(tests, age, ladderKey = 'main') {
  const W = 760, H = 380, L = 54, R = 20, T = 24, B = 44;
  const ages = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  const maxRung = ladderKey === 'main' ? 20 : 10;
  const x = a => L + (Math.min(16, Math.max(5, a)) - 5) / 11 * (W - L - R);
  const y = r => T + (1 - r / maxRung) * (H - T - B);
  const band = (p, color, label) => {
    const pts = ages.map(a => `${x(a).toFixed(1)},${y(Math.min(maxRung, rungForPercentile(p, a, ladderKey))).toFixed(1)}`).join(' ');
    return `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.5" stroke-dasharray="${p === 50 ? '' : '7 5'}" opacity="0.85"/><text x="${x(16) + 4}" y="${y(Math.min(maxRung, rungForPercentile(p, 16, ladderKey))) + 4}" class="hand" fill="${color}">${label}</text>`;
  };
  let grid = '';
  for (let r = 0; r <= maxRung; r += (maxRung > 10 ? 2 : 1)) grid += `<line x1="${L}" y1="${y(r)}" x2="${W - R}" y2="${y(r)}" stroke="rgba(0,0,0,0.08)"/><text x="${L - 8}" y="${y(r) + 4}" text-anchor="end">${r}</text>`;
  for (const a of ages) grid += `<text x="${x(a)}" y="${H - B + 18}" text-anchor="middle">${a === 16 ? 'adult' : a}</text>`;
  const mine = tests.filter(t => t.ladder === ladderKey);
  let dots = '';
  if (mine.length) {
    const pts = mine.map(t => `${x(t.age || age).toFixed(1)},${y(t.rung).toFixed(1)}`).join(' ');
    dots += `<polyline points="${pts}" fill="none" stroke="#121826" stroke-width="2" opacity="0.5"/>`;
    mine.forEach((t, i) => { const last = i === mine.length - 1; dots += `<circle cx="${x(t.age || age)}" cy="${y(t.rung)}" r="${last ? 8 : 5}" fill="${last ? '#f03e3e' : '#ffd23f'}" stroke="#121826" stroke-width="2"/>`; if (last) dots += `<text x="${x(t.age || age) + 12}" y="${y(t.rung) - 10}" class="hand" fill="#f03e3e">you: rung ${t.rung}</text>`; });
  }
  return `<svg class="rank-chart" viewBox="0 0 ${W + 60} ${H}" xmlns="http://www.w3.org/2000/svg">
    ${grid}
    <text x="${L - 40}" y="${T - 8}" class="hand">rung</text>
    <text x="${(L + W - R) / 2}" y="${H - 6}" text-anchor="middle" class="hand">age</text>
    ${band(50, '#aab2c2', 'typical')}
    ${band(75, '#22c55e', 'top 25%')}
    ${band(90, '#2457f5', 'top 10%')}
    ${band(99, '#7c5cff', 'top 1%')}
    ${dots}
  </svg>`;
}

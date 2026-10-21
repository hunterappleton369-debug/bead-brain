// build.js — assembles docs/products/workbook.md from days.json (generated drills) and text.js (hand copy).
import { readFileSync, writeFileSync } from 'node:fs';
import { DAYS, PARTS, BLOCKS } from './text.js';

const days = JSON.parse(readFileSync(new URL('./days.json', import.meta.url), 'utf8'));
const OUT = new URL('../workbook.md', import.meta.url);

const beads = n => `[beads: ${n}]`;                 // designer renders a soroban picture of n
const sgn = t => (t < 0 ? `−${-t}` : `${t}`);
const line = terms => terms.map((t, i) => (i === 0 ? `${t}` : (t < 0 ? `− ${-t}` : `+ ${t}`))).join(' ');
const spokenLine = terms => terms.map(t => (t < 0 ? `minus ${-t}` : `${t}`)).join(' … ');

function drillBlock(d, drill) {
  const o = [];
  switch (drill.kind) {
    case 'set':
      o.push(drill.digits === 1
        ? '**Drill · set it.** Set each number on one rod of your soroban. Say it out loud as you set it, then clear the rod.'
        : '**Drill · set it.** Set each number on your soroban, hundreds first. A grown-up reads the beads back and says "yes" or "look again."');
      o.push('', drill.nums.map((n, i) => `${i + 1}. **${n}**`).join('   '));
      break;
    case 'read':
      o.push('**Drill · read the beads.** Write the number each picture shows.');
      o.push('', drill.nums.map((n, i) => `${i + 1}. ${beads(n)} ______`).join('\n'));
      break;
    case 'single': {
      const friend = drill.allow.length > 1;
      const sign = drill.items.every(i => i.sign === '+') ? 'add' : drill.items.every(i => i.sign === '-') ? 'take away' : 'add or take away';
      o.push(`**Drill · one rod.** Set the first number on one rod. Then ${sign} the second${friend ? '. Free beads, or friend?' : ' with free beads.'} Write what the rod shows.`);
      o.push('', drill.items.map((p, i) => `${i + 1}. ${p.v} ${p.sign === '+' ? '+' : '−'} ${p.d} = ____`).join('   '));
      break;
    }
    case 'stacked':
      o.push(`**Drill · on the soroban.** Set the first number, then add or take away each line, left to right. Write the answer at the end.${drill.timed ? ' Start the clock on problem 1 and stop it after problem 10.' : ''}`);
      o.push('', drill.items.map((p, i) => `${i + 1}. ${line(p.terms)} = ____`).join('\n'));
      if (drill.timed) o.push('', 'Time: ______   Right: ___ / 10');
      break;
    case 'mental':
      o.push('**Drill · in the head.** Soroban away. Picture one empty rod. Add the numbers on the picture and write the total.');
      o.push('', drill.items.map((p, i) => `${i + 1}. ${line(p.terms)} = ____`).join('   '));
      break;
    case 'boss':
      o.push('**Boss.** Three parts, each with a clock. A grown-up times each part. Pass all three today or come back to it after a day on the lessons that failed.');
      for (const part of drill.parts) {
        o.push('', `**${part.title}** · ${part.limit}`);
        if (part.kind === 'read') o.push(part.nums.map((n, i) => `${i + 1}. ${beads(n)} ______`).join('\n'));
        if (part.kind === 'set') o.push('Set: ' + part.nums.map(n => `**${n}**`).join('   '));
        if (part.kind === 'stacked' || part.kind === 'mental') o.push(part.items.map((p, i) => `${i + 1}. ${line(p.terms)} = ____`).join('\n'));
        if (part.kind === 'single') o.push(part.items.map((p, i) => `${i + 1}. ${p.v} ${p.sign === '+' ? '+' : '−'} ${p.d} = ____`).join('   '));
      }
      break;
  }
  return o.join('\n');
}

function flashBlock(d, flash) {
  if (flash.kind === 'peek') {
    const s = flash.seconds === 1 ? 'one second' : 'two seconds';
    return `**Flash round · peek.** A grown-up sets each number on the soroban, shows it for ${s}, then covers it with a hand. Say the number.\n\n${flash.nums.map(n => `**${n}**`).join('   ')}`;
  }
  const where = d.day < 19 ? '' : d.day <= 36
    ? ' Move the real beads as you hear them, then say the total.'
    : ' Soroban away. Keep the total on the beads in your head and say only the total at the end.';
  return `**Flash round.** A grown-up says the numbers, one each second, once each.${where}\n\n${flash.rounds.map((r, i) => `${i + 1}. ${spokenLine(r.terms)}`).join('\n')}`;
}

function answers(d) {
  const a = [];
  const dr = d.drill;
  if (dr.kind === 'read' || dr.kind === 'set') a.push(`drill: ${dr.nums.join(', ')}`);
  if (dr.kind === 'single') a.push('drill: ' + dr.items.map(p => p.answer).join(', '));
  if (dr.kind === 'stacked' || dr.kind === 'mental') a.push('drill: ' + dr.items.map(p => p.answer).join(', '));
  if (dr.kind === 'boss') for (const part of dr.parts) {
    if (part.nums) a.push(`${part.title}: ${part.nums.join(', ')}`);
    else a.push(`${part.title}: ${part.items.map(p => p.answer).join(', ')}`);
  }
  if (d.flash.kind === 'peek') a.push(`flash: ${d.flash.nums.join(', ')}`);
  else a.push('flash: ' + d.flash.rounds.map(r => r.answer).join(', '));
  return a.join(' · ');
}

const out = [];
out.push(`# Prodigy Maker Workbook

### Ninety days, one page a day, from the first bead to the first sums in the head

**Child Phenoms**

<!-- designer: companion to Child Prodigy Secrets: The Playbook. Trim 8.5 × 11 in or 8 × 10 in, one day per page, spiral or lay-flat binding so it sits open beside the soroban. Each day page has five fixed zones in this order: day number and title (Unbounded), today's idea (Inter), the drill (big Unbounded numerals, answer boxes), the flash round (speech-bubble panel), the parent line (Caveat, in the coach's speech bubble with the mascot). Tokens of the form [beads: 694] are to be rendered as a soroban picture showing that number (the site's js/abacus.js draws these as SVG). Stacked problems are listed on one line here; set them as a vertical column of numbers the way soroban practice sheets do, sign on the left. Answer key at the back, not on the page. -->

---

## Contents

| | |
|---|---|
| How this workbook works | |
| The hand, in one picture | |
| Part 1 · Sprout: meet the beads | Days 1–40 |
| Part 2 · Explorer: small friends | Days 41–90 |
| The small-friend card | |
| Answer key | |

---

## How this workbook works

One page a day. Each page is the same four things, in the same order, so that after the first week nobody has to think about what comes next.

**Today's idea.** Two sentences. Read them together before the beads move. That is the whole lesson for the day, and the online trainer has the demo if you want to see it moving.

**The drill.** Ten problems, built so they need only the moves taught so far. Every problem in this book was run on a soroban before it was printed, and any problem that would have needed a move your child has not learned was thrown out. Nine out of ten right and the day is done. Fewer? Same page tomorrow, and nothing is lost.

**The flash round.** A grown-up reads it, one number a second, once each. In the first weeks it is a peek: set the number, show it, cover it. Later it is numbers your child adds on the beads, and from Day 37 on, in the head. This is the five minutes that builds the picture, and it is the part never to skip.

**The parent line.** One sentence for whoever is in the chair. It is the only coaching you need that day.

Six days a week is the pace, and the ninety days are numbered, not dated, so a missed day is just the same page tomorrow. Answers are at the back. The pencil is for the answer boxes; the beads are for everything else.

---

## The hand, in one picture

<!-- designer: full-page pencil illustration of a child's hand on the soroban: thumb pushing an earth bead up, index finger on the heaven bead. Caption below. -->

Thumb pushes the bottom beads up to the beam. Index finger pushes them down and moves the top bead. No other finger touches a bead. Work left to right: hundreds, then tens, then ones.

A bead counts when it touches the beam. The top bead is worth five. Each bottom bead is worth one.
`);

let partIdx = -1;
let lastBlock = '';
for (const d of days) {
  const [title, idea, parent] = DAYS[d.day - 1];
  // part opener
  const pi = PARTS.findIndex(p => d.day === p.days[0]);
  if (pi >= 0) {
    partIdx = pi;
    out.push(`\n---\n\n# ${PARTS[pi].title}\n\n<!-- designer: part-opener spread with the stage badge from js/art.js -->\n\n${PARTS[pi].blurb}\n`);
  }
  const block = BLOCKS[d.block];
  const lessonTag = d.block !== lastBlock && block.lesson !== title ? ` · *${block.lesson}*` : '';
  lastBlock = d.block;
  out.push(`\n---\n\n## Day ${d.day} · ${title}${lessonTag}\n`);
  out.push(`**Today's idea.** ${idea}\n`);
  out.push(drillBlock(d, d.drill) + '\n');
  out.push(flashBlock(d, d.flash) + '\n');
  out.push(`> ✎ ${parent}\n`);
}

out.push(`\n---\n\n## The small-friend card

<!-- designer: inside back cover, orange per DESIGN.md -->

**Small friends make 5.** 1 and 4. 2 and 3.

| Adding | Taking away |
|---|---|
| +1 = +5 −4 | −1 = −5 +4 |
| +2 = +5 −3 | −2 = −5 +3 |
| +3 = +5 −2 | −3 = −5 +2 |
| +4 = +5 −1 | −4 = −5 +1 |

**On every rod, one question.** Free beads, or friend?

The eighteen big friends and the eight combination moves are the next two stages. They are on the formula card in the Playbook, and in Stage 3 of Child Phenom University.
`);

out.push(`\n---\n\n## Answer key\n`);
out.push('<!-- designer: small type, two columns, at the back. -->\n');
for (const d of days) out.push(`**Day ${d.day}** · ${answers(d)}  `);

writeFileSync(OUT, out.join('\n') + '\n');
const text = out.join('\n');
console.log('wrote', OUT.pathname, text.split(/\s+/).length, 'words,', days.length, 'days');

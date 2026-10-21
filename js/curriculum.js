// curriculum.js — the whole course: 10 stages from Sprout to Legend.
// Each lesson = teach (HTML, may contain <div class="demo" ...>), then a drill.
// Formula groups: direct, small+, small-, big+, big-, combo+, combo-.

const ALL = ['direct', 'small+', 'small-', 'big+', 'big-', 'combo+', 'combo-'];
const NOCOMBO = ['direct', 'small+', 'small-', 'big+', 'big-'];
const SMALL = ['direct', 'small+', 'small-'];

const demo = (start, apply, label = '', notes = '') => `<div class="demo" data-start="${start}" data-apply="${apply}" data-label="${label}" data-notes='${notes}'></div>`;
const free = (rods = 5) => `<div class="demo free" data-rods="${rods}"></div>`;

export const STAGES = [
  // ───────────────────────── 1 · SPROUT ─────────────────────────
  {
    n: 1, key: 'sprout', name: 'Sprout', color: 'green', tagline: 'Meet the beads',
    goal: 'Read and set any number up to 999 in a glance, and add or subtract whenever the beads you need are free.',
    time: '2–3 weeks',
    unlocks: ['direct'],
    why: 'Every later trick is built on reading the beads instantly. A study of U.S. first graders found that after a year, most still could not read multi-digit numbers off an abacus, and they learned little. Do not rush this stage.',
    intro: `<p>A soroban has a <b>beam</b> across the middle. Above the beam, each rod has one <b>heaven bead</b> worth 5. Below it, four <b>earth beads</b> worth 1 each. A bead counts when it touches the beam.</p>
      <p>Columns are place values: the rightmost rod you use is the ones, then tens, then hundreds. Little dots on the beam mark every third rod so you can find the ones column fast.</p>
      ${free(5)}
      <p class="muted small">Click or tap beads to try it. The number updates underneath.</p>`,
    lessons: [
      {
        key: 'hold', title: 'Hold it, clear it, move it', minutes: 10,
        teach: `<p>Put the soroban flat on the table, beam running left to right. Clear it: tilt the top edge up so every bead slides away from the beam, then lay it flat and run your index finger along the top of the beam to push the heaven beads up.</p>
          <p><b>Fingers.</b> Your thumb pushes earth beads <em>up</em> to the beam. Your index finger pushes earth beads <em>down</em> and moves the heaven bead both ways. Only these two fingers ever touch the beads.</p>
          <p>Try it on the screen: show 1, 2, 3, 4. Then 5 is the heaven bead alone. 6 is heaven plus one earth bead. Clear it, and show 9.</p>
          ${free(3)}
          <div class="callout parent"><b class="lbl">Parent tip</b>Say the number out loud as your child sets it. Keep the first session to ten minutes. Stop while it is still fun.</div>`,
        drill: { kind: 'set', spec: { digits: 1 }, count: 8, target: { acc: 0.9 } },
      },
      {
        key: 'read', title: 'Read any number', minutes: 10,
        teach: `<p>Reading is faster than setting, so we train it first. Look at the ones column, then the tens, then the hundreds. Say the whole number.</p>
          <p>Rule: a bead only counts when it touches the beam. Beads resting away from the beam are worth nothing.</p>
          ${demo(0, '47', 'This is 47')}
          ${demo(0, '305', 'This is 305 — the tens column is empty')}
          <p>Zero in the middle of a number is the common slip. An empty column still takes up a place.</p>`,
        drill: { kind: 'read', spec: { digits: 2 }, count: 10, target: { acc: 0.9 } },
      },
      {
        key: 'read3', title: 'Read hundreds in a glance', minutes: 10,
        teach: `<p>Same skill, bigger numbers. Aim for under three seconds per number. If you are slow, you are counting beads one at a time. Instead, learn the look of each digit: 7 is "heaven plus two", 4 is "four up, heaven off".</p>
          ${demo(0, '694', '694')}
          <div class="callout"><b class="lbl">Game</b>Peek mode: the beads show for two seconds, then hide. Say the number before it disappears.</div>`,
        drill: { kind: 'read', spec: { digits: 3, peekMs: 2000 }, count: 10, target: { acc: 0.8 } },
      },
      {
        key: 'set', title: 'Set numbers fast', minutes: 10,
        teach: `<p>Now go the other way. Hear or see a number, set it from the left: hundreds, then tens, then ones. Left to right is the order you will add in later, so start the habit now.</p>
          <p>Use the right fingers every time. Thumb up, index down. Sloppy fingers now become slow fingers later.</p>`,
        drill: { kind: 'set', spec: { digits: 3 }, count: 8, target: { acc: 0.85 } },
      },
      {
        key: 'direct-add', title: 'Add when the beads are free', minutes: 12,
        teach: `<p>To add on a soroban you simply push more beads to the beam. If the beads you need are sitting there free, move them. That is a <b>direct</b> add.</p>
          ${demo(3, '1', '3 + 1: one earth bead is free, push it up')}
          ${demo(1, '5', '1 + 5: the heaven bead is free, bring it down')}
          ${demo(6, '3', '6 + 3: three earth beads are free')}
          <p>What if the beads are <em>not</em> free, like 4 + 1? That needs a trick. You learn it in the next stage. For now the drill only gives you problems where the beads are free.</p>`,
        drill: { kind: 'single', spec: { allow: ['direct'], sign: '+' }, count: 10, target: { acc: 0.9 }, hint: false },
      },
      {
        key: 'direct-sub', title: 'Take away when the beads are there', minutes: 12,
        teach: `<p>Subtracting is pushing beads away from the beam. If the beads you want to remove are touching the beam, pull them off. Direct.</p>
          ${demo(8, '-3', '8 − 3: pull three earth beads down')}
          ${demo(7, '-5', '7 − 5: push the heaven bead up')}
          ${demo(9, '-4', '9 − 4: four earth beads down, heaven stays')}`,
        drill: { kind: 'single', spec: { allow: ['direct'], sign: '-' }, count: 10, target: { acc: 0.9 }, hint: false },
      },
      {
        key: 'two-col', title: 'Two columns, left to right', minutes: 15,
        teach: `<p>Bigger numbers are just several columns. Add the tens first, then the ones. Always left to right. This feels backwards if you learned column addition at school, but it is what makes mental math possible later: you say the number the same way you add it.</p>
          ${demo(21, '36', '21 + 36: tens first (2 + 3), then ones (1 + 6)')}
          ${demo(57, '-15', '57 − 15: tens first, then ones')}
          <p>Use your real soroban for the drill. Set the first number, then add or subtract each line. Type the final answer.</p>`,
        drill: { kind: 'addsub', spec: { terms: 3, digits: 2, ops: 'mix', allow: ['direct'] }, count: 8, target: { acc: 0.85 } },
      },
      {
        key: 'eyes-closed', title: 'Eyes closed', minutes: 8,
        teach: `<p>Here is the first step toward mental math. Look at a number on the beads for one second. Close your eyes. Can you still see it? Say it.</p>
          <p>That picture in your head is called the <b>mental abacus</b>. Experts do all their math on it. Yours is tiny right now. Every stage makes it bigger.</p>
          <div class="callout science"><b class="lbl">Science</b>Brain scans show that trained abacus users solve sums with the parts of the brain that handle pictures and hand movements, not the parts that handle words. Their mental image is a real abacus. When experts make a mistake it is often off by exactly 5, a heaven bead in the wrong place.</div>`,
        drill: { kind: 'read', spec: { digits: 1, peekMs: 900 }, count: 10, target: { acc: 0.9 } },
      },
    ],
    boss: {
      title: 'Sprout Boss', desc: 'Three short parts. Pass all three and you earn the Sprout badge.',
      parts: [
        { title: 'Read hundreds', desc: '6 numbers, under a minute.', kind: 'read', spec: { digits: 3 }, count: 6, timeLimit: 60, target: { acc: 0.83 } },
        { title: 'Set hundreds', desc: '5 numbers on the screen abacus.', kind: 'set', spec: { digits: 3 }, count: 5, timeLimit: 90, target: { acc: 0.8 } },
        { title: 'Direct add and take away', desc: '6 problems, 3 lines each, two digits. Use your soroban.', kind: 'addsub', spec: { terms: 3, digits: 2, ops: 'mix', allow: ['direct'] }, count: 6, timeLimit: 240, target: { acc: 0.83 } },
      ],
    },
    daily: [
      { label: 'Read 3-digit numbers', kind: 'read', spec: { digits: 3, peekMs: 2000 }, count: 8 },
      { label: 'Direct sums', kind: 'addsub', spec: { terms: 3, digits: 2, ops: 'mix', allow: ['direct'] }, count: 5 },
    ],
  },

  // ───────────────────────── 2 · EXPLORER ─────────────────────────
  {
    n: 2, key: 'explorer', name: 'Explorer', color: 'orange', tagline: 'Small friends',
    goal: 'Use all eight small-friend (5) formulas without thinking, in 2-digit problems.',
    time: '3–4 weeks',
    unlocks: ['direct', 'small+', 'small-'],
    why: 'The soroban has only four earth beads. Whenever you need a fifth, you trade: add the heaven bead and give back the difference. These eight moves are the first real technique.',
    intro: `<p>Two numbers that make 5 are <b>small friends</b>: 1 and 4, 2 and 3. When you cannot add a number directly, add 5 and take away its friend. When you cannot subtract directly, take away 5 and give back its friend.</p>
      <div class="formula-grid">
        <div class="formula small">+1 = +5 −4<small>friend of 1 is 4</small></div>
        <div class="formula small">+2 = +5 −3<small>friend of 2 is 3</small></div>
        <div class="formula small">+3 = +5 −2<small>friend of 3 is 2</small></div>
        <div class="formula small">+4 = +5 −1<small>friend of 4 is 1</small></div>
        <div class="formula small">−1 = −5 +4</div><div class="formula small">−2 = −5 +3</div><div class="formula small">−3 = −5 +2</div><div class="formula small">−4 = −5 +1</div>
      </div>
      <p>Say the formula out loud as you move the beads. The words fade on their own once the hand knows the move.</p>`,
    lessons: [
      {
        key: 'sf-1-4', title: '+1 and +4: friends 1 and 4', minutes: 12,
        teach: `<p>You have 4 on a rod and want to add 1. No earth bead is free. So: bring the heaven bead down (+5) and push 4 earth beads away (−4). That is +1 = +5 −4.</p>
          ${demo(4, '1', '4 + 1 = +5 −4')}
          <p>Same idea for +4 when only 1, 2 or 3 earth beads are free: add 5, take away 1.</p>
          ${demo(3, '4', '3 + 4 = +5 −1')}
          ${demo(1, '4', '1 + 4 = +5 −1')}
          <p>Press <b>Hint</b> in the drill if you forget the formula. The drill mixes in direct moves so you have to decide each time: free beads, or friend?</p>`,
        drill: { kind: 'single', spec: { allow: ['direct', 'small+1', 'small+4'], require: ['small+1', 'small+4'], sign: '+' }, count: 10, target: { acc: 0.9 } },
      },
      {
        key: 'sf-2-3', title: '+2 and +3: friends 2 and 3', minutes: 12,
        teach: `<p>+2 when fewer than two earth beads are free: add 5, take away 3.</p>
          ${demo(3, '2', '3 + 2 = +5 −3')}
          ${demo(4, '2', '4 + 2 = +5 −3')}
          <p>+3 when fewer than three are free: add 5, take away 2.</p>
          ${demo(2, '3', '2 + 3 = +5 −2')}
          ${demo(4, '3', '4 + 3 = +5 −2')}`,
        drill: { kind: 'single', spec: { allow: ['direct', 'small+'], require: ['small+2', 'small+3'], sign: '+' }, count: 10, target: { acc: 0.9 } },
      },
      {
        key: 'sf-add-2d', title: 'Small-friend adds in 2-digit numbers', minutes: 15,
        teach: `<p>Now the formulas show up inside real problems. Work left to right. On each column ask: free beads, or friend?</p>
          ${demo(23, '32', '23 + 32: tens 2 + 3 direct. Ones 3 + 2 needs a friend')}
          ${demo(41, '14', '41 + 14: tens 4 + 1 needs a friend. Ones direct')}
          <p>Use your real soroban. Say each formula as you go.</p>`,
        drill: { kind: 'addsub', spec: { terms: 4, digits: 2, ops: 'add', allow: ['direct', 'small+'], require: ['small+'] }, count: 8, target: { acc: 0.85 } },
      },
      {
        key: 'sf-sub-1-4', title: '−1 and −4: taking away with friends', minutes: 12,
        teach: `<p>You have 5 and want to take away 1. No earth bead is at the beam to remove. So: push the heaven bead up (−5) and bring 4 earth beads up (+4). That is −1 = −5 +4.</p>
          ${demo(5, '-1', '5 − 1 = −5 +4')}
          ${demo(6, '-4', '6 − 4 = −5 +1')}
          ${demo(8, '-4', '8 − 4 = −5 +1')}`,
        drill: { kind: 'single', spec: { allow: ['direct', 'small-1', 'small-4'], require: ['small-1', 'small-4'], sign: '-' }, count: 10, target: { acc: 0.9 } },
      },
      {
        key: 'sf-sub-2-3', title: '−2 and −3', minutes: 12,
        teach: `<p>−2 = −5 +3 and −3 = −5 +2. Same move, different friend.</p>
          ${demo(6, '-2', '6 − 2 = −5 +3')}
          ${demo(5, '-3', '5 − 3 = −5 +2')}
          ${demo(7, '-3', '7 − 3 = −5 +2')}`,
        drill: { kind: 'single', spec: { allow: ['direct', 'small-'], require: ['small-2', 'small-3'], sign: '-' }, count: 10, target: { acc: 0.9 } },
      },
      {
        key: 'sf-mix', title: 'All eight friends, mixed', minutes: 15,
        teach: `<p>Plus and minus together, two digits, four lines. The only rule you have not learned yet is what to do when a column goes past 9 or below 0. These problems never do that.</p>
          <div class="callout parent"><b class="lbl">Parent tip</b>If your child hesitates on a column, do not give the answer. Ask "free beads, or friend?" and wait. The decision is the skill.</div>`,
        drill: { kind: 'addsub', spec: { terms: 4, digits: 2, ops: 'mix', allow: SMALL, require: ['small+', 'small-'] }, count: 8, target: { acc: 0.85 } },
      },
      {
        key: 'speed-sf', title: 'Speed round', minutes: 10,
        teach: `<p>Accuracy first, then speed. Ten problems. Try to beat your last time without dropping below 8 correct. Write your time on paper so you can see it fall over the week.</p>`,
        drill: { kind: 'addsub', spec: { terms: 5, digits: 2, ops: 'mix', allow: SMALL }, count: 10, target: { acc: 0.8, maxSec: 300 } },
      },
      {
        key: 'mental-1', title: 'Mental: three small numbers', minutes: 8,
        teach: `<p>Put the soroban away. Picture an empty rod. Add the numbers on your imaginary beads. Only free-bead moves for now, so nothing tricky, just the picture.</p>
          <p>If the picture fades, tap the numbers on the table with your thumb and index finger as if the beads were there. Moving the fingers keeps the picture alive. Studies of mental-abacus learners show this: stop the hands and the calculation slows.</p>`,
        drill: { kind: 'addsub', spec: { terms: 3, digits: 1, ops: 'add', allow: ['direct'] }, count: 8, mode: 'mental', target: { acc: 0.85 } },
      },
    ],
    boss: {
      title: 'Explorer Boss', desc: 'Small friends under pressure.',
      parts: [
        { title: 'Friend or free?', desc: '10 single-column moves on the screen abacus.', kind: 'single', spec: { allow: SMALL, sign: 'mix' }, count: 10, timeLimit: 120, target: { acc: 0.9 }, hint: false },
        { title: '2-digit, 4 lines', desc: '6 problems on your soroban.', kind: 'addsub', spec: { terms: 4, digits: 2, ops: 'mix', allow: SMALL }, count: 6, timeLimit: 240, target: { acc: 0.83 } },
        { title: 'Mental', desc: '5 problems, three small numbers each, no soroban.', kind: 'addsub', spec: { terms: 3, digits: 1, ops: 'add', allow: ['direct'] }, count: 5, mode: 'mental', timeLimit: 120, target: { acc: 0.8 } },
      ],
    },
    daily: [
      { label: 'Friend or free?', kind: 'single', spec: { allow: SMALL, sign: 'mix' }, count: 10 },
      { label: '2-digit small friends', kind: 'addsub', spec: { terms: 4, digits: 2, ops: 'mix', allow: SMALL }, count: 5 },
      { label: 'Mental warm-up', kind: 'addsub', spec: { terms: 3, digits: 1, ops: 'add', allow: ['direct'] }, count: 5, mode: 'mental' },
    ],
  },

  // ───────────────────────── 3 · APPRENTICE ─────────────────────────
  {
    n: 3, key: 'apprentice', name: 'Apprentice', color: 'blue', tagline: 'Big friends',
    goal: 'Carry and borrow between columns with the eighteen big-friend (10) formulas, in 5-line problems.',
    time: '5–6 weeks',
    unlocks: NOCOMBO,
    why: 'A column holds at most 9. Going past it means carrying 1 to the next rod and giving back the difference from 10. This is where the soroban starts beating fingers and paper.',
    intro: `<p>Two numbers that make 10 are <b>big friends</b>: 1 and 9, 2 and 8, 3 and 7, 4 and 6, 5 and 5. To add a number that will not fit, take away its big friend and carry 1 to the column on the left. To subtract a number that is not there, add its big friend, then borrow 1 from the left.</p>
      <div class="formula-grid">
        <div class="formula big">+9 = −1 +10</div><div class="formula big">+8 = −2 +10</div><div class="formula big">+7 = −3 +10</div><div class="formula big">+6 = −4 +10</div><div class="formula big">+5 = −5 +10</div><div class="formula big">+4 = −6 +10</div><div class="formula big">+3 = −7 +10</div><div class="formula big">+2 = −8 +10</div><div class="formula big">+1 = −9 +10</div>
        <div class="formula big">−9 = +1 −10</div><div class="formula big">−8 = +2 −10</div><div class="formula big">−7 = +3 −10</div><div class="formula big">−6 = +4 −10</div><div class="formula big">−5 = +5 −10</div><div class="formula big">−4 = +6 −10</div><div class="formula big">−3 = +7 −10</div><div class="formula big">−2 = +8 −10</div><div class="formula big">−1 = +9 −10</div>
      </div>
      <p>The order of the two moves matters on a real soroban. Work the rod you are on first, then the rod to its left. For adding: take away the friend, then carry. For taking away: add the friend, then borrow. One rule for both.</p>`,
    lessons: [
      {
        key: 'bf-9-8-7', title: '+9, +8, +7', minutes: 15,
        teach: `<p>You have 4 and want to add 9. It will not fit. Take away 1 (the big friend of 9), then carry 1 to the tens. 4 + 9 = 13.</p>
          ${demo(4, '9', '4 + 9 = −1, carry 1')}
          ${demo(7, '8', '7 + 8 = −2, carry 1')}
          ${demo(6, '7', '6 + 7 = −3, carry 1')}
          <p>The drill shows two columns. Watch the tens column change when you carry.</p>`,
        drill: { kind: 'twocol', spec: { allow: ['direct', 'small+', 'big+7', 'big+8', 'big+9'], require: ['big+7', 'big+8', 'big+9'], sign: '+', min: 1, max: 89 }, count: 10, target: { acc: 0.9 } },
      },
      {
        key: 'bf-6-5', title: '+6 and +5', minutes: 12,
        teach: `<p>+6 = take away 4, carry 1. +5 = take away 5, carry 1 (that is when the heaven bead is already down and you need another 5).</p>
          ${demo(8, '6', '8 + 6 = −4, carry 1')}
          ${demo(5, '5', '5 + 5 = −5, carry 1')}
          ${demo(9, '5', '9 + 5 = −5, carry 1')}`,
        drill: { kind: 'twocol', spec: { allow: ['direct', 'small+', 'big+5', 'big+6', 'big+7', 'big+8', 'big+9'], require: ['big+5', 'big+6'], sign: '+', min: 1, max: 89 }, count: 10, target: { acc: 0.9 } },
      },
      {
        key: 'bf-4-1', title: '+4, +3, +2, +1 past nine', minutes: 12,
        teach: `<p>Small numbers can also fail to fit, when the rod is nearly full. 9 + 1: take away 9, carry 1. 8 + 3: take away 7, carry 1.</p>
          ${demo(9, '1', '9 + 1 = −9, carry 1')}
          ${demo(8, '3', '8 + 3 = −7, carry 1')}
          ${demo(7, '4', '7 + 4 = −6, carry 1')}`,
        drill: { kind: 'twocol', spec: { allow: ['direct', 'small+', 'big+'], require: ['big+1', 'big+2', 'big+3', 'big+4'], sign: '+', min: 1, max: 89 }, count: 10, target: { acc: 0.9 } },
      },
      {
        key: 'carry-chain', title: 'Carry chains', minutes: 15,
        teach: `<p>Sometimes the carry itself will not fit. 99 + 1: ones say take away 9, carry 1 to the tens. The tens hold 9 too, so take away 9 and carry again. 99 + 1 = 100. Each carry is just another +1, with the same rules.</p>
          ${demo(99, '1', '99 + 1: carry, then carry again')}
          ${demo(195, '8', '195 + 8')}
          <p>Now real problems: 5 lines, 2 digits, with small and big friends mixed. Use your soroban.</p>`,
        drill: { kind: 'addsub', spec: { terms: 5, digits: 2, ops: 'add', allow: ['direct', 'small+', 'big+'], require: ['big+'] }, count: 8, target: { acc: 0.85 } },
      },
      {
        key: 'bf-sub-9-7', title: '−9, −8, −7: borrowing', minutes: 15,
        teach: `<p>You have 13 and want to take away 9. The ones rod holds 3, and 9 is not there. Add the big friend of 9, which is 1, then borrow 1 from the tens (−10). 13 − 9 = 4.</p>
          ${demo(13, '-9', '13 − 9 = +1, borrow 1')}
          ${demo(12, '-8', '12 − 8 = +2, borrow 1')}
          ${demo(15, '-7', '15 − 7 = +3, borrow 1')}`,
        drill: { kind: 'twocol', spec: { allow: ['direct', 'small-', 'big-7', 'big-8', 'big-9'], require: ['big-7', 'big-8', 'big-9'], sign: '-', min: 10, max: 99 }, count: 10, target: { acc: 0.9 } },
      },
      {
        key: 'bf-sub-6-1', title: '−6 down to −1', minutes: 15,
        teach: `<p>Same move for every digit: add the friend, then borrow 1. −6 adds 4. −5 adds 5. −4 adds 6. −3 adds 7. −2 adds 8. −1 adds 9.</p>
          ${demo(10, '-6', '10 − 6 = +4, borrow 1')}
          ${demo(12, '-5', '12 − 5 = +5, borrow 1')}
          ${demo(10, '-1', '10 − 1 = +9, borrow 1')}`,
        drill: { kind: 'twocol', spec: { allow: ['direct', 'small-', 'big-'], require: ['big-1', 'big-2', 'big-3', 'big-4', 'big-5', 'big-6'], sign: '-', min: 10, max: 99 }, count: 10, target: { acc: 0.9 } },
      },
      {
        key: 'borrow-chain', title: 'Borrow chains and mixed problems', minutes: 15,
        teach: `<p>100 − 1: the ones rod is empty, so add 9, then borrow 1 from the tens. The tens rod is empty too, so it does the same: add 9, then borrow 1 from the hundreds. 100 − 1 = 99.</p>
          ${demo(100, '-1', '100 − 1: borrow twice')}
          ${demo(203, '-7', '203 − 7')}
          <p>Now plus and minus mixed, five lines. This is the real thing.</p>`,
        drill: { kind: 'addsub', spec: { terms: 5, digits: 2, ops: 'mix', allow: NOCOMBO, require: ['big-'] }, count: 8, target: { acc: 0.85 } },
      },
      {
        key: 'mental-2', title: 'Mental: small friends in the head', minutes: 8,
        teach: `<p>Soroban away. Three one-digit numbers that need small friends. See the heaven bead come down in your mind. Move your fingers if it helps.</p>`,
        drill: { kind: 'addsub', spec: { terms: 3, digits: 1, ops: 'mix', allow: SMALL }, count: 8, mode: 'mental', target: { acc: 0.85 } },
      },
      {
        key: 'mental-3', title: 'Mental: crossing ten', minutes: 8,
        teach: `<p>Now the imaginary total passes 10. Picture two rods: when the ones rod overflows, a bead appears on the tens rod. Four numbers, one digit each.</p>`,
        drill: { kind: 'addsub', spec: { terms: 4, digits: 1, ops: 'mix', allow: NOCOMBO }, count: 8, mode: 'mental', target: { acc: 0.8 } },
      },
    ],
    boss: {
      title: 'Apprentice Boss', desc: 'Carries and borrows, then your first mental crossing of ten.',
      parts: [
        { title: 'Carry or borrow', desc: '10 moves on the screen abacus.', kind: 'twocol', spec: { allow: NOCOMBO, require: ['big+', 'big-'], sign: 'mix', min: 1, max: 99 }, count: 10, timeLimit: 150, target: { acc: 0.9 }, hint: false },
        { title: '2-digit, 5 lines', desc: '6 problems on your soroban.', kind: 'addsub', spec: { terms: 5, digits: 2, ops: 'mix', allow: NOCOMBO }, count: 6, timeLimit: 300, target: { acc: 0.83 } },
        { title: 'Mental', desc: '5 problems, four 1-digit numbers each.', kind: 'addsub', spec: { terms: 4, digits: 1, ops: 'mix', allow: NOCOMBO }, count: 5, mode: 'mental', timeLimit: 150, target: { acc: 0.8 } },
      ],
    },
    daily: [
      { label: 'Carry or borrow', kind: 'twocol', spec: { allow: NOCOMBO, sign: 'mix', min: 1, max: 99 }, count: 10 },
      { label: '2-digit, 5 lines', kind: 'addsub', spec: { terms: 5, digits: 2, ops: 'mix', allow: NOCOMBO }, count: 5 },
      { label: 'Mental', kind: 'addsub', spec: { terms: 4, digits: 1, ops: 'mix', allow: NOCOMBO }, count: 5, mode: 'mental' },
    ],
  },

  // ───────────────────────── 4 · ADEPT ─────────────────────────
  {
    n: 4, key: 'adept', name: 'Adept', color: 'purple', tagline: 'All 34 formulas',
    goal: 'Master the eight combination formulas, so every possible move is automatic, and solve 3-digit problems.',
    time: '5–6 weeks',
    unlocks: ALL,
    why: 'Eight moves need both friends at once. After this stage there are no new bead rules anywhere in addition and subtraction. Everything after is speed and the mental picture.',
    intro: `<p>Try 6 + 6 on one rod. Big friend says: take away 4, carry 1. But the rod shows 6 as heaven plus one earth bead. There is no 4 to take away. Use a small friend to take away the 4: −4 = −5 +1. So +6 = −5 +1, then carry 1.</p>
      <div class="formula-grid">
        <div class="formula combo">+6 = −5 +1 +10</div><div class="formula combo">+7 = −5 +2 +10</div><div class="formula combo">+8 = −5 +3 +10</div><div class="formula combo">+9 = −5 +4 +10</div>
        <div class="formula combo">−6 = +5 −1 −10</div><div class="formula combo">−7 = +5 −2 −10</div><div class="formula combo">−8 = +5 −3 −10</div><div class="formula combo">−9 = +5 −4 −10</div>
      </div>
      <p>These only happen in a few situations: adding 6–9 to a rod showing 5–8, or subtracting 6–9 from a rod showing 1–4 (with a borrow). The drill finds those situations for you.</p>`,
    lessons: [
      {
        key: 'combo-add', title: 'Combo adds: 6+6, 7+7, 8+8, 5+9', minutes: 15,
        teach: `${demo(6, '6', '6 + 6 = −5 +1, carry')}
          ${demo(7, '7', '7 + 7 = −5 +2, carry')}
          ${demo(5, '9', '5 + 9 = −5 +4, carry')}
          ${demo(8, '6', '8 + 6 = −5 +1, carry')}
          <p>Watch the order: heaven bead up, earth beads up, then carry. Three moves, one formula.</p>`,
        drill: { kind: 'twocol', spec: { allow: ['direct', 'small+', 'big+', 'combo+'], require: ['combo+'], sign: '+', min: 1, max: 89 }, count: 10, target: { acc: 0.9 } },
      },
      {
        key: 'combo-sub', title: 'Combo take-aways: 11−6, 12−7, 13−8, 14−9', minutes: 15,
        teach: `<p>11 − 6: add 4 to the ones first, then borrow 1 from the tens. The ones rod shows 1, and 1 + 4 needs a small friend: +5 −1. So −6 = +5 −1, then borrow 1.</p>
          ${demo(11, '-6', '11 − 6 = +5 −1, borrow')}
          ${demo(12, '-7', '12 − 7 = +5 −2, borrow')}
          ${demo(14, '-9', '14 − 9 = +5 −4, borrow')}`,
        drill: { kind: 'twocol', spec: { allow: ALL, require: ['combo-'], sign: '-', min: 10, max: 99 }, count: 10, target: { acc: 0.9 } },
      },
      {
        key: 'all-34', title: 'All 34 formulas, mixed', minutes: 15,
        teach: `<p>Every rule you know, in one drill: direct, small friend, big friend, combo. Six lines of two digits. On each column: free beads? small friend? does it fit? If not, big friend, and if the friend is not there, combo.</p>
          <p>From here on, nothing new ever happens on a rod. Fluency is now the whole game.</p>`,
        drill: { kind: 'addsub', spec: { terms: 6, digits: 2, ops: 'mix', allow: ALL, require: ['combo+', 'combo-'] }, count: 8, target: { acc: 0.85 } },
      },
      {
        key: 'three-digit', title: 'Three digits', minutes: 15,
        teach: `<p>Three columns instead of two. Nothing else changes. Hundreds, then tens, then ones. Carries can run across all three rods.</p>
          ${demo(468, '357', '468 + 357')}
          ${demo(1000, '-1', '1000 − 1')}`,
        drill: { kind: 'addsub', spec: { terms: 5, digits: 3, ops: 'mix', allow: ALL }, count: 8, target: { acc: 0.85 } },
      },
      {
        key: 'ten-rows', title: 'Ten rows', minutes: 15,
        teach: `<p>Long columns of numbers are the classic soroban test. Ten lines of two digits. Keep your eyes one line ahead of your hand. Do not check the answer until the end.</p>
          <div class="callout parent"><b class="lbl">Parent tip</b>Time this one with a stopwatch every day for a week and write the times on the fridge. Kids love watching the number fall.</div>`,
        drill: { kind: 'addsub', spec: { terms: 10, digits: 2, ops: 'mix', allow: ALL }, count: 5, target: { acc: 0.8, maxSec: 300 } },
      },
      {
        key: 'mental-4', title: 'Mental: five single digits, all formulas', minutes: 8,
        teach: `<p>Soroban away. Five one-digit numbers, plus and minus, every formula allowed. Picture the rod and the carry rod beside it.</p>`,
        drill: { kind: 'addsub', spec: { terms: 5, digits: 1, ops: 'mix', allow: ALL }, count: 8, mode: 'mental', target: { acc: 0.8 } },
      },
      {
        key: 'mental-5', title: 'Mental: two 2-digit numbers', minutes: 10,
        teach: `<p>Now two rods in the picture. 34 + 28: tens first, 3 + 2 is 5. Ones: 4 + 8, carry, take away 2. Say the answer: 62.</p>
          <p>If it falls apart, go back to the real soroban for 34 + 28, watch it, close your eyes, replay it. Then try the next one in the head.</p>
          <div class="callout science"><b class="lbl">Science</b>Research on mental-abacus users finds the picture holds about three or four rods at once, the same limit as the number of objects anyone can track visually. That is why two digits feels like a jump: you are now holding two objects, each with its own beads.</div>`,
        drill: { kind: 'addsub', spec: { terms: 2, digits: 2, ops: 'add', allow: ALL }, count: 8, mode: 'mental', target: { acc: 0.8 } },
      },
      {
        key: 'mental-6', title: 'Mental: three 2-digit numbers', minutes: 10,
        teach: `<p>Three lines, two digits, adding only. Keep the running total as a picture, never as words. If you catch yourself saying "sixty-two" in your head, go back to the beads.</p>`,
        drill: { kind: 'addsub', spec: { terms: 3, digits: 2, ops: 'add', allow: ALL }, count: 8, mode: 'mental', target: { acc: 0.8 } },
      },
    ],
    boss: {
      title: 'Adept Boss', desc: 'Every formula, three digits, and your first 2-digit mental sums.',
      parts: [
        { title: 'Combo moves', desc: '10 moves on the screen abacus.', kind: 'twocol', spec: { allow: ALL, require: ['combo+', 'combo-'], sign: 'mix', min: 1, max: 99 }, count: 10, timeLimit: 150, target: { acc: 0.9 }, hint: false },
        { title: '3-digit, 5 lines', desc: '6 problems on your soroban.', kind: 'addsub', spec: { terms: 5, digits: 3, ops: 'mix', allow: ALL }, count: 6, timeLimit: 360, target: { acc: 0.83 } },
        { title: 'Mental', desc: '5 problems, three 2-digit numbers each.', kind: 'addsub', spec: { terms: 3, digits: 2, ops: 'add', allow: ALL }, count: 5, mode: 'mental', timeLimit: 180, target: { acc: 0.8 } },
      ],
    },
    daily: [
      { label: 'Any formula', kind: 'twocol', spec: { allow: ALL, sign: 'mix', min: 1, max: 99 }, count: 10 },
      { label: '3-digit, 5 lines', kind: 'addsub', spec: { terms: 5, digits: 3, ops: 'mix', allow: ALL }, count: 5 },
      { label: 'Mental 2-digit', kind: 'addsub', spec: { terms: 3, digits: 2, ops: 'add', allow: ALL }, count: 5, mode: 'mental' },
    ],
  },

  // ───────────────────────── 5 · ACE ─────────────────────────
  {
    n: 5, key: 'ace', name: 'Ace', color: 'orange', tagline: 'Speed and flash',
    goal: 'Ten 3-digit lines on the soroban in under a minute, five 2-digit numbers in the head, and your first flash anzan.',
    time: '6–8 weeks',
    unlocks: ALL,
    why: 'Speed is not a bonus. It is what moves the skill from the hand to the mind. When the fingers are automatic, attention is free to hold the picture.',
    intro: `<p>Three things happen in this stage. Your hands get fast on the real soroban. Your mental abacus grows to two rods and five lines. And you meet <b>flash anzan</b>: numbers flash on the screen one after another and vanish, and you keep the running total on your mental beads.</p>
      <p>At the end you take your first <a href="#/test">Bead Score</a> test. Write the number down. You will beat it.</p>`,
    lessons: [
      {
        key: 'fast-hands', title: 'Fast hands', minutes: 12,
        teach: `<p>Speed rules: thumb and index only. Fingers stay close to the beads, never lifting high. Eyes read the next number while the hand finishes the last one. Never look at the beads to "check". Trust the hand.</p>
          <p>Ten lines of three digits, adding. Target: all correct, then under 90 seconds a problem, then under 60.</p>`,
        drill: { kind: 'addsub', spec: { terms: 10, digits: 3, ops: 'add', allow: ALL }, count: 4, target: { acc: 0.75, maxSec: 360 } },
      },
      {
        key: 'read-ahead', title: 'Read ahead', minutes: 12,
        teach: `<p>Mixed plus and minus, ten lines. The sign is part of the number: read "minus 347" as one chunk, not a sign and then a number.</p>`,
        drill: { kind: 'addsub', spec: { terms: 10, digits: 3, ops: 'mix', allow: ALL }, count: 4, target: { acc: 0.75, maxSec: 360 } },
      },
      {
        key: 'four-digit', title: 'Four digits', minutes: 12,
        teach: `<p>Four rods. Thousands first. The soroban does not care how long a number is. Only your eyes do.</p>`,
        drill: { kind: 'addsub', spec: { terms: 5, digits: 4, ops: 'mix', allow: ALL }, count: 5, target: { acc: 0.8 } },
      },
      {
        key: 'flash-1', title: 'Flash anzan begins', minutes: 8,
        teach: `<p>A number appears for a moment and vanishes. Add it to your mental beads. The next appears. At the end, type the total. You cannot write anything down and you cannot go back, so the picture has to do all the work.</p>
          <p>Start easy: five one-digit numbers, each showing for one and a half seconds. The feeling you want is calm. The number lands on the beads and is gone.</p>
          <div class="callout science"><b class="lbl">Science</b>Flash anzan was invented by a Japanese teacher, Yoji Miyamoto, to force students off the physical abacus. Champions add fifteen 3-digit numbers flashed in under two seconds total. Asked afterwards what the numbers were, they cannot say. Only the total ever existed in their mind.</div>`,
        drill: { kind: 'flash', spec: { count: 5, digits: 1, ms: 1500, ops: 'add' }, count: 8, target: { acc: 0.8 } },
      },
      {
        key: 'flash-2', title: 'Flash: faster, longer', minutes: 8,
        teach: `<p>Eight numbers at one second each. If you lose the picture, do not chase it. Let the next number land anyway. You will often still be right.</p>`,
        drill: { kind: 'flash', spec: { count: 8, digits: 1, ms: 1000, ops: 'add' }, count: 8, target: { acc: 0.75 } },
      },
      {
        key: 'mental-7', title: 'Mental: five 2-digit numbers', minutes: 10,
        teach: `<p>Five lines of two digits, in the head. Move your fingers on the table if it helps. Most learners do at this point and stop on their own later.</p>`,
        drill: { kind: 'addsub', spec: { terms: 5, digits: 2, ops: 'add', allow: ALL }, count: 6, mode: 'mental', target: { acc: 0.8 } },
      },
      {
        key: 'mental-8', title: 'Mental: 2-digit plus and minus', minutes: 10,
        teach: `<p>Same, with subtraction. Borrows in the head feel strange the first week and normal the second.</p>`,
        drill: { kind: 'addsub', spec: { terms: 5, digits: 2, ops: 'mix', allow: ALL }, count: 6, mode: 'mental', target: { acc: 0.8 } },
      },
      {
        key: 'listen-1', title: 'Listening: numbers read aloud', minutes: 8,
        teach: `<p>The computer reads numbers out loud and you add them on your mental beads. This is how abacus schools run their mental drills: the teacher calls, the class answers. It also means you can practise with a parent reading from a list, anywhere.</p>
          <p class="small muted">Needs sound on. Uses your browser's built-in voice.</p>`,
        drill: { kind: 'addsub', spec: { terms: 4, digits: 2, ops: 'add', allow: ALL, rate: 1, gapMs: 500 }, count: 6, mode: 'spoken', target: { acc: 0.75 } },
      },
      {
        key: 'first-test', title: 'Your first Bead Score', minutes: 10,
        teach: `<p>Take the <a href="#/test" class="btn sm primary">Bead Score test</a>. It is a ladder: easy rungs first, harder each step, until one fails. Your score is the top rung you cleared. No soroban, no paper, no help.</p>
          <p>Then come back and mark this lesson done. Retake the test every two to four weeks and watch the line on your chart climb.</p>`,
        drill: { kind: 'addsub', spec: { terms: 3, digits: 2, ops: 'mix', allow: ALL }, count: 3, mode: 'mental', target: { acc: 0.34 } },
      },
    ],
    boss: {
      title: 'Ace Boss', desc: 'Speed on the beads, five lines in the head, and flash.',
      parts: [
        { title: '3-digit, 10 lines', desc: '4 problems on your soroban, 5 minutes total.', kind: 'addsub', spec: { terms: 10, digits: 3, ops: 'mix', allow: ALL }, count: 4, timeLimit: 300, target: { acc: 0.75 } },
        { title: 'Mental 2-digit', desc: '5 problems, five lines each.', kind: 'addsub', spec: { terms: 5, digits: 2, ops: 'mix', allow: ALL }, count: 5, mode: 'mental', timeLimit: 240, target: { acc: 0.8 } },
        { title: 'Flash', desc: '5 rounds, eight 1-digit numbers at 1 second.', kind: 'flash', spec: { count: 8, digits: 1, ms: 1000, ops: 'add' }, count: 5, timeLimit: 180, target: { acc: 0.8 } },
      ],
    },
    daily: [
      { label: '3-digit, 10 lines (timed)', kind: 'addsub', spec: { terms: 10, digits: 3, ops: 'mix', allow: ALL }, count: 3 },
      { label: 'Mental 2-digit, 5 lines', kind: 'addsub', spec: { terms: 5, digits: 2, ops: 'mix', allow: ALL }, count: 5, mode: 'mental' },
      { label: 'Flash 1-digit', kind: 'flash', spec: { count: 8, digits: 1, ms: 1000, ops: 'add' }, count: 5 },
    ],
  },

  // ───────────────────────── 6 · WIZARD ─────────────────────────
  {
    n: 6, key: 'wizard', name: 'Wizard', color: 'purple', tagline: 'Multiplication',
    goal: 'Multiply 2- and 3-digit numbers by 1- and 2-digit numbers on the soroban, and 2-digit by 1-digit in the head.',
    time: '6–8 weeks',
    unlocks: ALL,
    why: 'Multiplication on the soroban is times tables plus adding. You already add fast, so the only new skill is knowing where each small product lands.',
    intro: `<p>Every multiplication breaks into small facts. 34 × 7 is 30 × 7 and 4 × 7. On the soroban you add each small product in the right place, left to right, and the answer builds itself.</p>
      <p>Write every small product as <b>two digits</b>: 3 × 7 is 21, 2 × 4 is 08. The right-hand digit of each product lands in the column of its place value. That is the whole rule.</p>
      <div class="callout warn"><b class="lbl">Before you start</b>Times tables up to 9 × 9 must be instant. The first lesson tests them. If they are not instant, spend a week on that lesson alone.</div>`,
    lessons: [
      {
        key: 'facts', title: 'Times tables: the spell book', minutes: 10,
        teach: `<p>Twenty facts, under a minute, none wrong. If you miss, keep this lesson in your daily quest until you pass it three days in a row.</p>`,
        drill: { kind: 'facts', spec: { maxTable: 9 }, count: 20, target: { acc: 0.95, maxSec: 60 } },
      },
      {
        key: 'mul-2x1', title: '2-digit × 1-digit', minutes: 15,
        teach: `<p>34 × 7. Start with the left digit: 3 × 7 = 21. The 3 is in the tens, so this product is 21 tens: add 2 in the hundreds and 1 in the tens. Next, 4 × 7 = 28: add 2 in the tens and 8 in the ones. Read the answer: 238.</p>
          ${demo(0, '210,28', '34 × 7', '["3 × 7 = 21 → add 21 in hundreds-tens","4 × 7 = 28 → add 28 in tens-ones"]')}
          ${demo(0, '560,42', '86 × 7', '["8 × 7 = 56 → add 56 in hundreds-tens","6 × 7 = 42 → add 42 in tens-ones"]')}
          <p>On your real soroban, keep the problem on paper and only the answer on the beads. Japanese teachers call this the "both-off" method. It is what experts use, and it is exactly how mental multiplication works later.</p>`,
        drill: { kind: 'mul', spec: { aDigits: 2, bDigits: 1 }, count: 8, target: { acc: 0.85 } },
      },
      {
        key: 'mul-3x1', title: '3-digit × 1-digit', minutes: 15,
        teach: `<p>Same rule, one more digit. 386 × 7: 3 × 7 = 21 goes in thousands-hundreds. 8 × 7 = 56 goes in hundreds-tens. 6 × 7 = 42 goes in tens-ones. Answer 2,702.</p>
          ${demo(0, '2100,560,42', '386 × 7', '["3 × 7 = 21 → thousands-hundreds","8 × 7 = 56 → hundreds-tens","6 × 7 = 42 → tens-ones"]')}`,
        drill: { kind: 'mul', spec: { aDigits: 3, bDigits: 1 }, count: 8, target: { acc: 0.85 } },
      },
      {
        key: 'mul-2x2', title: '2-digit × 2-digit', minutes: 20,
        teach: `<p>34 × 27 has four small products. Take the 3 (tens) first: 3 × 2 = 06 in thousands-hundreds, 3 × 7 = 21 in hundreds-tens. Then the 4: 4 × 2 = 08 in hundreds-tens, 4 × 7 = 28 in tens-ones. Answer 918.</p>
          ${demo(0, '600,210,80,28', '34 × 27', '["3 × 2 = 06 → thousands-hundreds","3 × 7 = 21 → hundreds-tens","4 × 2 = 08 → hundreds-tens","4 × 7 = 28 → tens-ones"]')}
          <p>The pattern: each digit of the first number works through every digit of the second, and each step moves one column to the right.</p>`,
        drill: { kind: 'mul', spec: { aDigits: 2, bDigits: 2 }, count: 6, target: { acc: 0.8 } },
      },
      {
        key: 'mul-mental', title: 'Mental: 2-digit × 1-digit', minutes: 12,
        teach: `<p>Now the same on your mental beads. 47 × 6: 4 × 6 = 24 lands in hundreds-tens, 7 × 6 = 42 in tens-ones. Picture 240, then add 42. Say 282.</p>
          <p>Keep the product on the beads, not in words.</p>`,
        drill: { kind: 'mul', spec: { aDigits: 2, bDigits: 1 }, count: 8, mode: 'mental', target: { acc: 0.8 } },
      },
      {
        key: 'mul-3x2', title: '3-digit × 2-digit', minutes: 20,
        teach: `<p>Six small products. 386 × 47: work the 3, then the 8, then the 6, each through the 4 and then the 7. Keep a steady rhythm and the answer appears: 18,142.</p>
          ${demo(0, '12000,2100,3200,560,240,42', '386 × 47', '["3 × 4 = 12","3 × 7 = 21","8 × 4 = 32","8 × 7 = 56","6 × 4 = 24","6 × 7 = 42"]')}`,
        drill: { kind: 'mul', spec: { aDigits: 3, bDigits: 2 }, count: 5, target: { acc: 0.8 } },
      },
      {
        key: 'keep-mental', title: 'Keep the mental beads warm', minutes: 8,
        teach: `<p>Multiplication weeks can let the add-and-subtract picture fade. Five lines of two digits in the head, mixed.</p>`,
        drill: { kind: 'addsub', spec: { terms: 5, digits: 2, ops: 'mix', allow: ALL }, count: 6, mode: 'mental', target: { acc: 0.8 } },
      },
    ],
    boss: {
      title: 'Wizard Boss', desc: 'Facts, then four kinds of multiplication.',
      parts: [
        { title: 'Times tables', desc: '20 facts in a minute.', kind: 'facts', spec: { maxTable: 9 }, count: 20, timeLimit: 60, target: { acc: 0.9 } },
        { title: '3-digit × 1-digit', desc: '6 problems on your soroban.', kind: 'mul', spec: { aDigits: 3, bDigits: 1 }, count: 6, timeLimit: 240, target: { acc: 0.83 } },
        { title: '2-digit × 2-digit', desc: '5 problems on your soroban.', kind: 'mul', spec: { aDigits: 2, bDigits: 2 }, count: 5, timeLimit: 300, target: { acc: 0.8 } },
        { title: 'Mental 2 × 1', desc: '5 problems, no soroban.', kind: 'mul', spec: { aDigits: 2, bDigits: 1 }, count: 5, mode: 'mental', timeLimit: 150, target: { acc: 0.8 } },
      ],
    },
    daily: [
      { label: 'Times tables', kind: 'facts', spec: { maxTable: 9 }, count: 15 },
      { label: '2 × 2 on the soroban', kind: 'mul', spec: { aDigits: 2, bDigits: 2 }, count: 4 },
      { label: 'Mental 2-digit lines', kind: 'addsub', spec: { terms: 5, digits: 2, ops: 'mix', allow: ALL }, count: 5, mode: 'mental' },
    ],
  },

  // ───────────────────────── 7 · CHAMPION ─────────────────────────
  {
    n: 7, key: 'champion', name: 'Champion', color: 'red', tagline: 'Division',
    goal: 'Divide by 1- and 2-digit numbers on the soroban, divide by 1-digit numbers in the head, and start 3-digit mental sums.',
    time: '6–8 weeks',
    unlocks: ALL,
    why: 'Division is multiplication run backwards: guess a digit, multiply, subtract, repeat. Everything you need is already in your hands.',
    intro: `<p>952 ÷ 7. Look at the left: how many 7s fit in 9? One. Write 1 in the quotient, take 7 × 1 = 7 from the 9. Two left. With the next digit that makes 25. How many 7s in 25? Three: write 3, take away 21. Four left. With the next digit, 42. Six 7s. Answer 136.</p>
      <p>On the soroban, set the dividend on the right. Build the quotient on rods to the left, leaving a gap. Each step: guess, multiply, subtract. If a guess is too big, take one off the quotient and add the divisor back.</p>`,
    lessons: [
      {
        key: 'div-2x1', title: 'Divide 2-digit by 1-digit', minutes: 15,
        teach: `<p>84 ÷ 7. How many 7s in 8? One, remainder 1. Then 14 ÷ 7 = 2. Answer 12.</p>
          ${demo(84, '-70,-14', '84 ÷ 7', '["7 goes into 8 once → quotient 1, take away 70","7 goes into 14 twice → quotient 2, take away 14. Beads read 0, quotient 12"]')}
          <p>In the drill the beads hold the dividend, and you subtract as you go. Type the quotient.</p>`,
        drill: { kind: 'div', spec: { qDigits: 1, dDigits: 1 }, count: 8, target: { acc: 0.85 } },
      },
      {
        key: 'div-3x1', title: 'Divide 3-digit by 1-digit', minutes: 15,
        teach: `${demo(952, '-700,-210,-42', '952 ÷ 7', '["9 ÷ 7 → 1, take away 700","25 ÷ 7 → 3, take away 210","42 ÷ 7 → 6, take away 42. Quotient 136"]')}
          <p>Sometimes a digit does not fit at all. 426 ÷ 6: 6 does not go into 4, so start with 42 ÷ 6 = 7, then 6 ÷ 6 = 1. Answer 71.</p>`,
        drill: { kind: 'div', spec: { qDigits: 2, dDigits: 1 }, count: 8, target: { acc: 0.85 } },
      },
      {
        key: 'div-rem', title: 'Remainders', minutes: 12,
        teach: `<p>When nothing more fits, what is left on the beads is the remainder. 950 ÷ 7 = 135 remainder 5. In the drill, give the whole-number part of the answer.</p>`,
        drill: { kind: 'div', spec: { qDigits: 2, dDigits: 1, remainder: true }, count: 8, target: { acc: 0.85 } },
      },
      {
        key: 'div-by-2', title: 'Divide by 2-digit numbers', minutes: 20,
        teach: `<p>2,752 ÷ 32. Estimate with the first digits: 27 ÷ 3 is about 8, so try 8. 32 × 8 = 256, take 256 from 275: 19 left. Bring down the 2: 192. Try 6: 32 × 6 = 192. Done: 86.</p>
          ${demo(2752, '-2560,-192', '2,752 ÷ 32', '["27 ÷ 3 ≈ 8 → try 8: 32 × 8 = 256, take away 2560","192 ÷ 32 = 6 → take away 192. Quotient 86"]')}
          <p>If the guess is too big, you will not be able to subtract. Lower the guess by one and try again. That is normal, not a mistake.</p>`,
        drill: { kind: 'div', spec: { qDigits: 2, dDigits: 2 }, count: 6, target: { acc: 0.8 } },
      },
      {
        key: 'div-mental', title: 'Mental: divide by 1-digit', minutes: 12,
        teach: `<p>Guess, multiply, subtract, on the mental beads. 91 ÷ 7: 7 goes into 9 once, 2 left, 21 ÷ 7 = 3. Say 13.</p>`,
        drill: { kind: 'div', spec: { qDigits: 2, dDigits: 1 }, count: 8, mode: 'mental', target: { acc: 0.8 } },
      },
      {
        key: 'mental-3d', title: 'Mental: three 3-digit numbers', minutes: 10,
        teach: `<p>Three rods in the picture now. This is the edge of what most people can hold. Three lines of three digits, adding. Slow is fine. Correct is the target.</p>`,
        drill: { kind: 'addsub', spec: { terms: 3, digits: 3, ops: 'add', allow: ALL }, count: 6, mode: 'mental', target: { acc: 0.75 } },
      },
      {
        key: 'flash-2d', title: 'Flash: 2-digit numbers', minutes: 8,
        teach: `<p>Two-digit flash. Eight numbers at 0.7 seconds. The numbers go by faster than you can say them, which is the point: words are too slow, the picture is not.</p>`,
        drill: { kind: 'flash', spec: { count: 8, digits: 2, ms: 700, ops: 'add' }, count: 6, target: { acc: 0.75 } },
      },
    ],
    boss: {
      title: 'Champion Boss', desc: 'Division on the beads and in the head, plus 2-digit flash.',
      parts: [
        { title: '3-digit ÷ 1-digit', desc: '6 problems on your soroban.', kind: 'div', spec: { qDigits: 2, dDigits: 1, remainder: true }, count: 6, timeLimit: 240, target: { acc: 0.83 } },
        { title: '4-digit ÷ 2-digit', desc: '5 problems on your soroban.', kind: 'div', spec: { qDigits: 2, dDigits: 2 }, count: 5, timeLimit: 300, target: { acc: 0.8 } },
        { title: 'Mental division', desc: '5 problems, no soroban.', kind: 'div', spec: { qDigits: 2, dDigits: 1 }, count: 5, mode: 'mental', timeLimit: 150, target: { acc: 0.8 } },
        { title: 'Flash 2-digit', desc: '5 rounds of eight numbers at 0.7 s.', kind: 'flash', spec: { count: 8, digits: 2, ms: 700, ops: 'add' }, count: 5, timeLimit: 200, target: { acc: 0.8 } },
      ],
    },
    daily: [
      { label: 'Division on the soroban', kind: 'div', spec: { qDigits: 2, dDigits: 2 }, count: 4 },
      { label: 'Mental 3-digit', kind: 'addsub', spec: { terms: 3, digits: 3, ops: 'add', allow: ALL }, count: 4, mode: 'mental' },
      { label: 'Flash 2-digit', kind: 'flash', spec: { count: 8, digits: 2, ms: 700, ops: 'add' }, count: 5 },
    ],
  },

  // ───────────────────────── 8 · PRODIGY ─────────────────────────
  {
    n: 8, key: 'prodigy', name: 'Prodigy', color: 'pink', tagline: 'Mental mastery',
    goal: 'Ten 3-digit lines in the head, 3-digit flash, and mental 2 × 2 multiplication. This is expert-level mental arithmetic.',
    time: '3–4 months',
    unlocks: ALL,
    why: 'At this stage the physical soroban becomes a warm-up tool. Every drill is mental. Ten mixed 3-digit lines in the head is the format of the Japanese 1st-kyu mental calculation exam, the top grade below dan.',
    intro: `<p>Nothing new to learn. Everything to make faster and bigger. Expect plateaus that last two weeks and then break overnight. Keep the sessions short and daily.</p>`,
    lessons: [
      { key: 'p-3d-5', title: 'Mental: five 3-digit lines, mixed', minutes: 10, teach: `<p>Five lines, three digits, plus and minus. Three rods, carries running between them, all in the picture.</p>`, drill: { kind: 'addsub', spec: { terms: 5, digits: 3, ops: 'mix', allow: ALL }, count: 5, mode: 'mental', target: { acc: 0.8 } } },
      { key: 'p-3d-10', title: 'Mental: ten 3-digit lines', minutes: 12, teach: `<p>The classic exam format: the Japanese 1st-kyu mental test is twenty of these in twelve minutes. Under two minutes a problem is the goal here. Under forty seconds is exam speed.</p>`, drill: { kind: 'addsub', spec: { terms: 10, digits: 3, ops: 'mix', allow: ALL }, count: 4, mode: 'mental', target: { acc: 0.75 } } },
      { key: 'p-flash-3', title: 'Flash: 3-digit numbers', minutes: 8, teach: `<p>Five 3-digit numbers at one second each. Then eight. Then faster.</p>`, drill: { kind: 'flash', spec: { count: 5, digits: 3, ms: 1000, ops: 'add' }, count: 6, target: { acc: 0.75 } } },
      { key: 'p-flash-3b', title: 'Flash: ten 3-digit numbers', minutes: 8, teach: `<p>Ten numbers at 0.8 seconds. Breathe. Let each number land.</p>`, drill: { kind: 'flash', spec: { count: 10, digits: 3, ms: 800, ops: 'add' }, count: 6, target: { acc: 0.75 } } },
      { key: 'p-mul-2x2', title: 'Mental: 2-digit × 2-digit', minutes: 12, teach: `<p>Four small products added on the mental beads, left to right, exactly as on the soroban. 34 × 27: 06, 21, 08, 28 landing one column right each step. 918.</p>`, drill: { kind: 'mul', spec: { aDigits: 2, bDigits: 2 }, count: 6, mode: 'mental', target: { acc: 0.75 } } },
      { key: 'p-mul-3x1', title: 'Mental: 3-digit × 1-digit', minutes: 10, teach: `<p>Three small products. 386 × 7 = 2,702 on the beads in your head.</p>`, drill: { kind: 'mul', spec: { aDigits: 3, bDigits: 1 }, count: 6, mode: 'mental', target: { acc: 0.8 } } },
      { key: 'p-div', title: 'Mental: 3-digit ÷ 1-digit', minutes: 10, teach: `<p>Guess, multiply, subtract, on the picture. 952 ÷ 7 = 136.</p>`, drill: { kind: 'div', spec: { qDigits: 2, dDigits: 1 }, count: 6, mode: 'mental', target: { acc: 0.8 } } },
      {
        key: 'p-decimals', title: 'Decimals and money', minutes: 10,
        teach: `<p>Decimals change nothing on the beads. Pick a rod to be the ones (use one with a dot on the beam) and the rods to its right are tenths and hundredths. $12.75 + $3.50 is 1275 + 350 on the beads with the dot two rods from the right: 1625, read as $16.25.</p>
          <p>Practise with real shopping receipts. Add the column in your head before the till does.</p>`,
        drill: { kind: 'addsub', spec: { terms: 5, digits: 4, ops: 'add', allow: ALL }, count: 5, mode: 'mental', target: { acc: 0.75 } },
      },
      {
        key: 'p-negative', title: 'Below zero', minutes: 10,
        teach: `<p>Soroban users handle a total that drops below zero by borrowing from an imaginary rod on the far left. 20 − 35: borrow 100, giving 120 − 35 = 85. The beads show 85, and because you borrowed 100 the true answer is 85 − 100 = −15. Read it as "100 minus 85, negative".</p>
          <p>Try a few on paper first, then in the head. This is rare in exams and useful in life.</p>`,
        drill: { kind: 'addsub', spec: { terms: 6, digits: 2, ops: 'mix', allow: ALL }, count: 5, mode: 'mental', target: { acc: 0.8 } },
      },
    ],
    boss: {
      title: 'Prodigy Boss', desc: 'All mental. This is the one to film.',
      parts: [
        { title: 'Ten 3-digit lines', desc: '4 problems, 6 minutes.', kind: 'addsub', spec: { terms: 10, digits: 3, ops: 'mix', allow: ALL }, count: 4, mode: 'mental', timeLimit: 360, target: { acc: 0.75 } },
        { title: 'Flash 3-digit', desc: '5 rounds, five numbers at 1 s.', kind: 'flash', spec: { count: 5, digits: 3, ms: 1000, ops: 'add' }, count: 5, timeLimit: 200, target: { acc: 0.8 } },
        { title: 'Mental 2 × 2', desc: '5 problems.', kind: 'mul', spec: { aDigits: 2, bDigits: 2 }, count: 5, mode: 'mental', timeLimit: 240, target: { acc: 0.8 } },
        { title: 'Mental ÷', desc: '5 problems, 3-digit ÷ 1-digit.', kind: 'div', spec: { qDigits: 2, dDigits: 1 }, count: 5, mode: 'mental', timeLimit: 150, target: { acc: 0.8 } },
      ],
    },
    daily: [
      { label: 'Ten 3-digit lines (mental)', kind: 'addsub', spec: { terms: 10, digits: 3, ops: 'mix', allow: ALL }, count: 3, mode: 'mental' },
      { label: 'Flash 3-digit', kind: 'flash', spec: { count: 8, digits: 3, ms: 800, ops: 'add' }, count: 5 },
      { label: 'Mental 2 × 2', kind: 'mul', spec: { aDigits: 2, bDigits: 2 }, count: 4, mode: 'mental' },
    ],
  },

  // ───────────────────────── 9 · GRANDMASTER ─────────────────────────
  {
    n: 9, key: 'grandmaster', name: 'Grandmaster', color: 'teal', tagline: 'Dan level',
    goal: 'Ten 3-digit numbers flashed at half a second, four-digit mental sums, 3 × 2 and 4 ÷ 2 in the head.',
    time: '4–6 months',
    unlocks: ALL,
    why: 'These targets sit around the Japanese dan grades, where children typically arrive after four to six years of club training. Daily short sessions and a clean technique get there faster than long weekly ones.',
    intro: `<p>From here the course gives you drills and targets, not lessons. The technique is finished. What grows is the size and speed of the picture.</p>`,
    lessons: [
      { key: 'g-flash-07', title: 'Flash: ten 3-digit at 0.7 s', minutes: 8, teach: `<p>Ten numbers, 0.7 seconds each.</p>`, drill: { kind: 'flash', spec: { count: 10, digits: 3, ms: 700, ops: 'add' }, count: 6, target: { acc: 0.75 } } },
      { key: 'g-flash-05', title: 'Flash: ten 3-digit at 0.5 s', minutes: 8, teach: `<p>Half a second. At this speed the eyes stop reading digits and start seeing bead shapes.</p>`, drill: { kind: 'flash', spec: { count: 10, digits: 3, ms: 500, ops: 'add' }, count: 6, target: { acc: 0.75 } } },
      { key: 'g-4d', title: 'Mental: 4-digit lines', minutes: 12, teach: `<p>Four rods. Research suggests this is near the limit of visual working memory, so it may take months to feel stable. Five lines, mixed.</p>`, drill: { kind: 'addsub', spec: { terms: 5, digits: 4, ops: 'mix', allow: ALL }, count: 4, mode: 'mental', target: { acc: 0.75 } } },
      { key: 'g-mul-3x2', title: 'Mental: 3-digit × 2-digit', minutes: 12, teach: `<p>Six small products on the picture. Steady rhythm.</p>`, drill: { kind: 'mul', spec: { aDigits: 3, bDigits: 2 }, count: 5, mode: 'mental', target: { acc: 0.75 } } },
      { key: 'g-div-4x2', title: 'Mental: 4-digit ÷ 2-digit', minutes: 12, teach: `<p>Estimate, multiply, subtract, twice.</p>`, drill: { kind: 'div', spec: { qDigits: 2, dDigits: 2 }, count: 5, mode: 'mental', target: { acc: 0.75 } } },
      { key: 'g-listen', title: 'Listening: ten 3-digit numbers', minutes: 8, teach: `<p>Numbers read aloud, one per second. Exam-style dictation.</p>`, drill: { kind: 'addsub', spec: { terms: 10, digits: 3, ops: 'mix', allow: ALL, rate: 1.2, gapMs: 250 }, count: 4, mode: 'spoken', target: { acc: 0.75 } } },
    ],
    boss: {
      title: 'Grandmaster Boss', desc: 'Dan-level targets.',
      parts: [
        { title: 'Flash ten 3-digit at 0.5 s', desc: '5 rounds.', kind: 'flash', spec: { count: 10, digits: 3, ms: 500, ops: 'add' }, count: 5, timeLimit: 200, target: { acc: 0.8 } },
        { title: 'Mental 4-digit', desc: '4 problems, five lines each.', kind: 'addsub', spec: { terms: 5, digits: 4, ops: 'mix', allow: ALL }, count: 4, mode: 'mental', timeLimit: 300, target: { acc: 0.75 } },
        { title: 'Mental 3 × 2', desc: '4 problems.', kind: 'mul', spec: { aDigits: 3, bDigits: 2 }, count: 4, mode: 'mental', timeLimit: 300, target: { acc: 0.75 } },
        { title: 'Mental 4 ÷ 2', desc: '4 problems.', kind: 'div', spec: { qDigits: 2, dDigits: 2 }, count: 4, mode: 'mental', timeLimit: 300, target: { acc: 0.75 } },
      ],
    },
    daily: [
      { label: 'Flash ten 3-digit at 0.5 s', kind: 'flash', spec: { count: 10, digits: 3, ms: 500, ops: 'add' }, count: 5 },
      { label: 'Mental 4-digit', kind: 'addsub', spec: { terms: 5, digits: 4, ops: 'mix', allow: ALL }, count: 3, mode: 'mental' },
      { label: 'Mental 3 × 2', kind: 'mul', spec: { aDigits: 3, bDigits: 2 }, count: 3, mode: 'mental' },
    ],
  },

  // ───────────────────────── 10 · LEGEND ─────────────────────────
  {
    n: 10, key: 'legend', name: 'Legend', color: 'blue', tagline: 'Beyond prodigy',
    goal: 'Fifteen 3-digit numbers flashed at 0.3 seconds or faster, and 3 × 3 multiplication in the head. Competition level.',
    time: 'open-ended',
    unlocks: ALL,
    why: 'The world record for fifteen 3-digit numbers is about 1.6 seconds in total. Nobody needs to get there. But the ladder has no top, and that is the fun of it.',
    intro: `<p>There is no boss you must beat to finish. The Legend stage is a set of targets you chase for as long as you enjoy it. Each one you clear goes on the chart.</p>`,
    lessons: [
      { key: 'l-flash-04', title: 'Flash: fifteen 3-digit at 0.4 s', minutes: 8, teach: `<p>Fifteen numbers. The number of numbers matters less than the speed, once the picture is stable.</p>`, drill: { kind: 'flash', spec: { count: 15, digits: 3, ms: 400, ops: 'add' }, count: 5, target: { acc: 0.75 } } },
      { key: 'l-flash-03', title: 'Flash: fifteen 3-digit at 0.3 s', minutes: 8, teach: `<p>0.3 seconds. National-competition speed.</p>`, drill: { kind: 'flash', spec: { count: 15, digits: 3, ms: 300, ops: 'add' }, count: 5, target: { acc: 0.75 } } },
      { key: 'l-flash-02', title: 'Flash: fifteen 3-digit at 0.2 s', minutes: 8, teach: `<p>Faster than a blink is long. The record is around 0.1 seconds a number.</p>`, drill: { kind: 'flash', spec: { count: 15, digits: 3, ms: 200, ops: 'add' }, count: 5, target: { acc: 0.75 } } },
      { key: 'l-mul-3x3', title: 'Mental: 3-digit × 3-digit', minutes: 15, teach: `<p>Nine small products. Keep the rhythm and the landing columns exact.</p>`, drill: { kind: 'mul', spec: { aDigits: 3, bDigits: 3 }, count: 4, mode: 'mental', target: { acc: 0.75 } } },
      { key: 'l-mix', title: 'Mental: fifteen 3-digit lines', minutes: 12, teach: `<p>Fifteen lines, plus and minus. Exam marathon.</p>`, drill: { kind: 'addsub', spec: { terms: 15, digits: 3, ops: 'mix', allow: ALL }, count: 3, mode: 'mental', target: { acc: 0.67 } } },
    ],
    boss: {
      title: 'Legend Boss', desc: 'For the record.',
      parts: [
        { title: 'Flash fifteen 3-digit at 0.3 s', desc: '5 rounds.', kind: 'flash', spec: { count: 15, digits: 3, ms: 300, ops: 'add' }, count: 5, timeLimit: 240, target: { acc: 0.8 } },
        { title: 'Mental 3 × 3', desc: '4 problems.', kind: 'mul', spec: { aDigits: 3, bDigits: 3 }, count: 4, mode: 'mental', timeLimit: 360, target: { acc: 0.75 } },
      ],
    },
    daily: [
      { label: 'Flash fifteen 3-digit', kind: 'flash', spec: { count: 15, digits: 3, ms: 300, ops: 'add' }, count: 5 },
      { label: 'Mental 3 × 3', kind: 'mul', spec: { aDigits: 3, bDigits: 3 }, count: 3, mode: 'mental' },
    ],
  },
];

export const stageByN = n => STAGES.find(s => s.n === Number(n));
export const lessonKey = (stage, lesson) => `s${stage.n}.${lesson.key}`;

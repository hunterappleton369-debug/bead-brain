// coach.js — the little tips that fill the gaps: what you need, what to do with your hands,
// what to say when a child gets stuck. Plain words, one idea each.

/** Plain-English "by the end of this stage your child can…" for the plan and stage pages. */
export const STAGE_PLAIN = {
  sprout: { can: 'Read any number off the beads in a glance, and add or take away whenever the beads are free.', feels: 'The beads stop being a toy and start being numbers.' },
  explorer: { can: 'Use the "make 5" trick to add and subtract two-digit numbers on the beads.', feels: 'First real technique. The hands start to move without thinking.' },
  apprentice: { can: 'Carry and borrow between columns with the "make 10" trick. Five-line sums on the beads.', feels: 'The abacus is now faster than fingers and paper.' },
  adept: { can: 'Every bead move is automatic. Three-digit sums, ten rows long. The first real sums in the head.', feels: 'No new rules after this. Everything from here is speed and the picture.' },
  ace: { can: 'Fast hands on the beads, five two-digit numbers added in the head, a first flash round and a first Bead Score.', feels: 'This is when other people start to notice.' },
  wizard: { can: 'Multiply on the beads, and two-digit times one-digit in the head.', feels: 'Times tables turn into a tool instead of a chore.' },
  champion: { can: 'Divide on the beads and in the head. Three-digit sums in the head begin.', feels: 'All four operations. Most adults cannot do this.' },
  prodigy: { can: 'Ten three-digit numbers added in the head. Three-digit flash. Two-digit times two-digit mentally.', feels: 'Expert-level mental math. The one to film.' },
  grandmaster: { can: 'Ten three-digit numbers flashed at half a second each. Four-digit sums in the head.', feels: 'Dan-level targets, the grades Japanese club kids reach after years.' },
  legend: { can: 'Fifteen numbers flashed at 0.3 seconds. Three-digit times three-digit in the head.', feels: 'Competition speed. There is no top to this ladder.' },
};

/** What a session needs, from the drill. */
export function needs(drill) {
  const out = [];
  const mental = drill.mode === 'mental' || drill.kind === 'flash';
  const screen = ['read', 'set', 'single', 'twocol'].includes(drill.kind);
  if (mental) out.push({ icon: 'brain', text: 'No abacus, no paper. Head only.' });
  else if (screen) out.push({ icon: 'soroban', text: 'The screen abacus below' });
  else out.push({ icon: 'soroban', text: 'Your real abacus on the table' });
  if (drill.mode === 'spoken') out.push({ icon: 'eye', text: 'Sound on. Numbers are read aloud.' });
  out.push({ icon: 'parent', text: 'A grown-up sitting beside' });
  return out;
}

/** One coach tip for the drill about to run. Short enough to read in two seconds. */
export function coachTip(drill, stage) {
  const mental = drill.mode === 'mental';
  switch (drill.kind) {
    case 'read': return drill.spec?.peekMs ? 'Say the number out loud before it vanishes. Shapes, not counting.' : 'Ones first, then tens, then hundreds. Say the whole number out loud.';
    case 'set': return 'Thumb pushes beads up. Index finger pushes them down. Start from the left.';
    case 'single': case 'twocol': return 'Every column, ask the same question: free beads, or friend?';
    case 'flash': return 'Do not say the numbers. Breathe out as each one lands and let the beads do the work.';
    case 'facts': return 'Fast and loose. A wrong answer costs nothing here. Speed is the point.';
    case 'mul': return mental ? 'Picture the beads. Each small product lands one column to the right.' : 'Times table first, then add it in. Left to right, like always.';
    case 'div': return mental ? 'Guess, multiply, take away. On the picture, not on paper.' : 'Guess the digit, multiply, take away. If it will not fit, guess one smaller.';
    case 'addsub':
      if (drill.mode === 'spoken') return 'Eyes closed is fine. Move the beads in your head as each number is read.';
      if (mental) return 'Put the abacus away. Picture one empty rod. If the picture fades, tap the table with thumb and finger.';
      return 'Work left to right. Say each move out loud. Finish the problem before you check.';
  }
  return 'Slow is fine. Correct first, fast later.';
}

/** The "stuck?" help for a lesson, from the formulas it allows. */
export function stuckHelp(drill) {
  const allow = (drill.spec?.allow || []).join(' ');
  const parts = [];
  if (drill.kind === 'read' || drill.kind === 'set') parts.push('A bead only counts when it touches the middle beam. The top bead is worth 5, each bottom bead is worth 1.');
  if (/small/.test(allow)) parts.push('Small friends make 5: 1 and 4, 2 and 3. Cannot add 3? Add 5 and take away 2.');
  if (/big/.test(allow)) parts.push('Big friends make 10: 1 and 9, 2 and 8, 3 and 7, 4 and 6, 5 and 5. Cannot add 8? Take away 2 and carry 1 to the left.');
  if (/combo/.test(allow)) parts.push('Both friends at once: cannot add 7 and the heaven bead is already down? Take away 5, add 2, carry 1.');
  if (drill.kind === 'flash') parts.push('If a round falls apart, let it go. Start fresh on the next one.');
  if (drill.mode === 'mental') parts.push('If the picture collapses into words, do the same sum once on the real abacus, close your eyes, and replay it.');
  if (!parts.length) parts.push('Press Hint during the drill to see the move. Press Show me after a miss to watch the beads do it.');
  return parts;
}

/** Parent one-liners by stage. */
export const PARENT_LINE = {
  sprout: 'Say every number out loud with your child. Stop while it is still fun.',
  explorer: 'When they hesitate, ask "free beads, or friend?" and wait. Do not touch the beads.',
  apprentice: 'Carries feel backwards for a week. Insist on left to right every time.',
  adept: 'Praise the formula said out loud more than the right answer.',
  ace: 'Write the day\'s time on the fridge. Kids love watching a number fall.',
  wizard: 'Times tables five minutes a day for two weeks before the first multiply lesson pays off.',
  champion: 'Division is slow at first. Accuracy, then speed.',
  prodigy: 'Plateaus last two weeks and break overnight. Keep the daily drill at the same size.',
  grandmaster: 'Short and daily beats long and weekly, more than ever.',
  legend: 'Film it. Then show the grandparents.',
};

/** First-steps checklist for a brand-new profile. */
export const FIRST_STEPS = [
  { key: 'soroban', text: 'Get a 13-rod abacus (search "13 rod abacus", about the price of a pizza). Until it arrives, the screen abacus works for the first lessons.' },
  { key: 'spot', text: 'Pick a spot and a time. The kitchen table after breakfast works. Fifteen minutes.' },
  { key: 'lesson', text: 'Do the first lesson together: Hold it, clear it, move it. Ten minutes.' },
];

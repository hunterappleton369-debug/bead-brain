// Stage 2 · Explorer — hand-written words.
export default {
  standfirst: 'Eight lessons on the first real trick: what to do when a rod has no free bead. Small friends make 5, and they turn a stuck rod into a quick trade.',
  opener: [
    'A rod has only four bottom beads. So what happens at 4 + 1, when there is no fifth bead to push? You trade. Bring the top bead down for 5, and give back what you did not need. That trade is a small friend.',
    'Two numbers that make 5 are small friends: 1 and 4, 2 and 3. There are eight small-friend moves, four to add and four to take away. This stage teaches them one pair at a time, then mixes them into 2-digit sums, then adds a clock.',
    'It ends with the first sums done in the head, on one rod, with free beads only.',
  ],
  formulaTable: ['small+', 'small-'],
  drillTypes: [
    ['One rod', 'A start number and one digit. Your child decides: free beads, or friend? Three in every ten are free, on purpose.'],
    ['Written', 'Columns of four or five 2-digit numbers on the soroban, left to right.'],
    ['Timed', 'The speed round. Same columns, with the time written down each day.'],
    ['Dictation', 'You read a column out loud and your child works it on the beads with nothing written.'],
    ['Mental', 'Three small numbers in the head, free beads only.'],
  ],
  accuracy: 'Every one-rod drill passes at 9 out of 10. The speed round is the first page with a clock, and even there the rule holds: beat the time only while 8 of 10 stay right. If the score drops, slow down. The clock waits.',
  kyu: 'Explorer is still the Foundation level in UCMAS terms, the part of the course where the formulas are learned one family at a time. It sits before 10th kyu on the Japanese soroban ladder. On the Bead Score, the mental lesson at the end is the first rungs of the ladder: small numbers in the head, no crossing ten.',
  questIntro: 'Three short cards. On a Friday, do all three. On a tired day, one is enough to keep the streak.',
  quests: [
    'Ten one-rod moves that mix plus and minus.',
    'Five columns of four 2-digit numbers.',
    'Five quick sums in the head.',
  ],
  bossReady: 'Take the boss when all eight lessons are passed and the speed round has held 8 of 10 for two days running. Part 1 maps to Lessons 2.1 to 2.5, part 2 to Lessons 2.6 and 2.7, part 3 to Lesson 2.8.',
  software: [
    'Small friends are where the trainer earns its keep. Each move has a short animation: the top bead comes down, the friend beads go up, in the order the hand should do them. Watching it twice saves a lot of explaining.',
    'The drills also grade as your child goes and offer a Hint button that shows the move. On paper, you are the Hint button, and the one hint is a question: "free beads, or friend?"',
    'The trainer also keeps your child\'s best result on each drill, so a new best shows up on the screen as soon as it happens.',
  ],
  lessons: {
    'sf-1-4': {
      can: 'add 1 to a rod showing 4, and add 4 when fewer than four beads are free, using the friend move.',
      move: [
        'Set 4 on a rod. Now add 1. All four bottom beads are already up. There is no free bead.',
        'So trade. Bring the top bead down. That is plus 5. But you only wanted plus 1, so push four bottom beads away. Plus 5, take away 4. That is the first small friend.',
        'Plus 4 works the same way when there are not four free beads. Bring the top bead down, take one bead away.',
        'The drill mixes in free-bead moves on purpose. Your child has to decide every time. That decision is the skill.',
      ],
      exLead: 'Start at 3. Add 4, then 1.',
      ex: { t: 'calc', start: 3, terms: [4, 1] },
      parent: 'When your child stalls, ask "free beads, or friend?" and then wait longer than feels right.',
    },
    'sf-2-3': {
      can: 'use the friend moves for plus 2 and plus 3.',
      move: [
        'Same trade, new pair. Plus 2 when fewer than two beads are free: top bead down, take three away. Plus 3 when fewer than three are free: top bead down, take two away.',
        '2 and 3 are friends because they make 5. That is all your child needs to remember. If you know the friend, you know the move.',
        'Say it out loud each time: "plus 3, add 5, take away 2." The words fade on their own once the hand knows the way.',
      ],
      exLead: 'Start at 4. Add 3, then 2.',
      ex: { t: 'calc', start: 4, terms: [3, 2] },
      parent: 'Ask your child to tell you who the friend of 3 is, and let them teach you the move.',
    },
    'sf-add-2d': {
      can: 'add columns of 2-digit numbers that need small friends on either rod.',
      move: [
        'Now the friends turn up inside real sums. Each rod gets the same question, tens first: free beads, or friend?',
        'Nothing new happens on any rod. The only new thing is that the trade can come on the tens rod, the ones rod, or both, in the same line.',
        'Use the real soroban. Say each move as you go. Write only the final total.',
      ],
      exLead: 'Start at 23. Add 32, then 14.',
      ex: { t: 'calc', start: 23, terms: [32, 14] },
      parent: 'Listen for the move said out loud on every rod, because the words are how you know the hand is thinking.',
    },
    'sf-sub-1-4': {
      can: 'take away 1 from a rod showing 5, and take away 4 when four bottom beads are not there.',
      move: [
        'Set 5. Now take away 1. The only bead on the beam is the top bead. There is no bottom bead to remove.',
        'Trade the other way. Push the top bead up. That is minus 5. You only wanted minus 1, so give back 4: push four bottom beads up. Minus 5, add 4.',
        'Minus 4 is the same with a different friend. Top bead up, one bead back.',
      ],
      exLead: 'Start at 5. Take away 1, then 4.',
      ex: { t: 'calc', start: 5, terms: [-1, -4] },
      parent: 'Take-aways feel harder than adds for a few days, so expect a slower page and say nothing about it.',
    },
    'sf-sub-2-3': {
      can: 'use the friend moves for minus 2 and minus 3.',
      move: [
        'Minus 2 is top bead up, three back. Minus 3 is top bead up, two back. Same move, different friend.',
        'By now the pattern is plain. To add with a friend, the top bead comes down and friends go away. To take away with a friend, the top bead goes up and friends come back.',
      ],
      exLead: 'Start at 6. Take away 2, then 3.',
      ex: { t: 'calc', start: 6, terms: [-2, -3] },
      parent: 'If the top bead moves the wrong way, ask "adding or taking away?" and let your child fix it.',
    },
    'sf-mix': {
      can: 'work 4-line columns of 2-digit numbers that mix plus and minus, using all eight small friends.',
      move: [
        'All eight friends in one drill. Plus and minus mixed, two digits, four lines.',
        'One rule is still missing: what to do when a rod goes past 9 or below 0. That is Stage 3. None of these sums need it, so if a rod looks like it will overflow, check the move again.',
        'This is the page to slow down on. Fast and wrong teaches the wrong move. Slow and right teaches the right one.',
      ],
      exLead: 'Start at 41. Add 14, then take away 23.',
      ex: { t: 'calc', start: 41, terms: [14, -23] },
      parent: 'If a rod looks like it will spill past 9, ask your child to check the move again before you say anything.',
    },
    'speed-sf': {
      can: 'work ten 5-line columns with small friends inside the time, with 8 or more right.',
      move: [
        'Accuracy first, then speed. This is the first drill with a clock. Ten columns, five lines each.',
        'Time the whole sheet. Write the time at the top. Do the same sheet tomorrow and try to beat it, but only while 8 or more stay right. A faster time with 7 right does not count.',
        'Speed comes from the hand, not from rushing. Fingers stay close to the beads. Eyes read the next line while the hand finishes the last.',
      ],
      parent: 'Write each day\'s time on the fridge, because children love watching a number fall.',
    },
    'mental-1': {
      can: 'add three small numbers in the head on a pictured rod, free beads only.',
      move: [
        'Put the soroban away. Picture one empty rod. Add the numbers on the beads in your head.',
        'These sums use free beads only, so there is nothing tricky. The only job is to keep the picture.',
        'If the picture fades, tap the table with thumb and index finger as if the beads were there. Moving the fingers keeps the picture alive. Studies of mental abacus users show the same thing: stop the hands and the sums slow down.',
      ],
      exLead: 'Picture an empty rod. Add 3, then 5, then 1.',
      ex: { t: 'calc', start: 0, terms: [3, 5, 1] },
      parent: 'Put the soroban out of sight, and say only "yes" or "try again" at the end.',
    },
  },
};

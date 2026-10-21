// Stage 6 · Wizard — hand-written words.
export default {
  standfirst: 'Seven lessons on times on the soroban. It is times tables plus adding, and your child already adds fast. The one new skill is knowing where each small answer lands.',
  opener: [
    'Every times problem breaks into small facts. 34 × 7 is 3 tens times 7 and 4 ones times 7. On the soroban you add each small answer in its place, left to right, and the full answer builds itself on the beads.',
    'Write every small answer as two digits: 3 × 7 is 21, and 2 × 4 is 08. The right-hand digit lands on the rod of its place. The left-hand digit lands one rod to the left. That is the whole rule.',
    'Before any of that, the times tables up to 9 × 9 must be instant. The first lesson checks them. If they are not instant yet, spend a week on that lesson alone. It pays for itself in every lesson after.',
  ],
  drillTypes: [
    ['Times tables', 'Twenty facts against the clock, every day until they are instant.'],
    ['Written', 'The problem stays on paper and only the answer goes on the beads. 2-digit and 3-digit numbers times 1-digit and 2-digit numbers.'],
    ['Mental', '2-digit times 1-digit in the head, and five 2-digit lines to keep the adding picture sharp.'],
  ],
  accuracy: 'The times tables are the one place where speed is the target from day one: twenty facts in a minute, none wrong. Everywhere else the rule is the same as always. A wrong small answer in the right place is still a wrong answer, so check the landing rods before the speed.',
  kyu: 'Wizard and Champion are the Construction level in our map to UCMAS. The Japanese soroban exams include times and divide papers, and the 1st kyu exam has sixty of those problems. On the trainer\'s Times ladder, this stage covers rungs 1, 2, 3, 5 and 7: tables, then 2-digit times 1-digit in the head, then 3-digit times 1-digit, then 2-digit times 2-digit.',
  questIntro: 'Three cards: fifteen facts, four 2 × 2 problems on the beads, and five head sums so the adding picture does not fade.',
  quests: [
    'Fifteen times-table facts, timed.',
    'Four 2-digit times 2-digit problems on the soroban.',
    'Five head sums, five 2-digit lines each.',
  ],
  bossReady: 'Take the boss when the tables pass three days in a row and every lesson is passed. Part 1 maps to Lesson 6.1. Part 2 maps to 6.3. Part 3 maps to 6.4. Part 4 maps to 6.5.',
  software: [
    'The trainer animates each small answer landing on its rods, which is the part of this stage words explain worst. It also runs the Times ladder, a second Bead Score with ten rungs from tables to 3-digit times 3-digit, and puts it on its own age chart.',
    'The paper pages carry the same problems and the same order. The trainer is there for the landing animation and the second chart.',
  ],
  lessons: {
    facts: {
      can: 'say any times-table fact up to 9 × 9 without counting, twenty in a minute.',
      move: [
        'Twenty facts, under a minute, none wrong. This is the spell book every later lesson reads from.',
        'If a fact is slow, it goes on a card. Five minutes a day on the cards, for two weeks, is the usual cost. Most children have a few stubborn ones.',
        'Keep this lesson in the Friday quest until it passes three days in a row.',
      ],
      exLead: 'Four facts to say out loud, fast.',
      ex: { t: 'facts', list: [[7, 8], [6, 9], [8, 4], [7, 6]] },
      note: 'This drill has twenty facts, not ten, because the pass mark is twenty in a minute.',
      parent: 'Put the slow facts on cards and keep the cards by the breakfast table.',
    },
    'mul-2x1': {
      can: 'times a 2-digit number by a 1-digit number on the soroban, left digit first.',
      move: [
        'Start with the left digit. Its small answer lands one rod to the left of its place, and the next small answer lands one rod to the right of that.',
        'Keep the problem on paper and only the answer on the beads. This is how experts do it, and it is how times in the head works later.',
        'Say each small answer as two digits. That one habit stops most landing mistakes.',
      ],
      exLead: '34 × 7, left digit first.',
      ex: { t: 'mul', a: 34, b: 7 },
      parent: 'Ask "which rods?" before each small answer goes on, and let your child point.',
    },
    'mul-3x1': {
      can: 'times a 3-digit number by a 1-digit number on the soroban.',
      move: [
        'Same rule, one more digit. Each digit of the top number makes one small answer, and each one lands one rod further right than the last.',
        'Read the answer only at the end. Halfway through, the beads show a number that means nothing yet.',
      ],
      exLead: '386 × 7, one small answer at a time.',
      ex: { t: 'mul', a: 386, b: 7 },
      parent: 'If the answer is off by a lot, check the first landing, because one rod out moves everything.',
    },
    'mul-2x2': {
      can: 'times a 2-digit number by a 2-digit number on the soroban.',
      move: [
        'Four small answers now. Take the left digit of the top number through both digits of the bottom number. Then the right digit through both.',
        'Each step moves one rod to the right. The pattern is the whole lesson: left digit, both partners, then the next digit, both partners.',
        'Expect this page to be slow at first. That is fine. Four small answers in the right places is a lot to track.',
      ],
      exLead: '34 × 27, four small answers.',
      ex: { t: 'mul', a: 34, b: 27 },
      parent: 'Let your child say the pattern out loud as they go, because the pattern is what carries over to the head.',
    },
    'mul-mental': {
      can: 'times a 2-digit number by a 1-digit number in the head.',
      move: [
        'Now the same on the mental beads. 47 × 6: 4 × 6 = 24 lands on the hundreds and tens. Picture 240. Then 7 × 6 = 42 lands on the tens and ones. Add it on the picture. Say 282.',
        'Keep the answer on the beads, not in words. If your child hears themselves saying "two hundred and forty" in their head, that is words. Go back to the picture.',
      ],
      exLead: '47 × 6 on the mental beads.',
      ex: { t: 'mul', a: 47, b: 6 },
      parent: 'This is past what most adults can do without paper, and it is fine to tell your child so.',
    },
    'mul-3x2': {
      can: 'times a 3-digit number by a 2-digit number on the soroban.',
      move: [
        'Six small answers. Take the 3, then the 8, then the 6, each through the 4 and then the 7. Keep a steady rhythm and the answer appears.',
        'This is the longest problem in the course so far. Break the page into two sittings if it helps. The pass mark is the same either way.',
      ],
      exLead: '386 × 47, six small answers.',
      ex: { t: 'mul', a: 386, b: 47 },
      parent: 'Split this sheet across two days if it runs long, because a tired child lands digits on the wrong rod.',
    },
    'keep-mental': {
      can: 'still add and take away five 2-digit lines in the head while the times work goes on.',
      move: [
        'Times weeks can let the adding picture fade. This page keeps it warm.',
        'Five lines of two digits in the head, plus and minus. Same as Stage 5. It should feel easier now.',
      ],
      parent: 'Keep this page small and keep it every day, even in the busiest times week.',
    },
  },
};

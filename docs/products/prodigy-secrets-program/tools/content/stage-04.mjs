// Stage 4 · Adept — hand-written words.
export default {
  standfirst: 'Eight lessons that finish the bead rules. Eight combination moves use both friends at once, and after them nothing new ever happens on a rod.',
  opener: [
    'Try 6 + 6 on one rod. The big friend says: take away 4, carry 1. But the rod shows 6 as the top bead and one bottom bead. There is no 4 to take away.',
    'So take the 4 away with a small friend: top bead up, one bead back. Then carry. That is a combination move. Both friends in one go.',
    'There are eight of them, four adds and four take-aways, and they only show up in a few spots. Once they are learned, your child knows all 34 moves. Everything after this stage is speed, size and the picture in the head.',
  ],
  formulaTable: ['combo+', 'combo-'],
  drillTypes: [
    ['Two rods', 'The combination moves, found for you. A combo only happens when the rod shows 5 to 8 for an add, or 1 to 4 for a take-away.'],
    ['Written', 'Six-line columns with every move, then 3-digit columns, then ten rows.'],
    ['Timed', 'The ten-row page has a clock and a fridge chart.'],
    ['Dictation', 'Read a 3-digit column out loud and let your child work it with nothing written.'],
    ['Mental', 'Five one-digit numbers with any move, then two and three 2-digit numbers in the head.'],
  ],
  accuracy: 'The pass marks stay at 9 of 10 on the two-rod pages and 85 percent on the columns. The ten-row page is the only one with a time target, and it still needs 8 of 10 right. A new move always costs speed for a week. That is the price of the move, and it is worth it.',
  kyu: 'Adept closes the Foundation level in UCMAS terms. Three-digit columns on the soroban go past the 10th kyu soroban format. In the head, two 2-digit numbers is Bead Score rung 5, and three 2-digit numbers with plus and minus is rung 6. Rung 6 is about where the trainer\'s chart puts a typical adult.',
  questIntro: 'Three short cards that cover every move, a 3-digit column and a head sum.',
  quests: [
    'Ten moves on two rods, any formula.',
    'Five columns of five 3-digit lines.',
    'Five head sums, three 2-digit numbers each.',
  ],
  bossReady: 'Take the boss when all eight lessons are passed. Part 1 maps to Lessons 4.1 and 4.2. Part 2 maps to 4.4. Part 3 maps to 4.8. A child who passes this boss knows every bead move there is.',
  software: [
    'The combination moves are the hardest to explain in words and the easiest to see. The trainer shows each one in slow motion: top bead up, friend back, carry. Two views of that and most children have it.',
    'The trainer also hunts for combo spots. They are rare in random sums, so a paper sheet can go a whole page without one. The two-rod drill on screen serves them up every time.',
    'And it keeps the best ten-row result, so a new best is on the screen the moment it lands.',
  ],
  lessons: {
    'combo-add': {
      can: 'add 6, 7, 8 or 9 to a rod showing 5 to 8, using both friends and a carry.',
      move: [
        'Watch the order. Top bead up. Friend beads up. Then carry. Three moves, one formula.',
        'Plus 6 is "take away 5, add 1, carry 1". Plus 7 is "take away 5, add 2, carry 1". Plus 8 adds 3, and plus 9 adds 4, both with the same top bead up and the same carry.',
        'Why it works: plus 6 is take away 4 and carry. Taking away 4 from a rod that shows the top bead needs a small friend. Take away 5, give back 1.',
      ],
      exLead: 'Start at 5. Add 9, then 7.',
      ex: { t: 'calc', start: 5, terms: [9, 7] },
      parent: 'Have your child say all three parts of the move out loud, slowly, for the first week.',
    },
    'combo-sub': {
      can: 'take away 6, 7, 8 or 9 from a rod showing 1 to 4, using both friends and a borrow.',
      move: [
        '11 − 6: add 4, the big friend of 6, to the ones rod. But the ones rod shows 1, and 1 + 4 needs a small friend: top bead down, take 1 away. Then borrow 1 from the tens.',
        'So minus 6 is "add 5, take away 1, borrow 1". Minus 7 takes away 2. Minus 8 takes away 3. Minus 9 takes away 4.',
        'Watch the order. Top bead down. Friend beads go. Then borrow.',
      ],
      exLead: 'Start at 11. Take away 6.',
      ex: { t: 'calc', start: 11, terms: [-6] },
      parent: 'If a combo stalls, ask "what does the big friend need?" and let your child find the small friend inside it.',
    },
    'all-34': {
      can: 'work 6-line columns that use every one of the 34 moves.',
      move: [
        'Every rule, in one drill. On each rod, in order: are the beads free? Is it a small friend? Does it fit? If not, big friend. And if the big friend is not there, combo.',
        'From here on, nothing new ever happens on a rod. Fluency is the whole game now.',
        'Every sum on this page has at least one combo move in it. Slow is fine. Correct is the target.',
      ],
      exLead: 'Start at 34. Add 28, then take away 17.',
      ex: { t: 'calc', start: 34, terms: [28, -17] },
      parent: 'Tell your child they now know every bead move there is, because they do.',
    },
    'three-digit': {
      can: 'work 5-line columns of 3-digit numbers, with carries across all three rods.',
      move: [
        'Three rods instead of two. Nothing else changes. Hundreds, then tens, then ones.',
        'A carry can now run from the ones rod all the way to the hundreds. Each one is a plus 1 on the next rod, with the same rules as always.',
        'Keep the eyes one rod ahead of the hand.',
      ],
      exLead: 'Start at 468. Add 357.',
      ex: { t: 'calc', start: 468, terms: [357] },
      parent: 'Big numbers look scary for one day, so tell your child it is the same moves on one more rod.',
    },
    'ten-rows': {
      can: 'add and take away ten rows of 2-digit numbers on the soroban, against the clock.',
      move: [
        'Long columns are the classic soroban test. Ten lines of two digits.',
        'Keep the eyes one line ahead of the hand. Do not check the total halfway. Finish, then check.',
        'Time the whole sheet every day for a week. Write each time on the fridge.',
      ],
      parent: 'Time this one every day for a week and put the times on the fridge where everyone can see them.',
    },
    'mental-4': {
      can: 'add and take away five one-digit numbers in the head, with any of the 34 moves.',
      move: [
        'Soroban away. Five one-digit numbers, plus and minus. Every move is allowed now.',
        'Picture the rod and the carry rod beside it. When the total crosses ten, a bead lands on the left. When it drops below, a bead comes back.',
      ],
      exLead: 'Picture two empty rods. Five numbers.',
      ex: { t: 'calc', start: 0, terms: [6, 8, -9, 7, -5] },
      parent: 'Read the column out loud once if your child asks, then stay quiet until the answer.',
    },
    'mental-5': {
      can: 'add two 2-digit numbers in the head.',
      move: [
        'Now two rods in the picture. 34 + 28: tens first, 3 and 2 make 5. Then ones: 4 and 8 will not fit, so take away 2 and carry. Say 62.',
        'If it falls apart, set 34 + 28 on the real soroban. Watch it. Close your eyes and replay it. Then try the next one in the head.',
        'Research on mental abacus users finds the picture holds about three or four rods at once. Two digits feels like a jump because your child is now holding two objects, each with its own beads.',
      ],
      exLead: 'Picture 34. Add 28.',
      ex: { t: 'calc', start: 34, terms: [28] },
      parent: 'Expect this page to take a few days, because two rods in the head is a real jump.',
    },
    'mental-6': {
      can: 'add three 2-digit numbers in the head.',
      move: [
        'Three lines, two digits, adding only.',
        'Keep the running total as a picture, never as words. If your child catches themselves saying "sixty-two" in their head, it is time to go back to the beads for one sum.',
      ],
      exLead: 'Three numbers on a pictured soroban.',
      ex: { t: 'calc', start: 0, terms: [34, 28, 17] },
      parent: 'Try one of these yourself first, and then tell your child how hard it was.',
    },
  },
};

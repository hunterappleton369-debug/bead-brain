// Stage 3 · Apprentice — hand-written words.
export default {
  standfirst: 'Nine lessons on carrying and borrowing. Big friends make 10, and they are the moment the soroban gets faster than fingers and paper.',
  opener: [
    'A rod holds 9 at most. When a sum goes past 9, one bead moves to the rod on the left, and the rod gives back the difference from 10. When a take-away needs more than the rod has, one bead comes back from the left.',
    'Two numbers that make 10 are big friends: 1 and 9, 2 and 8, 3 and 7, 4 and 6, 5 and 5. To add a number that will not fit, take away its big friend and carry 1. To take away a number that is not there, add its big friend, then borrow 1.',
    'Order matters on a real soroban. Work the rod you are on first, then the rod to its left. For adding: take away the friend, then carry. For taking away: add the friend, then borrow. One rule for both.',
  ],
  formulaTable: ['big+', 'big-'],
  drillTypes: [
    ['Two rods', 'A start number up to 99 and one digit. Watch the tens rod change on every carry and borrow.'],
    ['Written', 'Five-line columns of 2-digit numbers, adds first, then plus and minus mixed.'],
    ['Dictation', 'Read a 5-line column out loud while your child works it on the beads.'],
    ['Mental', 'Three, then four one-digit numbers in the head, now crossing ten.'],
  ],
  accuracy: 'Carries feel backwards for about a week. That is normal. Hold the pass marks at 9 of 10 on the two-rod pages and do not add a clock anywhere in this stage. A child who carries correctly and slowly will be fast by Stage 5. A child who carries quickly and wrong has to unlearn it.',
  kyu: 'Five-line columns of 2-digit numbers are the format of 10th kyu, the first graded level of the Japanese soroban exams. In UCMAS terms this is still Foundation, the last part of it. The mental lesson at the end of the stage is Bead Score rung 2 and 3 work: any two digits, then a running total, crossing ten.',
  questIntro: 'Three short cards. They repeat the stage in miniature: one move, one column, one sum in the head.',
  quests: [
    'Ten carries and borrows on two rods.',
    'Five columns of five 2-digit lines.',
    'Five head sums, four small numbers each.',
  ],
  bossReady: 'Take the boss when every lesson is passed and a 5-line column feels calm. Part 1 maps to Lessons 3.1 to 3.6. Part 2 maps to 3.4 and 3.7. Part 3 maps to 3.9.',
  software: [
    'The trainer\'s two-rod drill draws the tens rod right beside the ones rod, so your child sees the carry land. That small picture does a lot of teaching in the first week of this stage.',
    'It also mixes carries and borrows at random once both are learned, which is hard to do by hand without a problem book. And it shows the move after any miss, so a wrong carry gets fixed on the spot instead of at the end of the page.',
  ],
  lessons: {
    'bf-9-8-7': {
      can: 'add 9, 8 or 7 to a rod when it will not fit, by taking away the big friend and carrying 1.',
      move: [
        'Set 4. Add 9. There is no room: 4 and 9 is more than one rod can hold.',
        'So use the big friend of 9, which is 1. Take 1 away from this rod. Then carry 1 to the tens rod. The rod shows 3 and the tens rod shows 1. That is 13.',
        'Plus 8 takes away 2 and carries. Plus 7 takes away 3 and carries. Say it every time: "plus 8, take away 2, carry 1."',
      ],
      exLead: 'Start at 4. Add 9, then 8.',
      ex: { t: 'calc', start: 4, terms: [9, 8] },
      parent: 'Ask your child to say the order out loud, friend off first and then the carry, until the hand does it without the words.',
    },
    'bf-6-5': {
      can: 'add 6 or 5 to a rod that is too full, with the big friend and a carry.',
      move: [
        'Plus 6 takes away 4 and carries 1. Plus 5 takes away 5 and carries 1.',
        'Plus 5 with a carry only happens when the top bead is already down. You need another 5 and there is no second top bead. So the top bead goes up, and 1 goes to the left.',
        'If the rod does not have the friend to take away, the move is a combination. That comes in Stage 4, and this drill never asks for one.',
      ],
      exLead: 'Start at 9. Add 6, then 5.',
      ex: { t: 'calc', start: 9, terms: [6, 5] },
      parent: 'Ask "does it fit?" before every move, because that one question picks the right friend.',
    },
    'bf-4-1': {
      can: 'carry when a small number lands on a nearly full rod.',
      move: [
        'Small numbers can overflow too. 9 + 1 does not fit on one rod. Take away 9, carry 1.',
        'Every digit has a big friend, so every digit has a carry move. Plus 4 takes away 6. Plus 3 takes away 7. Plus 2 takes away 8. Plus 1 takes away 9.',
        'Here a small friend can hide inside the big one. Take away 6 from a rod showing 7: that is the top bead and one bottom bead, straight off. Free. Then carry.',
      ],
      exLead: 'Start at 7. Add 4.',
      ex: { t: 'calc', start: 7, terms: [4] },
      parent: 'If your child freezes on a small number, ask "does it fit?" and point at the rod, not the bead.',
    },
    'carry-chain': {
      can: 'carry across two or three rods in a row, in 5-line columns of 2-digit adds.',
      move: [
        'Sometimes the carry itself does not fit. 99 + 1: the ones rod takes away 9 and carries. The tens rod already shows 9, so it takes away 9 and carries again. The hundreds rod gets 1. That is 100.',
        'Each carry is just another plus 1, with the same rules. Your child already knows them.',
        'Now real sums: five lines of two digits, adding only, with small and big friends mixed. Use the soroban.',
      ],
      exLead: 'Start at 97. Add 4, then 99.',
      ex: { t: 'calc', start: 97, terms: [4, 99] },
      parent: 'Let the carry chains be slow and correct, because speed here comes on its own by Stage 5.',
    },
    'bf-sub-9-7': {
      can: 'take away 9, 8 or 7 when the rod does not have enough, by adding the big friend and borrowing 1.',
      move: [
        'Set 13. Take away 9. The ones rod shows 3. There is no 9 to take.',
        'So add the big friend of 9, which is 1. The ones rod shows 4. Then borrow: take 1 from the tens rod. That is minus 10. Add 1 and take away 10, and you have taken away 9. That is 13 − 9 = 4.',
        'Minus 8 adds 2, then borrows. Minus 7 adds 3, then borrows. Say it as you move: "Minus 9: add 1, borrow 1 from the left."',
      ],
      exLead: 'Start at 31. Take away 9, then 8.',
      ex: { t: 'calc', start: 31, terms: [-9, -8] },
      parent: 'Say "add the friend, then borrow" once at the start of the page and then keep your hands in your lap.',
    },
    'bf-sub-6-1': {
      can: 'borrow for any digit from 6 down to 1.',
      move: [
        'Same move for every digit. Add the big friend here, then borrow 1 from the left.',
        'Minus 6 adds 4. Minus 5 adds 5. Minus 4 adds 6. Minus 3 adds 7. Minus 2 adds 8. Minus 1 adds 9.',
        'A child who knows the five pairs that make 10 knows all of these. If a move stalls, ask for the friend first, then the move.',
      ],
      exLead: 'Start at 20. Take away 6, then 5.',
      ex: { t: 'calc', start: 20, terms: [-6, -5] },
      parent: 'Ask "who is the friend of 6?" before you ask anything else.',
    },
    'borrow-chain': {
      can: 'borrow across empty rods and work 5-line columns with plus and minus mixed.',
      move: [
        '100 − 1: the ones rod is empty, so add 9, then borrow 1 from the tens. The tens rod is empty too, so it does the same: add 9, then borrow 1 from the hundreds. 100 − 1 = 99.',
        'A borrow chain is a carry chain run backwards. Each borrow is a minus 1 on the next rod, with the same rules.',
        'Now plus and minus mixed, five lines. Every move from the first three stages is in play. This is the real thing.',
      ],
      exLead: 'Start at 100. Take away 1, then add 45.',
      ex: { t: 'calc', start: 100, terms: [-1, 45] },
      parent: 'This is the page where accuracy slips, so praise every correct borrow you hear said out loud.',
    },
    'mental-2': {
      can: 'add and take away three one-digit numbers in the head when a small friend is needed.',
      move: [
        'Soroban away. Three numbers, one digit each, and every sum needs a small friend somewhere.',
        'See the top bead come down in your mind. See the friend beads go. Move the fingers on the table if it helps. Most children do at this point, and the habit fades on its own later.',
      ],
      exLead: 'Picture an empty rod. Add 4, add 3, take away 2.',
      ex: { t: 'calc', start: 0, terms: [4, 3, -2] },
      parent: 'Cover the soroban with a tea towel so it is out of sight, and wait out the silence.',
    },
    'mental-3': {
      can: 'keep a running total in the head as it crosses ten, with four one-digit numbers.',
      move: [
        'Now the total in the picture passes 10. Picture two rods. When the ones rod overflows, a bead appears on the tens rod.',
        'Four numbers, one digit each, plus and minus. Every sum on this page carries or borrows at least once.',
        'If the picture falls apart, do the same sum once on the real soroban. Watch it. Close your eyes and replay it. Then try the next one in the head.',
      ],
      exLead: 'Picture two empty rods. Add 8, add 7, take away 3, add 4.',
      ex: { t: 'calc', start: 0, terms: [8, 7, -3, 4] },
      parent: 'A wrong head sum costs nothing, so say "next one" and keep the beat going.',
    },
  },
};

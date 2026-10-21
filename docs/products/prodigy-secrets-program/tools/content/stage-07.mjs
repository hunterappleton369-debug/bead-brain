// Stage 7 · Champion — hand-written words.
export default {
  standfirst: 'Seven lessons on dividing, on the beads and in the head, plus the first 3-digit head sums and 2-digit flash. After this stage your child has all four operations.',
  opener: [
    'Dividing is times run backwards. Guess a digit. Times it. Take it away. Repeat. Everything it needs is already in your child\'s hands.',
    'Take 952 ÷ 7. How many 7s fit in 9? One. Take away 7 hundreds. Two hundreds are left, and with the tens that makes 25 tens. How many 7s in 25? Three. Take away 21 tens. Four tens are left, and with the ones that makes 42. Six 7s. The answer is 136.',
    'On the soroban, set the number to divide on the right and take away as you go. If a guess is too big, it will not come off the beads. Drop the guess by one and try again. That is normal, not a mistake.',
  ],
  drillTypes: [
    ['Written', 'Dividing on the soroban: 2-digit, then 3-digit, then 4-digit numbers, by 1-digit and 2-digit numbers, with remainders.'],
    ['Mental', 'Dividing by a 1-digit number in the head, and three 3-digit numbers added in the head.'],
    ['Flash', 'Eight 2-digit numbers at 0.7 seconds.'],
  ],
  accuracy: 'Dividing is slow at first, and it should be. Every guess that is too big costs a few seconds, and that is how the guessing gets good. Hold the pass marks and leave the clock off the dividing pages. The flash page is the one place to push the beat, and only after 8 of 10 at a slower one.',
  kyu: 'Champion closes the Construction level in our map to UCMAS. Three 3-digit numbers in the head is Bead Score rung 10. Eight 2-digit numbers flashed at 0.7 seconds is rung 13, around 3rd kyu on the Japanese flash anzan ladder. On the Times ladder, the dividing lessons cover rungs 4, 6 and 8.',
  questIntro: 'Three cards: dividing on the beads, a 3-digit head sum, and a 2-digit flash round.',
  quests: [
    'Four division problems on the soroban.',
    'Four head sums, three 3-digit numbers each.',
    'Five flash rounds of eight 2-digit numbers.',
  ],
  bossReady: 'Take the boss when every lesson is passed and the flash page holds 8 of 10 at 0.7 seconds. Part 1 maps to Lesson 7.3. Part 2 maps to 7.4. Part 3 maps to 7.5. Part 4 maps to 7.7.',
  software: [
    'The trainer shows each dividing step on the beads: the guess, the take-away, what is left. It also runs the 0.7-second flash rounds at an exact beat, which is faster than a parent can flip cards for long.',
    'The paper pages hold the same problems. For the flash page, read at your fastest clear pace and let the trainer handle the true speed.',
  ],
  lessons: {
    'div-2x1': {
      can: 'divide a 2-digit number by a 1-digit number on the soroban.',
      move: [
        '84 ÷ 7. How many 7s in 8? One, with 1 left over. Bring the 4 down beside it: 14. How many 7s in 14? Two. The answer is 12.',
        'On the beads, set 84. Take away 7 tens. Take away 14. The beads read zero, and the answer is the digits you guessed.',
      ],
      exLead: '84 ÷ 7 on the beads.',
      ex: { t: 'div', n: 84, d: 7 },
      parent: 'Praise a good guess even when it has to be changed, because guessing well is the skill.',
    },
    'div-3x1': {
      can: 'divide a 3-digit number by a 1-digit number on the soroban.',
      move: [
        'Same steps, one more digit. Guess, times, take away. Then the next digit.',
        'Sometimes the first digit is too small. 426 ÷ 6: 6 does not go into 4. So start with 42. 42 ÷ 6 = 7. Then 6 ÷ 6 = 1. The answer is 71, a 2-digit answer from a 3-digit number.',
      ],
      exLead: '952 ÷ 7 on the beads.',
      ex: { t: 'div', n: 952, d: 7 },
      parent: 'Ask "how many fit?" and let your child guess out loud, even when the guess is wrong.',
    },
    'div-rem': {
      can: 'divide and say what is left over.',
      move: [
        'When nothing more fits, what is left on the beads is the remainder.',
        'Write it after the answer with an r: 135 r 5 means 135, with 5 left over.',
        'A remainder is always smaller than the number you divide by. If it is not, one more fits.',
      ],
      exLead: '950 ÷ 7 on the beads.',
      ex: { t: 'div', n: 950, d: 7 },
      parent: 'If a remainder is bigger than the divider, just ask "does one more fit?"',
    },
    'div-by-2': {
      can: 'divide a 4-digit number by a 2-digit number on the soroban.',
      move: [
        'Guess with the first digits. For 2,752 ÷ 32, think 27 ÷ 3. That is about 8, so try 8. 32 × 8 = 256. Take 256 off the front of 2,752. 19 is left, and with the last digit that makes 192. 32 × 6 = 192. The answer is 86.',
        'The first guess is often one too big. If it will not come off the beads, drop it by one. This happens to everyone, every day.',
      ],
      exLead: '2,752 ÷ 32 on the beads.',
      ex: { t: 'div', n: 2752, d: 32 },
      parent: 'Say "drop it by one" in a bored voice, because a guess that is too big is part of the method.',
    },
    'div-mental': {
      can: 'divide a 2-digit or 3-digit number by a 1-digit number in the head.',
      move: [
        'Guess, times, take away, on the picture. 91 ÷ 7: 7 goes into 9 once, with 2 left. That makes 21. 21 ÷ 7 = 3. Say 13.',
        'Hold the number to divide as beads, and watch them come off as each guess lands.',
      ],
      exLead: '91 ÷ 7 on the mental beads.',
      ex: { t: 'div', n: 91, d: 7 },
      parent: 'Give this page extra days if it needs them, because division in the head is new for almost everyone.',
    },
    'mental-3d': {
      can: 'add three 3-digit numbers in the head.',
      move: [
        'Three rods in the picture now. Research on mental abacus users puts the limit of the picture at about three or four rods. This is near the edge, and it will feel like it.',
        'Three lines of three digits, adding only. Slow is fine. Correct is the target.',
      ],
      exLead: 'Picture 386. Add 457, then 229.',
      ex: { t: 'calc', start: 386, terms: [457, 229] },
      parent: 'Try one yourself before your child does it, and then tell them how far you got.',
    },
    'flash-2d': {
      can: 'add eight 2-digit numbers flashed at 0.7 seconds each.',
      move: [
        'Two-digit flash. Eight numbers at 0.7 seconds.',
        'The numbers go by faster than they can be said. That is the point. Words are too slow. The picture is not.',
        'Each number lands on two rods at once. Thirty-four is a 3 on the tens rod and a 4 on the ones, taken as one shape.',
      ],
      exLead: 'Eight 2-digit numbers.',
      ex: { t: 'flash', nums: [34, 28, 17, 45, 12, 63, 50, 21] },
      parent: 'Start this page at one number a second and only speed up after 8 of 10 at that beat.',
    },
  },
};

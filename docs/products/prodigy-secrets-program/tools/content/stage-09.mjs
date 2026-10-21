// Stage 9 · Grandmaster — hand-written words.
export default {
  standfirst: 'Six lessons at dan level. Ten 3-digit numbers flashed at half a second, 4-digit sums in the head, and the biggest times and divide problems yet.',
  opener: [
    'From here the course gives drills and targets, not new lessons. The technique is finished. What grows is the size and speed of the picture.',
    'These targets sit around the Japanese dan grades, which club children reach after years of classes. Short daily sessions beat long weekly ones on the way there. There is no promise on the date. Every child is on their own clock here.',
  ],
  drillTypes: [
    ['Flash', 'Ten 3-digit numbers at 0.7 seconds, then 0.5 seconds. These speeds need the trainer for the true beat.'],
    ['Mental', '4-digit lines, 3-digit times 2-digit, 4-digit divided by 2-digit, all in the head.'],
    ['Listening', 'Ten 3-digit numbers read aloud at about one a second, exam style.'],
  ],
  accuracy: 'The rule matters more here than anywhere. A child who passes 0.7 seconds at 8 of 10 is ready for 0.5. A child at 5 of 10 is guessing, and guessing at speed builds nothing. Hold each speed until it is calm. Then move.',
  kyu: 'Grandmaster is the dan level in our map to UCMAS, the Grand end of the Advanced module. On the flash anzan ladder, ten 3-digit numbers at 0.7 seconds is about 5th dan, Bead Score rung 16. At 0.5 seconds it is around 7th dan, rung 17. On the Times ladder, this stage covers rungs 8 and 9.',
  questIntro: 'Three cards: a 3-digit flash round at half a second, a 4-digit head sum, and a 3 × 2 times problem in the head.',
  quests: [
    'Five flash rounds of ten 3-digit numbers.',
    'Three head sums, five 4-digit lines each.',
    'Three 3-digit times 2-digit problems in the head.',
  ],
  bossReady: 'Take the boss when each lesson is passed at its own speed. Part 1 maps to Lesson 9.2. Part 2 maps to 9.3. Part 3 maps to 9.4. Part 4 maps to 9.5. The flash part needs the trainer for a true half-second beat.',
  software: [
    'Half a second is faster than any parent can show a card. At this stage the trainer is the flash machine, and the paper pages are for the head sums, the times and divide problems, and the listening round.',
    'The trainer also keeps the long record. By now there are many Bead Scores on the chart, and the line tells the story of the years better than any report card.',
  ],
  lessons: {
    'g-flash-07': {
      can: 'add ten 3-digit numbers flashed at 0.7 seconds each.',
      move: [
        'Ten numbers, 0.7 seconds each. The numbers are gone before they can be said in words.',
        'There is nothing to learn here except calm. Breathe out on each number.',
      ],
      parent: 'Run this page as a listening drill at your fastest clear pace, and let the trainer do the true 0.7 seconds.',
    },
    'g-flash-05': {
      can: 'add ten 3-digit numbers flashed at half a second each.',
      move: [
        'Half a second. At this speed the eyes stop reading digits and start seeing bead shapes.',
        'Do not ask what the numbers were afterwards. Only the total needs to stay on the beads.',
      ],
      parent: 'Film a round on the trainer once a month, because the clips make the best record of the climb.',
    },
    'g-4d': {
      can: 'add and take away five 4-digit lines in the head.',
      move: [
        'Four rods in the picture. Research suggests this is near the limit of visual working memory, so it may take months to feel steady.',
        'Five lines, mixed. If four rods will not hold, go back to 3-digit head sums for a week, then try again.',
      ],
      exLead: 'The first two lines of a 4-digit head sum.',
      ex: { t: 'calc', start: 5786, terms: [3945] },
      parent: 'This page can take months, so judge it by the month, not by the day.',
    },
    'g-mul-3x2': {
      can: 'times a 3-digit number by a 2-digit number in the head.',
      move: [
        'Six small answers on the picture. Steady rhythm. Each one lands one rod right of the one before, until the next digit of the top number starts a new row.',
        'It is Lesson 6.6, done in the head.',
      ],
      exLead: '386 × 47 on the mental beads.',
      ex: { t: 'mul', a: 386, b: 47 },
      parent: 'Say nothing during a long head problem, because one word can knock the whole picture over.',
    },
    'g-div-4x2': {
      can: 'divide a 4-digit number by a 2-digit number in the head.',
      move: [
        'Guess, times, take away. Twice. The guess comes from the first digits, as on the soroban.',
        'The hard part is the times step, a 2-digit number times a guess, held while the take-away happens. Go slowly. The beads wait.',
      ],
      exLead: '2,752 ÷ 32 on the mental beads.',
      ex: { t: 'div', n: 2752, d: 32 },
      parent: 'If your child needs to say the guess out loud, let them, because it frees up the picture.',
    },
    'g-listen': {
      can: 'add ten 3-digit numbers read aloud at about one a second.',
      move: [
        'Numbers read aloud, about one a second. Exam-style dictation.',
        'Say "minus" as part of the number. Keep the same beat from the first number to the last.',
      ],
      parent: 'Practise reading the list once on your own first, so your beat stays even.',
    },
  },
};

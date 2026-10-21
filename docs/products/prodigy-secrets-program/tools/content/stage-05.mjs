// Stage 5 · Ace — hand-written words.
export default {
  standfirst: 'Nine lessons that move the skill from the hand to the head. Fast hands on the beads, five lines in the head, the first flash rounds, and the first Bead Score.',
  opener: [
    'Speed is not a bonus. It is what moves the skill from the hand to the mind. When the fingers run on their own, attention is free to hold the picture.',
    'Three things happen in this stage. The hands get fast on the real soroban, on columns of ten 3-digit lines. The mental abacus grows to two rods and five lines. And your child meets flash anzan: numbers shown one at a time, gone before they can be said, with the total kept on the mental beads.',
    'The stage ends with the first Bead Score. Write it down. Your child will beat it.',
  ],
  drillTypes: [
    ['Written, timed', 'Ten-line columns of 3-digit numbers, then 4-digit columns. Time the sheet.'],
    ['Flash', 'You show number cards one at a time at a set beat, or say them at that beat. One-digit numbers at 1.5 seconds, then at 1 second.'],
    ['Listening', 'You read numbers aloud and your child adds them on the mental beads. This is how abacus schools run dictation.'],
    ['Mental', 'Five 2-digit lines in the head, adds first, then plus and minus.'],
    ['Bead Score', 'The ladder test in the trainer: no soroban, no paper, no help.'],
  ],
  accuracy: 'This is the stage with the most clocks, and it is where accuracy matters most. Speed up only when the last three sheets were 8 of 10 or better. A child who is right half the time at a fast beat is guessing. A child who is right nine times out of ten at a slow beat is building the picture, and the beat will follow.',
  kyu: 'Mapped to UCMAS, Ace opens Construction, the middle module. Five 2-digit lines in the head is the format of the 4th kyu mental exam in Japan. The flash rounds here start at Bead Score rung 7, five one-digit numbers at one second, which is about 18th kyu on the Japanese flash anzan ladder.',
  questIntro: 'Three cards. The column is timed, the head sums are not, and the flash card needs a grown-up and a beat.',
  quests: [
    'Three 10-line columns of 3-digit numbers, timed.',
    'Five head sums, five 2-digit lines each.',
    'Five flash rounds of eight one-digit numbers.',
  ],
  bossReady: 'Take the boss after the first Bead Score, once the flash pages pass at one second. Part 1 maps to Lessons 5.1 and 5.2. Part 2 maps to 5.7. Part 3 maps to 5.5.',
  software: [
    'Flash is the one drill that is hard to run well by hand. A parent with cards can hold a one-second beat. Nobody can hold 0.7 seconds for long, and later stages go to a fifth of a second.',
    'The trainer flashes numbers on screen at the exact speed, reads numbers aloud for listening drills, and runs the Bead Score ladder. The score goes on an age chart, with your child\'s own line climbing test by test.',
    'Everything else in this stage works on paper. The flash pages here are built so you can run them at the table, and the trainer is there for the speeds your hands cannot keep.',
  ],
  lessons: {
    'fast-hands': {
      can: 'add ten 3-digit lines on the soroban with a quick, quiet hand.',
      move: [
        'Speed comes from the hand, not from hurry. Thumb and index finger only. Fingers stay close to the beads and never lift high.',
        'The eyes read the next number while the hand finishes the last. Do not look back at the beads to check. Trust the hand.',
        'Ten lines of three digits, adding only. Target: all right first. Then under 90 seconds a column. Then under 60.',
      ],
      parent: 'Watch the hand, not the clock, and say something when the fingers stay low and quiet.',
    },
    'read-ahead': {
      can: 'work ten-line 3-digit columns with plus and minus mixed, reading each sign and number as one chunk.',
      move: [
        'Mixed plus and minus, ten lines. The sign is part of the number. Read "minus 347" as one chunk, not a sign and then a number.',
        'The hand needs to know which way to move before it gets there. Reading the whole line at once is what keeps it moving.',
      ],
      exLead: 'One line, worked: start at 812 and take away 347.',
      ex: { t: 'calc', start: 812, terms: [-347] },
      parent: 'If a sign gets missed, point at it and say nothing.',
    },
    'four-digit': {
      can: 'work 5-line columns of 4-digit numbers, thousands first.',
      move: [
        'Four rods. Thousands first. The soroban does not care how long a number is. Only the eyes do.',
        'Use the dots on the beam to find the thousands rod fast. Most sorobans mark every third rod.',
      ],
      exLead: 'One line, worked: start at 3279 and add 4586.',
      ex: { t: 'calc', start: 3279, terms: [4586] },
      parent: 'Read a long number back in chunks, "three thousand, two seventy-nine", to show it is just two short ones.',
    },
    'flash-1': {
      can: 'add five one-digit numbers shown one at a time, keeping the total on the mental beads.',
      move: [
        'A number appears for a moment and goes. Add it to the mental beads. The next one appears. At the end, say the total.',
        'Nothing can be written and nothing can be looked at again. The picture does all the work.',
        'Start easy. Five one-digit numbers, each shown for one and a half seconds. The feeling you want is calm. The number lands on the beads and is gone.',
        'Champions go a long way past this. The world record, set in 2024, is fifteen 3-digit numbers in 1.61 seconds. Your child is on the same ladder, on the first rung.',
      ],
      exLead: 'Five numbers, one at a time.',
      ex: { t: 'flash', nums: [3, 5, 1, 4, 2] },
      parent: 'Make the cards with a thick pen, hold a steady beat, and show each one once.',
    },
    'flash-2': {
      can: 'add eight one-digit numbers flashed at one second each.',
      move: [
        'Eight numbers at one second each.',
        'If the picture goes, do not chase it. Let the next number land anyway. Your child will often still be right.',
        'Breathe out as each number lands. That is the whole trick for this page.',
      ],
      exLead: 'Eight numbers at a one-second beat.',
      ex: { t: 'flash', nums: [7, 4, 9, 2, 6, 8, 3, 5] },
      parent: 'If a round falls apart, say "next one" and start fresh, because a lost round costs nothing.',
    },
    'mental-7': {
      can: 'add five 2-digit numbers in the head.',
      move: [
        'Five lines of two digits, in the head.',
        'Move the fingers on the table if it helps. Most children do at this point and stop on their own later.',
      ],
      exLead: 'Picture 47. Add 36, then 25.',
      ex: { t: 'calc', start: 47, terms: [36, 25] },
      parent: 'This is past what school asks of any grade, so tell your child that.',
    },
    'mental-8': {
      can: 'add and take away five 2-digit numbers in the head.',
      move: [
        'Same as last time, with take-aways in the mix.',
        'Borrows in the head feel strange the first week and normal the second. If a borrow will not come, go back to the beads for one sum, then close the eyes and replay it.',
      ],
      exLead: 'Five lines, plus and minus.',
      ex: { t: 'calc', start: 47, terms: [-18, 36, 25, -41] },
      parent: 'Read the column aloud in the same voice every day, because a steady voice is a steady beat.',
    },
    'listen-1': {
      can: 'add four 2-digit numbers read aloud, on the mental beads, at about one number a second.',
      move: [
        'You read numbers out loud and your child adds them on the mental beads. This is how abacus schools run their mental drills: the teacher calls, the class answers.',
        'It also means anyone can practise with your child. A grandparent or a babysitter only needs to read a list at a steady beat. Nobody needs to know any math.',
        'Say each number once, clearly. Say "minus" as part of the number.',
      ],
      exLead: 'Three numbers, read aloud.',
      ex: { t: 'flash', nums: [34, 28, 17] },
      parent: 'Hand this page to a grandparent and let them run it, because it is the easiest way to get them on the team.',
    },
    'first-test': {
      can: 'take the Bead Score ladder for the first time and write down the number.',
      move: [
        'The Bead Score is a ladder. Easy rungs first, harder each step, until one fails. The score is the top rung cleared. No soroban, no paper, no help.',
        'It lives in the trainer, because the flash rungs need exact timing. This page is the warm-up: ten head sums to wake the picture up.',
        'Then take the test. Write the number on the fridge in your child\'s own hand. Retake it every two to four weeks, never on a tired day.',
      ],
      parent: 'The first Bead Score is the one your child will beat, so make a fuss of writing it down.',
    },
  },
};

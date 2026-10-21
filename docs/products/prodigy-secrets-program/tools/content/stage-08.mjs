// Stage 8 · Prodigy — hand-written words.
export default {
  standfirst: 'Nine lessons, all in the head. Ten 3-digit lines, 3-digit flash, and times and divide on the mental beads. Then money, then numbers below zero. This is expert-level mental arithmetic, and the stage to film.',
  opener: [
    'Nothing new to learn here. Everything gets bigger and faster. The wooden soroban becomes a warm-up tool, and every drill is mental.',
    'Expect plateaus. They last about two weeks and then break overnight, usually after a day when nothing seemed to happen. Keep the sessions short and daily, and keep the drill the same size through the flat weeks.',
    'Ten mixed 3-digit lines in the head is the format of the Japanese 1st kyu mental exam, the top grade below dan. Your child will meet it in the second lesson.',
  ],
  drillTypes: [
    ['Mental', 'Five, then ten 3-digit lines in the head, plus and minus. Times and divide on the mental beads.'],
    ['Flash', 'Five, then ten 3-digit numbers, at 1 second and then 0.8 seconds.'],
    ['Life drills', 'Money sums from real receipts, and sums that drop below zero.'],
  ],
  accuracy: 'Pass marks drop a little here, to 75 or 80 percent, because the problems are long. The rule does not change. Speed up only after three good sheets in a row. On the ten-line page, under two minutes a problem is the first goal. Exam speed is under forty seconds, and that comes later.',
  kyu: 'Prodigy is the Advanced level in our map to UCMAS. Ten 3-digit lines in the head is the Japanese 1st kyu mental format, and Bead Score rung 15. Five 3-digit numbers flashed at one second is rung 14, around 2nd dan on the flash anzan ladder.',
  questIntro: 'Three cards, all in the head: a ten-line sum, a 3-digit flash round, and 2 × 2 times.',
  quests: [
    'Three head sums, ten 3-digit lines each.',
    'Five flash rounds of eight 3-digit numbers.',
    'Four 2-digit times 2-digit problems in the head.',
  ],
  bossReady: 'This is the boss to film. Take it when every lesson is passed and the ten-line page holds 8 of 10. Part 1 maps to Lesson 8.2. Part 2 maps to 8.3. Part 3 maps to 8.5. Part 4 maps to 8.7.',
  software: [
    'From here, the trainer does the jobs a parent cannot. It flashes 3-digit numbers at exact speeds. It times ten-line sums to the second. And it plots each Bead Score on the age chart.',
    'The paper pages here are a full set of mental drills you can run anywhere: the car, a waiting room, a trip. The trainer is the stopwatch and the flash cards.',
  ],
  lessons: {
    'p-3d-5': {
      can: 'add and take away five 3-digit lines in the head.',
      move: [
        'Five lines, three digits, plus and minus. Three rods in the picture, with carries and borrows running between them.',
        'If the picture wobbles, slow the reading down, not the beads. Read one line, move it, then read the next.',
      ],
      exLead: 'The first two lines of a head sum.',
      ex: { t: 'calc', start: 615, terms: [-247] },
      parent: 'Read each line aloud for your child the first few days, then let them read it alone.',
    },
    'p-3d-10': {
      can: 'add and take away ten 3-digit lines in the head.',
      move: [
        'The classic exam format. The Japanese 1st kyu mental test is twenty of these in twelve minutes.',
        'Under two minutes a problem is the goal for now. Under forty seconds is exam speed.',
        'Long sums are won by rhythm. Read, move, read, move, at the same beat from the top line to the bottom.',
      ],
      parent: 'Do one of these a day, not three, and let the rhythm build.',
    },
    'p-flash-3': {
      can: 'add five 3-digit numbers flashed at one second each.',
      move: [
        'Five 3-digit numbers at one second each. Three rods at once, every number.',
        'At this size the eyes stop reading digits and start taking the number as one shape. That shift is what this page builds.',
      ],
      exLead: 'Five 3-digit numbers.',
      ex: { t: 'flash', nums: [265, 783, 142, 684, 340] },
      parent: 'Use big cards and a thick pen, because a number you cannot read at a glance is not a fair flash.',
    },
    'p-flash-3b': {
      can: 'add ten 3-digit numbers flashed at 0.8 seconds each.',
      move: [
        'Ten numbers at 0.8 seconds. Breathe. Let each number land.',
        'Lost rounds will happen. A child who lets one go and takes the next one calmly is building the right habit.',
      ],
      parent: 'If your hands cannot keep 0.8 seconds, read at one second and let the trainer do the fast rounds.',
    },
    'p-mul-2x2': {
      can: 'times a 2-digit number by a 2-digit number in the head.',
      move: [
        'Four small answers added on the mental beads, left to right, exactly as on the soroban. Each one lands one rod right of the last.',
        'If the picture holds the first two and drops the rest, go back to the soroban for one problem and say the landing rods out loud.',
      ],
      exLead: '34 × 27 on the mental beads.',
      ex: { t: 'mul', a: 34, b: 27 },
      parent: 'Most adults need paper for this one, so let your child try you on it.',
    },
    'p-mul-3x1': {
      can: 'times a 3-digit number by a 1-digit number in the head.',
      move: [
        'Three small answers on the picture. Hundreds digit first, landing two rods left of the ones place, then tens, then ones.',
        'It is the same problem as Lesson 6.3, with the soroban put away.',
      ],
      exLead: '386 × 7 on the mental beads.',
      ex: { t: 'mul', a: 386, b: 7 },
      parent: 'Say "same as on the beads" once, and let that be the only hint.',
    },
    'p-div': {
      can: 'divide a 3-digit number by a 1-digit number in the head.',
      move: [
        'Guess, times, take away, on the picture. Hold the number to divide as beads. Watch each part come off as the guesses land.',
        'Say the answer digits as they arrive, then the whole answer at the end.',
      ],
      exLead: '952 ÷ 7 on the mental beads.',
      ex: { t: 'div', n: 952, d: 7 },
      parent: 'If a guess goes wrong in the head, let your child start over from the top, calmly.',
    },
    'p-decimals': {
      can: 'add money in the head, dollars and cents, from a list.',
      move: [
        'Decimals change nothing on the beads. Pick a rod to be the ones, one with a dot on the beam. The rods to its right are tenths and hundredths.',
        'So $12.75 + $3.50 is 1275 + 350 on the beads, with the dot two rods from the right. The beads show 1625. Read it as $16.25.',
        'Then take it shopping. Add the receipt in your head before the till does.',
      ],
      exLead: '$12.75 and $3.50, with the dot two rods from the right.',
      ex: { t: 'calc', start: 1275, terms: [350], money: true },
      parent: 'Hand your child the next grocery receipt and a pencil for the total only.',
    },
    'p-negative': {
      can: 'work a sum that drops below zero and say the answer with its minus sign.',
      move: [
        'A soroban cannot show a number below zero. So soroban users borrow from an empty rod on the far left.',
        'Take 20 − 35. It will not fit. Borrow 100: now it is 120 − 35 = 85. The beads show 85. But you borrowed 100, so give it back. 100 − 85 = 15, and the answer is below zero: minus 15.',
        'Try a few on paper first, then in the head. This is rare in exams and useful in life, from temperatures to bank balances.',
      ],
      exLead: '20 − 35, with a borrowed 100.',
      ex: { t: 'neg', a: 20, b: 35 },
      note: 'This page prints sums that go below zero. The trainer\'s drill for this lesson uses six 2-digit lines that stay above zero, so the paper page is the place to practise the borrow.',
      parent: 'Use a thermometer or a game score to show why numbers below zero are real.',
    },
  },
};

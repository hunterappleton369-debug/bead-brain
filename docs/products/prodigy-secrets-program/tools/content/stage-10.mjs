// Stage 10 · Legend — hand-written words.
export default {
  standfirst: 'Five targets with no finish line. Fifteen 3-digit numbers flashed at 0.4, 0.3 and 0.2 seconds, 3-digit times 3-digit in the head, and fifteen-line head sums.',
  opener: [
    'There is no boss your child must beat to finish. Legend is a set of targets to chase for as long as it is fun. Each one cleared goes on the chart.',
    'The world record for fifteen 3-digit numbers is 1.61 seconds in total, about a tenth of a second a number. Nobody needs to get there. But the ladder has no top, and that is the fun of it.',
    'Keep the routine the same as it has been since Sprout. Fifteen minutes. Same chair. Same time. A child at this level still gets better the same way a child at Stage 1 does.',
  ],
  drillTypes: [
    ['Flash', 'Fifteen 3-digit numbers at 0.4, then 0.3, then 0.2 seconds. Trainer only for the true speed.'],
    ['Mental', '3-digit times 3-digit, and fifteen 3-digit lines with plus and minus, both in the head.'],
  ],
  accuracy: 'Pass marks sit at 75 percent here, and the long head sums at two in three. Even at this level the rule holds. Hold a speed until it is calm. A Legend who guesses at 0.2 seconds is not a Legend at 0.3.',
  kyu: 'Legend is competition level, past the end of every program in our map. On the flash anzan ladder, fifteen 3-digit numbers at 0.4 seconds is about 8th dan. At 0.3 seconds it is about 9th dan. At 0.2 seconds it is 10th dan, Bead Score rung 20, the top of the ladder. On the Times ladder, 3-digit times 3-digit is rung 10.',
  questIntro: 'Two cards: a fifteen-number flash round and a 3 × 3 times problem in the head.',
  quests: [
    'Five flash rounds of fifteen 3-digit numbers.',
    'Three 3-digit times 3-digit problems in the head.',
  ],
  bossReady: 'The Legend Boss is for the record, not a gate. Take it when the 0.3-second page is calm. Part 1 maps to Lesson 10.2. Part 2 maps to 10.4. Film it.',
  software: [
    'At Legend, the trainer is the only way to see the true speeds. A tenth of a second is a blink. It also keeps every Bead Score your child has ever taken on one chart, from the first rung in Stage 5 to here.',
    'The paper pages stay useful for the head sums and the times problems, and as listening drills on long drives.',
  ],
  lessons: {
    'l-flash-04': {
      can: 'add fifteen 3-digit numbers flashed at 0.4 seconds each.',
      move: [
        'Fifteen numbers. Once the picture is steady, how many numbers there are matters less than how fast they come.',
        'Hold 0.4 seconds until 8 of 10 rounds are right. Then move on.',
      ],
      parent: 'Run this page at your own fastest clear pace as a listening drill, and let the trainer do the true speed.',
    },
    'l-flash-03': {
      can: 'add fifteen 3-digit numbers flashed at 0.3 seconds each.',
      move: [
        '0.3 seconds. This is national competition speed.',
        'If the rounds start to fall apart, drop back to 0.4 for a week. Speed built on a shaky picture does not last.',
      ],
      parent: 'Send the clip to someone who knew your child before Stage 1.',
    },
    'l-flash-02': {
      can: 'add fifteen 3-digit numbers flashed at 0.2 seconds each.',
      move: [
        'Faster than a blink is long. The record is about 0.1 seconds a number.',
        'Very few people on Earth do this. If your child does, the chart has run out of rungs.',
      ],
      parent: 'Whatever the score on this page, say out loud how far your child has come since the first rod.',
    },
    'l-mul-3x3': {
      can: 'times a 3-digit number by a 3-digit number in the head.',
      move: [
        'Nine small answers. Keep the rhythm, and keep the landing rods exact.',
        'Each digit of the top number works through all three digits of the bottom number, one rod right each step. Then the next digit starts one rod further right than the last one did.',
      ],
      exLead: '386 × 472 on the mental beads.',
      ex: { t: 'mul', a: 386, b: 472 },
      parent: 'Give this page as many quiet minutes as it needs, and do not talk until the answer comes.',
    },
    'l-mix': {
      can: 'add and take away fifteen 3-digit lines in the head.',
      move: [
        'Fifteen lines, plus and minus. The exam marathon.',
        'The pass mark is two in three. A long sum has many places to slip, and finishing calm is the real skill.',
      ],
      parent: 'Read the lines at one steady beat, and treat a finished sum as a win even when it is off.',
    },
  },
};

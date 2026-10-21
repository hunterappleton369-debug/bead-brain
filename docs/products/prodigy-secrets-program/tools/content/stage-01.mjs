// Stage 1 · Sprout — hand-written words. Numbers a child computes are generated in build.mjs.
export default {
  standfirst: 'Eight lessons that turn a frame of beads into numbers your child can read at a glance. No tricks yet. This is the floor the other nine stages stand on.',
  opener: [
    'Sprout is the stage parents want to rush. Please do not. A study of U.S. first graders found that after a year, most still could not read big numbers off an abacus, and they learned little from it. Reading is the whole game here. A child who reads the beads in a glance is ready for every trick that comes later.',
    'By the last lesson your child sets and reads any number up to 999. They add and take away whenever the beads they need are free. And they get a first taste of the picture in the head, with eyes closed.',
  ],
  drillTypes: [
    ['Reading', 'Bead pictures to read out loud. Ones rod first, then tens, then hundreds. Later the picture shows for two seconds and hides.'],
    ['Setting', 'A grown-up says a number. Your child sets it, left rod first.'],
    ['Written', 'One-rod sums, then short columns of 2-digit numbers worked on the soroban.'],
    ['Dictation', 'Any written column works as dictation. You read it out loud while your child moves the beads.'],
    ['Mental', 'The last lesson: look at the beads, close your eyes, say the number.'],
  ],
  accuracy: 'Nine out of ten right, slowly, beats seven out of ten fast. Every drill in this stage has a pass mark, and nobody moves on until it is hit. Speed is not graded until Stage 2. If a page goes badly, the same page tomorrow is the plan, not a setback.',
  kyu: 'Sprout sits below the first grade of every proven program. In UCMAS terms it is the Foundation module. In the Japanese soroban exams it comes before 10th kyu, the first graded level. Sprout does not touch the Bead Score yet. That ladder measures sums in the head, which begin in Stage 2.',
  questIntro: 'Two short cards for Fridays. They take five minutes together and keep the streak alive on a busy day.',
  quests: [
    'Read eight 3-digit numbers fast.',
    'Five short columns, free beads only.',
  ],
  bossReady: 'Take the boss when all eight lessons are passed. Do it on a Saturday, at the usual time, with the usual chair. Most children need two or three tries. Each part matches a lesson, so a failed part tells you which page to repeat: reading goes back to Lesson 1.3, setting to 1.4, the sums to 1.7.',
  software: [
    'Everything in this stage works on paper and a wooden soroban. The trainer adds three things.',
    'First, the bead demos move. Your child presses play and watches 3 + 1 happen on the screen abacus before trying it. Second, the peek drills time themselves. The picture shows for exactly two seconds and hides, so you do not need a card and a stopwatch. Third, the trainer grades every drill and logs it, so the streak and the stage map fill in on their own.',
    'Use whichever is easier on the day. The paper and the screen teach the same moves in the same order.',
  ],
  lessons: {
    hold: {
      can: 'hold the soroban the right way, clear it in one move, and show any number from 0 to 9 on one rod.',
      move: [
        'Lay the soroban flat with the beam running left to right. To clear it, tilt the top edge up so every bead slides away from the beam. Lay it flat again. Run your index finger along the top of the beam to push the top beads up.',
        'A bead counts only when it touches the beam. Each bead below the beam is worth 1. The one bead above it is worth 5.',
        'Two fingers do all the work. The thumb pushes the bottom beads up. The index finger pushes them down, and moves the top bead both ways. No other finger ever touches a bead.',
      ],
      exLead: 'Here is how 5, 6 and 9 look on one rod.',
      ex: { t: 'read', nums: [5, 6, 9] },
      parent: 'Keep the first session to ten minutes and end it on a number your child got right.',
    },
    read: {
      can: 'read any 2-digit number off the beads and say it out loud.',
      move: [
        'Reading comes before setting because it is faster, and speed of the eyes is what we are building. Look at the ones rod first. Then the tens rod. Then say the whole number.',
        'Two slips catch every new reader. The first is a bead that sits close to the beam but does not touch it. It counts for nothing. The second is an empty rod in the middle of a number. An empty rod is a zero, and it still takes up a place.',
      ],
      exLead: 'The second picture has an empty tens rod.',
      ex: { t: 'read', nums: [47, 305] },
      parent: 'Point at the ones rod first, every time, until your child does it without you.',
    },
    read3: {
      can: 'read a 3-digit number in under three seconds, by the shape of each rod.',
      move: [
        'Same skill, bigger numbers. Now the goal is speed. If it takes longer than three seconds, your child is counting beads one at a time. That works, but it is slow.',
        'Instead, learn the look of each digit, the way you learned the shape of each letter. Seven is "top bead plus two". Four is "four up, top bead off". Nine is "everything in".',
        'In this drill the picture shows for two seconds, then hides. Say the number before it goes.',
      ],
      ex: { t: 'read', nums: [694] },
      parent: 'Ask "what does seven look like?" and wait for a picture, not a count.',
    },
    set: {
      can: 'hear a 3-digit number and set it, hundreds rod first.',
      move: [
        'Now the other way. Hear a number, set it from the left: hundreds, then tens, then ones. Left to right is the order your child will add in for the rest of the course, so the habit starts here.',
        'Watch the fingers more than the numbers. Thumb up, index down, every time. Sloppy fingers now become slow fingers later.',
      ],
      exLead: 'The tens rod stays empty.',
      ex: { t: 'set', n: 508 },
      parent: 'Read the number once, clearly, and let the beads answer for your child.',
    },
    'direct-add': {
      can: 'add a single digit on one rod whenever the beads it needs are free.',
      move: [
        'To add on a soroban, you push more beads to the beam. If the beads you need are free, just move them. Soroban teachers call this a direct move. In this book direct moves are green.',
        'What about 4 + 1? All four bottom beads are already up, so there is no free bead. That needs a trick, and the trick is Stage 2. For now every problem has free beads.',
        'Say the move as you make it: "plus 3, three up."',
      ],
      exLead: 'Start at 3. Add 1, then add 5.',
      ex: { t: 'calc', start: 3, terms: [1, 5] },
      parent: 'Praise the move your child says out loud more than the answer they write.',
    },
    'direct-sub': {
      can: 'take away a single digit on one rod whenever those beads are on the beam.',
      move: [
        'Taking away is the same in reverse. Push beads off the beam. If the beads you want to remove are touching the beam, pull them off. Direct.',
        'Bottom beads come down with the index finger. The top bead goes up with the index finger too. The thumb only ever pushes up.',
      ],
      exLead: 'Start at 9. Take away 4, then 5.',
      ex: { t: 'calc', start: 9, terms: [-4, -5] },
      parent: 'If your child reaches with the thumb to pull a bead down, say "index" and nothing else.',
    },
    'two-col': {
      can: 'add and take away 2-digit numbers on two rods, tens first, in short columns.',
      move: [
        'Big numbers are just more rods. Work the tens rod first, then the ones. Always left to right.',
        'This feels backwards if you learned column sums at school. It is the reason mental math works later. Your child adds a number in the same order they say it.',
        'Set the top number. Then add or take away each line. Write the total at the end, not along the way.',
      ],
      exLead: 'Start at 12. Add 36, then take away 15.',
      ex: { t: 'calc', start: 12, terms: [36, -15] },
      parent: 'Finish the whole column before checking, because a child who restarts halfway learns to panic.',
    },
    'eyes-closed': {
      can: 'see one rod for about a second, close their eyes, and still say the number.',
      move: [
        'This is the first step toward math in the head. Look at the beads for one second. Close your eyes. Can you still see them? Say the number.',
        'That picture is the mental abacus. Experts do all of their math on it. Your child\'s is tiny right now, one rod, and every stage makes it bigger.',
        'Brain scans of trained abacus users show them working sums with the parts of the brain that handle pictures and hand moves. Their mental image behaves like a real abacus. When experts slip, they are often off by exactly 5: a top bead in the wrong place.',
      ],
      ex: { t: 'read', nums: [7] },
      parent: 'Keep this one short and light, and stop the moment it turns into guessing.',
    },
  },
};

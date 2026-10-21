// text.js — the hand-written half of each workbook page: title, today's idea (two sentences),
// and the parent line (set in Caveat, the handwriting face). One entry per day, 1..90.
// Blocks follow js/curriculum.js Stage 1 (Sprout) and Stage 2 (Explorer), lesson by lesson.

export const PARTS = [
  { title: 'Part 1 · Sprout: meet the beads', days: [1, 40], blurb: 'Reading and setting numbers, then adding and taking away whenever the beads are free. No tricks yet. This is the floor everything else stands on, so it gets forty days.' },
  { title: 'Part 2 · Explorer: small friends', days: [41, 90], blurb: 'The first real technique: the eight moves that trade the heaven bead for earth beads. Plus one to plus four, then minus one to minus four, then all eight inside two-digit problems, then speed, then the first sums in the head.' },
];

export const BLOCKS = {
  hold: { lesson: 'Hold it, clear it, move it', days: [1, 4] },
  read2: { lesson: 'Read any number', days: [5, 9] },
  read3: { lesson: 'Read hundreds in a glance', days: [10, 14] },
  set3: { lesson: 'Set numbers fast', days: [15, 18] },
  dadd: { lesson: 'Add when the beads are free', days: [19, 24] },
  dsub: { lesson: 'Take away when the beads are there', days: [25, 29] },
  twocol: { lesson: 'Two columns, left to right', days: [30, 36] },
  eyes: { lesson: 'Eyes closed', days: [37, 39] },
  boss1: { lesson: 'Sprout Boss', days: [40, 40] },
  sf14: { lesson: '+1 and +4: friends 1 and 4', days: [41, 46] },
  sf23: { lesson: '+2 and +3: friends 2 and 3', days: [47, 52] },
  sfadd2d: { lesson: 'Small-friend adds in 2-digit numbers', days: [53, 59] },
  sfsub14: { lesson: '−1 and −4: taking away with friends', days: [60, 65] },
  sfsub23: { lesson: '−2 and −3', days: [66, 71] },
  sfmix: { lesson: 'All eight friends, mixed', days: [72, 79] },
  speed: { lesson: 'Speed round', days: [80, 85] },
  mental: { lesson: 'Mental: three small numbers', days: [86, 89] },
  boss2: { lesson: 'Explorer Boss', days: [90, 90] },
};

// [title, idea, parent]
export const DAYS = [
  // ── hold (1–4)
  ['Hold it, clear it, move it', 'Lay the soroban flat with the beam running left to right, then tilt the top edge up so every bead slides away from the beam. A bead only counts when it touches that beam.', 'Say every number out loud with them today. Ten minutes, then stop while it is still fun.'],
  ['Thumb up, index down', 'Your thumb pushes the bottom beads up to the beam. Your index finger pushes them down and moves the top bead, and no other finger ever touches a bead.', 'Watch the fingers, not the numbers. Sloppy fingers now become slow fingers later.'],
  ['Five is one bead', 'The bead above the beam is worth five on its own, so five is one bead, not five. Six is the heaven bead plus one earth bead.', 'If they push five earth beads up, there is no fifth one. Let them discover that. Then show the heaven bead.'],
  ['Every digit has a shape', 'Seven is heaven plus two, four is four up with heaven off, and nine is everything. Learn the ten shapes the way you learned the letters.', 'Ask "what does seven look like?" and wait for a picture, not a number.'],
  // ── read2 (5–9)
  ['Read any number', 'Reading is faster than setting, so we train it first. Look at the ones rod, then the tens, and say the whole number.', 'Point at the ones rod first, every time, until they do it without you.'],
  ['A bead counts when it touches the beam', 'Beads resting away from the beam are worth nothing, even if they are close. Only the beads touching the beam are in the number.', 'If a reading is wrong, do not say the number. Say "which beads are touching?"'],
  ['Ones, then tens', 'Two rods make a two-digit number, and the right-hand rod is the ones. Read the ones, read the tens, say it as one number.', 'Have them say "four… seven… forty-seven" today. The whole number is the win.'],
  ['Zero takes up a place', 'An empty rod is a zero, and it still counts as a place. Forty is a four on the tens rod with nothing on the ones.', 'Zeros are the common slip all week. Smile and ask "is that rod empty, or is it a place?"'],
  ['Shapes, not counting', 'If a reading takes more than three seconds, you are counting beads one by one. See the shape of each rod instead and say it.', 'Cover the beads with your hand after two seconds today. Counting becomes impossible, and shapes take over.'],
  // ── read3 (10–14)
  ['Read hundreds in a glance', 'Three rods make a three-digit number: hundreds, tens, ones. Same skill, one more shape.', 'Three-digit numbers are the first party trick. Read 694 off the beads yourself, badly, and let them beat you.'],
  ['Under three seconds', 'Aim for under three seconds a number. Slow means counting, and counting means the shapes are not known yet.', 'Count "one, two, three" under your breath. If they beat it, big deal. If not, no deal; tomorrow.'],
  ['Seven is heaven plus two', 'Heaven plus two beads is seven, heaven plus three is eight. Say the shape in your head, then the digit.', 'Praise the shape they saw, not the number they got. "You saw heaven plus two."'],
  ['The peek', 'The number shows for two seconds and then it is gone, so the eyes have to take the whole thing at once. That is the skill the whole program is built on.', 'Set a number, count two, cover it. Their eyes will get faster this week. You will see it.'],
  ['Say it before it vanishes', 'Say the number out loud while the beads are still showing, not after. Speaking it fixes the picture.', 'Today they say it before you cover it. If they are late, no harm, just do another.'],
  // ── set3 (15–18)
  ['Set numbers fast', 'Now go the other way: hear a number and set it on the beads. Hundreds first, then tens, then ones.', 'Read each number once, clearly. Then check the beads and say nothing but "yes" or "look again."'],
  ['Left to right, always', 'Setting from the left is the order you will add in later. It feels backwards from school, and it is the reason mental math works.', 'If a hand jumps to the ones rod first, just say "left to right." Nothing else.'],
  ['Hundreds first', 'Say the number to yourself the way it is said, hundreds first, and set each rod as you say it. The hand follows the voice.', 'Let them whisper the number while they set it. The whisper is the method.'],
  ['Clean fingers', 'Thumb pushes earth beads up, index finger pushes them down and moves heaven. Clean fingers now become fast fingers later.', 'Last day of setting. Watch the fingers one more time. Then celebrate: they can read and set any number to 999.'],
  // ── dadd (19–24)
  ['Add when the beads are free', 'To add on a soroban, push more beads to the beam. If the beads you need are sitting there free, just move them.', 'A new kind of drill: set the first number, add the second. Say "push them up" and let them find which ones.'],
  ['Push beads to the beam', 'Three plus one is one earth bead pushed up. Six plus three is three earth beads pushed up.', 'The flash round moves to your voice today. Say three numbers, one a second, and let them move the real beads.'],
  ['The heaven bead is worth five', 'One plus five is the heaven bead coming down, and that is all. Adding five never touches the earth beads.', 'Watch for a hand reaching for five earth beads. There is no fifth one. Let them notice.'],
  ['Free beads', 'Today every problem has free beads waiting, so every answer is just pushing. Enjoy it, because it will not always be this simple.', 'Say "free beads" when they hesitate and nothing more. They will learn to look for them.'],
  ['What if they are not free?', 'Four plus one has no free bead, and that needs a trick you learn in Part 2. Today the drill only gives you problems where the beads are free.', 'If they ask what happens with four plus one, say "that is a trick, and it comes in a few weeks." A little mystery helps.'],
  ['Add with your eyes open', 'Read the next number while your hand finishes the last one. Eyes ahead, hands behind, and the beads do the rest.', 'Last day of adding alone. Tomorrow the beads go the other way.'],
  // ── dsub (25–29)
  ['Take away when the beads are there', 'Taking away is pushing beads away from the beam. If the beads you want to remove are touching the beam, pull them off.', 'Set the first number, take away the second. "Pull them down" is the only hint today.'],
  ['Pull beads off the beam', 'Eight take away three is three earth beads pulled down. Nine take away four is four earth beads down, and heaven stays where it is.', 'Taking away is often easier than adding, because the beads are right there. Let them feel fast.'],
  ['Heaven goes up', 'Seven take away five is the heaven bead pushed up, and the earth beads do not move. Five is one bead, both ways.', 'The flash round has take-aways now. Say "minus two" as one chunk, not "minus… two."'],
  ['Look before you pull', 'Look at the rod and ask: are the beads I want to remove touching the beam? If they are, this is a direct take-away.', 'Finish the problem before checking. If they restart halfway, say "finish, then we look."'],
  ['Nothing to borrow yet', 'Today every take-away has the beads right there, so nothing needs borrowing. Borrowing is a trick for a later stage.', 'Last day on one rod. Tomorrow: two rods, and the habit that makes mental math possible.'],
  // ── twocol (30–36)
  ['Two columns, left to right', 'Bigger numbers are just more rods. Add the tens first, then the ones, always left to right.', 'Problems have three lines now. Set the first number, then each line. The answer is what the beads say at the end.'],
  ['Tens first', 'The order is tens, then ones, even though school taught the opposite. You add in the order you say the number.', 'When a hand goes to the ones rod first, say "left to right" and wait. Slower for two weeks, faster for life.'],
  ['Set the first number, then each line', 'The paper holds the problem and the beads hold the answer. Nothing is written in between.', 'No scribbling, no running total on paper. The beads are the paper.'],
  ['Finish before you check', 'Finish the whole problem before you look at the answer. Then check, then redo if needed.', 'Restarting mid-problem teaches panic. Finishing teaches trust. Hold the line on this one.'],
  ['Say the move', 'Say what you are doing on each rod: "plus three, push three up." The words fall away on their own later.', 'Praise the move said out loud more than the right answer.'],
  ['Three lines, no tricks', 'Every problem today needs only free beads on every rod. The real soroban is the right tool now, not the screen.', 'They may be slower on the wooden one than on the screen. Fine. The hands are learning.'],
  ['Faster than paper', 'Three two-digit numbers on the beads should now be faster than on paper. If it is not yet, it will be this week.', 'Time one problem today, write the seconds in the margin. Tomorrow, time it again.'],
  // ── eyes (37–39)
  ['Eyes closed', 'Look at a number on the beads for one second, then close your eyes. Can you still see it? Say it.', 'This is the first step toward mental math. From today the flash round is soroban away, eyes closed.'],
  ['The picture', 'That picture in your head is called the mental abacus, and experts do all their math on it. Yours is tiny now and every stage makes it bigger.', 'Do not rush this one. A picture that forms slowly is still a picture.'],
  ['Fingers keep the picture', 'If the picture fades, tap the table with thumb and index finger as if the beads were there. Moving the fingers keeps the picture alive.', 'Let the fingers twitch. They are not cheating. They are the engine.'],
  // ── boss1 (40)
  ['Sprout Boss', 'Three short parts with a clock on each: read hundreds, set hundreds, and six direct problems. Pass all three and you have beaten the first boss.', 'Bosses take two or three tries, and that is how they are meant to work. Whatever happens, tomorrow is Part 2.'],
  // ── sf14 (41–46)
  ['Small friends: 1 and 4', 'Two numbers that make five are small friends: one and four, two and three. When you cannot add a number directly, add five and take away its friend.', 'The decision each problem is "free beads, or friend?" Ask it, then wait. Do not touch the beads.'],
  ['+1 = +5 −4', 'You have four on a rod and want to add one, and no earth bead is free. Bring the heaven bead down and push four earth beads away: plus one is plus five, take away four.', 'The first time they do it out loud, something changes in the room. Watch for it.'],
  ['+4 = +5 −1', 'Plus four when only one, two or three earth beads are free: bring the five down, send one away. Three plus four is plus five, minus one.', 'Have them say "plus four: add five, take away one" before the hand moves. The words run ahead of the fingers.'],
  ['Free beads, or friend?', 'Some problems today have free beads and some need the friend, so decide before you move. The decision is the skill.', 'Wrong decision, right beads? Still a miss. Right decision, slow hands? That is a win.'],
  ['Say the formula', 'Say the formula out loud as you move the beads, every time. The words fade on their own once the hand knows the move.', 'Praise the formula said out loud more than the right answer.'],
  ['The hand learns it', 'By now the move is starting to happen before the words. That is what automatic means, and it is the goal for every move in this book.', 'If they still hesitate on plus one, same page tomorrow. No moving on until it sticks.'],
  // ── sf23 (47–52)
  ['Small friends: 2 and 3', 'Two and three are the other pair that makes five. Plus two is plus five, take away three; plus three is plus five, take away two.', 'Two new moves, same trick. If they got 1 and 4, this week is faster.'],
  ['+2 = +5 −3', 'Three plus two: only one earth bead is free, so bring the five down and send three away. Four plus two, the same.', 'Ask "what is the friend of two?" and wait for "three." Then let the hand go.'],
  ['+3 = +5 −2', 'Two plus three: bring the five down, send two away. Four plus three, the same move.', 'Count the hesitation in your head. If it is under two seconds, the move is nearly automatic.'],
  ['All four adds', 'Plus one, plus two, plus three, plus four, all mixed with free-bead problems. Decide on every rod.', 'This is the page to repeat if any one friend is slower than the others. Spot which.'],
  ['Decide, then move', 'Look, decide, then move, in that order. A hand that moves before the decision is guessing.', 'Hands in your lap. Yours, I mean. The urge to reach for a bead is strongest this week.'],
  ['No hint today', 'Run the whole page without the formula card. If you need it, look, then do that problem again without it.', 'Last day of adding with friends. Tomorrow the friends show up inside real problems.'],
  // ── sfadd2d (53–59)
  ['Friends inside real problems', 'Now the formulas show up inside two-digit problems, four lines long. On each rod, ask the same question: free beads, or friend?', 'Real soroban today. Set the first number, then each line, saying each formula as it comes.'],
  ['Tens, then ones', 'Work left to right, tens rod first. A friend on the tens rod and free beads on the ones is the normal shape of a problem now.', 'If they do the ones first, say "left to right." Every time, for as long as it takes.'],
  ['One rod free, one rod friend', 'Thirteen plus twelve: tens one plus one, free beads; ones three plus two, friend. Every rod is its own decision.', 'Pick one problem and have them narrate both rods out loud. Then let the rest be quiet.'],
  ['Four lines', 'Four numbers in a row and the beads hold the running total the whole way. Nothing is written down until the end.', 'Watch for scribbling. The paper is for the problem, the beads are for the answer.'],
  ['Keep the eyes ahead', 'Read the next line while the hand finishes this one. The eyes lead, the hands follow.', 'Time one problem today and write it in the margin. Same problem type Friday. Watch it fall.'],
  ['Say it on every rod', 'Say the formula on every rod that needs one, even if you know the move. The saying is what makes it stick.', 'The saying gets quieter this week. Let it. Whispering counts.'],
  ['Ready for the other direction', 'You can now add any two-digit numbers as long as no rod goes past nine. Tomorrow the friends run backwards.', 'Nine out of ten today means Part 2 is halfway done. Say so out loud.'],
  // ── sfsub14 (60–65)
  ['Taking away with friends: 1 and 4', 'You have five and want to take away one, but no earth bead is at the beam to remove. Push the heaven bead up and bring four earth beads up: minus one is minus five, add four.', 'Backwards feels strange for about three days. Then it is the same move.'],
  ['−1 = −5 +4', 'Minus one when the rod shows five: heaven goes up, four earth beads come up. The rod shows four.', 'Ask "is there an earth bead to remove?" If not, friend.'],
  ['−4 = −5 +1', 'Six take away four: heaven goes up, one earth bead comes up. Eight take away four, the same.', 'Have them say "minus four: take away five, add one" before moving.'],
  ['Heaven goes up, earth comes up', 'For a small-friend take-away, the heaven bead goes up and earth beads come up, both in the same motion. Two moves, one breath.', 'Two fingers, one motion. If it is two separate motions, that is fine for now.'],
  ['Backwards is the same move', 'Minus one is plus one run backwards, and your hand already knows plus one. Trust it.', 'The flash round has four numbers now. Soroban away. Let a lost round go.'],
  ['Friend or free, taking away', 'Some take-aways today have the beads right there and some need the friend. Decide on every rod.', 'Count the hesitations. Fewer than yesterday is the whole report card.'],
  // ── sfsub23 (66–71)
  ['Taking away: 2 and 3', 'Minus two is minus five, add three. Minus three is minus five, add two. Same move, different friend.', 'Last two moves of the eight. Say so. Kids like knowing where the end is.'],
  ['−2 = −5 +3', 'Six take away two: heaven up, three earth beads up. The rod shows four.', '"What is the friend of two?" Wait for "three." Then the hand.'],
  ['−3 = −5 +2', 'Five take away three: heaven up, two earth beads up. Seven take away three, the same.', 'If they are mixing up the friend of two and the friend of three, go back one page tomorrow.'],
  ['All four take-aways', 'Minus one through minus four, mixed with direct take-aways. Decide on every rod.', 'Hands in your lap. The silence after "friend or free?" is where the learning is.'],
  ['Same move, different friend', 'Every small-friend take-away is the same motion, heaven up and earth up, and only the count of earth beads changes. Your hand knows this now.', 'Praise the motion, not the answer. "Heaven up, earth up, nice."'],
  ['Eight friends', 'You now own all eight small-friend moves, forwards and backwards. From tomorrow they all show up together.', 'Eight moves in a month. Put that on the fridge.'],
  // ── sfmix (72–79)
  ['All eight friends, mixed', 'Plus and minus together, two digits, four lines. The only rule you have not learned is what to do when a rod goes past nine or below zero, and these problems never do.', 'If they hesitate on a rod, do not give the answer. "Free beads, or friend?" and wait.'],
  ['Plus and minus together', 'A plus line and a minus line use the same friends, just in opposite directions. Read the sign as part of the number.', 'Today the flash round is two-digit numbers, free beads only. Say "thirty-four" as one chunk.'],
  ['The decision is the skill', 'On every rod of every line: free beads, or friend? Making that decision yourself is the whole point of the drill.', 'Every time you make the decision for them, you take a rep away. Wait longer than is comfortable.'],
  ['Four lines, both ways', 'Four lines with the sign changing is the shape of the Explorer boss. Run it like the boss: set, add, take away, read.', 'Time one problem. Write it in the margin. You will beat it by Friday.'],
  ['No column goes past nine', 'Every rod in these problems stays between zero and nine, so no carrying is needed. Carrying is the next stage, and it is built on this one.', 'If they ask about nine plus one, say "that is the next trick." Mystery is fuel.'],
  ['Hands before words', 'By now the hand should move before the formula is finished. Let the words trail off; the hand knows.', 'Whispering is fine. Silence is fine. A wrong move said out loud is still a miss.'],
  ['The words start to fade', 'You may notice you are not saying the formula any more. That is not forgetting; that is the move becoming yours.', 'If a move stops working when the words stop, bring the words back for a day.'],
  ['Automatic', 'Automatic means the decision and the move happen together, with nothing in between. That is what all eight friends should feel like today.', 'Tomorrow the clock comes out. Accuracy stays first.'],
  // ── speed (80–85)
  ['Speed round', 'Accuracy first, then speed. Ten problems, five lines each, and a time written in the box at the end.', 'Write the time on the fridge. Kids love watching a number fall.'],
  ['Beat yesterday', 'Try to beat yesterday\'s time without dropping below nine right. If you drop below nine, slow down tomorrow.', 'Nine out of ten slow beats seven out of ten fast. Say it until it is boring.'],
  ['Nine out of ten, then faster', 'Speed is what moves the skill from the hand to the mind. It is not a bonus; it is the point of this week.', 'If they rush and miss, say "slow is fine." Flat, like a fact.'],
  ['Trust the hand', 'Do not look at the beads to check between lines. Read the next line and let the hand finish.', 'Watch for checking eyes. "Trust the hand" is the only line today.'],
  ['Read ahead', 'Read the next line while the hand works. The sign is part of the number: "minus 23" is one chunk.', 'Read a problem aloud for them at a steady beat and let the hand follow. Dictation builds the ear.'],
  ['Your best time', 'Today is for the best time of the week. Same rules: nine right, then as fast as the hand can go.', 'Whatever the number, it is lower than Monday. Say that, and mean it.'],
  // ── mental (86–89)
  ['Mental: three small numbers', 'Put the soroban away and picture an empty rod. Add the numbers on your imaginary beads, free-bead moves only.', 'Head only today. No beads, no paper, no fingers on a real rod. The picture does the work.'],
  ['Picture an empty rod', 'Start every problem with a clear rod in your mind. Let each number push beads up on the picture, one at a time.', 'If the picture collapses into words, do one sum on the real soroban, close eyes, replay it, then back to the head.'],
  ['Tap the table', 'If the picture fades, tap the table with thumb and index finger as if the beads were there. Moving the fingers keeps the picture alive.', 'Fingers twitching on the table is the picture working. Do not stop it.'],
  ['The picture holds', 'Three numbers in the head, every time, with the picture steady. This is the floor the next nine stages are built on.', 'Tomorrow is the Explorer boss. Nothing new. Just the lessons, in a row, with a clock.'],
  // ── boss2 (90)
  ['Explorer Boss', 'Three parts: friend or free on one rod, four-line problems on the soroban, and three small numbers in the head. Pass all three and the eight small friends are yours for good.', 'Ninety days. Whatever the boss says today, they can read any number, add and take away with the first real technique, and hold a picture. Film it.'],
];

if (DAYS.length !== 90) throw new Error('DAYS has ' + DAYS.length + ' entries, expected 90');

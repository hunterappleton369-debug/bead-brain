// guide.js — parent guide and the plan page (content only).

export const GUIDE_HTML = `
<h1>Parent guide</h1>
<p class="muted">Everything you need to run this course at home. Read it once. Come back for the troubleshooting section when you need it.</p>

<div class="card tint-teal">
<h2>What you need</h2>
<ul>
<li><b>A soroban.</b> A 13-rod Japanese abacus (one heaven bead, four earth beads per rod). They cost about the price of a pizza online. Search "13 rod soroban". Avoid the Chinese suanpan with two top beads and five bottom beads, and avoid the ten-bead school abacus. The formulas in this course only work on a soroban.</li>
<li><b>This site</b> on a laptop or tablet. The screen abacus is for demonstrations and single-column drills. For real problems your child should use the physical soroban until the Ace stage, when most practice moves into the head.</li>
<li><b>Fifteen to twenty minutes a day</b>, six days a week. Short and daily beats long and weekly. Top Japanese students report that missing two or three days noticeably dulls the skill.</li>
<li><b>Paper and a pen</b> for writing times on the fridge. Kids like watching a number fall.</li>
</ul>
</div>

<div class="card">
<h2>Is your child ready?</h2>
<p>Most children start between five and seven. Before Sprout, your child should be able to count to 100, read two-digit numbers, and say which of two numbers is bigger. If "tens and ones" means nothing yet, spend a week on that first with coins or blocks.</p>
<p>This matters. In a one-year trial in a U.S. Public school, first graders taught mental abacus for two hours a week learned almost nothing, and the researchers traced it to missing place-value knowledge: only about a fifth could read a multi-digit number off the beads by year end. Sprout exists so that never happens here. Do not leave it until reading 3-digit numbers takes under three seconds.</p>
</div>

<div class="card">
<h2>How a session runs</h2>
<ol>
<li><b>Warm-up, 2 minutes.</b> Read ten numbers off the screen abacus, or do the first item of the daily quest.</li>
<li><b>Lesson or drill, 8–10 minutes.</b> One lesson per day at most. Read the short explanation together, press play on the demos, then do the drill. A lesson is done when the target is met. If it is not met, do the same drill again tomorrow. Do not move on.</li>
<li><b>Mental, 5 minutes.</b> From the second stage on, every day ends with a mental drill or flash round. This is the part that builds the mental abacus. Never skip it to make room for more bead work.</li>
<li><b>Log it, 1 minute.</b> Say the day's best time or score out loud. Once every two to four weeks, take the Bead Score test instead of the mental drill.</li>
</ol>
<div class="callout parent"><b class="lbl">Your job during a drill</b>Sit beside, not across. When your child hesitates, ask "free beads, or friend?" and wait. Do not touch the beads. Praise correct formulas said out loud more than correct answers.</div>
</div>

<div class="card">
<h2>The rules of the hand</h2>
<ul>
<li>Thumb pushes earth beads up. Index finger pushes earth beads down and moves the heaven bead. No other fingers.</li>
<li>Always work <b>left to right</b>: hundreds, then tens, then ones. This is the opposite of school column addition and it is the reason mental abacus works: you add in the order you say the number.</li>
<li>Say the formula out loud while learning it ("plus seven: take away three, carry one"). The words drop away on their own.</li>
<li>Never clear and restart mid-problem. Finish, check, then redo if wrong. Restarting teaches panic.</li>
<li>Speed comes after accuracy. A drill passed at 90% slow is worth more than 70% fast.</li>
</ul>
</div>

<div class="card">
<h2>How the game works</h2>
<ul>
<li><b>Stages.</b> Ten of them, Sprout to Legend. Each ends with a <b>Boss</b>: a short timed test in two to four parts. Pass it to earn the badge and unlock the next stage. You can also unlock a stage manually from its page if your child clearly already has the skill.</li>
<li><b>XP and levels.</b> Every correct answer earns XP. Mental and flash answers earn more. Levels are just a number that goes up. Children care about it more than you expect.</li>
<li><b>Streak.</b> Days in a row with at least one drill done. Protect it.</li>
<li><b>Daily quest.</b> Three short drills chosen for the current stage. Finishing all three in a day earns a bonus. On busy days, the quest alone is enough.</li>
<li><b>Bead Score.</b> A ladder test: twenty rungs from "add two small numbers" to "fifteen 3-digit numbers flashed at 0.2 seconds". The score is the highest rung cleared. It is taken with no soroban and no paper, so it measures mental math only. A second ladder covers multiplication and division.</li>
</ul>
</div>

<div class="card tint-orange">
<h2>Reading the ranking chart</h2>
<p>After each Bead Score test the chart shows your child's rung against four lines: typical for their age, top 25%, top 10%, and top 1%. Two things to know about those lines.</p>
<p><b>They are estimates, not a measured sample.</b> The "typical" line is built from what school curricula expect children to do in their heads at each age (adding within 20 by seven, two-digit sums by eight or nine, and so on), with a normal spread around it. No large public dataset of children's mental-arithmetic speed by age exists, so the lines are a reasoned guess, and the same guess for everyone. If someone gives you a precise national percentile for this skill, ask where the sample came from.</p>
<p><b>The honest number is your child's own line.</b> Each test adds a dot. The dots climbing is the proof that the training works. Use the age lines for motivation ("you are doing what most ten-year-olds cannot"), and use the dots for decisions.</p>
<p>What the rungs mean in plain terms: rung 5 is school arithmetic done in the head. Rung 8 is beyond anything a school grade requires. Most adults reach for a calculator. Rung 12 matches a Japanese 3rd-kyu mental calculation exam. Rung 15 matches the 1st-kyu exam. Rungs 16 and up are competition flash anzan.</p>
</div>

<div class="card">
<h2>Growing the mental abacus</h2>
<p>The picture in the head starts in Sprout with the "eyes closed" game and grows one rod at a time. Four things help:</p>
<ul>
<li><b>Finger movement.</b> Let your child tap the table with thumb and index finger as if the beads were there. Experiments with mental-abacus learners show that blocking hand movement slows them down. The motor plan is part of the picture. Advanced students stop on their own.</li>
<li><b>Dictation.</b> Read numbers aloud at a steady pace and have your child answer. Abacus schools run most mental practice this way. The site can do it with the browser's voice, and you can do it in the car.</li>
<li><b>Flash.</b> Numbers that vanish force the picture to do the work, because there is nothing to re-read. Start at one digit and one and a half seconds. Raise the speed only when accuracy holds.</li>
<li><b>Never switch to words.</b> If your child starts saying "sixty-two" in their head instead of seeing beads, the picture has collapsed. Go back one step: do the same sum on the real soroban, watch it, close eyes, replay it.</li>
</ul>
</div>

<div class="card">
<h2>Troubleshooting</h2>
<details><summary>Counting beads one by one</summary><p>Reading is too slow because the child counts. Go back to Sprout's peek drill and shorten the peek time until counting is impossible. Each digit has a shape. Learn the shapes.</p></details>
<details><summary>Using the school method on the beads</summary><p>Right-to-left habits creep in. Insist on left to right from the first lesson, every time. It is slower for two weeks and faster for life.</p></details>
<details><summary>Forgetting a formula mid-problem</summary><p>Normal in the first week of any formula. Use the Hint button. If it persists after a week, the previous group of formulas is not yet automatic: repeat that lesson's drill until it passes at 90% three days running.</p></details>
<details><summary>Stuck at a boss</summary><p>Look at which part fails. Each boss part maps to one or two lessons in the stage. Repeat those for three days, then retry the boss. Bosses are meant to take two or three attempts.</p></details>
<details><summary>Plateau in mental drills</summary><p>Plateaus of two weeks are standard and usually break overnight. Keep the daily mental drill at the current size. Do not increase digits until accuracy is steady above 80%. Add dictation for variety.</p></details>
<details><summary>Tears</summary><p>Stop for the day, with warmth, and shorten tomorrow's session. The streak counts a single drill. A child who associates the beads with pressure will not build a picture of them in the mind.</p></details>
<details><summary>Child under six</summary><p>Expect Sprout and Explorer to take twice as long. Keep sessions to ten minutes. Use the screen abacus more. If reading numbers does not click after a month, pause for a few months and come back.</p></details>
</div>

<div class="card tint-purple">
<h2>The science, honestly</h2>
<p>Abacus training has been studied more than most children's activities, and the evidence splits cleanly into what it does and what it does not do.</p>
<p><b>What it does.</b></p>
<ul>
<li><b>Builds fast, accurate arithmetic.</b> Three randomized trials found it: 204 children in India trained three hours a week for three years outperformed a control group that got extra ordinary math tuition (Barner et al., <i>Child Development</i>, 2016). 144 children in China trained two hours a week for five school years were better at arithmetic and at a visual working-memory task (Wang et al., <i>Journal of Neuroscience</i>, 2019). And a trial with older students found gains in calculation and spatial ability after 52 hours (Lu et al., <i>Current Psychology</i>, 2021).</li>
<li><b>Uses a different part of the brain.</b> Brain scans of experts show calculation lighting up areas for visual space and hand movement, not the language areas that untrained people use (Hanakawa et al., <i>NeuroImage</i>, 2003; Tanaka et al., <i>NeuroReport</i>, 2002). Experts can calculate while repeating words aloud. Untrained people cannot (Frank and Barner, <i>Journal of Experimental Psychology: General</i>, 2012).</li>
<li><b>The picture is real.</b> Experts' mistakes are often off by exactly five, a heaven bead in the wrong place (Stigler, <i>Cognitive Psychology</i>, 1984). The mental image holds about three to four rods at once, the same as the number of objects anyone can track by eye (Frank and Barner, 2012). That limit is why four-digit mental sums are hard for everyone and why this course grows one rod at a time.</li>
<li><b>Changes the brain's wiring.</b> Children with three or more years of training showed stronger white-matter connections in visual and motor pathways (Hu et al., <i>Human Brain Mapping</i>, 2011). These studies compare trained with untrained children at one point in time, so they show association, not proof of cause.</li>
</ul>
<p><b>What it does not do, as far as anyone can tell.</b></p>
<ul>
<li>It does not raise IQ. The one study claiming it had no proper control group. Trials with active controls find no change in reasoning tests.</li>
<li>It does not reliably improve memory or attention in general. Gains show up on tasks close to arithmetic and visual memory, and often not even there (Lo and Andrews, <i>Journal of Numerical Cognition</i>, 2022, found experts advantaged only on tasks requiring mental arithmetic).</li>
<li>It is not fast in a classroom. A U.S. Trial with first graders, two hours a week for a year, found no benefit. The dose that works in the trials is two to three hours a week for two or more years, with a solid grip on place value first.</li>
<li>It does not work equally for every child. In the India trial, children who started with weaker spatial working memory gained less. If your child struggles to hold the picture, slow down rather than push.</li>
</ul>
<p>So the fair claim is this: a child who finishes this course will do arithmetic in their head faster and more accurately than almost any adult, by a method with a real basis in how the brain stores pictures. Side benefits may exist. Do not buy the course for them.</p>
</div>

<div class="card">
<h2>How long it takes</h2>
<p>The stage times on the map assume a child of seven or older practising fifteen to twenty minutes a day, six days a week, with a parent beside them. On that schedule the ten stages add up to roughly fourteen to eighteen months to Prodigy, and the Grandmaster targets take another half year or more. Younger children, or a few sessions a week, will take longer, and that is fine. The test chart will still climb.</p>
<p>For comparison, the big commercial programs run two hours a week in class plus short daily homework: Mastermind Abacus takes about 30 months over ten levels, ALOHA about 24 months over eight, and UCMAS roughly four years over eleven. Japanese children in soroban clubs typically reach 6th or 7th kyu, with 3-digit sums done mentally, after about a year of two or three lessons a week. The home schedule here covers the same ground faster for one reason: one-on-one, every day, with the problems chosen so that each new move gets practised on its own before it is mixed in.</p>
</div>
`;

export const PLAN_HTML_TOP = `
<h1>The plan</h1>
<p class="muted">The whole course on one page: what gets taught, in what order, and why.</p>

<div class="card tint-teal">
<h2>Five principles</h2>
<ol>
<li><b>One new move at a time.</b> There are exactly 34 bead formulas in addition and subtraction. Each is taught alone, drilled with problems that force it, and only then mixed with the others. The problem generator checks every column of every problem against the formulas the child has learned, so a drill never springs an untaught move.</li>
<li><b>Read before you add.</b> Reading beads in a glance is the foundation of the mental picture. The first stage is only reading, setting and free-bead moves.</li>
<li><b>Mental from the start.</b> Eyes-closed reading begins in Sprout. From Explorer on, every stage has mental drills on the numbers the child has just learned on the beads. The abacus is a scaffold that gets removed one rod at a time.</li>
<li><b>Accuracy, then speed, then size.</b> A drill passes on accuracy. Then it is timed. Only then do the numbers get bigger or the lines more numerous.</li>
<li><b>Daily and short.</b> Fifteen to twenty minutes, six days a week. Boss tests, XP, streaks and the ranked Bead Score exist to make the daily session something a child asks for.</li>
</ol>
</div>
`;

export const PLAN_HTML_BOTTOM = `
<div class="card">
<h2>The 34 formulas</h2>
<p>A rod holds one heaven bead (5) and four earth beads (1 each). Whenever the beads you need are not free, you trade with a friend.</p>
<div class="two-col">
<div><h3>Small friends (make 5)</h3>
<div class="formula-grid">
<div class="formula small">+1 = +5 −4</div><div class="formula small">+2 = +5 −3</div><div class="formula small">+3 = +5 −2</div><div class="formula small">+4 = +5 −1</div>
<div class="formula small">−1 = −5 +4</div><div class="formula small">−2 = −5 +3</div><div class="formula small">−3 = −5 +2</div><div class="formula small">−4 = −5 +1</div>
</div></div>
<div><h3>Combination (both friends)</h3>
<div class="formula-grid">
<div class="formula combo">+6 = −5 +1 +10</div><div class="formula combo">+7 = −5 +2 +10</div><div class="formula combo">+8 = −5 +3 +10</div><div class="formula combo">+9 = −5 +4 +10</div>
<div class="formula combo">−6 = +5 −1 −10</div><div class="formula combo">−7 = +5 −2 −10</div><div class="formula combo">−8 = +5 −3 −10</div><div class="formula combo">−9 = +5 −4 −10</div>
</div></div>
</div>
<h3>Big friends (make 10)</h3>
<div class="formula-grid">
<div class="formula big">+9 = −1 +10</div><div class="formula big">+8 = −2 +10</div><div class="formula big">+7 = −3 +10</div><div class="formula big">+6 = −4 +10</div><div class="formula big">+5 = −5 +10</div><div class="formula big">+4 = −6 +10</div><div class="formula big">+3 = −7 +10</div><div class="formula big">+2 = −8 +10</div><div class="formula big">+1 = −9 +10</div>
<div class="formula big">−9 = +1 −10</div><div class="formula big">−8 = +2 −10</div><div class="formula big">−7 = +3 −10</div><div class="formula big">−6 = +4 −10</div><div class="formula big">−5 = +5 −10</div><div class="formula big">−4 = +6 −10</div><div class="formula big">−3 = +7 −10</div><div class="formula big">−2 = +8 −10</div><div class="formula big">−1 = +9 −10</div>
</div>
<p class="small muted">This is the same list the big programs teach (UCMAS counts 32 by folding the two ±5 carries into the plain carry). Order of teaching everywhere: small friends, big friends, combinations. Addition before subtraction within each.</p>
</div>

<div class="card">
<h2>How problems are generated</h2>
<p>Every add-and-subtract problem is run through a soroban simulator before it is shown. The simulator works each number left to right, exactly as a child would, and labels every column move as <span class="chip direct">direct</span>, <span class="chip small">small friend</span>, <span class="chip big">big friend</span> or <span class="chip combo">combo</span>, including the chain of carries. A drill asks for problems whose moves all lie inside the child's known set and which contain at least one example of the move being taught. Problems that fail are thrown away and new ones drawn. Running totals never go below zero until the Prodigy lesson on negatives. Multiplication and division problems are sized by digits. Division problems divide exactly unless the lesson is about remainders.</p>
<p>The result is that a child in the "+7, +8, +9" lesson will meet a 3 + 9 and never a 6 + 7, because 6 + 7 needs a combination move that comes two stages later.</p>
</div>

<div class="card">
<h2>Where the stages sit against the Japanese exams</h2>
<p>Japan has run graded soroban exams for a century. The two main bodies grade from 10th kyu (beginner) up to 1st kyu, then 1st to 10th dan. Mental calculation and flash anzan have their own ladders. Rough equivalents, for parents who like a yardstick:</p>
<table class="table">
<tr><th>Stage</th><th>Bead work</th><th>Mental</th></tr>
<tr><td>Sprout – Explorer</td><td>Pre-10th kyu: reading, setting, 5-formulas</td><td>Eyes-closed reading</td></tr>
<tr><td>Apprentice – Adept</td><td>About 9th–7th kyu (2-digit, 5–10 lines)</td><td>1-digit lines, then 2-digit pairs</td></tr>
<tr><td>Ace</td><td>About 6th–5th kyu (3–4 digit, 10 lines, timed)</td><td>Mental 4th kyu (2-digit × 5 lines). Flash 18th–13th kyu</td></tr>
<tr><td>Wizard – Champion</td><td>4th kyu work: 3×2 multiplication, 4÷2 division</td><td>Mental 3-digit × 3 lines. Flash 2-digit</td></tr>
<tr><td>Prodigy</td><td>—</td><td>Mental 3rd kyu to 1st kyu (3-digit × 5 to 10 lines). Flash 2nd–3rd dan</td></tr>
<tr><td>Grandmaster</td><td>—</td><td>Flash 5th–7th dan (ten 3-digit at 0.5–0.7 s). 4-digit mental lines</td></tr>
<tr><td>Legend</td><td>—</td><td>Flash 8th–10th dan (fifteen 3-digit at 0.2–0.4 s)</td></tr>
</table>
<p class="small muted">Japanese children in clubs typically reach 1st kyu bead work around the sixth grade. A dan grade in mental calculation is rare and usually takes four to six years. The physical-abacus exams above 5th kyu use 5- to 10-digit numbers and sixty problems in ten minutes. This course stops the bead work at four digits and puts the time into mental skill instead, because that is the skill a child keeps.</p>
</div>

<div class="card">
<h2>Sources used to build this plan</h2>
<ul class="small">
<li>Mastermind Abacus: program overview and method pages (mastermindabacus.com). Ten levels of about three months. Accuracy graded before speed.</li>
<li>UCMAS: program structure (ucmas.ca), International Grading Exam, class format with flash cards, listening and speed writing.</li>
<li>ALOHA Mind Math and SIP Abacus: course information and level pages.</li>
<li>Japan Chamber of Commerce and Nihon Shuzan Renmei exam specifications (shuzan.jp). Zenshuren exam specifications (soroban.or.jp). Japan Flash Anzan Association grade ladder (flash-anzan.jp).</li>
<li>Kojima, <i>The Japanese Abacus: Its Use and Theory</i>. Heffelfinger and Flom, <i>Abacus: Mystery of the Bead</i>. Sorobanexam.org.</li>
<li>Research papers cited in the parent guide.</li>
</ul>
</div>
`;

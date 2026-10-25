// guide.js — parent guide and plan page copy (content only). Rendered by app.js.

export const PLAN_INTRO = {
  eyebrow: 'The plan',
  title: 'Ten stages. One superpower.',
  lede: 'Your child learns the Japanese abacus, then learns to picture it. By the end, the math happens in their head faster than most adults can type it into a calculator. Here is how they get there.',
};

export const HOW_IT_MOVES = [
  { icon: 'watch', title: 'Watch', text: 'Each lesson opens with a short explanation and a bead demo you press play on. Two minutes.' },
  { icon: 'try', title: 'Try', text: 'Then a drill. Ten problems, chosen so they only use moves your child already knows.' },
  { icon: 'drill', title: 'Pass', text: 'Nine out of ten right and the lesson is done. Not yet? Same drill tomorrow. No moving on until it sticks.' },
  { icon: 'boss', title: 'Beat the boss', text: 'Every stage ends with a short timed test. Pass it, earn the badge, unlock the next stage.' },
];

export const TRICKS = [
  { cls: 'small', name: 'Small friends', line: 'Two numbers that make 5. Cannot add 3? Add 5 and take away 2.', eg: '+3 = +5 −2' },
  { cls: 'big', name: 'Big friends', line: 'Two numbers that make 10. Cannot add 8? Take away 2 and carry 1 to the next column.', eg: '+8 = −2 +10' },
  { cls: 'combo', name: 'Both at once', line: 'The last eight moves use both tricks together. After these there are no new rules, ever.', eg: '+7 = −5 +2 +10' },
];

export const FORMULAS_HTML = `
<div class="two-col">
<div><h4>Small friends (make 5)</h4>
<div class="formula-grid">
<div class="formula small">+1 = +5 −4</div><div class="formula small">+2 = +5 −3</div><div class="formula small">+3 = +5 −2</div><div class="formula small">+4 = +5 −1</div>
<div class="formula small">−1 = −5 +4</div><div class="formula small">−2 = −5 +3</div><div class="formula small">−3 = −5 +2</div><div class="formula small">−4 = −5 +1</div>
</div></div>
<div><h4>Both friends</h4>
<div class="formula-grid">
<div class="formula combo">+6 = −5 +1 +10</div><div class="formula combo">+7 = −5 +2 +10</div><div class="formula combo">+8 = −5 +3 +10</div><div class="formula combo">+9 = −5 +4 +10</div>
<div class="formula combo">−6 = +5 −1 −10</div><div class="formula combo">−7 = +5 −2 −10</div><div class="formula combo">−8 = +5 −3 −10</div><div class="formula combo">−9 = +5 −4 −10</div>
</div></div>
</div>
<h4>Big friends (make 10)</h4>
<div class="formula-grid">
<div class="formula big">+9 = −1 +10</div><div class="formula big">+8 = −2 +10</div><div class="formula big">+7 = −3 +10</div><div class="formula big">+6 = −4 +10</div><div class="formula big">+5 = −5 +10</div><div class="formula big">+4 = −6 +10</div><div class="formula big">+3 = −7 +10</div><div class="formula big">+2 = −8 +10</div><div class="formula big">+1 = −9 +10</div>
<div class="formula big">−9 = +1 −10</div><div class="formula big">−8 = +2 −10</div><div class="formula big">−7 = +3 −10</div><div class="formula big">−6 = +4 −10</div><div class="formula big">−5 = +5 −10</div><div class="formula big">−4 = +6 −10</div><div class="formula big">−3 = +7 −10</div><div class="formula big">−2 = +8 −10</div><div class="formula big">−1 = +9 −10</div>
</div>`;

export const GUIDE_HTML = `
<span class="eyebrow blue">Parent guide</span>
<h1>You do not need to be a math person.</h1>
<p class="lede">You need a soroban, fifteen minutes a day, and a chair next to your child. Everything else is on the screen. Read this once. Come back to "When it gets hard" when you need it.</p>

<section class="section">
<span class="eyebrow">What you need</span>
<h2>Three things</h2>
<div class="cols">
<div><h3>A soroban</h3><p>A 13-rod Japanese abacus: one bead above the beam, four below. Search "13 rod soroban". Not the Chinese one with two top beads, and not the ten-bead school abacus. The tricks only work on a soroban.</p></div>
<div><h3>This site</h3><p>On a laptop or tablet. The screen abacus is for demos and the first lessons. For real problems your child uses the physical one, until the Ace stage when most practice moves into the head.</p></div>
<div><h3>Fifteen minutes</h3><p>Six days a week. Short and daily beats long and weekly. A few days off and the skill goes dull, so protect the streak.</p></div>
</div>
</section>

<section class="section">
<span class="eyebrow">Ready?</span>
<h2>Start when your child can count to 100</h2>
<p class="measure">Most children start between five and seven. Before the first stage they should count to 100, read a two-digit number, and say which of two numbers is bigger. If "tens and ones" means nothing yet, spend a week on that with coins or blocks first. The first stage is only reading beads, and it stays until reading a three-digit number takes under three seconds. That one habit is what makes everything after it work.</p>
</section>

<section class="section">
<span class="eyebrow">A session</span>
<h2>Fifteen minutes, four parts</h2>
<div class="daybar"><div class="d1">Warm-up<small>2 min</small></div><div class="d2">Lesson or drill<small>8–10 min</small></div><div class="d3">Mental<small>5 min</small></div><div class="d4">Log<small>1</small></div></div>
<ol class="measure">
<li><b>Warm-up.</b> Read ten numbers off the screen abacus, or do the first item of the daily quest.</li>
<li><b>Lesson or drill.</b> One lesson a day at most. Read the short explanation together, press play on the demos, then do the drill. Target not met? Same drill tomorrow. Do not move on.</li>
<li><b>Mental.</b> From the second stage on, every day ends with a mental drill or a flash round. This is the part that builds the picture. Never skip it to fit in more bead work.</li>
<li><b>Log it.</b> Say the day's best time out loud. Every two to four weeks, take the Bead Score test instead of the mental drill.</li>
</ol>
<div class="tip parent"><img src="img/coach-bolt-sm.webp" alt=""><div class="bubble"><span class="who">Your job during a drill</span>Sit beside, not across. When they hesitate, ask "free beads, or friend?" and wait. Do not touch the beads. Praise the formula said out loud more than the right answer.</div></div>
</section>

<section class="section">
<span class="eyebrow">Hands</span>
<h2>Five rules of the hand</h2>
<ul class="measure">
<li><b>Thumb up, index down.</b> The thumb pushes bottom beads up. The index finger pushes them down and moves the top bead. No other fingers.</li>
<li><b>Left to right.</b> Hundreds, then tens, then ones. The opposite of school, and the reason mental math works: you add in the order you say the number.</li>
<li><b>Say the move.</b> "Plus seven: take away three, carry one." The words fall away on their own.</li>
<li><b>Never restart mid-problem.</b> Finish, check, then redo. Restarting teaches panic.</li>
<li><b>Accuracy, then speed.</b> Nine out of ten slow beats seven out of ten fast.</li>
</ul>
</section>

<section class="section">
<span class="eyebrow">The game</span>
<h2>How the game works</h2>
<ul class="measure">
<li><b>Stages.</b> Ten, Sprout to Legend. Each ends with a <b>Boss</b>, a short timed test. Pass it for the badge and the next stage.</li>
<li><b>XP and levels.</b> Every right answer earns XP. Mental and flash answers earn more. Kids care about the level more than you expect.</li>
<li><b>Streak.</b> Days in a row with at least one drill. Protect it.</li>
<li><b>Daily quest.</b> Three short drills for the current stage. All three in a day earns a bonus. On a busy day the quest alone is enough.</li>
<li><b>Bead Score.</b> A twenty-rung ladder from "add two small numbers" to "fifteen three-digit numbers flashed at 0.2 seconds". Taken with no soroban and no paper, so it measures the mental skill only. The chart shows the climb against typical children of the same age.</li>
</ul>
</section>

<section class="section">
<span class="eyebrow">Help</span>
<h2>When it gets hard</h2>
<div class="measure">
<details><summary>Counting beads one by one</summary><p>Reading is slow because the child counts. Go back to the Sprout peek drill and shorten the peek until counting is impossible. Each digit has a shape. Learn the shapes.</p></details>
<details><summary>Using the school method on the beads</summary><p>Right-to-left habits creep in. Insist on left to right from the first lesson, every time. Slower for two weeks, faster for life.</p></details>
<details><summary>Forgetting a formula mid-problem</summary><p>Normal in the first week of any formula. Use the Hint button. If it lasts past a week, the previous group is not automatic yet: repeat that lesson's drill until it passes three days running.</p></details>
<details><summary>Stuck at a boss</summary><p>Look at which part fails. Each part maps to one or two lessons in the stage. Repeat those for three days, then retry. Bosses are meant to take two or three attempts.</p></details>
<details><summary>Plateau in mental drills</summary><p>Two-week plateaus are standard and usually break overnight. Keep the daily mental drill at the same size. Add dictation for variety.</p></details>
<details><summary>Tears</summary><p>Stop for the day, warmly, and shorten tomorrow's session. The streak only needs one drill. A child who links the beads with pressure will not build a picture of them.</p></details>
<details><summary>Child under six</summary><p>Expect the first two stages to take twice as long. Ten-minute sessions. Use the screen abacus more. If reading numbers does not click after a month, pause for a few months and come back.</p></details>
</div>
</section>

<section class="section">
<span class="eyebrow purple">The science</span>
<h2>Why it works, in three lines</h2>
<div class="cols">
<div><h3>It is proven to build speed</h3><p>Three randomized trials, in India, China and with older students, found abacus-trained children faster and more accurate at arithmetic than children given extra ordinary math.</p></div>
<div><h3>It uses a different part of the brain</h3><p>Brain scans of experts show calculation lighting up the areas for pictures and hand movement, not the language areas the rest of us use. They can calculate while talking.</p></div>
<div><h3>The picture is real</h3><p>When experts slip, they are often off by exactly five: one top bead in the wrong place. The picture in the head is a real abacus, and this course grows it one rod at a time.</p></div>
</div>
<p class="small faint" style="margin-top:18px">Barner et al., <i>Child Development</i> 2016 · Wang et al., <i>Journal of Neuroscience</i> 2019 · Lu et al., <i>Current Psychology</i> 2021 · Hanakawa et al., <i>NeuroImage</i> 2003 · Frank and Barner, <i>JEP: General</i> 2012 · Stigler, <i>Cognitive Psychology</i> 1984.</p>
</section>

<section class="section">
<span class="eyebrow">Timing</span>
<h2>How long it takes</h2>
<p class="measure">At fifteen to twenty minutes a day, six days a week, a child of seven or older reaches Prodigy in roughly fourteen to eighteen months, and the Grandmaster targets take another half year or more. Younger children, or a few sessions a week, take longer, and that is fine. The chart still climbs. For comparison, the big classroom programs take two to four years to cover the same ground, because they are weekly and in groups. This is daily and one-on-one.</p>
</section>
`;

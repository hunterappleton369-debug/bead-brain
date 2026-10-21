# Prodigy Secrets Program: the printable lesson library

The $997 gift on `free-abacus/university.html` that a parent keeps even if they cancel: every stage of the course on paper, outside the app. Built 2026-10-21 to BUILD-BRIEF section 5.2.

## What is in the folder

| File | Purpose | Status | Words | Deslop | FK raw | FK, tables stripped |
|---|---|---|---:|:-:|:-:|:-:|
| `README.md` | This file, for Hunter and the designer (no grade target) | needs Hunter | 1,730 | 5/5 | 10.2 | 7.7 |
| `00-how-to-use.md` | Two pages to read first: the 15-minute routine, the week, the hand, the four move colors, how a lesson page runs, when to take a boss | ready | 956 | 5/5 | 2.5 | 2.5 |
| `stage-01-sprout.md` | Stage opener, 8 lessons, 2 quest cards, boss pointer, trainer page, answers | ready | 3,499 | 5/5 | 2.1 | 2.1 |
| `stage-02-explorer.md` | Stage opener + small-friend table, 8 lessons, 3 quest cards, boss pointer, trainer page, answers | ready | 4,116 | 5/5 | 1.7 | 1.6 |
| `stage-03-apprentice.md` | Opener + big-friend table, 9 lessons, 3 quest cards, boss pointer, trainer page, answers | ready | 5,184 | 5/5 | 1.9 | 1.7 |
| `stage-04-adept.md` | Opener + combination table, 8 lessons, 3 quest cards, boss pointer, trainer page, answers | ready | 4,763 | 5/5 | 2.1 | 2.1 |
| `stage-05-ace.md` | 9 lessons (speed, flash, listening, first Bead Score), 3 quest cards, answers | ready | 4,808 | 5/5 | 2.2 | 2.2 |
| `stage-06-wizard.md` | 7 lessons (times tables, multiply on the beads and in the head), 3 quest cards, answers | ready | 3,437 | 5/5 | 2.6 | 2.6 |
| `stage-07-champion.md` | 7 lessons (divide, remainders, 3-digit head sums, 2-digit flash), 3 quest cards, answers | ready | 3,450 | 5/5 | 2.5 | 2.5 |
| `stage-08-prodigy.md` | 9 lessons, all mental (incl. money and below zero), 3 quest cards, answers | ready | 4,225 | 5/5 | 2.6 | 2.6 |
| `stage-09-grandmaster.md` | 6 lessons at dan level, 3 quest cards, answers | ready | 3,191 | 5/5 | 2.8 | 2.6 |
| `stage-10-legend.md` | 5 open-ended targets, 2 quest cards, answers | ready | 2,878 | 5/5 | 2.7 | 2.7 |
| `boss-tests.md` | All 10 boss tests (33 parts) with counts, pass marks and time limits from `js/curriculum.js` `boss.parts`, score boxes, answers | ready | 4,617 | 5/5 | 2.9 | 2.9 |
| `lesson-index.md` | Numbered list of all 76 lessons and 28 quest cards with their files and drill types. The count is stated plainly | needs Hunter (102 claim) | 1,091 | 5/5 | 9.7 | 3.8 |
| `tools/build.mjs` | Builds every stage file, `boss-tests.md` and `lesson-index.md` from the curriculum plus the hand-written words | ready | | | | |
| `tools/problems.mjs` | Seeded drill generator: imports `js/generator.js` and `js/soroban.js`, checks every problem against the lesson's moves | ready | | | | |
| `tools/verify.mjs` | Independent re-check of every printed problem in `tools/drills.json` | ready | | | | |
| `tools/content/stage-01.mjs` … `stage-10.mjs`, `bosses.mjs` | The hand-written words: openers, lesson prose, parent lines, trainer pages | ready | | | | |
| `tools/drills.json` | Every printed problem and answer, written by the build | generated | | | | |

Word counts leave out table rules and blank answer boxes but keep the drill numbers. The library totals about 46,200 words: about 31,300 with letters in them, of which about 10,800 are hand-written prose. The rest is the drills and answers, plus the parts every page repeats. That is over the brief's 30,000 to 40,000 target, because every lesson carries ten full problems and the later stages print 10- and 15-line columns. Lesson pages run 240 to 453 words, 332 on average.

The FK grade on the hand-written prose alone is 2.8 (10,804 words, deslop 5/5). The FK raw column runs the checker on the file as is. The stripped column drops every table line first, as the brief asks. `lesson-index.md` is mostly tables, which is why its raw number is high.

## How each lesson page is built

Every one of the 76 lessons has the same parts, in the order the brief sets: number and exact title, a meta line (lesson number, minutes, what you need), "By the end, your child can", the move in prose, a worked example on the beads with `[beads: n]` tokens, the parent line (marked `✎`, set in Caveat), a ten-problem drill with its pass mark, "Stuck?", a workbook cross-reference for Stages 1 and 2, and the next lesson. Answers sit at the back of each stage file.

- **Titles, order, minutes and pass marks** come straight from `js/curriculum.js`. A pass mark is the smallest score that meets the lesson's `target.acc` on ten problems (the app's own test in `js/drills.js`). Time targets are scaled from the app's count to ten problems.
- **Drills** are made by `tools/problems.mjs` with the app's generators and the lesson's own `allow` and `require` lists, seeded per lesson so a rebuild prints the same book. Multiply problems are re-run as small products added on a model soroban, and divide problems as take-aways on one.
- **Worked examples** are generated too. The build runs each one on the soroban model, writes out every rod move, and fails if an example uses a move the lesson does not allow.
- **Hand-typed arithmetic** in the prose ("13 − 9 = 4" and the like) is checked by the build. All 11 such statements are true.
- **"Stuck?"** lines are the exact wording of `stuckHelp()` in `js/coach.js`. Where that falls back to the app-only "Press Hint" line, the page uses `coachTip()` from the same file, because paper has no Hint button.
- **Stage openers** give the level goal, the drill types used, the accuracy-before-speed rule and where the stage sits on the UCMAS modules, the Japanese kyu exams and the flash anzan ladder, using only the rung notes in `js/ladder.js` and BUILD-BRIEF section 3.
- **The last page of each stage** says what the trainer adds (animation, grading, exact flash speeds, the chart) without a hard sell, so the book points to the software (value ladder).
- **Quest cards** (28) use each stage's `daily` drills at the app's size, with the app's default 80 percent pass mark.

Verification, last run: `verify.mjs` checked 1,120 printed problems (76 lessons, 28 quests, 33 boss parts) with 0 errors. It checks each answer and the size of each problem. It checks the allowed and required moves. It checks pass marks, time limits and repeats. One-rod pages may repeat a problem when the lesson only has four to six cases, as the workbook does, but never twice in a row.

### Four print-only drill changes

The printed drill keeps the app's size and moves for every lesson except these four, where the app drill does not practise what the lesson teaches:

| Lesson | App drill | Printed drill |
|---|---|---|
| 3.8 Mental: small friends in the head | small-friend moves allowed, none required | at least one small friend required, as the lesson text says |
| 3.9 Mental: crossing ten | carries allowed, none required | at least one carry or borrow required |
| 8.8 Decimals and money | 4-digit sums | the same sums printed as dollars and cents |
| 8.9 Below zero | six 2-digit lines that never go below zero | sums that go below zero, checked with the borrow-100 method the lesson teaches |

## Rebuild and check

From the repo root:

```bash
node docs/products/prodigy-secrets-program/tools/build.mjs
node docs/products/prodigy-secrets-program/tools/verify.mjs
cd docs/products/prodigy-secrets-program
for f in 00-how-to-use.md stage-*.md boss-tests.md lesson-index.md; do
  python3 ~/.claude/skills/slopmonster/tools/deslop.py "$f" | tail -1
  python3 ../tools/readlevel.py "$f" | grep grade
done
```

To print, `npx md-to-pdf 00-how-to-use.md stage-*.md boss-tests.md lesson-index.md` (MIT, https://github.com/simonhaenisch/md-to-pdf). It honours the `<div class="page-break"></div>` markers. Not run here, so no PDFs are checked in.

## Repos

None cloned. `pove/soroban` (MIT) was optional, for drawing bead cards. The pages keep `[beads: n]` tokens for the designer instead: 248 of them in the stage files and the bosses. `js/abacus.js` already draws a soroban as SVG and is the simpler route.

## For the designer

- Layout per `DESIGN.md`: Unbounded headings, Inter body, Caveat for every `✎` line, flat pop colors, no gradients. Stage colors follow `js/curriculum.js` (`stage.color`). Move colors: direct green, small friend orange, big friend blue, combination purple.
- Every `[beads: n]` token becomes a soroban picture of n.
- Drill tables are soroban practice columns: numbers right-aligned, sign on the left, a big answer box under each.
- Start each lesson on a new page. Each file carries a designer note at the top.

## Open items for Hunter

1. **[HUNTER: page says 102; app has 76 lessons + 28 quests. Change the page to "100+" or add lessons.]** `university.html` promises "all 10 stages, 102 training lessons". This library has 76 lessons and 28 quest drills, 104 drill pages, plus 10 boss tests. `lesson-index.md` states the real count.
2. **[HUNTER: four bead demos in `js/curriculum.js` use a move their lesson has not taught yet.]** The app's own classifier (`js/soroban.js`) labels them: "21 + 36" in Lesson 1.7 (direct only) needs a small friend on the tens rod. "8 + 6" in Lesson 3.2 is a combination, not a big friend. "195 + 8" in Lesson 3.4 and "203 − 7" in Lesson 3.7 are combinations, which come in Stage 4. This library uses other examples. The app files were not touched.
3. **[HUNTER: decide whether the app's "Below zero" drill should go below zero.]** The app drill for Lesson 8.9 never does. The printed page does.
4. **[HUNTER: flash speeds under 0.7 seconds cannot be run by hand.]** Stage 9 and 10 flash pages, and the boss parts at those speeds, tell the parent to use the trainer for the true beat and to run the paper version as a listening drill. If the gift must stand fully alone after a cancel, those pages need a note on what a cancelled member can still use.
5. **[HUNTER: confirm the gift is the whole course.]** The brief and this library treat "keep it even if you cancel" as all 10 stages on paper. If the page means something narrower, the files still stand, but the funnel copy should match.

<!-- status: needs Hunter: 102-lesson claim on university.html; four curriculum demos to fix in js/curriculum.js -->

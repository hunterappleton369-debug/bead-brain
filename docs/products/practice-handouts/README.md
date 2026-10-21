# Practice handouts

The "Unlimited Phenom-U Practice Handouts, printed on demand, matched to the exact lesson" ($297 on `free-abacus/university.html`). One printable sheet for every lesson in the app, one boss-prep sheet per stage, and the tool that prints a fresh, checked copy of any of them.

## What is here

| File | Purpose | Status | Words | Deslop | FK grade |
|---|---|---|---|---|---|
| `README.md` | This file (internal, no grade target) | ready | ~1,570 | 5/5 | 12.2 with tables, 8.4 stripped |
| `parent-guide.md` | One page for parents: which sheet when, how to time it, what score means "move on" | needs Hunter: member link for fresh sheets | 491 | 5/5 | 2.0 |
| `handout-template.md` | The one-page layout, zone by zone, plus a blank sheet to print | ready | 446 (prose) | 5/5 | 2.4 |
| `handout-catalog.md` | Table of all 86 sheets: stage, lesson, drill type, problems, pass mark, time goal (generated) | ready | 2,644 | 5/5 | 48.7 with the table, 2.7 with it stripped |
| `samples/stage-NN-<lesson-key>.md` | 76 lesson sheets, one per lesson in `js/curriculum.js` | ready | 86 files | 5/5 on all 86 | 1.0 to 3.6 (all 86) |
| `samples/stage-NN-boss-prep.md` | 10 boss-prep sheets, a paper copy of each stage's boss test | ready | (in the 86) | 5/5 | (in the range above) |
| `samples/manifest.json` | Every problem and answer on every sample, for re-checking | ready | | | |
| `tools/make-handouts.mjs` | The generator and checker (below) | ready | | | |
| `tools/lesson-notes.mjs` | The written half of each sheet: "today's move" for all 76 lessons, the "how" line per drill shape, the "stuck?" line picker | ready | | | |
| `tools/handout.css` | Print stylesheet (Letter/A4, stage colors, soroban columns, answer boxes, fold strip). Mirrors `printWorksheet` in `js/app.js` and `DESIGN.md` | ready | | | |
| `tools/md-to-pdf.config.json` | md-to-pdf settings: Letter, half-inch margins, this stylesheet | ready | | | |
| `tools/render-pdf.sh` | Turns any sheet into a PDF (md-to-pdf to HTML, stylesheet added, Chrome prints it) | ready | | | |

No PDFs are checked in, per the brief. Commands to make them are below.

## How a sheet is built

`tools/make-handouts.mjs` imports the app itself: `js/curriculum.js` (lesson, drill kind, `allow`/`require` formula lists, pass target), `js/generator.js` (the same `genAddSub`, `genTwoColumn`, `genMul`, `genDiv`, `genFlash`, `genFact`, `genRead` the app drills with), `js/soroban.js` (the formula classifier) and `js/coach.js` (parent line per stage, "stuck?" wording). `Math.random` is seeded (mulberry32, as in `docs/products/tools/gen.js`), so the same seed always gives the same sheet.

Page shapes, matched to each lesson's drill:

| Drill in the app | Sheet |
|---|---|
| `set` | 20 numbers to set. The grown-up ticks each box |
| `read` | 20 soroban pictures (drawn as SVG from the number) with answer boxes. Peek lessons tell the grown-up how long to show each |
| `single`, `twocol`, `addsub` | 2 rows × 10, numbers stacked, sign on the left, rule, big answer box. Single-column lessons that teach a new friend mix in about 30% free-bead decoys so the child must decide every time, as the workbook does |
| `addsub`, mental | Same layout, no soroban, "write only the answer" |
| `addsub`, spoken (listening) | Page 1: 20 answer boxes. Page 2: the numbers to read aloud, the pace, the totals |
| `flash` | Page 1: answer boxes. Page 2: the rounds, the beat in seconds and metronome beats a minute, the totals. At beats too fast to read aloud (under 0.7 s, or 3-digit under 1 s) the page says so and points to the app's flash trainer |
| `facts`, `mul`, `div` | 4 columns × 5 rows with wide answer boxes. Remainder sheets get a second "r" box |
| `p-decimals` | Money amounts ($12.75), answers with the dot |
| `p-negative` | Problems whose total ends between −1 and −99, so one borrowed 100 covers it, as the lesson teaches |

Pass marks are the lesson's own `target.acc` from `curriculum.js`, rounded up over 20 problems (0.9 → 18 of 20, 0.85 → 17, 0.8 → 16, 0.75 → 15). Time goals come from `target.maxSec`, scaled to 20 problems. Boss-prep sheets copy the boss exactly: same parts, counts, pass marks and time limits.

## Checks: every problem, every sheet

After building, the tool re-checks each problem from its printed numbers with `js/soroban.js`, in code that shares nothing with the generators (the `docs/products/tools/verify.js` pattern): every bead move inside the lesson's `allow` list. The lesson's new move present (`require`) on every non-decoy problem. Decoys are free-bead moves only. Single-column problems never leave the rod. Digits and line counts match the spec. No running total below zero (except Below zero, checked with the borrowed 100). Answers recomputed. Division `n = d × q + r`, `r < d`, dividend as big as the lesson title says. No problem repeated back to back. Exit code is 1 on any failure.

Last run, from the repo root:

```
node docs/products/practice-handouts/tools/make-handouts.mjs --all
wrote 86 sheets to docs/products/practice-handouts/samples
verified: 86 sheet(s), 1716 problems, 0 outside allowed moves, 0 with any error, 0 repeated back to back

node docs/products/practice-handouts/tools/make-handouts.mjs --verify
verified: 86 sheet(s), 1716 problems, 0 outside allowed moves, 0 with any error, 0 repeated back to back
```

The checker was also tested against a tampered manifest (one wrong answer, one big-friend move slipped into the +1/+4 lesson). It caught both and exited 1.

## Commands

Run from the repo root (`/Users/hunterappleton/Desktop/Bead-Brain`).

```bash
# one sheet, fresh numbers (change --seed for a new copy; same seed = same sheet)
node docs/products/practice-handouts/tools/make-handouts.mjs --stage 3 --lesson carry-chain --count 20 --seed 7 --out /tmp/carry.md

# a boss-prep sheet
node docs/products/practice-handouts/tools/make-handouts.mjs --stage 5 --lesson boss --out /tmp/ace-boss.md

# a whole new set of 86 sheets somewhere else (the samples and catalog stay as they are)
node docs/products/practice-handouts/tools/make-handouts.mjs --all --seed 2 --outdir /tmp/handouts-set-2

# rebuild the samples, the catalog and the manifest
node docs/products/practice-handouts/tools/make-handouts.mjs --all

# re-check the samples, or any manifest
node docs/products/practice-handouts/tools/make-handouts.mjs --verify

# every stage and lesson key
node docs/products/practice-handouts/tools/make-handouts.mjs --list

# PDFs (into any folder you name)
docs/products/practice-handouts/tools/render-pdf.sh /tmp/handout-pdfs docs/products/practice-handouts/samples/*.md
```

On a machine where md-to-pdf's own Chrome launches, this one-step path also works, from `docs/products/practice-handouts`:

```bash
npx md-to-pdf@5.2.4 --config-file tools/md-to-pdf.config.json samples/stage-03-carry-chain.md
```

The `.md` files hold no styling of their own (so the copy checkers read only the words). The look comes from `tools/handout.css`, which both paths apply.

## Layout check

Fourteen samples covering every page shape (bead reading, setting, single column with formula chips, 10- and 15-line stacks, mental, listening, flash at 1.5 s and 0.2 s, times tables, 3×3 multiplication, remainders, money, below zero, two boss-prep sheets) plus the template were rendered to Letter PDF and inspected. Every lesson sheet fits one page. Flash, listening and boss sheets with a read-aloud part run to exactly two. The answer strip sits at the foot of page 1, so it folds under.

## Frameworks used

- **Proven-program drill types** (brief §3. UCMAS, Japanese kyu exams, flash anzan grading): written sheets on the soroban, dictation (the listening sheets), flash, mental, timed. Accuracy before speed: time goals only count once the pass mark is met, and the parent guide says so.
- **Real soroban practice sheets** and the app's `printWorksheet`: stacked numbers, sign on the left, 2 × 10, big answer boxes, answers under a fold.
- **Value ladder** (brief §3): sheets point back to the app where paper falls short (flash beats too fast to read aloud), and the parent guide ties each sheet to the lesson in the app.

## Repos

| Repo | License | How used |
|---|---|---|
| [simonhaenisch/md-to-pdf](https://github.com/simonhaenisch/md-to-pdf) v5.2.4 (npm, gitHead `b809b86`) | MIT | Run with `npx`, not cloned. Markdown to HTML (and PDF where Puppeteer launches). No code copied into this folder. |

No soroban worksheet repo was cloned: the app's own generators already produce verified problems for every lesson, so a third-party generator would only have added a second, unverified rule set. No GPL code or text is used.

## Open items for Hunter

1. **Where members print fresh sheets.** The product promises "printed on demand". Today that means this tool or the 86 samples. Pick one: host the PDFs (or several seeds of them) in the member area, or add a "print this lesson's sheet" button in the app that calls the same generator. `parent-guide.md` has a `[HUNTER]` placeholder for the link.
2. **102 vs 76.** The pages say 102 lessons. The app has 76 lessons + 28 daily quests. These sheets cover all 76 lessons and all 10 bosses. Quest days reuse lesson sheets (see the parent guide). Change the page to "100+" or add lessons.
3. **Fonts.** The stylesheet loads Unbounded, Inter and Caveat from Google Fonts. Offline printing falls back to system fonts. Fine, but say so if the designer wants them embedded.
4. **The app's `p-negative` drill never goes below zero.** `genAddSub` rejects negative totals, so the in-app "Below zero" drill practises ordinary 6-line sums. The sheet does what the lesson teaches. Worth a fix in `js/` by whoever owns it.
5. **Division sizes.** The app's `genDiv` can give a 1-digit dividend in "Divide 2-digit by 1-digit" (and 3-digit dividends in "4-digit ÷ 2-digit"). The sheets enforce the size in the lesson title. The app does not.

<!-- status: needs Hunter: member delivery link (item 1) -->

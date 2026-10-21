# Products: everything the free-abacus funnel promises

Manuscripts, lesson libraries, course material, marketing copy and legal pages for the offers sold on `free-abacus/` (index → university → certify → thanks). Drafted 2026-10-20 and 2026-10-21. Nothing here is wired into the site. The funnel pages, `js/`, `css/` and `index.html` were not touched by any builder.

Start with `BUILD-BRIEF.md` (the rules, the facts sheet and the specs every builder followed) and `REVIEW.md` (the 2026-10-21 audit: status per folder, what Hunter must do before launch, and the verdict).

## Index

| Folder or file | What it is | Sold where | Status |
|---|---|---|---|
| `BUILD-BRIEF.md` | The one brief: hard rules, facts you may use, voice and grade targets, frameworks, specs per deliverable. | | reference |
| `REVIEW.md` | Reviewer's audit of every folder, the before-launch list, the verdict. | | reference |
| `playbook.md` | **Child Prodigy Secrets: The Playbook.** Nine chapters plus a science appendix and formula card, ~13,600 words. | Kit page ($47 value) | needs Hunter: deslop 1/5, a 20-minute fix |
| `workbook.md` | **Prodigy Maker Workbook.** Ninety daily pages for Stages 1 and 2, with the answer key, ~19,700 words. | Order bump ($27) | ready for design |
| `audiobook-notes.md` | Recording guide for the Playbook audiobook. | Order bump | ready |
| `bonus-guides/` | **Valedictorian Secrets** and **Win the Future: The Career-Picking Guide**, with cover notes. | University stack ($97 each) | needs Hunter: covers, two wording confirmations |
| `prodigy-secrets-program/` | **Prodigy Secrets Program.** The printable lesson library: 76 lessons, 28 quest cards and 10 boss tests across all 10 stages, with the generator and verifier. | University gift ($997) | ready; designer renders the bead pictures |
| `practice-handouts/` | **Phenom-U Practice Handouts.** Template, parent guide, catalog, 86 sample sheets and the generator that makes fresh ones. | University stack ($297) | ready; Hunter picks where members print |
| `certification-course/` | **Full Certification Course Library.** Syllabus, 20 lesson scripts with drills, the 40-question exam in three forms, Pass Promise operations, certificate wording. | Certify page ($297 once) | needs Hunter: record videos, pick exam host |
| `instructor-launch-kit/` | Class plans, drills, pricing sheet, parent flyer, sign-up script, first-class checklist, directory listing spec, intake form, progress report. | Certify stack ($297 value) | needs Hunter: directory page, badge art, 13 decisions |
| `marketing-sequences/` | 41 emails, 5 texts and 5 ad angles: soap opera, abandon cart, trial onboarding, shipping, Seinfeld bank, certification, ad copy, SMS bank, send map. | Every step | needs Hunter: 5 memory lines, consent line, provider |
| `legal-and-ops/` | Privacy policy, terms, refund policy and earnings disclaimer (markdown and HTML), consent text, instructor agreement, Stripe setup, ops runbook, support macros, launch checklist. | Every page footer | needs Hunter: counsel review, business details |
| `tools/` | `gen.js`, `build.js`, `verify.js`, `text.js` (the workbook problem pipeline) and `readlevel.py` (the reading-grade checker every folder reports). | | ready |

Each folder has its own `README.md` with every file, its purpose, status, word count, deslop score and reading grade, plus the open `[HUNTER]` items.

## Checkers

Run from the repo root on any parent-facing or marketing file:

```bash
python3 ~/.claude/skills/slopmonster/tools/deslop.py <file>      # must print score 5/5
python3 docs/products/tools/readlevel.py <file>                   # Flesch-Kincaid grade; targets in BUILD-BRIEF.md §6
```

Markdown tables inflate the grade. When a file is over target only because of a table, run the checker on a copy with the table lines removed (`grep -v '^|' file > /tmp/x.md`) and report both numbers.

## The two books and the audiobook

### What the Playbook promises, and where it lands

The kit page lists six sections with page numbers. Each is the opening of a chapter, so the designer controls the landing page by padding before the chapter rather than inside it.

| Promise on the kit page | Chapter | Must open on |
|---|---|---|
| The 15-minute "beads to brain" routine, and why shorter wins | 2 | p. 9 |
| The "not a math kid" lie and the three-week fix | 3 | p. 14 |
| All 34 bead moves in the order a child's brain learns them | 4 | p. 22 |
| Flash rounds at the dinner table | 6 | p. 41 |
| The Bead Score | 7 | p. 53 |
| What to say when they get stuck (never the answer) | 8 | p. 60 |

The page model: 5.5 × 8.5 in, about 230 words of running text per page, the title page, copyright page and contents on pp. 1–3, p. 4 blank or art, chapters opening on a fresh page with a drop. Each chapter heading carries a `<!-- designer: … -->` note with its target page.

### Sources the books are built from

- Method, formulas, stage ladder and lesson wording come from `js/curriculum.js`, `js/soroban.js`, `js/guide.js`, `js/coach.js` and `js/ladder.js`.
- Hunter's story comes from `free-abacus/university.html` and `docs/VSL-SCRIPT.md`, kept to the facts on those pages. No sport, school or year is named anywhere because the source pages do not name them.
- Science is limited to what `docs/RESEARCH-NOTES.md` marks as holding up. The books claim arithmetic speed and accuracy, visuospatial working memory, the brain scan findings, the off by five and 3–4 column findings, the motor interference finding, the null result in the US first grade trial, NAEP 28% and the 1.61 s record. They do not claim IQ gains, general memory or attention gains, or that it works for every child.

### How the workbook problems were made

`tools/gen.js` imports the site's own `js/generator.js` and `js/soroban.js`, seeds `Math.random` so the output is reproducible, and builds 90 days of drills using the exact `allow` and `require` formula lists from the matching lessons in `js/curriculum.js`. Any problem whose moves fall outside the day's allowed set is rejected, as in the app. `tools/text.js` holds the hand-written half of each page. `tools/build.js` assembles `workbook.md`. `tools/verify.js` re-checks every printed problem (943 problems, 0 outside their allowed moves, no duplicates on a page). Rebuild with:

```bash
cd docs/products/tools && node gen.js && node build.js && node verify.js
```

Day map: 1–4 hold, clear and set single digits · 5–9 read 2-digit · 10–14 read 3-digit (peek) · 15–18 set 3-digit · 19–24 direct adds · 25–29 direct subtraction · 30–36 two columns, three lines · 37–39 eyes closed · 40 Sprout Boss · 41–46 +1/+4 · 47–52 +2/+3 · 53–59 small-friend adds in two-digit problems · 60–65 −1/−4 · 66–71 −2/−3 · 72–79 all eight mixed · 80–85 timed speed rounds · 86–89 mental, three one-digit · 90 Explorer Boss.

### What the books still need from a designer

- Layout to `DESIGN.md`: Unbounded headings, Inter body, Caveat for every parent line and "say this" line (in the coach speech bubble with the mascot from `img/coach-bolt-sm.webp`), ink outlines, one pop color per section, no cards, no gradients.
- Covers that match the mocks the kit page already shows (`img/funnel/playbook.webp`, `img/funnel/bump.webp`).
- Pencil illustrations: a labelled soroban, the two-finger grip, a child at the table with a parent beside them.
- ISBN and barcode, copyright page, print spec.
- Playbook: pagination to the six anchor pages above. Formula tables in chapter 4 colored per `DESIGN.md`. The formula card on the inside back cover. The stage table with the badges from `js/art.js`. The Bead Score rung table with the chart from `img/score-climb.webp`.
- Workbook: 8.5 × 11 or 8 × 10 trim, lay-flat binding, one day per page. Every `[beads: n]` token becomes a soroban picture (107 pictures; `js/abacus.js` draws them as SVG). Stacked problems set as vertical columns with the sign on the left. Big answer boxes. Answer key in small type at the back. A part-opener spread for Sprout and Explorer.

### Open items for Hunter on the books

- The kit page says the Playbook is 60–70 pages and the Workbook pairs with "the Playbook". Both hold. The Playbook never quotes a lesson count, so it stays true whichever number the site lands on.
- Chapter 9 mentions the audiobook "in the same bundle" and the Workbook "if it came in your box", so one print run works with or without the bump.
- Several bead demos in `js/curriculum.js` carry labels that claim a different move than the model performs (`21 + 36` and `57 − 15` in Sprout, `23 + 32` in Explorer, `6 + 7`, `8 + 6`, `195 + 8` and `203 − 7` in Apprentice). The animation is right because the model drives it. The manuscripts use corrected examples. The site fix is out of scope here.

<!-- status: ready -->

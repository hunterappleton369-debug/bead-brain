# Instructor Launch Kit

The $297 "Instructor Launch Kit" and the $197 "Certified Instructor listing and badge" from `free-abacus/certify.html`: class plans, pricing sheet, parent flyer, sign-up script, first-class checklist, plus the directory listing, intake form and progress report. Built 2026-10-21 to section 5.5 of `docs/products/BUILD-BRIEF.md`.

## Files

| File | Purpose | Reader | Status | Words | Deslop | FK grade (target) |
|---|---|---|---|---|---|---|
| `README.md` | This file: file list, status, checker numbers, frameworks, facts used, open items. | Hunter | ready | 1,121 | 5/5 | 7.3 (no target) |
| `class-plans.md` | 8-week starter course, 45-minute classes for 4 to 8 kids. Each week: app lessons, warm-up, lesson, drill, flash game, wrap-up, parent note. Weeks 1–4 = Sprout + Sprout Boss. Weeks 5–8 = Explorer + Explorer Boss. | instructor | needs Hunter | 3,570 | 5/5 | 2.9 (≤ 9). Parent notes alone: 0.9 (≤ 5) |
| `class-drills.md` | Printable page per week: warm-up list, drills A and B, flash game list, boss practice at weeks 4 and 8, answer key. Generated, not hand-typed. | instructor + child | ready | 3,306 | 5/5 | 2.2 (≤ 9) |
| `pricing-sheet.md` | $20–40 range, four options (per class, full course, sibling, 4-week trial block), the 6 kids × 8 weeks arithmetic, cost worksheet, payment and missed-class rules. No earnings promise. | instructor | needs Hunter | 1,083 | 5/5 | 5.6 (≤ 9). 5.1 without tables |
| `parent-flyer.md` | One-page flyer in Hook, Story, Offer. Version A for school pickup (printed), Version B for online parent groups. Art notes per `DESIGN.md`. | parent | needs Hunter | 972 | 5/5 | 4.0 (≤ 5) |
| `sign-up-script.md` | Pickup conversation, three short texts, the enrolment message, answers to the three false beliefs plus "does it work?" and "we do Kumon", last-class ask. | parent (spoken) | needs Hunter | 1,262 | 5/5 | 3.1 (≤ 5) |
| `first-class-checklist.md` | Three weeks out to 24 hours after class 1, a bag list, and child-safety rules. | instructor | needs Hunter | 882 | 5/5 | 4.2 (≤ 9) |
| `directory-listing.md` | What the listing shows and hides, the 13-field listing form, review step, badge art note and badge rules, and a build list for the missing directory. | instructor + Hunter | needs Hunter | 1,058 | 5/5 | 5.8 (≤ 9). 6.2 without tables |
| `parent-intake-form.md` | Two-minute form about the child and who picks them up, with home practice, photo consent and contact consent at the end. | parent | needs Hunter | 457 | 5/5 | 3.6 (≤ 5) |
| `progress-report-template.md` | One-page report after week 4 and week 8: stage, skills ticked, scores, one strength, one next step, home plan, next course. | parent | ready | 619 | 5/5 | 5.0 (≤ 5–6) |
| `tools/make-class-drills.mjs` | Builds and re-checks `class-drills.md` from `js/generator.js` and `js/soroban.js`. Seeded (20261021). | Hunter / builder | ready | | | |
| `tools/class-drills.json` | The data behind `class-drills.md`, read by `--check`. | tool | ready | | | |

Word counts are `wc -w` on the file. FK is `docs/products/tools/readlevel.py`. Deslop is `~/.claude/skills/slopmonster/tools/deslop.py`. Parent notes and texts were also checked on their own (FK 0.9, deslop 5/5). Every text in `sign-up-script.md` and every parent note in `class-plans.md` is 160 characters or fewer before the brackets are filled in.

## How the drills were made

```bash
node docs/products/instructor-launch-kit/tools/make-class-drills.mjs          # build + verify
node docs/products/instructor-launch-kit/tools/make-class-drills.mjs --check  # verify only
```

Last run: 274 items across 8 weeks, 0 outside the week's allowed moves, no duplicates on a page. Specs (`allow`, `require`, terms, digits, pass marks) are copied from the matching lessons and boss tests in `js/curriculum.js`. The script copies the pattern from `docs/products/tools/gen.js`. It only imports from `js/` and does not change it.

## Rendering

`npx md-to-pdf <file>.md` (MIT, https://github.com/simonhaenisch/md-to-pdf). `<div class="page-break"></div>` marks each printed page. Not run here. No PDFs are checked in.

## Frameworks used

- **Hook, Story, Offer** (https://www.clickfunnels.com/blog/hook-story-offer/): flyer versions A and B, the pickup conversation.
- **Three secrets / false beliefs** (Expert Secrets, summary at https://www.shortform.com/blog/?p=116315): the objection answers in `sign-up-script.md`. Vehicle: "school already teaches math". Internal: "not a math kid / not a math person". External: time, money, "takes years".
- **Value ladder** (https://www.clickfunnels.com/blog/value-ladder/): every family is sent to the free kit at `childphenoms.com/free-abacus` (which leads to University). The instructor account holds each child's profile. Week 8 and the progress report offer the next course, then University once.
- **Proven abacus programmes** (UCMAS, https://www.ucmas.com/): weekly class plus 15 minutes a day at home, mental work from week 3, accuracy before speed, a graded test per level (our boss tests).

## Facts used, and nothing else

Price range "$20–40 a session, your rates are yours to set" and the stack names from `certify.html`. Founder story facts from brief §1.3 (no sport, school or year). Research: NAEP 2024 28%, Barner et al. 2016, about a million Japanese children a year, and the Kumon, tutor and EdChoice price anchors (brief §1.4, URLs cited in each file). No testimonials, no counts of students or instructors, no earnings figures, no results promises. The arithmetic in `pricing-sheet.md` is labelled as gross fees, not a forecast.

## Repos

None cloned. None needed.

## Open items for Hunter

1. **The directory does not exist.** No page, form, search, listing table or badge file. `directory-listing.md` is the spec.
2. **Badge art** is not drawn (art note in `directory-listing.md`).
3. **Who reviews listings**, and how fast. Do reviews or ratings ever appear?
4. **What happens to the listing** when the instructor account is not renewed after year one.
5. **Badge-rule enforcement window** (14 days proposed) and the badge licence go in the instructor agreement (legal-and-ops).
6. **Background checks** for instructors: decide, then put the rule in the instructor agreement.
7. **Live funnel URL.** The kit uses `childphenoms.com/free-abacus`. Confirm it, and decide whether instructors get a tracked link or any referral credit.
8. **Student logins.** Confirm that children in a class may log in at home under the instructor account's profiles, and for how long after the course.
9. **Spare sorobans.** Is there a class-set or instructor price for kids whose kit is late?
10. **Founder story on instructor flyers.** Confirm instructors may retell the C's / ADHD / perfect ACT story (the flyer leaves out the unconfirmed "guessed alone" line).
11. **Counsel review** of the intake form's photo and contact consent, the texting rules in the script, and the pricing sheet's "independent instructor, own taxes" note.
12. **Follow-on course.** An 8-week plan for Stage 3–4 (Apprentice, Adept) is not written. `class-plans.md` gives the template.
13. **Brand use.** Confirm instructors may call their class an "abacus class" with "Certified Phenom Instructor" beside their name, and may not name a business "Child Phenoms" (as the badge rules state).

<!-- status: needs Hunter: see open items -->

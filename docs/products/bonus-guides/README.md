# Bonus guides

The two $97 bonuses promised in the Phenom University stack on `free-abacus/university.html`: *Valedictorian Secrets* and *Win the Future: The Career-Picking Guide*. Parent-facing. Built to BUILD-BRIEF §5.1.

## Files

| File | Purpose | Status | Words (wc / checker) | Deslop | FK grade |
|---|---|---|---|---|---|
| `valedictorian-secrets.md` | Bonus 1. Ten chapters: Epiphany Bridge opening, eight habits (habit, why it works, words to say, five-minute version), Big Domino close with a first-week plan and FAQ, pointer to Stage 1 and University. 8 cited sources. | needs Hunter (story framing) | 4,455 / 4,296 | 5/5 | 3.3 |
| `win-the-future.md` | Bonus 2. Nine chapters: Hunter's framing, two-week observation worksheet (chose / repeated / fixed), eight talent patterns with feed / do-not / where people use it, talent-killing mistakes, mental calculation chapter (brief §1.4 research only), next ten years (WEF 2025 only), one-page fill-in plan, Stage 1 pointer. 6 cited sources. | needs Hunter (story framing) | 4,028 / 3,788 | 5/5 | 2.8 (2.8 with tables stripped) |
| `cover-notes.md` | One page per cover: title, subtitle, byline, sticker, color block, `[art: …]` notes per DESIGN.md, plus interior layout notes. | ready | 733 / 674 | 5/5 | 5.6 |
| `README.md` | This file (internal, no grade target). | ready | | 5/5 | 11.8 |

Targets: FK ≤ 6 and deslop 5/5 on both guides (met). Word ranges: Valedictorian 4,000–5,500 (met), Win the Future 3,500–5,000 (met).

Checker commands, run from the repo root:

```
python3 ~/.claude/skills/slopmonster/tools/deslop.py docs/products/bonus-guides/<file>.md
python3 docs/products/tools/readlevel.py docs/products/bonus-guides/<file>.md
```

## Render

```
cd docs/products/bonus-guides
npx md-to-pdf valedictorian-secrets.md
npx md-to-pdf win-the-future.md
```

Tested 2026-10-21: both render cleanly, `<div class="page-break"></div>` is honored, and the Win the Future worksheet and plan each print on their own page. PDFs are not checked in.

## Frameworks used

- **Epiphany Bridge** (chapter 1 of each guide): backstory, the wall (GPA), the training plan, the week-three click, the result, and "same kid, a different kind of smart". Only brief §1.3 facts. No sport, school, year or coach named.
- **Hook-Story-Offer in miniature** per chapter: a hook line, a short scene, then the offer as "the words to say" and "the five-minute version".
- **Big Domino** close in Valedictorian ch. 10: "intelligence is built, not born, the mental abacus is the fastest way I know to build it at home in fifteen minutes a day."
- **Three secrets** handled in the FAQ sections: "my child hates math" and "I'm not a math person" (internal), "we only have weekends" (external).
- **Value ladder**: both guides close on Stage 1 in the trainer tonight ("Hold it, clear it, move it", 10 min, per `js/curriculum.js`), then Phenom University.
- Sources: [clickfunnels.com](https://www.clickfunnels.com/blog/hook-story-offer/) , [clickfunnels.com](https://www.clickfunnels.com/blog/value-ladder/)

## Evidence I verified on the web (2026-10-21)

| Claim | Source |
|---|---|
| Spaced math practice beat massed practice (grades 3 and 7) | Barzagar Nazari & Ebersbach, *Applied Cognitive Psychology* 2019, [kobra.bibliothek.uni-kassel.de](https://kobra.bibliothek.uni-kassel.de/handle/123456789/11972) |
| Spaced practice across 3 weeks beat one session, test a month later (grade 7, UK) | Emeny, Hartwig & Rohrer 2021, [psypost.org](https://www.psypost.org/spacing-math-practice-across-multiple-sessions-improves-students-test-scores-and-helps-them-accurately-judge-their-learning/) |
| Process praise at ages 1–3 predicts liking challenge 5 years later, person praise did not | Gunderson et al. 2013, [now.temple.edu](https://now.temple.edu/news/2013-02-11/praising-effort-toddlers-predicts-positive-attitudes-toward-challenges) |
| One book a day ≈ 290,000 more words heard by age 5 (preschool study, the guide says so) | Logan et al. 2019, [thesector.com.au](https://thesector.com.au/2019/04/05/a-book-a-day-keeps-the-word-gap-away-1-4-million-word-gap-found-in-some-preschoolers/) |
| Ages 6–12 need 9–12 hours of sleep, AAP endorsed | AASM consensus 2016, [pmc.ncbi.nlm.nih.gov](https://pmc.ncbi.nlm.nih.gov/articles/PMC5078711/) |
| No screens 1 hour before bed, screens out of the bedroom at night | AAP Q&A, [aap.org](https://aap.org/en/patient-care/media-and-children/center-of-excellence-on-social-media-and-youth-mental-health/qa-portal/qa-portal-library/qa-portal-library-questions/screen-time-affecting-sleep) |
| Analytical thinking is the top core skill, ~7 in 10 employers, AI and big data rising | WEF Future of Jobs 2025, [weforum.org](https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/3-skills-outlook/) (403 to my fetcher, figures confirmed via [pretorianews.co.za](https://pretorianews.co.za/news/world/2025-01-23-analytical-thinking-agility-and-tech-skills-top-future-workforce-demands-wef-report) ) |

Abacus research is brief §1.4 only (Barner 2016, Wang 2019, the 2021 review, Frank & Barner 2012, NAEP 2024). Each guide says once, in a footnote, that research describes group averages. Habits with no study behind them (calendar slot, teacher note, hands in your lap, the talent patterns) are labeled in the Sources page as Hunter's own practice.

## Choices worth knowing

- **"Top 1%."** The funnel promises "what the top 1% of parents do differently". The guide keeps the phrase but says plainly that nobody measured them, it is a name for the few parents who run all eight habits.
- **"A million Japanese children."** Allowed in §1.4, but left out on purpose. A web check found Bellos's million figure contested (Vice reports ~43,000 in private soroban schools: [vice.com](https://vice.com/en/article/thousands-of-japanese-kids-are-still-learning-math-on-the-abacus) ). Worth a look before it stays in other deliverables.
- **No "102 lessons" or "thousands of kids".** Neither guide states a lesson count or customer count.
- **Hunter's anecdotes.** Only §1.3 facts. Where a chapter needed a story, it uses a generic household scene ("Here is a Tuesday in a lot of houses") or the training principle from Playbook ch. 1, never a new event from Hunter's life.
- Reuse by reference: Playbook chapters 2, 6, 7, 8 and the `js/coach.js` Sprout and Ace parent lines are pointed to, not copied.

## Open items for Hunter

1. [HUNTER: confirm the "pieced it together alone and guessed what came next" framing, both guides keep the funnel wording.]
2. [HUNTER: confirm you are happy with the "top 1%" framing as written ("Nobody measured them").]
3. [HUNTER: decide whether "about a million Japanese children" stays anywhere, see Choices above. This guide does not use it.]
4. [HUNTER: cover art to be drawn per `cover-notes.md` (Higgsfield pencil style or designer).]
5. [HUNTER: an author photo for the inside cover, if wanted.]

## Repos

None cloned. `md-to-pdf` (MIT, [github.com](https://github.com/simonhaenisch/md-to-pdf)) run via `npx` only.

<!-- status: needs Hunter: items 1–2 above, guides are otherwise ready -->

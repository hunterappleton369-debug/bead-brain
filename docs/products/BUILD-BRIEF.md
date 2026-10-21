# Child Phenoms — BUILD BRIEF (2026-10-21)

The one brief every builder follows. Read it start to finish before writing a word. Where this brief and a funnel page disagree, the funnel page wins; flag the gap as `[HUNTER: …]` in your README.

Repo root: `/Users/hunterappleton/Desktop/Bead-Brain`. The live funnel is `free-abacus/` (index → university → certify → thanks). The app is `index.html` + `js/`. Neither is yours to edit.

---

## 0. Hard rules (all builders)

1. **No invention.** No testimonials, customer counts, income figures, results, awards or studies that are not in §1 or that you did not verify on the web yourself (cite the URL). Anything missing: `[HUNTER: what is needed]`.
2. **Do not touch** `free-abacus/`, `js/`, `css/`, `index.html`, `img/`, or any other builder's folder. `docs/products/playbook.md` and `workbook.md` are finished; read them, do not rebuild them.
3. **Write only in** `docs/products/<your-key>/` (create it). A cloned repo goes in `vendor/<name>/` (shallow clone; MIT, Apache-2.0, BSD or CC-BY only; record URL, license, commit and what you used in your README; never copy GPL code or text into a deliverable).
4. **Checkers, before you finish**, on every parent-facing or marketing file (not on README or instructor-only notes, though run them anyway and report):
   - `python3 ~/.claude/skills/slopmonster/tools/deslop.py <file>` → must print `score 5/5`.
   - `python3 docs/products/tools/readlevel.py <file>` → Flesch-Kincaid grade at or under the target in §2. Markdown tables are read as one long "sentence" and inflate the grade; if a file's grade is over target only because of tables, run the checker on a copy with the tables stripped (`grep -v '^|' file > /tmp/x.md`) and report both numbers.
5. **README.md in your folder** lists every file, its purpose, status (`ready` / `needs Hunter`), word count, deslop score and FK grade, plus the open `[HUNTER]` items in one list.
6. **Format:** Markdown. One README per folder. HTML only where a page is actually needed (legal pages, a printable handout template). No `.docx`, no PDFs checked in (give the command to make one).
7. **Return** a short plain-text report: files written, checker numbers, open items for Hunter. No summary files.

---

## 1. Facts sheet — the only facts you may use

### 1.1 Offers, names and prices (exactly as the funnel states them)

| Step | Page | Offer (name as printed) | Price | Value shown |
|---|---|---|---|---|
| 1 | `free-abacus/index.html` | **Child Phenoms Abacus** ($39) + **Child Prodigy Secrets: The Playbook** ($47) | FREE, **$9.95 shipping** (USPS, US only, ships in 2–3 business days, "7 days or less") | $86 |
| 1b | order bump | **Prodigy Maker Workbook + Audiobook** (90-day printed workbook, one page a day; Playbook audiobook) | **$27** ("normally $67"), same box, no extra postage | $67 |
| 2 | `university.html` | **Phenom University** / "Child Phenom University" 14-day free test drive. The gift: **Prodigy Secrets Program, all 10 stages, 102 training lessons** ($997) which they "keep even if you cancel" | **$0 today, then $67/mo**, "66% off" the **$197/mo** regular price, "locked for life", cancel anytime, pause a month at a time, one membership covers every child in the house | $1,685 |
| 3 | `certify.html` | **Certified Phenom Instructor** | **$297 once** | $3,132 |
| 4 | `thanks.html` | confirmation; link to `https://childphenoms.com/#/start` | | |

**University stack (page 2), names and values as printed:**
- Prodigy Secrets Program: all 10 stages, 102 training lessons — $997
- Unlimited Phenom-U Practice Handouts ("printed on demand, matched to the exact lesson") — $297
- Child Phenom University Software (screen abacus, flash trainer, Bead Score tests, age-ranked chart) — $197
- Valedictorian Secrets ("what the top 1% of parents do differently, from week one of school") — $97
- Win the Future: The Career-Picking Guide ("how to spot and feed the talent your child already has") — $97

**Certification stack (page 3), names and values as printed:**
- Full Certification Course Library (30 hours) — $597. Page body also says "the 20-lesson course", "video and drills, at your own pace", "from parent to certified instructor in about six weeks", "pass the test, take it on-demand, retry until you pass".
- FREE BONUS: Child Phenoms Software For Your Child, One Full Year (instructor account: 10 stages, 102 lessons, unlimited student profiles) — $997
- Prodigy Secrets Program ("twelve months of the family membership, on us") — $1,044
- Instructor Launch Kit: class plans, pricing sheet, parent flyer, sign-up script, first-class checklist — $297
- Certified Instructor listing and badge ("your name in the directory parents search, and the badge for your flyer") — $197
- Guarantees: **Pass Promise** (don't pass, we coach you one on one until you do) + **30-day money back**. FAQ: "most instructors land between $20 and $40 a session; your rates are yours to set", "the certification is yours for life; the instructor account renews at the member rate after the first year", online teaching OK over video call.

**Other guarantees/promises printed:** Keep-the-Kit Promise (30 days; refund the shipping, keep the abacus and Playbook). "Secure checkout · 256-bit SSL". "We never sell or share your info." Day-14 charge of $67 then "the next stages open up".

**Thank-you page promises:** welcome email with receipt + parent-account link; "reply with your child's name and age, the first week's plan comes back"; tracking email when the box ships; Stage 1 open tonight on the screen abacus; "send me the first video, I watch every one".

### 1.2 The product as it exists (`js/curriculum.js`, `js/ladder.js`)

**76 lessons in 10 stages** (the funnel says 102; see §1.5). Lesson names, in order:

1. **Sprout** — Meet the beads (2–3 wks, 8): Hold it, clear it, move it · Read any number · Read hundreds in a glance · Set numbers fast · Add when the beads are free · Take away when the beads are there · Two columns, left to right · Eyes closed. Boss: Sprout Boss.
2. **Explorer** — Small friends (3–4 wks, 8): +1 and +4: friends 1 and 4 · +2 and +3: friends 2 and 3 · Small-friend adds in 2-digit numbers · −1 and −4: taking away with friends · −2 and −3 · All eight friends, mixed · Speed round · Mental: three small numbers.
3. **Apprentice** — Big friends (5–6 wks, 9): +9, +8, +7 · +6 and +5 · +4, +3, +2, +1 past nine · Carry chains · −9, −8, −7: borrowing · −6 down to −1 · Borrow chains and mixed problems · Mental: small friends in the head · Mental: crossing ten.
4. **Adept** — All 34 formulas (5–6 wks, 8): Combo adds: 6+6, 7+7, 8+8, 5+9 · Combo take-aways: 11−6, 12−7, 13−8, 14−9 · All 34 formulas, mixed · Three digits · Ten rows · Mental: five single digits, all formulas · Mental: two 2-digit numbers · Mental: three 2-digit numbers.
5. **Ace** — Speed and flash (6–8 wks, 9): Fast hands · Read ahead · Four digits · Flash anzan begins · Flash: faster, longer · Mental: five 2-digit numbers · Mental: 2-digit plus and minus · Listening: numbers read aloud · Your first Bead Score.
6. **Wizard** — Multiplication (6–8 wks, 7): Times tables: the spell book · 2-digit × 1-digit · 3-digit × 1-digit · 2-digit × 2-digit · Mental: 2-digit × 1-digit · 3-digit × 2-digit · Keep the mental beads warm.
7. **Champion** — Division (6–8 wks, 7): Divide 2-digit by 1-digit · Divide 3-digit by 1-digit · Remainders · Divide by 2-digit numbers · Mental: divide by 1-digit · Mental: three 3-digit numbers · Flash: 2-digit numbers.
8. **Prodigy** — Mental mastery (3–4 mo, 9): Mental: five 3-digit lines, mixed · Mental: ten 3-digit lines · Flash: 3-digit numbers · Flash: ten 3-digit numbers · Mental: 2-digit × 2-digit · Mental: 3-digit × 1-digit · Mental: 3-digit ÷ 1-digit · Decimals and money · Below zero.
9. **Grandmaster** — Dan level (4–6 mo, 6): Flash: ten 3-digit at 0.7 s · Flash: ten 3-digit at 0.5 s · Mental: 4-digit lines · Mental: 3-digit × 2-digit · Mental: 4-digit ÷ 2-digit · Listening: ten 3-digit numbers.
10. **Legend** — Beyond prodigy (open-ended, 5): Flash: fifteen 3-digit at 0.4 s · 0.3 s · 0.2 s · Mental: 3-digit × 3-digit · Mental: fifteen 3-digit lines.

Every stage ends with a **boss test** (timed, no hints, must pass to unlock the next stage). Each stage also has **daily quests** (28 total: 2–3 short drills a day; all three earns a bonus). Lesson pattern in the app: watch (bead animation) → try → pass (accuracy target) → repeat. Daily routine the app prints: warm-up 2 min · lesson or drill 8–10 min · mental 5 min · log. Mon–Thu lesson, Fri quest only, Sat boss, Sun off; Bead Score test every 2–4 weeks.

**Bead Score ladder:** 20 rungs (rung 7 ≈ 18th kyu flash anzan, rung 11 ≈ 7th kyu), climbed until one fails, age-ranked chart. **Times ladder:** 10 rungs. **34 formulas:** 8 small-friend (5-complement), 18 big-friend (10-complement), 8 combination, taught in that order, adds before take-aways (color code: direct green, small friend orange, big friend blue, combination purple).

**Move order (house rule, settled 2026-10-21):** work the rod you are on first, then the rod to its left, so adding takes away the friend and then carries ("Plus 7: take away 3, carry 1 to the left") and taking away adds the friend and then borrows ("Minus 9: add 1, borrow 1 from the left"), the order of the app's spoken lines in `js/soroban.js`.

**Already written, reuse don't rebuild:** `docs/products/playbook.md` (the Playbook, ~13,600 words, 9 chapters + science appendix + formula card; chapter 8 = what to say when stuck; chapter 6 = flash rounds; chapter 7 = Bead Score), `docs/products/workbook.md` (90 day pages, Stages 1–2, with answer key), `docs/products/audiobook-notes.md`, `docs/PLAN.md` (every stage, lesson, boss in prose), `js/coach.js` (coach tips, parent lines, stuck help), `js/guide.js` (parent guide copy). `docs/products/tools/gen.js` + `js/generator.js` make verified drill problems for any lesson's allowed formulas. `index.html#/worksheet/<stage>` prints a worksheet from the app.

### 1.3 Founder story facts (Hunter McClain, "From the desk of", Sheridan, Wyoming on page 2)

Use only these: C's in math; ADHD; could not sit still, forgot things, always in trouble; "not a math kid" verdict; wanted to play college sports, GPA was a wall, needed a test score no one could argue with; trained mental math and abacus drills fifteen minutes a day "the way I trained my body"; no kit, no parent book, no trainer existed, pieced it together alone and guessed what came next; around week three it clicked and he started to like it; grades rose with no extra study; perfect ACT; full-ride scholarship; Scholar-Athlete of the Year at a Division I school; "same kid, same ADHD, a different kind of smart". **Do not name** a sport, school, year, ACT date or any coach. The "guessed alone" framing still needs Hunter's confirmation; keep it exactly as the page says it.

### 1.4 Research claims: allowed and forbidden

**Allowed (cite as shown):**
- Barner et al. 2016, *Child Development*: 3-year classroom RCT, 204 children in India, ~3 h/week; abacus group beat the extra-math group on arithmetic, calculation and place value; no change to general cognition. https://bps.org.uk/research-digest/teaching-children-ancient-mental-abacus-technique-boosted-their-maths-abilities
- Wang et al. 2019, *Journal of Neuroscience*: 144 children, 5 years; better visuospatial working memory; changes in frontal/parietal/occipital activation; no IQ change. https://pmc.ncbi.nlm.nih.gov/articles/PMC6697396
- 2021 review (five studies, arithmetic gains): https://pmc.ncbi.nlm.nih.gov/articles/PMC8283869/
- PLOS One 2015 (task switching): https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0139930
- Mental-abacus representation: Frank & Barner 2012 (3–4 column limit, immune to verbal interference); Stigler 1984 (off-by-five errors); Brooks et al. 2018 (motor interference).
- Flash anzan: Guinness record, 15 three-digit numbers in 1.61 s, Rikako Miyamoto, Feb 2024. https://www.guinnessworldrecords.com/world-records/fastest-flash-mental-arithmetic ; 30 numbers in 3.30 s, Takuya Yatani, June 2025. https://www.guinnessworldrecords.jp/world-records/647334-fastest-mental-arithmetic-30-sets-of-three-digit-numbers-flash-anzan
- ~1 million Japanese children learn the soroban a year (Guardian/Alex Bellos).
- NAEP 2024: 28% of US 8th graders proficient in math, scores at 25-years-ago levels. https://www.k12dive.com/news/2024-naep-reading-math-scores-drop-pre-pandemic/738535/
- Price anchors: Kumon ~$100–250/mo per subject; private tutors $40–80/hr; EdChoice 2025 parents would pay ~$357/mo for tutoring. https://www.edchoice.org/2025-a-kaleidoscope-view-of-k12-tutoring-in-america/
- Public video: NBC Little Big Shots (YouTube 3PdgByQSLso); PBS NOVA, Apoorva Panidapu, started abacus about age 5.

**Forbidden:** IQ gains; general memory or attention gains; "works for every child"; "results in weeks" in a classroom setting (the US first-grade trial, Barner 2017, found no benefit after one year at 2 h/week); ADHD cure or treatment language; any specific customer count ("thousands of kids" appears on the funnel; do not add numbers beyond it and do not put it in new deliverables); any earnings claim beyond "$20–40 a session, your rates are yours to set"; any medical or diagnostic claim. Research describes group averages; say so once in a footnote, never in body copy.

### 1.5 Known gaps (write around them, flag them)

- **102 vs 76.** The app has 76 lessons + 28 daily quests = 104 drills. The pages say 102. Builders write to what exists and flag `[HUNTER: page says 102; app has 76 lessons + 28 quests. Change the page to "100+" or add lessons]`.
- **The $997 "keep it even if you cancel" gift** must exist outside the app. That is the `prodigy-secrets-program` deliverable.
- No testimonials, screenshots, VSL recording, founder photo, legal pages, Stripe links, instructor directory, or certification exam exist yet.
- Workbook/audiobook are written but not designed or recorded.

---

## 2. Voice and reading level

Hunter's voice: one parent at a kitchen table. Short sentences. Benefit before mechanism. Principles, not rule lists (write "the five rules" as prose). No disclaimers in body copy. No hype words (the deslop checker catches most: unlock, unleash, empower, elevate, journey, game-changer, "not just X, it's Y", rule-of-three stacks, em-dash chains). Headings in sentence case. Lists and headings so a busy parent can scan. The child is "your child", never "the student", except in instructor material.

| Document type | FK grade target | Deslop |
|---|---|---|
| Parent-facing (guides, handouts, lesson pages, thank-you/onboarding) | ≤ 6 | 5/5 |
| Marketing (emails, texts, ads, sales copy, flyers) | ≤ 5 | 5/5 |
| Instructor material (course, launch kit, ops docs) | ≤ 9 | 5/5 |
| Legal pages | no target; plain English, numbered sections | run it, report it |

Design words when a page is needed: see `DESIGN.md` (white paper, Unbounded headings, Inter body, Caveat for tips, ink outlines, flat pop colors, no gradients, no cards). The funnel's CTA buttons are the ClickFunnels-style green (`.btn.cta.cf`) and red (`.btn.cta.cf.red`) in `free-abacus/funnel.css`; reuse those names if you build a page.

---

## 3. Frameworks (distilled; cite these URLs when you lean on them)

**Russell Brunson** (DotCom Secrets, Expert Secrets; summaries at https://www.clickfunnels.com/blog/value-ladder/ , https://www.clickfunnels.com/blog/hook-story-offer/ , https://www.clickfunnels.com/blog/soap-opera-sequence/ , https://www.shortform.com/blog/?p=116315 , https://www.shortform.com/blog/russell-brunson-sales-funnel/ ):

- **Value ladder.** Bait (free) → front end (free + shipping, "heavily discounted") → middle (the subscription) → back end (higher ticket) → continuity. Ours: free kit + $9.95 → $27 bump → $67/mo University → $297 certification. Every deliverable must make the next rung feel natural: the Playbook points to the trainer, the lesson book points to the software, the instructor kit points back to University for the instructor's students.
- **Hook, Story, Offer.** Every email, ad, flyer, page: a hook that stops the scroll (curiosity + a bold promise + empathy), a story that starts in the middle and parallels the parent's situation, an offer that feels like a clear win (anchor, bonuses, urgency, risk reversal). If something is not working, it is one of the three.
- **Epiphany Bridge** (the story form): backstory and the original world → the wall (what failed, what was at stake) → the epiphany (the one realisation, and who or what showed it) → the plan/framework (steps, not tactics) → conflict along the way → achievement and transformation, then "and others too". Hunter's story in §1.3 already sits in this order; the week-three click is the epiphany.
- **Big Domino.** The one belief that makes every objection fall: *intelligence is built, not born, and the mental abacus is the fastest known way to build it at home in 15 minutes a day.* Everything we write pushes that domino.
- **Three secrets** (break three false beliefs with an Epiphany Bridge each): vehicle ("school makes smart kids" → school rewards memorisers; results are falling), internal ("my kid isn't a math kid / I'm not a math person" → there is no such thing; you don't teach, you sit beside), external ("no time / tutors cost too much / takes years" → 15 minutes a day beats two drives a week to a center).
- **The Stack.** List every piece with its name and value, total the value, then reveal the price; follow with trial closes ("does that make sense?"), urgency (this page only), guarantee, CTA. The university and certify pages already do this; copy their names and values exactly.
- **Soap Opera Sequence** (5 emails, one a day, each ends on an open loop): 1 set the stage (who I am, why listen, what's coming) · 2 high drama → backstory → the wall · 3 the epiphany → the one thing (point to a free resource, do not sell) · 4 hidden benefits → first offer (a no-brainer) · 5 urgency and the last call. Emails 1–3 for emotional buyers, 4 for logical, 5 for fear-of-missing-out.
- **Seinfeld emails** (daily, after the sequence): about 90% story/entertainment, 10% content, every one with a link to one offer. Episode-style: something that happened today, a lesson, a soft pitch.
- **Perfect Webinar** (for the VSL and the certification webinar): big promise → origin story → the One Thing (big domino) → three secrets → the stack → price reveal with "if all this did was X, would it be worth it?" trial closes → urgency → guarantee → close.

**Abacus programs, how the proven ones are structured** (summaries: https://www.ucmas.com/ , `docs/RESEARCH-NOTES.md`, https://en.wikipedia.org/wiki/Soroban , https://www.guinnessworldrecords.com/world-records/fastest-flash-mental-arithmetic ):

- **UCMAS:** three modules, 11 levels. Foundation (ages 4–6: Foundation, Basic, Elementary A/B) → Construction (Intermediate A/B, Higher A/B) → Advanced (Advanced, Grand A/B). Each level ~5–6 months in a 2-hour weekly class plus 15–20 minutes of homework a day; drills are flash cards, listening (dictation), speed writing; "32 formulas"; an international grading exam with abacus and mental papers; regular competitions.
- **ALOHA Mind Math:** Tiny Tots / Junior (from 5, 6 levels × ~3 months) / Senior (8 levels × ~3 months); one 2-hour class a week; certificates at level milestones; accelerated summer session does two levels. (aloha-usa.com would not load on 2026-10-21; figures from RESEARCH-NOTES and press at https://princetoninfo.com/specialsections/aloha-mind-math-aloha-stands-for-abacus-learning-of-higher-arithmetic/ .)
- **Mastermind / Abacus Brain Gym-type franchises:** 8–11 levels of 3–4 months, Foundation → Advanced → Grand Master, accuracy graded before speed, a certificate per level, a final "mastery and competition" level.
- **Japanese grading (Nihon Shuzan Renmei / JCCI soroban exams):** kyu from 10th (2-digit × 5 lines) up to 1st kyu (10-digit × 10 lines, with 60 multiplication/division problems); dan grades triple the 1st-kyu volume; 3rd kyu or better was once a job qualification; typical club pace reaches 1st kyu around sixth grade.
- **Anzan exams:** 4th kyu = 2-digit × 5 lines; 3rd = 3-digit × 5; 2nd = 3-digit × 7; 1st kyu = 3-digit × 10 lines, 20 problems in 12 minutes plus × and ÷.
- **Flash anzan (Japan Flash Anzan Association, 20 kyu → 20 dan; 10 questions, 7 right to pass):** 20th kyu = three 1-digit numbers in 5 s; 12th kyu = ten 2-digit in 10 s; 1st kyu = fifteen 2-digit in 13 s; 2nd dan = four 3-digit in 4 s; 5th dan = ten 3-digit in 7 s; 10th dan = fifteen 3-digit in 3 s; 20th dan = 1.5 s. Record 1.61 s.
- **Common drill types every program uses:** reading/setting beads, dictation (teacher reads numbers in a rhythm, child keeps pace), flash cards, timed written sheets (left-to-right, say the move), mental (eyes closed, visualised beads), listening at speed, and a graded test per level with accuracy before speed. Class norm: start anzan almost immediately, short daily practice (10–20 min) beats long weekly sessions. Our stage ladder maps to this: Sprout–Adept ≈ Foundation, Ace–Champion ≈ Construction, Prodigy–Legend ≈ Advanced/dan.

---

## 4. File conventions

- Folder per deliverable: `docs/products/<key>/`. Lowercase-hyphen file names. `README.md` first.
- Markdown with `#` title, one-line standfirst, then `##` sections. Tables only where a parent compares things. Page breaks for print: `<div class="page-break"></div>` (md-to-pdf honours it).
- Printables: give an A4/Letter-safe layout in the markdown (one drill per page), and the command to render: `npx md-to-pdf file.md` (MIT, https://github.com/simonhaenisch/md-to-pdf ; clone to `vendor/md-to-pdf` only if you need to customise it).
- Problem sets: generate with `docs/products/tools/gen.js` patterns (seeded, verified against the lesson's allowed formulas); never hand-type arithmetic.
- Images: describe them in `[art: …]` notes; do not generate.
- Every file ends with a one-line `<!-- status: ready | needs Hunter: … -->`.

---

## 5. Deliverable specs

### 5.1 `bonus-guides`

**Scope.** The two $97 bonuses promised on `university.html`: *Valedictorian Secrets* and *Win the Future: The Career-Picking Guide*. Parent-facing. FK ≤ 6.
**Files.** `README.md` · `valedictorian-secrets.md` (4,000–5,500 words, 8–10 short chapters) · `win-the-future.md` (3,500–5,000 words, 7–9 chapters) · `cover-notes.md` (one page each: title, subtitle, art direction per `DESIGN.md`).
**Structure, Valedictorian Secrets** ("what the top 1% of parents do differently, from week one of school"): opening Epiphany Bridge from Hunter (§1.3, the C-student who learned to think, not the parents who hovered); then one habit per chapter, each = the habit, why it works in two paragraphs, the exact words to say, a five-minute version. Candidate habits (build from evidence you verify, cite URLs): daily short practice over weekly long; praise the move not the answer; the family calendar slot; reading aloud and dictation at the table; sleep and screens; how to talk to the teacher; the Bead Score as the one number they track. Close with the Big Domino and a pointer to Stage 1 in the trainer (value ladder).
**Structure, Win the Future** ("how to spot and feed the talent your child already has"): Hunter's framing (ability is built; the job is to notice what the child does when nobody is making them); a short observation worksheet (what they choose, what they repeat, what they fix); six to eight talent patterns with what to feed each (spatial, verbal, social, building, movement, music, numbers, care) and what *not* to do; a chapter on why mental calculation is the one skill that carries into any field (cite only §1.4 research); a chapter on the next ten years that stays general (AI will change entry-level work; thinking and computing stay valuable) with no predictions you cannot cite; a one-page plan the parent fills in.
**Frameworks.** Epiphany Bridge opening; each chapter Hook-Story-Offer in miniature; close with the value ladder step.
**Existing repo provides.** Hunter's voice and story: `playbook.md` chapters 1, 3, 8; coach lines in `js/coach.js`; stuck lines in Playbook ch. 8 (reuse by reference, do not copy whole).
**Repos.** None needed. (md-to-pdf for rendering, shared.)

### 5.2 `prodigy-secrets-program`

**Scope.** The $997 gift the parent "keeps even if they cancel": a printable lesson library outside the app covering all 10 stages. Parent-facing. FK ≤ 6 (tables excluded).
**Files.** `README.md` · `00-how-to-use.md` (2 pages: the routine, the hand, the five-move colours, how a lesson page runs, when to take a boss) · `stage-01-sprout.md` … `stage-10-legend.md` (one file per stage) · `boss-tests.md` (all 10 boss tests as printable tests with pass marks taken from `js/curriculum.js` `boss.parts`) · `lesson-index.md` (numbered list of every lesson and quest, the count stated honestly).
**Per lesson page (76 of them, ~250–400 words each):** number and title exactly as in §1.2; "by the end your child can"; the move, taught in prose with one worked example on beads (`[beads: 694]` tokens for the designer); parent line in Hunter's voice (one sentence, Caveat); a ten-problem drill generated with `tools/gen.js` logic for that lesson's allowed formulas, with answers at the bottom of the stage file; "stuck?" line (reuse `js/coach.js` `stuckHelp` wording); next lesson. **Per daily quest (28):** a half-page drill card with the same header. 76 + 28 = 104 entries; the index says "76 lessons and 28 quest drills" and the README flags the 102 claim.
**Length.** ~30,000–40,000 words total incl. drills. Stages 6–10 (×, ÷, mental, flash) must still have real problems: use `js/generator.js` multiply/divide/flash generators via a small script in your folder (`tools/`), seeded, verified like `tools/verify.js`.
**Frameworks.** Proven-program structure (§3): each stage opens with its level goal, drill types (reading, written, dictation, flash, mental), the accuracy-before-speed rule, and its rough kyu equivalent from the ladder notes. Value ladder: each stage's last page says what the software adds (animation, grading, chart) without selling hard.
**Existing repo provides.** `docs/PLAN.md` (prose for every lesson and boss), `js/curriculum.js` (lesson keys, minutes, drill config, boss parts), `js/coach.js`, `playbook.md` ch. 4–7 (formulas, stages, flash, Bead Score), `workbook.md` (Stages 1–2 already drilled; reference it for Days 1–90, do not duplicate).
**Repos.** None required. Optional: `pove/soroban` (MIT, https://github.com/pove/soroban ) for its printable bead-card generator if you want bead pictures rendered; otherwise leave `[beads: n]` tokens.

### 5.3 `practice-handouts`

**Scope.** "Unlimited Phenom-U Practice Handouts, printed on demand, matched to the exact lesson" ($297). Parent-facing printables. FK ≤ 6 on the instruction text.
**Files.** `README.md` · `handout-template.md` (the one-page layout: name/date/time/score header, 20 problems in soroban columns, "work left to right, say the move" footer, answer strip to fold under) · `tools/make-handouts.mjs` (imports `js/generator.js` + `js/curriculum.js`, takes `--stage N --lesson key --count 20 --seed S`, emits a markdown handout + answer key; verifies every problem against the lesson's allowed formulas like `tools/verify.js`) · `samples/` (one rendered handout per lesson, 76 files, plus 10 boss-prep sheets) · `parent-guide.md` (1 page: which sheet when, how to time it, what score means "move on") · `handout-catalog.md` (table of every sheet).
**Structure.** Mirror real soroban practice sheets and the app's `printWorksheet` (`js/app.js`): stacked numbers, sign on the left, 2 rows × 10, big answer boxes; flash/listening sheets print the number list for the parent to read aloud with the tempo; mental sheets print problems only. Pass marks match the lesson's drill target.
**Frameworks.** Proven-program drill types (§3): written, dictation, flash, mental, timed; accuracy before speed.
**Existing repo provides.** `js/generator.js`, `js/soroban.js`, `js/curriculum.js`, `docs/products/tools/gen.js`/`verify.js` (copy the pattern into your own `tools/`), `js/app.js` `printWorksheet` CSS.
**Repos.** `simonhaenisch/md-to-pdf` (MIT) for rendering samples to PDF if you want to check layout; clone shallow to `vendor/md-to-pdf` only if `npx` is not enough.

### 5.4 `certification-course`

**Scope.** The "Full Certification Course Library (30 hours), 20-lesson course, about six weeks, video and drills, on-demand test, Pass Promise". Instructor material. FK ≤ 9 (video scripts ≤ 7).
**Files.** `README.md` · `syllabus.md` (20 lessons mapped to 6 weeks and ~30 hours: per lesson, title, run time, what they learn, drill homework, the app lesson it mirrors) · `lessons/L01.md` … `L20.md` (each: 600–1,200-word video script in Hunter's voice + a drill set + a "teach-back" task + a 5-question check) · `exam.md` (the certification test: 40 questions, bead-move classification, worked problems, teaching scenarios, pass mark 80%; answer key in `exam-key.md`) · `pass-promise-ops.md` (how one-on-one coaching works when someone fails) · `instructor-certificate.md` (certificate wording + badge art note per `DESIGN.md`).
**Structure (20 lessons).** 1 why this works and what to promise (§1.4 only) · 2 the soroban, the hand, reading and setting · 3–4 direct moves and two-column problems · 5–6 small friends · 7–8 big friends, carries and borrows · 9 combinations and all 34 · 10 teaching the formula order and the "free beads or friend?" question · 11 drill types and tempo (written, dictation, flash, mental) · 12 running a 15-minute session and a 45-minute class · 13 boss tests, pass marks, when to hold a child back · 14 the Bead Score and the kyu ladder · 15 multiplication on the beads · 16 division · 17 anzan: building the picture, the 3–4 column limit · 18 flash anzan, tempos and the kyu table · 19 common mistakes and what to say (Playbook ch. 8 as source) · 20 your first class, the test, and the Launch Kit.
**Frameworks.** Perfect Webinar order inside L1 (big domino → three secrets) so instructors can repeat it to parents; proven-program structure (UCMAS modules, JCCI/flash kyu tables) for L11–L18.
**Existing repo provides.** `docs/PLAN.md`, `playbook.md` ch. 4–8, `js/soroban.js` (formula classification), `js/drills.js` (drill types), `js/ladder.js` (rungs, kyu mapping), `RESEARCH-NOTES.md` (exam ladders).
**Repos.** None.

### 5.5 `instructor-launch-kit`

**Scope.** "Class plans, pricing sheet, parent flyer, sign-up script, first-class checklist" plus the directory listing and badge. Instructor-facing (FK ≤ 9) with parent-facing flyer/script (FK ≤ 5).
**Files.** `README.md` · `class-plans.md` (an 8-week starter course for a group of 4–8 kids, 45-minute sessions, each plan: warm-up, lesson, drill, flash game, parent note; mapped to Sprout and Explorer) · `pricing-sheet.md` ($20–40 per session per the FAQ; per-child, per-course and sibling options; what to charge for a 4-week trial block; the math for 6 kids × 8 weeks; no earnings promises) · `parent-flyer.md` (one page, Hook-Story-Offer, two versions: school pickup and online) · `sign-up-script.md` (the conversation at pickup, the follow-up text, the enrolment message; objection answers for the three false beliefs) · `first-class-checklist.md` · `directory-listing.md` (what the listing shows, the form fields, badge usage rules, and `[HUNTER: directory page does not exist]`) · `parent-intake-form.md` · `progress-report-template.md` (sent after week 4 and 8).
**Frameworks.** Hook-Story-Offer for flyer and script; three secrets for objections; value ladder (every student's family is sent to the free kit funnel and University; instructor account covers their students).
**Existing repo provides.** Sales copy angles in `docs/FUNNEL.md` (five ad angles); `js/coach.js` parent lines; `DESIGN.md` for the flyer.
**Repos.** None.

### 5.6 `marketing-sequences`

**Scope.** Every message the funnel promises or needs to run: emails, texts, ads. Marketing. FK ≤ 5.
**Files.** `README.md` · `01-kit-buyer-soap-opera.md` (5 emails, day 0–4, per §3; email 1 is also the receipt/welcome the thank-you page promises: receipt, parent-account link, "reply with your child's name and age"; day 1 text "print Lesson 1" per Hunter's rule; ends with the University offer for those who skipped) · `02-abandon-cart.md` (3 emails + 2 texts over 48 h for step-1 leads who did not pay shipping) · `03-trial-onboarding.md` (14-day University trial: day 0, 1, 3, 5, 7, 10, 12, 13; each one a lesson milestone + a reply hook; day 13 is the "card is charged tomorrow" note the FAQ promises) · `04-shipping-and-first-week.md` (tracking email, "the box landed" text, week-one plan reply template) · `05-seinfeld-bank.md` (20 daily story emails, each 150–300 words, one link, Hunter's voice, episodes drawn only from §1.3 facts and from the product itself; mark any anecdote that needs Hunter's real detail `[HUNTER]`) · `06-certification-sequence.md` (3 emails for University members who did not certify) · `07-ad-copy.md` (the five angles in `docs/FUNNEL.md`, each with 3 primary texts, 3 headlines, 1 video script ≤ 30 s; compliance: no "cure", no income claims, no before/after) · `08-sms-bank.md` (every text, under 160 characters, with opt-out line) · `send-map.md` (one table: trigger, delay, channel, file, subject).
**Rules.** One CTA per message. Subject lines ≤ 45 characters. Every email ends with an open loop to the next (soap opera) or a P.S. with the link (Seinfeld). Texts only reference the day-one text rule (Hunter: the phone field exists for this). Use test addresses only in examples: `hunterappleton369@gmail.com`, `9857681025`.
**Frameworks.** Soap Opera Sequence, Seinfeld emails, Hook-Story-Offer, three secrets, the stack (trial day 12–13 restates the university stack by name and value).
**Existing repo provides.** `docs/FUNNEL.md` (angles, holdbacks, targeting), `docs/VSL-SCRIPT.md`, funnel page copy for exact offer names, thank-you page promises.
**Repos.** None required. Optional reference only (read, don't copy): `sanky369/vibe-building-skills` email-sequences (MIT) for send-day maps.

### 5.7 `legal-and-ops`

**Scope.** What must exist before ads run: privacy policy, terms, refund/guarantee terms, subscription terms, SMS/email consent, COPPA note (children's data in the app: profiles with name and age), instructor agreement, and the ops runbook. HTML pages for the two public legal docs. No FK target; plain English.
**Files.** `README.md` · `privacy-policy.html` + `.md` (data collected on the funnel: name, email, phone, address; app: child first name and age, progress; Supabase; email provider; Stripe; Meta pixel; no sale of data; COPPA: parent creates the profile, no direct collection from under-13s, deletion on request; CCPA/Colorado rights section; contact `hello@childphenoms.com`) · `terms.html` + `.md` (kit, shipping, bump, 14-day trial then $67/mo, $197 regular, cancel/pause, certification $297 once, Pass Promise, 30-day refund, Keep-the-Kit promise, "shipping non-refundable after 30 days", no income guarantee, research disclaimer, Facebook disclaimer) · `guarantees.md` (the three guarantees as printed, with the exact refund steps) · `sms-email-consent.md` (checkout consent text, STOP/HELP handling, TCPA basics) · `instructor-agreement.md` (independent instructor, badge/name licence, revocation, no employment, no earnings claim, child-safety expectations, background-check `[HUNTER: decide]`) · `ops-runbook.md` (order → Stripe → fulfilment → tracking → trial start → day-14 charge → cancellation → refund; support macros for the 10 most likely emails; who does what) · `launch-checklist.md` (everything Hunter must do: Stripe links in `config.js`, legal pages linked in footers, pixel, email/SMS provider, test order with the test contacts).
**Frameworks.** None; follow the value ladder only to make sure every offer and guarantee on every page is covered by a clause.
**Existing repo provides.** `free-abacus/config.js` (prices, URLs), footers on all four pages (existing disclaimers), `supabase/schema.sql` and `js/auth.js` (what the app stores), `README.md` (Accounts).
**Repos.** Do **not** clone `ArthurGareginyan/privacy-policy-template` (GPLv3). Use the structure of a permissively licensed policy only if you find one (MIT/CC-BY; verify the license file first) or write from scratch. Mark the whole folder `needs Hunter: counsel review`.

---

## 6. Grade targets per key

| Key | FK target | Reader |
|---|---|---|
| bonus-guides | ≤ 6 | parent |
| prodigy-secrets-program | ≤ 6 (prose; tables excluded) | parent + child |
| practice-handouts | ≤ 6 (instruction text) | parent |
| certification-course | ≤ 9 (video scripts ≤ 7) | instructor |
| instructor-launch-kit | ≤ 9 instructor files; ≤ 5 flyer, script, texts | instructor / parent |
| marketing-sequences | ≤ 5 | parent |
| legal-and-ops | none; plain English | Hunter, counsel |

---

## 7. Open items for Hunter (collected here so builders do not repeat them)

1. 102 vs 76 lessons on the pages.
2. Confirm the "guessed alone" story framing; add a photo and record the VSL (`docs/VSL-SCRIPT.md`).
3. Stripe links, lead webhook, email/SMS provider, Meta pixel in `config.js`/pages.
4. Counsel review of `legal-and-ops`; decide on instructor background checks.
5. Real testimonials and screenshots (section is hidden until then).
6. Decide whether "thousands of kids" on the funnel stays; new deliverables do not repeat it.
7. The instructor directory page does not exist.
8. `playbook.md` currently scores 1/5 on deslop (3× "unlock", one throat-clearing opener, two rule-of-three lists, one hyphen stack); a 20-minute fix, not in any builder's scope.

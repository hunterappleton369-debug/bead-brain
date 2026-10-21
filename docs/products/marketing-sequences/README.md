# Marketing sequences

Every email, text and ad the Child Phenoms free-abacus funnel needs to run, written in Hunter's voice. Load them in the order shown in `send-map.md`.

## Files

| File | What it is | Messages | Words | Deslop | FK grade | Status |
|---|---|---|---|---|---|---|
| `01-kit-buyer-soap-opera.md` | Soap Opera Sequence, days 0 to 4. Email 1 is the receipt and welcome the thank-you page promises. Includes the day-one text. | 5 emails + 1 text | 1,713 | 5/5 | 2.7 | needs Hunter |
| `02-abandon-cart.md` | Step-1 leads who did not pay shipping, over 48 hours | 3 emails + 2 texts | 905 | 5/5 | 2.7 (2.5 without the table) | needs Hunter |
| `03-trial-onboarding.md` | University 14-day test drive: days 0, 1, 3, 5, 7, 10, 12, 13. Day 13 is the "card is charged $67 tomorrow" note. | 8 emails | 1,626 | 5/5 | 3.4 | needs Hunter |
| `04-shipping-and-first-week.md` | Tracking email, box-landed text, week-one plan reply with three age blocks | 2 emails + 1 text | 767 | 5/5 | 3.2 | needs Hunter |
| `05-seinfeld-bank.md` | 20 daily story emails, 157 to 206 words each, one link in the P.S. | 20 emails | 3,943 | 5/5 | 2.0 | needs Hunter |
| `06-certification-sequence.md` | Members who did not certify: story, stack, questions | 3 emails | 847 | 5/5 | 4.1 | needs Hunter |
| `07-ad-copy.md` | Five Facebook angles: 3 primary texts, 3 headlines and a video script of 30 s or less each | 15 texts, 15 headlines, 5 scripts | 1,982 | 5/5 | 2.9 | needs Hunter |
| `08-sms-bank.md` | All five texts with character counts, consent and quiet-hour rules | 5 texts | 567 | 5/5 | 4.9 (4.6 without the table) | needs Hunter |
| `09-post-purchase-loyalty.md` | Loyalty emails for every kit buyer, days 6 to 75: the Whole Brain family, the first-week video, the Sprout Boss, a kit for a friend, a three-line review ask, the stall, the year ahead. One link each, in the P.S. | 8 emails | 2,202 | 5/5 | 1.7 | needs Hunter |
| `send-map.md` | One table: trigger, delay, channel, file, subject | 54 rows of sends | 1,053 | 5/5 | 12.1 (6.2 without the table; ops file, no target) | ready |
| `README.md` | This file | | | | | ready |

**Totals:** 49 emails (one is a manual reply), 5 texts (parked at launch until text consent is collected), 5 ad angles. Every subject line is 45 characters or less. Every text is 160 characters or less with the opt-out line (longest is 156).

Checker commands, run from the repo root:

```
python3 ~/.claude/skills/slopmonster/tools/deslop.py docs/products/marketing-sequences/<file>
python3 docs/products/tools/readlevel.py docs/products/marketing-sequences/<file>
```

## Link tags

Every `{{link_…}}` tag in the emails maps to one URL. Set them once in the email tool.

| Tag | URL |
|---|---|
| `{{link_kit}}` | https://childphenoms.com/free-abacus/ |
| `{{link_university}}` | https://childphenoms.com/free-abacus/university.html |
| `{{link_certify}}` | https://childphenoms.com/free-abacus/certify.html |
| `{{link_start}}` | https://childphenoms.com/#/start |
| `{{link_stage1}}` | https://childphenoms.com/#/stage/1 |
| `{{link_lesson1}}` | https://childphenoms.com/#/stage/1/lesson/hold |
| `{{link_lesson_read}}` | https://childphenoms.com/#/stage/1/lesson/read |
| `{{link_lesson_read3}}` | https://childphenoms.com/#/stage/1/lesson/read3 |
| `{{link_lesson_eyes}}` | https://childphenoms.com/#/stage/1/lesson/eyes-closed |
| `{{link_boss1}}` | https://childphenoms.com/#/stage/1/boss |
| `{{link_worksheet1}}` | https://childphenoms.com/#/worksheet/1 |
| `{{link_account}}` | [HUNTER: the cancel and pause page. Until it exists, https://childphenoms.com/#/family] |
| `{{link_tracking}}` | the carrier link from the fulfilment tool |

Other merge fields: `{{first_name}}`, `{{order_id}}`, `{{order_total}}`, `{{if_bump}}…{{end_if}}` (show only when the $27 Playbook add-on was bought; every Playbook line sits inside it), and `{{child}}` (typed by hand in the week-one reply).

## Shared email footer

Put this under every email. It holds the notes that the brief keeps out of body copy.

> Child Phenoms · hello@childphenoms.com · [HUNTER: mailing address, required by CAN-SPAM]
> You get this because you ordered a kit or started an order at childphenoms.com. Unsubscribe: {{unsubscribe}}
> Research cited describes group averages in published trials. Your child's progress depends on practice.
> Instructor earnings are not promised. What you charge is up to you.

## What each sequence is built on

- **Soap Opera Sequence** (`01`): set the stage, high drama and the wall, the epiphany and one free step, hidden benefits and the offer, then the last call. Each email ends on an open loop. Source: https://www.clickfunnels.com/blog/soap-opera-sequence/
- **Seinfeld emails** (`05`): a short story, a small lesson, one link in the P.S. Every story uses only facts from Hunter's page bio, the product, or a study the brief allows.
- **Hook, Story, Offer** (`02`, `06`, `07`): every ad and every sales email opens with a hook, tells a short story and makes one offer. Source: https://www.clickfunnels.com/blog/hook-story-offer/
- **Three secrets** (`02` email A3, `06` email C3): the three false beliefs from `docs/FUNNEL.md`, each answered with Hunter's story or the 2016 trial.
- **The Stack** (`01` email 4, `03` days 12 and 13, `06` email C2): every piece by its printed name and value, the total, then the price, a trial close, the guarantee and one button.
- **Value ladder:** free kit and $9.95, then the $27 Playbook add-on, then the $67 a month University, then the $297 certification. Each sequence points only to the next rung. Source: https://www.clickfunnels.com/blog/value-ladder/
- **Proven abacus programs** (`05` emails 4, 7, 8, 16): daily short drills with a weekly class, graded tests per level, accuracy before speed, and the flash anzan kyu ladder, as summed up in the brief, section 3.

## Sources cited in the copy

- Barner and others, 2016, Child Development, the three-year trial: https://bps.org.uk/research-digest/teaching-children-ancient-mental-abacus-technique-boosted-their-maths-abilities
- Wang and others, 2019, Journal of Neuroscience: https://pmc.ncbi.nlm.nih.gov/articles/PMC6697396
- Frank and Barner, 2012 (three to four rods, works without words) and Stigler, 1984 (off-by-five slips), as listed in the brief, section 1.4.
- Guinness record, 1.61 s, Rikako Miyamoto, February 2024: https://www.guinnessworldrecords.com/world-records/fastest-flash-mental-arithmetic
- About a million Japanese children a year (The Guardian, Alex Bellos), as listed in the brief.
- NAEP 2024, 28% of 8th graders proficient: https://www.k12dive.com/news/2024-naep-reading-math-scores-drop-pre-pandemic/738535/

## Choices made, and why

- **The kit is the abacus and the 3-Night Quick-Start Card (offer change, 2026-10-21).** The Playbook is now the $27 add-on, "Child Prodigy Secrets Playbook + Audiobook." Every Playbook line sits inside `{{if_bump}}…{{end_if}}`, so a kit-only family is never told the Playbook is in their box. Where the Playbook used to give everyone an instruction, the copy points to the quick-start card or Lesson 1 in the trainer. The old Prodigy Maker Workbook bump is gone. The card text is in `../welcome-card.md`.
- **"102 lessons" is left out.** The app has 76 lessons and 28 quests. The stacks say "Prodigy Secrets Program, all 10 stages" with the printed $997 value. Add "102 lessons" back once the page count is fixed.
- **"Backed by 3 randomized trials" became "Backed by a 3-year randomized trial."** Only the 2016 study is a confirmed randomized trial in the brief's sources.
- **No borrowed footage.** The ad scripts call for Hunter and real families on camera, never the NBC, PBS or TikTok clips.
- **No fake deadlines.** The abandon emails use the honest close ("this is my last email about it") and the Keep-the-Kit Promise, not a stock countdown. The page's "only 1,000 kits" line is not repeated.
- **Day-one text.** The app has no single-lesson print view, so S1 links the Lesson 1 page, which the parent can print or open. `#/worksheet/1` prints the Stage 1 practice sheet and is used on trial day 7.
- **The old VSL prices** in `docs/VSL-SCRIPT.md` ($147 and $49) are out of date. Everything here uses $197 and $67, as the pages say.

## Open items for Hunter

1. **Text consent.** Add a consent line to step 1 of the kit form before any text goes out (wording in `legal-and-ops`).
2. **Mailing address** in the email footer (CAN-SPAM).
3. **Cancel and pause page** for `{{link_account}}`, live before the first trial reaches day 13. The day-13 email and text promise it.
4. **The $67 link in emails.** The University page says "this page only." Emails 4 and 5 of the soap opera send skippers back to it. Decide how long that link stays open to email traffic.
5. **Members who certify.** The certify page gives "twelve months of the family membership, on us." Confirm that stops or credits the $67 billing for a paying member.
6. **Seinfeld memory lines.** Fill in or cut the five `[HUNTER]` lines in emails 1, 2, 5, 9 and 18.
7. **Story check.** Confirm the "pieced it together alone, guessed what came next" line, used in `01`, `05` and `06`.
8. **Ad footage.** Film the five videos with your own footage and signed releases. Keep your sport off screen, along with the school and the year.
9. **Study link on the kit page** for the science ad (angle 4).
10. **Email and SMS tool, lead webhook, fulfilment tracking** wired in `config.js` and the tools. Test with hunterappleton369@gmail.com and 9857681025 only.
11. **Funnel URL.** The links assume the funnel lives at https://childphenoms.com/free-abacus/. Change the tags if it moves.

## Repos

None used. Nothing was cloned into `vendor/`.

<!-- status: needs Hunter: items 1 to 11 above -->

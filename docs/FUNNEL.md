# Free Abacus Funnel — plan (2026-10-19)

Pages live in `free-abacus/`. Static, mobile-first, built on the site's design system. Payment is a hosted checkout (Stripe Payment Links or the matching ClickFunnels order page) wired in `free-abacus/config.js`; until those links are filled in, the buttons walk the funnel in preview mode without charging.

## The opportunity we sell (not an improvement)

Private-school parents already pay for "better school." We are not selling better grades or a math tutor (an improvement offer they associate with remediation). We are selling a **different kind of smart**: a child who thinks and computes instead of memorizes, with a visible superpower (mental calculation in seconds) that marks them out in any room. School cannot give it, and cannot take it away.

**Big domino:** if a parent believes that intelligence is *built*, not born, and that the mental abacus is the fastest known way to build it at home, every other objection falls.

**Three false beliefs, broken on the University page with Hunter's story:**

| Belief | Secret | Proof used |
|---|---|---|
| Vehicle: "School makes smart kids" | School can't make your child special; it rewards memorizers, and results are falling | NAEP 2024 (28% of 8th graders proficient, scores back at 25-years-ago levels); fMRI studies (abacus kids compute in visual/motor regions) |
| Internal: "My kid isn't a math kid / can't sit still" | There is no such thing as a math kid | Hunter: C's + ADHD → perfect ACT, full ride, D1 Scholar-Athlete of the Year; Barner 2016 RCT (ordinary classroom kids); hands-on method suits fidgety kids |
| External: "No time / tutors are expensive / takes years" | Fifteen minutes a day beats two hours a week at a center | Daily short practice; software picks problems; Kumon-type centers $150–250/mo |

**Top 3 holdbacks (2026-10-20 pass) and where each is rewritten in the copy:**

1. "My child isn't a math kid" → Hunter's C's + ADHD story, the 2016 trial with ordinary kids, "wiggles become math" (page 1 lie/truth box, page 2 Secret #2).
2. "I'm not a math person and I don't have time to teach it" → you don't teach, you sit beside them 15 minutes; the trainer picks and grades every problem; the Playbook gives you the words (page 1 box + FAQ, page 2 Secret #3, page 3 note).
3. "My kid will fight me on it, it's one more battle" → math with the hands feels like a game; the week-three click; kids ask for flash rounds; fidgety kids do best (page 1 box, page 2 Secret #2).

Story beats used to build value: it was hard before (no kit, no parent book, no trainer; Hunter pieced it together alone and guessed what came next), and the kit removes exactly that (beads + Playbook + trainer that picks the next step). The "guessed alone" framing is Claude's wording and needs Hunter's confirmation. Copy is held at Flesch-Kincaid grade ≤3.1 per page (scratchpad tools/readlevel.py) and passes the slop-monster checker 5/5.

**Borrow order (method decision, 2026-10-21):** subtraction with a big friend is taught everywhere as "add the friend on this rod, then borrow 1 from the left" ("Minus 9: add 1, borrow 1 from the left"), matching the app's drill hints; addition stays "take away the friend, then carry". One rule: work this rod first, then the rod to its left.

**"About a million Japanese children" line (2026-10-21):** kept everywhere it appears (page 1, parent flyer, marketing). Source as cited in the social-proof list below; the figure is disputed (one source counts ~43,000 in private soroban schools), so keep the "about" and the attribution.

**Certification for life (2026-10-21):** the certification itself is permanent, on page 3, the certificate and the instructor agreement; only the name/badge licence and the directory listing can be ended for cause (agreement §3.2 and §11).

**Founder name on the pages:** Hunter McClain, Sheridan, Wyoming (pen name; confirmed by Hunter 2026-10-21). The email account and real name stay Appleton.

## Page map and offer stack

| Step | Page | Offer | Price | Value shown |
|---|---|---|---|---|
| 1 | `index.html` | Child Phenoms Abacus + Child Prodigy Secrets Playbook (Stage 1 trainer removed by Hunter 2026-10-20) | FREE, $9.95 shipping | $86 ($39 + $47) |
| 1b | order bump (step 2 of the form) | Prodigy Maker Workbook + Audiobook, ships in the same box | $27 | "normally $67" |
| 2 | `university.html` | Child Phenom University 14-day free test drive; the Prodigy Secrets Program (100+ lessons and drills) is the $997 gift they keep | $0 today, then $67/mo (66% off the $197 regular price; confirmed by Hunter 2026-10-20) | $1,685 stack (Prodigy Secrets Program $997, Practice Handouts $297, Software $197, Valedictorian Secrets $97, Win the Future $97) |
| 3 | `certify.html` | Certified Phenom Instructor: 30-hour course, University year, free year of software for their child, Launch Kit, directory listing | $297 once | $3,132 stack |
| 4 | `thanks.html` | Confirmation, next four actions, link to `#/start` | | |

Two-step order form: step 1 captures name, email, phone (saved locally and POSTed to `leadWebhook` for abandon follow-up and the day-one text); step 2 shows the bump, the order summary and sends the parent to checkout. Card and shipping address are collected on the hosted checkout (Stripe links collect shipping natively; ClickFunnels collects on its order page).

**Economics to validate (assumptions, not data):** kit landed cost ~$10–14 plus ~$5 postage against $9.95 collected means roughly -$6 per kit before the bump. At a 30–35% bump take rate the front end breaks even; the University trial and certification are the profit. A $1 7-day trial instead of free 14 days would put cash up front and qualify harder; worth a split test once the free version has a baseline.

## Social proof collected

- Barner, Alvarez, Sullivan, Brooks, Srinivasan & Frank (2016), *Child Development*: 3-year classroom RCT, 204 kids, abacus group beat extra-math group on calculation, arithmetic, place value; large effects, no change to general cognition. [BPS summary](https://bps.org.uk/research-digest/teaching-children-ancient-mental-abacus-technique-boosted-their-maths-abilities)
- Wang et al. (2019), *Journal of Neuroscience*: 144 children, 5 years, improved visuospatial working memory, frontal/parietal/occipital activation changes. [PMC6697396](https://pmc.ncbi.nlm.nih.gov/articles/PMC6697396)
- Literature review (2021): five studies show improved arithmetic, consistent with Hatano and Stigler. [PMC8283869](https://pmc.ncbi.nlm.nih.gov/articles/PMC8283869/)
- PLOS One (2015): abacus-trained Chinese children better at math and task switching. [link](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0139930)
- Flash anzan: Takeo Sasano, 15 three-digit numbers in 1.70 s (2012); Guinness record 1.61 s, Rikako Miyamoto, Feb 2024. [Guinness](https://www.guinnessworldrecords.com/world-records/fastest-flash-mental-arithmetic)
- ~1 million Japanese kids learn the soroban yearly (Guardian / Alex Bellos, via [Why Evolution Is True](https://whyevolutionistrue.com/2012/11/02/flash-anzan-an-amazing-new-number-game/)).
- Public video: Little Big Shots "Mind-Blowing Math! These Child Prodigies Use an 'Abacus in Their Head'" ([YouTube 3PdgByQSLso](https://www.youtube.com/watch?v=3PdgByQSLso)); PBS NOVA "This Teen Calculates Mind-Boggling Math in Her Head" (Apoorva Panidapu, started abacus at ~5) ([PBS](https://www.pbs.org/video/teen-calculates-mind-boggling-math-her-head-ueanyo/)); viral clip of a Chinese child adding ten 5-digit numbers in 8 s (TikTok, unverified).
- NAEP 2024: 8th-grade math down 8 points from 2019, 28% proficient, "where it was 25 years ago" ([K-12 Dive](https://www.k12dive.com/news/2024-naep-reading-math-scores-drop-pre-pandemic/738535/), [EdTrust](https://edtrust.org/blog/naep-2024-results-tell-us-that-its-time-for-action/)).
- Price anchors: Kumon ~$100–250/mo per subject; private math tutors $40–80/hr; EdChoice July 2025: parents say they'd pay ~$357/mo for tutoring, >55% of private-school parents interested ([EdChoice](https://www.edchoice.org/2025-a-kaleidoscope-view-of-k12-tutoring-in-america/)).

Caution: the 2017 US first-grade trial (Barner et al., J. Numerical Cognition) found no benefit after one year with 2 h/week in first graders; do not claim "works for every child" or IQ gains. The pages claim arithmetic, working memory and the record-holder feats only.

## Facebook ad angles (test 5, one creative each)

1. **Human calculator.** Clip of a child doing flash anzan. "Your 8-year-old can learn this in 15 minutes a day. Free abacus kit, just cover shipping." Headline: *Free abacus kit for 7–11 year olds*.
2. **Private-school distinction.** "Tuition buys the same lesson every kid in the room gets. This is the thing that makes yours different." Headline: *The skill school can't teach*.
3. **Founder story.** Hunter to camera: "I got C's in math and had ADHD. Then I trained my brain like an athlete. Perfect ACT, full ride. Here's the tool." Headline: *From C student to perfect ACT*.
4. **Science.** "A 3-year randomized trial. Ordinary kids, 3 hours a week on the abacus, beat the extra-math group. Free kit." Headline: *Backed by 3 randomized trials*.
5. **Fidgety kid.** "Can't sit still? Good. This is math you do with your hands." Headline: *Math for kids who can't sit still*.

Targeting: parents 32–48, HHI top 20%, interests private schools / Montessori / Kumon / Mathnasium / Khan Academy Kids / chess for kids, lookalike from kit buyers once there are 500.

## Mobile notes

Single column, 16px gutters, 48px inputs (16px font so iOS doesn't zoom), full-width buttons, sticky bottom CTA that hides while the form is on screen, click-to-play video, long-form copy below the fold (mobile reads, it doesn't watch). Under 980px the sticky bar is the main CTA.

## Open questions for Hunter

1. **ClickFunnels or these pages?** The browser was at the ClickFunnels login; I couldn't sign in. If you want the funnel built inside ClickFunnels, sign in on the Browser pane and I'll rebuild page by page from this copy. Otherwise these pages run on childphenoms.com with Stripe links.
2. **Six screenshots:** macOS blocks reading from the Messages attachment folder. Drop them in `~/Downloads` or `Bead-Brain/docs/` and I'll match the layout to them.
3. **Lesson count:** settled 2026-10-21. The pages say "100+ lessons and drills" (the app has 76 lessons + 28 quests; see docs/products/prodigy-secrets-program/lesson-index.md).
4. **The $997 gift:** the pages promise the Prodigy Secrets Program stays with them even if they cancel the trial. That needs a deliverable outside the app (a printable lesson book or audio walkthroughs). Confirm, or change the promise to "free access during the trial."
5. **Kit pricing:** $9.95 shipping, bump at $27, trial → $49/mo, certification $297. Change any of these in `config.js` and the copy.
6. **Workbook, audiobook, Valedictorians guide, Career guide, Launch Kit, instructor directory:** all are mocked up and sold; none exist yet. Which do you want written first?
7. **Founder photo and VSL recording.** Script in `docs/VSL-SCRIPT.md`. The page shows a placeholder until the video is embedded.
8. **Parent testimonials:** none exist. Capture video from the first ten families; the "Parents are talking" section is hidden until real screenshots are dropped in.
9. **Guarantees as written:** keep-the-kit (refund shipping), 14 days free, certification pass guarantee + 30-day refund. Confirm you'll honor these.
10. **Legal:** privacy policy and terms pages don't exist on the site yet. Needed before ads run.

## Ideas worth testing after baseline

- **$1 trial instead of free** (cash up front, higher-quality trialists).
- **Downsell after certification**: 3 × $99, or a $97 "Instructor Starter" with the Launch Kit only.
- **Day-one text** (Hunter's rule from the Enamelogic funnel): the phone field exists for this. Send the "print Lesson 1" link the morning after the order.
- **Bead Score challenge ad**: a 60-second clip of a kid's score climbing on the chart, cut from real users.
- **Grandparent gift angle** for Q4: "The gift that makes them the smartest kid in the class."

## Decisions on 2026-10-21 (launch day)

- **The free kit is the abacus plus a 3-night quick-start card.** The printed Child Prodigy Secrets Playbook left the kit and became the $27 order bump, "Child Prodigy Secrets Playbook + Audiobook: How to Teach Your Child to Answer Any Math Problem, Instantly" (printed copy in the same box, digital copy and audiobook under "What you own" in the parent account). The Prodigy Maker Workbook bump is retired. Kit value on the page is $39.
- **The bump is text only**, a last-second decision above the checkout button. No product image in the bump box. The Expert-Secrets-style cover is used on the thank-you page, in emails and in ads, not on page 1.
- **Step 1 of the order form collects name, email and phone only.** The hosted checkout collects the address and card, so the page never asks for the address twice.
- **Checkout is Stripe for everything** (kit, kit + Playbook, University trial, certification) because a hosted Stripe Payment Link can send the parent straight back to the next funnel page. Shopify holds the same two products and the $9.95 rate as the fulfilment back office for CJ; orders reach it by Zapier or by hand. A paid return carries `?paid=kit|university|certify`, and only that marks the item as bought.
- **Stages 2 to 10 of the trainer are gated** behind a trialing or active University membership. Stage 1 is free for every kit buyer.
- **Email only.** No text-message consent is collected and no SMS goes out at launch. The SMS rows in the send map are parked.
- **Meta Pixel** loads only when `metaPixelId` is set in `free-abacus/config.js`. Events: PageView, Lead (step 1), AddToCart (bump ticked), InitiateCheckout (checkout and both upsell buttons), Purchase (kit return, certification), StartTrial (University return). Once per browser for the conversions.
- Copy fixes from the Codex review: no "share your info" claim, no "almost none in America", "many families" not "most", the 2019 study described as a memory-test result, NAEP "proficient" wording, founder initials HM, the fake video player on page 2 replaced by a "how one lesson works" box until the VSL is recorded, "cancel from your account page" instead of "two taps", pause by request, "your rate never goes up" instead of "locked for life", trial first-charge date shown next to the price, "many instructors" instead of "most".

## Decisions on 2026-10-22 (fulfilment)

- **Supplier: DSers + AliExpress.** The kit's abacus is the AliExpress listing "Portable Japanese 13 Digits Column Abacus Soroban Caculating School" (item 1005009621460689, AliExpress Choice, $8.92 with free shipping to the US, DSers quotes AliExpress Selection Standard, $1.99, 7 to 13 days with tracking, 358 sold at 4.8), variant BN (brown). It is mapped to the Shopify kit product in DSers (Basic Mapping). It is a light-wood soroban with brown beads, not the black-frame render on the page; the page images stay until a matching supplier or bulk stock exists.
- **Supplier switched later the same day** to the AliExpress listing "ZZ 7/9/11/13/15/17 Digit Rods Standard Abacus Brown Bead Soroban" (item 1005008927792517), variant A5 (15 rods; the 13-rod A4 was sold out), at Hunter's request: DSers cost $2.85 to $4.19 against $8.92, 466 sold at 4.7. DSers quotes AliExpress Selection Standard at $1.99 and 9 to 15 days for it, two days slower on paper than the first pick, so the page promise moved with it.
- **Delivery promise** on the pages is now "about 2 weeks" / "most arrive in 9 to 15 days" / "ships within 2 business days with tracking".
- **The Playbook bump is digital only** (the Playbook and audiobook in the parent account). No printed book and no printed card ship; the 3-night quick-start goes out by email. Printed copies come back when a print path (Lulu Direct or a short run) exists.
- **Order flow:** Stripe Payment Link → Supabase function `stripe-webhook` → Shopify order (tagged childphenoms) → DSers → AliExpress. Hunter places the AliExpress order from DSers (one click per order on the free plan) until auto-order is turned on.

## Decisions on 2026-10-22 (late, after the pre-live check)

- **The urgency box and the product photos stay as they are.** Hunter's call: "only 1,000 kits" / "6 weeks" and the black-frame soroban renders are kept while the audience is tested.
- **The 3-Night Quick-Start goes out by email**, inside Q1 of `docs/products/marketing-sequences/10-quickstart-soap-opera.md`, the minute a kit is paid, and also lives on the thank-you page and in the parent account. The three Q emails replace E1 to E3 of the kit-buyer sequence: opportunity and epiphany story first, then the strategy (see it, move it, imagine it), then the tactics (the seven table rules). Sending is a Supabase function plus Resend (`scheduled_at` for days 1 and 2); the build is in `docs/AGENT-PROMPT.md`.
- **Hunter owns:** linking AliExpress in DSers and the first real order. Everything else left is in `docs/AGENT-PROMPT.md`.

## Decisions on 2026-10-23 (launch build, jobs 1 and 2 of `docs/AGENT-PROMPT.md`)

- **Copy change on page 1, kit section, item 2** (not yet on the design canvas, sync it): "One page, in your welcome email the minute you order." → "One page, in your welcome email and your parent account the minute you order." Everything else in that paragraph is unchanged.
- **The 3-Night Quick-Start now lives in three places from one source** (`docs/products/welcome-card.md`): inside email Q1 (sent by the `stripe-webhook` function through Resend, with Q2 and Q3 scheduled one and two days later), as a section of the thank-you page under "What happens next" (generated into `free-abacus/thanks.html` between the `quickstart` markers by `tools/build-members.mjs`; a canvas regeneration of that page drops it, so re-run the build after one), and as `#/quickstart` in the parent account, linked from `#/family` and from `#/account` (the kit row and the member library list). No gate on it: Stage 1 is free.
- **Receipts come inside email Q1, not from Stripe** (Hunter, 2026-10-23: "Receipt in email"; Stripe's receipt emails stay off because the toggle is account-wide on Enamelogic). The sending function builds the block from the checkout: date, each item and price, tax when charged, total, card and shipping address. Thank-you page lede changed (sync the canvas): "A receipt is in your inbox." → "Your receipt is inside your welcome email." Open point: University trial and certification buyers get no receipt from anyone today.
- **Email footer** carries the CAN-SPAM address as "Child Phenoms · 1309 Coffeen Avenue STE 1200, Sheridan, WY 82801". Rule from Hunter (2026-10-23, "Don't mention enamelogic were DBA child phenoms"): the parent company is never named in parent-facing text (emails, pages, app, templates); only the legal pages' contracting-party line names it.

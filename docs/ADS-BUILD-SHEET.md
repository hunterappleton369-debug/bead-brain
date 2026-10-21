> **Pixel in use (2026-10-21):** `1239441998349754`, the Enamelogic pixel, by Hunter's decision. Skip the "create a pixel" step below unless Ads Manager shows the dentist and parent audiences blurring; then create a Child Phenoms dataset and change `metaPixelId` in `free-abacus/config.js`.

# Ads build sheet: free abacus kit launch

Written 2026-10-21. Sources: `docs/products/marketing-sequences/07-ad-copy.md`, `docs/FUNNEL.md` and `~/Desktop/reports/Winning parent Facebook ad funnels.md` (2026-10-19).

**Turn ads on only when** childphenoms.com loads with a padlock, the Stripe links are in `free-abacus/config.js`, and the privacy policy and terms are live. Never send ads to the github.io address; Meta can't verify it.

## 1. Account setup

### 1.1 Page (5 min)

1. No business portfolio yet? Create one named Child Phenoms at business.facebook.com.
2. facebook.com/pages/create. Name: Child Phenoms. Category: Education. Create Page.
3. Add the logo, a kit photo, https://childphenoms.com and hello@childphenoms.com.
4. Optional: connect a Child Phenoms Instagram (Business settings, Instagram accounts).

**Done when** the Page shows in Business settings, Accounts, Pages.

### 1.2 Ad account with a card (5 min)

1. Business settings, Accounts, Ad accounts, Add, Create a new ad account.
2. Name: Child Phenoms Ads. Time zone: America/Denver. Currency: USD. Neither can change later.
3. Billing and payments, Add payment method. Type in your card.
4. Payment settings, Account spending limit: $500.

**Done when** Ads Manager shows the card and no "Add payment method" banner.

### 1.3 Pixel (dataset) (10 min)

1. Events Manager, Connect data, Web. Name: Child Phenoms Web. Website: childphenoms.com. Meta Pixel only.
2. Pick manual install and close it; the code is already in `free-abacus/funnel.js`.
3. Copy the dataset ID into `free-abacus/config.js` as `metaPixelId` and push, or ask Claude to.
4. Test events tab: enter https://childphenoms.com/free-abacus/, Open website. Fill step 1 with your approved test email and phone, tick the Playbook, click checkout.
5. Place one real kit order with your own card. Refund it in Stripe.

**Done when** Test events shows PageView, Lead, AddToCart, InitiateCheckout, then Purchase at 9.95 or 36.95 USD. If a banner says the dataset is restricted (Meta can file a page that mentions ADHD as health), stop and tell Claude.

### 1.4 Verify childphenoms.com (5 min)

1. Business settings, Brand safety and suitability, Domains, Add: childphenoms.com. Pick DNS TXT record and copy the value.
2. GoDaddy, My Products, childphenoms.com, DNS, Add New Record: type TXT, name @, paste the value, TTL 1 hour. Save.
3. Wait 10 minutes, click Verify. If it fails, retry in an hour.
4. Same screen, Add assets: the Child Phenoms Web dataset.

**Done when** the domain shows a green Verified. The TXT record doesn't touch the site, so do it now.

### 1.5 Event priority (3 min)

1. Events Manager, Child Phenoms Web, Aggregated Event Measurement, childphenoms.com, Edit events.
2. Order: 1 Purchase, 2 StartTrial, 3 InitiateCheckout, 4 Lead. Apply.

**Done when** the four show in that order. No such screen? Skip it; Meta has been retiring manual ranking for websites.

### 1.6 Reporting (5 min)

1. Events Manager, Custom conversions, Create. Name: Kit purchase. Event: Purchase. Rule: URL contains `paid=kit`. (Purchase also fires for certifications.)
2. Ads Manager, Audiences, Custom audience, Website. Event: Purchase, 180 days. Name: CP purchasers 180d.

**Done when** both are listed.

## 2. Campaign structure

### 2.1 The choices

- **Objective:** Sales.
- **Manual, not Advantage+:** ad set budgets, original audience options, manual placements. With no sales history, Advantage+ would push the money to one angle within days, before the other four get a fair test.
- **Budget:** $50/day, $10 per ad set.
- **Days 1 to 7, optimise for Lead (the fallback).** 50 kits a week on $50/day means $7 a kit; the report's e-learning median is $26.80 a sale. Lead fires earlier and more often. At $190/day or more, start on Purchase instead.
- **Day 8 on, optimise for Purchase.** Switch each surviving ad set once, then leave it alone 3 days.
- **Bid:** highest volume. **Attribution:** 7-day click, 1-day view. At $10 an ad set nothing leaves "Learning"; judge by section 4.
- **Scaling:** +20% budget when an ad set's cost per kit is at or under $27 for 3 days with 5+ kits. One raise per ad set every 3 days. Cap at $100/day until the first trials charge (day 15 or later). At 50+ kit sales in a week, test an Advantage+ sales campaign with the winning ads.

### 2.2 Shared settings for all five ad sets

- **Location:** United States, people living there. Exclude Alaska and Hawaii if the kit doesn't ship there.
- **Age** 32 to 48, all genders, English.
- **Targeting:** include Parents with early school-age children (06-08 years) or Parents with preteens (08-12 years). Narrow further: private school, Montessori, Kumon, Mathnasium, Khan Academy, chess. Skip any Meta doesn't list. Add the top-20% income option 07-ad-copy.md asks for only if Meta still offers it.
- **Exclude** CP purchasers 180d. If the estimate falls under 1 million, drop the narrow-further layer.
- **Placements:** Facebook and Instagram Feed, Reels and Stories, Instagram profile feed and Explore. All else off (Audience Network runs in kids' phone games).
- **Ads:** a 9:16 video and a 4:5 image per ad set, same text.
- **Description (every ad):** Abacus + 3-night quick-start card. Ages 7 to 11. $9.95 shipping.
- **CTA button (every ad):** Get offer, so the angle is the only variable.

### 2.3 The five ad sets ($10/day each)

**A1 Human calculator**

- Ad set: `A1_human-calculator_parents-int_32-48_OPT-lead`
- Headline: Free abacus kit for 7 to 11 year olds
- URL: https://childphenoms.com/free-abacus/?utm_source=facebook&utm_medium=paid&utm_campaign=kit-launch&utm_content=human-calculator
- Primary text (1A):

> This is called flash anzan. Numbers flash on a screen. A kid adds them in their head before you can read them.
>
> It starts with a wooden abacus and 15 minutes a day.
>
> We'll send your child the abacus and a quick-start card for free. You just pay $9.95 shipping. Made for ages 7 to 11.

**A2 School can't teach**

- Ad set: `A2_school-cant-teach_parents-int_32-48_OPT-lead`
- Headline: The skill school can't teach
- URL: https://childphenoms.com/free-abacus/?utm_source=facebook&utm_medium=paid&utm_campaign=kit-launch&utm_content=school-cant-teach
- Primary text (2A minus the unsourced line "A skill most kids in America never see"):

> Tuition buys the same lesson every kid in the room gets.
>
> This is the thing that makes yours different.
>
> Mental math on the abacus. Fifteen minutes a day at home.
>
> Free abacus kit with a quick-start card. You just pay $9.95 shipping.

**A3 Founder story**

- Ad set: `A3_founder-story_parents-int_32-48_OPT-lead`
- Headline: From C student to perfect ACT
- URL: https://childphenoms.com/free-abacus/?utm_source=facebook&utm_medium=paid&utm_campaign=kit-launch&utm_content=founder-story
- Primary text (3A):

> I got C's in math. I had ADHD. I couldn't sit still.
>
> Then I trained my brain like an athlete. Mental math and abacus drills, fifteen minutes a day.
>
> Perfect ACT. Full ride. Scholar-Athlete of the Year at a Division I school.
>
> Here's the tool I used. We'll send your child the abacus and a quick-start card free. Just pay shipping.

**A4 Science**

- Ad set: `A4_science_parents-int_32-48_OPT-lead`
- Headline: Backed by a 3-year randomized trial (needs your OK; if not, "Free abacus kit. Just pay shipping.")
- URL: https://childphenoms.com/free-abacus/?utm_source=facebook&utm_medium=paid&utm_campaign=kit-launch&utm_content=science
- Primary text (4A):

> A 3-year randomized trial. Ordinary kids. About 3 hours a week on the abacus.
>
> They beat the group that got extra math class on arithmetic.
>
> (Barner and others, Child Development, 2016.)
>
> Your child can start at home in 15 minutes a day. Free abacus kit. Just pay shipping.

**A5 Hands-on**

- Ad set: `A5_hands-on_parents-int_32-48_OPT-lead`
- Headline: Math for kids who can't sit still
- URL: https://childphenoms.com/free-abacus/?utm_source=facebook&utm_medium=paid&utm_campaign=kit-launch&utm_content=hands-on
- Primary text (5A):

> Some kids can't sit still. Good.
>
> This is math you do with your hands. Push a bead up. Push a bead down. Say the move out loud.
>
> It feels like a game. Kids ask for one more flash round.
>
> Free abacus kit with a quick-start card. You just pay $9.95 shipping.

## 3. Creative brief

**Every angle:** a 9:16 video of 15 to 30 seconds with captions burned in, plus a 4:5 image. Show the real abacus and 3-night card, not renders; label any Playbook "$27 add-on". Film only what the child can really do, at real speed. Children only with a signed release (5.4), with no last names, schools or uniforms in shot. No borrowed footage, before and after, or grade reports. Every video ends on "FREE kit. $9.95 shipping." Script and on-screen text: the matching video in 07-ad-copy.md.

| Angle | First 2 seconds | Show | 4:5 image | Must not appear |
|---|---|---|---|---|
| A1 Human calculator (28 s) | Child, eyes closed, fingers moving in the air. Text: "She's adding in her head." | Beads close up, parent beside child, kit box opening | Child with the abacus. "Free abacus kit for ages 7 to 11" | genius, IQ, guaranteed |
| A2 School can't teach (27 s) | Hunter at the kitchen table, to camera. Text: "Tuition buys the same lesson every kid gets." | Hunter, beads, parent and child, kit box. No school logos or uniforms | Kit on a kitchen table. "The skill school can't teach" | grades, smarter, guaranteed |
| A3 Founder story (30 s) | Hunter close up: "I got C's in math. I had ADHD." Text: "C's in math." | Hunter, his hands on the beads, kit box. No school name, sport, year or score sheets | Hunter holding the abacus. "From C student to perfect ACT" | cure, treat, fix |
| A4 Science (26 s) | Soroban close up. Text: "A 3-year trial. Ordinary kids." | Beads, parent and child, kit box. "Child Development, 2016" on screen 3+ seconds | Text-only card: the 4A claim and citation | proven, IQ, memory |
| A5 Hands (25 s) | A child's hands tapping the table. Text: "Some kids can't sit still." | Same hands on the beads, child says a move aloud, kit box | Small hands on the beads. "Math you do with your hands" | ADHD, focus, attention |

## 4. Running it

### 4.1 Naming

Campaign `CP_Sales_kit-launch_2026-10`. Ad set `A1_human-calculator_parents-int_32-48_OPT-lead` (angle, audience, age, event). Ad `A1_video_txtA_h1_v1` (angle, format, text, headline, version). Never edit a live ad's text or media; duplicate it as v2. Edits restart learning and lose likes and comments.

### 4.2 Daily review, days 1 to 7 (10 minutes each morning)

Save a column preset "CP daily": Amount spent, CPM, CTR (link click-through rate), Leads, Cost per lead, Kit purchase, Cost per Kit purchase. Cross-check kit sales in Stripe; Meta misses some.

- **CPM.** Report medians: e-learning $14.05, baby $11.50.
- **CTR (link).** E-learning median 2.74%.
- **Cost per Lead.** Compare ad sets to each other.
- **Cost per kit.** Start target $27 (the e-learning median, rounded). From day 15, use your own: money in per kit buyer minus product and postage costs.
- **Bump rate.** Stripe kit + Playbook sales divided by all kit sales. Want 30% or more; FUNNEL.md puts front-end break-even at 30 to 35%.

Small numbers: never act on one day's data.

| When | If | Do |
|---|---|---|
| Days 1 to 2 | anything but a broken pixel or rejected ad | Change nothing |
| Day 3 on | ad has 2,000+ impressions, link CTR under 1% | Turn the ad off |
| Day 3 on | ad set CPM over $30 for 3 days | Drop its narrow-further interests |
| Day 4 | ad set has no kits and twice the best cost per Lead | Off; its $10 goes to the best |
| Any day | ad set spent $54 with no kits | Off |
| Any day | ad set spent $100, cost per kit over $40 | Off |
| Day 7 | always | Keep the 2 lowest cost per kit (tie: higher bump rate) at $25 each; rest off |
| Day 8 | always | Switch both to Purchase, rename OPT-purchase, start week 2 test |
| After day 8 | at or under target 3 days, 5+ kits | Budget +20% |
| After 30 kits | bump rate under 20% | Fix the bump copy, not the ads |
| After 30 Leads | kits under 30% of Leads | Fix step 2 and the Stripe page, not the ads |

### 4.3 Week 2 test plan

One change at a time. Leave the best ad set untouched as the control. Duplicate it as `..._TEST-text` at $15/day extra, with three video ads that differ only in text (07-ad-copy.md):

- A1: 1A vs 1C. Skip 1B ("almost none" line, cut from the pages).
- A2, A3, A5: A vs B vs C.
- A4: 4A vs 4C. Skip 4B (memory claim).

Run 7 days or $50 per ad. Winner: lowest cost per kit with 5+ kits (if none has 5, run another week). It goes into the control as a v2 ad. Then one test a week: headlines; broad audience (Advantage+, 32 to 48, no interests) vs interests; a text-only image vs the best image; a lookalike at 500 kit buyers.

## 5. Compliance

### 5.1 Special ad category: not applicable

Meta's special categories are financial products, employment, housing, and social issues or politics. A kids' learning kit sold to parents is none of these; leave the box empty. Exception: Meta counts professional certification programs as Employment, so a $297 certification ad needs its own campaign under that category, with no income claims.

### 5.2 Claim rules (FUNNEL.md, 07-ad-copy.md)

- Arithmetic results only, with study and year. No IQ, memory, focus, attention or health claims. Never "works for every child"; the 2017 first-grade trial found no benefit after a year.
- Hunter may say he had ADHD; never hint the viewer's child has it. If Meta rejects 3A for personal health, run 3C.
- No unproven counts ("thousands of kids", "almost none in America"). "Many", not "most". "About a million" Japanese children only with "about" and the source.
- No income talk. No mention of the trial or certification.
- "Free" always sits beside the $9.95 shipping charge; the FTC wants the condition up front.
- Hunter's results are his own. Never put "your child will" next to them.
- Disclose any family given money, a free kit or a free University year to appear (FTC endorsement rules): "This family got a free kit."

### 5.3 Privacy policy: the pixel line

Replace the "Order pages" bullet in `docs/products/legal-and-ops/privacy-policy.md` §3.5 with:

> **Order pages.** Our order pages at childphenoms.com/free-abacus/ use the Meta Pixel to measure our Facebook and Instagram ads. It records when you view a page, fill in step 1 of the order form, add the Playbook, click to check out, start a University trial or complete a purchase (with the amount). At step 1 it also sends Meta a scrambled (hashed) copy of your name, email and phone, so Meta can match the visit to a Facebook or Instagram account. Meta sets a cookie to do this. The pixel is not used in the trainer your child uses.

Three gaps before ads run: add "a hashed copy of your name, email and phone" to the Meta row in §6 (`funnel.js` sends them); make `funnel.js` check Global Privacy Control before loading the pixel, as §8 promises; publish the policy (no `legal/` folder yet, no footer link).

### 5.4 Consent for child footage

A parent or guardian signs this for every child in an ad, your own included. Keep the signed copy. Ask the child on the day too; stop if they say no. Counsel should read it.

> I am the parent or legal guardian of [child's first name], age [ ]. I give [HUNTER: legal entity] ("Child Phenoms") permission to film and photograph my child, and to use that footage, my child's first name and voice in Child Phenoms ads, social posts, websites and emails. Child Phenoms will not show or say my child's last name, school, town or contact details. This lasts [2 years] from the date below. I can withdraw it by emailing hello@childphenoms.com; Child Phenoms will stop new ads with the footage within [14 days] but cannot recall posts others shared. In return I receive [nothing / a free kit / $___], and the ad may say so. My child knows about the filming and agreed to it.
>
> Parent or guardian name, signature, date. For Child Phenoms: name, signature, date.

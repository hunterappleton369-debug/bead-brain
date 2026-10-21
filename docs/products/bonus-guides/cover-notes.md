# Cover notes: the two bonus guides

Art direction for the designer, one page per guide. Follow DESIGN.md: white paper, Unbounded headings, Inter body, Caveat for tips, ink outlines, flat pop colors, no gradients, no cards.

## Shared rules for both covers

- **Size.** US Letter, 8.5 × 11 in, portrait, with a 0.5 in safe margin. Also export a 1080 × 1350 px image for the funnel stack and emails.
- **Paper.** White `#ffffff` with the faint looseleaf dot-and-line texture from the site.
- **Type.** Title in Unbounded 800, tight tracking (-0.03em), sentence case. Subtitle in Inter 600. Byline in Inter 400, ink-2 `#4b5567`.
- **Brand mark.** "Child Phenoms" wordmark top left, with "Phenoms" in blue `#2457f5`. Small "Phenom University bonus" eyebrow top right, Inter 700, 12 px, uppercase, +0.12em.
- **One sticker.** Yellow `#ffd23f` starburst, rotated 6°, 2 px ink outline, Caveat text. One per cover, no more.
- **No price on the cover.** The $97 value lives on the funnel page, not the product.
- **Do not show** real children's faces, school logos, a college campus, a sport or a trophy with a year. Hunter's story names none of these, and the cover should not either.
- **Halftone.** One halftone dot patch at 10% ink in one corner of the color block.

<div class="page-break"></div>

## Cover 1: Valedictorian Secrets

**Title:** Valedictorian Secrets

**Subtitle:** What the top 1% of parents do differently, from week one of school

**Byline:** Hunter McClain, Child Phenoms

**Sticker (Caveat):** "8 habits, 15 minutes"

**Color.** Blue block. The lower 60% of the cover is a `--blue-soft` `#e8eeff` color block with a 28 px radius. Blue `#2457f5` accents.

**Main art.** [art: pencil-drawn kitchen table seen from the side, colored-pencil fills, ink outline. A parent and a child sit side by side, not across from each other. The parent's hands rest in their lap. The child's hands are on a 13-rod soroban (one bead above the beam, four below, pop-palette beads with ink outlines). A paper calendar on the fridge behind them has one slot circled in red pen. A small fridge sheet shows a hand-written number. Faces are simple and warm, not a real child's likeness.]

**Small detail.** [art: a graduation cap drawn in pencil, tucked into the top-right corner of the color block, tilted, as if it is waiting. No year, no school colors.]

**Spine/thumbnail test.** At 300 px wide the title must still read. If it does not, drop the subtitle on the thumbnail only.

**Inside cover line (Caveat, small):** "Same kid. A different kind of smart."

<div class="page-break"></div>

## Cover 2: Win the Future

**Title:** Win the Future

**Subtitle:** The Career-Picking Guide. How to spot and feed the talent your child already has

**Byline:** Hunter McClain, Child Phenoms

**Sticker (Caveat):** "Watch for 2 weeks"

**Color.** Green block. The lower 60% of the cover is a `--green-soft` `#e4f8ec` color block with a 28 px radius. Green `#22c55e` accents, ink outlines.

**Main art.** [art: one child seen from behind, standing at the start of a branching pencil-drawn path. Each branch ends in a small flat-color icon with an ink outline, one per talent pattern: a map (space), a book (words), two speech bubbles (people), a hammer (building), a running shoe (movement), a music note (music), a soroban (numbers), a potted plant (care). The soroban branch sits in the middle, a little closer than the rest. Colored-pencil fills, no gradients.]

**Small detail.** [art: a clipboard with a three-column checklist headed "chose / repeated / fixed", drawn in pencil, leaning against the bottom-left of the color block.]

**Spine/thumbnail test.** Same as cover 1. The title and the branching path must read at 300 px.

**Inside cover line (Caveat, small):** "Ability is built. Your job is to notice."

<div class="page-break"></div>

## Interior layout (both guides)

- Chapter openers on a new page, chapter number as a big Unbounded numeral in the chapter color.
- "The words to say" sections set in a speech bubble (white, 2 px ink border, 16 px radius, Caveat).
- "The five-minute version" set as a small yellow sticker block at the end of each chapter.
- Worksheets (Win the Future, chapters 2 and 8) on their own page with real write-in lines, 0.35 in apart.
- Sources page in Inter 400 at 10 pt, ink-2.

Render a proof with `npx md-to-pdf valedictorian-secrets.md` and `npx md-to-pdf win-the-future.md`. The page-break divs are honored.

<!-- status: ready -->

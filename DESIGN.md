# Child Phenoms — DESIGN.md

Design system for the Child Phenoms site (a soroban mental-math program for kids, run by parents at home). Written in the awesome-design-md format so any agent can build new pages that match.

## 1. Visual theme & atmosphere

White paper, bold ink, pop color. The page is a clean white canvas with a very faint dot-and-line "looseleaf" texture behind everything. Depth comes from hairline borders and generous whitespace, not from cards or drop shadows. The personality comes from a restrained comic-superhero layer: thick ink outlines on buttons and badges, a hard 4px offset shadow on primary actions, halftone dots in the corners of color blocks, starburst stickers, and pencil-drawn illustrations with colored-pencil fills.

Three voices live on the page:

- **Tech-forward structure.** Tight-tracked display headings, a 4px grid, pill CTAs, hairline rules, big numerals.
- **Comic energy.** Ink outlines, flat primary colors, hard shadows, bursts, speech bubbles. Used as accents, never as the whole page.
- **Pencil warmth.** Hand-drawn illustrations and a handwriting face for coach tips and margin notes.

Inspiration: Vercel and Figma (white canvas, black pill CTAs, hairlines, color-block sections instead of cards), Lovable (notebook warmth, borders over shadows), Linear (surface ladder, one accent per job).

## 2. Color palette & roles

| Token | Hex | Role |
|---|---|---|
| `--ink` | `#121826` | Text, outlines, primary buttons, hard shadows |
| `--ink-2` | `#4b5567` | Body copy on long pages, secondary text |
| `--ink-3` | `#8a93a6` | Captions, meta, placeholders |
| `--hair` | `#e6e8ee` | Hairline borders, dividers, table rules |
| `--paper` | `#ffffff` | Canvas |
| `--paper-2` | `#f7f8fb` | Inset surfaces (inputs, inactive bars) |
| `--blue` | `#2457f5` | Brand accent. Links, progress, the "Phenoms" word, the final CTA block |
| `--red` | `#f03e3e` | Boss tests, errors, the superhero cape |
| `--yellow` | `#ffd23f` | Stickers, highlights, the parent block, XP |
| `--green` | `#22c55e` | Success, "done", direct moves |
| `--purple` | `#7c5cff` | Combination formulas, Wizard/Adept stages |
| `--orange` | `#ff8a1f` | Small-friend formulas, Explorer stage |
| `--pink` | `#ff4fa3` | Prodigy stage |
| `--teal` | `#0fb5c9` | Grandmaster stage |

Every pop color has a `-soft` tint (for example `--blue-soft: #e8eeff`) used as a color-block or chip background. Pop colors are used flat, never as gradients. One color block per story section, white between them.

Formula colors are fixed: direct = green, small friend = orange, big friend = blue, combination = purple.

## 3. Typography

| Role | Face | Weight | Size / line | Tracking |
|---|---|---|---|---|
| Display XL (hero) | Unbounded | 800 | 56px / 1.02 | -0.03em |
| Display LG (h1) | Unbounded | 700 | 40px / 1.08 | -0.025em |
| Section (h2) | Unbounded | 700 | 30px / 1.12 | -0.02em |
| Sub (h3) | Unbounded | 600 | 20px / 1.25 | -0.01em |
| Eyebrow | Inter | 700 | 12px, uppercase | +0.12em |
| Body | Inter | 400 | 17px / 1.6 | 0 |
| Body small | Inter | 400 | 14.5px / 1.5 | 0 |
| Numerals (stats, drills) | Unbounded | 700 | 32–64px | -0.02em |
| Pencil notes, tips | Caveat | 600 | 20–24px | 0 |

Headings are sentence case. Display sizes shrink about 30% under 720px. Never set body copy in Unbounded or Caveat.

## 4. Component styling

- **Primary button**: ink pill, white text, Inter 600 15px, 12px 22px padding. Hover lifts 1px and adds the hard shadow. "Comic" variants (`.btn.blue/.red/.green/.yellow`) are colored fills with a 2.5px ink outline and the hard shadow at rest.
- **Secondary button**: white pill, 2px ink outline, no shadow.
- **Ghost button**: no outline, ink text, underline on hover.
- **Inputs**: 44px tall, 2px ink border, 12px radius, white. Focus: blue 3px ring.
- **Chips**: pill, 1.5px border in the formula color, 13px Inter 600.
- **Sticker**: rotated 6°, yellow fill, 2px ink outline, Caveat text. One per section at most.
- **Speech bubble (coach tip)**: white, 2px ink border, 16px radius, a small tail at the bottom left, Caveat text, a mascot or icon beside it.
- **Color block**: full-width section, 28px radius, 48px padding (24px on mobile), `-soft` tint, a halftone dot patch in one corner at 10% ink.
- **Rows instead of cards**: lists (lessons, rungs, stages) are rows separated by hairlines with a numeral or badge on the left.
- **Panel** (`.card`): the only card-like element. White, 1.5px hairline, 20px radius, no shadow. Used for drill surfaces and results, nothing on marketing pages.
- **Progress bar**: 10px, `--paper-2` track, blue fill, 1.5px ink outline.
- **Stage badge**: SVG, colored-pencil fills with a 3px ink outline (see `js/art.js`).
- **Abacus**: white frame with ink outline, ink beam, grey rods, beads in the pop palette with ink outlines.

## 5. Layout principles

- 4px base unit. Section gap 96px desktop, 56px mobile. Content max width 1120px with 24px side gutters (16px on phones).
- Vary the structure: hero (2-col) → trust strip → 3-up benefit columns with hairlines → zig-zag rows (image/text alternating) → trail map → color block → final CTA block. No two adjacent sections share a layout.
- Headings carry the hierarchy: eyebrow + h2 + one-line lede at the top of every section.
- Graphics sit beside text, never above it as a banner. Illustrations are transparent PNGs that float on the paper.
- In-app pages (stage, lesson, drill) use a narrower 820px measure and the same row-based lists.

## 6. Depth & elevation

- Level 0: paper, no shadow.
- Level 1: hairline border (`--hair`).
- Level 2: ink outline (2–3px). Interactive and "comic" elements only.
- Level 3: hard offset shadow `4px 4px 0 var(--ink)`. Primary CTAs, stickers, stage nodes on hover.
- Level 4: soft shadow (`--shadow-soft`) for floating elements only: toasts, menus.

## 7. Do's and don'ts

**Do**
- Keep the canvas white with the faint dot-and-line paper.
- Use one pop color per section and let the rest of the section stay ink-on-white.
- Use pencil illustrations with transparent backgrounds, and give them room.
- Put every tip in a speech bubble in the handwriting face, short enough to read in two seconds.
- Use big numerals for anything a child can be proud of (streak, level, Bead Score).

**Don't**
- Stack cards. If three things sit side by side, separate them with whitespace or hairlines.
- Use gradients, glassmorphism, or soft colored shadows.
- Use more than one sticker or burst per screen.
- Write disclaimers in body copy. A single footnote under a chart is the limit.
- Explain the mechanism when the benefit will do.

## 8. Responsive behavior

- Under 920px: hero and zig-zag rows stack, image first on "how it works", text first on the hero.
- Under 720px: display sizes drop ~30%, color blocks lose side padding to 20px, nav becomes a horizontal scroll row, pill buttons go full width in button rows.
- Touch targets stay ≥ 44px. The abacus scales to the width of its container.

## 9. Agent prompt guide

"Build it like Child Phenoms: white paper with a faint dot grid, Unbounded headings with tight tracking, Inter body, Caveat for tips. Ink outlines and a hard 4px offset shadow on primary actions, flat pop colors (blue #2457f5, red #f03e3e, yellow #ffd23f, green #22c55e), color-block sections with 28px corners instead of cards, hairline-separated rows for lists, pencil-drawn transparent illustrations beside the text. One sticker per screen. No gradients, no disclaimers, benefit over mechanism."

# Bead Brain

A free, self-contained soroban (Japanese abacus) course for children, run by a parent at home. Ten stages take a child from reading beads to competition-style mental arithmetic. No build step, no accounts, no server: open `index.html` through any static web server and progress is saved in the browser.

**Live site:** https://hunterappleton369-debug.github.io/bead-brain/

## Run it

```bash
node serve.mjs
```

Then open http://localhost:8787. Any static host works too (GitHub Pages, Netlify, an S3 bucket): upload the folder as is.

## Deploy

The site is hosted on GitHub Pages from the `main` branch of [hunterappleton369-debug/bead-brain](https://github.com/hunterappleton369-debug/bead-brain), served from the repo root. There is no build step, so redeploying is just a push:

```bash
git add -A && git commit -m "Describe the change" && git push
```

GitHub rebuilds the site within a minute or two of the push. Check progress at https://github.com/hunterappleton369-debug/bead-brain/actions or with `gh api repos/hunterappleton369-debug/bead-brain/pages/builds/latest --jq .status`.

## What is in the box

| Path | What it does |
|---|---|
| `index.html` | Shell page and navigation |
| `js/soroban.js` | Soroban model. Classifies every bead move as direct, small friend, big friend or combination, with carries. The 34 formulas live here. |
| `js/generator.js` | Problem generators. Add/subtract problems are simulated and rejected unless every move is inside the allowed formula set and the required formula appears. Also multiplication, division, flash sequences, times tables. |
| `js/abacus.js` | Interactive SVG soroban with hand-drawn styling and step-by-step animated explanations. |
| `js/drills.js` | Drill runner: reading, setting, single-column, carry/borrow, stacked problems, flash anzan, dictation (speech synthesis), times tables, multiply, divide. Explains wrong answers by replaying them on the beads. |
| `js/curriculum.js` | The ten stages, 76 lessons, boss tests, daily quests. |
| `js/ladder.js` | Bead Score ladder test (20 rungs), Times ladder (10 rungs), age-ranked chart. |
| `js/store.js` | Progress in localStorage: profiles, XP, streaks, lesson results, boss results, test history. |
| `js/guide.js` | Parent guide and plan page text. |
| `js/art.js` | Colored-pencil SVG logo and stage badges. |
| `css/style.css` | Loose-leaf paper look. |
| `docs/` | The plan and research notes as Markdown. |

## The stages

1. **Sprout** – read and set numbers, direct moves
2. **Explorer** – small friends (the eight 5-formulas)
3. **Apprentice** – big friends (the eighteen 10-formulas), carries and borrows
4. **Adept** – combination formulas; all 34 complete; 3-digit numbers
5. **Ace** – speed on the beads, 2-digit mental, flash anzan begins, first Bead Score
6. **Wizard** – multiplication
7. **Champion** – division; 3-digit mental begins
8. **Prodigy** – ten 3-digit lines mentally, 3-digit flash, mental 2×2
9. **Grandmaster** – dan-level flash, 4-digit mental, 3×2 and 4÷2 mentally
10. **Legend** – competition flash speeds, 3×3 mentally

## About the ranking chart

Percentile lines are estimates built from grade-level expectations for mental arithmetic, not a measured sample. The site says so on the chart. A child's own test history is the real measure.

## Credits

Written from scratch. The problem-constraint approach (classify each rod move, reject problems that use untaught moves) follows the pattern used by several open-source soroban trainers, among them penko-soroban (GPL) and pove/soroban (MIT); no code was copied. Exam levels are from the Japanese chambers of commerce, Nihon Shuzan Renmei, Zenshuren and the Japan Flash Anzan Association. Research citations are in the parent guide.

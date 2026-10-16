# Research notes (2026-10-16)

Summaries gathered while designing Bead Brain. Sources are listed inline.

## How the big programs are structured

- **Mastermind Abacus**: 10 levels of about 3 months (30 months total), ages 6–14, two 1-hour classes a week, 5–15 minutes of daily practice. Journey: beads and first sums → add/subtract fluency → multiplication, division and speed → "picture the abacus" → advanced mental. Assessment per level, accuracy graded before speed. No per-level digit syllabus is published. (mastermindabacus.com)
- **UCMAS**: 11 levels in 3 modules (Foundation, Construction, Advanced), 5–6 months each, 2-hour weekly class, 15–20 minutes daily homework. Foundation: 1–2 digit add/sub, times tables intro. Construction: 2–3 digit add/sub, 2d×1d, 3d÷1d. Advanced: decimals, 2d×2d, 3–4d÷2d, 5d÷3d, square roots. Class format uses flash cards, listening (dictation), speed writing. "32 formulas" in three groups. International Grading Exam with abacus and mental papers. (ucmas.com, ucmas.ca)
- **ALOHA**: Junior 6 levels × 3 months; Senior 8 levels × 3 months; one 2-hour class a week; certificates after levels 3, 6, 8.
- **SIP Abacus**: Foundation 4 + Advanced 4–5 + Grand Master 3 levels of 4–6 months; two 75-minute classes a week in some markets; "5x better" guarantee tested at the end of Foundation 4 (16–24 months).

## Japanese exam ladders (used to calibrate the stages and rungs)

- **Nihon Shuzan Renmei / JCCI bead exams**: 10th kyu (2-digit × 5 lines) up to 1st kyu (10-digit × 10 lines, 60 multiplication and division problems). Dan grades triple the 1st-kyu volume. Typical club pace: 1st kyu around sixth grade.
- **Mental calculation (anzan) exams**: 4th kyu = 2-digit × 5 lines; 3rd kyu = 3-digit × 5 lines; 2nd kyu = 3-digit × 7 lines; 1st kyu = 3-digit × 10 lines (20 problems in 12 minutes, plus multiplication and division).
- **Flash anzan (Japan Flash Anzan Association)**: 20th kyu = three 1-digit numbers in 5 s; 12th kyu = ten 2-digit in 10 s; 1st kyu = fifteen 2-digit in 13 s; 2nd dan = four 3-digit in 4 s; 5th dan = ten 3-digit in 7 s; 10th dan = fifteen 3-digit in 3 s; 20th dan = 1.5 s. Guinness record: fifteen 3-digit numbers in 1.61 s (Rikako Miyamoto, 2024).

## The 34 formulas

8 small-friend (5-complement), 18 big-friend (10-complement), 8 combination. Taught in that order, addition before subtraction within each group. Matches the published Level 1 chart used by Indian franchises and the Kojima/Heffelfinger manuals.

## Science (what holds up)

- Randomized trials: Barner et al. 2016 (Child Development; India, 3 h/week × 3 years, large arithmetic gains, no change in general cognition, weaker baseline spatial memory → smaller gains); Wang et al. 2019 (J. Neuroscience; China, 2 h/week × 5 years, arithmetic and visuospatial working memory gains, no IQ change); Lu et al. 2021 (Current Psychology; 52 hours, calculation and spatial gains, no general transfer).
- Null result: Barner et al. 2017 (J. Numerical Cognition; US first graders, 2 h/week × 1 year, no benefit, place-value prerequisites missing).
- Imaging: Hanakawa 2003, Tanaka 2002, Chen 2006 (visuospatial/premotor regions in experts); Hu 2011 (white matter), Li 2013, Weng 2017 (cross-sectional).
- Mental abacus representation: Frank & Barner 2012 (3–4 column limit, immune to verbal interference); Stigler 1984 (off-by-5 errors); Brooks et al. 2018 (motor interference impairs it).
- Marketing claims not supported: IQ gains, general memory/attention gains, "results in months" in a classroom setting, works equally for every child.

## Open-source trainers reviewed

No widely used permissive SVG soroban component exists (top repo has 14 stars). Pattern worth copying: model each rod as heaven 0/1 + earth 0–4, classify each digit operation, generate candidates and reject any using untaught techniques (penko-soroban GPL, pove/soroban MIT, soroban-js CC-BY-NC, Remco28/abacus unlicensed). Bead Brain implements this from scratch.

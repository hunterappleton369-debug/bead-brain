// art.js — logo, stage badges and small comic/pencil SVG pieces. Inline strings.
// Badges keep colored-pencil fills (shared <defs> patterns) with a thick ink outline.

const INK = '#121826';
export const PALETTE = { red: '#f03e3e', orange: '#ff8a1f', yellow: '#ffd23f', green: '#22c55e', teal: '#0fb5c9', blue: '#2457f5', purple: '#7c5cff', pink: '#ff4fa3', brown: '#a3652f', grey: '#aab2c2' };

export function injectDefs() {
  if (document.getElementById('pencil-defs')) return;
  let patterns = '';
  for (const [name, c] of Object.entries(PALETTE)) {
    patterns += `<pattern id="pc-${name}" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
      <rect width="7" height="7" fill="${c}" opacity="0.62"/>
      <line x1="0" y1="0" x2="0" y2="7" stroke="${c}" stroke-width="3.4" opacity="0.95"/>
      <line x1="3.5" y1="0" x2="3.5" y2="7" stroke="#fff" stroke-width="0.8" opacity="0.3"/>
    </pattern>`;
  }
  const svg = `<svg id="pencil-defs" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <filter id="pencil" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="7" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="1.8" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    ${patterns}
  </defs></svg>`;
  document.body.insertAdjacentHTML('afterbegin', svg);
}

const S = `stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;
const S2 = `stroke="${INK}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"`;

function wrap(inner, vb = '0 0 100 100', cls = 'badge') {
  return `<svg class="${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g filter="url(#pencil)">${inner}</g></svg>`;
}

// ---- Logo mark: a bolt striking a bead ------------------------------------
export function mark(size = 34) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="3" y="3" width="58" height="58" rx="16" fill="${PALETTE.blue}" stroke="${INK}" stroke-width="3"/>
    <path d="M 36 8 L 20 36 L 31 36 L 26 56 L 46 26 L 35 26 L 41 8 Z" fill="${PALETTE.yellow}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  </svg>`;
}
export function logo() {
  return `${mark(34)}<span class="word">Child <b>Phenoms</b></span>`;
}

// ---- Stage badges (colored pencil + ink) ---------------------------------
export const BADGES = {
  sprout: () => wrap(`
    <ellipse cx="50" cy="84" rx="30" ry="9" fill="url(#pc-brown)" ${S2}/>
    <path d="M 50 82 C 50 66 50 56 50 44" fill="none" stroke="${PALETTE.green}" stroke-width="4" stroke-linecap="round"/>
    <path d="M 50 60 C 36 60 26 52 24 38 C 38 38 50 46 50 60 Z" fill="url(#pc-green)" ${S}/>
    <path d="M 50 50 C 64 50 76 40 76 26 C 62 26 50 36 50 50 Z" fill="url(#pc-green)" ${S}/>
    <circle cx="80" cy="18" r="6" fill="url(#pc-yellow)" ${S2}/>`),
  explorer: () => wrap(`
    <circle cx="50" cy="52" r="36" fill="#fff" ${S}/>
    <circle cx="50" cy="52" r="28" fill="none" ${S2} stroke-dasharray="4 5"/>
    <path d="M 50 20 L 58 52 L 50 84 L 42 52 Z" fill="url(#pc-red)" ${S2}/>
    <path d="M 18 52 L 50 44 L 82 52 L 50 60 Z" fill="url(#pc-blue)" ${S2}/>
    <circle cx="50" cy="52" r="5" fill="url(#pc-yellow)" ${S2}/>`),
  apprentice: () => wrap(`
    <path d="M 22 24 L 50 18 L 78 24 L 78 84 L 50 90 L 22 84 Z" fill="url(#pc-blue)" ${S}/>
    <path d="M 50 18 L 50 90" ${S2}/>
    <path d="M 30 36 L 44 33 M 30 46 L 44 43 M 30 56 L 44 53 M 56 33 L 70 36 M 56 43 L 70 46 M 56 53 L 70 56" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 60 72 l 6 6 l 10 -14" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`),
  adept: () => wrap(`
    <circle cx="34" cy="38" r="20" fill="url(#pc-purple)" ${S}/>
    <circle cx="34" cy="38" r="8" fill="#fff" ${S2}/>
    <path d="M 50 48 L 86 84" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
    <path d="M 50 48 L 86 84" stroke="${PALETTE.yellow}" stroke-width="5" stroke-linecap="round"/>
    <path d="M 70 68 L 78 60 M 78 76 L 86 68" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`),
  ace: () => wrap(`
    <path d="M 50 12 L 61 38 L 89 40 L 67 58 L 74 86 L 50 71 L 26 86 L 33 58 L 11 40 L 39 38 Z" fill="url(#pc-yellow)" ${S}/>
    <path d="M 8 20 L 24 24 M 6 32 L 18 34 M 92 20 L 76 24 M 94 32 L 82 34" stroke="${PALETTE.orange}" stroke-width="3" stroke-linecap="round"/>`),
  wizard: () => wrap(`
    <path d="M 50 8 C 54 30 62 44 76 64 L 24 64 C 38 44 46 30 50 8 Z" fill="url(#pc-purple)" ${S}/>
    <path d="M 12 70 Q 50 56 88 70 Q 50 86 12 70 Z" fill="url(#pc-purple)" ${S}/>
    <path d="M 24 64 Q 50 70 76 64" fill="none" stroke="${PALETTE.yellow}" stroke-width="4"/>
    <path d="M 56 30 l 2 5 l 5 1 l -4 3 l 1 5 l -4 -3 l -4 3 l 1 -5 l -4 -3 l 5 -1 Z" fill="${PALETTE.yellow}" stroke="${INK}" stroke-width="1.2"/>
    <path d="M 40 48 l 1.5 4 l 4 .5 l -3 2.5 l 1 4 l -3.5 -2 l -3.5 2 l 1 -4 l -3 -2.5 l 4 -.5 Z" fill="#fff" stroke="${INK}" stroke-width="1.2"/>`),
  champion: () => wrap(`
    <path d="M 30 14 L 70 14 L 68 44 C 66 58 58 64 50 64 C 42 64 34 58 32 44 Z" fill="url(#pc-red)" ${S}/>
    <path d="M 30 22 C 16 22 14 40 32 42 M 70 22 C 84 22 86 40 68 42" fill="none" ${S}/>
    <path d="M 50 64 L 50 76 M 36 84 L 64 84 L 60 76 L 40 76 Z" fill="url(#pc-yellow)" ${S}/>
    <text x="50" y="46" text-anchor="middle" font-family="Unbounded, Inter, sans-serif" font-weight="800" font-size="22" fill="#fff">÷</text>`),
  prodigy: () => wrap(`
    <path d="M 36 24 C 20 24 14 42 22 54 C 14 66 24 82 40 78 C 44 90 62 90 66 78 C 82 82 90 64 80 52 C 88 40 78 22 64 26 C 58 14 42 14 36 24 Z" fill="url(#pc-pink)" ${S}/>
    <path d="M 50 22 C 48 40 52 60 50 86" fill="none" ${S2}/>
    <path d="M 30 40 C 36 46 40 44 44 40 M 56 36 C 62 42 66 40 70 46 M 28 62 C 34 58 38 62 42 60 M 58 66 C 64 60 70 66 74 62" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
    <path d="M 64 4 L 54 26 L 64 25 L 56 46 L 78 18 L 66 19 L 74 4 Z" fill="url(#pc-yellow)" ${S2}/>`),
  grandmaster: () => wrap(`
    <path d="M 16 72 L 12 30 L 32 48 L 50 20 L 68 48 L 88 30 L 84 72 Z" fill="url(#pc-yellow)" ${S}/>
    <rect x="16" y="72" width="68" height="12" rx="3" fill="url(#pc-teal)" ${S}/>
    <circle cx="12" cy="28" r="4" fill="url(#pc-red)" ${S2}/><circle cx="50" cy="18" r="4" fill="url(#pc-red)" ${S2}/><circle cx="88" cy="28" r="4" fill="url(#pc-red)" ${S2}/>
    <circle cx="36" cy="60" r="4" fill="#fff" ${S2}/><circle cx="64" cy="60" r="4" fill="#fff" ${S2}/>`),
  legend: () => wrap(`
    <path d="M 6 90 L 34 42 L 48 62 L 64 30 L 94 90 Z" fill="url(#pc-blue)" ${S}/>
    <path d="M 64 30 L 56 46 L 64 44 L 72 46 Z" fill="#fff" ${S2}/>
    <path d="M 34 42 L 28 52 L 34 50 L 40 52 Z" fill="#fff" ${S2}/>
    <path d="M 12 24 C 30 10 56 6 86 12" fill="none" stroke="${PALETTE.orange}" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 6"/>
    <path d="M 86 12 l 3 6 l 6 1 l -5 4 l 1 6 l -5 -3 l -5 3 l 1 -6 l -5 -4 l 6 -1 Z" fill="url(#pc-yellow)" ${S2}/>`),
};
export function badge(name) { return (BADGES[name] || BADGES.sprout)(); }

// ---- Comic bits ----------------------------------------------------------
/** A starburst sticker with a short word inside. */
export function burst(text, color = 'yellow', cls = 'burst') {
  const pts = [];
  const n = 14;
  for (let i = 0; i < n * 2; i++) { const r = i % 2 ? 50 : 40; const a = Math.PI * i / n; pts.push(`${(60 + r * Math.cos(a)).toFixed(1)},${(60 + r * Math.sin(a)).toFixed(1)}`); }
  return `<svg class="${cls}" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <polygon points="${pts.join(' ')}" fill="${PALETTE[color] || color}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    ${(() => { const lines = text.split('\n'); const fs = lines.some(l => l.length > 6) ? 13 : 17; const y0 = 60 - (lines.length - 1) * fs * 0.6 + fs * 0.36; return `<text x="60" y="${y0}" text-anchor="middle" font-family="Unbounded, Inter, sans-serif" font-weight="800" font-size="${fs}" fill="${INK}">${lines.map((l, i) => `<tspan x="60" dy="${i ? fs * 1.15 : 0}">${l}</tspan>`).join('')}</text>`; })()}
  </svg>`;
}

/** Simple pencil-line icons for columns and steps. 24-unit grid, drawn big. */
const ICO = (inner, fillColor = 'yellow') => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g filter="url(#pencil)">${inner}</g></svg>`;
export const ICONS = {
  // benefits
  speed: () => ICO(`<path d="M 36 6 L 16 36 L 30 36 L 24 58 L 50 26 L 36 26 L 42 6 Z" fill="url(#pc-yellow)" ${S}/>`),
  confidence: () => ICO(`<path d="M 32 6 L 39 24 L 58 26 L 44 38 L 48 57 L 32 47 L 16 57 L 20 38 L 6 26 L 25 24 Z" fill="url(#pc-red)" ${S}/>`),
  progress: () => ICO(`<rect x="8" y="40" width="12" height="18" fill="url(#pc-red)" ${S2}/><rect x="26" y="28" width="12" height="30" fill="url(#pc-yellow)" ${S2}/><rect x="44" y="12" width="12" height="46" fill="url(#pc-green)" ${S2}/><path d="M 6 34 C 20 30 30 20 56 6" fill="none" stroke="${PALETTE.blue}" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 6"/>`),
  // lesson steps
  watch: () => ICO(`<circle cx="32" cy="32" r="25" fill="#fff" ${S}/><path d="M 26 20 L 44 32 L 26 44 Z" fill="url(#pc-blue)" ${S2}/>`),
  try: () => ICO(`<rect x="8" y="14" width="48" height="36" rx="6" fill="#fff" ${S}/><line x1="8" y1="30" x2="56" y2="30" stroke="${INK}" stroke-width="3"/><g><circle cx="20" cy="22" r="4" fill="url(#pc-red)" ${S2}/><circle cx="32" cy="22" r="4" fill="url(#pc-yellow)" ${S2}/><circle cx="44" cy="22" r="4" fill="url(#pc-green)" ${S2}/><circle cx="20" cy="40" r="4" fill="url(#pc-red)" ${S2}/><circle cx="32" cy="40" r="4" fill="url(#pc-yellow)" ${S2}/><circle cx="44" cy="40" r="4" fill="url(#pc-green)" ${S2}/></g>`),
  drill: () => ICO(`<circle cx="32" cy="36" r="22" fill="#fff" ${S}/><path d="M 32 36 L 32 20 M 32 36 L 42 42" fill="none" ${S}/><path d="M 26 8 L 38 8 M 32 8 L 32 14" ${S}/><circle cx="32" cy="36" r="3" fill="url(#pc-red)"/>`),
  pass: () => ICO(`<path d="M 32 6 L 39 24 L 58 26 L 44 38 L 48 57 L 32 47 L 16 57 L 20 38 L 6 26 L 25 24 Z" fill="url(#pc-yellow)" ${S}/><path d="M 24 32 l 6 6 l 11 -12" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`),
  boss: () => ICO(`<circle cx="32" cy="34" r="22" fill="url(#pc-blue)" ${S}/><circle cx="32" cy="30" r="9" fill="#fff" ${S2}/><circle cx="32" cy="30" r="4" fill="url(#pc-green)"/><path d="M 14 16 L 10 6 L 20 12 M 50 16 L 54 6 L 44 12" fill="url(#pc-yellow)" ${S2}/><path d="M 22 44 Q 32 52 42 44" fill="none" ${S2}/>`),
  // needs
  soroban: () => ICO(`<rect x="6" y="14" width="52" height="36" rx="5" fill="#fff" ${S}/><line x1="6" y1="28" x2="58" y2="28" stroke="${INK}" stroke-width="3"/><circle cx="18" cy="21" r="4" fill="url(#pc-red)" ${S2}/><circle cx="32" cy="21" r="4" fill="url(#pc-blue)" ${S2}/><circle cx="46" cy="21" r="4" fill="url(#pc-green)" ${S2}/><circle cx="18" cy="38" r="4" fill="url(#pc-red)" ${S2}/><circle cx="32" cy="38" r="4" fill="url(#pc-blue)" ${S2}/><circle cx="46" cy="38" r="4" fill="url(#pc-green)" ${S2}/>`),
  clock: () => ICO(`<circle cx="32" cy="32" r="24" fill="#fff" ${S}/><path d="M 32 32 L 32 16 M 32 32 L 42 38" fill="none" ${S}/>`),
  parent: () => ICO(`<circle cx="24" cy="20" r="9" fill="url(#pc-yellow)" ${S2}/><circle cx="44" cy="26" r="7" fill="url(#pc-blue)" ${S2}/><path d="M 8 56 C 8 40 40 40 40 56 Z" fill="url(#pc-yellow)" ${S2}/><path d="M 34 56 C 34 44 58 44 58 56 Z" fill="url(#pc-blue)" ${S2}/>`),
  brain: () => ICO(`<path d="M 24 12 C 12 12 8 24 14 32 C 8 40 16 52 28 48 C 30 56 42 56 44 48 C 56 52 62 40 54 32 C 60 24 52 12 42 14 C 38 6 28 6 24 12 Z" fill="url(#pc-pink)" ${S}/><path d="M 32 12 C 31 26 33 40 32 54" fill="none" ${S2}/>`),
  eye: () => ICO(`<path d="M 6 32 C 18 14 46 14 58 32 C 46 50 18 50 6 32 Z" fill="#fff" ${S}/><circle cx="32" cy="32" r="9" fill="url(#pc-blue)" ${S2}/><circle cx="35" cy="29" r="2.5" fill="#fff"/>`),
  check: () => ICO(`<circle cx="32" cy="32" r="24" fill="url(#pc-green)" ${S}/><path d="M 20 33 l 8 8 l 16 -18" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`),
  lock: () => ICO(`<rect x="14" y="28" width="36" height="28" rx="6" fill="url(#pc-grey)" ${S}/><path d="M 22 28 V 20 a 10 10 0 0 1 20 0 v 8" fill="none" ${S}/><circle cx="32" cy="42" r="4" fill="${INK}"/>`),
};
export function icon(name, cls = 'ic') { const s = (ICONS[name] || ICONS.speed)(); return s.replace('<svg ', `<svg class="${cls}" `); }

/** Pencil-style speed lines for a hero corner. */
export function speedLines() {
  return `<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none" filter="url(#pencil)"><path d="M 4 10 H 60"/><path d="M 14 30 H 90"/><path d="M 4 50 H 50"/></g></svg>`;
}

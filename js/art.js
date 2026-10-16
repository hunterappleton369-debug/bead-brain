// art.js — colored-pencil style SVG art (logo + stage badges), inline strings.
// All icons reference shared <defs> injected once by injectDefs().

export function injectDefs() {
  if (document.getElementById('pencil-defs')) return;
  const colors = { red: '#e4572e', orange: '#f3a712', yellow: '#f7d154', green: '#6fb351', teal: '#29a19c', blue: '#4f86c6', purple: '#8e5ea2', pink: '#e86f9e', brown: '#8b5e34', grey: '#9aa0ab' };
  let patterns = '';
  for (const [name, c] of Object.entries(colors)) {
    // two layers of diagonal strokes to look like pencil shading
    patterns += `<pattern id="pc-${name}" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(38)">
      <rect width="7" height="7" fill="${c}" opacity="0.55"/>
      <line x1="0" y1="0" x2="0" y2="7" stroke="${c}" stroke-width="3.2" opacity="0.9"/>
      <line x1="3.5" y1="0" x2="3.5" y2="7" stroke="#fff" stroke-width="0.8" opacity="0.35"/>
    </pattern>`;
  }
  const svg = `<svg id="pencil-defs" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <filter id="pencil" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="7" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <filter id="pencil-soft" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="2" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="1.2" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    ${patterns}
  </defs></svg>`;
  document.body.insertAdjacentHTML('afterbegin', svg);
}

const S = 'stroke="#3b3f4a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
const S2 = 'stroke="#3b3f4a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';

function wrap(inner, vb = '0 0 100 100', cls = 'badge') {
  return `<svg class="${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g filter="url(#pencil)">${inner}</g></svg>`;
}

// ---- Logo: mini soroban + wordmark -------------------------------------
export function logo({ wordmark = true } = {}) {
  const bead = (x, y, c) => `<path d="M ${x - 9} ${y} Q ${x - 5} ${y - 6} ${x} ${y - 6} Q ${x + 5} ${y - 6} ${x + 9} ${y} Q ${x + 5} ${y + 6} ${x} ${y + 6} Q ${x - 5} ${y + 6} ${x - 9} ${y} Z" fill="url(#pc-${c})" ${S2}/>`;
  const rods = [26, 50, 74];
  let beads = '';
  const cols = ['red', 'teal', 'orange'];
  rods.forEach((x, i) => {
    beads += `<line x1="${x}" y1="14" x2="${x}" y2="96" stroke="#8b5e34" stroke-width="2.5"/>`;
    // heaven bead: alternate up/down for a lively look
    beads += bead(x, i === 1 ? 36 : 22, cols[i]);
    // earth beads
    const up = [1, 3, 2][i];
    for (let k = 0; k < 4; k++) beads += bead(x, k < up ? 56 + k * 12 : 60 + 12 + k * 12 - 4, cols[i]);
  });
  const icon = `<rect x="8" y="8" width="84" height="94" rx="14" fill="#fdf3dc" ${S}/>
    <rect x="12" y="42" width="76" height="6" rx="2" fill="#8b5e34" stroke="#5c3a1a" stroke-width="1.5"/>
    ${beads}
    <path d="M 78 2 L 70 18 L 79 17 L 72 34 L 88 12 L 79 13 L 86 2 Z" fill="url(#pc-yellow)" ${S2}/>`;
  if (!wordmark) return wrap(icon, '0 0 100 108', 'logo-icon');
  return `<svg class="logo-svg" viewBox="0 0 400 108" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bead Brain">
    <g filter="url(#pencil)">${icon}</g>
    <g font-family="'Patrick Hand', cursive" font-size="58" filter="url(#pencil-soft)">
      <text x="112" y="72" fill="url(#pc-teal)" stroke="#2f3440" stroke-width="1.6">Bead</text>
      <text x="245" y="72" fill="url(#pc-orange)" stroke="#2f3440" stroke-width="1.6">Brain</text>
    </g>
    <path d="M 114 84 Q 200 94 392 82" fill="none" stroke="#e4572e" stroke-width="3" stroke-linecap="round" filter="url(#pencil)"/>
  </svg>`;
}

// ---- Stage badges --------------------------------------------------------
export const BADGES = {
  sprout: () => wrap(`
    <ellipse cx="50" cy="84" rx="30" ry="9" fill="url(#pc-brown)" ${S2}/>
    <path d="M 50 82 C 50 66 50 56 50 44" fill="none" stroke="#6fb351" stroke-width="4" stroke-linecap="round"/>
    <path d="M 50 60 C 36 60 26 52 24 38 C 38 38 50 46 50 60 Z" fill="url(#pc-green)" ${S}/>
    <path d="M 50 50 C 64 50 76 40 76 26 C 62 26 50 36 50 50 Z" fill="url(#pc-green)" ${S}/>
    <circle cx="80" cy="18" r="6" fill="url(#pc-yellow)" ${S2}/>`),
  explorer: () => wrap(`
    <circle cx="50" cy="52" r="36" fill="#fff" ${S}/>
    <circle cx="50" cy="52" r="28" fill="none" ${S2} stroke-dasharray="4 5"/>
    <path d="M 50 20 L 58 52 L 50 84 L 42 52 Z" fill="url(#pc-red)" ${S2}/>
    <path d="M 18 52 L 50 44 L 82 52 L 50 60 Z" fill="url(#pc-blue)" ${S2}/>
    <circle cx="50" cy="52" r="5" fill="url(#pc-yellow)" ${S2}/>
    <text x="50" y="14" text-anchor="middle" font-family="'Patrick Hand'" font-size="14" fill="#3b3f4a">N</text>`),
  apprentice: () => wrap(`
    <path d="M 22 24 L 50 18 L 78 24 L 78 84 L 50 90 L 22 84 Z" fill="url(#pc-orange)" ${S}/>
    <path d="M 50 18 L 50 90" ${S2}/>
    <path d="M 30 36 L 44 33 M 30 46 L 44 43 M 30 56 L 44 53 M 56 33 L 70 36 M 56 43 L 70 46 M 56 53 L 70 56" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 60 72 l 6 6 l 10 -14" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`),
  adept: () => wrap(`
    <circle cx="34" cy="38" r="20" fill="url(#pc-yellow)" ${S}/>
    <circle cx="34" cy="38" r="8" fill="#fff" ${S2}/>
    <path d="M 50 48 L 86 84" stroke="#3b3f4a" stroke-width="9" stroke-linecap="round"/>
    <path d="M 50 48 L 86 84" stroke="#f7d154" stroke-width="5" stroke-linecap="round"/>
    <path d="M 70 68 L 78 60 M 78 76 L 86 68" stroke="#3b3f4a" stroke-width="5" stroke-linecap="round"/>`),
  ace: () => wrap(`
    <path d="M 50 12 L 61 38 L 89 40 L 67 58 L 74 86 L 50 71 L 26 86 L 33 58 L 11 40 L 39 38 Z" fill="url(#pc-yellow)" ${S}/>
    <path d="M 8 20 L 24 24 M 6 32 L 18 34 M 92 20 L 76 24 M 94 32 L 82 34" stroke="#f3a712" stroke-width="3" stroke-linecap="round"/>`),
  wizard: () => wrap(`
    <path d="M 50 8 C 54 30 62 44 76 64 L 24 64 C 38 44 46 30 50 8 Z" fill="url(#pc-purple)" ${S}/>
    <path d="M 12 70 Q 50 56 88 70 Q 50 86 12 70 Z" fill="url(#pc-purple)" ${S}/>
    <path d="M 24 64 Q 50 70 76 64" fill="none" stroke="#f7d154" stroke-width="4"/>
    <path d="M 56 30 l 2 5 l 5 1 l -4 3 l 1 5 l -4 -3 l -4 3 l 1 -5 l -4 -3 l 5 -1 Z" fill="#f7d154" stroke="#3b3f4a" stroke-width="1.2"/>
    <path d="M 40 48 l 1.5 4 l 4 .5 l -3 2.5 l 1 4 l -3.5 -2 l -3.5 2 l 1 -4 l -3 -2.5 l 4 -.5 Z" fill="#fff" stroke="#3b3f4a" stroke-width="1.2"/>`),
  champion: () => wrap(`
    <path d="M 30 14 L 70 14 L 68 44 C 66 58 58 64 50 64 C 42 64 34 58 32 44 Z" fill="url(#pc-yellow)" ${S}/>
    <path d="M 30 22 C 16 22 14 40 32 42 M 70 22 C 84 22 86 40 68 42" fill="none" ${S}/>
    <path d="M 50 64 L 50 76 M 36 84 L 64 84 L 60 76 L 40 76 Z" fill="url(#pc-orange)" ${S}/>
    <text x="50" y="44" text-anchor="middle" font-family="'Patrick Hand'" font-size="22" fill="#3b3f4a">÷</text>`),
  prodigy: () => wrap(`
    <path d="M 36 24 C 20 24 14 42 22 54 C 14 66 24 82 40 78 C 44 90 62 90 66 78 C 82 82 90 64 80 52 C 88 40 78 22 64 26 C 58 14 42 14 36 24 Z" fill="url(#pc-pink)" ${S}/>
    <path d="M 50 22 C 48 40 52 60 50 86" fill="none" ${S2}/>
    <path d="M 30 40 C 36 46 40 44 44 40 M 56 36 C 62 42 66 40 70 46 M 28 62 C 34 58 38 62 42 60 M 58 66 C 64 60 70 66 74 62" fill="none" stroke="#3b3f4a" stroke-width="2" stroke-linecap="round"/>
    <path d="M 64 4 L 54 26 L 64 25 L 56 46 L 78 18 L 66 19 L 74 4 Z" fill="url(#pc-yellow)" ${S2}/>`),
  grandmaster: () => wrap(`
    <path d="M 16 72 L 12 30 L 32 48 L 50 20 L 68 48 L 88 30 L 84 72 Z" fill="url(#pc-yellow)" ${S}/>
    <rect x="16" y="72" width="68" height="12" rx="3" fill="url(#pc-red)" ${S}/>
    <circle cx="12" cy="28" r="4" fill="url(#pc-teal)" ${S2}/><circle cx="50" cy="18" r="4" fill="url(#pc-teal)" ${S2}/><circle cx="88" cy="28" r="4" fill="url(#pc-teal)" ${S2}/>
    <circle cx="36" cy="60" r="4" fill="#fff" ${S2}/><circle cx="64" cy="60" r="4" fill="#fff" ${S2}/>`),
  legend: () => wrap(`
    <path d="M 6 90 L 34 42 L 48 62 L 64 30 L 94 90 Z" fill="url(#pc-blue)" ${S}/>
    <path d="M 64 30 L 56 46 L 64 44 L 72 46 Z" fill="#fff" ${S2}/>
    <path d="M 34 42 L 28 52 L 34 50 L 40 52 Z" fill="#fff" ${S2}/>
    <path d="M 12 24 C 30 10 56 6 86 12" fill="none" stroke="#f3a712" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 6"/>
    <path d="M 86 12 l 3 6 l 6 1 l -5 4 l 1 6 l -5 -3 l -5 3 l 1 -6 l -5 -4 l 6 -1 Z" fill="url(#pc-yellow)" ${S2}/>`),
};

export const ICONS = {
  check: '✓', lock: '🔒', star: '★', bolt: '⚡', fire: '🔥', trophy: '🏆', eye: '👁️', ear: '👂', hand: '✋', brain: '🧠',
};

export function badge(name) { return (BADGES[name] || BADGES.sprout)(); }

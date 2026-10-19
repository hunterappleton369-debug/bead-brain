// abacus.js — interactive SVG soroban with hand-drawn (colored pencil) styling.
import { Soroban } from './soroban.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, parent) => {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(n);
  return n;
};

const BEAD_COLORS = ['#f03e3e', '#ffd23f', '#22c55e', '#2457f5', '#7c5cff', '#f03e3e', '#ffd23f', '#22c55e', '#2457f5', '#7c5cff', '#f03e3e', '#ffd23f', '#22c55e'];

export class AbacusView {
  constructor(container, opts = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    this.rods = opts.rods || 7;
    this.interactive = opts.interactive !== false;
    this.onChange = opts.onChange || (() => {});
    this.model = new Soroban(this.rods);
    this.colW = 54; this.beadH = 22; this.beadW = 44;
    this.topPad = 26; this.heavenTravel = 26; this.beamY = this.topPad + this.beadH + this.heavenTravel + 8;
    this.earthTravel = 26; this.height = this.beamY + 10 + this.earthTravel + 4 * this.beadH + 30 + (opts.showPlaceLabels ? 16 : 0);
    this.width = this.rods * this.colW + 40;
    this.showValue = opts.showValue !== false;
    this.showPlaceLabels = opts.showPlaceLabels || false;
    this.render();
  }

  render() {
    this.container.innerHTML = '';
    this.container.classList.add('abacus-wrap');
    const svg = el('svg', { viewBox: `0 0 ${this.width} ${this.height}`, class: 'abacus', role: 'img', 'aria-label': 'soroban abacus' });
    this.svg = svg;
    // pencil texture filter (shared)
    const defs = el('defs', {}, svg);
    const f = el('filter', { id: 'pencil-wobble', x: '-5%', y: '-5%', width: '110%', height: '110%' }, defs);
    el('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.9', numOctaves: '2', result: 'noise', seed: '3' }, f);
    el('feDisplacementMap', { in: 'SourceGraphic', in2: 'noise', scale: '1.6', xChannelSelector: 'R', yChannelSelector: 'G' }, f);
    const hatch = el('pattern', { id: 'hatch', width: '6', height: '6', patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(35)' }, defs);
    el('rect', { width: '6', height: '6', fill: 'transparent' }, hatch);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: 'rgba(255,255,255,0.4)', 'stroke-width': '2' }, hatch);

    // frame
    const g = el('g', { filter: 'url(#pencil-wobble)' }, svg);
    const frameH = this.height - 12 - (this.showPlaceLabels ? 16 : 0);
    el('rect', { x: 6, y: 6, width: this.width - 12, height: frameH, rx: 14, fill: '#ffffff', stroke: '#121826', 'stroke-width': 3 }, g);
    el('rect', { x: 6, y: 6, width: this.width - 12, height: frameH, rx: 14, fill: 'url(#hatch)', opacity: 0.25 }, g);
    // beam
    el('rect', { x: 10, y: this.beamY, width: this.width - 20, height: 10, fill: '#121826', stroke: '#121826', 'stroke-width': 2 }, g);
    this.rodsG = el('g', {}, svg);
    this.beadsG = el('g', {}, svg);
    this.hlG = el('g', {}, svg);
    this.beads = [];
    for (let c = 0; c < this.rods; c++) {
      const x = this.colX(c);
      el('line', { x1: x, y1: 16, x2: x, y2: this.height - 16 - (this.showPlaceLabels ? 16 : 0), stroke: '#aab2c2', 'stroke-width': 3, 'stroke-linecap': 'round' }, this.rodsG);
      // unit dot every 3rd column (ones, thousands, ...) like a real soroban
      const colIndex = this.rods - 1 - c;
      if (colIndex % 3 === 0) el('circle', { cx: x, cy: this.beamY + 5, r: 3, fill: '#fff' }, this.rodsG);
      const col = { heaven: null, earth: [] };
      const color = BEAD_COLORS[c % BEAD_COLORS.length];
      col.heaven = this.makeBead(x, color, c, 'heaven', 0);
      for (let k = 0; k < 4; k++) col.earth.push(this.makeBead(x, color, c, 'earth', k));
      this.beads.push(col);
      if (this.showPlaceLabels) {
        const labels = ['1', '10', '100', '1k', '10k', '100k', '1M', '10M', '100M', '1B', '10B', '100B', '1T'];
        el('text', { x, y: this.height - 2, 'text-anchor': 'middle', class: 'place-label' }, svg).textContent = labels[colIndex] || '';
      }
    }
    this.container.appendChild(svg);
    if (this.showValue) {
      this.valueEl = document.createElement('div');
      this.valueEl.className = 'abacus-value';
      this.container.appendChild(this.valueEl);
    }
    this.captionEl = document.createElement('div');
    this.captionEl.className = 'abacus-caption';
    this.container.appendChild(this.captionEl);
    this.update(false);
  }

  colX(c) { return 20 + c * this.colW + this.colW / 2; }

  makeBead(x, color, c, kind, k) {
    const g = el('g', { class: `bead ${kind}`, 'data-col': c, 'data-kind': kind, 'data-k': k }, this.beadsG);
    // bead shape: rounded diamond (like a real soroban bead) drawn with a pencil edge
    const w = this.beadW / 2, h = this.beadH / 2 - 1;
    const path = `M ${-w} 0 Q ${-w * 0.6} ${-h} 0 ${-h} Q ${w * 0.6} ${-h} ${w} 0 Q ${w * 0.6} ${h} 0 ${h} Q ${-w * 0.6} ${h} ${-w} 0 Z`;
    el('path', { d: path, fill: color, stroke: '#121826', 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
    el('path', { d: path, fill: 'url(#hatch)', opacity: 0.45 }, g);
    el('ellipse', { cx: -w * 0.35, cy: -h * 0.35, rx: w * 0.22, ry: h * 0.28, fill: 'rgba(255,255,255,0.45)' }, g);
    g.style.transition = 'transform 160ms ease-out';
    g.style.cursor = this.interactive ? 'pointer' : 'default';
    if (this.interactive) {
      g.addEventListener('pointerdown', ev => { ev.preventDefault(); this.clickBead(c, kind, k); });
    }
    g._x = x;
    return g;
  }

  // Position beads according to model
  update(animate = true) {
    for (let c = 0; c < this.rods; c++) {
      const v = this.model.columns[this.rods - 1 - c]; // visual column c, model column from the right
      const heavenDown = v >= 5;
      const earthUp = v % 5;
      const col = this.beads[c];
      const hy = heavenDown ? this.beamY - this.beadH / 2 - 1 : this.topPad + this.beadH / 2;
      col.heaven.style.transform = `translate(${col.heaven._x}px, ${hy}px)`;
      col.heaven.classList.toggle('active', heavenDown);
      for (let k = 0; k < 4; k++) {
        const b = col.earth[k];
        const active = k < earthUp;
        // active beads stack up from the beam; inactive stack at bottom
        const y = active
          ? this.beamY + 10 + this.beadH / 2 + 1 + k * this.beadH
          : this.beamY + 10 + this.earthTravel + this.beadH / 2 + 1 + k * this.beadH;
        b.style.transform = `translate(${b._x}px, ${y}px)`;
        b.classList.toggle('active', active);
      }
    }
    if (this.valueEl) this.valueEl.textContent = this.model.value.toLocaleString();
  }

  clickBead(c, kind, k) {
    const m = this.rods - 1 - c; // model column (0 = ones)
    const v = this.model.columns[m];
    let nv = v;
    if (kind === 'heaven') nv = v >= 5 ? v - 5 : v + 5;
    else {
      const earthUp = v % 5;
      // clicking bead k: if inactive -> push it (and those above) up => earthUp = k+1 ; if active -> drop it and below => earthUp = k
      nv = (v >= 5 ? 5 : 0) + (k < earthUp ? k : k + 1);
    }
    this.model.columns[m] = nv;
    this.update();
    this.onChange(this.model.value, m);
  }

  get value() { return this.model.value; }
  setValue(n, animate = true) { this.model.setValue(n); this.update(animate); return this; }
  clear() { this.model.clear(); this.update(); this.clearHighlights(); this.caption(''); return this; }

  caption(text, cls = '') {
    this.captionEl.innerHTML = text || '';
    this.captionEl.className = 'abacus-caption ' + cls;
  }

  highlightColumn(col, cls = 'hl') {
    const x = this.colX(this.rods - 1 - col); // col is a model column (0 = ones)
    el('rect', { x: x - this.colW / 2 + 3, y: 12, width: this.colW - 6, height: this.height - 24 - (this.showPlaceLabels ? 16 : 0), rx: 10, class: 'col-hl ' + cls }, this.hlG);
  }
  clearHighlights() { this.hlG.innerHTML = ''; }

  // Animate a signed number being applied, step by step, with captions.
  async play(n, { speed = 1, narrate = true } = {}) {
    const steps = this.model.apply(n); // model now holds final value; replay visually
    const final = this.model.columns.slice();
    // rewind visually
    const start = this.model.columns.slice();
    // reconstruct start by undoing: easier to recompute from value
    this.model.setValue(this.model.value - n);
    this.update(false);
    const wait = ms => new Promise(r => setTimeout(r, ms / speed));
    this.caption(`${n < 0 ? '−' : '+'} ${Math.abs(n)}`, 'big');
    await wait(500);
    for (const st of steps) {
      this.clearHighlights();
      this.highlightColumn(st.col, st.type);
      if (narrate) this.caption(describeStep(st), st.type);
      await wait(650);
      this.model.columns[st.col] = st.after;
      this.update();
      await wait(650);
    }
    this.clearHighlights();
    this.model.columns = final;
    this.update();
    return steps;
  }
}

export function describeStep(st) {
  const place = ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands', 'hundred-thousands', 'millions'][st.col] || `column ${st.col + 1}`;
  const base = st.chain ? `<em>carry:</em> ${st.sign}1 on the ${place}` : `${st.sign}${st.d} on the ${place}`;
  switch (st.type) {
    case 'direct': return `${base} → <b>just move the beads</b>`;
    case 'small': return `${base} → <b>small friend:</b> ${st.sign}${st.d} = ${st.sign === '+' ? '+5 −' : '−5 +'}${5 - st.d}`;
    case 'big': return `${base} → <b>big friend:</b> ${st.sign}${st.d} = ${st.sign === '+' ? '−' : '+'}${10 - st.d} then ${st.sign === '+' ? 'carry +1' : 'borrow −1'} left`;
    case 'combo': {
      const c = 10 - st.d;
      return `${base} → <b>combo:</b> ${st.sign}${st.d} = ${st.sign === '+' ? `−5 +${5 - c}` : `+5 −${5 - c}`} then ${st.sign === '+' ? 'carry +1' : 'borrow −1'} left`;
    }
  }
  return base;
}

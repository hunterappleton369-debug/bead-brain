// playbook.js — #/playbook: Child Prodigy Secrets Playbook, the $27 add-on on the Child Prodigy Starter Kit order
// form. It is digital: the book to read here, and its audiobook. Free for Child Phenom University members.
//   #/playbook         the audiobook, the chapter list, "Print the whole Playbook"
//   #/playbook/<n>     one page (a chapter, or one of the two pages at the back), readable on a phone
//   #/playbook/listen  the chapter list, scrolled to the audiobook
// Who may open it: ACCESS.playbook in js/membership.js. The pages are library/playbook.json, built from
// docs/products/playbook.md by tools/build-members.mjs (step 4); js/reader.js draws them. The audiobook is
// library/audio/playbook/index.json and the chapter MP3s beside it; without those, PLAYBOOK_AUDIO_URL in
// js/config.js (one file); without either, the page says it is not ready yet. Print rules: css/members.css.
import { h, esc, tip, crumbs } from './ui.js';
import { icon } from './art.js';
import { auth } from './auth.js';
import { membership } from './membership.js';
import { readBook } from './reader.js';
import { JOIN_URL, PLAYBOOK_AUDIO_URL, PLAYBOOK_PRICE } from './config.js';

const ROUTE = '#/playbook';

// ───────── the gate ─────────
function gate(app) {
  if (membership.can('playbook')) return true;
  const s = membership.state();
  const signedIn = !!(auth.user || s.preview);
  let body;
  if (!membership.loaded) body = `<span class="eyebrow blue">The Playbook</span><h2>Checking what you own…</h2><p class="muted">One moment.</p>`;
  else {
    const signin = `<p class="pb-signin"><a class="link-arrow" href="#/start/signin" id="pb-signin">Already bought it? Sign in with the email you ordered with</a></p>`;
    const buy = `<div class="btn-row"><a class="btn blue" href="${JOIN_URL}">Get the Starter Kit</a></div>`;
    body = `<span class="eyebrow blue">The Playbook</span>
      <h2>Get the Playbook with your kit</h2>
      <p class="lede">The Playbook is the $${PLAYBOOK_PRICE} add-on on the Child Prodigy Starter Kit order form.</p>
      ${signedIn ? buy + signin + (s.email ? `<p class="small muted pb-who">You are signed in as <b>${esc(s.email)}</b>.</p>` : '') : signin + buy}`;
  }
  const el = h(`<div>${crumbs('<a href="#/">Home</a>', 'Playbook')}
    <section class="section" style="margin-top:24px"><div class="block yellow split lib-lock pb-lock"><div>${body}</div><div class="lock-art"><img class="pb-cover" src="img/funnel/playbook.webp" alt="Child Prodigy Secrets Playbook">${icon('lock', 'ic')}</div></div></section></div>`);
  app.appendChild(el);
  // Signed in with another email: sign out first, so the sign-in page asks for the email they ordered with.
  const link = el.querySelector('#pb-signin');
  if (link && auth.user) link.onclick = async e => { e.preventDefault(); link.textContent = 'One moment…'; await auth.signOut(); location.hash = '#/start/signin'; };
  return false;
}

// ───────── the audiobook ─────────
// library/audio/playbook/index.json: { voice, built, narrator, chapters: [{ no, title, kind, file, seconds }] }.
// One <audio> plays the chapter picked in the list; the last chapter and the place in it are remembered on
// this device (cp.playbook.audio), so the school run picks up where it stopped. A chapter that ends plays the next.
const AUDIO_DIR = 'library/audio/playbook/';
const AUDIO_KEY = 'cp.playbook.audio';
let audioP = null;
export function loadAudio() {
  if (!audioP) audioP = fetch(`${AUDIO_DIR}index.json`, { cache: 'no-cache' })
    .then(r => (r.ok ? r.json() : null))
    .then(j => (j && Array.isArray(j.chapters) && j.chapters.some(c => c && c.file) ? { ...j, chapters: j.chapters.filter(c => c && c.file) } : null))
    .catch(e => { audioP = null; console.warn('audiobook index did not load', e); return null; });
  return audioP;
}
// True once we know there is something to listen to (the chapter index, or the one-file link).
export async function hasAudio() { return !!(PLAYBOOK_AUDIO_URL || await loadAudio()); }

const fileURL = f => (/^(https?:|data:|blob:|\/)/.test(f) ? f : AUDIO_DIR + f);
const mss = sec => { const t = Math.max(0, Math.round(Number(sec) || 0)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };
const chLabel = ch => (ch.kind === 'chapter' && ch.no ? `Chapter ${ch.no}` : ch.kind === 'intro' ? 'Opening' : 'At the back');
function readSpot() { try { const v = JSON.parse(localStorage.getItem(AUDIO_KEY)); return v && v.file ? v : null; } catch { return null; } }
function saveSpot(file, t) { try { localStorage.setItem(AUDIO_KEY, JSON.stringify({ file, t: Math.floor(t || 0), at: Date.now() })); } catch {} }
// The audio chapter for a book page: by its place in playbook.json (`section`), else a chapter by its number
// and a page at the back by its title.
const same = (a, b) => String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase();
const audioFor = (audio, page, doc) => audio && page && audio.chapters.find(ch => (Number.isInteger(ch.section) && doc ? doc.sections[ch.section] === page
  : page.no ? ch.kind === 'chapter' && Number(ch.no) === Number(page.no) : ch.kind !== 'chapter' && same(ch.title, page.title)));

function audioHTML(audio, page, doc) {
  const compact = !!page;
  if (audio) {
    if (compact) {
      const ch = audioFor(audio, page, doc);
      return ch ? `<section class="pb-audio compact" data-audio-one="${esc(ch.file)}">
          <span class="eyebrow green">Audiobook · narrated edition</span>
          <audio controls preload="none" src="${esc(fileURL(ch.file))}">Your browser cannot play audio here.</audio>
        </section>` : '';
    }
    const total = audio.chapters.reduce((a, ch) => a + (Number(ch.seconds) || 0), 0);
    return `<section class="pb-audio pb-book" id="pb-listen">
        <span class="eyebrow green">Audiobook · narrated edition</span>
        <h3>Listen to the Playbook</h3>
        <audio controls preload="none">Your browser cannot play audio here.</audio>
        <p class="small pb-now" aria-live="polite"></p>
        <ol class="pb-tracks">${audio.chapters.map((ch, i) => `<li><button type="button" class="pb-track" data-i="${i}"><span class="no">${ch.kind === 'chapter' && ch.no ? ch.no : '★'}</span><span class="t">${esc(ch.title)}<small>${chLabel(ch)}</small></span><span class="d">${ch.seconds ? mss(ch.seconds) : ''}</span></button></li>`).join('')}</ol>
        <p class="small muted">${audio.narrator ? `${esc(audio.narrator)}. ` : ''}${audio.chapters.length} parts${total ? `, about ${Math.max(1, Math.round(total / 60))} minutes` : ''}. Good for the car or the school run.</p>
      </section>`;
  }
  if (PLAYBOOK_AUDIO_URL) return `<section class="pb-audio${compact ? ' compact' : ''}">
      <span class="eyebrow green">Audiobook · narrated edition</span>
      ${compact ? '' : '<h3>Listen to the Playbook</h3>'}
      <audio controls preload="none" src="${esc(PLAYBOOK_AUDIO_URL)}">Your browser cannot play audio here.</audio>
      ${compact ? '' : '<p class="small muted">Good for the car or the school run.</p>'}
    </section>`;
  if (compact) return '';
  return `<section class="pb-audio">
      <span class="eyebrow green">Audiobook</span>
      <p>The audiobook is not ready yet. When it is, it plays right here.</p>
    </section>`;
}

// Resume at the saved place once the browser knows the file (preload="none" waits for the first press of play).
function resumeAt(player, t) {
  if (!(t > 3)) return;
  const go = () => { try { if (player.duration && t < player.duration - 2) player.currentTime = t; } catch {} };
  if (player.readyState >= 1) go(); else player.addEventListener('loadedmetadata', go, { once: true });
}
function remember(player, file) {
  let last = 0;
  player.ontimeupdate = () => { if (Date.now() - last > 4000) { last = Date.now(); saveSpot(file(), player.currentTime); } };
  player.onpause = () => saveSpot(file(), player.currentTime);
}

function wireAudio(body, audio, page) {
  if (!audio) return;
  const one = body.querySelector('[data-audio-one]');
  if (one) { // a chapter page: this chapter only
    const player = one.querySelector('audio'), file = one.dataset.audioOne, spot = readSpot();
    if (spot && spot.file === file) resumeAt(player, spot.t);
    remember(player, () => file);
    return;
  }
  const box = body.querySelector('#pb-listen'); if (!box) return;
  const player = box.querySelector('audio'), now = box.querySelector('.pb-now');
  const rows = [...box.querySelectorAll('.pb-track')];
  const spot = readSpot();
  let cur = Math.max(0, spot ? audio.chapters.findIndex(ch => ch.file === spot.file) : 0);
  const show = (i, playing) => {
    rows.forEach((r, k) => { r.classList.toggle('on', k === i); if (k === i) r.setAttribute('aria-current', 'true'); else r.removeAttribute('aria-current'); });
    const ch = audio.chapters[i];
    now.innerHTML = `${playing ? 'Playing' : 'Up next'}: <b>${esc(chLabel(ch))} · ${esc(ch.title)}</b>`;
  };
  const pick = (i, play) => {
    cur = i; const ch = audio.chapters[i];
    player.src = fileURL(ch.file);
    show(i, play);
    if (play) { saveSpot(ch.file, 0); player.play().catch(() => {}); }
  };
  pick(cur, false);
  if (spot && audio.chapters[cur]?.file === spot.file && spot.t > 3) { resumeAt(player, spot.t); now.innerHTML = `Pick up where you stopped: <b>${esc(chLabel(audio.chapters[cur]))}, at ${mss(spot.t)}</b>`; }
  rows.forEach((r, i) => r.onclick = () => pick(i, true));
  player.onplay = () => show(cur, true);
  remember(player, () => audio.chapters[cur].file);
  player.onended = () => { if (cur + 1 < audio.chapters.length) pick(cur + 1, true); else { saveSpot(audio.chapters[cur].file, 0); now.textContent = 'That was the last chapter.'; } };
  player.onerror = () => { now.textContent = 'This chapter did not load. Check the connection and try again.'; };
}

// ───────── #/playbook, #/playbook/<n>, #/playbook/listen ─────────
export function playbook(app, n) {
  if (!gate(app)) return;
  const listen = n === 'listen';
  readBook(app, {
    id: 'playbook', route: ROUTE, crumb: 'Playbook', noun: 'The Playbook',
    eyebrow: 'Child Prodigy Secrets', color: 'purple', title: 'The Playbook', barTitle: 'The Playbook',
    lede: "The parent's book for the abacus. Read a chapter here, print it, or listen.",
    cover: 'img/funnel/playbook.webp',
    chip: () => { const s = membership.state(); return `<p class="lib-status"><span class="status-chip ${s.boughtPlaybook ? 'purple' : 'green'}">${s.boughtPlaybook ? 'Yours to keep' : 'With your membership'}</span>${s.preview ? '<span class="status-chip">Preview</span>' : ''} <a href="#/account">Your account</a></p>`; },
    top: (doc, audio) => audioHTML(audio),
    pageTop: (doc, page, i, audio) => audioHTML(audio, page, doc),
    tip: tip('Read one chapter tonight. Do the first lesson tomorrow. The book is the map. The app is the road.', 'parent', 'Parent tip'),
    printAllLabel: 'Print the whole Playbook',
    loading: 'Loading the Playbook…',
    failed: 'The Playbook did not load. Check the connection and try again.',
    prepare: loadAudio,
    after: (body, doc, page, audio) => {
      wireAudio(body, audio, page);
      if (listen) (body.querySelector('#pb-listen') || body.querySelector('.pb-audio'))?.scrollIntoView({ block: 'start' });
    },
  }, listen ? undefined : n);
}

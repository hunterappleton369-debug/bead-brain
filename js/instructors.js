// instructors.js — #/instructors: the public Certified Phenom Instructor directory, searchable by state,
// city or ZIP, in person or online. Listings come from instructors/instructors.json (schema and how to add
// someone: docs/APP-DELIVERY.md). Only rows with "status": "live" show. Instructor emails never appear:
// "Ask about a class" goes to the instructor's own booking link, or to support, who passes it on.
// Spec: docs/products/instructor-launch-kit/directory-listing.md.
import { h, esc, crumbs, mailto } from './ui.js';
import { isLocal } from './membership.js';
import { SUPPORT_EMAIL, CERTIFY_URL } from './config.js';

export const STATES = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming' };
const INK = '#121826';

// ───────── the badge ─────────
// Drawn from the art direction in docs/products/certification-course/instructor-certificate.md: a round seal,
// one soroban rod in the formula colors, ring text, a yellow ribbon with the year. A stand-in until the
// commissioned badge art exists. small = rod and ribbon only, for list rows.
let uid = 0;
export function instructorBadge({ year = '', small = false, cls = 'ibadge' } = {}) {
  const id = `ib${++uid}`;
  // Center (100, 100). Ring band r 62–94 holds the text; the rod, beam, beads and ribbon sit inside it.
  const pt = (r, deg) => `${(100 + r * Math.cos(deg * Math.PI / 180)).toFixed(1)} ${(100 + r * Math.sin(deg * Math.PI / 180)).toFixed(1)}`;
  const beads = ['green', 'orange', 'blue', 'purple'].map((c, i) => `<ellipse cx="100" cy="${(81.6 + i * 12).toFixed(1)}" rx="17" ry="5.6" fill="url(#pc-${c})" stroke="${INK}" stroke-width="2.6"/>`).join('');
  const ring = small ? '' : `<defs><path id="${id}t" d="M ${pt(72, 158)} A 72 72 0 1 1 ${pt(72, 22)}"/><path id="${id}b" d="M ${pt(83, 140)} A 83 83 0 0 0 ${pt(83, 40)}"/></defs>
    <text class="ring"><textPath href="#${id}t" startOffset="50%" text-anchor="middle">CERTIFIED PHENOM INSTRUCTOR</textPath></text>
    <text class="ring"><textPath href="#${id}b" startOffset="50%" text-anchor="middle">CHILD PHENOMS</textPath></text>
    <circle cx="${pt(78, 31).split(' ')[0]}" cy="${pt(78, 31).split(' ')[1]}" r="3" fill="${INK}"/><circle cx="${pt(78, 149).split(' ')[0]}" cy="${pt(78, 149).split(' ')[1]}" r="3" fill="${INK}"/>`;
  return `<svg class="${cls}" viewBox="0 0 208 208" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Certified Phenom Instructor badge${year ? `, ${year}` : ''}">
    <circle cx="104" cy="104" r="94" fill="${INK}"/>
    <circle cx="100" cy="100" r="94" fill="#e8eeff" stroke="${INK}" stroke-width="5"/>
    <circle cx="100" cy="100" r="${small ? 72 : 61}" fill="#fff" stroke="${INK}" stroke-width="3"/>
    ${ring}
    <line x1="100" y1="${small ? 40 : 48}" x2="100" y2="128" stroke="#8a93a6" stroke-width="3"/>
    <ellipse cx="100" cy="66.4" rx="17" ry="5.6" fill="url(#pc-yellow)" stroke="${INK}" stroke-width="2.6"/>
    <line x1="${small ? 44 : 60}" y1="74" x2="${small ? 156 : 140}" y2="74" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    ${beads}
    <path d="M 46 128 L 154 128 L 147 138 L 154 148 L 46 148 L 53 138 Z" fill="#ffd23f" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <text class="yr" x="100" y="143.5" text-anchor="middle">${esc(year || 'CERTIFIED')}</text>
  </svg>`;
}

// ───────── data ─────────
let data = null, useSample = false;
async function load(sample) {
  const r = await fetch(sample ? 'instructors/sample.json' : 'instructors/instructors.json', { cache: 'no-cache' });
  if (!r.ok) throw new Error(`instructors: ${r.status}`);
  const j = await r.json();
  return (j.instructors || []).filter(x => x && x.status === 'live' && x.name && STATES[String(x.state).toUpperCase()]).map(x => ({ ...x, state: String(x.state).toUpperCase() }));
}
const monthYear = s => { const [y, m] = String(s || '').split('-').map(Number); return y && m ? new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''; };
const upcoming = s => { if (!s) return ''; const [y, m, d] = s.split('-').map(Number); const t = new Date(y, m - 1, d), now = new Date(); now.setHours(0, 0, 0, 0); return t >= now ? t.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : ''; };
const safeURL = u => (/^https:\/\//i.test(u || '') ? u : '');
function contactHref(x) {
  return safeURL(x.contact_url) || mailto(SUPPORT_EMAIL, `Class enquiry: ${x.name} (${x.id || x.state})`,
    `Hi, I'd like to ask about a class with ${x.name}.\n\nMy child's age: \nMy city or ZIP: \nIn person or online: \n\n(Child Phenoms passes this message on to the instructor.)`);
}

function rowHTML(x, { example = false } = {}) {
  const year = String(x.certified || '').slice(0, 4);
  const where = [x.city, x.state].filter(Boolean).join(', ') + (x.zip ? ` · ${x.zip}` : '');
  const chips = [x.in_person && '<span class="chip direct">In person</span>', x.online && '<span class="chip big">Online</span>',
    Array.isArray(x.ages) && x.ages.length === 2 && `<span class="chip">Ages ${Number(x.ages[0])} to ${Number(x.ages[1])}</span>`].filter(Boolean).join('');
  const next = upcoming(x.next_class);
  const meta = [x.format, x.price_from && `From $${Number(x.price_from)} a class`, next && `Next class starts ${next}`, x.travel && x.in_person && (/host/i.test(x.travel) ? 'Hosts the class' : `Travels up to ${x.travel}`)].filter(Boolean).map(esc).join(' · ');
  const pic = x.photo && /^instructors\/[\w./-]+$/.test(x.photo) ? `<img class="ins-photo" src="${esc(x.photo)}" alt="${esc(x.name)}" loading="lazy">` : `<span class="ins-badge">${instructorBadge({ year, small: true })}</span>`;
  const href = example ? '#' : contactHref(x);
  return `<li class="ins${example ? ' example' : ''}">
    ${pic}
    <div class="ins-main">
      <div class="ins-name"><b>${esc(x.name)}</b>${example ? '<span class="status-chip">Example</span>' : ''}</div>
      <div class="ins-cert">Certified Phenom Instructor${monthYear(x.certified) ? ` · since ${monthYear(x.certified)}` : ''}</div>
      <div class="ins-where">${esc(where)}</div>
      <div class="ins-chips">${chips}</div>
      ${x.about ? `<p class="ins-about">${esc(String(x.about).slice(0, 300))}</p>` : ''}
      ${meta ? `<div class="ins-meta">${meta}</div>` : ''}
    </div>
    <a class="btn sm blue ins-go" href="${esc(href)}"${!example && safeURL(x.contact_url) ? ' target="_blank" rel="noopener"' : ''}>Ask about a class</a>
  </li>`;
}

// The listing form from directory-listing.md: the 13 fields, as the email an instructor fills in (LISTING_EMAIL,
// "Send my listing" below) and as the form on #/certificate/listing (js/certificate.js), which fills the same
// email in for them (listingEmail).
export const LISTING_FIELDS = [
  { key: 'name', label: 'Name as it should appear (first name and last initial, or full name)' },
  { key: 'cert_id', label: 'Certificate number (CPI-...)' },
  { key: 'email', label: 'Email for parent messages (stays hidden)' },
  { key: 'phone', label: 'Phone (optional, stays hidden)' },
  { key: 'where', label: 'City, state and ZIP' },
  { key: 'travel', label: 'How far I travel (5, 10 or 25 miles, or I host the class)' },
  { key: 'teach', label: 'I teach (in person / online / both)' },
  { key: 'ages', label: 'Ages I take (from ... to ...)' },
  { key: 'format', label: 'Class format, one line (e.g. small group, weekly, 45 minutes)' },
  { key: 'next_class', label: 'Next class start date (optional)' },
  { key: 'price_from', label: 'Price from (optional, $ a class)' },
  { key: 'about', label: 'About me, up to 300 characters (only what is true, no promises about grades or speed)' },
  { key: 'contact_url', label: 'My booking link (optional)' },
];
export const listingEmail = (v = {}) => `Hi, I passed the Certified Phenom Instructor exam. Please list me in the directory.

${LISTING_FIELDS.map((f, i) => `${i + 1}. ${f.label}:${v[f.key] ? ` ${v[f.key]}` : ''}`).join('\n')}
Photo: attached, head and shoulders, adults only (optional)

I agree to the instructor agreement and the badge rules: yes`;
export const LISTING_EMAIL = listingEmail();

const EXAMPLE = { name: 'Jane D.', certified: '2026-10', city: 'Boulder', state: 'CO', zip: '80302', in_person: true, online: true, ages: [7, 11], format: 'Small group, weekly, 45 minutes', price_from: 25, about: 'Your two or three sentences, in your own words: who you are and why you teach. Only what is true, and no promises about grades or speed.' };

function templateHTML() {
  return `<section class="section ins-template" id="get-listed">
    <div class="section-head"><span class="eyebrow green">For certified instructors</span><h2>Get listed</h2><p>Passed the exam? Your listing looks like this. Send the form below and we read it before it goes live.</p></div>
    <div class="two-col ins-template-grid">
      <div>
        <ul class="ins-list">${rowHTML(EXAMPLE, { example: true })}</ul>
        <h3 style="margin-top:28px">What a listing never shows</h3>
        <ul class="plain-list">
          <li>A home address or the exact meeting place. That goes to a family after they sign up.</li>
          <li>Any child's name, photo or score.</li>
          <li>Reviews, ratings, earnings or results claims.</li>
          <li>Your email or phone. Parents reach you through your booking link or through us.</li>
        </ul>
      </div>
      <div>
        <h3>What you send us</h3>
        <ol class="plain-list ins-fields">
          <li><b>Name</b> as it should appear: first name and last initial, or full name.</li>
          <li><b>Certificate number</b> from your certificate.</li>
          <li><b>Email</b> for parent messages, and a phone if you like. Both stay hidden.</li>
          <li><b>City, state and ZIP</b>, and how far you travel.</li>
          <li><b>In person, online,</b> or both.</li>
          <li><b>Ages</b> you take.</li>
          <li><b>Class format</b> in one line.</li>
          <li><b>Next class</b> start date and <b>price from</b>, if you want them shown.</li>
          <li><b>About you</b> in up to 300 characters. Only what is true. No promises about grades or speed.</li>
          <li><b>A booking link</b> (optional) and a head-and-shoulders photo (optional, adults only).</li>
        </ol>
        <div class="btn-row"><a class="btn green" href="${mailto(SUPPORT_EMAIL, 'Directory listing', LISTING_EMAIL)}">Send my listing</a></div>
        <p class="small muted">Every listing is read before it goes live. We turn down any that promise results, name a child, claim earnings, or use the badge as a business logo.</p>
      </div>
    </div>
    <div class="ins-badge-rules">
      <div class="art">${instructorBadge({ year: String(new Date().getFullYear()), cls: 'ibadge big' })}</div>
      <div>
        <span class="eyebrow">The badge</span>
        <h3>It says one thing: you passed, and your certification is active.</h3>
        <div class="two-col">
          <div><b>You may</b><ul class="plain-list"><li>Put it on your flyer, next to your name.</li><li>Use it on your website or social profile, linked to your listing.</li><li>Print it on a sign-up sheet or a progress report.</li></ul></div>
          <div><b>You may not</b><ul class="plain-list"><li>Change, recolor, crop or stretch it.</li><li>Make it bigger than your own name, or use it as a business logo.</li><li>Use it next to promises about grades, scores, speed or income.</li><li>Let anyone else use it.</li></ul></div>
        </div>
      </div>
    </div>
  </section>`;
}

// ───────── the page ─────────
export function instructors(app, stateArg) {
  let state = STATES[String(stateArg || '').toUpperCase()] ? String(stateArg).toUpperCase() : '';
  let q = '', inPerson = true, online = true;
  const el = h(`<div class="ins-page">
    ${crumbs('<a href="#/">Home</a>', 'Instructors')}
    <section class="page-head"><div>
      <span class="eyebrow blue">Find a class</span>
      <h1>Certified Phenom Instructors</h1>
      <p class="lede">Parents and teachers who passed the Child Phenoms certification and teach the method to small groups, in person or online.</p>
    </div><div class="art">${instructorBadge({ year: String(new Date().getFullYear()), cls: 'ibadge head' })}</div></section>
    <div class="ins-search try-box">
      <label class="f">State<select id="ins-state"><option value="">All states</option>${Object.entries(STATES).map(([k, v]) => `<option value="${k}" ${k === state ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
      <label class="f">City or ZIP<input id="ins-q" type="text" placeholder="e.g. Boulder or 80302" autocomplete="off"></label>
      <div class="f toggles" role="group" aria-label="How they teach"><button type="button" class="tog on" data-t="in">In person</button><button type="button" class="tog on" data-t="on">Online</button></div>
    </div>
    <p class="ins-count small muted" aria-live="polite">Loading the directory…</p>
    <div class="ins-results"></div>
    ${templateHTML()}
    <section class="section"><div class="block blue center">
      <span class="eyebrow blue">Teach it</span>
      <h2>No instructor near you?</h2>
      <p class="lede" style="margin:0 auto 20px">Parents become instructors in about six weeks: twenty lessons, one exam, and a launch kit for the first class.</p>
      <div class="btn-row" style="justify-content:center"><a class="btn big" href="${CERTIFY_URL}">How certification works</a></div>
    </div></section>
    ${isLocal ? `<section class="section dev-panel"><div class="try-box"><span class="eyebrow">Localhost only · not on the live site</span><p class="small muted">The live list is <code>instructors/instructors.json</code>. Sample listings live in <code>instructors/sample.json</code> and only load here.</p><div class="btn-row" style="margin:0"><button class="btn sm secondary" id="ins-sample">${useSample ? 'Show the live list' : 'Show sample listings'}</button></div></div></section>` : ''}
  </div>`);
  app.appendChild(el);
  const results = el.querySelector('.ins-results'), count = el.querySelector('.ins-count');

  const draw = () => {
    if (!data) return;
    const qq = q.trim().toLowerCase();
    const how = x => (inPerson && x.in_person) || (online && x.online);
    const near = x => !qq || String(x.city || '').toLowerCase().includes(qq) || String(x.zip || '').startsWith(qq);
    const sort = (a, b) => (a.state + a.city + a.name).localeCompare(b.state + b.city + b.name);
    const here = data.filter(x => (!state || x.state === state) && near(x) && how(x)).sort(sort);
    const elsewhere = state && online ? data.filter(x => x.state !== state && x.online && !here.includes(x)).sort(sort) : [];
    const where = state ? STATES[state] : 'the directory';
    if (!data.length) {
      count.textContent = 'No instructors are listed yet.';
      results.innerHTML = `<div class="ins-empty"><h3>The first instructors are finishing the course now.</h3><p>Check back soon, or <a href="${mailto(SUPPORT_EMAIL, 'Looking for a class', 'Hi, please let me know when there is an instructor near me.\n\nMy city or ZIP: \nMy child\'s age: ')}">ask us</a> to tell you when someone near you is listed.</p></div>`;
      return;
    }
    count.textContent = `${here.length} ${here.length === 1 ? 'instructor' : 'instructors'} ${state ? `in ${where}` : 'listed'}${qq ? ` matching "${q.trim()}"` : ''}.`;
    results.innerHTML = (here.length ? `<ul class="ins-list">${here.map(x => rowHTML(x)).join('')}</ul>`
      : `<div class="ins-empty"><h3>No one ${state ? `in ${esc(where)}` : 'here'}${qq ? ` near "${esc(q.trim())}"` : ''} yet.</h3><p>${elsewhere.length ? 'These instructors teach online, wherever you are.' : `Try another state, or <a href="${mailto(SUPPORT_EMAIL, 'Looking for a class', `Hi, please let me know when there is an instructor near me.\n\nMy city or ZIP: ${q}\nMy state: ${state}`)}">ask us</a> to tell you when someone is listed.`}</p></div>`)
      + (elsewhere.length ? `<h3 class="ins-also">Also teaching online</h3><ul class="ins-list">${elsewhere.map(x => rowHTML(x)).join('')}</ul>` : '');
  };
  const fetchList = () => { count.textContent = 'Loading the directory…'; load(useSample).then(list => { data = list; draw(); }).catch(e => { console.error(e); count.textContent = 'The directory did not load. Check the connection and try again.'; }); };

  el.querySelector('#ins-state').onchange = e => { state = e.target.value; history.replaceState(null, '', `#/instructors${state ? '/' + state : ''}`); draw(); };
  el.querySelector('#ins-q').oninput = e => { q = e.target.value; draw(); };
  el.querySelectorAll('.tog').forEach(b => b.onclick = () => {
    b.classList.toggle('on'); b.setAttribute('aria-pressed', b.classList.contains('on'));
    inPerson = el.querySelector('[data-t=in]').classList.contains('on'); online = el.querySelector('[data-t=on]').classList.contains('on');
    if (!inPerson && !online) { inPerson = online = true; el.querySelectorAll('.tog').forEach(x => { x.classList.add('on'); x.setAttribute('aria-pressed', 'true'); }); }
    draw();
  });
  el.querySelectorAll('.tog').forEach(b => b.setAttribute('aria-pressed', 'true'));
  const ex = el.querySelector('.ins.example .ins-go'); if (ex) ex.onclick = e => e.preventDefault();
  const sb = el.querySelector('#ins-sample'); if (sb) sb.onclick = () => { useSample = !useSample; sb.textContent = useSample ? 'Show the live list' : 'Show sample listings'; fetchList(); };
  fetchList();
}

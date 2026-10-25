// certificate.js — the Certified Phenom Instructor certificate, for an instructor who passed the test.
//   #/certificate           the name to print (set_certificate_name), the certificate sheet, "Print or save as
//                           PDF" (US Letter turned sideways), and the short version to copy for a profile
//   #/certificate/listing   the directory listing form → request_listing, then the same form as an email to us
// Who may open it: ACCESS.certificate in js/membership.js (a cert_certificates row). The wording is
// library/certificate.json (tools/build-members.mjs, from certification-course/instructor-certificate.md);
// the words below stand in until it loads. Print rules: css/members.css (body.printing-cert, @page cert).
import { h, esc, tip, crumbs, mailto } from './ui.js';
import { logo } from './art.js';
import { auth } from './auth.js';
import { membership } from './membership.js';
import { loadBook } from './library.js';
import { instructorGate } from './course.js';
import { instructorBadge, STATES, listingEmail } from './instructors.js';
import { toast } from './drills.js';
import { SUPPORT_EMAIL, CERT_SIGNATURE_URL } from './config.js';

const ROUTE = '#/certificate';
const HOME = '<a href="#/">Home</a>', COURSE = '<a href="#/course">Course</a>';
const WORDS = {
  title: 'Certified Phenom Instructor',
  intro: 'This certifies that',
  completed: 'has completed the 20-lesson Certified Phenom Instructor course and passed the certification exam.',
  trained: 'They are trained to teach every bead move of the Child Phenoms method, run the daily session and the group class, give the boss tests and the Bead Score, and coach a child through a stuck moment without giving the answer.',
  dateLine: 'Certified on {{date}} · Certificate no. {{cert_id}}',
  motto: 'Certified for life.',
  signer: 'Hunter McClain, Founder, Child Phenoms',
  fine: 'Issued by Child Phenoms. This is a course certificate, not an academic degree or a teaching license.',
  short: '{{full_name}} is a Certified Phenom Instructor. They completed the 20-lesson course and passed the certification exam on {{date}}. Certificate no. {{cert_id}}.',
};
const rich = s => (/<\/?[a-z][^>]*>/i.test(String(s ?? '')) ? String(s) : esc(s));
const longDay = d => (d ? d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '');
const fill = (s, f) => String(s || '').replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k) => (k in f ? f[k] : m));

export function certificate(app, sub) {
  if (!instructorGate(app, 'certificate', sub ? [COURSE, `<a href="${ROUTE}">Certificate</a>`, 'Get listed'] : [COURSE, 'Certificate'])) return;
  return sub === 'listing' ? listingPage(app) : sheetPage(app);
}

// ───────── the sheet ─────────
function sheetHTML(w, c) {
  const date = longDay(c.passedOn), f = { full_name: esc(c.full_name || ''), date, cert_id: esc(c.cert_id || '') };
  const signer = String(w.signer || '').replace(/\*\*/g, '');
  const [sName, ...sRest] = signer.split(',');
  return `<div class="cert-sheet" role="img" aria-label="${esc(`${w.title}: ${c.full_name || ''}, ${date}, certificate number ${c.cert_id || ''}`)}">
      <div class="cert-in">
        <div class="cert-logo">${logo()}</div>
        <h2 class="cert-title">${rich(w.title)}</h2>
        <p class="cert-intro">${rich(w.intro)}</p>
        <p class="cert-name">${esc(c.full_name || '')}</p>
        <p class="cert-text">${rich(fill(w.completed, f))}</p>
        <p class="cert-text cert-trained">${rich(fill(w.trained, f))}</p>
        <p class="cert-date">${fill(esc(w.dateLine), f)}</p>
        <p class="cert-motto">${rich(w.motto)}</p>
        <div class="cert-foot">
          <div class="cert-badge">${instructorBadge({ year: String(c.passedOn?.getFullYear() || new Date().getFullYear()) })}</div>
          <div class="cert-sign">
            ${CERT_SIGNATURE_URL ? `<img class="cert-sig" src="${esc(CERT_SIGNATURE_URL)}" alt="Signature">` : '<span class="cert-line" aria-hidden="true"></span>'}
            <b>${esc(sName.trim())}</b>${sRest.length ? `<span>${esc(sRest.join(',').trim())}</span>` : ''}
          </div>
        </div>
        <p class="cert-fine">${rich(w.fine)}</p>
      </div>
    </div>`;
}

function nameFormHTML(c, again) {
  return `<form class="try-box cert-name-form" id="cert-name-form" autocomplete="on">
      <span class="eyebrow blue">${again ? 'Change the name' : 'One step first'}</span>
      <h2>How should your name look?</h2>
      <p>This is the name we print on your certificate. Use the name you want parents to see.</p>
      <div class="field"><label for="cert-name">Your full name</label><input id="cert-name" type="text" maxlength="80" autocomplete="name" required value="${esc(c.full_name || '')}"></div>
      <div class="btn-row"><button class="btn big blue" type="submit">Put it on my certificate</button>${again ? '<button class="btn secondary" type="button" id="cert-cancel">Keep the name</button>' : ''}</div>
      <div class="cert-msg" aria-live="polite"></div>
    </form>`;
}

function sheetPage(app) {
  const s = membership.state(), c = s.cert;
  const el = h(`<div class="cert-page">${crumbs(HOME, COURSE, 'Certificate')}<div class="cert-body"><p class="muted">Loading your certificate…</p></div></div>`);
  app.appendChild(el);
  loadBook('certificate').catch(e => { console.warn('certificate.json did not load; using the words in js/certificate.js', e); return {}; }).then(j => {
    if (!el.isConnected) return;
    const w = { ...WORDS, ...Object.fromEntries(Object.entries(j || {}).filter(([, v]) => typeof v === 'string' && v)) };
    const named = !!String(c.full_name || '').trim();
    const date = longDay(c.passedOn);
    const short = fill(w.short, { full_name: c.full_name || '', date, cert_id: c.cert_id || '' }).replace(/<[^>]+>/g, '');
    el.querySelector('.cert-body').innerHTML = `<section class="page-head cert-head"><div>
        <span class="eyebrow blue">Certified Phenom Instructor</span>
        <h1>Your certificate</h1>
        <p class="lede">You passed${date ? ` on ${date}` : ''}. Certificate no. <b>${esc(c.cert_id || '')}</b>.</p>
      </div></section>
      ${named ? '' : nameFormHTML(c, false)}
      ${named ? `<div class="btn-row cert-tools"><button class="btn big blue" type="button" id="cert-print">Print or save as PDF</button><button class="btn secondary" type="button" id="cert-copy">Copy the short version</button><button class="btn ghost" type="button" id="cert-rename">Change the name</button></div>
      <div class="cert-again"></div>` : ''}
      <div class="cert-wrap${named ? '' : ' cert-draft'}">${sheetHTML(w, named ? c : { ...c, full_name: 'Your name here' })}</div>
      ${named ? `<section class="cert-short">
        <span class="eyebrow">The short version</span>
        <p class="cert-short-text">${esc(short)}</p>
        <p class="small muted">For your website, your social profile or an email to a parent.</p>
      </section>` : ''}
      ${tip('Print on plain Letter paper, turned sideways. In the print box pick "Save as PDF" to keep a copy.', 'parent', 'Printing')}
      <section class="section" style="margin-top:40px"><div class="block blue center cert-next">
        <span class="eyebrow blue">Next</span>
        <h2>Get listed in the directory</h2>
        <p class="lede" style="margin:0 auto 20px">Parents near you search it for a class. Send your listing and we read it before it goes live.</p>
        <div class="btn-row" style="justify-content:center"><a class="btn big" href="${ROUTE}/listing">Send my listing</a><a class="btn secondary" href="#/kit">The Launch Kit</a></div>
      </div></section>`;
    wireName(el, c);
    const pr = el.querySelector('#cert-print');
    if (pr) pr.onclick = () => {
      document.body.classList.add('printing-cert');
      window.addEventListener('afterprint', () => document.body.classList.remove('printing-cert'), { once: true });
      window.print();
    };
    const cp = el.querySelector('#cert-copy');
    if (cp) cp.onclick = async () => {
      try { await navigator.clipboard.writeText(short); toast('Copied. Paste it where you like.'); }
      catch { const t = el.querySelector('.cert-short-text'); const r = document.createRange(); r.selectNodeContents(t); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); toast('Selected. Copy it from here.'); }
    };
    const rn = el.querySelector('#cert-rename');
    if (rn) rn.onclick = () => { const box = el.querySelector('.cert-again'); box.innerHTML = nameFormHTML(c, true); wireName(el, c); box.querySelector('#cert-name').focus(); box.querySelector('#cert-cancel').onclick = () => { box.innerHTML = ''; }; };
  });
}

function wireName(el, c) {
  const form = el.querySelector('#cert-name-form'); if (!form || form.dataset.wired) return;
  form.dataset.wired = '1';
  form.onsubmit = async e => {
    e.preventDefault();
    const name = form.querySelector('#cert-name').value.replace(/\s+/g, ' ').trim();
    const msg = form.querySelector('.cert-msg'), btn = form.querySelector('button[type=submit]');
    if (name.length < 2 || /[<>{}]/.test(name)) { msg.textContent = 'Type your name the way it should print, with letters only.'; return; }
    if (membership.setDemoCertName(name)) { toast('Demo: the name is on the sheet, not saved'); return; } // ?demo=certified on localhost
    const sb = auth.client();
    if (!sb || !auth.user) { msg.textContent = 'Sign in again to save your name.'; return; }
    btn.disabled = true; btn.textContent = 'Saving…'; msg.textContent = '';
    let r;
    try { r = await sb.rpc('set_certificate_name', { p_name: name }); } catch (err) { r = { error: err }; }
    if (r.error || r.data?.error) {
      console.warn('set_certificate_name', r.error || r.data);
      btn.disabled = false; btn.textContent = 'Put it on my certificate';
      if (r.data?.error === 'name') { msg.textContent = 'Use 2 to 80 letters for the name.'; return; }
      if (r.data?.error === 'signin') { msg.textContent = 'Sign in again to save your name.'; return; }
      msg.innerHTML = `We could not save it just now. Try again in a minute, or <a href="${mailto(SUPPORT_EMAIL, 'The name on my certificate', `Hi, please put this name on my certificate: ${name}\n\nCertificate no. ${c.cert_id}`)}">email us the name</a>.`;
      return;
    }
    toast('Saved. Here is your certificate.');
    membership.load(); // the page draws again with the name on it
  };
}

// ───────── #/certificate/listing ─────────
const TRAVEL = ['5 miles', '10 miles', '25 miles', 'I host the class'];
function listingPage(app) {
  const s = membership.state(), c = s.cert;
  const sent = c.listing_requested_at ? new Date(c.listing_requested_at) : null;
  const ages = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const sel = (id, opts, val, label) => `<select id="${id}" aria-label="${label}">${opts.map(o => `<option value="${o}"${String(o) === String(val) ? ' selected' : ''}>${o === 13 ? '13+' : o}</option>`).join('')}</select>`;
  const el = h(`<div class="cert-page list-page">
    ${crumbs(HOME, COURSE, `<a href="${ROUTE}">Certificate</a>`, 'Get listed')}
    <section class="page-head"><div>
      <span class="eyebrow green">The instructor directory</span>
      <h1>Get listed</h1>
      <p class="lede">Parents search the directory by state, city or ZIP. Fill this in once. We read every listing before it goes live.</p>
    </div></section>
    ${sent && !Number.isNaN(+sent) ? tip(`You sent your listing on ${sent.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}. Send it again to change something.`, 'game', 'We have it') : ''}
    <form class="try-box list-form" id="list-form" novalidate>
      <div class="field"><label for="l-name">Name as it should appear</label><input id="l-name" type="text" maxlength="80" required value="${esc(c.full_name || '')}"><div class="help">First name and last initial, or your full name.</div></div>
      <div class="field"><label for="l-cert">Certificate number</label><input id="l-cert" type="text" value="${esc(c.cert_id || '')}" readonly></div>
      <div class="two-col list-two">
        <div class="field"><label for="l-email">Email for parent messages</label><input id="l-email" type="email" autocomplete="email" required value="${esc(s.email || '')}"><div class="help">Stays hidden. We pass messages on.</div></div>
        <div class="field"><label for="l-phone">Phone (optional)</label><input id="l-phone" type="tel" autocomplete="tel" maxlength="20"><div class="help">Stays hidden.</div></div>
      </div>
      <div class="list-where">
        <div class="field"><label for="l-city">City</label><input id="l-city" type="text" autocomplete="address-level2" maxlength="80" required></div>
        <div class="field"><label for="l-state">State</label><select id="l-state" required><option value="">Pick one</option>${Object.entries(STATES).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}</select></div>
        <div class="field"><label for="l-zip">ZIP</label><input id="l-zip" type="text" inputmode="numeric" autocomplete="postal-code" maxlength="5" required></div>
      </div>
      <div class="field"><span class="lbl">I teach</span><div class="list-checks"><label class="xo"><input type="checkbox" id="l-in" checked><span class="xo-t">In person</span></label><label class="xo"><input type="checkbox" id="l-on"><span class="xo-t">Online</span></label></div></div>
      <div class="field"><label for="l-travel">How far I travel (in person)</label><select id="l-travel">${TRAVEL.map(t => `<option>${t}</option>`).join('')}</select></div>
      <div class="field"><span class="lbl">Ages I take</span><div class="list-ages">From ${sel('l-from', ages, 7, 'Youngest age')} to ${sel('l-to', ages, 11, 'Oldest age')}</div></div>
      <div class="field"><label for="l-format">Class format, one line</label><input id="l-format" type="text" maxlength="80" required placeholder="Small group, weekly, 45 minutes"></div>
      <div class="two-col list-two">
        <div class="field"><label for="l-next">Next class starts (optional)</label><input id="l-next" type="date"></div>
        <div class="field"><label for="l-price">Price from, $ a class (optional)</label><input id="l-price" type="text" inputmode="numeric" maxlength="4"></div>
      </div>
      <div class="field"><label for="l-about">About you</label><textarea id="l-about" maxlength="300" rows="4" required placeholder="Two or three sentences, in your own words: who you are and why you teach."></textarea><div class="help"><span id="l-left">300</span> letters left. Only what is true. No promises about grades or speed.</div></div>
      <div class="field"><label for="l-url">Booking link (optional)</label><input id="l-url" type="url" inputmode="url" placeholder="https://"><div class="help">Starts with https. Parents tap it to book.</div></div>
      <p class="small muted">A photo (optional): head and shoulders, adults only. Attach it to the email that opens after you send.</p>
      <label class="xo list-agree"><input type="checkbox" id="l-agree" required><span class="xo-t">I agree to the instructor agreement and the badge rules.</span></label>
      <div class="btn-row"><button class="btn big green" type="submit">Send my listing</button></div>
      <div class="list-msg" aria-live="polite"></div>
    </form>
  </div>`);
  app.appendChild(el);
  const $ = id => el.querySelector(`#${id}`);
  const about = $('l-about'), left = $('l-left');
  about.oninput = () => { left.textContent = String(300 - about.value.length); };
  const form = $('list-form'), msg = el.querySelector('.list-msg');
  form.onsubmit = async e => {
    e.preventDefault();
    const v = k => $(k).value.trim();
    const inPerson = $('l-in').checked, online = $('l-on').checked;
    const from = Number(v('l-from')), to = Number(v('l-to'));
    const url = v('l-url'), price = v('l-price').replace(/\D/g, '');
    const problems = [];
    if (!v('l-name')) problems.push('your name');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v('l-email'))) problems.push('an email for parent messages');
    if (v('l-phone') && !/^[0-9 +().-]{7,30}$/.test(v('l-phone'))) problems.push('a phone number with digits only (or leave it empty)');
    if (!v('l-city') || !v('l-state') || !/^\d{5}$/.test(v('l-zip'))) problems.push('your city, state and ZIP');
    if (!inPerson && !online) problems.push('in person, online, or both');
    if (from > to) problems.push('the ages (the first must be the youngest)');
    if (!v('l-format')) problems.push('the class format');
    if (!v('l-about')) problems.push('a few words about you');
    if (url && !/^https:\/\/[^\s<>"]+$/i.test(url)) problems.push('a booking link that starts with https');
    if (price && Number(price) > 1000) problems.push('a price from 0 to 1000 dollars');
    if (!$('l-agree').checked) problems.push('the tick for the agreement');
    if (problems.length) { msg.innerHTML = tip(`Please add ${problems.join(', ')}.`, 'warn', 'Almost'); return; }
    // The fields request_listing takes (supabase/certification.sql); it knows the certificate from the account.
    const listing = { name: v('l-name'), city: v('l-city'), state: v('l-state'), zip: v('l-zip'), in_person: inPerson, online,
      travel: inPerson ? (/host/i.test(v('l-travel')) ? 'hosts' : v('l-travel')) : null, ages: [from, to], format: v('l-format'),
      next_class: v('l-next') || null, price_from: price ? Number(price) : null, about: v('l-about').slice(0, 300), contact_url: url || null, agree: true };
    const contact = { email: v('l-email').toLowerCase(), phone: v('l-phone') || null };
    const teach = inPerson && online ? 'both' : inPerson ? 'in person' : 'online';
    const body = listingEmail({ name: listing.name, cert_id: c.cert_id, email: contact.email, phone: contact.phone || '', where: `${listing.city}, ${listing.state} ${listing.zip}`,
      travel: inPerson ? v('l-travel') : '', teach, ages: `${from} to ${to}`, format: listing.format, next_class: listing.next_class || '', price_from: listing.price_from ? `$${listing.price_from}` : '', about: listing.about, contact_url: listing.contact_url || '' });
    const mail = mailto(SUPPORT_EMAIL, `Directory listing: ${listing.name} (${c.cert_id})`, body);
    const btn = form.querySelector('button[type=submit]');
    const done = (saved, note) => {
      btn.disabled = false; btn.textContent = 'Send it again';
      msg.innerHTML = `${tip(note, saved ? 'game' : 'parent', saved ? 'Sent' : 'One more step')}<div class="btn-row"><a class="btn blue" href="${mail}">Open the email to us</a></div><p class="small muted">Add your photo to the email if you have one.</p>`;
    };
    if (membership.demo) { done(false, 'Demo: nothing was saved. The email below is what an instructor sends us.'); return; }
    const sb = auth.client();
    btn.disabled = true; btn.textContent = 'Sending…'; msg.innerHTML = '';
    let r = { error: 'not signed in' };
    if (sb && auth.user) { try { r = await sb.rpc('request_listing', { p_listing: listing, p_contact: contact }); } catch (err) { r = { error: err }; } }
    if (r.data?.error === 'field') {
      // The server turned one field down: say which, and let them fix it before anything goes out.
      const F = { name: 'the name', city: 'the city', state: 'the state', zip: 'the ZIP', format: 'the class format', about: 'the about text', contact_url: 'the booking link', ages: 'the ages', travel: 'how far you travel', next_class: 'the next class date', price_from: 'the price', email: 'the email', phone: 'the phone' };
      btn.disabled = false; btn.textContent = 'Send my listing';
      msg.innerHTML = tip(`Please check ${F[r.data.field] || 'the form'} and send again.`, 'warn', 'Almost');
      return;
    }
    if (r.error || r.data?.error) {
      console.warn('request_listing', r.error || r.data);
      done(false, r.data?.error === 'wait' ? 'You sent a few already today, so this one was not saved here. The email below still reaches us.' : 'We could not save it here just now, but the email works the same. Send it and we take it from there.');
    } else {
      done(true, 'Thank you. We have your listing and read it before it goes live. Your email app opens now with the same details: send it so we hear from you.');
      membership.load();
    }
    location.href = mail; // the notice to us, already filled in (also the way in if the save failed)
  };
}

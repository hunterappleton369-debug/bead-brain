// owned.js — "What you own": one list, drawn by the account page (#/account, ownedHTML in js/account.js) and by
// the welcome panel at the top of #/family (js/app.js). It comes from the three rows js/membership.js reads:
// purchases (the kit, the Playbook), memberships (University, the instructor year) and cert_certificates.
import { esc, shortDay } from './ui.js';
import { membership, instructor } from './membership.js';
import { hasAudio } from './playbook.js';

// The instructor year: free University access that ends with the year (it does not renew).
export const freeYearLine = s => { const d = s.cancelAt || s.periodEnd; return `Your University access is free for a year with your certification${d ? `, until ${shortDay(d)}` : ''}. After that you can rejoin at the member rate any time.`; };

// The University line: [chip color, chip text, one plain sentence], or null without a membership row.
export function uniState(s) {
  switch (s.status) {
    case 'trialing':
      if (s.cancelAt) return ['blue', 'Test drive, cancelled', `Open until ${shortDay(s.cancelAt)}. No charge.`];
      if (s.trialOver || !s.trialDay) return ['blue', 'Test drive', 'Your billing page shows the first charge.'];
      return ['blue', `Test drive · day ${s.trialDay} of 14`, `Free through ${shortDay(s.lastFreeDay)}.`];
    case 'active':
      if (s.plan === 'instructor') return ['green', 'Free year', freeYearLine(s)];
      if (s.cancelAt) return ['green', 'Cancelled', `Open until ${shortDay(s.cancelAt)}.`];
      return ['green', 'Active', s.periodEnd ? `Next charge ${shortDay(s.periodEnd)}.` : `$${s.price} a month.`];
    case 'past_due': return ['red', 'Payment missed', 'Update your card below.'];
    case 'paused': return ['yellow', 'Paused', s.pausedUntil ? `Starts again ${shortDay(s.pausedUntil)}.` : 'Nothing is charged.'];
    case 'canceled': return ['purple', 'Ended', s.keepsLibrary ? 'The library is yours to keep.' : 'Nothing more is charged.'];
  }
  return null;
}

// [{ key, title, meta, chip?, links: [{ href, label, audio? }] }] in the order a parent meets them.
export function ownedItems(s = membership.state()) {
  const can = f => membership.can(f), out = [];
  if (s.kit) out.push({ key: 'kit', title: 'Abacus kit', meta: `The abacus, on its way.${s.kitPaidAt ? ` Ordered ${shortDay(s.kitPaidAt)}.` : ''}`, links: [{ href: '#/quickstart', label: 'Your 3-Night Quick-Start' }] });
  if (can('playbook')) out.push({ key: 'playbook', title: 'Child Prodigy Secrets Playbook',
    meta: s.boughtPlaybook ? 'The Playbook and the audiobook, ready to read and listen to here.' : 'Comes with your membership. Read it here.',
    links: [{ href: '#/playbook', label: 'Open the Playbook' }, { href: '#/playbook/listen', label: 'Listen', audio: true }] });
  const uni = uniState(s);
  if (uni) out.push({ key: 'university', title: 'Child Phenom University', meta: uni[2], chip: uni, links: [] });
  if (can('bonus')) out.push({ key: 'bonus', title: 'Two bonus guides', meta: 'Valedictorian Secrets and Win the Future. Read them here.',
    links: [{ href: '#/bonus/valedictorian', label: 'Valedictorian Secrets' }, { href: '#/bonus/future', label: 'Win the Future' }] });
  if (can('course')) out.push({ key: 'course', title: 'Instructor course', meta: '20 lessons and one test. Go at your own pace.', links: [{ href: '#/course', label: 'Open the course' }] });
  if (can('kit')) out.push({ key: 'launch-kit', title: 'Instructor Launch Kit', meta: 'Class plans, a price sheet, a parent flyer and more. Print what you need.', links: [{ href: '#/kit', label: 'Open the Launch Kit' }] });
  if (s.certified) out.push({ key: 'certificate', title: 'Your certificate', meta: `Certificate no. ${esc(s.cert.cert_id || '')}.${s.cert.passedOn ? ` You passed on ${shortDay(s.cert.passedOn)}.` : ''}`, links: [{ href: '#/certificate', label: 'See and print it' }] });
  else if (can('exam')) out.push({ key: 'certificate', title: 'Your certificate', meta: 'It is yours when you pass the test.', links: [{ href: '#/exam', label: 'Pass the test' }] });
  if (s.certified) out.push({ key: 'directory', title: 'Directory listing', meta: s.cert.listing_requested_at ? 'We have your listing. We read each one before it goes live.' : 'Send your listing so parents near you can find you.',
    links: [{ href: '#/certificate/listing', label: s.cert.listing_requested_at ? 'Send a change' : 'Send your listing' }, { href: '#/instructors', label: 'The directory' }] });
  else if (instructor(s)) out.push({ key: 'directory', title: 'Directory listing', meta: 'Pass the test, then send your listing.', links: [{ href: '#/instructors', label: 'The directory' }] });
  return out;
}

// One item's links. A "Listen" link waits hidden until revealAudio() knows the audiobook is there.
export const linksHTML = (it, cls = 'link-arrow own-go') => it.links.map(l => `<a class="${cls}" href="${l.href}"${l.audio ? ' data-audio hidden' : ''}>${l.label}</a>`).join('');
export function revealAudio(root) { hasAudio().then(ok => { if (ok && root.isConnected) root.querySelectorAll('[data-audio]').forEach(a => { a.hidden = false; }); }).catch(() => {}); }

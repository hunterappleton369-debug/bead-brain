// config.js — public settings for the parent accounts (Supabase project "child-phenoms").
// Both values are safe to commit: the publishable key only lets the browser do what the
// row-level-security policies in supabase/schema.sql allow. Leave both empty and the site
// runs exactly as before, with progress kept in this browser only.
export const SUPABASE_URL = 'https://fndemnipqtpmuvcidcxo.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_v_KV6B8ZMQ4BwHa66F6JyQ_S2JYjRA9';

// Billing — the account page (#/account). The site is static, so "Manage billing" and "Cancel" open
// Stripe's hosted customer portal. Who is a member comes from the `memberships` table
// (supabase/memberships.sql), not from here. Steps for both: docs/APP-DELIVERY.md.
// [HUNTER] Paste the portal's login link (Stripe → Settings → Billing → Customer portal → "Login link",
// it looks like https://billing.stripe.com/p/login/...). Empty: the billing buttons email support instead.
export const STRIPE_PORTAL_URL = 'https://billing.stripe.com/p/login/cNicMY0ISck62iLdo9eZ200'; // LIVE portal login link of the Stripe account behind Child Phenoms (decided 2026-10-22)
export const SUPPORT_EMAIL = 'hello@childphenoms.com';
export const MEMBER_PRICE = 67;                       // $ a month after the 14-day test drive (free-abacus/university.html)
export const JOIN_URL = 'free-abacus/';               // where someone without a membership starts
export const CERTIFY_URL = 'free-abacus/certify.html'; // the certification offer, linked from the instructor directory
export const UNIVERSITY_URL = 'free-abacus/university.html'; // the 14-day test drive; stages 2 to 10 send non-members here

// The Playbook (#/playbook): Child Prodigy Secrets Playbook, the $27 add-on on the Child Prodigy Starter Kit order
// form, also free for Child Phenom University members. Who may read it comes from the `purchases` and `memberships` tables.
// The audiobook plays chapter by chapter from library/audio/playbook/index.json and the MP3s beside it. Without
// those, the one hosted MP3 link below plays instead. Empty, and no index: the page says the audiobook is not ready yet.
export const PLAYBOOK_AUDIO_URL = '';
export const PLAYBOOK_PRICE = 27;

// The instructor course (#/course/<n>, js/course.js): one video per lesson. A YouTube or Vimeo link plays in a
// 16:9 player; a link to an .mp4 plays in the browser's own player. Empty: the lesson says the video is on its
// way, and the words on the page are the same lesson.
// [HUNTER: paste when ready] the link for each lesson, e.g. L01: 'https://youtu.be/…'
export const COURSE_VIDEO_URLS = {
  L01: '', L02: '', L03: '', L04: '', L05: '', L06: '', L07: '', L08: '', L09: '', L10: '',
  L11: '', L12: '', L13: '', L14: '', L15: '', L16: '', L17: '', L18: '', L19: '', L20: '',
};
// The certificate (#/certificate, js/certificate.js): a picture of Hunter's signature (a transparent PNG or SVG,
// about 600 × 200), e.g. 'img/signature.png'. Empty: the certificate prints a signature line instead.
// [HUNTER: paste when ready]
export const CERT_SIGNATURE_URL = '';

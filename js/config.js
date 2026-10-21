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
export const STRIPE_PORTAL_URL = '';
export const SUPPORT_EMAIL = 'hello@childphenoms.com';
export const MEMBER_PRICE = 67;                       // $ a month after the 14-day test drive (free-abacus/university.html)
export const JOIN_URL = 'free-abacus/';               // where someone without a membership starts
export const CERTIFY_URL = 'free-abacus/certify.html'; // the certification offer, linked from the instructor directory

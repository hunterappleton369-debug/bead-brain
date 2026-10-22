// Funnel configuration. Fill these in before running traffic.
// Payment: the site is static, so each "Complete order" button sends the parent to a hosted checkout
// (a Stripe Payment Link, or the matching ClickFunnels order page). Leave empty to preview the funnel
// end to end without charging anyone.
export const CONFIG = {
  shipping: 9.95,                 // what the parent pays on the free kit
  bumpPrice: 27,                  // Child Prodigy Secrets Playbook (printed) + audiobook + digital copy
  checkoutUrl: 'https://buy.stripe.com/test_fZu28l2Fy9fO2Ctcr3efC00',                // Stripe Payment Link A: kit ($9.95 shipping and handling), US shipping address; after payment redirect to university.html?paid=kit
  checkoutUrlWithBump: 'https://buy.stripe.com/test_9B65kxcg89fO5OFfDfefC01',        // Stripe Payment Link B: kit + $27 Playbook, same redirect (both links required; a Shopify /cart/ link also works and gets name/email/phone prefilled)
  universityTrialUrl: 'https://buy.stripe.com/test_cNi6oBbc4fEcb8Z8aNefC02',         // Stripe Payment Link: $67/mo with a 14-day trial; after payment redirect to certify.html?paid=university
  certifyUrl: 'https://buy.stripe.com/test_6oUbIV2FyeA85OF62FefC03',                 // Stripe Payment Link: $297 once; after payment redirect to thanks.html?paid=certify
  metaPixelId: '1239441998349754', // Meta Pixel (dataset) ID. Hunter's call 2026-10-21: the Enamelogic pixel, shared. Empty = no pixel loads. Disclosed in the privacy policy.
  leadWebhook: '',                // optional: POST step-1 contact info here (Zapier/Make/CF webhook) for abandon follow-up
  supportEmail: 'hello@childphenoms.com',
  shipDays: '2–3 business days',
};

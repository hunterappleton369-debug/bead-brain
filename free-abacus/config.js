// Funnel configuration. Fill these in before running traffic.
// Payment: the site is static, so each "Complete order" button sends the parent to a hosted checkout
// (a Stripe Payment Link, or the matching ClickFunnels order page). Leave empty to preview the funnel
// end to end without charging anyone.
export const CONFIG = {
  shipping: 9.95,                 // what the parent pays on the free kit
  bumpPrice: 27,                  // Child Prodigy Secrets Playbook (printed) + audiobook + digital copy
  checkoutUrl: '',                // kit + shipping: Shopify cart permalink https://STORE.myshopify.com/cart/KIT_VARIANT:1
  checkoutUrlWithBump: '',        // kit + shipping + Playbook: https://STORE.myshopify.com/cart/KIT_VARIANT:1,PLAYBOOK_VARIANT:1 (both links required)
  universityTrialUrl: '',         // Stripe Payment Link: $67/mo with a 14-day trial; after payment redirect to certify.html?paid=university
  certifyUrl: '',                 // Stripe Payment Link: $297 once; after payment redirect to thanks.html?paid=certify
  metaPixelId: '',                // [HUNTER] Meta Pixel (dataset) ID from Events Manager. Empty = no pixel loads. Disclose it in the privacy policy.
  leadWebhook: '',                // optional: POST step-1 contact info here (Zapier/Make/CF webhook) for abandon follow-up
  supportEmail: 'hello@childphenoms.com',
  shipDays: '2–3 business days',
};

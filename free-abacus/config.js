// Funnel configuration. Fill these in before running traffic.
// Payment: the site is static, so each "Complete order" button sends the parent to a hosted checkout
// (a Stripe Payment Link, or the matching ClickFunnels order page). Leave empty to preview the funnel
// end to end without charging anyone.
export const CONFIG = {
  shipping: 9.95,                 // what the parent pays on the free kit
  bumpPrice: 27,                  // Prodigy Maker Workbook + Audiobook
  checkoutUrl: '',                // kit + shipping  (Stripe Payment Link or CF checkout)
  checkoutUrlWithBump: '',        // kit + shipping + bump
  universityTrialUrl: '',         // 14-day free test drive, then $67/mo (Stripe subscription link with trial)
  certifyUrl: '',                 // $297 one-time
  leadWebhook: '',                // optional: POST step-1 contact info here (Zapier/Make/CF webhook) for abandon follow-up
  supportEmail: 'hello@childphenoms.com',
  shipDays: '2–3 business days',
};

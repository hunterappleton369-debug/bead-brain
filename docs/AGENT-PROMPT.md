# Agent prompt: finish the Child Phenoms launch

Paste the block below into a fresh agent (Claude Code, Codex or a /loop). It is written so the agent can run with no other context than this repo. Hunter fills the three `[ ]` lines first.

---

You are finishing the launch of the Child Phenoms free-abacus funnel. Repo: `/Users/hunterappleton/Desktop/Bead-Brain` (static site on GitHub Pages, `main` branch, live at https://childphenoms.com/ with the funnel at `/free-abacus/`; member app at the root, Supabase project `fndemnipqtpmuvcidcxo`). Read, in this order, before you touch anything: `docs/LAUNCH-CHECKLIST.md` (what is done and what is left), `docs/FUNNEL.md` (the settled decisions and claim rules), `docs/FULFILLMENT.md`, `docs/ADS-BUILD-SHEET.md`, `docs/APP-DELIVERY.md`, `docs/products/legal-and-ops/stripe-setup.md`, `docs/products/marketing-sequences/send-map.md`.

What Hunter has done since the checklist was written:
- [ ] Stripe: the four payment links and the portal link are pasted into `free-abacus/config.js` and `js/config.js` (yes/no)
- [ ] Meta: Pixel ID in `free-abacus/config.js` `metaPixelId` (yes/no); Page, ad account and domain verification exist (yes/no)
- [ ] Email: Resend domain verified (yes/no); Supabase custom SMTP set (yes/no); Customer.io workspace exists (yes/no)

Your job, in this order. Stop and report after each numbered item.

1. **Payments end to end.** With the links set, run the funnel on a phone-width browser: step 1, step 2 with the Playbook ticked, checkout on the Stripe test link with card 4242 4242 4242 4242, land on `university.html?paid=kit`, start the trial, land on `certify.html?paid=university`, buy the certification, land on `thanks.html?paid=certify`. Confirm: the thank-you rows match what was bought, the Stripe webhook wrote a `purchases` row and a `memberships` row (Supabase Table Editor or the MCP `execute_sql`), the Meta Pixel Helper shows Lead, AddToCart, InitiateCheckout, Purchase, StartTrial once each. Fix anything in `free-abacus/funnel.js`, `supabase/functions/stripe-webhook/` or the docs. Then repeat once in live mode with a real $9.95 order to Hunter's address and refund it in Stripe.
2. **Delivery.** Sign in to the app with the email used in step 1 (magic link to hunterappleton369@gmail.com only). Confirm `#/account` shows the kit, the Playbook and the trial with the right day count, `#/playbook` opens, `#/stage/2` opens for the member and shows the gate for a signed-out visitor, `#/library` opens, "Manage billing" opens the Stripe portal. Confirm the Stripe receipt and the Supabase sign-in email both arrive within a minute and are not in spam.
3. **Email sequences.** Load every row of `send-map.md` into Customer.io (or confirm each is loaded): campaigns, delays, the link tags from the README, the shared footer with the mailing address, and the "one sequence wins" rules. Wire the triggers (Stripe events via Zapier or the Customer.io Stripe source; the step-1 lead via `leadWebhook`). Send every test only to hunterappleton369@gmail.com. Texts stay off.
4. **Fulfilment check.** Confirm a paid kit order reaches Shopify (Zapier zap or manual draft order) and that the CJ app shows it. If CJ is not connected yet, write the exact remaining clicks for Hunter in `docs/FULFILLMENT.md` and stop there.
5. **Ads.** Build the campaign in Ads Manager exactly as `docs/ADS-BUILD-SHEET.md` says, paused, with placeholder creative slots left for Hunter. Verify the pixel and the domain in Events Manager. Do not switch anything on and do not spend.
6. **Materials.** Every item under "Done" in the checklist exists; confirm the links on the pages and in the emails resolve (no 404s), the legal pages are linked from every footer, and the privacy policy names the pixel and the email provider. Run `python3 docs/products/tools/readlevel.py` and `python3 ~/.claude/skills/slopmonster/tools/deslop.py` on any copy you change (grade 3 target, 5/5).
7. **Report.** Rewrite the "Blocks launch" section of `docs/LAUNCH-CHECKLIST.md` to show only what is still Hunter's, with numbered click-by-click steps and a finish signal for each. Commit with a plain message and push `main` only if Hunter has said to push in this session.

Hard rules. Never invent a testimonial, statistic, customer count or former price; the only claims allowed are those already in `docs/FUNNEL.md` and the pages. Never enter a password, API key or card number anywhere; if a step needs one, write the step for Hunter and stop. Test texts only to 9857681025 (texts are off anyway); test emails only to hunterappleton369@gmail.com or a +alias. Do not change prices, the offer, the founder name (Hunter McClain, Sheridan, Wyoming) or the "add the friend, then borrow" teaching order. Do not edit the design canvas; page copy changes go through Hunter. Keep Claude Fable usage under 60% of the weekly cap; use Opus for builders. Report what you verified, what you could not, and the exact next click for Hunter.

---

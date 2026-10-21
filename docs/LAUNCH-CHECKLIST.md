# Launch checklist: free abacus funnel

Status on 2026-10-21, after the final copy pass. "Done" means it exists in the repo and was tested in a browser. "You" means only Hunter can do it. Items are in the order they should happen.

## Done

- Funnel pages (`free-abacus/index.html`, `university.html`, `certify.html`, `thanks.html`) match the design canvas: urgency box, red order form under the kit photo, green ClickFunnels-style "yes" buttons with red "no" links, bundle shots, red value stacks, seven public comments on page 1, video-rights line under the clips. Tested at phone width: form step 1 to 2, bump total, preview walk through all four pages, sticky bar, no console errors, no broken local files.
- Product images regenerated to match the real abacus; University bundle shot reads "100+ Lessons & Drills".
- Materials under `docs/products/`: two bonus guides, the lesson library, 86 practice sheets, the 20-lesson certification course with exam, instructor launch kit, 41 emails + 5 texts + 5 ad angles, legal and ops pages. All teach the agreed borrow order; founder name, lesson count and certification-for-life wording are settled.
- App: account and billing page, member library with print-on-demand sheets, public instructor directory (`docs/APP-DELIVERY.md`).
- Videos: the Little Big Shots clip embeds from the show's official YouTube channel; PBS NOVA and Guinness are links to their own pages. No footage is copied or re-hosted. The comments on page 1 are quoted public comments about abacus videos, named by first name and platform, with no avatars, and the page says they are not about the kit.

## Blocks launch (do these before any ad runs)

1. **Payment links (you).** `free-abacus/config.js` has four empty links: kit, kit + bump, University trial, certification. Until they are filled, every "yes" button only walks to the next page. Set up Shopify + CJ for the kit per `docs/FULFILLMENT.md`, and Stripe for the subscription and the certification per `docs/products/legal-and-ops/stripe-setup.md`. Then the Stripe customer-portal link in `js/config.js` and the `memberships` table in Supabase (`docs/APP-DELIVERY.md`).
2. **Fulfilment (you).** Stock in a US warehouse, printed Playbooks and Workbooks at the same warehouse, branded box and welcome card, one test order delivered inside 7 days. Children's Product Certificate from the supplier.
3. **Tracking (needs building).** The funnel has no Meta Pixel and no Conversions API. Add the pixel to the four pages with a Lead event on step 1 and a Purchase event on the thank-you page, and disclose it in the privacy policy. Without it the ads cannot optimise and you cannot see cost per kit.
4. **Legal pages (you + counsel).** Fill the placeholders in `docs/products/legal-and-ops/site/` (entity, state, address, dates), move the four HTML pages to `legal/` on the site, link privacy and terms from every funnel footer, and have counsel read the trial and auto-renewal wording, the children's privacy section and the instructor agreement.
5. **Consent (needs building).** A text-message consent checkbox on step 1 of the order form, a mailing address in the email footer, and SMS campaign registration with your provider before the day-one text goes out.
6. **Email and SMS provider (you).** Connect the provider and the lead webhook (`leadWebhook` in `config.js`), load the sequences from `docs/products/marketing-sequences/send-map.md`, and send every test only to the approved test number and address.
7. **Domain (you).** `childphenoms.com` DNS at GoDaddy still has to point at GitHub Pages, with HTTPS on, before the ad links go out. The thank-you page and the instructor directory link to that domain.
8. **Truth check on the page (you).** Urgency box numbers (1,000 kits, 6 weeks), "ships in 2 to 3 business days by USPS", "7 days or less", "thousands of children", and the 30-day refund and keep-the-kit promises all have to match what fulfilment and the refund policy actually do.
9. **Push (you).** Commit is ready locally; pushing `main` publishes everything on GitHub Pages. The upsell pages are `noindex`; the funnel is unlinked from the home page, so a push before items 1 to 8 only exposes a preview-mode funnel, but do not send traffic until they are done.

## Should happen in the first two weeks

10. **Recordings (you).** The VSL (`docs/VSL-SCRIPT.md`) into the placeholder on page 2; the Playbook audiobook (`docs/products/audiobook-notes.md`); the 20 certification videos; the five ad videos with your own footage and signed releases. Founder photo replaces the "HA" circle.
11. **Print and art (you).** Covers for both bonus guides, the instructor badge, your signature image, PDF renders of the lesson library and guides for the member downloads.
12. **Support (you).** `hello@childphenoms.com` answered within a day, with the macros in `docs/products/legal-and-ops/`; email deliverability set up (Resend) so receipts and magic links land.
13. **Delivery mechanics (built, needs your settings).** Cancel and pause run through the Stripe portal; handouts and the library print from `#/library`; instructor rows are added by hand after each pass.

## Open decisions

- Instructor background checks: required, recommended, or none (agreement §7 placeholder).
- Whether the "keep it even if you cancel" library means the printable pages in `#/library` only, or PDFs too.
- Whether "thousands of children" stays on page 1 and page 2 (it refers to abacus training worldwide, not to Child Phenoms customers; the page should make that clear or the line should go).

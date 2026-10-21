# Launch checklist

Everything that must be true before the first ad runs, in order. Each step has the clicks and a finish signal: when you see it, the step is done.

Time: about two working days of clicks, plus waiting on counsel and on text-message carrier approval (start those first).

## 1. Business basics

1. Decide which entity sells (an LLC is typical) and note its exact legal name and state.
2. Get a mailing address that can go on emails: a PO box, a virtual mailbox or your registered agent's address.
3. Get a support phone number. Stripe requires one, and a Google Voice number works.
4. Search this folder for `[HUNTER: legal entity`, `[HUNTER: mailing address` and `[HUNTER: state` and fill them in.

**Finish signal:** `grep -rn "HUNTER: legal entity\|HUNTER: mailing address" docs/products/legal-and-ops/*.md` prints nothing.

## 2. Make the open decisions

Go through the "Open decisions" list in `README.md` and write your answer into each file in place of the `[HUNTER: …]` marker.

**Finish signal:** `grep -c "\[HUNTER" docs/products/legal-and-ops/{privacy-policy,terms,guarantees,earnings-disclaimer}.md` prints 0 for every file.

## 3. Counsel review

1. Send counsel these files: `privacy-policy.md`, `terms.md`, `guarantees.md`, `earnings-disclaimer.md`, `instructor-agreement.md`, `sms-email-consent.md`.
2. Ask them to look hardest at: the free-trial and auto-renewal wording (terms §5), the COPPA and Colorado minors sections (privacy §5, §11.2), the instructor franchise question (agreement §4), the SMS consent wording, and whether to add arbitration (terms §16).
3. Put their edits into the `.md` files.

**Finish signal:** counsel's written OK, saved next to these files or in your email.

## 4. Publish the legal pages

1. In Terminal:
   ```
   cd ~/Desktop/Bead-Brain/docs/products/legal-and-ops
   python3 tools/build_pages.py --final
   ```
   It refuses to build while any `[HUNTER]` marker is left on a public page, so a draft cannot go live by accident.
2. Make a folder `Bead-Brain/legal/` and copy the four files from `site/` into it.
3. Open `legal/terms.html` through the local server (`node serve.mjs`, then http://localhost:8787/legal/terms.html). The site's paper background and fonts should show.
4. Commit and push.

**Finish signal:** `https://childphenoms.com/legal/terms.html` (or the GitHub Pages address) loads with no yellow highlights and no "Draft" box.

## 5. Link the legal pages in the four funnel footers

In `free-abacus/index.html`, `university.html`, `certify.html` and `thanks.html`, add this line inside `<footer class="fn-foot">`, above the copyright line:

```html
<p><a href="../legal/privacy-policy.html">Privacy</a> · <a href="../legal/terms.html">Terms</a> · <a href="../legal/refund-policy.html">Refunds</a> · <a href="../legal/earnings-disclaimer.html">Earnings disclaimer</a></p>
```

Also add it to the trainer's footer in `index.html`.

While you are in the footers: `university.html`, `certify.html` and `thanks.html` do not carry the Facebook disclaimer. Copy the paragraph from `index.html`'s footer into each.

**Finish signal:** on each of the five pages, all four links open the right page.

## 6. Text consent on the order form

1. Add the checkbox block from `sms-email-consent.md` §2 under the phone field in `free-abacus/index.html`.
2. Fix `funnel.js` so checkboxes save whether they are ticked, not their value. In `orderForm()`, the step-1 line becomes:
   ```js
   $$('input', pane1).forEach(i => data[i.name] = i.type === 'checkbox' ? i.checked : i.value.trim());
   ```
3. Change "We never sell or share your info." under the form to "We never sell your info." The Meta pixel counts as "sharing" under California law, so the old line is not accurate once the pixel is on. [HUNTER: or keep the pixel off the order pages]

**Finish signal:** fill step 1 without ticking the box and the browser's saved lead (DevTools → Application → Local Storage → `cp.funnel.lead`) shows `"sms_ok": false`. Tick it and it shows `true`.

## 7. Stripe

Follow `stripe-setup.md` start to finish.

**Finish signal:** its own finish signal: four live links in `config.js`, and a real $9.95 order refunded.

## 8. Email

1. Pick the tool. Sign-in emails already run through Supabase. Use Resend for them (repo `README.md` → Accounts → Email, steps 1 to 5). For the marketing sequences, pick one tool that does automations and SMS-free email lists [HUNTER: name it. Kit, MailerLite or Brevo all work], and write its name into `privacy-policy.md` §6.
2. In that tool, authenticate `childphenoms.com` (SPF, DKIM, DMARC records at GoDaddy, as the tool shows).
3. Put the mailing address and an unsubscribe link in the email footer template.
4. Load the sequences from `docs/products/marketing-sequences/` when that folder is ready. Add the billing portal link to the welcome and day-13 emails.
5. Connect Stripe to the tool (most have a Stripe integration. Or Zapier "Stripe new customer → add subscriber with tag").

**Finish signal:** a test send to hunterappleton369@gmail.com lands in the Primary inbox, and "Show original" in Gmail shows SPF, DKIM and DMARC all "PASS".

## 9. Meta pixel

1. Meta **Events Manager** → **Connect data sources** → **Web** → name it "Child Phenoms" → copy the pixel ID.
2. Add the base code to the `<head>` of the four funnel pages only. **Never** add it to the trainer (`index.html`): children use it.
3. Wrap it so it does not load when the browser sends Global Privacy Control (the privacy policy promises this):
   ```html
   <script>
   if (!navigator.globalPrivacyControl) {
     /* paste Meta's base code here, with your pixel ID */
   }
   </script>
   ```
4. Events (a builder adds these to `funnel.js`, guarded by `window.fbq &&`):
   - `Lead` when step 1 is valid (the `data-next` click)
   - `InitiateCheckout` on the order button (`data-complete`)
   - `Purchase` on `university.html` load only when the URL has `?paid=kit`, with `value` from the saved order total and `currency: 'USD'`
   - `StartTrial` on `certify.html` when `?paid=university`, value 0
   - `Purchase` on `thanks.html` when `?paid=certify`, value 297
5. Events Manager → **Settings** → verify the domain childphenoms.com.
6. Update `privacy-policy.md` §3.5: remove the "pixel not installed yet" marker and list the events. Rebuild the pages (step 4).

**Finish signal:** Events Manager → **Test events** shows PageView, Lead, InitiateCheckout and Purchase from one test run, and none from the trainer.

## 10. Text messages

1. Pick an SMS provider [HUNTER: name it. Twilio, SimpleTexting and the email tool's own SMS all work] and buy one local number.
2. Register for 10DLC in the provider (brand: legal name, EIN, website. Campaign: "marketing + account notifications". Paste the consent wording, a screenshot of the checkbox, and sample texts from `sms-email-consent.md`).
3. Set the STOP and HELP auto-replies and the double opt-in text from `sms-email-consent.md` §5 and §6.
4. Set sending hours to 9 am to 8 pm, recipient's time.
5. Write the provider's name into `privacy-policy.md` §6 and rebuild.

**Finish signal:** the provider shows the campaign "Approved". Texting YES, HELP and STOP from 9857681025 gets the three right replies.

## 11. Kit safety paperwork

The abacus is a children's product you import, which makes you responsible for its US safety rules.

1. Ask the supplier for a **Children's Product Certificate** and the third-party lab test report (from a CPSC-accepted lab) covering lead in paint and materials.
2. Check the abacus and its box carry tracking information (maker, batch, date).
3. Put "Not for children under 3. Small parts." on the box or the insert card.
4. If the supplier cannot provide the certificate, ask counsel before shipping.

**Finish signal:** the certificate and lab report are saved in a folder, and the warning is on the box.

## 12. Fulfilment

1. Stock: count kits on hand [HUNTER], Playbooks, workbooks, mailers, filler.
2. Open a label account (`ops-runbook.md` §3.3), save the box size and weight preset.
3. Set up the order sheet (`ops-runbook.md` §3.2).
4. Do one dry run: pack a kit, weigh it, buy a label to your own address.

**Finish signal:** a kit you mailed to yourself arrives, and the cost per box (label + mailer + contents) is written in the order sheet notes.

## 13. Fix what the pages promise

Each of these is printed on a funnel page today and is not true yet. Fix the thing, or change the words.

| Page says | Reality | Fix |
|---|---|---|
| "102 lessons" (university, certify) | 76 lessons + 28 quest drills | change to "100+ lessons and drills" or add lessons |
| "Cancel any time … from your account page"; "Pause … from your account page" | the trainer has no billing page | add a "Manage billing" link (the portal link) to the trainer's Family or account page. Pause by email (terms §5.6) |
| "Your card is charged $67 and the next stages open up" | the trainer does not lock stages | drop "and the next stages open up", or build a paywall |
| "We never sell or share your info" | the pixel counts as sharing in California | "We never sell your info" (step 6) |
| "Keep the $997 Prodigy Secrets Program" | needs a download link | host the files from `docs/products/prodigy-secrets-program/` and put the link in the welcome email |
| Instructor directory, badge, exam, course | none exist yet | build before the certify page takes money, or pause that upsell |

**Finish signal:** every row is fixed or the page wording changed.

## 14. Test order, end to end

Use test mode first, then repeat once in live mode with your own card. Contacts: email `hunterappleton369@gmail.com`, phone `9857681025`. Never a made-up number.

1. Open `free-abacus/` on your phone, in the Facebook in-app browser if you can (that is where the traffic comes from).
2. Step 1 with the test contacts, tick the text box. Step 2, tick the workbook. Order.
3. Pay $36.95 on Stripe. Land on University. Start the trial. Land on Certify. Buy (test mode only). Land on Thanks.
4. Check, one by one:
   - Stripe: the payments, the trial with its end date, the shipping address, the terms box ticked
   - Inbox: Stripe receipt, welcome email with trainer link, portal link and program download
   - Phone: the opt-in text. Reply YES, then HELP, then STOP. Each reply is right
   - Pixel: Test events shows the run
   - Trainer: sign in at `#/start` with the test email. Add a child. The row appears in Supabase `children`
   - Billing portal: cancel the trial. Stripe shows it cancelled. No charge
   - Refund the payments. Refund emails arrive
5. Delete the test parent from Supabase (`ops-runbook.md` §3.13) to check deletion works.

**Finish signal:** every check above passed in live mode, and the live payments are refunded.

## 15. Go

1. `config.js` has live links, no `test_`.
2. Legal pages live and linked.
3. Ads approved in Meta.
4. For the first 7 days, run the daily 20 minutes (`ops-runbook.md` §2) twice a day.

**Finish signal:** first real order shipped within 3 business days and its tracking email sent.

<!-- status: needs Hunter: every step is Hunter's -->

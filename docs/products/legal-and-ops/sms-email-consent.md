# Text and email consent

The consent wording for the order form, how STOP and HELP work, and the rules every text and email must follow.

Not legal advice. Counsel should approve the checkout wording before ads run.

## 1. The problem on the order form today

The phone field on `free-abacus/index.html` is required, and nothing near it says we will text. Under the federal Telephone Consumer Protection Act (TCPA), marketing texts sent with automated tools need the person's **prior express written consent**, and that consent cannot be a condition of buying. A required phone field with no wording is not consent.

Two fixes, pick one:

1. **Recommended.** Keep the phone field (Stripe and USPS can use it for delivery). Add an unticked checkbox under it for texts. Only text people who tick it.
2. Make the phone field optional and put the consent wording under it, with the line "Consent is not required to buy."

Either way, receipts and shipping notices by email need no extra consent. Marketing texts do.

## 2. Checkout wording (drop in under the phone field)

Checkbox label, unticked by default:

> Text me my order updates and the daily practice tips from Child Phenoms.

Small print under it:

> By checking this box, you agree to receive recurring automated marketing and order texts from Child Phenoms at the number above. Consent is not a condition of purchase. Up to [HUNTER: number] messages a week. Msg and data rates may apply. Reply HELP for help or STOP to cancel. See our [Terms](../legal/terms.html) and [Privacy Policy](../legal/privacy-policy.html).

HTML for the page (Hunter places it, the funnel files are not ours to edit):

```html
<div class="fld sms-consent">
  <label><input type="checkbox" name="sms_ok" value="yes">
    <span>Text me my order updates and the daily practice tips from Child Phenoms.</span></label>
  <p class="fine">By checking this box, you agree to receive recurring automated marketing and order texts from
  Child Phenoms at the number above. Consent is not a condition of purchase. Up to 5 messages a week.
  Msg &amp; data rates may apply. Reply HELP for help or STOP to cancel.
  <a href="../legal/terms.html">Terms</a> · <a href="../legal/privacy-policy.html">Privacy</a></p>
</div>
```

`funnel.js` already copies every named input on step 1 into the lead record and the webhook, so `sms_ok` travels with the lead with no code change. [HUNTER: the checkbox is an `input`, so funnel.js saves its `value` ("yes") whether or not it is ticked; a builder must change that line to save `checked` for checkboxes before launch]

Footer link line for all four funnel pages:

```html
<p><a href="../legal/privacy-policy.html">Privacy</a> · <a href="../legal/terms.html">Terms</a> · <a href="../legal/refund-policy.html">Refunds</a> · <a href="../legal/earnings-disclaimer.html">Earnings disclaimer</a></p>
```

## 3. Proof of consent (keep for 5 years)

For every number we text, keep:

- the phone number and the date and time it was given
- the exact consent wording shown that day (save a copy of the page each time it changes)
- the page URL and the IP address, if the form provider logs it
- every STOP, HELP and opt-in reply, with dates

TCPA claims can be brought for 4 years. Five years of records covers that.

## 4. Message types

| Type | Examples | Consent needed |
|---|---|---|
| Order and account | receipt, shipping and tracking, trial reminder, failed card | email: none beyond the order. Text: the checkbox, or a separate "order texts only" consent |
| Marketing | soap opera emails, daily tips, offers, abandoned-cart | email: may send to buyers and leads with an unsubscribe link (CAN-SPAM). Text: the checkbox, always |

When in doubt, treat a text as marketing.

## 5. The first text (double opt-in)

Send this the moment someone ticks the box, before any other text:

> Child Phenoms: Reply YES to get order updates and daily abacus tips (up to 5/wk). Msg & data rates may apply. Reply HELP for help, STOP to cancel.

Only people who reply YES join the list. This confirms the number belongs to the person who typed it, which protects against wrong numbers, and phone carriers expect it during sign-up checks.

After YES:

> Child Phenoms: You're in. First tip lands tomorrow. Reply HELP for help, STOP to cancel.

## 6. STOP and HELP

Set these as automatic replies in the SMS provider.

**Stop words:** STOP, STOPALL, UNSUBSCRIBE, CANCEL, END, QUIT, and any message that plainly asks to stop ("no more texts", "remove me").

> Child Phenoms: You're unsubscribed and won't get more texts. Reply START to rejoin.

**Help words:** HELP, INFO.

> Child Phenoms: Abacus training for kids. Help: hello@childphenoms.com. Up to 5 msgs/wk. Msg & data rates may apply. Reply STOP to cancel.

Rules:

1. Stop texting a number the moment it opts out. The law gives up to 10 business days; do it at once.
2. If someone asks to stop by email, by phone or by replying in other words, that counts too. Remove them by hand.
3. Opting out of texts does not cancel a membership. If they also want that, follow the cancel steps in `ops-runbook.md`.

## 7. Text sending rules

1. Send between 9 am and 8 pm in the recipient's local time. The federal window is 8 am to 9 pm, and some states (for example Florida and Oklahoma) are stricter, so the narrower window keeps every state covered. Use the shipping address state to pick the time zone.
2. Every text starts with "Child Phenoms:" so the sender is clear.
3. Every marketing text includes the opt-out line (Reply STOP to cancel) at least in the first text and regularly after.
4. Keep texts under 160 characters.
5. No texts about cures, grades or results we cannot back up. Same rules as the ads.
6. Test sends go to 9857681025 only.

### Carrier registration (10DLC)

US phone carriers block business texts from ordinary long-code numbers that are not registered. Before the first send, register the brand and the campaign through the SMS provider. The provider will ask for: legal business name and EIN, website, the consent wording above (with a screenshot of the form), sample messages (use the ones in this file), opt-in and opt-out wording, and expected volume. Approval can take from a few days to a few weeks, so start early.

## 8. Email rules (CAN-SPAM)

1. Every marketing email shows a working unsubscribe link and the business's postal address. [HUNTER: mailing address; a PO box or registered agent address works]
2. Honour unsubscribes at once (the law allows 10 business days).
3. The "From" name is Child Phenoms or Hunter at Child Phenoms. Subject lines must match what the email says.
4. Receipts, sign-in links and billing notices go to everyone, unsubscribed or not, because they are about the order.
5. Set up SPF, DKIM and DMARC on childphenoms.com before sending (steps are in the repo README, Accounts → Email). Gmail and Yahoo require this for bulk senders.
6. Test sends go to hunterappleton369@gmail.com and its + aliases only.

### Double opt-in for email

Buyers do not need it; they gave their email to order. For leads who reach step 1 and do not buy, a confirmation email ("Click to get your free kit reminders") is optional. It lowers list size but improves inbox placement. [HUNTER: decide; recommended off for launch, on if spam complaints rise above 0.1%]

<!-- status: needs Hunter: counsel review of the checkout wording, message cap, SMS provider, mailing address, funnel.js checkbox fix -->

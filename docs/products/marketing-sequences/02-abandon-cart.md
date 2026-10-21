# Abandon cart: three emails and two texts over 48 hours

For parents who filled in step 1 of the kit form (name, email, phone) and did not pay the $9.95 shipping.

## How to run it

- **Trigger:** step-1 lead saved by `leadWebhook`, with no paid order 60 minutes later.
- **Stop rule:** the moment an order comes in, stop this sequence and start `01-kit-buyer-soap-opera.md`.
- **Texts:** only to leads who ticked the text consent line on step 1. [HUNTER: the step-1 form needs a consent line before any text goes out. Wording is in the legal-and-ops folder.]
- **From:** Hunter at Child Phenoms, hello@childphenoms.com
- **Link:** every message points to the kit page, {{link_kit}}. One link per message.

| Order | When | Channel | Job |
|---|---|---|---|
| A1 | 1 hour | Email | Your kit is still here |
| A2 | 3 hours | Text | Short nudge |
| A3 | 24 hours | Email | The "not a math kid" worry |
| A4 | 46 hours | Text | Last nudge |
| A5 | 48 hours | Email | The promise, and the last note |

---

## A1 · email · 1 hour after step 1

- **Subject:** Your kit is still here
- **Preview:** You were one step away.
- **Link:** Finish my order ({{link_kit}})

Hi {{first_name}},

You got as far as step 2, then stopped. That happens. A kid walks in. Dinner burns. The phone rings.

Here is what's waiting for you:

- The Child Phenoms Abacus ($39 value)
- Child Prodigy Secrets: The Playbook ($47 value)

That's $86 of kit for free. You just pay $9.95 shipping. It ships by USPS in 2 to 3 business days.

The Playbook gives you the words to say. The beads do the rest. Your job is a chair beside your child for 15 minutes a day.

[Finish my order]({{link_kit}})

Tomorrow I'll answer the worry I hear most from parents who stop at step 2.

Hunter

---

## A2 · text · 3 hours after step 1

Copy and length check in `08-sms-bank.md` (S2).

> Child Phenoms: Hi {{first_name}}, it's Hunter. Your free abacus kit is saved. Just $9.95 shipping: childphenoms.com/free-abacus Reply STOP to opt out.

---

## A3 · email · 24 hours after step 1

- **Subject:** "My child isn't a math kid"
- **Preview:** I was that kid. Here is what I know now.
- **Link:** Get my free kit ({{link_kit}})

Hi {{first_name}},

When a parent stops at step 2, it's often one of three worries. Here is what I tell each one.

**"My child isn't a math kid."**

There is no such thing. I'm the proof. C's in math. ADHD. Always in trouble. Later, a perfect ACT and a full ride. The beads did not change who I was. They changed how I think. And in a three-year study, ordinary kids who trained on the abacus beat kids who got extra math class.

**"I'm not a math person. I don't have time to teach it."**

You don't teach. You sit beside your child for 15 minutes. The Playbook gives you the words. The free trainer picks each problem and grades it.

**"My child will fight me on it."**

This is math you do with your hands. It feels like a game. Kids who can't sit still often like it most. They push beads. They race the clock. They ask for one more flash round.

If one of those was yours, I hope this helps. The kit is still free. You just pay $9.95 shipping.

[Get my free kit]({{link_kit}})

Tomorrow is my last note about the kit. It's about the promise that comes with it.

Hunter

---

## A4 · text · 46 hours after step 1

Copy and length check in `08-sms-bank.md` (S3).

> Child Phenoms: Last note from Hunter. Your free kit is saved. Try it 30 days or get your shipping back: childphenoms.com/free-abacus Reply STOP to opt out.

---

## A5 · email · 48 hours after step 1

- **Subject:** Last note about your kit
- **Preview:** Try it for 30 days. Not a fit? Shipping back.
- **Link:** Claim my free kit ({{link_kit}})

Hi {{first_name}},

This is my last email about the kit. I don't like to nag.

So here is the promise that comes with it. We call it the Keep-the-Kit Promise.

Try it for 30 days. If your child does not light up on the beads, email us. We refund your shipping. You keep the abacus. You keep the Playbook.

So the most this can cost you is nothing.

Here's what the first week looks like if you say yes:

- **Tonight:** make a profile. Stage 1 opens on the screen abacus.
- **Day 2 or 3:** the box ships.
- **Week one:** your child learns to read a number off the beads at a glance.
- **Week three:** the first "friend" move. Your child does a sum they could not do before, with their own hands.

That week-three moment is the one I remember most from my own story. It's when I started to like it.

[Claim my free kit]({{link_kit}})

If now is not the time, no hard feelings. I'll leave the light on.

Hunter

<!-- status: needs Hunter: add the text consent line to step 1 before texts run; confirm leadWebhook fires to the email tool -->

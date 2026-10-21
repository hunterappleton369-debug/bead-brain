# Shipping and the first week

The tracking email, the "box landed" text, and the reply Hunter sends when a parent writes back with their child's name and age.

## How to run it

- **Tracking email:** fires when the shipping label is bought. Uses the carrier link from the fulfilment tool.
- **Box landed text:** fires on the carrier's "delivered" scan. If the tool cannot read scans, send it 5 days after the label instead.
- **Week-one plan:** a saved reply. Hunter (or the inbox helper) fills in the child's name and picks the age block. Send it within one business day of the parent's reply.
- **From:** Hunter at Child Phenoms, hello@childphenoms.com

---

## Tracking email · when the label is bought

- **Subject:** Your abacus just shipped
- **Preview:** Tracking inside. Stage 1 is open now.
- **Link:** Track my box ({{link_tracking}})

Hi {{first_name}},

Your box is on its way by USPS. Most boxes land within 7 days.

**What's inside:**

- The Child Phenoms Abacus
- The 3-Night Quick-Start Card
- {{if_bump}}The printed Child Prodigy Secrets Playbook. The digital copy and the audiobook are in your parent account, under "What you own."{{end_if}}

[Track my box]({{link_tracking}})

**While you wait:** Stage 1 is open on the screen abacus. Ten minutes tonight makes the wooden one feel familiar the day it arrives.

**When the box lands, do this first:** sit beside your child, not across. Clear the beads together. Then do night 1 on the quick-start card, or open Lesson 1.

I'll text you the day it lands with the one thing to do first.

Hunter

---

## Box landed text · on the delivered scan

Copy and length check in `08-sms-bank.md` (S4).

> Child Phenoms: Your abacus landed! Sit beside your child, clear the beads, open Lesson 1: childphenoms.com/#/stage/1/lesson/hold Reply STOP to opt out.

---

## Week-one plan · Hunter's saved reply

Use this when a parent replies to the welcome email with their child's name and age. Fill in `{{child}}`. Keep the age block that fits and delete the other two.

- **Subject:** Re: your receipt (the plan for {{child}})
- **Link:** Open Lesson 1 ({{link_lesson1}})

Hi {{first_name}},

Thank you for telling me about {{child}}. Here is the plan for the first week.

**The rule for every day:** one lesson at most. Ten problems. Nine right and the lesson is done. Not yet? Same lesson tomorrow. Nobody moves on until it sticks.

**The plan**

- **Day 1.** Lesson 1, "Hold it, clear it, move it." Thumb pushes beads up. Pointer finger pushes them down. Only those two fingers touch the beads.
- **Day 2.** Lesson 2, "Read any number." Watch for the zero in the middle, like 305.
- **Day 3.** Lesson 3, "Read hundreds in a glance." End with the cover trick: set 694, look for two seconds, cover, ask.
- **Day 4.** Lesson 4, "Set numbers fast."
- **Day 5.** Quest day. No new lesson. Two or three short drills in the trainer.
- **Day 6.** Redo the lesson that felt hardest. Then let {{child}} quiz you with the cover trick.
- **Day 7.** Day off. Rest helps the picture set.

**Your two lines for the week**

- When {{child}} gets stuck, ask "Free beads, or friend?" Then wait.
- When {{child}} gets it right, praise the move, not the answer. "I saw you check the tens rod. That was it."

**Age block A, for ages 5 and 6**

Keep each day to ten minutes. Expect this plan to take two weeks, not one. That's normal at this age. If reading the beads has not clicked after a month, put the abacus away for a few months and come back. Nothing is lost.

**Age block B, for ages 7 to 9**

This is the age the kit is built for. Hold to the plan above. If {{child}} passes a lesson on the first try, still stop at one lesson. Add the day's quest instead.

**Age block C, for ages 10 and 11**

{{child}} may fly through the first week. Let them. But hold the line on two things: the two-finger grip and left to right. Fast and sloppy now means slow later. If they pass a lesson on the first try, add the day's quest, not a second lesson.

[Open Lesson 1]({{link_lesson1}})

Send me a video of the cover trick at the end of the week. I watch every one.

Hunter

<!-- status: needs Hunter: connect the fulfilment tool's tracking link and delivered scan; confirm the digital Playbook and the audiobook show under "What you own" for buyers of the $27 add-on -->

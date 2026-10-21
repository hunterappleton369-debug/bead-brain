# Pass Promise: how the coaching works

The runbook for the promise printed on the certification page: "Don't pass the test? We coach you one on one until you do."

## The promise, and what sits next to it

- **Pass Promise.** A candidate who does not pass gets one-on-one coaching until they pass. There is no cap on sessions and no end date.
- **30-day money back.** Separate from the Pass Promise. Any buyer can ask for a full refund in the first 30 days, whether or not they are in coaching. A refund ends course access.
- **The exam itself.** On demand, retake as often as needed, a fresh form each time (`exam.md`, `exam-key.md`, and `node tools/build.mjs --form B` for new forms).

## When coaching starts

Coaching starts at the **second miss**, or at the **first miss if the candidate asks**. After a first miss, most people only need their part scores and a few days with the right lessons. Offering a call at that point anyway costs little and keeps the promise warm.

## The steps

1. **Mark the attempt.** Use `exam-key.md` and its marking rules. Record the form letter, the date, and the score for each part.
2. **Send the result within one business day.** Part scores, pass or not yet, and for each missed question the lesson it comes from. Never send the key or the right answers. (Template 1 below.)
3. **First miss.** The candidate redoes the named lessons and retakes on a fresh form when ready. Include the offer of a call if they want one.
4. **Second miss, or a request.** Send the booking link (Template 2). Offer a first session within five business days.
5. **Run the session.** Thirty minutes on video. The agenda is below.
6. **Set the homework.** Two or three lessons, one drill set, and a retake date no more than 14 days out.
7. **Retake on a fresh form.** If they pass, send the pass email (Template 3) and issue the certificate. If not, book the next session and repeat from step 5.

## The 30-minute session

- **Minutes 0–5: the scores.** Name the part that missed and say it plainly. "Part B was 8 of 14. The misses were both division problems and the ten-row sum."
- **Minutes 5–20: work it live.** The candidate works two or three problems like the ones they missed, on camera, on their soroban. The coach does what the course teaches: asks questions, waits, never gives the answer. "Free beads, or friend?" "Where does that product land?" This is the coaching, and it also shows the candidate the method from the child's side.
- **Minutes 20–27: the plan.** Name the lessons and the drill set. Agree on a retake date.
- **Minutes 27–30: questions.** Anything else, including how they feel about teaching.

## Reading the scores

| Missed part | Usual cause | Send them to |
|---|---|---|
| A (bead moves) | Group mixed up, often big friend vs both at once | L09 and L10, then the L10 drill twice |
| B, stacked sums | A move that is not yet automatic, or lost place on long problems | L05 to L09 drills for the group that slipped; L12 section D for ten-line sums |
| B, × | Products landing one rod off | L15, sections A to C |
| B, ÷ | Too-big guesses not corrected, quotient on the wrong rod | L16, sections B and D |
| B, mental | Picture too small for two rods | L17, sections B and C |
| B, rod traces | Carry or borrow step left out | L07 to L09, section A of each |
| C (scenarios) | Giving answers, or a claim the course forbids | L01, L10, L19; role-play three scenarios in the session |

Part C has a floor for a reason. An instructor who is slow on the beads can still teach a Sprout class well. An instructor who tells a parent the beads raise IQ cannot. If Part C missed on a claims question (27, 31, 32 or 40), spend the whole live block of the next session on the Lesson 1 drill and the parent talk.

## Who coaches

[HUNTER: name the coach. Hunter, or a lead instructor. Suggested bar for a lead instructor: certified, 36 of 40 or better, and at least one full 8-week class run.]

A coach never gives exam answers, never shares the key, never marks a pass that misses the rules, and never talks about income beyond the one line the course allows: "Most instructors land between $20 and $40 a session. Your rates are yours to set."

## Service levels

- Result email: within one business day of the attempt.
- First session offered: within five business days of the second miss or the request.
- Retake window after a session: up to 14 days, longer on request.

[HUNTER: confirm these times, and the scheduling tool for the booking link.]

## Records

Keep one row per candidate. Fields: name, email, purchase date, refund window end date, each attempt (date, form letter, A/B/C scores, result), each session (date, coach, part worked, homework set), pass date, certificate ID.

[HUNTER: decide where this lives (a sheet, the CRM, or the app's database) and who can see it.]

## Edge cases

- **The candidate goes quiet.** After 30 days with no reply, send one friendly note and pause the file. The promise does not expire. They can pick it up any time.
- **They miss Part C twice on claims.** Run a session on Lesson 1 only. They record a new parent talk and send it before the next retake.
- **They dispute a mark.** A second marker checks the paper against the key. The second marker's call stands.
- **They need more time or the questions read aloud.** [HUNTER: set an accommodations policy. Suggested: extra time and read-aloud on request, same questions and pass rules.]
- **They ask for a refund during coaching.** Within 30 days of purchase, refund in full, no questions. After that, the Pass Promise still stands.

## Templates

**Template 1: result, not yet**

> Subject: Your exam result
>
> Hi {{first_name}}, thanks for taking the exam. Here is where you landed: Part A {{a}} of 12, Part B {{b}} of 14, Part C {{c}} of 14. The pass is 32 of 40, with at least 9, 10 and 10 on the three parts, so this one is a "not yet".
>
> The questions you missed come from these lessons: {{lessons}}. Go back through those, redo their drills, and retake whenever you're ready. You'll get a fresh set of problems.
>
> If you'd like to talk it through one on one, reply and I'll send a time. That's the Pass Promise, and it doesn't run out.

**Template 2: booking**

> Subject: Let's get you certified
>
> Hi {{first_name}}, here's the link to book your coaching call: {{booking_link}}. It's 30 minutes on video. Have your soroban with you. We'll work the part that missed, live, and set a short plan and a retake date.

**Template 3: pass**

> Subject: You passed
>
> Hi {{first_name}}, you passed: {{total}} of 40. You're a Certified Phenom Instructor. Your certificate is attached, and your Launch Kit is ready in your account. Start with Lesson 20's first-class plan, and send me a note after your first class.

<!-- status: needs Hunter: name the coach, the scheduling tool, the records location, the accommodations policy, and confirm the service times. -->

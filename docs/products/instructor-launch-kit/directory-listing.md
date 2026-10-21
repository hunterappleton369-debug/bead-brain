# Directory listing and badge

What the Certified Instructor listing shows, the form an instructor fills in to get listed, and the rules for using the badge. This is the $197 "Certified Instructor listing and badge" line on the certification page.

`[HUNTER: directory page does not exist. The certification page promises "your name in the directory parents search". Nothing is built yet: no page, no form, no search, no badge file. This file is the spec for it.]`

## What a listing shows

Each listing is one row in a searchable list. Parents search by ZIP code or city, and can filter for online classes.

| Field on the listing | Example of what shows | Notes |
|---|---|---|
| Name | Jane D. | First name and last initial only by default. Full name if the instructor chooses. |
| Badge | Certified Phenom Instructor | Only shown while the certification is active. |
| Certified since | October 2026 | Month and year the test was passed. |
| Area | Boulder, CO · 80302 | City, state and ZIP. Never a home address. |
| Teaches | In person · Online | One or both. |
| Ages | 7 to 11 | The range the instructor takes. |
| Class format | Small group, weekly, 45 minutes | Free text, one line. |
| Next class starts | November 4 | Optional. Hidden when blank or past. |
| Price | From $25 a class | Optional. The instructor sets it. |
| Contact | "Ask about a class" button | Opens a short form that emails the instructor. The instructor's email and phone stay hidden. |
| About | Two or three sentences | Written by the instructor, checked before it goes live. |
| Photo | Head and shoulders | Optional. Adults only. No children in listing photos. |

## What a listing never shows

- A home address or an exact meeting place. That goes in the enrolment message, after a family signs up.
- Any child's name, photo or score.
- Reviews, ratings or star scores. `[HUNTER: decide if reviews come later; if they do, they need a moderation rule.]`
- Earnings, student counts or results claims.

## The listing form (what the instructor fills in)

Shown once the instructor passes the test. All fields can be changed later from the instructor account.

1. **Name as it should appear** (required). Choice: "First name and last initial" or "Full name".
2. **Email for parent messages** (required, hidden on the listing).
3. **Phone** (optional, hidden on the listing; used by Child Phenoms only).
4. **City, state and ZIP** (required).
5. **How far will you travel?** (optional): 5, 10 or 25 miles, or "I host the class".
6. **I teach:** in person / online / both (required).
7. **Ages I take** (required): from ___ to ___.
8. **Class format** (required, one line, 80 characters).
9. **Next class start date** (optional).
10. **Price from** (optional): $___ a class.
11. **About you** (required, 300 characters). Prompt: "Say who you are and why you teach. Only write what is true. No promises about grades or speed."
12. **Photo** (optional, adults only).
13. **I agree to the instructor agreement and the badge rules** (required checkbox). `[HUNTER: links to the instructor agreement from legal-and-ops.]`

**Review before it goes live.** Someone at Child Phenoms reads the "About you" text and checks the photo before the listing appears. Reject any listing that promises results, names a child, claims earnings or uses the badge as a logo for a different business. `[HUNTER: who does the review, and how fast?]`

## The badge

[art: a round badge, 3px ink outline, flat yellow fill, a small soroban drawn in pencil with green and orange beads in the middle. "CERTIFIED PHENOM INSTRUCTOR" in Unbounded, uppercase, around the top edge. "CHILD PHENOMS" around the bottom. A hard 4px ink offset shadow. No gradients. Two files: full colour PNG with a transparent background, and a one-colour ink version for black-and-white printing.] `[HUNTER: the badge art is not drawn; certificate wording sits in the certification-course folder.]`

### Badge rules

The badge says one thing: this person passed the Child Phenoms certification test and their certification is active. Use it to say that, and nothing more.

**You may:**
- Put the badge on your flyer, near your name.
- Put it on your own website, social profile or email signature, linked to your directory listing.
- Print it on a class sign-up sheet or a progress report.
- Say "Certified Phenom Instructor" next to your name.

**You may not:**
- Change the badge: no new colours, no cropping, no stretching, no added words.
- Make it bigger than your own name or headline. It sits beside your name, not above it.
- Use it as the logo of your class or business, or name your business "Child Phenoms".
- Use it on anything that promises grades, scores, speed or income.
- Use it after your certification lapses or is removed.
- Let anyone else use it, including a helper who is not certified.

**If a rule is broken,** Child Phenoms asks for a fix first. If it is not fixed within 14 days, the listing comes down and the badge licence ends. `[HUNTER: confirm the 14-day window and put it in the instructor agreement.]`

### What happens when it ends

The certification itself is for life, as the certification page says. The listing and the instructor account are what renew. `[HUNTER: decide whether the listing stays live after the first year if the instructor account is not renewed. The page says the account "renews at the member rate after the first year" and does not say what happens to the listing.]`

## What to build (for Hunter)

- A static directory page at `childphenoms.com/instructors` with search by ZIP and an online filter.
- A table in Supabase for listings (fields above), with a `status` of draft, in review, live or removed.
- The "Ask about a class" form, which emails the instructor without showing their address.
- The badge files, and a link to them inside the instructor account.

None of this is built. It is out of scope for this kit.

<!-- status: needs Hunter: directory page does not exist; badge art; review owner; renewal rule -->

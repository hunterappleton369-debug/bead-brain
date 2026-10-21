# Certified Phenom Instructor certificate and badge

The wording for the certificate, the merge fields, the badge art direction, and the rules for using the badge.

## Certificate wording

Print on US Letter, turned sideways (11 × 8.5 inches). Fields in double braces are filled at issue.

> **CHILD PHENOMS**
>
> # Certified Phenom Instructor
>
> This certifies that
>
> ## {{full_name}}
>
> has completed the 20-lesson Certified Phenom Instructor course and passed the certification exam.
>
> They are trained to teach every bead move of the Child Phenoms method, run the daily session and the group class, give the boss tests and the Bead Score, and coach a child through a stuck moment without giving the answer.
>
> Certified on {{date}} · Certificate no. {{cert_id}}
>
> _Certified for life._
>
> {{signature}}
> **Hunter McClain**, Founder, Child Phenoms
>
> <small>Issued by Child Phenoms. This is a course certificate, not an academic degree or a teaching license.</small>

### Merge fields

- `full_name`: as the candidate wants it printed. Ask for it in the pass email.
- `date`: the date of the passing attempt, written out (for example, "March 3, 2027").
- `cert_id`: `CPI-` + year + `-` + a four-digit number in issue order (for example, `CPI-2027-0001`).
- `signature`: Hunter's scanned signature. [HUNTER: supply a signature image.]

### The short version (for the email and the instructor's profile)

> {{full_name}} is a Certified Phenom Instructor. They completed the 20-lesson course and passed the certification exam on {{date}}. Certificate no. {{cert_id}}.

## Certificate layout

Follow `DESIGN.md`. White paper with the faint dot grid. One pop color: blue (`#2457f5`) for the "Phenoms" word and a thin rule. Unbounded 700 for "Certified Phenom Instructor" and the name. Inter for the body. Caveat for "Certified for life." Ink (`#121826`) for text and outlines. No gradients and no frames made of filigree. The badge sits in the lower left, the signature in the lower right, both on the same baseline. One sticker at most: the badge counts as the sticker.

[art: the badge, about 1.6 inches across, lower left. Signature line lower right, with the founder's name and title under it in Inter 14px.]

To render a proof: `npx md-to-pdf instructor-certificate.md` (MIT, https://github.com/simonhaenisch/md-to-pdf). For the real certificate, the designer builds a one-page template from this wording with the fields as text boxes.

## Badge art direction

The badge is a stage-badge style seal, like the stage badges in the app (`js/art.js`).

- **Shape.** A round seal with a 3px ink outline and a hard 4px offset ink shadow, the same depth as a primary button.
- **Center.** One soroban rod, upright: the heaven bead above the beam and four earth beads below, in the formula colors (green, orange, blue, purple, one per bead, heaven bead yellow). Colored-pencil fill texture, ink outlines.
- **Ring text.** "CERTIFIED PHENOM INSTRUCTOR" around the top in Unbounded 700, tight tracking. "CHILD PHENOMS" around the bottom.
- **Ribbon.** A flat yellow (`#ffd23f`) band across the lower third with the year of certification in Unbounded.
- **Colors.** Flat pop colors only. Blue ring fill (`#e8eeff` soft tint) inside the ink outline.
- **Versions.** Full color (SVG and a 1024px PNG with a transparent background), one-color ink (for black-and-white flyers), and a small 64px version where the ring text is dropped and only the rod and ribbon remain.

[art: badge, full color, transparent background, 1024 × 1024. HUNTER: commission or draw; do not generate stock art.]

## Badge rules for instructors

These go in the pass email and the Launch Kit.

- Use the badge next to your own name, on your flyer, your website or your social profile.
- Use the files we send. Don't redraw it, recolor it or crop the ring text.
- The badge says you are certified. It does not say you work for Child Phenoms, and it does not say Child Phenoms sets or backs your prices.
- Use it for yourself only, not for a center or for other teachers who have not certified.
- If your instructor agreement ends, take the badge down. [HUNTER: the instructor agreement is in the legal-and-ops folder. Confirm the revocation terms there.]

## How long it lasts

The certification is yours for life. The instructor account (the software for your own child, with unlimited student profiles) is free for the first year and renews at the member rate after that. You can stop it at any time.

## Listing

When you pass, your name goes in the Certified Instructor directory that parents search. [HUNTER: the directory page does not exist yet. Until it does, the pass email should not promise a listing date.]

<!-- status: needs Hunter: signature image, badge art, directory page, and the revocation terms in the instructor agreement. The wording is ready. -->

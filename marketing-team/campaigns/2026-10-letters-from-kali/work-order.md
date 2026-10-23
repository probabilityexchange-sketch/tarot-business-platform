---
work_order: 2026-10-letters-from-kali-01
campaign: 2026-10-letters-from-kali
created: 2026-10-17
requested_by: Billy
status: open
---

# Work Order: Review and revise the 8 existing Letters from Kali templates in Brevo

## Request (verbatim)
> "have the team review the eight emails against Kali's brand rules" (Billy accepted: "yes")

## Goal
Bring the existing welcome email, six discernment letters and retreat-interest email in line with the brand files so they are ready for Kali's review and, after approval, can be updated as drafts in Brevo.

## Success metric
All 8 pass QA with no claim or compliance issues; Kali approves them with minimal edits. Later: replies to the "you're welcome to reply" prompts, guide-to-booking clicks. [assumption]

## Audience
Free-guide subscribers: reflective professionals and high-achievers in transition. [owner] Brevo list "Kali Meister — Website subscribers" (id 5).

## Offer and CTA
Free three-part discernment guide (already received). Readings CTA only where the source already has one (Letter 06): "Book a Reading" -> https://kalimeister.com/readings (offers.md). Do not add new CTAs.

## Deliverables
| # | Asset | Channel | Owner role | Due |
|---|---|---|---|---|
| 1 | Welcome — "A little room to listen" (Brevo template 8) | email-sequence | email-lifecycle | this run |
| 2 | Letter 01 — A strong feeling (template 1) | email-sequence | email-lifecycle | this run |
| 3 | Letter 02 — What is fear protecting? (template 3) | email-sequence | email-lifecycle | this run |
| 4 | Letter 03 — What do you need to be true? (template 4) | email-sequence | email-lifecycle | this run |
| 5 | Letter 04 — You are allowed to change your mind (template 5) | email-sequence | email-lifecycle | this run |
| 6 | Letter 05 — A boundary can be an act of discernment (template 6) | email-sequence | email-lifecycle | this run |
| 7 | Letter 06 — Make room for a listening practice (template 7) | email-sequence | email-lifecycle | this run |
| 8 | Retreat interest — April 2027 (template 9) | email-broadcast | email-lifecycle | this run |

## Constraints
- REVISE, do not rewrite. These are existing, largely on-voice drafts; preserve Kali's wording wherever it already meets the rules. Change only what the brand files or the known issues require, plus clear editing-pass fixes.
- Known issues to resolve or flag in each: (a) mixed senders (kali@ on 01-03; noreply@ on Welcome, 04-06, Retreat) clash with "you're welcome to reply"; (b) reply-to is billy@randi.agency; (c) footer shows Randi Agency and its address, not Kali Meister; (d) Welcome cites Goddard MFA and UT psychology degrees, which need Kali's confirmation; (e) Welcome says "intuition guide", site says discernment guide.
- Sender, reply-to and footer are Brevo settings, not copy: record a recommended setting per email in a "Brevo settings" block at the top of each draft; do not invent a business address for Kali (gap).
- Keep subject, preheader, eyebrow, H1, body, pull quote, CTA, sign-off structure.
- Hard rules from claims-and-compliance.md apply; reading disclaimer wording is a [gap] — do not invent final wording, flag it.

## Assumptions made at intake
- Recommended default: all 9 Kali emails send from kali@kalimeister.com with reply-to kali@kalimeister.com, so replies reach Kali. [assumption — needs Billy/Kali decision]
- The sequence order is Welcome, 01-06 weekly; Retreat interest is a one-off broadcast. [inference from names/tags]
- Credentials line: recommend removing from the welcome until Kali confirms (owner rule), offering a credential-free alternative.

## Routing plan
brand-brief (orchestrator) -> email-lifecycle drafts all 8 asset folders -> brand-qa-reviewer reviews all 8 -> revision loop if needed -> queue.

## Extra context (Tier 3)
| File | Reason |
|---|---|
| campaigns/2026-10-letters-from-kali/sources/brevo-template-*.md | The existing emails being revised |

## Open questions
- Kali's mailing address for the footer (CAN-SPAM requires a valid physical postal address of the sender). [gap]
- Should replies go to Kali, or keep going to Billy? [gap]
- Reading disclaimer wording. [gap]

---
status: shipped
campaign: 2026-10-letters-from-kali
work_order: 2026-10-letters-from-kali-02
queue_id: Q-20261021-1
brief: campaigns/2026-10-letters-from-kali/Q-20261021-1/01-brief.md
asset: 1
role: email-lifecycle
channel: email-sequence
deliverable: Welcome email with the free three-part discernment guide (step 1 of the Kalimeister welcome series)
context_used:
  - context/context-card.md
  - context/brand/audience.md
  - context/brand/voice.md
  - context/brand/messaging.md
  - context/brand/offers.md
  - context/brand/claims-and-compliance.md
  - context/brand/channels.md
  - campaigns/2026-10-letters-from-kali/work-order-02.md
  - campaigns/2026-10-letters-from-kali/Q-20261017-1/04-candidate.md
  - campaigns/2026-10-letters-from-kali/Q-20261017-2/04-candidate.md
  - campaigns/2026-10-letters-from-kali/Q-20261017-3/04-candidate.md
  - campaigns/2026-10-letters-from-kali/Q-20261017-4/04-candidate.md
  - campaigns/2026-10-letters-from-kali/Q-20261017-5/04-candidate.md
  - campaigns/2026-10-letters-from-kali/Q-20261017-6/04-candidate.md
sources:
  - https://kalimeister.com/letters
  - https://kalimeister.com/about
  - https://kalimeister.com/readings
qa: pass
edit_notes: campaigns/2026-10-letters-from-kali/Q-20261021-1/02-edit-notes-r2.md
qa_notes:
approved_by: Billy
approved_at: 2026-10-21
shipped_at: 2026-10-21
ship_target: "create new inactive Brevo template and set it as step 1 of the Kalimeister welcome series automation (no send)"
---

# Asset 1 (edited): Welcome + three-part discernment guide, "A strong feeling, a thoughtful next step"

## Brevo settings
- Subject: Your discernment guide, in three parts
- Preheader: Notice, ask, take one small step. About five minutes, plus a page of paper.
- Sender: Kali Meister <kali@kalimeister.com>
- Reply-to: billy@randi.agency
- Footer: Kali Meister / 11265 Hallett Street, Soddy Daisy, TN 37379 / You've received this because you've subscribed to Letters from Kali. / Unsubscribe link ({{ unsubscribe }})

## Email copy

Masthead: WRITING · TAROT · SPIRITUAL REFLECTION / Letters from Kali

Eyebrow: YOUR FREE GUIDE · THREE PARTS

H1: A strong feeling. A thoughtful next step.

Welcome. I'm glad you're here.

Letters from Kali brings together writing, tarot, and spiritual reflection. A letter will arrive each week. This first email holds the guide you asked for.

It's for the moment when you feel something strong and can't tell what it is. Intuition, fear, something you want, or a wish to be certain. You don't have to sort that out first. Start with a page and a pen.

The guide has three parts, and each takes a few minutes. Do all three tonight or one a day. Nothing here asks you to decide the big question, and a few honest lines are enough for each part. You can return to the guide whenever a strong feeling shows up again.

[Part] Part one: Notice

Start with what happened, in the plainest words you have, the way a camera would have recorded it. Note where you were, what was said, and what your body or mood did. If you catch yourself writing "obviously" or "clearly," that's a sign the story has crept in. Cross it out and keep going.

[A MOMENT ON THE PAGE]
Write two short lines:
What I saw or heard…
What I felt…
Then stop. The meaning comes next.

[Pull quote] A feeling can be real while the story about it is still unfinished.

[Part] Part two: Ask

Under a strong feeling there is often a hope, a worry, or a wish to be sure. Ask which of them is in the room. You may find more than one, and they can disagree with each other. That is allowed. Put them all on the page.

[A MOMENT ON THE PAGE]
Finish each sentence as many times as it's true:
Part of me hopes…
Part of me worries…
Part of me wants to be sure that…

If you keep a tarot deck, here is one way to bring it in. Hold your question in mind, shuffle, and turn over a single card. Don't look up its meaning yet. Describe what you see: the figures, the colors, what they seem to be doing. Then ask, "What does this image invite me to look at in my question?"

The card is a question to sit with. It doesn't tell you what will happen. If you don't have a deck, skip this and let the page do the work.

[Part] Part three: Take one small step, then return

Choose a step small enough to undo. That could be a question to put to someone, a fact to check, or a decision you leave alone until Friday. Write it down and give yourself a day to come back to the page. When you return, read what you wrote before you add anything new. You may see something you missed.

[A MOMENT ON THE PAGE]
One small step I could take is…
I'll return to this page on…
When I do, I'll ask what I learned.

That's the guide. Keep your page. The letters that follow go deeper, one idea at a time.

What brought you here? You're welcome to reply with a few words, a question, or a little of your story.

If you'd ever like company with a question, I offer private online tarot readings. Each one is a reading with room for you.

[Link] Book a Reading -> https://kalimeister.com/readings

Tarot readings are offered for reflection and personal insight. They don't predict outcomes and aren't a substitute for medical, mental health, legal or financial advice.

Kali

Footer: Kali Meister / 11265 Hallett Street, Soddy Daisy, TN 37379 / You've received this because you've subscribed to Letters from Kali. / Unsubscribe link ({{ unsubscribe }})

## Notes for reviewer
- Assumptions:
  - Guide content (the three practices and the single-card method) is written fresh by the drafter and uses nothing from the old "Awaken Your Intuition" guide. Kali has not reviewed it. [gap] She should approve before send.
  - H1 reuses the site line "A strong feeling. A thoughtful next step." [src: https://kalimeister.com/letters]; Kali has not confirmed it as her words. [unverified]
  - "A letter will arrive each week" relies on the 7-day Brevo cadence [owner]. The work order says Letter 01 follows 3 days later; I did not state a day count in the copy so the email stays true if timing changes.
  - The one-card method is a plain reflection exercise, not a claim about how tarot works or what cards mean. Kali may want to replace it with her own method.
  - "Until Friday" is an example of a waiting period, not a promise about timing.
- Open questions:
  - Booking: the readings page showed "No slots are available right now" on 2026-10-17 [src: offers.md]. The soft close sends people to a page that may have no times. Billy/Kali to decide whether to keep the link until slots open, or end at the reply invitation. The copy says "I offer private online tarot readings" and does not say they are bookable now.
  - Reply-to is billy@randi.agency per the owner; replies to "What brought you here?" will reach Billy, not Kali.
  - Whether the welcome series sends this before or after any other guide email is unconfirmed; the copy does not mention confirmation or a separate send.
- Facts needing verification:
  - "Private online tarot readings" [owner] and "a reading with room for you" [src: https://kalimeister.com/readings] are reused site wording, listed so the reviewer can confirm Kali is comfortable with it in this email.
  - Overlap with Letters 01-05: Part one echoes the noticing-versus-interpreting theme of Letter 01, Part two touches fear and wish (Letters 02, 03), Part three previews revisiting (Letter 04). The sentence stems here are new and shorter; no Letter prompt is reused.
- Assumptions from the brief this draft leans on (and how the copy handles each):
  - Tarot as reflection, never prediction [src: about]: the tarot section says the card does not tell what will happen and is optional.
  - Reading disclaimer is included because readings are mentioned.
  - Credentials, years, client counts, retreats and gatherings are not mentioned. Banned words and "energy"/"psychic"/"third eye" are not used.
  - Length is about 630 words of body copy, within the 600-900 target.

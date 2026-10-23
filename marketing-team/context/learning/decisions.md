---
file: decisions
tier: 1
last_updated: 2026-10-17
owner: context-manager
---

# Decisions

<!-- Append newest first. -->

### 2026-10-22 | Printify shipping and shop checkout enabled
- Decision: Enabled `MERCH_CHECKOUT_ENABLED=true` and `MERCH_TAX_REVIEWED=true` in `apphosting.yaml` so Printify shipping calculation and Stripe checkout are live on `/shop` and `/shop/checkout` ($34 zodiac shirts, $28 intention candles; paid orders held for manual admin review before Printify production) [owner].
- Consolidated Codex's `merch-design/`, `email-design/`, and `workbook-draft/` folders and Claude's `marketing-team/` folder into the main GitHub repository.
- Revisit when: Taurus shirt sizes S–2XL/4XL are enabled in Printify or shipping/pricing changes.

### 2026-10-21 | Welcome series live
- Decision: Activated Brevo automation "Kalimeister welcome series" after Codex removed website-sent email (verified in Brevo logs) [owner].
- Sequence: discernment guide (template 21) immediately, 3 days, Letters 01-05 weekly. Signup uses Brevo double opt-in (template 20, built by Codex).
- Kali to review the guide after launch; Billy may revise. Booking link kept even though /readings showed no slots on 2026-10-17.
- Revisit when: Kali reviews, or results come in.

### 2026-10-20 | Brevo owns all subscriber email
- Decision: All Kalimeister subscriber email is sent by Brevo; the website only adds contacts to Brevo list 5 [owner]. Billy hands marketing tasks to this team; website code is handled separately (Codex).
- Status: Brevo automation "Kalimeister welcome series" built, inactive. Live site still runs its own discernment-v1 sequence; handoff spec at docs/EMAIL-HANDOFF.md in the site repo.
- Revisit when: the site change is deployed; then add welcome step and activate.

### 2026-10-17 | Reading disclaimer wording
- Decision: Use "Tarot readings are offered for reflection and personal insight. They don't predict outcomes and aren't a substitute for medical, mental health, legal or financial advice." wherever readings are promoted [owner, Billy chose Option B].
- Revisit when: Kali or a legal check suggests changes.

### 2026-10-17 | Email footer address
- Decision: Kali Meister emails use 11265 Hallett Street, Soddy Daisy, TN 37379 as the footer mailing address [owner].
- Revisit when: a PO box or business address is set up.

### 2026-10-17 | Email replies go to Billy
- Context: Letters from Kali invite replies; drafts had recommended reply-to kali@kalimeister.com.
- Decision: Reply-to stays billy@randi.agency so Billy can triage replies [owner]. Sender display stays Kali Meister.
- Rationale: Billy decides what each reply needs before it reaches Kali.
- Revisit when: reply volume grows or Kali wants to answer directly.

### 2026-10-17 | Brevo connected
- Context: Billy connected the Brevo connector.
- Decision: Account randichatagent@gmail.com confirmed by Billy as the correct account for Kalimeister email [owner].
- Rationale: Holds Kali's senders, subscriber list and the Letters from Kali templates.
- Revisit when: Kali gets her own Brevo account or the account changes.

### 2026-10-17 | Weekly runs scheduled
- Context: Setup run-001.
- Decision: Weekly results read Mondays 7:46 AM ET; weekly content plan Mondays 8:46 AM ET (scheduled tasks, run on Billy's ThinkPad). Both draft and queue only.
- Rationale: Billy accepted Monday defaults; times nudged a few minutes early to avoid on-the-hour congestion.
- Revisit when: cadence changes or connectors are added.

### 2026-10-17 | Marketing team set up for Kalimeister
- Context: Setup run-001 by Billy for kalimeister.com.
- Decision: Brand OS drafted; first focus is a welcome/nurture sequence for free-guide subscribers leading to the Narrative Deep-Dive [assumption].
- Rationale: Owner accepted recommendation.
- Revisit when: Kali reviews the brand files or booking slots change.

### YYYY-MM-DD | <decision>
- Context:
- Decision:
- Rationale:
- Revisit when:

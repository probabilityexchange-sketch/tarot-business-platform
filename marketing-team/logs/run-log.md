# Run Log

<!-- Append only. One entry per orchestration run, setup, context merge, or ship action. -->

## 2026-10-17 | setup run-001 (Kalimeister)
- Workspace: /home/billy-bradshaw/projects/tarot-business-platform/marketing-team
- Sources: kalimeister.com (home, /readings, /about, /letters, /shop, /courses) + 7 repo docs. Social URLs not supplied.
- Interview: 5 questions answered by Billy (owner-questions.md). Drafts accepted as working drafts; Context Card approved as draft.
- Files: 10 brand files + Context Card (status: draft). Build receipt: inputs/run-001/build-receipt.md
- Connectors: none connected; Brevo, Supermetrics, vidIQ suggested.
- Scheduled: weekly results read Mon 7:46 ET, weekly content plan Mon 8:46 ET.

## 2026-10-17 | Brevo connected
- Account randichatagent@gmail.com confirmed by Billy; recorded in channels.md.

### Run 2026-10-17 20:30 | 2026-10-letters-from-kali-01
- Request: Review the 8 Letters from Kali Brevo templates against the brand rules
- Roles: orchestrator (export + briefs) > email-lifecycle (8 assets) > brand-qa-reviewer (8) > email-lifecycle r2 (asset 8) > brand-qa-reviewer r2
- Context packets: email-lifecycle: card + 6 brand files + work order + 8 briefs + 8 sources (Tier 3: existing emails); QA: card + 5 brand files + briefs + sources
- Tools used: orchestrator: Brevo read-only (templates, senders, lists); specialists: file read/write only
- Outputs: campaigns/2026-10-letters-from-kali/Q-20261017-1..8/04-candidate.md
- QA: 7 PASS round 1; asset 8 REVISE then PASS round 2
- Escalations / open questions: Kali's postal address; reply routing; reading disclaimer wording; credentials; /blog; retreat details; booking slots

### Run 2026-10-17 | review-queue decisions and ship
- Items: Q-20261017-2..6 (Letters 01-05) approved by Billy in chat
- Action: Brevo templates_create_smtp_template x5, inactive, no send
- Result: new templates 10, 11, 12, 13, 14; originals 1, 3, 4, 5, 6 untouched

### Run 2026-10-21 | 2026-10-letters-from-kali-02
- Request: new three-part discernment guide (welcome email)
- Roles: orchestrator (brief) > email-lifecycle > brand-qa-reviewer > email-lifecycle r2 > brand-qa-reviewer r2
- Outputs: campaigns/2026-10-letters-from-kali/Q-20261021-1/04-candidate.md
- QA: PASS, PASS (1 editorial loop)
- Open: Kali review; booking close recheck

### Run 2026-10-21 | review-queue ship Q-20261021-1
- Verified website no longer sends email (Brevo logs; tests in list 5)
- Created template 21; inserted as step 1; 3-day delay before Letter 01; activated automation id 1

### Run 2026-10-21 | 2026-10-tarot-card-reels-01
- Request: tarot card short-form scripts for Kali's review
- Roles: orchestrator (briefs) > [content-producer x2] > [brand-qa-reviewer x2] > [content-producer r2 x2] > [QA r2 x2]
- Outputs: Q-20261021-2, Q-20261021-3 candidates; combined review file Major-Arcana-scripts-for-Kali.md
- QA: pack 1 REVISE->PASS; pack 2 BLOCK (Tower outcome line)->PASS

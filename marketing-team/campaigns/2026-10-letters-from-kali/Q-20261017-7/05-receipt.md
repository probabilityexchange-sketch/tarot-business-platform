# Run receipt: Q-20261017-7, Letter 06 — Make room for a listening practice (template 7)
- Harness and model(s): Cowork (Claude, cloud session); subagents on the session model
- Work Order: campaigns/2026-10-letters-from-kali/work-order.md
## Roles
- Delegated as separate agents: email-lifecycle (drafted all 8 assets in one dispatch), brand-qa-reviewer (reviewed all 8 in one dispatch)
- Run inline by the orchestrator: source export from Brevo (read-only) and brand-brief
## Skills applied
- brand-brief: skills/brand-brief/SKILL.md, read and applied, by orchestrator
- no-ai-slop: skills/no-ai-slop/SKILL.md + eval.md, read and applied, by email-lifecycle
## Files
- Brief: 01-brief.md (sources: 8 files)
- Draft/edit: 02-draft.md | 02-edit-notes.md | 02-edited.md
- Reviews: 03-review-r1.md (PASS)
- Candidate: 04-candidate.md
## Revisions: 0
## Open issues and assumptions the candidate leans on
- Footer needs Kali Meister's postal address (placeholder) — ship gate.
- Sender and reply-to kali@kalimeister.com recommended [assumption]; decision pending.
- Reading disclaimer wording [gap]; booking slots closed on 2026-10-17; CTA changed to offers.md wording.
- Brevo connector exposes create-template but no update-template tool: shipping may create a new inactive template rather than edit template 7.
## Human decision
- Status: pending

---
work_order: 2026-10-weekly-reads-2026-10-19
campaign: 2026-10-weekly-reads
created: 2026-10-19
requested_by: scheduler (weekly results read, scheduled task)
run_kind: scheduled
status: awaiting-approval
---

# Work Order: Weekly results read, week of 2026-10-12 to 2026-10-19

## Request (verbatim)
> Run the weekly-results-read skill from the marketing-team plugin on the workspace (Kalimeister brand). Work unattended: do not ask questions; leave all output as proposals and approval-queue items. Never send, publish, or schedule anything.

## Goal
Read the past 7 days of results for shipped items, propose performance-log entries for durable learnings, and queue a short summary for Billy.

## Success metric
A results file in which every figure cites its source and date range, or says plainly why there's no figure.

## Audience
Internal (Billy). Brand audience per audience.md for context only.

## Offer and CTA
None. This is a read, not an asset.

## Deliverables
| # | Asset | Channel | Owner role | Due |
|---|---|---|---|---|
| 1 | results-2026-10-19.md | internal | research-analyst | 2026-10-19 |
| 2 | Performance-log proposals (if any durable learnings) | context/_proposed/ | research-analyst | 2026-10-19 |

## Shipped items in window (queue entries with shipped_at 2026-10-12 to 2026-10-19)
| Queue id | Item | Channel | Campaign | Shipped | Result |
|---|---|---|---|---|---|
| Q-20261017-2 | Letter 01: A strong feeling | email-sequence | 2026-10-letters-from-kali | 2026-10-17 | Brevo template 10 created, inactive, not sent |
| Q-20261017-3 | Letter 02: What is fear protecting? | email-sequence | 2026-10-letters-from-kali | 2026-10-17 | Brevo template 11 created, inactive, not sent |
| Q-20261017-4 | Letter 03: What do you need to be true? | email-sequence | 2026-10-letters-from-kali | 2026-10-17 | Brevo template 12 created, inactive, not sent |
| Q-20261017-5 | Letter 04: You are allowed to change your mind | email-sequence | 2026-10-letters-from-kali | 2026-10-17 | Brevo template 13 created, inactive, not sent |
| Q-20261017-6 | Letter 05: A boundary can be an act of discernment | email-sequence | 2026-10-letters-from-kali | 2026-10-17 | Brevo template 14 created, inactive, not sent |

## Constraints
- Read-only. No sends, publishes, schedules, or edits to live context.
- Numbers only from connected sources or workspace files, each with source and date range.
- No strategy changes; recommendations are "consider" items only.

## Assumptions made at intake
- Window is 2026-10-12 to 2026-10-19 (7 days ending on the run date).
- Brevo (~~email platform) isn't reachable from this run: no Brevo tools were available in this scheduled session. Email stats couldn't be pulled live.
- ~~analytics and ~~social scheduler aren't connected (channels.md).

## Routing plan
research-analyst only.

## Extra context (Tier 3)
| File | Reason |
|---|---|
| approvals/queue.md | Source of shipped items |
| context/learning/decisions.md | Recent owner decisions that affect what can be measured |
| logs/run-log.md | What ran this week |

## Open questions
- None blocking. Open items carried to the results file.

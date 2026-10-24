# Plan: Wayfinder — AI Data Annotation Referral Site (Design Effort)

## Summary

Use Matt Pocock's **wayfinder** skill (with its `grilling` + `domain-modeling` companions) to chart and work a map of **decision tickets** whose resolution produces a **complete, build-ready design spec** for a directory-plus-guides website that earns referral income by routing AI-work beginners to data annotation platforms.

This plan covers the full **charting** session (already grilled, decisions below) and the protocol for **working through the map**. Wayfinder is planning-by-default: the destination is the design spec, not the site. Building the site is a separate, later effort.

## Charting decisions (resolved via grilling rounds — record in map's Decisions-so-far)

| # | Decision | Answer |
|---|---|---|
| D1 | Destination | Full design spec, handed to a later build effort |
| D2 | Site shape | Directory + guides hybrid (programmatic platform directory + SEO guides, referral CTAs woven through) |
| D3 | Primary audience | Beginners wanting side income ("get paid to train AI" searchers) |
| D4 | Project home | New directory `~/projects/ai-annotation-referrals` + local-markdown tracker (`.scratch/`) |
| D5 | Voice | First-person proof hybrid — structured directory carrying real dashboards/payout proof |
| D6 | Billy's platform footprint | DataAnnotation, Outlier, Mercor/micro1/Alignerr, plus others — broad firsthand coverage |
| D7 | Email capture | In scope — matcher-quiz lead magnet → welcome sequence → referral links by email |
| D8 | Effort budget | 5–10 hrs/week — spec favors programmatic generation + high-leverage pages |

## Domain grounding (already verified)

Competitors proving the model: paidtotrainai.com ("one human, real dashboards", referral links), breakingeven.online (worker sentiment tracking), theaiemploymentagency.com (vetted directory + paid program), aigigjobs.com, expertmatchai.expert, dataannotationhub.com. Platforms with known/published referral mechanics include DataAnnotation (worker-dashboard program), Mercor, micro1, Handshake AI, Alignerr. Full inventory is Ticket 01's job.

## Phase 0 — Scaffold the project home + tracker

1. `mkdir -p ~/projects/ai-annotation-referrals/.scratch/design-a/issues` and `cd` there; `git init` (no remote yet).
2. Create `docs/agents/issue-tracker.md` from mattpocock's `issue-tracker-local.md` template (local-markdown tracker, `.scratch/<feature>/` conventions, Wayfinding operations section).
3. Create `AGENTS.md` with an `## Agent skills` block pointing at the tracker doc (per setup-matt-pocock-skills).
4. Create `CONTEXT.md` seed with the domain glossary started from charting (Platform, Referral program, Referral link, Directory page, Guide, Matcher quiz, Lead magnet, Welcome sequence, Frontier, Map, Ticket).
5. ADR `docs/adr/0001-local-markdown-tracker.md` — tracker choice (hard to reverse mid-effort, surprising without context).

## Phase 1 — Chart the map

Write `.scratch/design-a/map.md`:

```markdown
## Destination

A complete, build-ready design spec for a directory-plus-guides website that earns
referral income by routing AI-work beginners to data annotation platforms —
covering positioning, information architecture, the platform data model, content
plan, referral/monetization mechanics, email capture, tech stack, and launch checklist.

## Notes

- Voice: first-person proof hybrid. Billy actively works DataAnnotation, Outlier,
  Mercor/micro1/Alignerr, and others — every page carries firsthand proof.
- Audience: beginners searching for side income. Referral CTAs convert at signup.
- Effort budget: 5–10 hrs/week — favor programmatic generation, few high-leverage pages.
- Consult local skills: `programmatic-seo`, `email-funnel-automation`,
  `design-consultation`, `third-party-service-integration`.
- Tracker: local markdown (docs/agents/issue-tracker.md). Glossary: CONTEXT.md.

## Decisions so far

- Charting D1–D8 (see table in plan / record as one-line gists)

## Not yet specified

- Visual design system / brand identity (colors, type, logo) — graduates after positioning resolves
- Distribution engine beyond SEO (Reddit, YouTube, TikTok) — depends on content plan
- Digital products (paid application-prep guide/course) — post-launch monetization
- User-submitted pay reports / sentiment tracking (breakingeven's moat) — post-launch
- Non-US audiences / multi-language — needs platform country coverage first

## Out of scope

- Building/deploying the site (separate effort; hand off via to-spec + to-tickets)
- The tarot platform (unrelated project)
```

### Initial tickets (`.scratch/design-a/issues/NN-<slug>.md`)

| # | Ticket | Type | Blocked by |
|---|---|---|---|
| 01 | **Referral program inventory** — every major platform: program exists? payout structure, cookie/terms, link location, ToS limits on public sharing. Cover DataAnnotation, Outlier, Mercor, micro1, Alignerr, Handshake AI, Surge, Invisible, Prolific, Appen, Telus AI, OneForma, Clickworker, Toloka/Mindrift, Remotasks, Welocalize, RWS, Centific, Babel Audio, TaskVerse. Cited markdown table. | research (AFK) | — |
| 02 | **Billy's referral asset inventory** — checklist: per platform dashboard, copy referral link/code, record current bonus terms + payout method → `assets/referral-links.md` | task (HITL) | — |
| 03 | **SEO & competitor landscape** — keyword universe + intent, competitor audit (paidtotrainai, breakingeven, TAEA, aigigjobs, expertmatchai, dataannotationhub, Reddit subs): rankings, referral models, gaps | research (AFK) | — |
| 04 | **Positioning & brand** — name, domain, one-line promise, differentiator vs incumbents, FTC disclosure posture, tone rules | grilling (HITL) | 03 |
| 05 | **Information architecture & page taxonomy** — directory structure, guide types, homepage shape, URL scheme, programmatic templates | grilling (HITL) | 01, 03, 04 |
| 06 | **Platform data model** — schema per platform entry (pay ranges by track, skills, countries, payout speed, assessment flow, referral terms, legitimacy status, firsthand notes); storage format | grilling (HITL) | 01 |
| 07 | **Matcher quiz prototype** — "Which platform should YOU apply to first?" 5–7 questions → ranked recommendations w/ referral CTAs → email gate. Throwaway single-HTML prototype | prototype (HITL) | 01, 06 |
| 08 | **Content plan & cadence** — launch page set (10–15 pages), programmatic vs hand-written split, update cadence, AI-assisted pipeline + proof insertion, screenshot/redaction policy | grilling (HITL) | 03 |
| 09 | **Monetization mechanics** — CTA design, link management + click tracking, per-page CTA strategy, disclosure placement, future ads/sponsorships/products | grilling (HITL) | 01, 02 |
| 10 | **Email funnel** — ESP choice (Brevo already in tarot stack), 5-email welcome sequence, referral distribution, quiz-answer segmentation | grilling (HITL) | 04 |
| 11 | **Tech stack & hosting** — Astro vs Next.js static vs Vite build-after; hosting (Firebase/Cloudflare/Vercel); analytics; forms; ESP integration | grilling (HITL) | 05 |
| 12 | **Launch checklist & measurement** — MVP page list, sitemap/GSC, link-verification cadence, analytics events (per-platform CTA clicks), 90-day success metrics | grilling (HITL) | 05, 08, 11 |

**Frontier at chart time:** tickets 01, 02, 03 (open, unblocked).

## Phase 2 — Fire the opening moves (end of charting session)

1. Fire two **research subagents in parallel** for tickets 01 and 03 (per wayfinder: research tickets may resolve in parallel; each claims its ticket by setting `Status: claimed`, appends findings under `## Answer`, sets `Status: resolved`, and the map's Decisions-so-far gets a gist + link).
2. Hand Billy the precise **checklist for ticket 02** (platform dashboards → copy referral links/terms). Mark it claimed by Billy.
3. Stop — charting is one session's work.

## Phase 3+ — Work through the map (one ticket per session)

Per wayfinder protocol, each session:

1. Load `map.md` (low-res only), scan `.scratch/design-a/issues/` for the frontier (open + unblocked + unclaimed; first by number).
2. Claim the ticket (`Status: claimed`) before any work.
3. Resolve it — grilling tickets run the grilling loop (numbered questions + recommended answers, design-tree rounds) with `domain-modeling` active (CONTEXT.md updated inline, ADRs for hard-to-reverse calls). Prototype ticket 07 uses the `prototype` skill (throwaway HTML). 
4. Record: append answer under `## Answer` in the ticket file, `Status: resolved`, append gist + link to map's Decisions-so-far.
5. Graduate any fog the answer made specifiable into new tickets (create-then-wire); clear it from Not yet specified. Rule anything past the destination out of scope.

Likely session order after the opening: 06 → 04 → 08/09/10 → 05 → 11 → 07 → 12 (frontier order shifts as tickets resolve).

## Endgame — handoff

When no tickets remain, the union of ticket answers **is** the design spec. Then:

1. Synthesize `.scratch/design-a/spec.md` from the map (or run mattpocock's `to-spec`).
2. Start a **separate build effort**: `to-tickets` → vertical-slice build tickets → `implement`/`tdd`. New map only if the build itself has fog.

## Verification

- After Phase 1: `map.md` + 12 ticket files exist, blocking lines reference valid ticket numbers, frontier = 01/02/03.
- After Phase 2: tickets 01/03 have cited `## Answer` sections; ticket 02 checklist delivered.
- Each resolved ticket: answer recorded, map Decisions-so-far updated, fog graduates handled — verified by re-reading map.md each session.

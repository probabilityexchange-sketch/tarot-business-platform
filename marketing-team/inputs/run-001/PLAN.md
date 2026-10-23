# PLAN.md — Kalimeister.com Shared Roadmap

> Living roadmap for Oz (Warp) and Kilo Code agent collaboration.
> Update statuses as work progresses. Both agents read this on session start.

## Current Status

- **Build:** 650 pages compile cleanly (Next.js 15.5.14, Firebase App Hosting `kali` backend)
- **Deploy:** Merge to `master` → push to origin → Firebase auto-deploys
- **Production:** `https://kalimeister.com` live, pSEO pages serving 200
- **Last SEO audit:** 2026-06-30 — robots.txt, sitemap, schema, and metadata all optimized

## Active Workstreams

### 1. pSEO Content & Discovery
| Task | Owner | Status |
|------|-------|--------|
| Monitor Google Search Console indexing for 620 city/service pages | Oz (cron via Hermes) | pending |
| Generate unique FAQ content for underperforming pSEO pages | Kilo Code | pending |
| Add schema markup for new service types | Kilo Code | pending |

### 2. Booking & Payments
| Task | Owner | Status |
|------|-------|--------|
| Verify Stripe checkout flow end-to-end | Kilo Code | pending |
| Add Cal.com booking embed to service pages | Kilo Code | pending |
| Test confirmation email delivery (Brevo) | Oz (VPS) | pending |

### 3. Blog & Content Engine
| Task | Owner | Status |
|------|-------|--------|
| Build video-to-blog-post pipeline (transcription → SEO polish → publish) | Kilo Code | pending |
| Add Firestore tracking for blog → booking conversion | Kilo Code | pending |
| Set up automated social cross-posting | Oz (Hermes cron) | pending |

### 4. Performance & Core Web Vitals
| Task | Owner | Status |
|------|-------|--------|
| Audit page load times on key pSEO routes | Oz (Lighthouse via Hermes) | pending |
| Optimize image loading (Next.js Image, blur placeholders) | Kilo Code | pending |
| Review and reduce layout shift on dynamic pages | Kilo Code | pending |

### 5. DevOps & Monitoring
| Task | Owner | Status |
|------|-------|--------|
| Monitor Firebase App Hosting build health | Oz (VPS) | done |
| Set up uptime monitoring for kalimeister.com | Oz (Hermes cron) | pending |
| Configure Firebase Hosting redirects for legacy URLs | Oz | pending |
| Push latest SEO fixes to origin → trigger deploy | Oz | ready |

## Agent Responsibilities

| Domain | Oz (Warp) | Kilo Code |
|--------|-----------|-----------|
| Code editing (Next.js, TSX, CSS) | ✓ | ✓ (primary) |
| Git operations (commit, push, merge) | ✓ | ✓ |
| Firebase deployment & config | ✓ (primary) | |
| VPS / Hermes agent management | ✓ (primary) | |
| SEO audits & Lighthouse runs | ✓ (cron) | |
| Local dev server & builds | | ✓ (primary) |
| Playwright / Vitest testing | | ✓ (primary) |
| Content generation (pSEO, blog) | | ✓ (primary) |

## Local ↔ EC2 Linkage

| Component | Local (Laptop) | Remote (EC2) |
|-----------|---------------|--------------|
| **SSH** | `ssh aws` → `ec2-18-188-157-210.us-east-2.compute.amazonaws.com` | Hermes VPS |
| **Obsidian Vault** | `~/Documents/ObsidianVault/` | Synced copy (rsync via Oz) |
| **Task Inbox** | `~/Documents/ObsidianVault/0-Inbox/Hermes/kilo-code-tasks/` | Oz writes to inbox via Hermes |
| **Projects** | `~/projects/tarot-business-platform/` | `~/projects/tarot-business-platform/` (origin) |
| **Admin Dashboard** | `http://localhost:3000/admin` (next dev) | `https://kalimeister.com/admin` (production) |
| **Kilo Startup** | `~/.kilo/command/startup.md` (auto-reads vault) | N/A (Oz manages via Hermes) |

## Handoff Protocol

1. Oz writes task specs in `~/Documents/ObsidianVault/0-Inbox/Hermes/kilo-code-tasks/` with `assigned: kilo-code` and `status: pending` frontmatter (see `_TASK_TEMPLATE.md`)
2. Kilo Code reads the vault on session start and checks for assigned tasks
3. Kilo Code commits work to a feature branch, updates task status in this PLAN.md
4. Oz reviews the branch, merges to master, pushes to origin
5. Both agents update this PLAN.md with completed tasks and new priorities

### Task File Format (for Oz)
```
---
assigned: kilo-code
source: hermes-gateway
project: tarot-business-platform
status: pending
created: 2026-07-01T10:00:00Z
priority: medium
---
# Task Title
## Context
...
## Acceptance Criteria
- [ ] Item 1
## Branch
feature/branch-name
```

### Repos Requiring EC2 → GitHub Push
The following repos are documented but do not yet exist on GitHub (need `git push --set-upstream` from EC2):
- `randi-industries-promo` → `github-randi-agency:Randi-Agent/randi-industries-promo`
- `slt-machine-lead-gen` → `github-probabilityexchange:probabilityexchange-sketch/slt-machine-lead-gen`
- `randi-agency` → `github-randi-agency:Randi-Agent/randi-agency` (repo init'd locally, no commits)
- `randi-industries` → `github-randi-agency:Randi-Agent/randi-industries` (repo init'd locally, no commits)

## Key Reference Files

| File | Purpose |
|------|---------|
| `AGENTS.md` | Coding conventions, stack, build commands |
| `PLAN.md` | This file — shared roadmap |
| `SEO_CONTENT_STRATEGY.md` | Content engine design |
| `firebase.json` | Firebase Hosting, Firestore, App Hosting config |
| `apphosting.yaml` | Environment variables, secrets, run config |
| `~/.kilo/command/startup.md` | Kilo Code startup routine |
| `~/.kilo/plans/hermes-dashboard.md` | Hermes monitoring dashboard plan |
| `~/Documents/ObsidianVault/0-Inbox/Hermes/kilo-code-tasks/` | Task inbox from Oz |
| `~/Documents/ObsidianVault/Hermes Agent/Hermes Config/project-configs.md` | Full project registry |
| `~/Documents/ObsidianVault/Hermes Agent/Randi-Agency-and-Randi-Industries-Setup-Plan.md` | Agency operating model |

---

*Last updated: 2026-07-01 by Oz*

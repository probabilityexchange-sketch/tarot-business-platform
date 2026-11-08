# Maintenance Handoff — kalimeister.com (tarot-business-platform)

> Audience: the owner, Cowork (Claude Code), Codex, or any developer/agent taking over ongoing maintenance.
> Written 2026-11-03 against the current working tree. If code and this document disagree, the code wins — re-read the files listed below before acting.

---

## 1. What this document is

This is the operating manual for maintaining kalimeister.com: a Next.js 15 (App Router) + Firebase App Hosting + Firestore + Stripe + Cal.com + Printify + Brevo site where private readings are the primary revenue offer. An AI agent or developer maintains it by, in order, every session: **(1) read `AGENTS.md`** (mission, brand voice, hard compliance rules, agent lanes, build/test commands), **(2) read `PLAN.md`** (current production status and active priorities), **(3) read this file** (money flows, launch checklist, runbook), and **(4) run the verification gates — `npm run typecheck` and `npm run test:business` — before and after any change.** Pushing to `origin/master` auto-deploys production via Firebase App Hosting, so nothing merges unverified.

---

## 2. Money flows (current state, 2026-11-03)

| Flow | Entry | Checkout | Fulfillment | Success / after |
|---|---|---|---|---|
| **Reading booking** ($250 / $450) | `BookingOfferings` component on `/readings` | `POST /api/availability/reservations` creates a Cal.com slot hold (`booking_slots`, 45-min expiry) → `POST /api/checkout` creates a Stripe Checkout Session (`allow_promotion_codes: true`, UTM metadata, and a `booking_leads` lead doc for recovery) | Stripe webhook → `fulfillBooking` (`src/lib/booking-fulfillment.ts`) → `createCalComBooking`, `bookings` doc → `confirmed`; `POST /api/bookings/confirm` re-runs the same idempotent fulfillment from the success page | `/booking/success` — emits `purchase`, cross-sells Letters signup (`EmailSignupForm source="booking-success"`) |
| **Merch** ($28–$34) | `/shop` | `POST /api/merch/quote` (`merch_quotes`, 15-min quote expiry, 30-day `deleteAfter`) → `POST /api/merch/checkout` (Stripe, `automatic_tax` enabled) | Webhook → `recordMerchPayment` → `merch_orders` doc `paid_awaiting_review` → **admin review queue** (`/api/admin/merch/orders`) → `transferMerchOrder` → held Printify order (`externalId kali-<sessionId>`) | `/shop/success` — emits `purchase` via `MerchPaymentStatus`, cross-sells readings + Letters |
| **Workbook** ($39, NEW) | `/workbook` | `POST /api/workbook/checkout` (metadata `kind: "workbook"`) | Webhook → `recordWorkbookPurchase` → `workbook_buyers` doc (idempotent per session) | `/workbook/success` → `GET /api/workbook/download?session_id=…` re-verifies the session with Stripe and streams `private-assets/discernment-workbook.pdf`; **friendly 503 if the PDF file is missing** (see checklist 5a) |
| **Gift readings** ($250 / $450, NEW) | `/gift` | `POST /api/gift/checkout` (metadata `kind: "gift"`, `giftTier`) | Webhook **and** `GET /api/gift/status` both call the idempotent `fulfillGiftPurchase` (`src/lib/gift-orders.ts`): creates a **single-use Stripe coupon** (human code `KALI-XXXXXXXX`, `amount_off` = tier price, `duration: "once"`, `max_redemptions: 1`) + `gift_cards` doc + Brevo event `gift_purchased` (`GIFT_CODE`, `GIFT_TIER`) | `/gift/success` shows the code (polls `/api/gift/status`); recipient redeems the code at normal reading checkout (`allow_promotion_codes`); `fulfillBooking` accepts `amount_total === price − discount`, **including a $0 full-gift checkout** (`paidWithGiftCode: true` flag on the booking) |
| **Abandoned booking recovery** (NEW) | `booking_leads` doc written when `/api/checkout` creates a session (status `checkout_started`, 30-day `deleteAfter`) | — | Webhook on `checkout.session.expired`: marks the lead `abandoned` (`abandonedAt`) and emits Brevo event `booking_abandoned` (`OFFERING`, `SLOT`) | A Brevo automation sends the reminder email — **the website never sends it** (checklist 5c) |

Firestore collections referenced above: `booking_slots`, `bookings`, `booking_leads`, `merch_quotes`, `merch_orders`, `workbook_buyers`, `gift_cards`, `subscribers`, `blog_posts`.

---

## 3. Email architecture

**Brevo owns all subscriber email.** The website never sends marketing, welcome, guide, sequence, or reminder email.

- Website signup routes (`/api/subscribe`, `/api/free-guide`) validate consent + email and add the contact to **Brevo List `5`** (`BREVO_LIST_ID=5`, "Kali Meister — Website subscribers") via `POST /v3/contacts` (`updateEnabled: true`).
- Course waitlist (`/api/course-waitlist`) adds to **Brevo List `8`** (`BREVO_COURSE_LIST_ID=8`) — never List 5; `src/lib/email-signup.ts` hard-fails if the two list IDs are equal.
- When the signup includes UTM params, the contact create call sends Brevo **attributes** `UTM_SOURCE` / `UTM_MEDIUM` / `UTM_CAMPAIGN` / `UTM_CONTENT`; if Brevo rejects attributes (e.g. not yet created in the dashboard), it **retries once without attributes** so signup never breaks.
- The website also **emits events** (`POST /v3/events`, `src/lib/brevo-events.ts`): `gift_purchased` and `booking_abandoned`. Brevo automations listen for these.
- All welcome/guide/weekly email is sent by the active Brevo automation ("Kalimeister welcome series").
- **Never** add `POST /v3/smtp/email` for customers or subscribers, and never add a Firebase email trigger. The business test suite asserts the signup routes never call `smtp/email`.
- **One exception — owner alerts (added 2026-11-05, owner-approved):** `src/lib/owner-alerts.ts` sends plain-text operational emails via Brevo `POST /v3/smtp/email` **only to the owner's own addresses**: "New booking" on every confirmed booking, and "ACTION NEEDED" when a paid booking cannot be created in Cal.com (`fulfillmentState: needs_attention`). Recipients: `OWNER_ALERT_EMAILS` (comma-separated) → falls back to `ADMIN_EMAIL` → `NEXT_PUBLIC_ADMIN_EMAIL`. Sender: `BREVO_FROM_EMAIL` (`noreply@kalimeister.com`, a verified Brevo sender). Alerts are best-effort and never block fulfillment. Each fires once per booking (only the call that claims the booking sends it). Covered by `src/tests/recovery.cjs`.

---

## 4. Analytics

Delivery: `src/lib/analytics.ts` `pushEvent()` pushes to `window.dataLayer`, and calls `gtag("event", …)` directly when GTM is absent. `src/components/Analytics.tsx` loads GTM (`NEXT_PUBLIC_GTM_ID`) or gtag (`NEXT_PUBLIC_GA_MEASUREMENT_ID` || `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`; live property `G-83C04RTNB2`).

| Event | Fired from | Params (key) |
|---|---|---|
| `generate_lead` | `EmailSignupForm` on successful signup | `source` (e.g. `homepage`, `booking-success`, `shop-success`, `workbook-buyer`) |
| `select_item` | `CandleGallery` (merch candles) | `item_id`, `item_name`, `price` |
| `begin_checkout` | `MerchCheckout` (merch), `WorkbookBuyButton` ($39), `GiftBuyButton` (tier value) | `value`, `currency`, `items` |
| `purchase` | Success pages: `/booking/success` (booking value + `transaction_id`), `/shop/success` via `MerchPaymentStatus`, `/workbook/success` ($39), `/gift/success` (tier value) | `value`, `currency` |
| `booking_started` | `BookingOfferings` when an offering is selected | `offering`, `duration` |
| `checkout_started` | `BookingOfferings` after the Stripe session is created | `offering`, `price` |

**UTM first-touch capture:** `src/hooks/useUtm.ts` stores the first-seen `utm_source/medium/campaign/content` in `sessionStorage` key `km_utm` (first touch wins; capture is best-effort). `EmailSignupForm` and `BookingOfferings` attach it to their API calls → it lands in **Brevo contact attributes** (signups) and **Stripe session metadata** (`utmSource`, `utmMedium`, `utmCampaign`, `utmContent`) plus the `booking_leads` doc (bookings).

---

## 5. PRE-LAUNCH CHECKLIST (owner actions)

**Nothing in the new revenue surface works end-to-end until every item below is done.** In order:

**a. Build and commit the workbook PDF.** Until this exists, paid workbook downloads return the friendly 503 ("Your workbook is being finalized…"):

```bash
pip3 install reportlab pypdf
python3 workbook-draft/build_workbook.py        # writes output/pdf/learning-to-listen-workbook-review.pdf
mkdir -p private-assets
cp output/pdf/learning-to-listen-workbook-review.pdf private-assets/discernment-workbook.pdf
git add private-assets/discernment-workbook.pdf && git commit
```

Do **NOT** gitignore `private-assets/` — `next.config.ts` `outputFileTracingIncludes` ships `./private-assets/**/*` into the `/api/workbook/download` server runtime. The exact filename `private-assets/discernment-workbook.pdf` is hard-coded in the download route.

**Workbook sales are switched off (2026-11-07).** `WORKBOOK_SALES_ENABLED` in `apphosting.yaml` is `"false"`, so `/api/workbook/checkout` returns 503, `/workbook` shows "Coming soon" with a Letters link, and the workbook cross-links (gift page, Letters page, city pages) and sitemap entry are hidden. Reason: `workbook-draft/build_workbook.py` currently produces an **editorial review draft** — every page footer says "EDITORIAL REVIEW DRAFT - NOT FOR SALE", the cover says "Prepared for Kali's review", and the closing note calls it proposed material. To go live: (1) Kali reviews `output/pdf/learning-to-listen-workbook-review.pdf`; (2) remove the draft footer/cover/closing-note text and the `setSubject` "not for sale" metadata in the build script; (3) run the build above (it also needs `mkdir -p output/pdf tmp/pdfs` first; without `pip`, use `uv run --no-project --with reportlab --with pypdf python workbook-draft/build_workbook.py`); (4) commit the PDF; (5) set `WORKBOOK_SALES_ENABLED` to `"true"` (BUILD + RUNTIME, because the gift/Letters/city pages are statically built) and push.

**b. Stripe dashboard → webhook endpoint.** Confirm the endpoint subscribes to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, **and** `checkout.session.expired` (new — required for abandoned-booking recovery).

**c. Brevo dashboard.**
1. Create contact attributes (type text): `UTM_SOURCE`, `UTM_MEDIUM`, `UTM_CAMPAIGN`, `UTM_CONTENT`. (Signup works without them thanks to the retry, but attribution is lost.)
2. Create an event-triggered automation on **`gift_purchased`** that sends the printable gift note — template uses `GIFT_CODE` and `GIFT_TIER`.
3. Create an event-triggered automation on **`booking_abandoned`** that sends one factual reminder — template uses `OFFERING` and `SLOT`.
4. If the events don't trigger automations: Brevo's newer events API shape expects `identifiers: { email_id }` — `src/lib/brevo-events.ts` currently posts the legacy `{ email }` shape. Add `identifiers` there if needed.

**d. Firestore console → TTL policies.** Enable a TTL policy on `booking_leads.deleteAfter`. A `merch_quotes.deleteAfter` policy is already assumed by the data model — verify it exists too.

**e. GA4.** Mark `purchase`, `begin_checkout`, and `generate_lead` as key events.

**f. Owner approvals (per AGENTS.md §2/§4).** Approve the workbook title *"Learning to Listen: A Discernment Workbook"* and the $39 price; approve the gift tiers ($250/$450) and the gift policy wording on `/gift`. Then update `marketing-team/context/brand/offers.md` (and the claims file if needed) so Claude's marketing lane is allowed to promote the workbook and gift readings.

---

## 6. Verification gates

Run both before **every** push to `master` (push = production deploy via Firebase App Hosting):

```bash
npm run typecheck     # tsc --noEmit (strict; never use `any`)
npm run test:business # node src/tests/business.cjs
```

`business.cjs` runs the `discernment-series`, `merch-orders`, `printify`, `city-pages`, `publishing`, `workbook`, `gift`, and `recovery` suites, plus inline checkout/fulfillment/webhook/signup assertions (prices, UTM metadata, gift redemption math, Brevo list isolation, zero website email sends). Everything is mocked — Stripe, Cal.com, Firestore and Brevo are stubbed in-process; **no network, no charges, no real email.**

---

## 7. Git commit plan for this change set

Grouped `git add` commands, one commit per feature. File lists were compiled from the change set by feature area and every path verified to exist; run `git status` first and drop anything already committed. Two overlap notes: `next.config.ts` is grouped with the workbook (the `outputFileTracingIncludes` ships the PDF) though it also carries the city redirects; `src/app/api/checkout/route.ts` and `src/tests/business.cjs` carry both UTM and recovery/gift changes and are grouped with gift-recovery.

```bash
# 1. feat-funnel-compliance — banned claims removed, disclaimers on reading CTAs, approved degree wording
git add src/app/about/page.tsx src/app/readings/page.tsx "src/app/readings/[service]/[city]/page.tsx" \
        src/app/services/page.tsx src/app/funnel/page.tsx \
        src/components/BrandHomepage.tsx src/lib/service-page-content.ts

# 2. feat-analytics-utm — event coverage + first-touch UTM capture
git add src/hooks/useUtm.ts src/lib/analytics.ts \
        src/components/EmailSignupForm.tsx src/components/BookingOfferings.tsx \
        src/components/MerchCheckout.tsx src/components/CandleGallery.tsx src/components/TrackedLink.tsx \
        src/lib/email-signup.ts

# 3. feat-workbook — $39 workbook product, checkout, verified PDF download
git add src/lib/workbook.ts src/lib/workbook-orders.ts \
        src/app/workbook/page.tsx src/app/workbook/WorkbookBuyButton.tsx src/app/workbook/success/page.tsx \
        src/app/api/workbook/checkout/route.ts src/app/api/workbook/download/route.ts \
        src/tests/workbook.cjs next.config.ts \
        workbook-draft/build_workbook.py workbook-draft/content.json workbook-draft/workbook-preview.jpg
# …plus, only after checklist 5a: git add private-assets/discernment-workbook.pdf

# 4. feat-cross-sells — success-page cross-sells (Letters signup, readings links)
git add src/app/booking/success/page.tsx src/app/booking/success/layout.tsx \
        src/app/shop/success/page.tsx src/components/MerchPaymentStatus.tsx

# 5. feat-gift-recovery — gift readings + abandoned-booking recovery
git add src/lib/gift.ts src/lib/gift-orders.ts src/lib/brevo-events.ts \
        src/app/gift/page.tsx src/app/gift/GiftBuyButton.tsx src/app/gift/success/page.tsx \
        src/app/api/gift/checkout/route.ts src/app/api/gift/status/route.ts \
        src/app/api/checkout/route.ts src/app/api/stripe/webhook/route.ts \
        src/lib/booking-fulfillment.ts \
        src/tests/gift.cjs src/tests/recovery.cjs src/tests/business.cjs

# 6. feat-city-sitemap-letters — 45 city pages, sitemap entries, Letters page
git add src/lib/city-pages.ts src/app/sitemap.ts \
        src/app/letters/page.tsx src/components/LettersContent.tsx src/components/LettersIllustration.tsx \
        src/tests/city-pages.cjs

# 7. chore-handoff-docs — this document + PLAN.md status
git add docs/maintenance-handoff.md PLAN.md
```

---

## 8. Recurring maintenance runbook

**Weekly**
- Support Claude's weekly marketing plan (items land in `marketing-team/approvals/queue.md`).
- Check `GET /api/availability?duration=60&title=The%20Narrative%20Deep-Dive` returns real slots; if empty or erroring, confirm Cal.com availability with Kali (open item in PLAN.md).

**Monthly**
- GA4 funnel review: `generate_lead` → `begin_checkout` → `purchase`, segmented by UTM source (Stripe metadata `utmSource` on sessions; Brevo attributes on contacts).
- Review `booking_leads` in Firestore: abandonment rate (`checkout_started` vs `abandoned` vs `paid`) and whether `booking_abandoned` events are reaching Brevo.

**One-time**
- Complete a live merch test order end-to-end (quote → Stripe → webhook → admin review → Printify held order) to unblock shop campaigns.
- Collect 2–3 real client testimonials **with written permission** — the claims file allows testimonials only then.
- Update `marketing-team/context/brand/claims-and-compliance.md` when Kali confirms credentials, so the `[unverified]`/`[gap]` tags can be resolved.

---

## 9. How to make common changes

- **Add/change an offering price:** edit `src/lib/offerings.ts` (`price` string; cents derive via `parseCurrencyToCents`). Then update `marketing-team/context/brand/offers.md`, the price asserts in `src/tests/business.cjs` (currently `25000`/`45000`), and — for gift parity — `src/lib/gift.ts` tiers. Workbook price lives in `src/lib/workbook.ts` (`priceCents`) plus the literal `39` in `src/app/workbook/success/page.tsx` and `src/app/workbook/WorkbookBuyButton.tsx` analytics calls.
- **Add a city page:** the city must exist in `src/lib/pseo-data.ts` `CITIES`; add it to `retainedTarotCities` in `src/lib/city-pages.ts` (choose `tarot-reading` or `private-tarot-reading` slug). Copy comes from `getCityContent` in `src/lib/service-page-content.ts`. Update the `45` count assert in `src/tests/city-pages.cjs`. Sitemap and redirects pick it up automatically.
- **Publish a blog post:** use the admin flow (`/admin`, Firebase Auth) → `/api/blog-posts`; schema is `postInputSchema` in `src/lib/published-blog.ts` (title, slug, content, excerpt, category, `status: "draft" | "published"`). Published posts appear in the sitemap automatically.
- **Add a merch product:** add it to `src/lib/merch-products.ts` (Printify `productId`, `allowedVariantIds`, `kind` drives the Stripe tax code), then run the `printify` and `merch-orders` suites.

---

## 10. Known nits & backlog

1. `/booking/success` emits `purchase` with `value: 0` on full-gift redemptions (booking `priceCents` = `amount_total` = 0). Decide whether to suppress or revalue at the gift amount.
2. Anonymous API callers share idempotency keys `workbook-anon` / `gift-<tier>-anon` when `purchaseId` is omitted. The shipped client buttons always send a `crypto.randomUUID()` `purchaseId`, so this only affects direct API use.
3. Dead fallback `metadata.notes` in `src/lib/booking-fulfillment.ts` (`hold?.notes ?? metadata.notes ?? ""`) — `/api/checkout` deliberately never puts `notes` in Stripe metadata (asserted in tests); intake notes live on the `booking_slots` hold.
4. `src/lib/pseo-generated-content.ts` contains dormant banned-word copy ("therapy" framing in generated FAQ text). It is **imported nowhere** — verify it stays unused or delete it.
5. `private-assets/discernment-workbook.pdf` must be rebuilt and recommitted whenever `workbook-draft/` content changes (checklist 5a commands).

---

## 11. Agent lanes

| Area | Claude (Marketing) | Codex (Infra & Products) | Gemini / `agy` (Google & SEO) |
|---|---|---|---|
| Brand OS & copy QA (`marketing-team/`) | **Primary** | reads AGENTS.md | reads AGENTS.md |
| Brevo campaigns, templates & automations | **Primary** | API contact sync (`src/lib/email-signup.ts`) | secret/env config (`apphosting.yaml`) |
| Social scripts | **Primary** | | |
| Next.js app, Stripe, Cal.com, Printify | | **Primary** | |
| Business test suite (`src/tests/business.cjs`) | | **Primary** | runs before every push |
| Firebase (App Hosting, Firestore, Auth) | | | **Primary** |
| GA4 / GTM analytics & funnel | | | **Primary** |
| Search Console, sitemap, schema, CWV | | | **Primary** |
| Gemini AI blog generator (`/api/generate-post`) | | | **Primary** |

This change set (workbook, gift, recovery, analytics, funnel compliance) was **Codex-lane infrastructure**. Marketing promotion of the workbook and gift readings requires **Claude-lane copy QA against `marketing-team/context/brand/offers.md` once the owner approves the prices** (checklist 5f) — until then the offers exist in code but are not approved for campaigns.

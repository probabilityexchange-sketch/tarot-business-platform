# kalimeister.com 30/60/90 Day Marketing Calendar
## Execution Plan — Kali Meister Tarot & Spiritual Services

---

## Revenue Goal

$250/hr × 10 sessions/week = **$10,000/month**

---

## Month 1: Foundation (Week 1-4)

### Week 1: Deploy Email Funnel + Fix Missing Pieces

**Goal:** Get the existing infrastructure live. The funnel is built — just needs to go live.

| Day | Task | Owner | Done |
|-----|------|-------|------|
| Mon | Get RESEND_API_KEY from resend.com (free tier: 100 emails/day) | Billy | ☐ |
| Mon | Get FIREBASE_SERVICE_ACCOUNT_KEY from Firebase Console > Project Settings > Service Accounts | Billy | ☐ |
| Tue | Add env vars to Firebase Functions: `RESEND_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_KEY` | Billy | ☐ |
| Tue | Add env var to Next.js: `FIREBASE_SERVICE_ACCOUNT_KEY` (server-side only, never NEXT_PUBLIC_) | Billy | ☐ |
| Wed | Test the full subscribe flow: submit email → check Firestore → verify welcome email received | Billy | ☐ |
| Thu | If emails land in spam: set up SPF/DKIM/DMARC records in Resend dashboard | Billy | ☐ |
| Fri | Verify the free guide ("Awaken Your Intuition") is actually delivered — is it an attachment or a link? Confirm the welcome email contains it or a download link | Billy | ☐ |
| Mon-Fri | **Daily:** Post 1x AI avatar video (scripts from `kali-ai-avatar-workflow.md`) | Kali/AI | ☐ |

**RESEND SETUP STEPS:**
1. Go to [resend.com](https://resend.com) → Sign up (use randichatagent@gmail.com)
2. Add a domain (kalimeister.com) OR just use `onboarding@resend.dev` to start
3. Create an API key → copy it
4. Add to Firebase: `firebase functions:config:set resend.key="re_xxxxx"` or use Firebase App Hosting env vars
5. Update `functions/src/index.ts` if FROM_EMAIL needs to change to a custom domain

**FIREBASE SERVICE ACCOUNT SETUP:**
1. Go to [console.firebase.google.com](https://console.firebase.google.com) → randi-agency project
2. Project Settings → Service Accounts → Generate new private key
3. Copy the JSON — you'll paste it as the env var value (it's long, format it as a single line)

---

### Week 2: Content Engine + First Leads

**Goal:** Start driving traffic. 2 AI avatar videos/week + 3 Reddit posts.

| Day | Content Task | Platform |
|-----|-------------|---------|
| Mon | Post Script 1 (Daily Card Draw) | Instagram Reels + TikTok |
| Wed | Post Script 2 (Myth Debunk: Tower Card) | Instagram Reels + TikTok |
| Fri | Post Script 3 (Should I Change Careers mini-reading) | Instagram Reels + TikTok |
| Sat | Engage in r/tarot — comment on 10 posts, answer 3 questions | Reddit |
| Sun | Batch produce 4 more scripts for Week 3 | HeyGen/D-ID |

**Reddit Strategy:**
- Go to r/tarot, r/spirituality, r/psychic
- Sort by "new" — answer questions where Kali has expertise
- Don't drop links on day 1. Build karma first.
- Week 3+: include kalimeister.com in profile bio, drop links naturally in helpful answers

---

### Week 3: Email Nurture Live + First Bookings

**Goal:** Get first email subscribers through the funnel. First booking from organic.

| Day | Task |
|-----|------|
| Mon | Post Script 4 (Client Transformation Story) |
| Wed | Post Script 5 (Intuition Exercise) |
| Fri | Post Script 6 ("This Reading Changed My Life") |
| Sat | Answer 5 Reddit questions with a helpful comment that naturally mentions kalimeister.com |
| Sun | Check Firestore: are there subscribers? Are emails being sent? Any errors in Firebase logs? |
| Ongoing | Monitor email deliverability — check Resend dashboard for bounce rates |

**Week 3 Milestone:** First 10 email subscribers. First inquiry from social.

---

### Week 4: Review + Iterate

**Goal:** Measure what's working. Double down on what is.

| Task | Metric to Check |
|------|----------------|
| Which platform got the most views? | Instagram vs TikTok vs Reddit |
| What type of content got the most engagement? | Card draws vs myths vs mini-readings |
| How many email subscribers? | Target: 25 by end of week 4 |
| Did anyone book a session from social? | Track UTM codes if using links |
| Are emails landing in inbox or spam? | Resend dashboard → Deliverability |

**Week 4 Decision:**
- If TikTok is winning → focus 70% there
- If Reddit is driving traffic → spend more time there
- If email opens are low → rewrite subject lines (more curiosity, less spiritual clichés)
- If people are subscribing but not booking → add urgency / limited availability CTA

---

## Month 2: Scale What Works (Week 5-8)

### Week 5-6: Content Cadence Increase

**Goal:** 4 videos/week consistently. Add YouTube Shorts.

| Platform | Posts/Week | Content Type |
|----------|-----------|--------------|
| Instagram Reels | 3 | Card draws, myths, client stories |
| TikTok | 3 | Same content, optimized for TikTok voice/sound |
| YouTube Shorts | 2 | Longer mini-readings (up to 60 sec) |
| Reddit | Daily | Answer 5+ questions, 1 strategic link/week |

**New Content Scripts:**
- "What's your birth card?" → engagement bait
- "Three cards for your next full moon ritual"
- "The one card everyone misreads" series
- "Tarot for entrepreneurs" niche content

---

### Week 7: Referral + Review Campaign

**Goal:** Get past clients to refer new ones. Generate reviews.

**Action:** Kali sends a personal email or text to 10 past clients:
> "Hey [Name], I've been thinking about you. If you've had a great experience working together, I'd love it if you could leave a review on my Google Business Profile or Yelp. It really helps me reach more people who could benefit from our work. Here's the link: [link]"

**Also:** Add a "Refer a Friend" offer — both get $25 off next session. Old clients = warm referrals.

---

### Week 8: Paid Ads Experiment ($0 → $100 test)

**Goal:** Spend $100 on Meta (Instagram/Facebook) ads to test the funnel.

**Ad Creative Test:**
- Video: AI avatar doing a card draw (15 sec)
- Ad Copy: "Curious what the cards have to say? Get a free tarot guide + book a session."
- Landing Page: kalimeister.com (email capture)
- Budget: $10/day for 10 days

**Targeting:** Women 30-55, interested in spirituality, meditation, self-help, astrology. US only.

**If it converts:** Scale to $20/day
**If it doesn't:** Analyze — is the avatar off-putting? Is the offer unclear? Fix and retest.

---

## Month 3: Systematize (Week 9-12)

### Week 9-10: Email Sequence Optimization

**Goal:** Improve the nurture sequence based on real data.

**Check:**
- Which email has the highest open rate? → Use that subject line style more
- Which email has the highest click rate? → Put that CTA higher in the sequence
- Are people replying to emails? → Respond personally (Kali's thing — she replies)
- What's the unsubscribe rate? → If high, email 3 is too salesy — soften it

**Add a 6th email** if people are buying after the 10-day sequence ends:
> "One more thing..." — last-chance offer with payment plan option

---

### Week 11: YouTube Long-Form

**Goal:** Start YouTube channel with 10-15 min videos.

**Content:**
- "Full Tarot Reading for [Zodiac Sign] — [Month] 2026"
- "What Your Tarot Card of the Year Means"
- "How to Do a Self-Reading at Home — Step by Step"

**Upload 1 video/week.** Promote clips as Shorts on YouTube.

---

### Week 12: Monthly Rhythm Established

**Goal:** Predictable, repeatable system. Kali shows up to sessions. Everything else runs.

| Activity | Frequency | Who Does It |
|----------|-----------|-------------|
| AI avatar videos | 4x/week | Billy (batch produces) |
| Reddit engagement | Daily | Billy (30 min/day) |
| Email sequence monitoring | Weekly | Billy checks Resend + Firestore |
| New YouTube video | 1x/week | Billy (edits/produces with Kali on camera occasionally) |
| Past client outreach | Monthly | Kali (text/email) |
| Funnel review | Monthly | Billy |
| GA4 / analytics review | Monthly | Billy |

---

## Success Metrics Dashboard

| Metric | Month 1 | Month 3 | Month 6 |
|--------|---------|---------|---------|
| Email subscribers | 25 | 150 | 500 |
| Sessions booked | 2 | 8 | 20 |
| Revenue | $500 | $2,000 | $5,000 |
| Instagram followers | 100 | 500 | 1,500 |
| YouTube subscribers | — | 50 | 200 |
| Email open rate | 40% | 45% | 50% |

---

## Key Constraints

1. **Kali's time is limited.** She does sessions + replies to emails she cares about. Everything else is automated or handled by Billy.
2. **No budget for ads initially.** Organic first. Test paid ads in Month 2.
3. **Content consistency is the hard part.** AI avatar solves this. Human involvement = exception handling, not routine production.
4. **Reviews take time.** Start asking after Month 1. First review = social proof engine.

---

## Quick Reference

**kalimeister.com/docs/kali-ai-avatar-workflow.md** — AI avatar scripts and workflow
**kalimeister.com/docs/kali-deployment-guide.md** — Technical setup (this file)
**kalimeister.com/docs/kali-marketing-calendar.md** — This document

**Calendly/Cal.com link for booking:** https://cal.com/kali-meister
**Resend dashboard:** https://resend.com/emails
**Firebase console:** https://console.firebase.google.com/u/0/project/randi-agency/overview
**HeyGen:** https://heygen.com

# kalimeister.com Deployment Guide
## Email Funnel Setup — Firebase Functions + Resend

---

## Overview

The automated email funnel is already built. This guide tells you exactly what to do to get it live. Estimated time: **45 minutes**.

**What this does:**
```
Someone visits kalimeister.com
  → Enters email for free "Intuition Guide"
  → API route writes to Firestore
  → Firebase Function fires
  → 5 emails sent over 10 days
  → Ends with booking CTA
```

**What you need:**
1. Resend API key (free: 100 emails/day)
2. Firebase Service Account key (already have this for randi.agency Firebase project)

---

## Step 1: Get Resend API Key

1. Go to [resend.com](https://resend.com) → Sign up
2. Use `randichatagent@gmail.com` or `billybradshaw@gmail.com`
3. From the dashboard, go to **API Keys** → Create Key
4. Name it `kalimeister-prod`
5. Copy the key — it starts with `re_`

**Free tier:** 100 emails/day. Plenty for an email nurture sequence. If Kali hits 100 subscribers, upgrade to $20/mo unlimited.

---

## Step 2: Configure Firebase Service Account

You should already have this for the randi.agency Firebase project. If not:

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → select `randi-agency` project
2. → **Project Settings** (gear icon) → **Service Accounts**
3. Click **Generate new private key**
4. Save the JSON file

**You'll paste this entire JSON as the env var value.** It must be a single line (we'll handle that).

---

## Step 3: Set Environment Variables

### For Firebase Functions (email sending)

Run these commands from the `tarot-business-platform` directory:

```bash
cd /home/ubuntu/projects/tarot-business-platform

# Set Resend API key
firebase functions:config:set resend.key="re_YOUR_KEY_HERE"

# Set Firebase service account (paste the JSON as a single line)
# First get the JSON, then use it:
firebase functions:config:set firebase.service_account='YOUR_JSON_ON_ONE_LINE'
```

**Alternative: Use Firebase App Hosting env vars**

If using App Hosting (already configured for `kali` backend), go to:
Firebase Console → App Hosting → kali backend → Settings → Environment variables

Add:
- `RESEND_API_KEY` = `re_xxxxx`
- `FIREBASE_SERVICE_ACCOUNT_KEY` = the full JSON on one line

### For Next.js (server-side only — never expose to browser)

In the Firebase Console → App Hosting → Environment variables, also add:
- `FIREBASE_SERVICE_ACCOUNT_KEY` = the same JSON

In `src/app/api/subscribe/route.ts`, this is already wired up:
```typescript
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}");
```

---

## Step 4: Verify the Subscribe Route Works

Test it locally first:

```bash
cd /home/ubuntu/projects/tarot-business-platform

# Start Firebase emulators
firebase emulators:start

# In another terminal, test the subscribe endpoint
curl -X POST http://localhost:5000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@kalimeister.com","source":"test"}'
```

**Expected:** `{"message":"Guide sent! Check your inbox.","success":true}`

Check Firestore at `localhost:8080` (emulator UI) — you should see a new document in `subscribers`.

---

## Step 5: Deploy Firebase Functions

```bash
cd /home/ubuntu/projects/tarot-business-platform

# Install functions deps
cd functions && npm install && cd ..

# Deploy functions only (not hosting — App Hosting handles that)
firebase deploy --only functions
```

**Expected:** `functions[onSubscriberCreated]: Ready` and `functions[processScheduledEmails]: Ready`

---

## Step 6: Test the Full Flow End-to-End

1. Use an incognito browser
2. Go to [kalimeister.com](https://kalimeister.com)
3. Enter your personal email in the lead capture form
4. Check your inbox — you should receive email #1 within 2 minutes
5. Check Firestore → `subscribers` collection → your email document
6. Check Firestore → `scheduledEmails` collection → 4 pending jobs for days 2, 4, 7, 10

**If email #1 doesn't arrive:**
- Check spam folder
- Check Resend dashboard → Logs → any errors?
- Check Firebase Functions logs: `firebase functions:log`

---

## Step 7: Fix Email Deliverability (If Needed)

If emails go to spam:

### In Resend dashboard:
1. Add SPF record: `v=spf1 include:resend.dev ~all`
2. Add DKIM record: Resend provides this in Domain Settings
3. Add DMARC record: `_dmarc.yourdomain.com TXT v=DMARC1; p=quarantine; rua=mailto:you@kalimeister.com`

### In DNS (Cloudflare):
Add these records to kalimeister.com:
- **SPF:** TXT record, name `@`, value `v=spf1 include:resend.dev ~all`
- **DKIM:** CNAME record, Resend provides the name/value pair
- **DMARC:** TXT record, name `_dmarc`, value `v=DMARC1; p=quarantine; rua=mailto:you@kalimeister.com`

---

## Step 8: Verify the Free Guide Delivery

The current welcome email says "Your free guide is attached" but the code doesn't actually attach a PDF.

**Option A (Quick):** Change the email to say "Download your free guide here: [link]" and host the PDF on Google Drive or kalimeister.com.

**Option B (Proper):** Upload the PDF to Firebase Storage or a CDN, add the URL to the email content.

**The PDF needs to exist.** Does Kali have the "Awaken Your Intuition" guide ready? If not, she needs to create it — a simple PDF with 3 exercises works.

---

## Monitoring After Launch

### Where to check things:

| Tool | URL | What |
|------|-----|------|
| Resend dashboard | [resend.com/emails](https://resend.com/emails) | Email logs, bounces, deliverability |
| Firebase console | [console.firebase.google.com](https://console.firebase.google.com) → randi-agency → Functions | Function logs, errors |
| Firestore | Console → Build → Firestore | Subscriber data, scheduled emails |
| App Hosting | Console → App Hosting | Deploy status, env vars |

### Key logs to watch:
```bash
# Watch function logs in real time
firebase functions:log --only onSubscriberCreated,processScheduledEmails
```

---

## Common Errors

### "Cannot read property 'email' of undefined"
→ The Firestore document doesn't have an `email` field. Check the subscribe route — is it writing the right data?

### "FIREBASE_SERVICE_ACCOUNT_KEY is not set"
→ The env var isn't configured in App Hosting. Double-check the Firebase Console → App Hosting → kali backend → Environment variables.

### "Resend API key invalid"
→ The `RESEND_API_KEY` in Firebase Functions config doesn't match the key from resend.com. Re-run `firebase functions:config:set`.

### "Email sent but not received"
→ Check Resend logs. If it says "sent," the problem is spam filtering. Add SPF/DKIM/DMARC records.

---

## Rollback

If something breaks and you need to undeploy the functions:

```bash
firebase functions:delete onSubscriberCreated
firebase functions:delete processScheduledEmails
```

This stops all automated emails. Subscribers still get the first email before unsubscribing — the function only fires on document creation, so existing scheduled emails already in Firestore will still send.

To stop those: delete all documents in `scheduledEmails` collection where `status == "pending"`.

---

## Environment Variables Summary

| Variable | Where Set | Value | Used By |
|----------|-----------|-------|---------|
| `RESEND_API_KEY` | Firebase Functions config / App Hosting env | `re_xxxxx` | Firebase Functions |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | App Hosting env vars | Full JSON, one line | Next.js API routes (server only) |
| `NEXT_PUBLIC_BASE_URL` | App Hosting env vars | `https://kalimeister.com` | Firebase Functions (`BASE_URL` fallback) |

# kalimeister.com Deployment Guide
## Email Funnel Setup — Firebase Functions + Brevo

---

## Overview

The automated email funnel is already built and deployed to the `kalimeister` Firebase project. This guide covers what to verify and what to do if something breaks.

**The flow:**
```
Someone visits kalimeister.com
  → Enters email for free "Intuition Guide"
  → API route writes to kalimeister Firestore (subscribers collection)
  → onSubscriberCreated function fires (kalimeister project)
  → Brevo sends welcome email immediately
  → 4 more emails scheduled for days 2, 4, 7, 10
  → Ends with booking CTA
```

**Current status (April 16, 2026):**
- Brevo API key: `xkeysib-db29a2d3942dd5e2754889d3074509d71f6a7a393a7e698a3956578f7dc140df` ✓
- BREVO_API_KEY secret set in kalimeister project ✓
- onSubscriberCreated deployed to kalimeister ✓
- processScheduledEmails deployed to kalimeister ✓
- Frontend writes to kalimeister Firestore ✓

---

## What Needs to Happen Before Launch

### 1. Verify kalimeister.com as a Sender Domain in Brevo

Right now Brevo is in test mode — it only sends to email addresses you've explicitly authorized. To send to any subscriber (the whole point), you need to verify ownership of `kalimeister.com`.

**Steps:**
1. Log into Brevo → Settings → Sender Domains → Add domain
2. Enter `kalimeister.com`
3. Brevo gives you 2 DNS records to add (TXT and CNAME)
4. Go to Cloudflare → DNS for kalimeister.com → add those records
5. Click "Verify" in Brevo (can take up to 24hrs but usually fast)

**Why this matters:** Without domain verification, emails go to spam or get blocked for most subscribers.

### 2. Add kali@kalimeister.com as a Sender

In Brevo → Settings → Sender Emails → Add:
- Email: `kali@kalimeister.com`
- Name: `Kali Meister`

You'll get a verification email — click the link.

---

## Where Everything Lives

| Component | Project | Location |
|-----------|---------|----------|
| Website frontend | kalimeister | kali--kalimeister.us-east4.hosted.app |
| Cloud Functions (email) | kalimeister | us-central1 |
| Firestore (subscribers) | kalimeister | kalimeister project |
| App Hosting backend | kalimeister | Firebase Console → App Hosting |
| Brevo account | brevo.com | API key in Secrets Manager |

---

## Monitoring

### Check function logs:
```bash
# Install firebase-tools first if needed
npm install -g firebase-tools

# Set your CI token (from firebase login:ci)
export FIREBASE_TOKEN="1//01aodeOpPmKzy..."

# Watch logs
firebase-tools functions:log --only onSubscriberCreated,processScheduledEmails --project kalimeister
```

### Check Brevo email logs:
- Brevo dashboard → Campaign → Transactional → check sent/delivered/bounced

### Check Firestore:
- Firebase Console → Build → Firestore → Database
- `subscribers` collection — every person who's signed up
- `scheduledEmails` collection — pending follow-up emails

---

## If the Funnel Stops Working

** Symptom: New subscriber but no welcome email**

1. Check Brevo logs — did the API call even reach them?
2. Check Firebase function logs — did the function fire?
3. Check Firestore — is the subscriber doc there with `emailSequence: "welcome"`?
4. Check the function's error log for BREVO_API_KEY issues

** Symptom: "Permission denied" on Brevo API**
→ The BREVO_API_KEY secret might have been rotated. Re-set it:
```bash
export FIREBASE_TOKEN="1//01aodeOpPmKzy..."
echo "YOUR_BREVO_KEY" | firebase-tools apphosting:secrets:set BREVO_API_KEY --data-file - --project kalimeister --force
```

** Symptom: Function not firing at all**
→ The Firestore trigger might have lost its Eventarc connection. Redeploy:
```bash
export FIREBASE_TOKEN="1//01aodeOpPmKzy..."
firebase-tools deploy --only functions:onSubscriberCreated,functions:processScheduledEmails --project kalimeister
```

---

## The Free Guide ("Awaken Your Intuition" PDF)

The welcome email says the guide is attached, but currently nothing is attached. Subscribers get a text/HTML email directing them to reply if they have questions.

**To add an actual PDF attachment:**
1. Upload the PDF somewhere accessible (Firebase Storage, Google Drive public link, or kalimeister.com/assets)
2. Update the email content in `functions/src/index.ts` to link to it
3. Redeploy the functions

Does Kali have this guide ready?

---

## Environment Variables Reference

| Variable | Project | How Set | Value |
|----------|---------|---------|-------|
| BREVO_API_KEY | kalimeister | Cloud Secret Manager | `xkeysib-...` |
| FIREBASE_SERVICE_ACCOUNT_KEY | kalimeister | App Hosting env vars | JSON, one line |
| NEXT_PUBLIC_BASE_URL | kalimeister | App Hosting env vars | `https://kalimeister.com` |

---

## Rollback

To stop the funnel entirely:
```bash
export FIREBASE_TOKEN="1//01aodeOpPmKzy..."
firebase-tools functions:delete onSubscriberCreated --region us-central1 --project kalimeister
firebase-tools functions:delete processScheduledEmails --region us-central1 --project kalimeister
```

This stops new emails. Existing scheduled emails in Firestore will still fire — delete them manually in the Firebase Console if you need to stop those too.

import { setGlobalOptions } from "firebase-functions/v2";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as brevo from "@getbrevo/brevo";

setGlobalOptions({ maxInstances: 10 });

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || "");

const FROM_EMAIL = { email: "noreply@kalimeister.com", name: "Kali Meister" };
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://kalimeister.com";

// Email sequence templates - 5 emails over 10 days
const emailSequence = [
  {
    subject: "Welcome to Your Intuition Journey 🃏",
    delayHours: 0,
    content: `Welcome! Your free guide "Awaken Your Intuition" is attached.

Inside, you'll find three powerful exercises to start unlocking your natural psychic abilities. These are techniques I've refined over 40 years of practice.

After you read through it, I'd love to hear what resonates with you. Just reply to this email.

With intention,
Kali`,
  },
  {
    subject: "The Tarot Card That Reveals Your Hidden Strength",
    delayHours: 24 * 2, // Day 2
    content: `Day 2 of your intuition journey.

I want to share something that often surprises my clients: the tarot isn't about predicting your future. It's about revealing what's already true in your subconscious.

The card I'm thinking of today is THE HIGH PRIESTESS - she represents intuition, mystery, and the wisdom that lives within you.

If you haven't already, check your inbox tomorrow for a special offer I think you'll love.

With intention,
Kali`,
  },
  {
    subject: "Ready for deeper clarity?",
    delayHours: 24 * 4, // Day 4
    content: `A quick question:

Are you feeling stuck right now? Like something in your life needs to shift, but you're not sure what?

That's exactly what a personal tarot reading can help with. It's not fortune-telling - it's using archetypes as mirrors to see your situation more clearly.

I offer two options:
- The Narrative Deep-Dive (50 min, $250) - Perfect for getting clarity on a specific situation
- Shadow Work Intensive (90 min, $450) - For those ready to go deeper

Book your session here: ${BASE_URL}/readings

With intention,
Kali`,
  },
  {
    subject: "What my clients discover in a reading",
    delayHours: 24 * 7, // Day 7
    content: `Week one is almost complete.

I wanted to share a few things my clients often discover in our sessions:

- Patterns from childhood that are still running your decisions
- Hidden beliefs about money, love, or career that are blocking your growth
- A fresh perspective on a relationship or situation that's been stuck
- Clarity on next steps during a major life transition

The beautiful thing is - you don't need to "believe in" tarot for it to work. It's really about self-reflection and pattern recognition.

Ready to explore? ${BASE_URL}/readings

With intention,
Kali`,
  },
  {
    subject: "Your intuition is waiting (last chance for this offer)",
    delayHours: 24 * 10, // Day 10
    content: `This is my last email in this welcome sequence (but I'll still be here if you reply!).

I know I've been sharing about my readings - that's because I genuinely believe they can help. But more importantly, I want you to find what works for YOU.

Whether that's a reading with me, working through the exercises in your free guide, or something else entirely - trust your gut.

If a reading does call to you, I'd love to work with you. My next available slots are on my calendar.

Book here: ${BASE_URL}/readings

With intention,
Kali

P.S. - If cost is a concern, I do offer payment plans. Just reply and ask.`,
  },
];

// Trigger when a new subscriber is created in Firestore
export const onSubscriberCreated = onDocumentCreated(
  "subscribers/{subscriberId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();
    const email = data.email;
    const trigger = data.emailSequence || "welcome";

    console.log(`New subscriber: ${email}, trigger: ${trigger}`);

    // Only send welcome sequence if triggered
    if (trigger !== "welcome") {
      console.log("Skipping email sequence - trigger:", trigger);
      return;
    }

    // Send first email immediately
    await sendEmail(email, emailSequence[0]);

    // Schedule the rest using Firestore document timestamps
    const db = require("firebase-admin").firestore();
    const batch = db.batch();

    for (let i = 1; i < emailSequence.length; i++) {
      const scheduledFor = new Date();
      scheduledFor.setHours(scheduledFor.getHours() + emailSequence[i].delayHours);

      const scheduledJobRef = db.collection("scheduledEmails").doc();
      batch.set(scheduledJobRef, {
        to: email,
        subject: emailSequence[i].subject,
        content: emailSequence[i].content,
        scheduledFor: scheduledFor,
        status: "pending",
        sequenceType: "welcome",
        step: i,
        createdAt: new Date(),
      });
    }

    await batch.commit();

    // Update subscriber status
    await snapshot.ref.update({
      sequenceStartedAt: new Date(),
      sequenceStatus: "active",
      sequenceStep: 0,
    });

    console.log(`Email sequence started for ${email}`);
  }
);

async function sendEmail(to: string, template: { subject: string; content: string }) {
  try {
    const result = await apiInstance.sendTransacEmail({
      sender: FROM_EMAIL,
      to: [{ email: to }],
      subject: template.subject,
      htmlContent: template.content.replace(/\n/g, "<br>"),
    });

    console.log(`Email sent to ${to}:`, result.body?.messageId);
    return result;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
}

// Process scheduled emails - this should be triggered by a scheduled job
// For now, it's a Firestore trigger that runs on document creation
// In production, use Cloud Scheduler to call this
export const processScheduledEmails = onDocumentCreated(
  "scheduledEmails/{jobId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();

    // Only process if pending and scheduled time has passed
    if (data.status !== "pending") return;
    
    const scheduledTime = new Date(data.scheduledFor).getTime();
    const now = Date.now();
    
    if (scheduledTime > now) {
      // Not time yet - skip (could retry later)
      console.log(`Email to ${data.to} not ready yet, scheduled for ${data.scheduledFor}`);
      return;
    }

    await sendEmail(data.to, { subject: data.subject, content: data.content });

    await snapshot.ref.update({ 
      status: "sent", 
      sentAt: new Date() 
    });
    
    console.log(`Scheduled email sent to ${data.to}`);
  }
);

// Manual function to process all pending emails (can be called via HTTP or cron)
export const processAllPendingEmails = async () => {
  const db = require("firebase-admin").firestore();
  const now = new Date();
  
  const pending = await db.collection("scheduledEmails")
    .where("status", "==", "pending")
    .where("scheduledFor", "<=", now)
    .get();
  
  console.log(`Found ${pending.size} pending emails to send`);
  
  for (const doc of pending.docs) {
    const data = doc.data();
    try {
      await sendEmail(data.to, { subject: data.subject, content: data.content });
      await doc.ref.update({ status: "sent", sentAt: new Date() });
    } catch (error) {
      console.error(`Failed to send to ${data.to}:`, error);
      await doc.ref.update({ status: "failed", error: String(error) });
    }
  }
};
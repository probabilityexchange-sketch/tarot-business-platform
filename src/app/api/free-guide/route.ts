import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not set");
      return Response.json(
        { error: "Email service not configured. Contact support." },
        { status: 503 }
      );
    }

    const resend = new Resend(resendApiKey);
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Invalid email address" }, { status: 400 });
    }

    const guideContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif;
        line-height: 1.6;
        color: #1a1a1a;
        background-color: #fafafa;
        margin: 0;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: white;
        border-radius: 12px;
        padding: 40px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      h1 {
        color: #ec4899;
        font-size: 32px;
        margin-bottom: 20px;
        font-style: italic;
      }
      h2 {
        color: #1a1a1a;
        font-size: 20px;
        margin-top: 30px;
        margin-bottom: 15px;
        border-bottom: 2px solid #ec4899;
        padding-bottom: 10px;
      }
      p {
        margin: 12px 0;
        color: #4a5568;
        font-size: 16px;
      }
      .step {
        background-color: #faf5ff;
        border-left: 4px solid #ec4899;
        padding: 20px;
        margin: 15px 0;
        border-radius: 4px;
      }
      .step-title {
        color: #ec4899;
        font-weight: 600;
        font-size: 18px;
        margin-bottom: 10px;
      }
      .quote {
        font-style: italic;
        color: #718096;
        margin: 20px 0;
        padding-left: 20px;
        border-left: 3px solid #ec4899;
      }
      .cta-section {
        background-color: #f5f0ff;
        padding: 20px;
        border-radius: 8px;
        margin-top: 30px;
        text-align: center;
      }
      .cta-link {
        display: inline-block;
        background-color: #ec4899;
        color: white;
        padding: 12px 30px;
        border-radius: 8px;
        text-decoration: none;
        margin-top: 15px;
        font-weight: 600;
      }
      .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
        text-align: center;
        color: #a0aec0;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Awaken Your Intuition</h1>
      <p>Thank you for downloading this exclusive guide. Inside, you'll discover 3 powerful steps to unlock your psychic abilities and strengthen your intuitive powers.</p>

      <h2>The 3 Steps to Awakening Your Intuition</h2>

      <div class="step">
        <div class="step-title">Step 1: Clear Your Energy</div>
        <p>Before developing your intuitive abilities, you must release blockages. Spend 10 minutes in quiet meditation. Visualize any negative energy as mist leaving your body with each exhale. Follow with a simple grounding practice: place your bare feet on earth, or visualize roots extending from your feet into the ground.</p>
        <p><strong>Daily practice:</strong> 5-10 minutes of grounding meditation.</p>
      </div>

      <div class="step">
        <div class="step-title">Step 2: Activate Your Third Eye</div>
        <p>Your intuition is housed in your third eye chakra, located between your eyebrows. Gently focus your attention there during meditation. Use affirmations like "I trust my inner wisdom" and "My intuition guides me." You may experience tingling, warmth, or visual impressions—all are normal signs of activation.</p>
        <p><strong>Daily practice:</strong> 15 minutes of third eye meditation with affirmations.</p>
      </div>

      <div class="step">
        <div class="step-title">Step 3: Practice Receptivity</div>
        <p>Intuition cannot be forced—only invited. Practice receiving intuitive downloads by asking a question before sleep and journaling any impressions you wake with. Start small: predict who will text you, sense the energy of a room before entering, or notice synchronicities in your day.</p>
        <p><strong>Daily practice:</strong> Journaling and intuitive exercises.</p>
      </div>

      <div class="quote">
        "Your intuition is not magical thinking—it is your nervous system processing patterns at a speed your conscious mind cannot yet articulate. Trust it."
      </div>

      <h2>Exclusive Wisdom: The Shadow Intuition</h2>
      <p>Many people dismiss their intuitive hits because they contradict logic. This is the "shadow intuition"—the wisdom you fear to name. Your intuition may tell you a relationship isn't working, that you're not aligned with your values, or that a "good opportunity" feels wrong. These signals are often the most important.</p>
      <p>This week, notice which intuitive hits you resist. That resistance is your teacher.</p>

      <h2>Next Steps</h2>
      <p>These practices work best when sustained over 40 days. At the end of this period, you'll notice a significant shift in your clarity, confidence, and ability to sense what's true for you.</p>
      <p>If you're ready to deepen this work with personalized guidance, I offer:</p>
      <ul>
        <li><strong>Intuitive Life Coaching:</strong> 1:1 sessions to unlock your specific gifts</li>
        <li><strong>Psychological Tarot Readings:</strong> 60-minute deep dives into your patterns</li>
        <li><strong>Energy Healing:</strong> Chakra activation and blockage clearing</li>
      </ul>

      <div class="cta-section">
        <p>Ready to go deeper?</p>
        <a href="https://kali--kalimeister.us-east4.hosted.app/readings" class="cta-link">Book a Personal Reading</a>
      </div>

      <div class="footer">
        <p>🔮 This guide is just the beginning. Your intuitive journey awaits.</p>
        <p>Kali Meister | Psychological Tarot & Spiritual Guidance</p>
        <p style="margin-top: 10px; font-size: 12px;">You're receiving this because you signed up for our free guide. <a href="#" style="color: #a0aec0;">Unsubscribe</a></p>
      </div>
    </div>
  </body>
</html>
    `;

    const response = await resend.emails.send({
      from: "Kali <onboarding@resend.dev>",
      to: email,
      subject: "Your Free Intuition Guide - 3 Powerful Steps to Awaken Your Psychic Abilities",
      html: guideContent,
    });

    if (response.error) {
      console.error("Resend error:", response.error);
      return Response.json(
        { error: "Failed to send guide. Please try again." },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: "Guide sent successfully!",
      data: response.data,
    });
  } catch (error) {
    console.error("Free guide API error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

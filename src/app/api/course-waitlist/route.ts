export async function POST(request: Request) {
  try {
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (!brevoApiKey) {
      console.error("BREVO_API_KEY is not set");
      return Response.json(
        { error: "Email service not configured. Contact support." },
        { status: 503 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Invalid email address" }, { status: 400 });
    }

    const waitlistContent = `
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
      .highlight {
        background-color: #faf5ff;
        border-left: 4px solid #ec4899;
        padding: 20px;
        margin: 15px 0;
        border-radius: 4px;
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
      <h1>Welcome to the Waitlist</h1>
      <p>Thank you for your interest in <strong>The Psychological Tarot Method</strong> — our 8-week certification program for therapists, writers, and deep seekers.</p>

      <h2>What's Coming</h2>
      <p>We're curating a small cohort of 15 committed students for the <strong>Autumn 2026</strong> cycle. This intimate group will ensure deep integration, rigorous study, and 1:1 supervision with me throughout the program.</p>

      <div class="highlight">
        <strong>Next Cohort Begins:</strong> October 2026<br />
        <strong>Enrollment:</strong> Limited to 15 students for deep mastery
      </div>

      <h2>The Curriculum</h2>
      <p>You'll move through four foundational modules:</p>
      <ul>
        <li><strong>The Architecture of Archetypes</strong> — Understanding the collective unconscious and the 22 Major Arcana</li>
        <li><strong>The Narrative Mirror</strong> — Technical skills for psychological self-reflection and story-breaking</li>
        <li><strong>Shadow & Light</strong> — Integrating Jungian concepts to dismantle internal resistance</li>
        <li><strong>The Professional Alchemist</strong> — Facilitating sessions for others with ethics and boundaries</li>
      </ul>

      <h2>Why Wait?</h2>
      <p>By joining this waitlist, you'll be the first to know when enrollment opens and will have priority access. You'll also receive exclusive pre-course materials to deepen your preparation.</p>

      <div class="cta-section">
        <p>In the meantime, explore my psychological tarot readings or download the free intuition guide.</p>
        <a href="https://kalimeister.com/readings" class="cta-link">Book a Personal Reading</a>
      </div>

      <div class="footer">
        <p>🔮 Your mastery journey is just beginning.</p>
        <p>Kali Meister | The Psychological Tarot Method</p>
        <p style="margin-top: 10px; font-size: 12px;">You're on the course waitlist. <a href="#" style="color: #a0aec0;">Unsubscribe</a></p>
      </div>
    </div>
  </body>
</html>
    `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let response;
    try {
      response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: "Kali Meister",
            email: process.env.BREVO_FROM_EMAIL || "kali@kalimeister.com",
          },
          to: [{ email }],
          subject: "Welcome to The Psychological Tarot Method Waitlist",
          htmlContent: waitlistContent,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo error:", errorData);
      return Response.json(
        { error: `Email service error: ${errorData.message || "Failed to send email"}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json({
      success: true,
      message: "Welcome to the waitlist!",
      data,
    });
  } catch (error) {
    console.error("Course waitlist API error:", error);
    return Response.json(
      { error: `Internal Error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

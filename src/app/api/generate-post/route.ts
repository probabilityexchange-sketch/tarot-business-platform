import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import { verifyAdminRequest } from "@/lib/admin-auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `You are drafting reflective essays and journal posts for Kali Meister (kalimeister.com), a Tennessee-based writer and spiritual practitioner offering private online tarot readings and reflective writing.

Mission:
Give reflective people in transition calm, honest room to think through a question, a decision, or the story they are living—pairing tarot, conversation, and reflective writing for personal discernment rather than prediction or therapy.

Voice and tone:
- Calm, reflective, plain
- Short declarative sentences, everyday words, warm and clear without hype
- Frame tarot as reflection on a question, a decision, or a story in the present

Hard compliance rules (never violate):
- NEVER call readings "therapy" or medical/mental-health treatment
- NEVER predict outcomes or promise guaranteed results
- NEVER use these banned words: "therapy", "manifest", "destiny", "guaranteed", "unlock", "transform your life"
- Avoid em dashes and generic AI clichés

Content requirements:
- Output valid HTML with proper H2 and H3 heading hierarchy
- Use paragraphs (p tags) for body text
- Aim for 800-1200 words for topic generation
- When generating from a topic: create a complete, thoughtful essay with a clear opening observation, exploration of the question, and a grounded small next step.
- When polishing raw text: preserve the author's voice and intent while tightening clarity and HTML structure.`;

function buildPrompt(mode: "topic" | "text", topic?: string, rawText?: string): string {
  if (mode === "topic") {
    return `${SYSTEM_PROMPT}

Generate a complete blog post on this topic: ${topic}

Return only the HTML content, no markdown or code fences.`;
  }
  return `${SYSTEM_PROMPT}

Polish and enhance this text while preserving the author's voice:

${rawText}

Return only the HTML content, no markdown or code fences.`;
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdminRequest(request);
  if (!isAdmin) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const mode = body.mode || body.type;
  const { topic, rawText } = body;

  if (!mode || (mode === "topic" && !topic) || (mode === "text" && !rawText)) {
    return new Response("Invalid request: mode and topic/rawText required", { status: 400 });
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = buildPrompt(mode, topic, rawText);

  const result = await model.generateContentStream(prompt);
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        const text = chunk.text();
        controller.enqueue(new TextEncoder().encode(text));
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

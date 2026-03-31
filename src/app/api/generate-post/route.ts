import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";
import { getAuth } from "firebase-admin/auth";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
if (!ADMIN_EMAIL) throw new Error("ADMIN_EMAIL env var not set");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  try {
    const decoded = await getAuth().verifySessionCookie(token, true);
    return decoded.email === ADMIN_EMAIL;
  } catch {
    return false;
  }
}

const SYSTEM_PROMPT = `You are an expert content writer specializing in psychological tarot, narrative therapy, and Jungian psychology. 

Your writing style is:
- Premium academic tone with depth and gravitas
- Weaving together esoteric symbolism with psychological insight
- Warm but authoritative, accessible yet sophisticated
- Rich with archetypal imagery and mythological references

Content requirements:
- Output valid HTML with proper H2 and H3 heading hierarchy
- Use paragraphs (p tags) for body text
- Aim for 800-1200 words for topic generation
- Include psychological depth and narrative therapy frameworks
- Ground esoteric concepts in therapeutic relevance

When generating from a topic: Create a complete, polished blog post with compelling introduction, development of themes, and meaningful conclusion.

When polishing raw text: Enhance while preserving the author's voice and intent, improve flow and psychological depth, maintain HTML structure.`;

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
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { mode, topic, rawText } = await request.json();

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

import { z } from "zod";
import { unsubscribe } from "@/lib/email-signup";

export async function POST(request: Request) {
  const parsed = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid link" }, { status: 400 });
  try {
    await unsubscribe(parsed.data.token);
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "We couldn't complete this request. Try again or contact Kali. Confirmation links expire after 24 hours." }, { status: 503 });
  }
}

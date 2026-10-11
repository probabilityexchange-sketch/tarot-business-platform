import { requestSignup } from "@/lib/email-signup";

export async function POST(request: Request) {
  return requestSignup(request, "free-guide");
}

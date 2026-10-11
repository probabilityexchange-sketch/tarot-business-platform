import { EmailSignupForm } from "@/components/EmailSignupForm";

type Props = { source?: string; className?: string; variant?: "default" | "compact" };

export function LeadCaptureForm({ source = "homepage", className = "" }: Props) {
  return <EmailSignupForm source={source} className={className} />;
}

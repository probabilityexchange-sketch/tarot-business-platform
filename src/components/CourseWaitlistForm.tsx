import { EmailSignupForm } from "@/components/EmailSignupForm";

export function CourseWaitlistForm() {
  return <EmailSignupForm source="course-waitlist" audience="course" label="Join the interest list" />;
}

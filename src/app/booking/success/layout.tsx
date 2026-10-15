import type { Metadata } from "next";

export const metadata: Metadata = { title: "Booking confirmation | Kali Meister", robots: { index: false, follow: false } };

export default function BookingSuccessLayout({ children }: { children: React.ReactNode }) {
  return children;
}

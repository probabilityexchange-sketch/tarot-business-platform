import type { Metadata } from "next";
import { MerchCheckout } from "@/components/MerchCheckout";
export const metadata: Metadata = { title: "Shop checkout | Kali Meister", robots: { index: false, follow: false } };
export default function MerchCheckoutPage() { return <MerchCheckout />; }

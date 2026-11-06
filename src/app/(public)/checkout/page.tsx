import type { Metadata } from "next";
import { CheckoutContainer } from "@/containers/checkout/CheckoutContainer";

export const metadata: Metadata = {
  title: "Guest Checkout & Stock Reservation",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutContainer />;
}

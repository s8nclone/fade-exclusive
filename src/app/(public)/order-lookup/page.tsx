import type { Metadata } from "next";
import { OrderLookupContainer } from "@/containers/orders/OrderViewsContainer";

export const metadata: Metadata = {
  title: "Track Your Order",
  description:
    "Look up your Fadé Exclusives order status and bank transfer instructions using your Order Number and Email.",
};

export default function OrderLookupPage() {
  return <OrderLookupContainer />;
}

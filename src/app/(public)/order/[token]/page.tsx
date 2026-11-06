import type { Metadata } from "next";
import { OrderStatusContainer } from "@/containers/orders/OrderViewsContainer";

export const metadata: Metadata = {
  title: "Order Status & Bank Transfer Instructions",
  robots: { index: false, follow: false },
};

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <OrderStatusContainer token={token} />;
}

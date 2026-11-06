import type { Metadata } from "next";
import { ReceiptContainer } from "@/containers/orders/OrderViewsContainer";

export const metadata: Metadata = {
  title: "Official Payment Receipt",
  robots: { index: false, follow: false },
};

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <ReceiptContainer token={token} />;
}

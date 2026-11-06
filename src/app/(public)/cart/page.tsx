import type { Metadata } from "next";
import { CartPageContainer } from "@/containers/content/PublicContentContainers";

export const metadata: Metadata = {
  title: "Shopping Bag",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return <CartPageContainer />;
}

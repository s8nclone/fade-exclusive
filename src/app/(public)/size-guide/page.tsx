import type { Metadata } from "next";
import { SizeGuidePageContainer } from "@/containers/content/PublicContentContainers";

export const metadata: Metadata = {
  title: "Size & Fit Guide",
  description:
    "Standard measurement charts for Fadé Exclusives Agbadas, Senator Sets, and Kaftans.",
};

export default function SizeGuidePage() {
  return <SizeGuidePageContainer />;
}

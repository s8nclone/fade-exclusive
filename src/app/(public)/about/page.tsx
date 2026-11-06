import type { Metadata } from "next";
import { PortfolioShowcase } from "@/components/modules/PortfolioShowcase";

export const metadata: Metadata = {
  title: "Brand & Growth Portfolio 2026 — The Designer & Atelier",
  description:
    "Fadé Exclusives Brand & Growth Portfolio 2026: The Designer, Creative Philosophy, The Fadé Signature, Abuja Atelier Production Capability, and Global Growth Roadmap.",
};

export default function AboutPortfolioPage() {
  return <PortfolioShowcase />;
}

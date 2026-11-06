import type { Metadata } from "next";
import { PressContainer } from "@/containers/content/PublicContentContainers";

export const metadata: Metadata = {
  title: "Press & Editorial Features",
  description:
    "Global press, runway coverage, and cultural recognition of Fadé Exclusives.",
};

export default function PressPage() {
  return <PressContainer />;
}

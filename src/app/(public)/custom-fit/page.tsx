import type { Metadata } from "next";
import { CustomFitContainer } from "@/containers/forms/PublicFormsContainer";

export const metadata: Metadata = {
  title: "Custom Fit & Bespoke Commissions",
  description:
    "Submit your bespoke measurements and occasion details to commission a custom-tailored Fadé Exclusives garment.",
};

export default function CustomFitPage() {
  return <CustomFitContainer />;
}

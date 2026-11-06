import type { Metadata } from "next";
import { ContactContainer } from "@/containers/forms/PublicFormsContainer";

export const metadata: Metadata = {
  title: "Contact The Abuja Atelier",
  description:
    "Book a private fitting appointment in Maitama, Abuja or contact our international concierge.",
};

export default function ContactPage() {
  return <ContactContainer />;
}

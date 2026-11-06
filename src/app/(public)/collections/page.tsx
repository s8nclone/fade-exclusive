import type { Metadata } from "next";
import { CollectionsListContainer } from "@/containers/collections/CollectionsContainer";

export const metadata: Metadata = {
  title: "Collections & Editorial Lookbooks",
  description:
    "Seasonal editorial archives and lookbooks from Fadé Exclusives.",
};

export default function CollectionsPage() {
  return <CollectionsListContainer />;
}

import type { Metadata } from "next";
import { ContentPageContainer } from "@/containers/content/PublicContentContainers";

export const metadata: Metadata = {
  title: "Atelier Policies & Client Terms",
};

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ContentPageContainer slug={slug} />;
}

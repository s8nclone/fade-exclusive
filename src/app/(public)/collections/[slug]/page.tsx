import type { Metadata } from "next";
import { getStore } from "@/server/db/client";
import { CollectionDetailContainer } from "@/containers/collections/CollectionsContainer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = getStore();
  const collection = store.collections.find((c) => c.slug === slug);

  if (!collection) {
    return { title: "Lookbook Not Found" };
  }

  return {
    title: collection.title,
    description: collection.story,
  };
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CollectionDetailContainer slug={slug} />;
}

import type { Metadata } from "next";
import { getStore } from "@/server/db/client";
import { ProductDetailContainer } from "@/containers/products/ProductDetailContainer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = getStore();
  const product = store.products.find((p) => p.slug === slug);

  if (!product) {
    return { title: "Piece Not Found" };
  }

  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.description,
    openGraph: {
      title: product.seoTitle || product.name,
      description: product.seoDescription || product.description,
      images: product.images[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductDetailContainer slug={slug} />;
}

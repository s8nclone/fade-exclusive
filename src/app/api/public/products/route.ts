import { getStore } from "@/server/db/client";
import { mapToProductCardDTO } from "@/server/domain/mappers";
import { handleRouteError, jsonSuccess } from "@/server/security/http";
import { productListQuerySchema } from "@/services/products/products.schema";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const parsed = productListQuerySchema.parse({
      cursor: url.searchParams.get("cursor") ?? undefined,
      limit: url.searchParams.get("limit") ?? 12,
      type: url.searchParams.get("type") || undefined,
      category: url.searchParams.get("category") || undefined,
      q: url.searchParams.get("q") || undefined,
      sort: url.searchParams.get("sort") || "newest",
    });

    const store = getStore();
    let filtered = store.products.filter((p) => p.status === "published");

    if (parsed.type) {
      filtered = filtered.filter((p) => p.type === parsed.type);
    }
    if (parsed.category) {
      filtered = filtered.filter((p) => p.categorySlug === parsed.category);
    }
    if (parsed.q) {
      const qLower = parsed.q.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(qLower) ||
          p.description.toLowerCase().includes(qLower) ||
          p.categoryName.toLowerCase().includes(qLower),
      );
    }

    if (parsed.sort === "price_asc") {
      filtered.sort((a, b) => a.priceMinor - b.priceMinor);
    } else if (parsed.sort === "price_desc") {
      filtered.sort((a, b) => b.priceMinor - a.priceMinor);
    } else {
      filtered.sort((a, b) => a.sortOrder - b.sortOrder);
    }

    let startIndex = 0;
    if (parsed.cursor) {
      const idx = filtered.findIndex((p) => p.id === parsed.cursor);
      if (idx >= 0) {
        startIndex = idx + 1;
      }
    }

    const pageItems = filtered.slice(startIndex, startIndex + parsed.limit);
    const hasMore = startIndex + parsed.limit < filtered.length;
    const nextCursor = hasMore ? (pageItems[pageItems.length - 1]?.id ?? null) : null;

    const items = pageItems.map((p) => mapToProductCardDTO(p, store.promotions));
    const categories = store.categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
    }));

    return jsonSuccess({
      items,
      nextCursor,
      categories,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}

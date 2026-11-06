import { getStore } from "@/server/db/client";
import { mapToProductDetailDTO } from "@/server/domain/mappers";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const store = getStore();
    const product = store.products.find(
      (p) => p.slug === slug && p.status === "published",
    );
    if (!product) {
      throw new ApiError(404, "PRODUCT_NOT_FOUND", "Product not found or archived.");
    }
    return jsonSuccess(mapToProductDetailDTO(product));
  } catch (err) {
    return handleRouteError(err);
  }
}

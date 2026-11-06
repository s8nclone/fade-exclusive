import { getStore } from "@/server/db/client";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const store = getStore();
    const page = store.contentPages.find((p) => p.slug === slug);
    if (!page) {
      throw new ApiError(404, "PAGE_NOT_FOUND", "Policy or content page not found.");
    }
    return jsonSuccess(page);
  } catch (err) {
    return handleRouteError(err);
  }
}

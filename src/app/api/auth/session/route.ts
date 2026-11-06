import { getSessionUser } from "@/server/auth";
import { handleRouteError, jsonSuccess } from "@/server/security/http";

export async function GET() {
  try {
    const user = await getSessionUser();
    return jsonSuccess(
      { user },
      {
        headers: {
          "X-Robots-Tag": "noindex, nofollow",
        },
      },
    );
  } catch (err) {
    return handleRouteError(err);
  }
}

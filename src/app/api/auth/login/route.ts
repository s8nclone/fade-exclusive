import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  authenticateAdminCredentials,
} from "@/server/auth";
import { enforceRateLimit, getClientIp, verifyTurnstileToken } from "@/server/rate-limit";
import { ApiError, handleRouteError } from "@/server/security/http";
import { adminLoginSchema } from "@/services/auth/auth.schema";

export async function POST(request: Request) {
  try {
    enforceRateLimit({
      keyPrefix: "admin-login",
      identifier: getClientIp(request),
      limit: 8,
      windowSeconds: 60,
    });

    const body = await request.json();
    const parsed = adminLoginSchema.parse(body);

    const turnstileOk = await verifyTurnstileToken(parsed.turnstileToken);
    if (!turnstileOk) {
      throw new ApiError(400, "BOT_CHECK_FAILED", "Security check failed.");
    }

    const { user, rawSessionToken, expiresAt } = await authenticateAdminCredentials({
      email: parsed.email,
      password: parsed.password,
    });

    const response = NextResponse.json(
      { data: { user } },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex, nofollow",
        },
      },
    );

    response.cookies.set(ADMIN_SESSION_COOKIE, rawSessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: expiresAt,
    });

    return response;
  } catch (err) {
    return handleRouteError(err);
  }
}

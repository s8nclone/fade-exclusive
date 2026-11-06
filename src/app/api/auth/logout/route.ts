import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, destroyAdminSession } from "@/server/auth";
import { handleRouteError } from "@/server/security/http";

export async function POST(request: Request) {
  try {
    let allDevices = false;
    try {
      const body = (await request.json()) as { allDevices?: boolean };
      allDevices = Boolean(body?.allDevices);
    } catch {
      // ignore empty body
    }

    await destroyAdminSession(allDevices);

    const response = NextResponse.json(
      { data: { ok: true } },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
    response.cookies.delete(ADMIN_SESSION_COOKIE);
    return response;
  } catch (err) {
    return handleRouteError(err);
  }
}

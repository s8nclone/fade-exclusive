import { getEnv } from "@/lib/env";
import { expireOverdueOrders } from "@/server/domain/orders/orders.domain";
import { safeCompare } from "@/server/security/crypto";
import { ApiError, handleRouteError, jsonSuccess } from "@/server/security/http";

function authorizeCron(request: Request): void {
  const env = getEnv();
  const authHeader = request.headers.get("authorization") ?? "";
  const secretHeader = request.headers.get("x-cron-secret") ?? "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const candidate = bearer || secretHeader;

  if (!candidate || !safeCompare(candidate, env.CRON_SECRET)) {
    throw new ApiError(401, "UNAUTHORIZED_CRON", "Invalid cron authorization secret.");
  }
}

export async function POST(request: Request) {
  try {
    authorizeCron(request);
    const result = expireOverdueOrders();
    return jsonSuccess(result);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function GET(request: Request) {
  return POST(request);
}

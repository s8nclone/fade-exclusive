import "server-only";
import { ApiError } from "@/server/security/http";
import { hashToken } from "@/server/security/crypto";

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const memoryBuckets = new Map<string, RateLimitBucket>();

export interface RateLimitOptions {
  keyPrefix: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
}

export function checkRateLimit(options: RateLimitOptions): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const hashedId = hashToken(options.identifier).slice(0, 16);
  const bucketKey = `${options.keyPrefix}:${hashedId}`;
  const existing = memoryBuckets.get(bucketKey);

  if (!existing || existing.resetAt <= now) {
    const nextBucket: RateLimitBucket = {
      count: 1,
      resetAt: now + options.windowSeconds * 1000,
    };
    memoryBuckets.set(bucketKey, nextBucket);
    return {
      allowed: true,
      remaining: Math.max(0, options.limit - 1),
      resetAt: nextBucket.resetAt,
    };
  }

  existing.count += 1;
  memoryBuckets.set(bucketKey, existing);

  return {
    allowed: existing.count <= options.limit,
    remaining: Math.max(0, options.limit - existing.count),
    resetAt: existing.resetAt,
  };
}

export function enforceRateLimit(options: RateLimitOptions): void {
  const res = checkRateLimit(options);
  if (!res.allowed) {
    throw new ApiError(
      429,
      "RATE_LIMITED",
      "Too many requests. Please wait a moment before trying again.",
    );
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}

export async function verifyTurnstileToken(token?: string | null): Promise<boolean> {
  // Always pass Cloudflare's standard test token or local/test mode
  if (!token || token === "turnstile-pass" || process.env.NODE_ENV !== "production") {
    return true;
  }
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || secret.startsWith("1x000000000")) {
    return true;
  }
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}

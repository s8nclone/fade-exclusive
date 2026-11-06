import "server-only";
import { cookies } from "next/headers";
import { getEnv } from "@/lib/env";
import { getStore } from "@/server/db/client";
import {
  generateAccessToken,
  hashToken,
  safeCompare,
  verifyPassword,
} from "@/server/security/crypto";
import { ApiError } from "@/server/security/http";
import { recordAuditLog } from "@/server/audit";

export const ADMIN_SESSION_COOKIE = "fade_admin_session";
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

export interface AdminSessionUser {
  id: string;
  name: string;
  email: string;
  role: "owner" | "manager";
  totpEnabled: boolean;
}

export function isMatchingAdminSlug(candidateSlug: string): boolean {
  const env = getEnv();
  return safeCompare(candidateSlug, env.ADMIN_PATH_SLUG);
}

export async function getSessionUser(): Promise<AdminSessionUser | null> {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    if (!rawToken) return null;

    const tokenHash = hashToken(rawToken);
    const store = getStore();
    const session = store.sessions.get(tokenHash);
    if (!session) return null;

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      store.sessions.delete(tokenHash);
      return null;
    }

    const user = store.users.find((u) => u.id === session.userId && u.isActive);
    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      totpEnabled: user.totpEnabled,
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(options?: {
  roles?: Array<"owner" | "manager">;
}): Promise<AdminSessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication required.");
  }
  if (options?.roles && !options.roles.includes(user.role)) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "You do not have permission to perform this action.",
    );
  }
  return user;
}

export async function authenticateAdminCredentials(params: {
  email: string;
  password: string;
}): Promise<{ user: AdminSessionUser; rawSessionToken: string; expiresAt: Date }> {
  const store = getStore();
  const normalizedEmail = params.email.trim().toLowerCase();
  const user = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);

  // Generic error message to prevent account enumeration (Section 16)
  const genericError = new ApiError(
    401,
    "INVALID_CREDENTIALS",
    "Invalid email or password.",
  );

  if (!user || !user.isActive) {
    throw genericError;
  }

  if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
    throw new ApiError(
      429,
      "ACCOUNT_LOCKED",
      "Account temporarily locked due to repeated failed attempts. Please try again in 15 minutes.",
    );
  }

  const valid = verifyPassword(params.password, user.passwordHash);
  if (!valid) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    }
    throw genericError;
  }

  user.failedLoginAttempts = 0;
  user.lockedUntil = null;

  const rawSessionToken = generateAccessToken();
  const tokenHash = hashToken(rawSessionToken);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  store.sessions.set(tokenHash, {
    userId: user.id,
    tokenHash,
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString(),
  });

  recordAuditLog({
    actorId: user.id,
    actorEmail: user.email,
    actorRole: user.role,
    action: "auth.login",
    entity: "user",
    entityId: user.id,
    summary: `Admin sign-in (${user.role})`,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      totpEnabled: user.totpEnabled,
    },
    rawSessionToken,
    expiresAt,
  };
}

export async function destroyAdminSession(allSessionsForUser = false): Promise<void> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (rawToken) {
    const tokenHash = hashToken(rawToken);
    const store = getStore();
    const current = store.sessions.get(tokenHash);
    if (allSessionsForUser && current) {
      for (const [k, v] of store.sessions.entries()) {
        if (v.userId === current.userId) {
          store.sessions.delete(k);
        }
      }
    } else {
      store.sessions.delete(tokenHash);
    }
  }
}

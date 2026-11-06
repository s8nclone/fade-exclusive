import "server-only";
import { getStore } from "@/server/db/client";
import { hashPassword, verifyPassword } from "@/server/security/crypto";

/** Stable id so seeded audit logs / orders that reference the owner stay linked. */
const OWNER_USER_ID = "usr-owner-01";
const MIN_PASSWORD_LENGTH = 12;

export type OwnerBootstrapResult =
  | { status: "created"; email: string }
  | { status: "updated"; email: string }
  | { status: "unchanged"; email: string }
  | { status: "skipped"; reason: string };

/**
 * Ensures an `owner` admin account exists in the in-memory store, using
 * OWNER_EMAIL / OWNER_PASSWORD / OWNER_NAME from the server environment.
 *
 * Runs once at server startup (see `src/instrumentation.ts`), inside the same
 * Node.js process that serves requests, so the account is visible to the
 * login route. Idempotent: restarting the server re-applies the env values
 * (e.g. after a password change) and clears any lockout on the owner account.
 *
 * Development/testing only. Once Postgres is connected, provision the owner
 * against the database instead.
 */
export function ensureOwnerAccount(
  env: NodeJS.ProcessEnv = process.env,
): OwnerBootstrapResult {
  const email = env.OWNER_EMAIL?.trim().toLowerCase();
  const password = env.OWNER_PASSWORD ?? "";
  const name = env.OWNER_NAME?.trim() || "Fadé Owner";

  if (!email || !password) {
    return {
      status: "skipped",
      reason:
        "OWNER_EMAIL and OWNER_PASSWORD are not set. Add them to .env.local and restart the server.",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "skipped", reason: `OWNER_EMAIL "${email}" is not a valid email address.` };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      status: "skipped",
      reason: `OWNER_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    };
  }

  const store = getStore();
  const now = new Date().toISOString();
  const existing = store.users.find((u) => u.email.toLowerCase() === email);

  if (existing) {
    if (existing.role !== "owner") {
      return {
        status: "skipped",
        reason: `${email} already belongs to a ${existing.role} account. Use a different OWNER_EMAIL.`,
      };
    }

    const passwordMatches = verifyPassword(password, existing.passwordHash);
    const needsUpdate =
      !passwordMatches ||
      existing.name !== name ||
      !existing.isActive ||
      existing.failedLoginAttempts > 0 ||
      existing.lockedUntil !== null;

    if (!needsUpdate) {
      return { status: "unchanged", email };
    }

    if (!passwordMatches) {
      existing.passwordHash = hashPassword(password);
    }
    existing.name = name;
    existing.isActive = true;
    existing.failedLoginAttempts = 0;
    existing.lockedUntil = null;
    existing.updatedAt = now;
    return { status: "updated", email };
  }

  const idTaken = store.users.some((u) => u.id === OWNER_USER_ID);
  store.users.push({
    id: idTaken ? `usr-owner-${Date.now()}` : OWNER_USER_ID,
    name,
    email,
    passwordHash: hashPassword(password),
    role: "owner",
    isActive: true,
    totpEnabled: false,
    totpSecret: null,
    failedLoginAttempts: 0,
    lockedUntil: null,
    createdAt: now,
    updatedAt: now,
  });

  return { status: "created", email };
}

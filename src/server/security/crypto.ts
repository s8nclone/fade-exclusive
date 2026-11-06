import "server-only";
import crypto from "crypto";

// Unambiguous uppercase alphanumeric alphabet (excludes 0, O, 1, I, L per Section 11.2)
const UNAMBIGUOUS_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function generateReferenceCode(prefix = "FD", length = 6): string {
  const cleanPrefix = prefix
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4) || "FD";
  const bytes = crypto.randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) {
    const byte = bytes[i] ?? 0;
    code += UNAMBIGUOUS_ALPHABET[byte % UNAMBIGUOUS_ALPHABET.length];
  }
  return `${cleanPrefix}-${code}`;
}

export function generateOrderNumber(prefix = "FD"): string {
  const cleanPrefix = prefix
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4) || "FD";
  const bytes = crypto.randomBytes(4);
  let code = "";
  for (let i = 0; i < 4; i++) {
    const byte = bytes[i] ?? 0;
    code += UNAMBIGUOUS_ALPHABET[byte % UNAMBIGUOUS_ALPHABET.length];
  }
  const yearSuffix = new Date().getUTCFullYear().toString().slice(-2);
  return `${cleanPrefix}${yearSuffix}-${code}`;
}

/**
 * Generates a high-entropy >= 128-bit (24-byte = 192-bit) URL-safe random token
 * for order access (/order/[token]) and receipts (/receipt/[token]).
 */
export function generateAccessToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

/**
 * Hashes a secret token or identifier using SHA-256 so raw tokens are never stored in DB.
 */
export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken.trim()).digest("hex");
}

export function hashCustomerIdentifier(emailOrPhone: string): string {
  return crypto
    .createHash("sha256")
    .update(emailOrPhone.trim().toLowerCase())
    .digest("hex");
}

export function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) {
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = parts[1] ?? "";
  const expectedHex = parts[2] ?? "";
  const derivedHex = crypto.scryptSync(password, salt, 64).toString("hex");
  return safeCompare(derivedHex, expectedHex);
}

/**
 * Validates that a banner/redirect CTA URL is either a safe internal path (/...)
 * or an explicit https:// URL. Rejects javascript:, data:, http:, and protocol-relative // URLs.
 */
export function isSafeRedirectOrCtaUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function sanitizePlainText(input: string): string {
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

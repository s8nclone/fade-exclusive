import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

export function normalizePhoneE164(
  rawPhone: string,
  defaultCountry: CountryCode = "NG",
): string | null {
  const trimmed = rawPhone.trim();
  if (!trimmed) return null;
  const parsed = parsePhoneNumberFromString(trimmed, defaultCountry);
  if (!parsed || (!parsed.isValid() && !parsed.isPossible())) {
    return null;
  }
  return parsed.number; // E.164 format e.g. +2348012345678
}

export function toWhatsAppDigits(rawPhone: string, defaultCountry: CountryCode = "NG"): string {
  const normalized = normalizePhoneE164(rawPhone, defaultCountry);
  if (normalized) {
    return normalized.replace(/\D/g, "");
  }
  return rawPhone.replace(/\D/g, "");
}

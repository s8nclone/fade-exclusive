/**
 * Money formatting and minor-unit arithmetic utilities.
 * All monetary amounts are stored and calculated in integer minor units (e.g. kobo / cents).
 */

export function roundHalfUp(value: number): number {
  const sign = value < 0 ? -1 : 1;
  return sign * Math.floor(Math.abs(value) + 0.5);
}

export function toMinorUnits(majorAmount: number): number {
  return roundHalfUp(majorAmount * 100);
}

export function fromMinorUnits(minorAmount: number): number {
  return minorAmount / 100;
}

export function formatMinorCurrency(
  minorAmount: number,
  currency = "NGN",
  locale = "en-NG",
): string {
  const major = fromMinorUnits(minorAmount);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: major % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(major);
  } catch {
    return `${currency} ${major.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }
}

export { formatMinorCurrency as formatMoney };

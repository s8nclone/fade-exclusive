/**
 * WCAG 2.2 AA contrast ratio calculation for customizable banners.
 * Validates 6-digit hex colors (#RRGGBB) and computes relative luminance.
 */

export const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export function isValidHexColor(hex: string): boolean {
  return HEX_COLOR_REGEX.test(hex);
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!isValidHexColor(hex)) return null;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

export function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const transformChannel = (channel: number): number => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  const R = transformChannel(rgb.r);
  const G = transformChannel(rgb.g);
  const B = transformChannel(rgb.b);

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

export function meetsWcagAA(foregroundHex: string, backgroundHex: string, minRatio = 4.5): boolean {
  return getContrastRatio(foregroundHex, backgroundHex) >= minRatio;
}

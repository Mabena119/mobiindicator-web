export const LICENSE_PREFIX = "MK-";

export function isLicenseKey(raw: string): boolean {
  return raw.trim().toUpperCase().startsWith(LICENSE_PREFIX);
}

export function normalizeLicenseKey(raw: string): string {
  return raw.trim().toUpperCase();
}

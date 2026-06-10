export function isLicenseExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() <= Date.now();
}

export function isExpiredApiError(message: string, status: number): boolean {
  if (status !== 403) return false;
  return /expired/i.test(message);
}

export function isRevokedApiError(message: string, status: number): boolean {
  if (status !== 403) return false;
  return /revoked/i.test(message);
}

export function isInactiveLicenseApiError(message: string, status: number): boolean {
  if (status !== 403) return false;
  return /not active(?! on)/i.test(message);
}

export function isInvalidLicenseApiError(message: string, status: number): boolean {
  if (status !== 404) return false;
  return /invalid license key|license key not found|not found/i.test(message);
}

/** Keys that should be removed from the app when the server rejects refresh/connect. */
export function shouldAutoRemoveLicense(message: string, status: number): boolean {
  return (
    isExpiredApiError(message, status) ||
    isRevokedApiError(message, status) ||
    isInactiveLicenseApiError(message, status) ||
    isInvalidLicenseApiError(message, status)
  );
}

export function isDeviceConflictError(message: string, status: number): boolean {
  if (status !== 409) return false;
  return /another device|already activated|already has a license|already been used/i.test(message);
}

export function isAlreadyUsedError(message: string, status: number): boolean {
  if (status !== 409) return false;
  return /already been used/i.test(message);
}

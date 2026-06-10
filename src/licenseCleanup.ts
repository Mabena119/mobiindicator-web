import { ApiError } from "./api";
import { shouldAutoRemoveLicense } from "./licenseExpiry";
import { removeLicense } from "./storage";

/** Drop a saved key when the server says it is gone, revoked, expired, or inactive. */
export async function removeLicenseIfInvalid(code: string, ex: unknown): Promise<boolean> {
  if (!(ex instanceof ApiError)) return false;
  if (!shouldAutoRemoveLicense(ex.message, ex.status)) return false;
  await removeLicense(code);
  return true;
}

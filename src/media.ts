import { API_BASE } from "./config";

export const DEFAULT_MENTOR_LOGO_PATH = "/platform/brand/logo-icon.png";

function apiOrigin(): string {
  return API_BASE.replace(/\/platform\/?$/, "").replace(/\/$/, "");
}

/** True when the mentor has no custom photo (empty, invalid, or platform logo path). */
export function isDefaultMentorLogo(path: string | undefined | null): boolean {
  const trimmed = (path ?? "").trim();
  if (!trimmed) return true;
  return trimmed.includes("logo-icon.png");
}

/** Resolve a profile image path from the platform API to a full URL. */
export function mediaUrl(path: string, cacheBust?: string | number): string {
  const trimmed = (path ?? "").trim();
  if (!trimmed) return "";

  let url = trimmed;
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    const base = apiOrigin();
    const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    if (normalized.startsWith("/platform/")) {
      url = `${base}${normalized}`;
    } else if (normalized.startsWith("/uploads/")) {
      url = `${base}/platform${normalized}`;
    } else {
      url = `${base}${normalized}`;
    }
  }

  if (cacheBust == null || cacheBust === "") return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${encodeURIComponent(String(cacheBust))}`;
}

/** Custom mentor photo URL, or empty when the platform default logo should be used. */
export function mentorPhotoUrl(path: string | undefined | null, cacheBust?: string | number): string {
  if (isDefaultMentorLogo(path)) return "";
  return mediaUrl((path ?? "").trim(), cacheBust);
}

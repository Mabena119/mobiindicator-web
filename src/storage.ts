import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

import type { ConnectResponse, SavedLicense } from "./types";
import { isLicenseExpired } from "./licenseExpiry";

const LICENSES_KEY = "mobi_license_keys";
const DISMISSED_KEYS = "mobi_dismissed_keys";
const LEGACY_CODE_KEY = "mobi_indicator_code";

function webGet(key: string): string | null {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(key);
}

function webSet(key: string, value: string): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key, value);
}

function webRemove(key: string): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(key);
}

async function readRaw(key: string): Promise<string | null> {
  if (Platform.OS === "web") return webGet(key);
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function writeRaw(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    webSet(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function removeRaw(key: string): Promise<void> {
  if (Platform.OS === "web") {
    webRemove(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

function parseCodeList(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === "string" && item.startsWith("MK-"))
      .map((code) => code.trim().toUpperCase());
  } catch {
    return [];
  }
}

async function getDismissedCodes(): Promise<Set<string>> {
  return new Set(parseCodeList(await readRaw(DISMISSED_KEYS)));
}

async function addDismissedCode(code: string): Promise<void> {
  const normalized = code.trim().toUpperCase();
  const dismissed = parseCodeList(await readRaw(DISMISSED_KEYS));
  if (dismissed.includes(normalized)) return;
  dismissed.push(normalized);
  await writeRaw(DISMISSED_KEYS, JSON.stringify(dismissed));
}

async function clearDismissedCode(code: string): Promise<void> {
  const normalized = code.trim().toUpperCase();
  const next = parseCodeList(await readRaw(DISMISSED_KEYS)).filter((c) => c !== normalized);
  await writeRaw(DISMISSED_KEYS, JSON.stringify(next));
}

/** Keys the user removed — catalog sync must not re-add them. */
export async function isLicenseDismissed(code: string): Promise<boolean> {
  const normalized = code.trim().toUpperCase();
  return (await getDismissedCodes()).has(normalized);
}

function parseLicenses(raw: string | null): SavedLicense[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as SavedLicense[];
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const out: SavedLicense[] = [];
    for (const item of parsed) {
      if (typeof item?.code !== "string" || !item.code.trim().toUpperCase().startsWith("MK-")) continue;
      const code = item.code.trim().toUpperCase();
      if (seen.has(code)) continue;
      seen.add(code);
      out.push({
        ...item,
        code,
        feed_code: (item.feed_code ?? "").trim().toUpperCase(),
      });
    }
    return out;
  } catch {
    return [];
  }
}

/** True if this MK- key is already saved on the device. */
export async function hasSavedLicense(code: string): Promise<boolean> {
  const normalized = code.trim().toUpperCase();
  const licenses = parseLicenses(await readRaw(LICENSES_KEY));
  return licenses.some((l) => l.code === normalized);
}

/** True if this indicator feed is already connected on the device. */
export async function hasConnectedFeed(feedCode: string): Promise<boolean> {
  const feed = feedCode.trim().toUpperCase();
  if (!feed) return false;
  const licenses = parseLicenses(await readRaw(LICENSES_KEY));
  return licenses.some((l) => l.feed_code === feed);
}

async function migrateLegacy(): Promise<void> {
  const legacy = await readRaw(LEGACY_CODE_KEY);
  if (!legacy?.trim()) return;
  const code = legacy.trim().toUpperCase();
  const existing = parseLicenses(await readRaw(LICENSES_KEY));
  if (!existing.some((l) => l.code === code)) {
    existing.unshift({
      code,
      name: code,
      indicator_name: "",
      feed_code: "",
      mentor_display_name: "",
      mentor_image: "",
      mentor_phone: "",
      category: "swing",
      plan: "1y",
      plan_label: "1 year",
      expires_at: null,
      mt5_connected: false,
      chart_count: 0,
      saved_at: new Date().toISOString(),
    });
    await writeRaw(LICENSES_KEY, JSON.stringify(existing));
  }
  await removeRaw(LEGACY_CODE_KEY);
}

export async function purgeAutoAddedLicenses(): Promise<string[]> {
  await migrateLegacy();
  const licenses = parseLicenses(await readRaw(LICENSES_KEY));
  const kept = licenses.filter((lic) => !lic.from_catalog && !lic.is_platform_default);
  const removed = licenses.filter((lic) => lic.from_catalog || lic.is_platform_default).map((l) => l.code);
  if (removed.length > 0) {
    await writeRaw(LICENSES_KEY, JSON.stringify(kept));
    for (const code of removed) {
      await addDismissedCode(code);
    }
  }
  return removed;
}

export async function getSavedLicenses(): Promise<SavedLicense[]> {
  await migrateLegacy();
  await purgeAutoAddedLicenses();
  await purgeExpiredLicenses();
  const licenses = parseLicenses(await readRaw(LICENSES_KEY));
  return licenses.sort((a, b) => b.saved_at.localeCompare(a.saved_at));
}

export async function purgeExpiredLicenses(): Promise<string[]> {
  await migrateLegacy();
  const licenses = parseLicenses(await readRaw(LICENSES_KEY));
  const active = licenses.filter((lic) => !isLicenseExpired(lic.expires_at));
  const removed = licenses.filter((lic) => isLicenseExpired(lic.expires_at)).map((lic) => lic.code);
  if (removed.length > 0) {
    await writeRaw(LICENSES_KEY, JSON.stringify(active));
  }
  return removed;
}

export async function upsertLicense(
  code: string,
  session: ConnectResponse,
  opts?: { from_catalog?: boolean; is_platform_default?: boolean },
): Promise<SavedLicense> {
  await migrateLegacy();
  const normalized = code.trim().toUpperCase();
  const all = parseLicenses(await readRaw(LICENSES_KEY));
  const prev = all.find((l) => l.code === normalized);
  const licenses = all.filter((l) => l.code !== normalized);
  const entry: SavedLicense = {
    code: normalized,
    name: session.name,
    indicator_name: session.indicator_name,
    feed_code: session.feed_code,
    mentor_display_name: session.mentor_display_name ?? "",
    mentor_image: session.mentor_image ?? "",
    mentor_phone: session.mentor_phone ?? "",
    category: session.category,
    plan: session.plan,
    plan_label: session.plan_label,
    expires_at: session.expires_at,
    mt5_connected: session.mt5_connected,
    chart_count: session.chart_count,
    saved_at: prev?.saved_at ?? new Date().toISOString(),
    from_catalog: opts?.from_catalog ?? prev?.from_catalog ?? false,
    is_platform_default: opts?.is_platform_default ?? prev?.is_platform_default ?? false,
  };
  licenses.unshift(entry);
  await writeRaw(LICENSES_KEY, JSON.stringify(licenses));
  return entry;
}

export async function upsertLicenseFromCatalog(
  code: string,
  session: ConnectResponse,
  isPlatformDefault = false,
): Promise<SavedLicense> {
  return upsertLicense(code, session, { from_catalog: true, is_platform_default: isPlatformDefault });
}

export async function updateLicense(code: string, session: ConnectResponse): Promise<void> {
  await migrateLegacy();
  const normalized = code.trim().toUpperCase();
  const licenses = parseLicenses(await readRaw(LICENSES_KEY));
  const idx = licenses.findIndex((l) => l.code === normalized);
  if (idx < 0) return;
  licenses[idx] = {
    ...licenses[idx],
    name: session.name,
    indicator_name: session.indicator_name,
    feed_code: session.feed_code,
    mentor_display_name: session.mentor_display_name ?? "",
    mentor_image: session.mentor_image ?? "",
    mentor_phone: session.mentor_phone ?? "",
    category: session.category,
    plan: session.plan,
    plan_label: session.plan_label,
    expires_at: session.expires_at,
    mt5_connected: session.mt5_connected,
    chart_count: session.chart_count,
  };
  await writeRaw(LICENSES_KEY, JSON.stringify(licenses));
}

export type MentorFields = {
  mentor_display_name?: string;
  mentor_image?: string;
  mentor_phone?: string;
};

/** Update mentor display fields without a full connect/refresh response. */
export async function patchLicenseMentor(code: string, fields: MentorFields): Promise<void> {
  await migrateLegacy();
  const normalized = code.trim().toUpperCase();
  const licenses = parseLicenses(await readRaw(LICENSES_KEY));
  const idx = licenses.findIndex((l) => l.code === normalized);
  if (idx < 0) return;

  const next = { ...licenses[idx] };
  let changed = false;

  if (fields.mentor_display_name !== undefined && next.mentor_display_name !== fields.mentor_display_name) {
    next.mentor_display_name = fields.mentor_display_name;
    changed = true;
  }
  if (fields.mentor_image !== undefined && next.mentor_image !== fields.mentor_image) {
    next.mentor_image = fields.mentor_image;
    changed = true;
  }
  if (fields.mentor_phone !== undefined && next.mentor_phone !== fields.mentor_phone) {
    next.mentor_phone = fields.mentor_phone;
    changed = true;
  }

  if (!changed) return;
  licenses[idx] = next;
  await writeRaw(LICENSES_KEY, JSON.stringify(licenses));
}

export async function removeLicense(code: string): Promise<void> {
  await migrateLegacy();
  const normalized = code.trim().toUpperCase();
  const licenses = parseLicenses(await readRaw(LICENSES_KEY)).filter((l) => l.code !== normalized);
  await writeRaw(LICENSES_KEY, JSON.stringify(licenses));
  await addDismissedCode(normalized);
}

/** @deprecated use getSavedLicenses */
export async function getSavedCode(): Promise<string | null> {
  const licenses = await getSavedLicenses();
  return licenses[0]?.code ?? null;
}

/** @deprecated use upsertLicense */
export async function saveCode(code: string): Promise<void> {
  /* kept for compatibility — prefer upsertLicense after connect */
  await writeRaw(LEGACY_CODE_KEY, code.trim().toUpperCase());
}

/** @deprecated use removeLicense */
export async function clearCode(): Promise<void> {
  await removeRaw(LICENSES_KEY);
  await removeRaw(LEGACY_CODE_KEY);
}

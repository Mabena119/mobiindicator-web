import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const DEVICE_KEY = "mobi_device_id";

function randomDeviceId(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `dev_${hex}`;
}

async function readStored(): Promise<string | null> {
  if (Platform.OS === "web") {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(DEVICE_KEY);
  }
  try {
    return await SecureStore.getItemAsync(DEVICE_KEY);
  } catch {
    return null;
  }
}

async function writeStored(id: string): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") localStorage.setItem(DEVICE_KEY, id);
    return;
  }
  await SecureStore.setItemAsync(DEVICE_KEY, id);
}

/** Stable per-installation id used to bind license keys to one app instance. */
export async function getDeviceId(): Promise<string> {
  const existing = await readStored();
  if (existing?.trim()) return existing.trim();
  const id = randomDeviceId();
  await writeStored(id);
  return id;
}

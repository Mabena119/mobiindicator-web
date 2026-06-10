import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

import type { ThemeMode } from "./theme";

const STORAGE_KEY = "mobi_theme";

export async function loadThemeMode(): Promise<ThemeMode> {
  try {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") {
        return localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
      }
      return "light";
    }
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    return raw === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export async function saveThemeMode(mode: ThemeMode): Promise<void> {
  try {
    if (Platform.OS === "web") {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, mode);
      }
      return;
    }
    await SecureStore.setItemAsync(STORAGE_KEY, mode);
  } catch {
    /* ignore */
  }
}

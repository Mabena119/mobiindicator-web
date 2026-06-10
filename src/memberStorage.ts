import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const MEMBER_KEY = "mobi_member_session";

export type MemberSession = {
  email: string;
  subscription_token: string;
};

async function readStored(): Promise<string | null> {
  if (Platform.OS === "web") {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(MEMBER_KEY);
  }
  try {
    return await SecureStore.getItemAsync(MEMBER_KEY);
  } catch {
    return null;
  }
}

async function writeStored(raw: string): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") localStorage.setItem(MEMBER_KEY, raw);
    return;
  }
  await SecureStore.setItemAsync(MEMBER_KEY, raw);
}

async function clearStored(): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof localStorage !== "undefined") localStorage.removeItem(MEMBER_KEY);
    return;
  }
  try {
    await SecureStore.deleteItemAsync(MEMBER_KEY);
  } catch {
    /* ignore */
  }
}

export async function getMemberSession(): Promise<MemberSession | null> {
  const raw = await readStored();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as MemberSession;
    if (!parsed.email?.trim() || !parsed.subscription_token?.trim()) return null;
    return {
      email: parsed.email.trim().toLowerCase(),
      subscription_token: parsed.subscription_token.trim(),
    };
  } catch {
    return null;
  }
}

export async function saveMemberSession(session: MemberSession): Promise<void> {
  await writeStored(
    JSON.stringify({
      email: session.email.trim().toLowerCase(),
      subscription_token: session.subscription_token.trim(),
    }),
  );
}

export async function clearMemberSession(): Promise<void> {
  await clearStored();
}

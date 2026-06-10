import { checkMemberStatus } from "./api";
import { clearMemberSession, getMemberSession, type MemberSession } from "./memberStorage";
import type { MemberStartResponse } from "./types";

export type MemberAuthResult =
  | { kind: "missing" }
  | { kind: "logged_out" }
  | { kind: "ok"; session: MemberSession; status: MemberStartResponse };

/** Verify stored member with server; clear session when email no longer exists. */
export async function resolveMemberAuth(): Promise<MemberAuthResult> {
  const session = await getMemberSession();
  if (!session) return { kind: "missing" };

  const status = await checkMemberStatus(session.email);
  if (status.status === "not_found") {
    await clearMemberSession();
    return { kind: "logged_out" };
  }

  return { kind: "ok", session, status };
}

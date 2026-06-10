import { PLATFORM_BASE } from "./config";
import { getDeviceId } from "./deviceId";
import type { ChartDataResponse, ConnectResponse, AppCatalogResponse, MemberStartResponse } from "./types";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { detail?: string };
    if (typeof body.detail === "string") return body.detail;
  } catch {
    /* ignore */
  }
  return res.statusText || "Request failed";
}

async function appFetch(path: string, params: Record<string, string>): Promise<Response> {
  const deviceId = await getDeviceId();
  const qs = new URLSearchParams({ ...params, device_id: deviceId });
  const sep = path.includes("?") ? "&" : "?";
  return fetch(`${PLATFORM_BASE}${path}${sep}${qs}`);
}

async function appPost(path: string, body: unknown): Promise<Response> {
  const deviceId = await getDeviceId();
  const qs = new URLSearchParams({ device_id: deviceId });
  return fetch(`${PLATFORM_BASE}${path}?${qs}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function startMember(email: string): Promise<MemberStartResponse> {
  const res = await appPost("/member/start", { email: email.trim().toLowerCase() });
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return res.json() as Promise<MemberStartResponse>;
}

export async function checkMemberStatus(email: string): Promise<MemberStartResponse> {
  const deviceId = await getDeviceId();
  const qs = new URLSearchParams({
    email: email.trim().toLowerCase(),
    device_id: deviceId,
  });
  const res = await fetch(`${PLATFORM_BASE}/member/status?${qs}`);
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return res.json() as Promise<MemberStartResponse>;
}

export async function connectCode(raw: string): Promise<ConnectResponse> {
  const code = encodeURIComponent(raw.trim().toUpperCase());
  const res = await appFetch(`/connect/${code}`, {});
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return res.json() as Promise<ConnectResponse>;
}

export async function refreshCharts(code: string): Promise<ConnectResponse> {
  const res = await appFetch("/charts", { code: code.trim().toUpperCase() });
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return res.json() as Promise<ConnectResponse>;
}

export async function fetchCatalog(connectedCodes: string[] = []): Promise<AppCatalogResponse> {
  const connected = connectedCodes.map((c) => c.trim().toUpperCase()).filter(Boolean).join(",");
  const res = await appFetch("/catalog", connected ? { connected } : {});
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return res.json() as Promise<AppCatalogResponse>;
}

export async function fetchChartData(code: string, feedKey: string): Promise<ChartDataResponse> {
  const res = await appFetch("/chart-data", {
    code: code.trim().toUpperCase(),
    feed_key: feedKey,
  });
  if (!res.ok) throw new ApiError(await parseError(res), res.status);
  return res.json() as Promise<ChartDataResponse>;
}

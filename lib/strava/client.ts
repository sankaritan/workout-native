import type {
  RegisterInstallResponse,
  StravaConnectionStatusResponse,
  StravaSyncPayload,
} from "@/lib/strava/types";

const DEFAULT_TIMEOUT_MS = 10000;

export class StravaSyncApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "StravaSyncApiError";
  }
}

function getApiBaseUrl(): string | null {
  const value = process.env.EXPO_PUBLIC_STRAVA_SYNC_API_BASE_URL;
  if (!value) {
    return null;
  }
  return value.replace(/\/+$/, "");
}

function withTimeout(timeoutMs: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

async function requestJson<TResponse>(
  path: string,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<TResponse> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error("Strava sync API is not configured");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    signal: withTimeout(timeoutMs),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new StravaSyncApiError(message || "Strava sync API request failed", response.status);
  }

  return (await response.json()) as TResponse;
}

export function getStravaSyncApiBaseUrl(): string | null {
  return getApiBaseUrl();
}

export async function registerStravaInstall(
  installId: string,
  returnToUrl?: string
): Promise<RegisterInstallResponse> {
  return requestJson<RegisterInstallResponse>("/strava/register-install", {
    method: "POST",
    body: JSON.stringify({
      install_id: installId,
      return_to: returnToUrl,
    }),
  });
}

export async function getStravaConnectionStatus(
  installId: string,
  syncToken: string
): Promise<StravaConnectionStatusResponse> {
  return requestJson<StravaConnectionStatusResponse>(
    `/strava/status?install_id=${encodeURIComponent(installId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${syncToken}`,
      },
    }
  );
}

export async function postStravaSessionSync(syncToken: string, payload: StravaSyncPayload): Promise<void> {
  await requestJson<{ ok: true }>("/strava/sync-session", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${syncToken}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function disconnectStravaInstall(installId: string, syncToken: string): Promise<void> {
  await requestJson<{ ok: true }>("/strava/disconnect", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${syncToken}`,
    },
    body: JSON.stringify({ install_id: installId }),
  });
}

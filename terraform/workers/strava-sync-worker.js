const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
};

function responseJson(data, request, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...JSON_HEADERS,
      ...corsHeaders(request),
      ...extraHeaders,
    },
  });
}

function responseText(request, text, status = 200, contentType = "text/plain; charset=utf-8") {
  return new Response(text, {
    status,
    headers: {
      "content-type": contentType,
      ...corsHeaders(request),
    },
  });
}

function corsHeaders(request) {
  const origin = request.headers.get("origin");
  return {
    "access-control-allow-origin": origin ?? "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "access-control-max-age": "86400",
    vary: "Origin",
  };
}

function parseBearerToken(request) {
  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }
  return header.slice("Bearer ".length).trim();
}

function buildInstallKey(installId) {
  return `install:${installId}`;
}

function buildIdempotencyKey(installId, value) {
  return `sync:${installId}:${value}`;
}

function randomToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sha256(input) {
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function readInstall(env, installId) {
  const raw = await env.STRAVA_SYNC_STATE.get(buildInstallKey(installId));
  return raw ? JSON.parse(raw) : null;
}

async function writeInstall(env, installId, data) {
  await env.STRAVA_SYNC_STATE.put(buildInstallKey(installId), JSON.stringify(data));
}

async function authenticateInstall(request, env, installId) {
  const token = parseBearerToken(request);
  if (!token) {
    return { ok: false, status: 401, message: "Missing bearer token" };
  }

  const record = await readInstall(env, installId);
  if (!record) {
    return { ok: false, status: 404, message: "Install not found" };
  }

  const tokenHash = await sha256(token);
  if (record.token_hash !== tokenHash) {
    return { ok: false, status: 401, message: "Invalid token" };
  }

  return { ok: true, record };
}

function ensureStravaConfig(env) {
  const required = ["STRAVA_CLIENT_ID", "STRAVA_CLIENT_SECRET", "STRAVA_REDIRECT_URI"];
  for (const key of required) {
    if (!env[key]) {
      return `${key} is not configured`;
    }
  }
  return null;
}

function stravaTokenUrl() {
  return "https://www.strava.com/oauth/token";
}

function stravaCreateActivityUrl() {
  return "https://www.strava.com/api/v3/activities";
}

function stravaAuthUrl(params) {
  const query = new URLSearchParams(params);
  return `https://www.strava.com/oauth/authorize?${query.toString()}`;
}

async function refreshTokenIfNeeded(env, installId, record) {
  if (!record.strava || !record.strava.expires_at) {
    return record;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (record.strava.expires_at - 60 > nowSeconds) {
    return record;
  }

  const refreshBody = {
    client_id: env.STRAVA_CLIENT_ID,
    client_secret: env.STRAVA_CLIENT_SECRET,
    grant_type: "refresh_token",
    refresh_token: record.strava.refresh_token,
  };

  const response = await fetch(stravaTokenUrl(), {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(refreshBody),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to refresh Strava token: ${text}`);
  }

  const tokenData = await response.json();
  const nextRecord = {
    ...record,
    connected: true,
    strava: {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: tokenData.expires_at,
      athlete_id: tokenData.athlete?.id ?? record.strava.athlete_id ?? null,
    },
  };

  await writeInstall(env, installId, nextRecord);
  return nextRecord;
}

async function handleRegisterInstall(request, env) {
  let body = null;
  try {
    body = await request.json();
  } catch {
    return responseJson({ error: "Invalid JSON body" }, request, 400);
  }

  const installId = typeof body.install_id === "string" ? body.install_id.trim() : "";
  if (!installId) {
    return responseJson({ error: "install_id is required" }, request, 400);
  }
  const returnTo =
    typeof body.return_to === "string" && body.return_to.trim() !== ""
      ? body.return_to.trim()
      : null;

  const syncToken = randomToken();
  const tokenHash = await sha256(syncToken);
  const existing = (await readInstall(env, installId)) ?? {};

  await writeInstall(env, installId, {
    ...existing,
    install_id: installId,
    token_hash: tokenHash,
    connected: false,
    created_at: existing.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
    return_to: returnTo ?? existing.return_to ?? null,
  });

  const connectUrl = `${new URL(request.url).origin}/strava/connect?install_id=${encodeURIComponent(installId)}`;

  return responseJson({
    connect_url: connectUrl,
    sync_token: syncToken,
  }, request);
}

async function handleConnect(request, env) {
  const configError = ensureStravaConfig(env);
  if (configError) {
    return responseJson({ error: configError }, request, 500);
  }

  const url = new URL(request.url);
  const installId = (url.searchParams.get("install_id") || "").trim();
  if (!installId) {
    return responseJson({ error: "install_id is required" }, request, 400);
  }

  const install = await readInstall(env, installId);
  if (!install) {
    return responseJson({ error: "Unknown install_id" }, request, 404);
  }

  const redirect = stravaAuthUrl({
    client_id: env.STRAVA_CLIENT_ID,
    redirect_uri: env.STRAVA_REDIRECT_URI,
    response_type: "code",
    approval_prompt: "auto",
    scope: "activity:write,activity:read_all",
    state: installId,
  });

  return Response.redirect(redirect, 302);
}

async function handleCallback(request, env) {
  const configError = ensureStravaConfig(env);
  if (configError) {
    return responseText(request, configError, 500);
  }

  const url = new URL(request.url);
  const installId = (url.searchParams.get("state") || "").trim();
  const code = (url.searchParams.get("code") || "").trim();

  if (!installId || !code) {
    return responseText(request, "Missing state or code", 400);
  }

  const install = await readInstall(env, installId);
  if (!install) {
    return responseText(request, "Unknown install id", 404);
  }

  const response = await fetch(stravaTokenUrl(), {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      client_id: env.STRAVA_CLIENT_ID,
      client_secret: env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    return responseText(request, `Failed to exchange OAuth code: ${text}`, 500);
  }

  const tokenData = await response.json();
  await writeInstall(env, installId, {
    ...install,
    connected: true,
    updated_at: new Date().toISOString(),
    strava: {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: tokenData.expires_at,
      athlete_id: tokenData.athlete?.id ?? null,
    },
  });

  const successUrl = install.return_to || env.STRAVA_CALLBACK_SUCCESS_URL;
  if (successUrl) {
    return Response.redirect(successUrl, 302);
  }

  return responseText(request, "Strava connected. You can close this tab.", 200);
}

async function handleStatus(request, env) {
  const url = new URL(request.url);
  const installId = (url.searchParams.get("install_id") || "").trim();
  if (!installId) {
    return responseJson({ error: "install_id is required" }, request, 400);
  }

  const auth = await authenticateInstall(request, env, installId);
  if (!auth.ok) {
    return responseJson({ error: auth.message }, request, auth.status);
  }

  return responseJson({ connected: Boolean(auth.record.connected) }, request);
}

function buildStravaCreatePayload(syncPayload) {
  const startDate = new Date(syncPayload.startTimeIso);
  const startDateLocal = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60 * 1000)
    .toISOString()
    .replace(".000Z", "");

  return {
    name: syncPayload.activityName,
    sport_type: syncPayload.sportType,
    start_date_local: startDateLocal,
    elapsed_time: String(syncPayload.elapsedSeconds),
    trainer: "1",
    description: "Synced from Workout app",
  };
}

async function handleSyncSession(request, env) {
  let syncPayload = null;
  try {
    syncPayload = await request.json();
  } catch {
    return responseJson({ error: "Invalid JSON body" }, request, 400);
  }

  const installId = typeof syncPayload.installId === "string" ? syncPayload.installId.trim() : "";
  if (!installId) {
    return responseJson({ error: "installId is required" }, request, 400);
  }

  const auth = await authenticateInstall(request, env, installId);
  if (!auth.ok) {
    return responseJson({ error: auth.message }, request, auth.status);
  }

  if (!auth.record.connected || !auth.record.strava?.access_token) {
    return responseJson({ error: "Install is not connected to Strava" }, request, 409);
  }

  const idempotencyKey =
    typeof syncPayload.idempotencyKey === "string" ? syncPayload.idempotencyKey.trim() : "";
  if (!idempotencyKey) {
    return responseJson({ error: "idempotencyKey is required" }, request, 400);
  }

  const syncMarker = await env.STRAVA_SYNC_STATE.get(buildIdempotencyKey(installId, idempotencyKey));
  if (syncMarker) {
    return responseJson({ ok: true, already_synced: true }, request);
  }

  const record = await refreshTokenIfNeeded(env, installId, auth.record);
  const stravaPayload = buildStravaCreatePayload(syncPayload);

  const formData = new URLSearchParams(stravaPayload);
  const response = await fetch(stravaCreateActivityUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${record.strava.access_token}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    return responseJson({ error: `Strava create activity failed: ${text}` }, request, 500);
  }

  const created = await response.json();
  await env.STRAVA_SYNC_STATE.put(buildIdempotencyKey(installId, idempotencyKey), "1", {
    expirationTtl: 60 * 60 * 24 * 30,
  });

  // Strava API does not currently expose a guaranteed force-private create flag in docs.
  // Visibility is validated operationally and can be controlled via Strava account defaults.

  return responseJson({
    ok: true,
    strava_activity_id: created.id,
  }, request);
}

async function handleDisconnect(request, env) {
  let body = null;
  try {
    body = await request.json();
  } catch {
    return responseJson({ error: "Invalid JSON body" }, request, 400);
  }

  const installId = typeof body.install_id === "string" ? body.install_id.trim() : "";
  if (!installId) {
    return responseJson({ error: "install_id is required" }, request, 400);
  }

  const auth = await authenticateInstall(request, env, installId);
  if (!auth.ok) {
    return responseJson({ error: auth.message }, request, auth.status);
  }

  await env.STRAVA_SYNC_STATE.delete(buildInstallKey(installId));
  return responseJson({ ok: true }, request);
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request),
      });
    }

    const url = new URL(request.url);

    try {
      if (request.method === "POST" && url.pathname === "/strava/register-install") {
        return handleRegisterInstall(request, env);
      }
      if (request.method === "GET" && url.pathname === "/strava/connect") {
        return handleConnect(request, env);
      }
      if (request.method === "GET" && url.pathname === "/strava/callback") {
        return handleCallback(request, env);
      }
      if (request.method === "GET" && url.pathname === "/strava/status") {
        return handleStatus(request, env);
      }
      if (request.method === "POST" && url.pathname === "/strava/sync-session") {
        return handleSyncSession(request, env);
      }
      if (request.method === "POST" && url.pathname === "/strava/disconnect") {
        return handleDisconnect(request, env);
      }

      return responseJson({ error: "Not found" }, request, 404);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown worker error";
      return responseJson({ error: message }, request, 500);
    }
  },
};

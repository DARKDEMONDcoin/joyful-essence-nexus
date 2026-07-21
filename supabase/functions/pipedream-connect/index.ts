/** @doc Pipedream Connect backend: mint connect links, sync connected accounts, disconnect local accounts, and expose Google Drive upload readiness. */
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { getAuthUser } from "../_shared/auth.ts";
import {
  adminClient,
  getConfiguredSecret,
  getEnv,
  getEnvByTokens,
  providerError,
  readJson,
} from "../_shared/integrationHelpers.ts";

const PD_API = "https://api.pipedream.com";

function projectEnvironment() {
  // Force production. The Pipedream project is configured in Production mode,
  // and sending "development" makes the Connect popup show
  // "Development Mode — Must be signed in to pipedream.com" for regular users.
  const raw = (getEnv(
    "PIPEDREAM_PROJECT_ENVIRONMENT",
    "PIPEDREAM_ENVIRONMENT",
    "PD_ENVIRONMENT",
  ) || "production").toLowerCase();
  return raw === "development" ? "production" : raw;
}

async function credentials() {
  return {
    clientId: await getConfiguredSecret([
      "PIPEDREAM_CLIENT_ID",
      "PIPEDREAM_CONNECT_CLIENT_ID",
      "PIPEDREAM_OAUTH_CLIENT_ID",
      "PD_CLIENT_ID",
    ], {
      all: ["PIPEDREAM", "CLIENT", "ID"],
      prefer: ["CONNECT", "OAUTH"],
      forbidden: ["SECRET", "PROJECT"],
    }),
    clientSecret: await getConfiguredSecret([
      "PIPEDREAM_CLIENT_SECRET",
      "PIPEDREAM_CONNECT_CLIENT_SECRET",
      "PIPEDREAM_OAUTH_CLIENT_SECRET",
      "PD_CLIENT_SECRET",
    ], {
      all: ["PIPEDREAM", "CLIENT", "SECRET"],
      prefer: ["CONNECT", "OAUTH"],
      forbidden: ["PROJECT"],
    }),
    projectId: await getConfiguredSecret([
      "PIPEDREAM_PROJECT_ID",
      "PIPEDREAM_CONNECT_PROJECT_ID",
      "PD_PROJECT_ID",
    ], {
      all: ["PIPEDREAM", "PROJECT", "ID"],
      prefer: ["CONNECT"],
      forbidden: ["CLIENT", "SECRET"],
    }),
    environment: projectEnvironment(),
  };
}

function externalUserId(userId: string) {
  return `megsy_${userId}`;
}

async function pipedreamAccessToken() {
  const { clientId, clientSecret } = await credentials();
  if (!clientId || !clientSecret) {
    throw new Error("Pipedream credentials are missing");
  }
  const res = await fetch(`${PD_API}/v1/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(providerError("Pipedream OAuth", res, text));
  const data = JSON.parse(text || "{}");
  if (!data.access_token) {
    throw new Error("Pipedream OAuth response missing access_token");
  }
  return data.access_token as string;
}

function unwrapAccounts(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.accounts)) return payload.accounts;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function normalizeAccount(raw: any, fallbackExternalUserId: string) {
  const appSlug = raw?.app?.name_slug ?? raw?.app?.slug ?? raw?.app_slug ??
    raw?.appSlug ?? raw?.app?.key;
  const accountId = raw?.id ?? raw?.account_id ?? raw?.accountId ??
    raw?.connected_account_id;
  if (!appSlug || !accountId) return null;
  return {
    app_slug: String(appSlug),
    account_id: String(accountId),
    external_user_id: String(
      raw?.external_user_id ?? raw?.externalUserId ?? fallbackExternalUserId,
    ),
    account_name: raw?.name ?? raw?.account?.name ?? raw?.email ??
      raw?.app?.name ?? String(appSlug),
    healthy: raw?.healthy ?? raw?.status !== "error",
    metadata: raw,
    updated_at: new Date().toISOString(),
  };
}

async function syncAccounts(userId: string) {
  const creds = await credentials();
  if (!creds.projectId || !creds.clientId || !creds.clientSecret) {
    return { synced: false, accounts: [] as any[] };
  }
  const token = await pipedreamAccessToken();
  const externalId = externalUserId(userId);
  const accountHeaders = {
    Authorization: `Bearer ${token}`,
    "x-pd-environment": creds.environment,
  };
  let res = await fetch(
    `${PD_API}/v1/connect/${creds.projectId}/users/${
      encodeURIComponent(externalId)
    }/accounts`,
    {
      headers: accountHeaders,
    },
  );
  if (res.status === 404) {
    const url = new URL(`${PD_API}/v1/connect/${creds.projectId}/accounts`);
    url.searchParams.set("external_user_id", externalId);
    res = await fetch(url, { headers: accountHeaders });
  }
  const text = await res.text();
  if (!res.ok) throw new Error(providerError("Pipedream accounts", res, text));
  const rows = unwrapAccounts(JSON.parse(text || "{}"))
    .map((item) => normalizeAccount(item, externalId))
    .filter(Boolean)
    .map((row) => ({ ...row, user_id: userId }));
  if (rows.length) {
    const { error } = await adminClient()
      .from("pipedream_accounts")
      .upsert(rows, { onConflict: "user_id,app_slug,account_id" });
    if (error) throw error;
  }
  return { synced: true, accounts: rows };
}

async function localAccounts(userId: string) {
  const { data, error } = await adminClient()
    .from("pipedream_accounts")
    .select(
      "id,app_slug,account_id,external_user_id,account_name,healthy,metadata,updated_at",
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const user = await getAuthUser(req);
  if (!user) return jsonResponse({ error: "unauthorized" }, 401);

  try {
    const body = await readJson(req);
    const action = String(body.action ?? "list_accounts");

    if (action === "create_token") {
      const creds = await credentials();
      if (!creds.projectId || !creds.clientId || !creds.clientSecret) {
        return jsonResponse({
          error: "Pipedream backend keys are missing",
          configured: false,
        });
      }
      const token = await pipedreamAccessToken();
      const origin = String(body.redirect_origin ?? req.headers.get("origin") ?? "");
      const callbackUrl = (success: boolean) => {
        if (!origin) return undefined;
        const callbackPath = `/auth/callback/pipedream?success=${success ? "true" : "false"}`;
        // Send Pipedream back to / first, then let the SPA restore the real
        // callback route. This avoids host-level 404s on direct deep links in
        // popup OAuth redirects.
        return `${origin}/?__spa_path=${encodeURIComponent(callbackPath)}`;
      };
      const res = await fetch(
        `${PD_API}/v1/connect/${creds.projectId}/tokens`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "x-pd-environment": creds.environment,
          },
          body: JSON.stringify({
            external_user_id: externalUserId(user.id),
            allowed_origins: origin ? [origin] : undefined,
            success_redirect_uri: callbackUrl(true),
            error_redirect_uri: callbackUrl(false),
            environment: creds.environment,
          }),
        },
      );
      const text = await res.text();
      if (!res.ok) {
        return jsonResponse({
          error: providerError("Pipedream token", res, text),
        }, res.status);
      }
      const data = JSON.parse(text || "{}");
      return jsonResponse({
        token: data.token,
        expires_at: data.expires_at ?? data.expiresAt,
        connect_link_url: data.connect_link_url ?? data.connectLinkUrl,
        connectLinkUrl: data.connectLinkUrl ?? data.connect_link_url,
        configured: true,
      });
    }

    if (action === "disconnect") {
      const appSlug = String(body.app_slug ?? body.app ?? "").trim();
      const accountId = String(body.account_id ?? "").trim();
      let query = adminClient().from("pipedream_accounts").delete().eq(
        "user_id",
        user.id,
      );
      if (appSlug) query = query.eq("app_slug", appSlug);
      if (accountId) query = query.eq("account_id", accountId);
      const { error } = await query;
      if (error) throw error;
      return jsonResponse({ ok: true });
    }

    if (action === "google_drive_upload") {
      const accounts = await localAccounts(user.id);
      const drive = accounts.find((a) =>
        a.app_slug === "google_drive" || a.app_slug === "google_drive_oauth"
      );
      if (!drive) return jsonResponse({ needs_connect: true });
      return jsonResponse({
        ok: false,
        connected: true,
        error:
          "Google Drive is connected. File upload actions need a configured Pipedream workflow/action endpoint.",
      }, 501);
    }

    // ─── Generic Connect Proxy ───────────────────────────────────
    // Executes a provider API call on behalf of the user's connected account
    // via Pipedream Connect Proxy. Used by chat tool-calling (Gmail, GitHub…).
    // Body: { app_slug, target_url, method?, headers?, body?, account_id? }
    if (action === "proxy") {
      const creds = await credentials();
      if (!creds.projectId || !creds.clientId || !creds.clientSecret) {
        return jsonResponse({ error: "Pipedream backend keys are missing" }, 500);
      }
      const appSlug = String(body.app_slug ?? body.app ?? "").trim();
      const targetUrl = String(body.target_url ?? body.url ?? "").trim();
      const method = String(body.method ?? "GET").toUpperCase();
      const proxyHeaders = (body.headers && typeof body.headers === "object")
        ? body.headers as Record<string, string>
        : {};
      const proxyBody = body.body;
      let accountId = String(body.account_id ?? "").trim();
      if (!appSlug || !targetUrl) {
        return jsonResponse({ error: "app_slug and target_url are required" }, 400);
      }
      if (!accountId) {
        const accounts = await localAccounts(user.id);
        const match = accounts.find((a) => a.app_slug === appSlug) ||
          accounts.find((a) => String(a.app_slug).startsWith(appSlug));
        if (!match) {
          return jsonResponse({
            error: `No connected ${appSlug} account. Ask the user to connect it from the integrations menu.`,
            needs_connect: true,
            app_slug: appSlug,
          }, 404);
        }
        accountId = match.account_id;
      }
      const token = await pipedreamAccessToken();
      const externalId = externalUserId(user.id);
      const b64 = btoa(targetUrl).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      const proxyUrl = new URL(`${PD_API}/v1/connect/${creds.projectId}/proxy/${b64}`);
      proxyUrl.searchParams.set("external_user_id", externalId);
      proxyUrl.searchParams.set("account_id", accountId);
      const outHeaders: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        "x-pd-environment": creds.environment,
        ...proxyHeaders,
      };
      if (proxyBody != null && !outHeaders["Content-Type"] && !outHeaders["content-type"]) {
        outHeaders["Content-Type"] = "application/json";
      }
      const res = await fetch(proxyUrl, {
        method,
        headers: outHeaders,
        body: proxyBody == null
          ? undefined
          : (typeof proxyBody === "string" ? proxyBody : JSON.stringify(proxyBody)),
      });
      const text = await res.text();
      let parsed: unknown = text;
      try { parsed = JSON.parse(text); } catch { /* keep as text */ }
      return jsonResponse({
        ok: res.ok,
        status: res.status,
        data: parsed,
        error: res.ok ? undefined : providerError(`${appSlug} API`, res, text),
      }, res.ok ? 200 : (res.status >= 400 && res.status < 500 ? res.status : 502));
    }

    // List connected apps as tool-ready descriptors for the chat engine.
    if (action === "list_tools") {
      const accounts = await localAccounts(user.id);
      return jsonResponse({
        connected_apps: accounts.map((a) => ({
          app_slug: a.app_slug,
          account_id: a.account_id,
          account_name: a.account_name,
          healthy: a.healthy,
        })),
      });
    }

    let providerWarning: string | null = null;
    try {
      await syncAccounts(user.id);
    } catch (error) {
      providerWarning = error instanceof Error ? error.message : String(error);
      console.error("[pipedream-connect] sync failed", providerWarning);
    }
    return jsonResponse({
      accounts: await localAccounts(user.id),
      provider_warning: providerWarning,
    });
  } catch (error) {
    console.error("[pipedream-connect]", error);
    return jsonResponse({
      error: error instanceof Error
        ? error.message
        : "pipedream_connect_failed",
    }, 500);
  }
});

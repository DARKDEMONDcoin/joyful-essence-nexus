/** @doc GitHub OAuth connector: start, exchange, status, and disconnect. */
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { getAuthUser } from "../_shared/auth.ts";
import {
  adminClient,
  callbackOrigin,
  configuredOAuthOrigin,
  getConfiguredSecret,
  oauthState,
  readJson,
} from "../_shared/integrationHelpers.ts";

async function githubCredentials() {
  return {
    clientId: await getConfiguredSecret([
      "GITHUB_CLIENT_ID",
      "GITHUB_OAUTH_CLIENT_ID",
      "GITHUB_APP_CLIENT_ID",
      "GITHUB_CONNECT_CLIENT_ID",
      "GITHUB_INTEGRATION_CLIENT_ID",
      "GH_CLIENT_ID",
    ], {
      all: ["GITHUB", "CLIENT", "ID"],
      prefer: ["OAUTH", "APP", "CONNECT", "INTEGRATION"],
      forbidden: ["SECRET", "WEBHOOK", "PRIVATE"],
    }),
    clientSecret: await getConfiguredSecret([
      "GITHUB_CLIENT_SECRET",
      "GITHUB_OAUTH_CLIENT_SECRET",
      "GITHUB_APP_CLIENT_SECRET",
      "GITHUB_CONNECT_CLIENT_SECRET",
      "GITHUB_INTEGRATION_CLIENT_SECRET",
      "GH_CLIENT_SECRET",
    ], {
      all: ["GITHUB", "CLIENT", "SECRET"],
      prefer: ["OAUTH", "APP", "CONNECT", "INTEGRATION"],
      forbidden: ["WEBHOOK", "PRIVATE"],
    }),
  };
}

async function status(userId: string) {
  const { data, error } = await adminClient()
    .from("user_github_connections")
    .select("github_login,github_id,avatar_url,scope,updated_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data
    ? { connected: true, account: data, account_name: data.github_login }
    : { connected: false };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await readJson(req);
    const action = String(
      body.action ?? new URL(req.url).searchParams.get("action") ??
        (body.code && body.state ? "exchange" : "start"),
    );

    const user = await getAuthUser(req);

    if (action === "status") {
      if (!user) return jsonResponse({ error: "unauthorized" }, 401);
      return jsonResponse(await status(user.id));
    }

    if (action === "disconnect") {
      if (!user) return jsonResponse({ error: "unauthorized" }, 401);
      const { error } = await adminClient().from("user_github_connections")
        .delete().eq("user_id", user.id);
      if (error) throw error;
      return jsonResponse({ ok: true, connected: false });
    }

    const { clientId, clientSecret } = await githubCredentials();
    if (!clientId || !clientSecret) {
      return jsonResponse({
        error: "GitHub OAuth backend keys are missing",
        configured: false,
      });
    }

    if (action === "exchange") {
      const code = String(body.code ?? "");
      const state = String(body.state ?? "");
      const origin = await configuredOAuthOrigin("github", callbackOrigin(req, body));
      const { data: stateRow, error: stateError } = await adminClient()
        .from("github_oauth_states")
        .select("state,user_id")
        .eq("state", state)
        .maybeSingle();
      if (stateError) throw stateError;
      if (!code || !stateRow) {
        return jsonResponse(
          { error: "Invalid or expired GitHub OAuth state" },
          400,
        );
      }
      if (user && user.id !== stateRow.user_id) {
        return jsonResponse({ error: "GitHub OAuth state does not match the signed-in user" }, 403);
      }

      const tokenRes = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            state,
          }),
        },
      );
      const tokenData = await tokenRes.json().catch(() => ({}));
      if (!tokenRes.ok || tokenData.error || !tokenData.access_token) {
        return jsonResponse({
          error: tokenData.error_description || tokenData.error ||
            "GitHub token exchange failed",
        }, 400);
      }

      const ghRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "Megsy",
        },
      });
      const ghUser = await ghRes.json().catch(() => ({}));
      if (!ghRes.ok) {
        return jsonResponse({
          error: ghUser.message || "GitHub profile lookup failed",
        }, ghRes.status);
      }

      const { error } = await adminClient().from("user_github_connections")
        .upsert({
          user_id: stateRow.user_id,
          access_token: tokenData.access_token,
          github_login: ghUser.login ?? null,
          github_id: ghUser.id ?? null,
          avatar_url: ghUser.avatar_url ?? null,
          scope: tokenData.scope ?? null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      if (error) throw error;
      await adminClient().from("github_oauth_states").delete().eq(
        "state",
        state,
      );
      return jsonResponse({
        ok: true,
        connected: true,
        account_name: ghUser.login ?? "GitHub",
      });
    }

    if (!user) return jsonResponse({ error: "unauthorized" }, 401);

    const origin = await configuredOAuthOrigin("github", callbackOrigin(req, body));
    if (!origin) return jsonResponse({ error: "Missing redirect origin" }, 400);
    const redirectUri = `${origin}/auth/callback/github`;
    const state = oauthState();
    const { error } = await adminClient().from("github_oauth_states").insert({
      state,
      user_id: user.id,
      redirect_to: String(
        body.redirect_to ?? `${origin}/settings/integrations/github`,
      ),
    });
    if (error) throw error;
    const params = new URLSearchParams({
      client_id: clientId,
      scope: "repo read:user user:email",
      state,
      allow_signup: "true",
    });
    return jsonResponse({
      authorize_url: `https://github.com/login/oauth/authorize?${params}`,
      configured: true,
      redirect_uri: redirectUri,
    });
  } catch (error) {
    console.error("[oauth-github-connect]", error);
    return jsonResponse({
      error: error instanceof Error ? error.message : "github_oauth_failed",
    }, 500);
  }
});

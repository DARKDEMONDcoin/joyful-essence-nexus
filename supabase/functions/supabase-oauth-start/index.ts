/** @doc Starts Supabase Management API OAuth with PKCE. */
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { getAuthUser } from "../_shared/auth.ts";
import {
  adminClient,
  callbackOrigin,
  configuredOAuthOrigin,
  oauthState,
  readJson,
  sha256Base64Url,
  supabaseOAuthCredentials,
  supabaseOAuthDiagnostics,
  supabaseOAuthMissingMessage,
  supabaseManagementToken,
} from "../_shared/integrationHelpers.ts";

function currentProjectRef() {
  const explicit = Deno.env.get("SUPABASE_PROJECT_ID")?.trim();
  if (explicit) return explicit;
  try {
    return new URL(Deno.env.get("SUPABASE_URL") ?? "").hostname.split(".")[0] || "current";
  } catch {
    return "current";
  }
}

async function connectCurrentSupabaseProject(userId: string) {
  const projectRef = currentProjectRef();
  const now = new Date().toISOString();
  const localToken = `local_project:${projectRef}`;
  const { error } = await adminClient().from("user_supabase_connections")
    .upsert({
      user_id: userId,
      account_email: `Project ${projectRef}`,
      access_token: localToken,
      refresh_token: localToken,
      expires_at: "2099-12-31T23:59:59.000Z",
      scope: "local_project",
      updated_at: now,
    }, { onConflict: "user_id" });
  if (error) throw error;
  return {
    ok: true,
    connected: true,
    configured: true,
    mode: "local_project",
    account_name: `Project ${projectRef}`,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const user = await getAuthUser(req);
  if (!user) return jsonResponse({ error: "unauthorized" }, 401);
  try {
    const body = await readJson(req);
    const { clientId } = await supabaseOAuthCredentials();
    if (!clientId) {
      const managementToken = await supabaseManagementToken();
      if (managementToken) {
        let accountEmail: string | null = null;
        try {
          const profileRes = await fetch("https://api.supabase.com/v1/user", {
            headers: {
              Authorization: `Bearer ${managementToken}`,
              Accept: "application/json",
            },
          });
          const profile = await profileRes.json().catch(() => ({}));
          if (!profileRes.ok) {
            return jsonResponse({
              error: profile?.message || profile?.error || "Supabase management token is invalid",
              configured: false,
            });
          }
          accountEmail = profile?.email ?? profile?.primary_email ?? null;
        } catch (error) {
          return jsonResponse({
            error: error instanceof Error ? error.message : "Supabase management token check failed",
            configured: false,
          });
        }

        const { error } = await adminClient().from("user_supabase_connections")
          .upsert({
            user_id: user.id,
            account_email: accountEmail,
            access_token: managementToken,
            refresh_token: managementToken,
            expires_at: "2099-12-31T23:59:59.000Z",
            scope: "management_token",
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });
        if (error) throw error;
        return jsonResponse({
          ok: true,
          connected: true,
          configured: true,
          mode: "management_token",
          account_name: accountEmail ?? "Supabase",
        });
      }

      console.warn(
        "[supabase-oauth-start] missing client id diagnostics",
        await supabaseOAuthDiagnostics(),
      );
      return jsonResponse(await connectCurrentSupabaseProject(user.id));
    }
    const origin = await configuredOAuthOrigin("supabase", callbackOrigin(req, body));
    if (!origin) return jsonResponse({ error: "Missing redirect origin" }, 400);
    const redirectUri = `${origin}/auth/callback/supabase`;
    const state = oauthState();
    const verifier = oauthState();
    const challenge = await sha256Base64Url(verifier);
    const { error } = await adminClient().from("supabase_oauth_states").insert({
      state,
      user_id: user.id,
      redirect_to: String(
        body.redirect_to ?? `${origin}/settings/integrations/supabase`,
      ),
      code_verifier: verifier,
    });
    if (error) throw error;
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      code_challenge: challenge,
      code_challenge_method: "S256",
      state,
    });
    return jsonResponse({
      authorize_url: `https://api.supabase.com/v1/oauth/authorize?${params}`,
      configured: true,
      redirect_uri: redirectUri,
    });
  } catch (error) {
    console.error("[supabase-oauth-start]", error);
    return jsonResponse({
      error: error instanceof Error
        ? error.message
        : "supabase_oauth_start_failed",
    }, 500);
  }
});

/** @doc Completes Supabase Management API OAuth and stores the user's management token server-side. */
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { getAuthUser } from "../_shared/auth.ts";
import {
  adminClient,
  callbackOrigin,
  configuredOAuthOrigin,
  readJson,
  supabaseOAuthCredentials,
  supabaseOAuthMissingMessage,
} from "../_shared/integrationHelpers.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const body = await readJson(req);
    const action = String(
      body.action ?? new URL(req.url).searchParams.get("action") ?? "exchange",
    );
    if (action !== "exchange") {
      return jsonResponse({ error: "unsupported_action" }, 400);
    }
    const code = String(body.code ?? "");
    const state = String(body.state ?? "");
    const { clientId, clientSecret } = await supabaseOAuthCredentials();
    if (!clientId || !clientSecret) {
      return jsonResponse({
        error: supabaseOAuthMissingMessage(true),
        configured: false,
      });
    }
    const { data: stateRow, error: stateError } = await adminClient()
      .from("supabase_oauth_states")
      .select("state,user_id,code_verifier,redirect_to")
      .eq("state", state)
      .maybeSingle();
    if (stateError) throw stateError;
    if (!code || !stateRow?.code_verifier) {
      return jsonResponse(
        { error: "Invalid or expired Supabase OAuth state" },
        400,
      );
    }
    const user = await getAuthUser(req);
    if (user && user.id !== stateRow.user_id) {
      return jsonResponse({ error: "Supabase OAuth state does not match the signed-in user" }, 403);
    }
    const origin = await configuredOAuthOrigin("supabase", callbackOrigin(req, body));
    const tokenRes = await fetch("https://api.supabase.com/v1/oauth/token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${origin}/auth/callback/supabase`,
        code_verifier: stateRow.code_verifier,
      }),
    });
    const tokenData = await tokenRes.json().catch(() => ({}));
    if (
      !tokenRes.ok || tokenData.error || !tokenData.access_token ||
      !tokenData.refresh_token
    ) {
      return jsonResponse({
        error: tokenData.error_description || tokenData.error ||
          "Supabase token exchange failed",
      }, 400);
    }
    let accountEmail: string | null = null;
    try {
      const profileRes = await fetch("https://api.supabase.com/v1/user", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/json",
        },
      });
      const profile = await profileRes.json().catch(() => ({}));
      accountEmail = profile?.email ?? profile?.primary_email ?? null;
    } catch {
      accountEmail = null;
    }
    const expiresAt = new Date(
      Date.now() + Number(tokenData.expires_in ?? 3600) * 1000,
    ).toISOString();
    const { error } = await adminClient().from("user_supabase_connections")
      .upsert({
        user_id: stateRow.user_id,
        account_email: accountEmail,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
        scope: tokenData.scope ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    if (error) throw error;
    await adminClient().from("supabase_oauth_states").delete().eq(
      "state",
      state,
    );
    return jsonResponse({
      ok: true,
      connected: true,
      account_name: accountEmail ?? "Supabase",
      redirect_to: stateRow.redirect_to ?? null,
    });
  } catch (error) {
    console.error("[oauth-supabase-connect]", error);
    return jsonResponse({
      error: error instanceof Error
        ? error.message
        : "supabase_oauth_exchange_failed",
    }, 500);
  }
});

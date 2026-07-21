/**
 * AppSumo OAuth bridge.
 *
 * Actions:
 *   POST { action: "start" }  (JWT-authenticated) → returns AppSumo authorize URL.
 *   GET  ?code=...&state=...  → callback: exchanges code, links license to user.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const APPSUMO_CLIENT_ID = Deno.env.get("APPSUMO_CLIENT_ID") ?? "";
const APPSUMO_CLIENT_SECRET = Deno.env.get("APPSUMO_CLIENT_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const REDIRECT_URI = `${SUPABASE_URL}/functions/v1/appsumo-oauth`;
const AUTHORIZE_URL = "https://appsumo.com/openid/authorize/";
const TOKEN_URL = "https://appsumo.com/openid/token/";
const LICENSE_URL = "https://api.licensing.appsumo.com/v2/licenses";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

function randomState(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (!APPSUMO_CLIENT_ID || !APPSUMO_CLIENT_SECRET) {
    return new Response(
      JSON.stringify({ configured: false, error: "AppSumo OAuth not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // ---- START: initiate OAuth (needs signed-in user) ----
  if (req.method === "POST") {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Not signed in" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch { /* noop */ }
    const redirectTo: string | null = body?.redirect_to ?? null;
    const state = randomState();

    await admin.from("appsumo_oauth_states").insert({
      state,
      user_id: userData.user.id,
      redirect_to: redirectTo,
    });

    const url = new URL(AUTHORIZE_URL);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", APPSUMO_CLIENT_ID);
    url.searchParams.set("redirect_uri", REDIRECT_URI);
    url.searchParams.set("scope", "openid profile email licensing");
    url.searchParams.set("state", state);

    return new Response(JSON.stringify({ authorize_url: url.toString() }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ---- CALLBACK: AppSumo redirects here with code + state ----
  if (req.method === "GET") {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state) {
      // AppSumo reachability check — respond 200 so validation passes.
      return new Response(
        JSON.stringify({ success: true, ready: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: stateRow, error: stateErr } = await admin
      .from("appsumo_oauth_states")
      .select("*")
      .eq("state", state)
      .maybeSingle();
    if (stateErr || !stateRow) {
      return new Response("Invalid state", { status: 400, headers: corsHeaders });
    }
    await admin.from("appsumo_oauth_states").delete().eq("state", state);

    // Exchange code for access token
    const tokenRes = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: APPSUMO_CLIENT_ID,
        client_secret: APPSUMO_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
      }),
    });
    const tokenJson = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok || !tokenJson?.access_token) {
      console.error("appsumo token exchange failed", tokenRes.status, tokenJson);
      return new Response("Token exchange failed", { status: 502, headers: corsHeaders });
    }

    // Fetch the user's licenses
    const licRes = await fetch(LICENSE_URL, {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    const licJson = await licRes.json().catch(() => ({}));
    const licenses = Array.isArray(licJson?.licenses)
      ? licJson.licenses
      : Array.isArray(licJson)
        ? licJson
        : [];

    for (const lic of licenses) {
      const licenseKey = lic?.license_key ?? lic?.key;
      if (!licenseKey) continue;
      await admin.from("appsumo_licenses").upsert(
        {
          license_key: licenseKey,
          license_id: lic?.license_id ?? lic?.id ?? null,
          activation_email: lic?.activation_email ?? lic?.email ?? null,
          product_id: lic?.product_id ?? null,
          plan_id: lic?.plan_id ?? null,
          tier: typeof lic?.tier === "number" ? lic.tier : null,
          status: lic?.status ?? "active",
          event: "oauth_link",
          user_id: stateRow.user_id,
          raw: lic,
          activated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "license_key" },
      );
    }

    const dest = stateRow.redirect_to || "/settings/billing";
    const safeDest = dest.startsWith("http") ? dest : dest;
    return new Response(null, {
      status: 302,
      headers: { ...corsHeaders, Location: `${safeDest}?appsumo=linked` },
    });
  }

  return new Response("Method not allowed", { status: 405, headers: corsHeaders });
});
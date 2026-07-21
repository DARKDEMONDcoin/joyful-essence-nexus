/** @doc AppSumo webhook — processes purchase/refund lifecycle events. */
/**
 * AppSumo Licensing API webhook.
 *
 * Handles activation, upgrade, downgrade, and refund/cancel events per
 * https://partner.appsumo.com/docs/licensing-api
 *
 * Security: verifies the `X-AppSumo-Signature` header (HMAC-SHA256 of raw body
 * using APPSUMO_API_KEY). Idempotent — upserts on license_key.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const APPSUMO_API_KEY = Deno.env.get("APPSUMO_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-appsumo-signature, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST")
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  if (!APPSUMO_API_KEY)
    return new Response("Not configured", { status: 500, headers: corsHeaders });

  const raw = await req.text();
  const providedSig =
    req.headers.get("x-appsumo-signature") ??
    req.headers.get("x-signature") ??
    "";

  // AppSumo validates the endpoint by POSTing a test payload. If a signature
  // is present we verify it; otherwise (or on mismatch) we still return
  // { success: true } so validation passes, but we skip DB writes.
  let signatureOk = false;
  if (providedSig) {
    const expected = await hmacHex(APPSUMO_API_KEY, raw);
    signatureOk = timingSafeEqualHex(
      providedSig.toLowerCase().replace(/^sha256=/, ""),
      expected,
    );
    if (!signatureOk) console.warn("appsumo-webhook signature mismatch");
  }

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
  }

  // AppSumo Licensing API event fields (see docs). Field names normalized.
  const event: string = String(payload?.event ?? payload?.action ?? "").toLowerCase();
  const licenseKey: string =
    payload?.license_key ?? payload?.licenseKey ?? payload?.license?.key ?? "";
  const licenseId: string | null =
    payload?.license_id ?? payload?.licenseId ?? payload?.license?.id ?? null;
  const activationEmail: string | null =
    payload?.activation_email ?? payload?.email ?? null;
  const productId: string | null = payload?.product_id ?? payload?.productId ?? null;
  const planId: string | null = payload?.plan_id ?? payload?.planId ?? null;
  const tier: number | null =
    typeof payload?.tier === "number" ? payload.tier : Number(payload?.tier) || null;

  if (!licenseKey || !signatureOk) {
    // Validation ping or unverified call — ack success without persisting.
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Event → status mapping
  const status = (() => {
    switch (event) {
      case "activate":
      case "purchase":
      case "upgrade":
      case "downgrade":
        return "active";
      case "refund":
      case "cancel":
      case "deactivate":
        return "canceled";
      default:
        return "active";
    }
  })();

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await admin.from("appsumo_licenses").upsert(
    {
      license_key: licenseKey,
      license_id: licenseId,
      activation_email: activationEmail,
      product_id: productId,
      plan_id: planId,
      tier,
      status,
      event,
      raw: payload,
      activated_at: status === "active" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "license_key" },
  );

  if (error) {
    console.error("appsumo-webhook upsert failed", error);
    return new Response("DB error", { status: 500, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ success: true, event, status }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
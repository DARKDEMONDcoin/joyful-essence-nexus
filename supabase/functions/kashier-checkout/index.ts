/** @doc Creates a Kashier v3 Payment Session. Amount/credits/plan are ALWAYS read from the server-side billing_skus catalog — the client sends only a sku code. */
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const KASHIER_MERCHANT_ID = Deno.env.get("KASHIER_MERCHANT_ID") ?? "";
const KASHIER_SECRET_KEY = Deno.env.get("KASHIER_SECRET_KEY") ?? "";
const KASHIER_PAYMENT_API_KEY = Deno.env.get("KASHIER_PAYMENT_API_KEY") ?? "";
const KASHIER_MODE = (Deno.env.get("KASHIER_MODE") ?? "live").toLowerCase() === "test" ? "test" : "live";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const KASHIER_API_BASE =
  KASHIER_MODE === "live"
    ? "https://api.kashier.io/v3/payment/sessions"
    : "https://test-api.kashier.io/v3/payment/sessions";

function resolveAllowedMethods(method: string): string {
  if (method === "vodafone_cash" || method === "wallet") return "wallet";
  if (method === "card") return "card";
  return "card,wallet";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    if (!KASHIER_MERCHANT_ID || !KASHIER_SECRET_KEY || !KASHIER_PAYMENT_API_KEY) {
      return jsonResponse({ error: "Kashier is not fully configured" }, 500);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Unauthorized" }, 401);

    const userClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return jsonResponse({ error: "Unauthorized" }, 401);
    const userId = userData.user.id;
    const userEmail = userData.user.email ?? undefined;

    const body = await req.json().catch(() => ({}));
    const sku = String(body.sku || "").trim();
    const method = String(body.method || "any"); // card | vodafone_cash | wallet | any
    const displayLang = String(body.display || "ar").toLowerCase() === "en" ? "en" : "ar";
    const redirectUrl = body.redirect_url ? String(body.redirect_url) : null;

    if (!sku) return jsonResponse({ error: "Missing sku" }, 400);

    // Authoritative price lookup — never trust client
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: skuRow, error: skuErr } = await admin
      .from("billing_skus")
      .select("sku, kind, display_name, amount_egp, credits, plan_key, active")
      .eq("sku", sku)
      .eq("active", true)
      .maybeSingle();

    if (skuErr || !skuRow) {
      console.warn("kashier-checkout: unknown sku", sku, skuErr?.message);
      return jsonResponse({ error: "Unknown or inactive plan" }, 400);
    }

    const amount = Number(skuRow.amount_egp);
    const credits = Number(skuRow.credits);
    const plan = skuRow.plan_key ?? null;
    const currency = "EGP";

    if (!Number.isFinite(amount) || amount <= 0) {
      return jsonResponse({ error: "Invalid catalog amount" }, 500);
    }

    const amountStr = amount.toFixed(2);
    const orderId = `mgs_${crypto.randomUUID().replace(/-/g, "").slice(0, 18)}`;

    const { error: insertErr } = await admin.from("kashier_orders").insert({
      user_id: userId,
      order_id: orderId,
      amount,
      currency,
      method,
      status: "pending",
      credits,
      plan,
    });
    if (insertErr) {
      console.error("kashier_orders insert failed", insertErr);
      return jsonResponse({ error: "Failed to create order" }, 500);
    }

    const webhookUrl = `${SUPABASE_URL}/functions/v1/kashier-webhook`;
    const merchantRedirect = redirectUrl
      ? redirectUrl
      : `${req.headers.get("origin") || "https://megsy.ai"}/billing/success?provider=kashier&order=${orderId}`;

    const expireAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const sessionBody: Record<string, unknown> = {
      merchantId: KASHIER_MERCHANT_ID,
      amount: amountStr,
      currency,
      order: orderId,
      merchantRedirect,
      display: displayLang,
      type: "one-time",
      allowedMethods: resolveAllowedMethods(method),
      redirectMethod: "get",
      brandColor: "#7C3AED",
      expireAt,
      maxFailureAttempts: 3,
      failureRedirect: false,
      serverWebhook: webhookUrl,
      metaData: { userId, sku, credits, plan },
      description: skuRow.display_name,
      ...(userEmail ? { customer: { email: userEmail, reference: userId } } : {}),
    };

    const kashRes = await fetch(KASHIER_API_BASE, {
      method: "POST",
      headers: {
        Authorization: KASHIER_SECRET_KEY,
        "api-key": KASHIER_PAYMENT_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionBody),
    });

    const kashText = await kashRes.text();
    let kashJson: any = null;
    try { kashJson = JSON.parse(kashText); } catch { /* keep raw */ }

    if (!kashRes.ok) {
      console.error("kashier session create failed", {
        status: kashRes.status,
        body: kashText.slice(0, 800),
      });
      const msg = kashJson?.message || kashJson?.messages?.en || kashJson?.error || `Kashier ${kashRes.status}`;
      return jsonResponse({ error: msg, status: kashRes.status }, 502);
    }

    const sessionUrl: string | undefined = kashJson?.sessionUrl || kashJson?.response?.sessionUrl;
    const sessionId: string | undefined = kashJson?._id || kashJson?.response?._id;

    if (!sessionUrl) {
      console.error("kashier session missing sessionUrl", kashJson);
      return jsonResponse({ error: "Kashier did not return a session URL" }, 502);
    }

    return jsonResponse({
      order_id: orderId,
      checkout_url: sessionUrl,
      session_id: sessionId,
      mode: KASHIER_MODE,
      amount,
      currency,
      credits,
      plan,
    });
  } catch (e) {
    console.error("kashier-checkout error", e);
    return jsonResponse({ error: (e as Error).message || "Server error" }, 500);
  }
});

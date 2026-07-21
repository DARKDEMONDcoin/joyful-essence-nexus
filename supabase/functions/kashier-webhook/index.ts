/** @doc Kashier server-to-server webhook: verifies HMAC signature, cross-checks amount against server catalog, then credits the user via grant_user_credits RPC (atomic + audited). */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const KASHIER_PAYMENT_API_KEY = Deno.env.get("KASHIER_PAYMENT_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  if (!KASHIER_PAYMENT_API_KEY) return new Response("Not configured", { status: 500 });

  const raw = await req.text();
  let payload: any;
  try { payload = JSON.parse(raw); } catch { return new Response("Invalid JSON", { status: 400 }); }

  const data = payload?.data ?? payload;
  const signature: string = data?.signature ?? payload?.signature ?? "";
  const signatureKeys: string[] = data?.signatureKeys ?? payload?.signatureKeys ?? [];

  if (!signature || !Array.isArray(signatureKeys) || signatureKeys.length === 0) {
    console.warn("kashier-webhook missing signature");
    return new Response("Missing signature", { status: 401 });
  }

  const queryString = signatureKeys.map((k) => `${k}=${data?.[k] ?? ""}`).join("&");
  const expected = await hmacHex(KASHIER_PAYMENT_API_KEY, queryString);

  if (!timingSafeEqualHex(signature.toLowerCase(), expected.toLowerCase())) {
    console.warn("kashier-webhook signature mismatch");
    return new Response("Invalid signature", { status: 401 });
  }

  const orderId: string = data?.merchantOrderId ?? data?.orderId ?? "";
  const kashierRef: string = data?.orderReference ?? data?.transactionId ?? "";
  const status: string = String(data?.status ?? "").toUpperCase();
  const paidAmount = Number(data?.amount ?? 0);
  const paidCurrency = String(data?.currency ?? "").toUpperCase();

  if (!orderId) return new Response("No order id", { status: 400 });

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: order, error: fetchErr } = await admin
    .from("kashier_orders")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (fetchErr || !order) {
    console.error("kashier-webhook order not found", orderId, fetchErr);
    return new Response("Order not found", { status: 404 });
  }

  const isPaid = ["SUCCESS", "CAPTURED", "PAID", "APPROVED"].includes(status);
  const isAlreadyProcessed = order.status === "paid";

  // Cross-check paid amount against the order (protection against Kashier
  // payload tampering + accidental partial payments).
  const expectedAmount = Number(order.amount);
  const expectedCurrency = String(order.currency).toUpperCase();
  const amountsMatch =
    Math.abs(paidAmount - expectedAmount) < 0.01 && paidCurrency === expectedCurrency;

  const newStatus = isPaid
    ? (amountsMatch ? "paid" : "amount_mismatch")
    : status === "FAILED" ? "failed" : "pending";

  await admin
    .from("kashier_orders")
    .update({ status: newStatus, kashier_ref: kashierRef, raw: payload })
    .eq("order_id", orderId);

  if (newStatus === "amount_mismatch") {
    console.error("kashier-webhook amount mismatch", {
      orderId, expectedAmount, expectedCurrency, paidAmount, paidCurrency,
    });
    return new Response(JSON.stringify({ ok: false, reason: "amount_mismatch" }), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  }

  if (isPaid && !isAlreadyProcessed && Number(order.credits) > 0) {
    // Atomic grant via SECURITY DEFINER RPC — also inserts credit_transactions
    const { error: grantErr } = await admin.rpc("grant_user_credits", {
      p_user_id: order.user_id,
      p_amount: Number(order.credits),
      p_action_type: "kashier_purchase",
      p_description: `Kashier ${order.method || "card"} · ${paidAmount} ${paidCurrency} · order ${orderId}`,
    });
    if (grantErr) {
      console.error("grant_user_credits failed", grantErr);
      return new Response("Credit grant failed", { status: 500 });
    }

    if (order.plan) {
      const { error: planErr } = await admin
        .from("profiles")
        .update({ plan: order.plan })
        .eq("id", order.user_id);
      if (planErr) console.error("plan update failed", planErr);
    }

    // Referral commission — resolves referrer + tier rate (20%..50%) and
    // records an idempotent earning. Safe to call unconditionally; the RPC
    // no-ops when the user was not referred.
    try {
      const netCents = Math.round(Number(paidAmount) * 100);
      if (netCents > 0) {
        const { error: refErr } = await admin.rpc("record_referral_commission", {
          _referred: order.user_id,
          _net_cents: netCents,
          _subscription: null,
          _source: order.plan ? `plan:${order.plan}` : "kashier_purchase",
        });
        if (refErr) console.error("record_referral_commission failed", refErr);
      }
    } catch (e) {
      console.error("record_referral_commission threw", e);
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

/** @doc Cron endpoint: reads due scheduled_user_messages, invokes chat-alibaba
 *  to generate each message, sends the result to the user's push_subscriptions
 *  via Web Push (VAPID), and advances next_run_at using a cron expression. */
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const VAPID_PUB = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIV = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUB = Deno.env.get("VAPID_SUBJECT") || "mailto:support@megsyai.com";
webpush.setVapidDetails(VAPID_SUB, VAPID_PUB, VAPID_PRIV);

/** Minimal cron parser — supports 5-field expressions with *, comma lists,
 *  ranges (a-b), and step (∗/n). Returns the next fire time >= from. */
function parseField(expr: string, min: number, max: number): number[] {
  const out = new Set<number>();
  for (const piece of expr.split(",")) {
    let [range, step] = piece.split("/");
    const s = step ? parseInt(step) : 1;
    let lo = min, hi = max;
    if (range !== "*") {
      if (range.includes("-")) { const [a,b] = range.split("-").map(Number); lo=a; hi=b; }
      else { lo = hi = Number(range); }
    }
    for (let v = lo; v <= hi; v++) if (((v - lo) % s) === 0) out.add(v);
  }
  return [...out].sort((a,b)=>a-b);
}

function nextRunFromCron(cron: string, from: Date): Date {
  const [mi, hr, dom, mo, dow] = cron.trim().split(/\s+/);
  const mins = parseField(mi, 0, 59);
  const hrs = parseField(hr, 0, 23);
  const doms = parseField(dom, 1, 31);
  const mos = parseField(mo, 1, 12);
  const dows = parseField(dow, 0, 6);
  const d = new Date(from.getTime() + 60_000);
  d.setUTCSeconds(0, 0);
  for (let i = 0; i < 366 * 24 * 60; i++) {
    if (
      mins.includes(d.getUTCMinutes()) &&
      hrs.includes(d.getUTCHours()) &&
      doms.includes(d.getUTCDate()) &&
      mos.includes(d.getUTCMonth() + 1) &&
      dows.includes(d.getUTCDay())
    ) return d;
    d.setUTCMinutes(d.getUTCMinutes() + 1);
  }
  return new Date(from.getTime() + 24 * 3600_000);
}

async function generateMessage(userId: string, prompt: string): Promise<string> {
  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/chat-alibaba`;
  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: Deno.env.get("SUPABASE_ANON_KEY") || "",
      Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
    },
    body: JSON.stringify({
      user_id: userId,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!r.ok || !r.body) throw new Error(`chat failed ${r.status}`);
  const reader = r.body.getReader();
  const dec = new TextDecoder();
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = dec.decode(value);
    for (const line of chunk.split("\n")) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const j = JSON.parse(payload);
        const delta = j?.choices?.[0]?.delta?.content;
        if (typeof delta === "string") text += delta;
      } catch { /* ignore */ }
    }
  }
  return text.slice(0, 500);
}

async function sendPushToUser(userId: string, title: string, body: string) {
  const { data: subs } = await admin.from("push_subscriptions").select("*").eq("user_id", userId);
  if (!subs?.length) return { sent: 0 };
  let sent = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify({ title, body, url: "/chat" }),
      );
      sent++;
    } catch (e: any) {
      if (e?.statusCode === 404 || e?.statusCode === 410) {
        await admin.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
      }
    }
  }
  return { sent };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const now = new Date();
  const { data: due } = await admin
    .from("scheduled_user_messages")
    .select("*")
    .eq("enabled", true)
    .or(`next_run_at.is.null,next_run_at.lte.${now.toISOString()}`)
    .limit(50);

  const results: any[] = [];
  for (const row of due || []) {
    try {
      const msg = await generateMessage(row.user_id, row.prompt);
      const title = row.title || "Megsy — Daily update";
      const push = await sendPushToUser(row.user_id, title, msg);
      const next = nextRunFromCron(row.schedule_cron || "0 10 * * *", now);
      await admin
        .from("scheduled_user_messages")
        .update({ last_run_at: now.toISOString(), next_run_at: next.toISOString() })
        .eq("id", row.id);
      results.push({ id: row.id, sent: push.sent, next: next.toISOString() });
    } catch (e: any) {
      results.push({ id: row.id, error: String(e).slice(0, 200) });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

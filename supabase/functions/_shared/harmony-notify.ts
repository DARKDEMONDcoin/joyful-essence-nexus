/** @doc Helper to send Telegram push notifications to Harmony bot users.
 *  Import from other edge functions after generation, discount events, etc.
 *  Usage: await notifyTelegramUser(userId, "<b>Ready</b>\nYour image is done."); */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const BOT_TOKEN = Deno.env.get("TELEGRAM_HARMONY_BOT_TOKEN") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

async function send(chatId: number, text: string, extra: Record<string, unknown> = {}) {
  if (!BOT_TOKEN) return { ok: false, error: "no_token" };
  const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true, ...extra }),
  });
  return r.json().catch(() => ({ ok: false }));
}

export async function notifyTelegramUser(userId: string, text: string, extra: Record<string, unknown> = {}) {
  const { data } = await admin
    .from("telegram_users")
    .select("telegram_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data?.telegram_id) return { ok: false, error: "not_linked" };
  return send(data.telegram_id as number, text, extra);
}

export async function broadcastTelegram(text: string, extra: Record<string, unknown> = {}) {
  const { data } = await admin.from("telegram_users").select("telegram_id");
  let ok = 0, fail = 0;
  for (const u of (data ?? []) as { telegram_id: number }[]) {
    const r = await send(u.telegram_id, text, extra).catch(() => ({ ok: false }));
    if ((r as { ok?: boolean })?.ok) ok++; else fail++;
    await new Promise((r) => setTimeout(r, 35));
  }
  return { ok, fail };
}
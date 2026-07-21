/**
 * @doc Telegram bot for managing rotated provider API keys (public.api_keys).
 *
 * Set the webhook to this function URL:
 *   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<project>.supabase.co/functions/v1/telegram-keys-bot
 *
 * Admins (public.bot_admins.telegram_chat_id) can run:
 *   /id                          — show your chat id (use to seed the first admin)
 *   /addkey <service> <key> [label]
 *   /listkeys <service>          — active keys (with cooldown/blocked flags)
 *   /blockkey <id> [reason]
 *   /unblockkey <id>
 *   /uncool <id>                 — clear cooldown_until
 *   /help
 *
 * On failure the media-video rotation moves a key to cooldown_until = next
 * 00:00 UTC so it is skipped until reset — matching deapi's daily-quota reset.
 */
import { createClient } from "npm:@supabase/supabase-js@2";

const TG_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const API = `https://api.telegram.org/bot${TG_TOKEN}`;

const sb = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

async function reply(chatId: number, text: string) {
  if (!TG_TOKEN) return;
  await fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  });
}

async function isAdmin(chatId: number): Promise<boolean> {
  const { data } = await sb
    .from("bot_admins")
    .select("id")
    .eq("telegram_chat_id", chatId)
    .maybeSingle();
  return !!data;
}

async function anyAdmins(): Promise<boolean> {
  const { count } = await sb
    .from("bot_admins")
    .select("id", { count: "exact", head: true });
  return (count ?? 0) > 0;
}

function fmtKey(row: any): string {
  const flags: string[] = [];
  if (row.is_blocked) flags.push("blocked");
  if (row.cooldown_until && new Date(row.cooldown_until) > new Date()) {
    flags.push(`cooldown→${row.cooldown_until}`);
  }
  if (!row.is_active) flags.push("inactive");
  const tail = flags.length ? ` [${flags.join(", ")}]` : "";
  const label = row.label ? ` "${row.label}"` : "";
  return `\`${row.id}\`${label} — used ${row.usage_count}, errors ${row.error_count}${tail}`;
}

async function handleCommand(chatId: number, text: string) {
  const raw = text.trim();
  const [cmdWithBot, ...args] = raw.split(/\s+/);
  const cmd = cmdWithBot.split("@")[0].toLowerCase();

  if (cmd === "/id" || cmd === "/start") {
    const admin = await isAdmin(chatId);
    const noAdmins = !admin && !(await anyAdmins());
    let msg = `Your chat id: \`${chatId}\``;
    if (noAdmins) {
      // Bootstrap: first user becomes admin.
      await sb.from("bot_admins").insert({ telegram_chat_id: chatId, added_by: chatId });
      msg += "\n\nNo admins existed — you have been added as the first admin.";
    } else if (admin) {
      msg += "\n\nYou are an admin. Send /help.";
    } else {
      msg += "\n\nYou are not an admin. Ask an existing admin to add you.";
    }
    return reply(chatId, msg);
  }

  if (!(await isAdmin(chatId))) {
    return reply(chatId, "Not authorized. Send /id to see your chat id.");
  }

  if (cmd === "/help") {
    return reply(
      chatId,
      [
        "*Key rotation bot*",
        "`/addkey <service> <key> [label]`",
        "`/listkeys <service>`",
        "`/blockkey <id> [reason]`",
        "`/unblockkey <id>`",
        "`/uncool <id>` — clear cooldown_until",
        "Common services: `deapi`, `alibaba`, `manus`, `serper`, `leonardo`.",
      ].join("\n"),
    );
  }

  if (cmd === "/addkey") {
    const [service, key, ...labelParts] = args;
    if (!service || !key) return reply(chatId, "Usage: /addkey <service> <key> [label]");
    const label = labelParts.join(" ") || null;
    const { data, error } = await sb
      .from("api_keys")
      .insert({ service: service.toLowerCase(), api_key: key, label, is_active: true, is_blocked: false })
      .select("id")
      .maybeSingle();
    if (error) return reply(chatId, `Insert failed: ${error.message}`);
    return reply(chatId, `Added key \`${data?.id}\` for *${service}*.`);
  }

  if (cmd === "/listkeys") {
    const [service] = args;
    if (!service) return reply(chatId, "Usage: /listkeys <service>");
    const { data, error } = await sb
      .from("api_keys")
      .select("id,label,is_active,is_blocked,usage_count,error_count,cooldown_until")
      .eq("service", service.toLowerCase())
      .order("last_used_at", { ascending: true, nullsFirst: true })
      .limit(25);
    if (error) return reply(chatId, `Query failed: ${error.message}`);
    if (!data || data.length === 0) return reply(chatId, `No keys for *${service}*.`);
    return reply(chatId, `*${service}* — ${data.length} keys:\n` + data.map(fmtKey).join("\n"));
  }

  if (cmd === "/blockkey") {
    const [id, ...reasonParts] = args;
    if (!id) return reply(chatId, "Usage: /blockkey <id> [reason]");
    const reason = reasonParts.join(" ") || "manual";
    const { error } = await sb
      .from("api_keys")
      .update({ is_blocked: true, block_reason: reason.slice(0, 500) })
      .eq("id", id);
    if (error) return reply(chatId, `Failed: ${error.message}`);
    return reply(chatId, `Blocked \`${id}\`.`);
  }

  if (cmd === "/unblockkey") {
    const [id] = args;
    if (!id) return reply(chatId, "Usage: /unblockkey <id>");
    const { error } = await sb
      .from("api_keys")
      .update({ is_blocked: false, block_reason: null })
      .eq("id", id);
    if (error) return reply(chatId, `Failed: ${error.message}`);
    return reply(chatId, `Unblocked \`${id}\`.`);
  }

  if (cmd === "/uncool") {
    const [id] = args;
    if (!id) return reply(chatId, "Usage: /uncool <id>");
    const { error } = await sb
      .from("api_keys")
      .update({ cooldown_until: null })
      .eq("id", id);
    if (error) return reply(chatId, `Failed: ${error.message}`);
    return reply(chatId, `Cooldown cleared for \`${id}\`.`);
  }

  return reply(chatId, "Unknown command. /help");
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("ok");
  try {
    const update = await req.json();
    const msg = update?.message ?? update?.edited_message;
    const chatId = msg?.chat?.id;
    const text = msg?.text;
    if (chatId && typeof text === "string" && text.startsWith("/")) {
      await handleCommand(chatId, text);
    }
    return new Response("ok");
  } catch (e) {
    console.error("[telegram-keys-bot]", e);
    return new Response("ok"); // always 200 so Telegram doesn't retry
  }
});
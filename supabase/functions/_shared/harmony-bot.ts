/** @doc Handler لبوت تليجرام Megsyaibot: تسجيل، إحالات، مهام، ونقاط.
 *  ينفّذ كـ sub-handler داخل edge function telegram-tasks-bot عبر
 *  توجيه المسار /harmony/webhook. مستقل تماماً عن بوت Megsy الأصلي:
 *  يستخدم TELEGRAM_HARMONY_BOT_TOKEN وجداول telegram_users/telegram_referrals/
 *  telegram_tasks/telegram_task_completions. */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const BOT_TOKEN = Deno.env.get("TELEGRAM_HARMONY_BOT_TOKEN") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("TELEGRAM_HARMONY_WEBHOOK_SECRET") || "";
const ADMIN_PASSWORD = Deno.env.get("TELEGRAM_ADMIN_PASSWORD") || "";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

interface TgUser {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TgMessage {
  message_id: number;
  from?: TgUser;
  chat: { id: number; type: string };
  text?: string;
  entities?: Array<{ type: string; offset: number; length: number }>;
}

interface TgUpdate {
  update_id: number;
  message?: TgMessage;
  edited_message?: TgMessage;
  callback_query?: {
    id: string;
    from: TgUser;
    message?: TgMessage;
    data?: string;
  };
}

async function tgApi(method: string, body: Record<string, unknown>) {
  if (!BOT_TOKEN) throw new Error("TELEGRAM_HARMONY_BOT_TOKEN not configured");
  const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data.ok) {
    console.error("[harmony-bot] tg api error", method, resp.status, data);
  }
  return data;
}

function sendMessage(chatId: number, text: string, extra: Record<string, unknown> = {}) {
  return tgApi("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...extra,
  });
}

const WELCOME_VIDEO_URL =
  "https://project--0e39f004-6eaa-4228-841b-2cd07c72d1e1.lovable.app/__l5e/assets-v1/d8a37cbb-d77e-4122-9b90-b5ec3c7c614e/harmony-start.mp4";

const REFERRER_REWARD = 5;
const REFERRED_REWARD = 0; // no free points on signup
const REFERRAL_COMMISSION_PCT = 20;

// ============= Telegram initData verification =============
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
async function hmacSha256(key: BufferSource, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
}
function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
async function verifyTelegramInitData(
  initData: string,
): Promise<{ user: TgUser; startParam: string | null } | null> {
  if (!initData || !BOT_TOKEN) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");
  const keys = [...params.keys()].sort();
  const dataCheckString = keys.map((k) => `${k}=${params.get(k)}`).join("\n");
  const secretKey = await hmacSha256(new TextEncoder().encode("WebAppData"), BOT_TOKEN);
  const sig = await hmacSha256(new Uint8Array(secretKey), dataCheckString);
  const expected = toHex(sig);
  if (expected !== hash) return null;
  const authDate = Number(params.get("auth_date") || 0);
  if (!authDate || Date.now() / 1000 - authDate > 86400) return null;
  const userStr = params.get("user");
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr) as TgUser;
    return { user, startParam: params.get("start_param") };
  } catch {
    return null;
  }
}

const APP_URL = "https://megsyai.com";
const CHANNEL_URL = "https://t.me/megsyai";
const X_URL = "https://x.com/megsyai";

// ============= i18n (device language, default English) =============
type Lang = "en" | "ar";
function pickLang(code?: string | null): Lang {
  if (!code) return "en";
  return code.toLowerCase().startsWith("ar") ? "ar" : "en";
}
const STR = {
  welcome_new: {
    en: (n: string) => `Welcome, <b>${n}</b>.\nYour <b>Megsy AI</b> account is ready.`,
    ar: (n: string) => `أهلاً بك يا <b>${n}</b>.\nحسابك في <b>Megsy AI</b> جاهز.`,
  },
  welcome_back: {
    en: (n: string) => `Welcome back, <b>${n}</b>.`,
    ar: (n: string) => `أهلاً بعودتك يا <b>${n}</b>.`,
  },
  balance: { en: "Balance", ar: "الرصيد" },
  points: { en: "points", ar: "نقطة" },
  invite_link: { en: "Your invite link", ar: "رابط الإحالة الخاص بك" },
  earn_line: {
    en: (r: number, p: number) => `Earn <b>${r}</b> points per signup, plus <b>${p}%</b> lifetime commission on every purchase.`,
    ar: (r: number, p: number) => `احصل على <b>${r}</b> نقاط لكل تسجيل، بالإضافة إلى <b>${p}%</b> عمولة مدى الحياة على كل عملية شراء.`,
  },
  send_start_first: { en: "Send /start first to activate your account.", ar: "أرسل /start أولاً لتفعيل حسابك." },
  send_start_short: { en: "Send /start first.", ar: "أرسل /start أولاً." },
  points_label: { en: "Points", ar: "النقاط" },
  completed_refs: { en: "Completed referrals", ar: "الإحالات المكتملة" },
  your_code: { en: "Your code", ar: "الكود الخاص بك" },
  no_tasks: { en: "<b>No tasks yet.</b>", ar: "<b>لا توجد مهام حالياً.</b>" },
  open_task: { en: "Open task", ar: "افتح المهمة" },
  no_link: { en: "No link", ar: "لا يوجد رابط" },
  checkin_off: { en: "Daily check-in is disabled. Complete real tasks with /tasks.", ar: "المكافأة اليومية معطّلة. أكمل المهام الحقيقية عبر /tasks." },
  help_title: { en: "Megsy AI — Help", ar: "Megsy AI — المساعدة" },
  help_start: { en: "/start — activate your account", ar: "/start — تفعيل حسابك" },
  help_me: { en: "/me — profile & points", ar: "/me — الملف الشخصي والنقاط" },
  help_invite: { en: "/invite — your referral link", ar: "/invite — رابط الإحالة" },
  help_tasks: { en: "/tasks — tasks & rewards", ar: "/tasks — المهام والمكافآت" },
  help_help: { en: "/help — this menu", ar: "/help — هذه القائمة" },
  referral_earned: {
    en: (r: number) => `A new friend joined via your invite — you earned <b>${r}</b> points.`,
    ar: (r: number) => `انضم صديق جديد عبر رابطك — لقد ربحت <b>${r}</b> نقاط.`,
  },
  btn_open: { en: "✦  Open Megsy AI", ar: "✦  افتح Megsy AI" },
  btn_channel: { en: "Channel", ar: "القناة" },
  btn_twitter: { en: "X / Twitter", ar: "X / تويتر" },
  btn_share: { en: "Share invite", ar: "شارك رابط الإحالة" },
  btn_earn: { en: "💰 Earn", ar: "💰 اربح" },
  btn_tasks: { en: "🎯 Tasks", ar: "🎯 المهام" },
  share_text: { en: "Join me on Megsy AI", ar: "انضم إليّ في Megsy AI" },
} as const;
function T<K extends keyof typeof STR>(lang: Lang, key: K): (typeof STR)[K][Lang] {
  return STR[key][lang];
}
async function langFor(telegramId: number, fallback?: string | null): Promise<Lang> {
  if (fallback) return pickLang(fallback);
  const { data } = await admin
    .from("telegram_users")
    .select("language_code")
    .eq("telegram_id", telegramId)
    .maybeSingle();
  return pickLang((data?.language_code as string | undefined) ?? null);
}

// Premium-style minimal glyphs (no colorful stock emoji).
const G = {
  diamond: "◆",
  spark: "✦",
  dot: "▸",
  check: "✓",
  circle: "◇",
  crown: "❖",
  ring: "⟡",
};

function mainKeyboard(lang: Lang = "en") {
  return {
    inline_keyboard: [
      [{ text: T(lang, "btn_open") as string, web_app: { url: APP_URL } }],
      [
        { text: T(lang, "btn_channel") as string, url: CHANNEL_URL },
        { text: T(lang, "btn_twitter") as string, url: X_URL },
      ],
      [
        { text: T(lang, "btn_earn") as string, callback_data: "earn" },
        { text: T(lang, "btn_tasks") as string, callback_data: "tasks" },
      ],
    ],
  };
}

function inviteKeyboard(link: string, lang: Lang = "en") {
  const share = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(T(lang, "share_text") as string)}`;
  return {
    inline_keyboard: [
      [{ text: T(lang, "btn_share") as string, url: share }],
      [{ text: T(lang, "btn_open") as string, web_app: { url: APP_URL } }],
    ],
  };
}

async function setupHarmonyBotSurface() {
  const commands = [
    { command: "start", description: "Open Megsy AI" },
    { command: "me", description: "Profile and points" },
    { command: "invite", description: "Referral link" },
    { command: "tasks", description: "Tasks and rewards" },
    { command: "help", description: "Help" },
  ];
  const [commandsResult, menuResult] = await Promise.all([
    tgApi("setMyCommands", { commands }),
    tgApi("setChatMenuButton", {
      menu_button: {
        type: "web_app",
        text: "Open Megsy AI",
        web_app: { url: APP_URL },
      },
    }),
  ]);
  return { commandsResult, menuResult };
}

async function sendWelcomeVideo(chatId: number, caption: string, extra: Record<string, unknown> = {}) {
  const payloadBase = {
    chat_id: chatId,
    caption,
    parse_mode: "HTML",
    supports_streaming: true,
    ...extra,
  };
  let resp = await tgApi("sendVideo", { ...payloadBase, video: WELCOME_VIDEO_URL });
  if (resp?.ok) return;
  resp = await tgApi("sendAnimation", { ...payloadBase, animation: WELCOME_VIDEO_URL });
  if (resp?.ok) return;
  await sendMessage(chatId, caption, extra);
}

function genReferralCode(telegramId: number): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TG${telegramId.toString(36).toUpperCase()}${rand}`.slice(0, 20);
}

async function upsertUser(from: TgUser, referredBy?: number | null) {
  // Try find existing
  const { data: existing } = await admin
    .from("telegram_users")
    .select("*")
    .eq("telegram_id", from.id)
    .maybeSingle();

  if (existing) {
    await admin
      .from("telegram_users")
      .update({
        username: from.username ?? existing.username,
        first_name: from.first_name ?? existing.first_name,
        last_name: from.last_name ?? existing.last_name,
        language_code: from.language_code ?? existing.language_code,
        last_seen_at: new Date().toISOString(),
      })
      .eq("telegram_id", from.id);
    return { user: existing, created: false };
  }

  const referral_code = genReferralCode(from.id);
  const { data: inserted, error } = await admin
    .from("telegram_users")
    .insert({
      telegram_id: from.id,
      username: from.username ?? null,
      first_name: from.first_name ?? null,
      last_name: from.last_name ?? null,
      language_code: from.language_code ?? null,
      referral_code,
      referred_by: referredBy ?? null,
      last_seen_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    console.error("[harmony-bot] insert user failed", error);
    throw error;
  }
  return { user: inserted, created: true };
}

async function resolveReferrer(payload: string): Promise<number | null> {
  if (!payload) return null;
  const code = payload.trim();
  // Numeric telegram id
  if (/^\d{5,}$/.test(code)) return Number(code);
  const { data } = await admin
    .from("telegram_users")
    .select("telegram_id")
    .eq("referral_code", code)
    .maybeSingle();
  return (data?.telegram_id as number | undefined) ?? null;
}

async function creditPoints(telegramId: number, delta: number) {
  if (!delta) return;
  const { data: cur } = await admin
    .from("telegram_users")
    .select("points")
    .eq("telegram_id", telegramId)
    .maybeSingle();
  const next = (cur?.points ?? 0) + delta;
  await admin.from("telegram_users").update({ points: next }).eq("telegram_id", telegramId);
}

async function completeTaskByCode(telegramId: number, code: string) {
  const { data: task } = await admin
    .from("telegram_tasks")
    .select("*")
    .eq("code", code)
    .eq("is_active", true)
    .maybeSingle();
  if (!task) return null;
  const { data: already } = await admin
    .from("telegram_task_completions")
    .select("id")
    .eq("telegram_id", telegramId)
    .eq("task_id", task.id)
    .maybeSingle();
  if (already) return { task, granted: 0, alreadyDone: true };
  await admin.from("telegram_task_completions").insert({
    telegram_id: telegramId,
    task_id: task.id,
    reward_granted: task.reward_points,
  });
  await creditPoints(telegramId, task.reward_points);
  return { task, granted: task.reward_points, alreadyDone: false };
}

async function handleReferral(referrerTgId: number, newUserTgId: number) {
  if (referrerTgId === newUserTgId) return;
  const { data: existing } = await admin
    .from("telegram_referrals")
    .select("id")
    .eq("referred_telegram_id", newUserTgId)
    .maybeSingle();
  if (existing) return;

  const rewardReferrer = REFERRER_REWARD;
  const rewardReferred = REFERRED_REWARD;
  await admin.from("telegram_referrals").insert({
    referrer_telegram_id: referrerTgId,
    referred_telegram_id: newUserTgId,
    status: "completed",
    reward_referrer: rewardReferrer,
    reward_referred: rewardReferred,
    rewarded_at: new Date().toISOString(),
  });
  await creditPoints(referrerTgId, rewardReferrer);
  if (rewardReferred > 0) await creditPoints(newUserTgId, rewardReferred);

  // Auto-complete "invite_first_friend" for referrer
  await completeTaskByCode(referrerTgId, "invite_first_friend");

  // Check invite_three_friends
  const { count } = await admin
    .from("telegram_referrals")
    .select("*", { count: "exact", head: true })
    .eq("referrer_telegram_id", referrerTgId)
    .eq("status", "completed");
  if ((count ?? 0) >= 3) await completeTaskByCode(referrerTgId, "invite_three_friends");

  // Notify referrer in their language
  try {
    const lang = await langFor(referrerTgId);
    const text = (T(lang, "referral_earned") as (r: number) => string)(rewardReferrer);
    await sendMessage(referrerTgId, text);
  } catch { /* ignore */ }
}

function botUsernameFromEnv(): string {
  return Deno.env.get("TELEGRAM_HARMONY_BOT_USERNAME") || "Megsyaibot";
}

async function cmdStart(msg: TgMessage, payload: string) {
  if (!msg.from) return;
  const referrerId = await resolveReferrer(payload);
  const { user, created } = await upsertUser(msg.from, referrerId);

  if (created) {
    if (referrerId) await handleReferral(referrerId, user.telegram_id);
  }

  const lang = pickLang(msg.from.language_code);
  const link = `https://t.me/${botUsernameFromEnv()}?start=${user.referral_code}`;
  const name = msg.from.first_name || "there";
  const greet = created
    ? (T(lang, "welcome_new") as (n: string) => string)(name)
    : (T(lang, "welcome_back") as (n: string) => string)(name);

  const body = [
    greet,
    "",
    `<b>${T(lang, "balance")}</b>`,
    `${user.points ?? 0} ${T(lang, "points")}`,
    "",
    `<b>${T(lang, "invite_link")}</b>`,
    `<code>${link}</code>`,
    "",
    (T(lang, "earn_line") as (r: number, p: number) => string)(REFERRER_REWARD, REFERRAL_COMMISSION_PCT),
  ].join("\n");

  await sendWelcomeVideo(msg.chat.id, body, { reply_markup: mainKeyboard(lang) });
}

async function cmdMe(msg: TgMessage) {
  if (!msg.from) return;
  const lang = pickLang(msg.from.language_code);
  const { data: user } = await admin
    .from("telegram_users")
    .select("*")
    .eq("telegram_id", msg.from.id)
    .maybeSingle();
  if (!user) {
    await sendMessage(msg.chat.id, T(lang, "send_start_first") as string);
    return;
  }
  const { count: refCount } = await admin
    .from("telegram_referrals")
    .select("*", { count: "exact", head: true })
    .eq("referrer_telegram_id", msg.from.id)
    .eq("status", "completed");

  const body = [
    `<b>${(user.first_name || "").trim()} ${(user.last_name || "").trim()}</b>`.trim(),
    `${T(lang, "points_label")}: <b>${user.points ?? 0}</b>`,
    `${T(lang, "completed_refs")}: <b>${refCount ?? 0}</b>`,
    `${T(lang, "your_code")}: <code>${user.referral_code}</code>`,
  ].join("\n");
  await sendMessage(msg.chat.id, body, { reply_markup: mainKeyboard(lang) });
}

async function cmdInvite(msg: TgMessage) {
  if (!msg.from) return;
  const lang = pickLang(msg.from.language_code);
  const { data: user } = await admin
    .from("telegram_users")
    .select("referral_code, language_code")
    .eq("telegram_id", msg.from.id)
    .maybeSingle();
  if (!user) {
    await sendMessage(msg.chat.id, T(lang, "send_start_short") as string);
    return;
  }
  const link = `https://t.me/${botUsernameFromEnv()}?start=${user.referral_code}`;
  const body = [
    `<b>${T(lang, "invite_link")}</b>`,
    "",
    `<code>${link}</code>`,
    "",
    (T(lang, "earn_line") as (r: number, p: number) => string)(REFERRER_REWARD, REFERRAL_COMMISSION_PCT),
  ].join("\n");
  await sendMessage(msg.chat.id, body, { reply_markup: inviteKeyboard(link, lang) });
}

async function cmdTasks(msg: TgMessage) {
  if (!msg.from) return;
  const lang = pickLang(msg.from.language_code);
  const { data: tasks } = await admin
    .from("telegram_tasks")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  const list = (tasks ?? []) as Array<{ id: string; title: string; image_url: string | null; link_url: string | null }>;
  if (list.length === 0) {
    await sendMessage(msg.chat.id, T(lang, "no_tasks") as string, { reply_markup: mainKeyboard(lang) });
    return;
  }
  // Send one card per task: photo + title + button that opens the link
  for (const t of list) {
    const kb = {
      inline_keyboard: [[
        t.link_url
          ? { text: T(lang, "open_task") as string, url: t.link_url }
          : { text: T(lang, "no_link") as string, callback_data: "noop" },
      ]],
    };
    if (t.image_url) {
      const r = await tgApi("sendPhoto", {
        chat_id: msg.chat.id,
        photo: t.image_url,
        caption: `<b>${t.title}</b>`,
        parse_mode: "HTML",
        reply_markup: kb,
      });
      if (r?.ok) continue;
    }
    await sendMessage(msg.chat.id, `<b>${t.title}</b>`, { reply_markup: kb });
  }
}

async function cmdCheckin(msg: TgMessage) {
  if (!msg.from) return;
  const lang = pickLang(msg.from.language_code);
  await sendMessage(msg.chat.id, T(lang, "checkin_off") as string);
}

async function cmdHelp(msg: TgMessage) {
  const lang = pickLang(msg.from?.language_code);
  const body = [
    `<b>${T(lang, "help_title")}</b>`,
    "",
    T(lang, "help_start") as string,
    T(lang, "help_me") as string,
    T(lang, "help_invite") as string,
    T(lang, "help_tasks") as string,
    T(lang, "help_help") as string,
  ].join("\n");
  await sendMessage(msg.chat.id, body, { reply_markup: mainKeyboard(lang) });
}

async function handleMessage(msg: TgMessage) {
  if (!msg.text || !msg.from) return;
  const text = msg.text.trim();

  // Admin: password entry & multi-step prompts
  if (await handleAdminMessage(msg, text)) return;

  // /start [payload]
  if (text.startsWith("/start")) {
    const parts = text.split(/\s+/);
    const payload = parts.slice(1).join(" ") || "";
    await cmdStart(msg, payload);
    return;
  }

  // Touch last_seen
  await upsertUser(msg.from);

  const cmd = text.split(/\s+/)[0].toLowerCase().split("@")[0];
  switch (cmd) {
    case "/101":
      await cmdAdmin(msg); return;
    case "/me":
      await cmdMe(msg); return;
    case "/invite":
      await cmdInvite(msg); return;
    case "/tasks":
      await cmdTasks(msg); return;
    case "/checkin":
      await cmdCheckin(msg); return;
    case "/help":
      await cmdHelp(msg); return;
    default:
      // No echo for chit-chat; keep the bot focused.
      return;
  }
}

export async function tryHandleHarmonyBot(req: Request): Promise<Response | null> {
  const url = new URL(req.url);
  if (url.pathname.includes("/harmony/setup")) {
    const webhookUrl = `${SUPABASE_URL}/functions/v1/telegram-tasks-bot/harmony/webhook`;
    const [result, surface] = await Promise.all([
      tgApi("setWebhook", {
        url: webhookUrl,
        secret_token: WEBHOOK_SECRET,
        allowed_updates: ["message", "edited_message", "callback_query"],
        drop_pending_updates: true,
      }),
      setupHarmonyBotSurface(),
    ]);
    const info = await tgApi("getWebhookInfo", {});
    return new Response(JSON.stringify({ setWebhook: result, surface, info, webhookUrl }, null, 2), {
      headers: { "Content-Type": "application/json" },
    });
  }
  if (url.pathname.includes("/harmony/stickerset")) {
    const name = url.searchParams.get("name") || "UpscaleTradeBot";
    const r = await tgApi("getStickerSet", { name });
    return new Response(JSON.stringify(r, null, 2), { headers: { "Content-Type": "application/json" } });
  }
  if (url.pathname.includes("/harmony/notify")) {
    if (req.method !== "POST") return new Response("method not allowed", { status: 405 });
    const provided = req.headers.get("x-harmony-secret") || "";
    if (!WEBHOOK_SECRET || provided !== WEBHOOK_SECRET) {
      return new Response("unauthorized", { status: 401 });
    }
    let body: { user_id?: string; telegram_id?: number; text?: string; broadcast?: boolean } = {};
    try { body = await req.json(); } catch { /* ignore */ }
    const text = body.text || "";
    if (!text) return new Response("missing text", { status: 400 });
    const { notifyTelegramUser, broadcastTelegram } = await import("./harmony-notify.ts");
    if (body.broadcast) {
      const r = await broadcastTelegram(text);
      return new Response(JSON.stringify(r), { headers: { "Content-Type": "application/json" } });
    }
    if (body.telegram_id) {
      const r = await tgApi("sendMessage", {
        chat_id: body.telegram_id, text, parse_mode: "HTML", disable_web_page_preview: true,
      });
      return new Response(JSON.stringify(r), { headers: { "Content-Type": "application/json" } });
    }
    if (body.user_id) {
      const r = await notifyTelegramUser(body.user_id, text);
      return new Response(JSON.stringify(r), { headers: { "Content-Type": "application/json" } });
    }
    return new Response("missing target", { status: 400 });
  }

  // ==================== Mini App auto-login endpoint ====================
  // POST { initData } → verifies Telegram initData, ensures a Supabase auth
  // user exists (linked in telegram_users.user_id), and returns a magic-link
  // token_hash the client exchanges for a full Supabase session.
  if (url.pathname.includes("/harmony/auth")) {
    const CORS = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Content-Type": "application/json",
    } as Record<string, string>;
    if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers: CORS });
    }
    let body: { initData?: string; referredBy?: string } = {};
    try { body = await req.json(); } catch { /* ignore */ }
    const verified = await verifyTelegramInitData(body.initData || "");
    if (!verified) {
      return new Response(JSON.stringify({ error: "invalid_init_data" }), { status: 401, headers: CORS });
    }
    const tgUser = verified.user;
    const startParam = body.referredBy || verified.startParam || "";
    const referredBy = startParam ? await resolveReferrer(startParam) : null;

    const { user: tgRow, created } = await upsertUser(tgUser, referredBy);
    const email = `tg_${tgUser.id}@megsy.telegram.local`;
    let userId = (tgRow as { user_id?: string | null }).user_id ?? null;

    if (!userId) {
      const displayName =
        [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ") ||
        tgUser.username ||
        `Telegram ${tgUser.id}`;
      const { data: createRes, error: createErr } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          telegram_id: tgUser.id,
          full_name: displayName,
          username: tgUser.username ?? null,
          avatar_url: null,
          provider: "telegram",
        },
      });
      if (createErr || !createRes?.user) {
        // Likely already exists (previous partial link) — look it up by email.
        try {
          const { data: list } = await admin.auth.admin.listUsers();
          const existing = list?.users?.find((u) => u.email === email);
          if (existing) userId = existing.id;
        } catch { /* ignore */ }
        if (!userId) {
          return new Response(
            JSON.stringify({ error: createErr?.message || "create_user_failed" }),
            { status: 500, headers: CORS },
          );
        }
      } else {
        userId = createRes.user.id;
      }
      await admin.from("telegram_users").update({ user_id: userId }).eq("telegram_id", tgUser.id);
      if (created && referredBy && REFERRER_REWARD > 0) {
        await creditPoints(referredBy, REFERRER_REWARD);
      }
    }

    const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });
    if (linkErr || !link) {
      return new Response(
        JSON.stringify({ error: linkErr?.message || "link_failed" }),
        { status: 500, headers: CORS },
      );
    }
    return new Response(
      JSON.stringify({
        email,
        token_hash: link.properties?.hashed_token,
        user_id: userId,
        created,
      }),
      { status: 200, headers: CORS },
    );
  }

  if (!url.pathname.includes("/harmony/webhook")) return null;

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "content-type, x-telegram-bot-api-secret-token",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }

  // Verify secret token (Telegram sends it in header for setWebhook secret_token)
  if (WEBHOOK_SECRET) {
    const provided = req.headers.get("x-telegram-bot-api-secret-token") || "";
    if (provided !== WEBHOOK_SECRET) {
      return new Response("unauthorized", { status: 401 });
    }
  }

  let update: TgUpdate;
  try {
    update = (await req.json()) as TgUpdate;
  } catch {
    return new Response("bad json", { status: 400 });
  }

  try {
    const msg = update.message || update.edited_message;
    if (msg) await handleMessage(msg);
    if (update.callback_query) await handleCallbackQuery(update.callback_query);
  } catch (e) {
    console.error("[harmony-bot] handler error", e);
  }
  // Always ack quickly so Telegram doesn't retry
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
// ===================== ADMIN PANEL =====================

async function isAdmin(chatId: number): Promise<boolean> {
  const { data } = await admin
    .from("bot_admins")
    .select("id")
    .eq("telegram_chat_id", chatId)
    .maybeSingle();
  return !!data;
}

async function setPending(chatId: number, action: string, payload: Record<string, unknown> = {}) {
  await admin.from("bot_pending_actions").upsert({
    chat_id: chatId,
    action,
    payload,
    created_at: new Date().toISOString(),
  }, { onConflict: "chat_id" });
}

async function getPending(chatId: number) {
  const { data } = await admin
    .from("bot_pending_actions")
    .select("*")
    .eq("chat_id", chatId)
    .maybeSingle();
  return data as { chat_id: number; action: string; payload: Record<string, unknown> } | null;
}

async function clearPending(chatId: number) {
  await admin.from("bot_pending_actions").delete().eq("chat_id", chatId);
}

function adminMenuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "Stats", callback_data: "adm:stats" }, { text: "Revenue", callback_data: "adm:revenue" }],
      [{ text: "Tasks", callback_data: "adm:tasks" }, { text: "API Keys", callback_data: "adm:keys" }],
      [{ text: "Incidents", callback_data: "adm:incidents" }, { text: "Blog", callback_data: "adm:blog" }],
      [{ text: "Grant Subscription", callback_data: "adm:grant" }, { text: "Broadcast", callback_data: "adm:broadcast" }],
      [{ text: "Close", callback_data: "adm:close" }],
    ],
  };
}

async function cmdAdmin(msg: TgMessage) {
  if (!msg.from) return;
  if (await isAdmin(msg.chat.id)) {
    await sendMessage(msg.chat.id, "<b>Admin Panel</b>\nChoose a section:", {
      reply_markup: adminMenuKeyboard(),
    });
    return;
  }
  await setPending(msg.chat.id, "awaiting_admin_pw");
  await sendMessage(msg.chat.id, "Enter admin password:");
}

async function handleAdminMessage(msg: TgMessage, text: string): Promise<boolean> {
  const pending = await getPending(msg.chat.id);
  if (!pending) return false;

  // Password entry
  if (pending.action === "awaiting_admin_pw") {
    // Attempt to delete the password message for hygiene
    await tgApi("deleteMessage", { chat_id: msg.chat.id, message_id: msg.message_id }).catch(() => {});
    await clearPending(msg.chat.id);
    if (!ADMIN_PASSWORD || text !== ADMIN_PASSWORD) {
      await sendMessage(msg.chat.id, "Wrong password.");
      return true;
    }
    await admin.from("bot_admins").upsert({
      telegram_chat_id: msg.chat.id,
      added_by: msg.from?.id ?? null,
    }, { onConflict: "telegram_chat_id" });
    await sendMessage(msg.chat.id, "<b>Access granted.</b>\nAdmin Panel:", {
      reply_markup: adminMenuKeyboard(),
    });
    return true;
  }

  // All further actions require admin
  if (!(await isAdmin(msg.chat.id))) return false;

  switch (pending.action) {
    case "task_add_title":
      await setPending(msg.chat.id, "task_add_image", { title: text });
      await sendMessage(msg.chat.id, "Send task <b>image URL</b> (or type <code>skip</code>):");
      return true;
    case "task_add_image": {
      const image = text.trim().toLowerCase() === "skip" ? null : text.trim();
      await setPending(msg.chat.id, "task_add_link", { ...pending.payload, image_url: image });
      await sendMessage(msg.chat.id, "Send task <b>link URL</b> (destination):");
      return true;
    }
    case "task_add_link": {
      const p = pending.payload as { title: string; image_url: string | null };
      const code = `task_${Date.now()}`;
      const { error } = await admin.from("telegram_tasks").insert({
        code,
        title: p.title,
        image_url: p.image_url,
        link_url: text.trim(),
        reward_points: 0,
        is_active: true,
        action_type: "link",
      });
      await clearPending(msg.chat.id);
      await sendMessage(msg.chat.id, error ? `Error: ${error.message}` : `Task <b>${p.title}</b> added.`, {
        reply_markup: adminMenuKeyboard(),
      });
      return true;
    }
    case "key_add": {
      const service = (pending.payload.service as string) || "";
      const table =
        service === "alibaba" ? "alibaba_keys" :
        service === "brave" ? "brave_keys" :
        service === "apify" ? "apify_keys" :
        "wavespeed_keys";
      const row: Record<string, unknown> = { api_key: text, label: `admin-${Date.now()}`, status: "active" };
      if (service === "alibaba") row.category = "image";
      const { error } = await admin.from(table).insert(row);
      await clearPending(msg.chat.id);
      await sendMessage(msg.chat.id, error ? `Error: ${error.message}` : `Key added to <b>${service}</b>.`, {
        reply_markup: adminMenuKeyboard(),
      });
      return true;
    }
    case "incident_add_title":
      await setPending(msg.chat.id, "incident_add_message", { title: text });
      await sendMessage(msg.chat.id, "Send incident <b>message</b>:");
      return true;
    case "incident_add_message": {
      const p = pending.payload as { title: string };
      const { error } = await admin.from("service_incidents").insert({
        service_name: "platform", title: p.title, message: text, status: "investigating",
        started_at: new Date().toISOString(),
      });
      await clearPending(msg.chat.id);
      await sendMessage(msg.chat.id, error ? `Error: ${error.message}` : "Incident logged.", {
        reply_markup: adminMenuKeyboard(),
      });
      return true;
    }
    case "blog_slug":
      await setPending(msg.chat.id, "blog_title", { slug: text });
      await sendMessage(msg.chat.id, "Send blog <b>title</b>:");
      return true;
    case "blog_title":
      await setPending(msg.chat.id, "blog_body", { ...pending.payload, title: text });
      await sendMessage(msg.chat.id, "Send blog <b>content (Markdown)</b>:");
      return true;
    case "blog_body": {
      const p = pending.payload as { slug: string; title: string };
      const { error } = await admin.from("blog_posts").insert({
        slug: p.slug, title: p.title, content_md: text,
        excerpt: text.slice(0, 160), meta_description: text.slice(0, 160),
        status: "published", language: "en", published_at: new Date().toISOString(),
      });
      await clearPending(msg.chat.id);
      await sendMessage(msg.chat.id, error ? `Error: ${error.message}` : `Post <b>${p.title}</b> published.`, {
        reply_markup: adminMenuKeyboard(),
      });
      return true;
    }
    case "grant_email":
      await setPending(msg.chat.id, "grant_plan", { email: text });
      await sendMessage(msg.chat.id, "Send plan (<b>pro</b>, <b>elite</b>, or <b>business</b>):");
      return true;
    case "grant_plan": {
      const p = pending.payload as { email: string };
      const plan = text.trim().toLowerCase();
      // Find user by email in auth via profiles join
      const { data: authUser } = await admin.auth.admin.listUsers();
      const user = authUser?.users?.find((u: { email?: string }) => u.email?.toLowerCase() === p.email.toLowerCase());
      await clearPending(msg.chat.id);
      if (!user) {
        await sendMessage(msg.chat.id, `User <code>${p.email}</code> not found.`, { reply_markup: adminMenuKeyboard() });
        return true;
      }
      const periodEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
      await admin.from("profiles").update({ plan }).eq("id", user.id);
      await admin.from("subscriptions").upsert({
        user_id: user.id, plan, status: "active", current_period_end: periodEnd,
        polar_subscription_id: `admin-grant-${user.id}-${Date.now()}`,
      });
      await sendMessage(msg.chat.id, `Granted <b>${plan}</b> to ${p.email} for 30 days.`, {
        reply_markup: adminMenuKeyboard(),
      });
      return true;
    }
    case "broadcast_text": {
      await clearPending(msg.chat.id);
      const { data: users } = await admin.from("telegram_users").select("telegram_id");
      let ok = 0, fail = 0;
      for (const u of (users ?? []) as { telegram_id: number }[]) {
        const r = await tgApi("sendMessage", {
          chat_id: u.telegram_id, text, parse_mode: "HTML", disable_web_page_preview: true,
        }).catch(() => ({ ok: false }));
        if (r && (r as { ok?: boolean }).ok) ok++; else fail++;
        await new Promise((r) => setTimeout(r, 35)); // ~30 msg/s
      }
      await sendMessage(msg.chat.id, `Broadcast sent.\nDelivered: <b>${ok}</b>\nFailed: <b>${fail}</b>`, {
        reply_markup: adminMenuKeyboard(),
      });
      return true;
    }
  }
  return false;
}

async function handleCallbackQuery(cq: NonNullable<TgUpdate["callback_query"]>) {
  const chatId = cq.message?.chat.id;
  const data = cq.data || "";
  if (!chatId) return;
  await tgApi("answerCallbackQuery", { callback_query_id: cq.id });

  // Public buttons: Earn (referral) and Tasks
  if (data === "earn" || data === "tasks") {
    const fakeMsg: TgMessage = {
      message_id: cq.message?.message_id ?? 0,
      from: cq.from,
      chat: cq.message?.chat ?? { id: chatId, type: "private" },
    };
    if (data === "earn") await cmdInvite(fakeMsg);
    else await cmdTasks(fakeMsg);
    return;
  }

  if (!data.startsWith("adm:")) return;
  if (!(await isAdmin(chatId))) {
    await sendMessage(chatId, "Unauthorized.");
    return;
  }

  const parts = data.split(":");
  const section = parts[1];
  const sub = parts[2];
  const arg = parts[3];

  switch (section) {
    case "close":
      await sendMessage(chatId, "Admin panel closed.");
      return;
    case "menu":
      await sendMessage(chatId, "<b>Admin Panel</b>", { reply_markup: adminMenuKeyboard() });
      return;
    case "stats":
      await admStats(chatId); return;
    case "revenue":
      await admRevenue(chatId); return;
    case "tasks":
      if (sub === "add") { await setPending(chatId, "task_add_title"); await sendMessage(chatId, "Send task <b>title / name</b>:"); return; }
      if (sub === "toggle" && arg) { await admTaskToggle(chatId, arg); return; }
      await admTasksList(chatId); return;
    case "keys":
      if (sub === "add" && arg) { await setPending(chatId, "key_add", { service: arg }); await sendMessage(chatId, `Paste new API key for <b>${arg}</b>:`); return; }
      await admKeysMenu(chatId); return;
    case "incidents":
      if (sub === "add") { await setPending(chatId, "incident_add_title"); await sendMessage(chatId, "Send incident <b>title</b>:"); return; }
      await admIncidents(chatId); return;
    case "blog":
      await setPending(chatId, "blog_slug");
      await sendMessage(chatId, "Send blog <b>slug</b> (url-safe, e.g. my-post):");
      return;
    case "grant":
      await setPending(chatId, "grant_email");
      await sendMessage(chatId, "Send user <b>email</b>:");
      return;
    case "broadcast":
      await setPending(chatId, "broadcast_text");
      await sendMessage(chatId, "Send the <b>message</b> to broadcast to all Telegram users (HTML supported):");
      return;
  }
}

async function admStats(chatId: number) {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 3600_000).toISOString();
  const oneDayAgo = new Date(now.getTime() - 86400_000).toISOString();
  const [tgTotal, tgHour, tgDay, webTotal, webHour, visits24, visitsHour] = await Promise.all([
    admin.from("telegram_users").select("*", { count: "exact", head: true }),
    admin.from("telegram_users").select("*", { count: "exact", head: true }).gte("created_at", oneHourAgo),
    admin.from("telegram_users").select("*", { count: "exact", head: true }).gte("created_at", oneDayAgo),
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", oneHourAgo),
    admin.from("project_visits").select("*", { count: "exact", head: true }).gte("created_at", oneDayAgo),
    admin.from("project_visits").select("*", { count: "exact", head: true }).gte("created_at", oneHourAgo),
  ]);
  const body = [
    "<b>Stats</b>",
    "",
    "<b>Telegram users</b>",
    `Total: ${tgTotal.count ?? 0}`,
    `Last hour: ${tgHour.count ?? 0}`,
    `Last 24h: ${tgDay.count ?? 0}`,
    "",
    "<b>Web signups</b>",
    `Total: ${webTotal.count ?? 0}`,
    `Last hour: ${webHour.count ?? 0}`,
    "",
    "<b>Visits (unsigned + signed)</b>",
    `Last hour: ${visitsHour.count ?? 0}`,
    `Last 24h: ${visits24.count ?? 0}`,
  ].join("\n");
  await sendMessage(chatId, body, { reply_markup: { inline_keyboard: [[{ text: "Back", callback_data: "adm:menu" }]] } });
}

async function admRevenue(chatId: number) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const [all, mo, dy, active] = await Promise.all([
    admin.from("revenue_ledger").select("net_amount, currency"),
    admin.from("revenue_ledger").select("net_amount").gte("created_at", monthStart),
    admin.from("revenue_ledger").select("net_amount").gte("created_at", dayStart),
    admin.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
  ]);
  const sum = (rows: { net_amount: number }[] | null) => (rows ?? []).reduce((s, r) => s + Number(r.net_amount || 0), 0);
  const body = [
    "<b>Revenue</b>",
    "",
    `Today: $${sum(dy.data as any).toFixed(2)}`,
    `This month: $${sum(mo.data as any).toFixed(2)}`,
    `All time: $${sum(all.data as any).toFixed(2)}`,
    `Active subscriptions: ${active.count ?? 0}`,
  ].join("\n");
  await sendMessage(chatId, body, { reply_markup: { inline_keyboard: [[{ text: "Back", callback_data: "adm:menu" }]] } });
}

async function admTasksList(chatId: number) {
  const { data: tasks } = await admin.from("telegram_tasks").select("*").order("sort_order");
  const rows = (tasks ?? []).map((t: { id: string; title: string; is_active: boolean; reward_points: number }) => [
    { text: `${t.is_active ? "✓" : "✗"} ${t.title} (${t.reward_points})`, callback_data: `adm:tasks:toggle:${t.id}` },
  ]);
  rows.push([{ text: "+ Add task", callback_data: "adm:tasks:add" }]);
  rows.push([{ text: "Back", callback_data: "adm:menu" }]);
  await sendMessage(chatId, "<b>Telegram Tasks</b>\nTap to toggle active.", { reply_markup: { inline_keyboard: rows } });
}

async function admTaskToggle(chatId: number, id: string) {
  const { data: t } = await admin.from("telegram_tasks").select("is_active").eq("id", id).maybeSingle();
  if (!t) { await sendMessage(chatId, "Task not found."); return; }
  await admin.from("telegram_tasks").update({ is_active: !t.is_active }).eq("id", id);
  await admTasksList(chatId);
}

async function admKeysMenu(chatId: number) {
  const [ws, ali, br, ap] = await Promise.all([
    admin.from("wavespeed_keys").select("*", { count: "exact", head: true }),
    admin.from("alibaba_keys").select("*", { count: "exact", head: true }),
    admin.from("brave_keys").select("*", { count: "exact", head: true }),
    admin.from("apify_keys").select("*", { count: "exact", head: true }),
  ]);
  await sendMessage(chatId, [
    "<b>API Keys</b>",
    `WaveSpeed: ${ws.count ?? 0}`,
    `Alibaba: ${ali.count ?? 0}`,
    `Brave (research): ${br.count ?? 0}`,
    `Apify (research): ${ap.count ?? 0}`,
  ].join("\n"), {
    reply_markup: {
      inline_keyboard: [
        [{ text: "+ WaveSpeed", callback_data: "adm:keys:add:wavespeed" }],
        [{ text: "+ Alibaba", callback_data: "adm:keys:add:alibaba" }],
        [{ text: "+ Brave", callback_data: "adm:keys:add:brave" }, { text: "+ Apify", callback_data: "adm:keys:add:apify" }],
        [{ text: "Back", callback_data: "adm:menu" }],
      ],
    },
  });
}

async function admIncidents(chatId: number) {
  const { data } = await admin.from("service_incidents").select("*").order("started_at", { ascending: false }).limit(5);
  const lines = ["<b>Recent Incidents</b>", ""];
  for (const i of (data ?? []) as Array<{ title: string; status: string; started_at: string }>) {
    lines.push(`• [${i.status}] ${i.title}`);
    lines.push(`  ${new Date(i.started_at).toISOString().slice(0, 16)}`);
  }
  if ((data ?? []).length === 0) lines.push("None.");
  await sendMessage(chatId, lines.join("\n"), {
    reply_markup: { inline_keyboard: [[{ text: "+ New incident", callback_data: "adm:incidents:add" }], [{ text: "Back", callback_data: "adm:menu" }]] },
  });
}

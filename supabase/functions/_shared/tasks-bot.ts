// Telegram bot for managing reward_tasks (admin-only).
// Commands:
//   /start             - check if you're admin
//   /list              - list active tasks
//   /add <key>|<title>|<reward>|<type>|<url>|<target>
//   /edit <key>|<field>=<value>
//   /toggle <key>      - activate/deactivate a task
//   /delete <key>
//   /addadmin <chat_id>
//
// action types: follow_x | follow_instagram | follow_facebook | follow_linkedin
//             | follow_tiktok | follow_youtube | join_telegram | invite_friends | custom

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { kimiChat, kimiJson } from "../_shared/kimi.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TG_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// ============ KEY PROVIDERS (shared) ============
const PROVIDER_MAP: Record<string, { table: string; label: string }> = {
  ali: { table: "alibaba_keys", label: "Alibaba" },
  alibaba: { table: "alibaba_keys", label: "Alibaba" },
  ws: { table: "wavespeed_keys", label: "WaveSpeed" },
  wave: { table: "wavespeed_keys", label: "WaveSpeed" },
  wavespeed: { table: "wavespeed_keys", label: "WaveSpeed" },
  manus: { table: "manus_keys", label: "Manus" },
  rb: { table: "runbase_keys", label: "Runbase" },
  runbase: { table: "runbase_keys", label: "Runbase" },
};

async function insertProviderKey(
  chatId: number,
  provSlug: string,
  rawInput: string,
  label?: string,
): Promise<{ ok: boolean; message: string }> {
  const prov = PROVIDER_MAP[provSlug.toLowerCase()];
  if (!prov) return { ok: false, message: "❌ مزوّد غير معروف." };

  // Allow `<api_key> | <endpoint_host>` for Alibaba sub-workspace keys.
  let key = rawInput.trim();
  let endpointHost: string | null = null;
  if (prov.table === "alibaba_keys" && key.includes("|")) {
    const [k, h] = key.split("|").map((s) => s.trim());
    key = k;
    endpointHost = (h || "").replace(/^https?:\/\//, "").replace(/\/+$/, "") || null;
  }
  if (key.length < 10) return { ok: false, message: "❌ المفتاح قصير جداً — تأكد إنك لصقت المفتاح كامل." };

  // ---- Shape validation per provider to prevent cross-provider pollution ----
  // DashScope: keys may be normal `sk-...` OR sub-workspace `sk-ws-...` (longer).
  // Host is OPTIONAL — the provider auto-discovers the right endpoint at runtime.
  // WaveSpeed keys: start with "wsk_" and are ~40–80 chars.
  if (prov.table === "alibaba_keys") {
    if (!key.startsWith("sk-")) {
      return {
        ok: false,
        message:
          "❌ ده مش شكل مفتاح <b>Alibaba DashScope</b>.\n" +
          "المفتاح لازم يبدأ بـ <code>sk-</code> (أو <code>sk-ws-</code> للـ sub-workspace).\n\n" +
          "💡 لو معاك الـ API Host، ابعت بالصيغة:\n" +
          "<code>/key ali &lt;المفتاح&gt; | &lt;الهوست&gt;</code>\n" +
          "لو مش معاك، النظام هيكتشفه أوتوماتيك.",
      };
    }
  }

  if (prov.table === "wavespeed_keys") {
    if (!key.startsWith("wsk_") || key.length < 30) {
      return {
        ok: false,
        message:
          "❌ ده مش شكل مفتاح <b>WaveSpeed</b>.\n" +
          "مفتاح WaveSpeed بيبدأ بـ <code>wsk_</code>.\n" +
          "لو ده مفتاح Alibaba استخدم: <code>/key ali &lt;المفتاح&gt;</code>",
      };
    }
  }

  if (prov.table === "runbase_keys") {
    if (!key.startsWith("sk-") || key.length < 20) {
      return {
        ok: false,
        message:
          "❌ ده مش شكل مفتاح <b>Runbase</b>.\n" +
          "مفتاح Runbase بيبدأ بـ <code>sk-</code> ومش أقل من 20 حرف.",
      };
    }
  }
  const finalLabel = (label || "").trim() || `tg:${chatId}`;

  const insertRow: Record<string, unknown> = { api_key: key, label: finalLabel };
  if (endpointHost) insertRow.endpoint_host = endpointHost;

  const { data, error } = await supabase
    .from(prov.table)
    .insert(insertRow)
    .select("id")
    .single();
  if (error) {
    const msg = String(error.message || "");
    if (msg.toLowerCase().includes("duplicate")) {
      return { ok: false, message: "⚠️ المفتاح ده موجود بالفعل في النظام." };
    }
    return { ok: false, message: "❌ فشل الحفظ: " + msg };
  }

  if (prov.table === "alibaba_keys") {
    const mpkRow: Record<string, unknown> = {
      provider: "alibaba",
      api_key: key,
      label: `tg:${chatId}:${finalLabel}`,
      status: "active",
    };
    if (endpointHost) mpkRow.endpoint_host = endpointHost;
    const { error: mpkErr } = await supabase.from("media_provider_keys").insert(mpkRow);
    if (mpkErr && !String(mpkErr.message || "").toLowerCase().includes("duplicate")) {
      return {
        ok: true,
        message: `⚠️ اتسجّل في <code>${prov.table}</code> لكن فشل في <code>media_provider_keys</code>: ${mpkErr.message}`,
      };
    }
  }
  const hostLine = endpointHost ? `\n🌐 Host: <code>${endpointHost}</code>` : "";
  return {
    ok: true,
    message: `✅ تم إضافة مفتاح <b>${prov.label}</b> <code>${data.id}</code>${hostLine}\nالحالة: مفعّل وجاهز ✨`,
  };
}


async function setPendingAction(chatId: number, action: string, payload: Record<string, unknown> = {}) {
  await supabase.from("bot_pending_actions").upsert(
    { chat_id: chatId, action, payload, created_at: new Date().toISOString() },
    { onConflict: "chat_id" },
  );
}

async function getPendingAction(chatId: number): Promise<{ action: string; payload: any } | null> {
  const { data } = await supabase
    .from("bot_pending_actions")
    .select("action,payload,created_at")
    .eq("chat_id", chatId)
    .maybeSingle();
  if (!data) return null;
  // 10-minute TTL
  if (Date.now() - new Date(data.created_at).getTime() > 10 * 60_000) {
    await supabase.from("bot_pending_actions").delete().eq("chat_id", chatId);
    return null;
  }
  return { action: data.action, payload: data.payload || {} };
}

async function clearPendingAction(chatId: number) {
  await supabase.from("bot_pending_actions").delete().eq("chat_id", chatId);
}


async function tgSend(chatId: number, text: string) {
  if (!TG_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
  });
}

async function tgSendKeyboard(chatId: number, text: string, buttons: Array<Array<{ text: string; callback_data: string }>>) {
  if (!TG_TOKEN) return null;
  const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: { inline_keyboard: buttons },
    }),
  });
  return res.json().catch(() => null);
}

async function tgAnswerCallback(callbackId: string, text?: string) {
  if (!TG_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackId, text: text ?? "" }),
  });
}

// ============ MENU / KEYBOARD ============

type IKBtn = { text: string; callback_data: string };

function mainMenu(): IKBtn[][] {
  return [
    [{ text: "📊 الإحصائيات", callback_data: "m:stats" }, { text: "💰 الإيرادات", callback_data: "m:revenue" }],
    [{ text: "🎯 المهام", callback_data: "m:tasks" }, { text: "🤖 الوكلاء", callback_data: "m:agents" }],
    [{ text: "📋 الاقتراحات", callback_data: "m:proposals" }, { text: "🚨 الحوادث", callback_data: "m:incidents" }],
    [{ text: "🔑 مفاتيح API", callback_data: "m:keys" }, { text: "✍️ مدونة جديدة", callback_data: "m:blog_new" }],
    [{ text: "🎁 منح Pro لمؤثر (شهر)", callback_data: "m:grant_pro" }],
    [{ text: "❓ المساعدة الكاملة", callback_data: "m:help" }],
  ];
}

function tasksMenu(): IKBtn[][] {
  return [
    [{ text: "📜 عرض كل المهام", callback_data: "m:tasks_list" }],
    [{ text: "🟢 / 🔴 تفعيل/تعطيل", callback_data: "m:tasks_toggle_hint" }],
    [{ text: "➕ إضافة مهمة", callback_data: "m:tasks_add_hint" }, { text: "🗑️ حذف مهمة", callback_data: "m:tasks_del_hint" }],
    [{ text: "⬅️ رجوع", callback_data: "m:main" }],
  ];
}

function keysMenu(): IKBtn[][] {
  return [
    [{ text: "➕ إضافة مفتاح Alibaba", callback_data: "m:keys_add_ali" }],
    [{ text: "➕ إضافة مفتاح Runbase", callback_data: "m:keys_add_rb" }],
    [{ text: "➕ إضافة مفتاح Manus", callback_data: "m:keys_add_manus" }],
    [
      { text: "📜 Alibaba", callback_data: "m:keys_ali" },
      { text: "📜 Runbase", callback_data: "m:keys_rb" },
      { text: "📜 Manus", callback_data: "m:keys_manus" },
    ],
    [{ text: "⬅️ رجوع", callback_data: "m:main" }],
  ];
}


function agentsMenu(): IKBtn[][] {
  return [
    [{ text: "📜 قائمة الوكلاء", callback_data: "m:agents_list" }],
    [{ text: "▶️ كيفية التشغيل", callback_data: "m:agents_run_hint" }],
    [{ text: "⬅️ رجوع", callback_data: "m:main" }],
  ];
}

async function setMyCommands() {
  if (!TG_TOKEN) return;
  const commands = [
    { command: "start",      description: "🏠 القائمة الرئيسية" },
    { command: "menu",       description: "📱 فتح لوحة التحكم" },
    { command: "stats",      description: "📊 إحصائيات + إيرادات" },
    { command: "list",       description: "🎯 عرض المهام" },
    { command: "agents",     description: "🤖 قائمة الوكلاء" },
    { command: "proposals",  description: "📋 الاقتراحات المعلّقة" },
    { command: "incidents",  description: "🚨 الحوادث المفتوحة" },
    { command: "keys",       description: "🔑 مزوّدو API" },
    { command: "listkeys",   description: "🔑 عرض المفاتيح (ali|ws|manus)" },
    { command: "run",        description: "▶️ تشغيل وكيل" },
    { command: "blog",       description: "✍️ /blog new [العنوان اختياري]" },
    { command: "topic",      description: "🌍 /topic <نص> — يضيف موضوع لقائمة النشر التلقائي (25 لغة)" },
    { command: "publishnow", description: "🚀 ينشر دفعة اليوم فوراً (EN + 24 ترجمة)" },
    { command: "add",        description: "➕ إضافة مهمة" },
    { command: "edit",       description: "✏️ تعديل مهمة" },
    { command: "toggle",     description: "🟢 تفعيل/تعطيل مهمة" },
    { command: "delete",     description: "🗑️ حذف مهمة" },
    { command: "addkey",     description: "➕ إضافة مفتاح API" },
    { command: "blockkey",   description: "⛔ حظر مفتاح" },
    { command: "unblockkey", description: "✅ إلغاء حظر مفتاح" },
    { command: "delkey",     description: "🗑️ حذف مفتاح" },
    { command: "setquota",   description: "⚙️ ضبط حصة موديل" },
    { command: "addadmin",   description: "👤 إضافة مشرف" },
    { command: "grantpro",   description: "🎁 منح Pro لمؤثر (شهر)" },
    { command: "help",       description: "❓ كل الأوامر" },
  ];
  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/setMyCommands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commands, language_code: "" }),
  }).catch(() => null);
  // Open the menu button as the native commands list
  await fetch(`https://api.telegram.org/bot${TG_TOKEN}/setChatMenuButton`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ menu_button: { type: "commands" } }),
  }).catch(() => null);
}

async function broadcastAdmins(text: string, buttons?: Array<Array<{ text: string; callback_data: string }>>) {
  const { data: admins } = await supabase.from("bot_admins").select("telegram_chat_id");
  const results = await Promise.all(
    (admins || []).map((a: any) =>
      buttons
        ? tgSendKeyboard(Number(a.telegram_chat_id), text, buttons)
        : tgSend(Number(a.telegram_chat_id), text),
    ),
  );
  return results;
}

// ============ AGENT RUNTIME ============

async function runAgent(slug: string, trigger: string = "manual"): Promise<{ runId: string; proposals: number; error?: string }> {
  const { data: agent } = await supabase.from("ai_agents").select("*").eq("slug", slug).maybeSingle();
  if (!agent) return { runId: "", proposals: 0, error: "agent not found" };
  if (!agent.enabled) return { runId: "", proposals: 0, error: "agent disabled" };

  const { data: run } = await supabase
    .from("agent_runs")
    .insert({ agent_id: agent.id, status: "running", trigger })
    .select()
    .single();

  try {
    // Special handler: blog-writer creates a full blog post
    if (slug === "blog-writer") {
      const result = await runBlogWriter(agent.id);
      await supabase.from("agent_runs").update({
        status: "success", ended_at: new Date().toISOString(),
        output_summary: result.summary, proposals_count: 0,
      }).eq("id", run!.id);
      await supabase.from("ai_agents").update({
        last_run_at: new Date().toISOString(),
        success_count: (agent.success_count ?? 0) + 1,
      }).eq("id", agent.id);
      return { runId: run!.id, proposals: 0 };
    }

    // Generic monitoring/suggestion agent: ask Kimi for proposals JSON
    const context = await gatherContext(agent.category);
    const systemPrompt = `${agent.system_prompt}\n\nRespond ONLY with JSON: {"observations":[{"severity":"info|warn|error|critical","metric":"...","value":0,"message":"..."}],"proposals":[{"kind":"${agent.category}","title":"...","rationale":"...","payload":{}}],"summary":"one line"}`;

    const out = await kimiJson<any>({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Context (project snapshot):\n${JSON.stringify(context).slice(0, 8000)}\n\nReturn the JSON.` },
      ],
      temperature: 0.4,
      max_tokens: 2000,
    });

    const observations = Array.isArray(out?.observations) ? out.observations : [];
    const proposals = Array.isArray(out?.proposals) ? out.proposals : [];

    // Insert observations
    if (observations.length) {
      await supabase.from("agent_observations").insert(
        observations.map((o: any) => ({
          agent_id: agent.id,
          severity: o.severity || "info",
          metric: String(o.metric || "unknown").slice(0, 100),
          value: typeof o.value === "number" ? o.value : null,
          threshold: typeof o.threshold === "number" ? o.threshold : null,
          message: String(o.message || "").slice(0, 500),
        })),
      );
    }

    // Insert proposals + send to telegram (based on approval mode)
    for (const p of proposals) {
      const { data: prop } = await supabase.from("agent_proposals").insert({
        agent_id: agent.id,
        run_id: run!.id,
        kind: String(p.kind || agent.category).slice(0, 50),
        title: String(p.title || "Untitled proposal").slice(0, 200),
        rationale: String(p.rationale || "").slice(0, 1000),
        payload: p.payload || {},
        status: agent.approval_mode === "auto" ? "approved" : "pending",
      }).select().single();

      if (agent.approval_mode === "approval" && prop) {
        const text = `🤖 <b>${agent.name}</b>\n\n<b>${prop.title}</b>\n\n${prop.rationale || ""}`;
        await broadcastAdmins(text, [[
          { text: "✅ تنفيذ", callback_data: `approve:${prop.id}` },
          { text: "❌ رفض", callback_data: `reject:${prop.id}` },
        ]]);
      } else if (agent.approval_mode === "auto" && prop) {
        await executeProposal(prop);
      }
    }

    await supabase.from("agent_runs").update({
      status: "success", ended_at: new Date().toISOString(),
      output_summary: out?.summary || `${proposals.length} proposals, ${observations.length} observations`,
      proposals_count: proposals.length,
    }).eq("id", run!.id);
    await supabase.from("ai_agents").update({
      last_run_at: new Date().toISOString(),
      success_count: (agent.success_count ?? 0) + 1,
    }).eq("id", agent.id);

    return { runId: run!.id, proposals: proposals.length };
  } catch (e: any) {
    await supabase.from("agent_runs").update({
      status: "failed", ended_at: new Date().toISOString(),
      error: String(e?.message || e).slice(0, 500),
    }).eq("id", run!.id);
    await supabase.from("ai_agents").update({
      fail_count: (agent.fail_count ?? 0) + 1,
    }).eq("id", agent.id);
    return { runId: run!.id, proposals: 0, error: String(e?.message || e) };
  }
}

async function gatherContext(category: string): Promise<Record<string, unknown>> {
  const ctx: Record<string, unknown> = { category, ts: new Date().toISOString() };
  try {
    if (category === "revenue") {
      const [{ data: rev }, { count: subs }, { count: users }] = await Promise.all([
        supabase.from("revenue_ledger").select("gross_amount,tax_amount,net_amount,created_at").order("created_at", { ascending: false }).limit(100),
        supabase.from("subscriptions").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);
      ctx.recent_revenue = rev;
      ctx.subscriptions = subs;
      ctx.users = users;
    } else if (category === "monitoring") {
      const [{ data: errs }, { data: keyUsage }] = await Promise.all([
        supabase.from("admin_error_log").select("error_type,error_message,created_at").order("created_at", { ascending: false }).limit(50),
        supabase.from("key_usage_log").select("provider,success,latency_ms,created_at").order("created_at", { ascending: false }).limit(50),
      ]);
      ctx.recent_errors = errs;
      ctx.key_usage = keyUsage;
    } else if (category === "problem") {
      const { data: errs } = await supabase.from("admin_error_log").select("error_type,error_message,created_at").order("created_at", { ascending: false }).limit(30);
      ctx.recent_errors = errs;
    } else if (category === "marketing") {
      const { data: posts } = await supabase.from("blog_posts").select("slug,title,published_at,views").order("published_at", { ascending: false }).limit(20);
      ctx.recent_posts = posts;
    } else if (category === "content") {
      const { data: prompts } = await supabase.from("media_page_prompts").select("page,prompt,created_at").order("created_at", { ascending: false }).limit(20);
      ctx.recent_prompts = prompts;
    } else if (category === "users") {
      const { count: users } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      ctx.users = users;
    }
  } catch (e) {
    ctx.context_error = String(e);
  }
  return ctx;
}

async function executeProposal(prop: any): Promise<{ ok: boolean; result?: any; error?: string }> {
  try {
    const kind = String(prop.kind || "").toLowerCase();
    const payload = prop.payload || {};
    let result: any = { applied: false };

    if (kind === "marketing" && payload.action === "create_campaign") {
      const { data, error } = await supabase.from("marketing_campaigns").insert({
        name: payload.name || "AI-generated campaign",
        description: payload.description || "",
        status: "draft",
      }).select().single();
      if (error) throw error;
      result = { applied: true, id: data.id };
    } else if (kind === "content" && payload.action === "add_media_prompt") {
      const { data, error } = await supabase.from("media_page_prompts").insert({
        page: payload.page || "general",
        prompt: payload.prompt || "",
        is_active: true,
      }).select().single();
      if (error) throw error;
      result = { applied: true, id: data.id };
    } else if (kind === "revenue" && payload.action === "update_price" && payload.model_id) {
      const { error } = await supabase.from("model_pricing").update({
        price_per_unit: payload.new_price,
      }).eq("id", payload.model_id);
      if (error) throw error;
      result = { applied: true };
    } else {
      result = { applied: false, reason: "no executor for this kind/action; recorded as note" };
    }

    await supabase.from("agent_proposals").update({
      status: "executed",
      executed_at: new Date().toISOString(),
      result,
    }).eq("id", prop.id);

    return { ok: true, result };
  } catch (e: any) {
    await supabase.from("agent_proposals").update({
      status: "failed",
      executed_at: new Date().toISOString(),
      result: { error: String(e?.message || e) },
    }).eq("id", prop.id);
    return { ok: false, error: String(e?.message || e) };
  }
}

function slugify(s: string): string {
  return s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

async function runBlogWriter(agentId: string, customTitle?: string): Promise<{ summary: string; postId?: string }> {
  let topic: string;
  let keywords: string[] = [];

  if (customTitle && customTitle.trim().length > 0) {
    // Operator-supplied title — derive keywords from it, skip topic discovery.
    topic = customTitle.trim().slice(0, 200);
    try {
      const kwRes = await kimiJson<any>({
        messages: [{ role: "user", content: `Return JSON {"keywords":["k1",...8]} with 5-8 SEO keywords for an article titled "${topic}". JSON only.` }],
        temperature: 0.4, max_tokens: 200,
      });
      keywords = Array.isArray(kwRes?.keywords) ? kwRes.keywords.slice(0, 8) : [];
    } catch { /* keywords optional */ }
  } else {
    // AI-chosen topic
    const topicPrompt = `Choose ONE specific SEO-friendly blog topic for an AI tools platform (image generation, video AI, prompt engineering, AI workflows for creators). The topic must target high-intent Google search queries with commercial or informational value. Return JSON: {"topic":"...","keywords":["k1","k2","k3"]}`;
    const topicRes = await kimiJson<any>({
      messages: [{ role: "user", content: topicPrompt }],
      temperature: 0.95, max_tokens: 250,
    });
    topic = String(topicRes?.topic || "AI image generation guide");
    keywords = Array.isArray(topicRes?.keywords) ? topicRes.keywords.slice(0, 8) : [];
  }

  const writePrompt = `Write an in-depth, definitive 2200-3000 word SEO blog post about: "${topic}".

Strict structure (Markdown only, no code fences):
# Title (catchy, contains main keyword, under 65 chars)

(2 paragraph engaging intro that hooks the reader and previews value)

## 5-8 H2 sections with rich detail, examples, and specifics
- Use bullet lists, numbered steps, and short paragraphs
- Include at least one comparison table (Markdown table syntax)
- Include a "Practical workflow" or "Step-by-step" section
- Include a "Common mistakes" section
- Include an "FAQ" H2 with 5-7 Question/Answer pairs as ### Q + paragraph A

## Conclusion with a soft CTA to try Megsy AI (megsyai.com).

Keywords to weave naturally (do NOT stuff): ${keywords.join(", ")}.
Tone: senior expert, practical, opinionated, zero fluff. Aim for E-E-A-T signals (experience, examples, concrete numbers). No filler phrases like "in today's fast-paced world".`;

  const contentMd = await kimiChat({
    messages: [
      { role: "system", content: "You are a senior SEO content writer producing E-E-A-T compliant long-form articles that rank #1 on Google. You write with authority, cite concrete examples, and never produce filler." },
      { role: "user", content: writePrompt },
    ],
    temperature: 0.75, max_tokens: 6000,
  });

  // Extract title from first # line
  const titleMatch = contentMd.match(/^#\s+(.+)$/m);
  const title = (titleMatch?.[1] || topic).slice(0, 200);
  const slug = `${slugify(title)}-${Date.now().toString(36)}`;
  const wordCount = contentMd.split(/\s+/).length;
  const readingMinutes = Math.max(2, Math.round(wordCount / 220));


  // Generate meta description
  const metaRes = await kimiChat({
    messages: [{ role: "user", content: `Write a single compelling SEO meta description (max 155 chars) for an article titled "${title}". Return only the description text.` }],
    temperature: 0.5, max_tokens: 80,
  }).catch(() => "");
  const metaDescription = String(metaRes).replace(/^["']|["']$/g, "").slice(0, 160);

  // Generate hero image via Lovable AI Image
  let heroUrl: string | null = null;
  try {
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (lovableKey) {
      const imgRes = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${lovableKey}` },
        body: JSON.stringify({
          model: "google/gemini-3-flash-image-preview",
          prompt: `Editorial hero image for blog: "${title}". Modern, clean, abstract, dark theme.`,
          size: "1536x1024",
        }),
      });
      if (imgRes.ok) {
        const j: any = await imgRes.json();
        const b64 = j?.data?.[0]?.b64_json;
        const url = j?.data?.[0]?.url;
        if (url) {
          heroUrl = url;
        } else if (b64) {
          // Upload to storage
          const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
          const path = `blog/${slug}.png`;
          const { error: upErr } = await supabase.storage.from("media-studio").upload(path, bytes, { contentType: "image/png", upsert: true });
          if (!upErr) {
            const { data: pub } = supabase.storage.from("media-studio").getPublicUrl(path);
            heroUrl = pub?.publicUrl ?? null;
          }
        }
      }
    }
  } catch (e) {
    console.error("blog hero image failed:", e);
  }

  const { data: post, error } = await supabase.from("blog_posts").insert({
    slug,
    title,
    meta_description: metaDescription || title.slice(0, 155),
    content_md: contentMd,
    hero_image_url: heroUrl,
    keywords,
    category: "AI Guides",
    status: "published",
    published_at: new Date().toISOString(),
    reading_minutes: readingMinutes,
    ai_agent_id: agentId,
    author_name: "Megsy AI Editorial",
  }).select().single();

  if (error) throw new Error(`blog insert failed: ${error.message}`);

  return { summary: `Published "${title}" (${wordCount} words)`, postId: post.id };
}

function cronIntervalMinutes(expr: string | null | undefined): number {
  // Rough mapping of cron to minimum interval in minutes.
  if (!expr) return 60 * 24;
  const s = expr.trim();
  if (s === "* * * * *") return 1;
  const m = s.match(/^\*\/(\d+)\s+\*\s+\*\s+\*\s+\*$/);
  if (m) return Math.max(1, parseInt(m[1]));
  if (/^0\s+\*\s+\*\s+\*\s+\*$/.test(s)) return 60;
  const h = s.match(/^0\s+\*\/(\d+)\s+\*\s+\*\s+\*$/);
  if (h) return 60 * Math.max(1, parseInt(h[1]));
  if (/^0\s+\d+\s+\*\s+\*\s+\*$/.test(s)) return 60 * 24; // daily
  if (/^0\s+\d+\s+\*\s+\*\s+\d+$/.test(s)) return 60 * 24 * 7; // weekly
  return 60;
}

async function cronTick(): Promise<{ ran: string[]; skipped: number }> {
  const { data: agents } = await supabase
    .from("ai_agents")
    .select("slug, cron_schedule, last_run_at, enabled, approval_mode")
    .eq("enabled", true)
    .not("cron_schedule", "is", null)
    .limit(200);
  const ran: string[] = [];
  let skipped = 0;
  const now = Date.now();
  const due = (agents || []).filter((a: any) => {
    const interval = cronIntervalMinutes(a.cron_schedule) * 60 * 1000;
    const last = a.last_run_at ? new Date(a.last_run_at).getTime() : 0;
    return now - last >= interval;
  });
  // Cap to 5 per tick to avoid timeouts
  const batch = due.slice(0, 5);
  skipped = due.length - batch.length;
  for (const a of batch) {
    try {
      await runAgent(a.slug, "cron");
      ran.push(a.slug);
    } catch (e) {
      console.error("cron run failed", a.slug, e);
    }
  }
  return { ran, skipped };
}

// ============ END AGENT RUNTIME ============

async function isAdmin(chatId: number): Promise<boolean> {
  // bootstrap: if no admins yet, allow first /addadmin
  const { data, error } = await supabase
    .from("bot_admins")
    .select("id")
    .eq("telegram_chat_id", chatId)
    .maybeSingle();
  if (error) return false;
  return !!data;
}

async function adminCount(): Promise<number> {
  const { count } = await supabase.from("bot_admins").select("*", { count: "exact", head: true });
  return count ?? 0;
}

async function handleCommand(chatId: number, text: string) {
  const t = text.trim();
  const [rawCmd, ...rest] = t.split(/\s+/);
  // Strip "@botusername" suffix that Telegram appends in group chats
  // (e.g. "/addkey@MegsyTasksBot" -> "/addkey"). Without this every
  // strict `cmd === "/foo"` check below would silently fall through.
  const cmd = rawCmd.includes("@") ? rawCmd.split("@")[0] : rawCmd;
  const args = rest.join(" ");

  // bootstrap admin: anyone can claim if no admins exist
  if (cmd === "/start") {
    const admin = await isAdmin(chatId);
    if (admin) {
      return tgSendKeyboard(
        chatId,
        "👋 <b>أهلاً بك في لوحة تحكم Megsy AI</b>\nاختر من القائمة بالأسفل — كل شيء بضغطة زر.",
        mainMenu(),
      );
    }
    const count = await adminCount();
    if (count === 0) {
      await supabase.from("bot_admins").insert({ telegram_chat_id: chatId, added_by: chatId });
      return tgSendKeyboard(
        chatId,
        "🎉 تم تعيينك كأول <b>مشرف</b>!\nهذه هي لوحة التحكم:",
        mainMenu(),
      );
    }
    return tgSend(chatId, `Your chat_id: <code>${chatId}</code>. Ask an admin to add you.`);
  }

  if (cmd === "/menu") {
    if (!(await isAdmin(chatId))) return tgSend(chatId, "⛔ Not authorized.");
    return tgSendKeyboard(chatId, "📱 <b>لوحة التحكم</b>", mainMenu());
  }

  if (cmd === "/help") {
    return tgSend(
      chatId,
      `<b>Commands</b>\n` +
        `/list — list tasks\n` +
        `/add &lt;key&gt;|&lt;title&gt;|&lt;reward&gt;|&lt;type&gt;|&lt;url&gt;|&lt;target&gt;\n` +
        `/edit &lt;key&gt;|&lt;field&gt;=&lt;value&gt;\n` +
        `/toggle &lt;key&gt;\n` +
        `/delete &lt;key&gt;\n` +
        `/addadmin &lt;chat_id&gt;\n\n` +
        `<b>API Keys</b>\n` +
        `/keys — list providers\n` +
        `/addkey ali|ws|manus &lt;api_key&gt; [label]\n` +
        `/listkeys ali|ws|manus\n` +
        `/blockkey &lt;id&gt;\n` +
        `/unblockkey &lt;id&gt;\n` +
        `/delkey &lt;id&gt;\n` +
        `/setquota &lt;key_id&gt; &lt;model_id&gt; &lt;total&gt;\n` +
        `/stats — usage & revenue summary\n\n` +
        `<b>🤖 AI Agents</b>\n` +
        `/agents — list all agents\n` +
        `/run &lt;slug&gt; — run an agent now\n` +
        `/proposals — pending proposals\n` +
        `/incidents — open incidents\n` +
        `/blog new — generate a new blog post\n\n` +
        `Types: follow_x, follow_instagram, follow_facebook, follow_linkedin, follow_tiktok, follow_youtube, join_telegram, invite_friends, custom`,
    );
  }

  if (!(await isAdmin(chatId))) {
    return tgSend(chatId, "⛔ Not authorized. Your chat_id: " + chatId);
  }

  if (cmd === "/list") {
    const { data } = await supabase
      .from("reward_tasks")
      .select("task_key,title,reward_credits,action_type,active,target_count")
      .order("sort_order");
    if (!data?.length) return tgSend(chatId, "No tasks.");
    const lines = data.map(
      (t) =>
        `${t.active ? "🟢" : "⚪️"} <b>${t.task_key}</b> — ${t.title}\n   ${t.reward_credits}c · ${t.action_type} · target ${t.target_count}`,
    );
    return tgSend(chatId, lines.join("\n\n"));
  }

  if (cmd === "/add") {
    const parts = args.split("|").map((s) => s.trim());
    if (parts.length < 4) return tgSend(chatId, "Usage: /add key|title|reward|type|url|target");
    const [key, title, reward, type, url, target] = parts;
    const { error } = await supabase.from("reward_tasks").insert({
      task_key: key,
      title,
      reward_credits: Number(reward) || 0,
      action_type: type,
      action_url: url || null,
      target_count: Number(target) || 1,
    });
    if (error) return tgSend(chatId, "❌ " + error.message);
    return tgSend(chatId, `✅ Added <b>${key}</b>`);
  }

  if (cmd === "/edit") {
    const [key, kv] = args.split("|").map((s) => s.trim());
    if (!key || !kv?.includes("=")) return tgSend(chatId, "Usage: /edit key|field=value");
    const [field, ...rest2] = kv.split("=");
    const value = rest2.join("=").trim();
    const allowed = ["title", "description", "reward_credits", "action_type", "action_url", "target_count", "icon", "sort_order"];
    if (!allowed.includes(field)) return tgSend(chatId, "Invalid field. Allowed: " + allowed.join(", "));
    const patch: Record<string, unknown> = {};
    patch[field] = ["reward_credits", "target_count", "sort_order"].includes(field) ? Number(value) : value;
    const { error } = await supabase.from("reward_tasks").update(patch).eq("task_key", key);
    if (error) return tgSend(chatId, "❌ " + error.message);
    return tgSend(chatId, `✅ Updated ${key}.${field}`);
  }

  if (cmd === "/toggle") {
    const key = args.trim();
    const { data } = await supabase.from("reward_tasks").select("active").eq("task_key", key).maybeSingle();
    if (!data) return tgSend(chatId, "Not found");
    const { error } = await supabase.from("reward_tasks").update({ active: !data.active }).eq("task_key", key);
    if (error) return tgSend(chatId, "❌ " + error.message);
    return tgSend(chatId, `✅ ${key} is now ${!data.active ? "active" : "inactive"}`);
  }

  if (cmd === "/delete") {
    const key = args.trim();
    const { error } = await supabase.from("reward_tasks").delete().eq("task_key", key);
    if (error) return tgSend(chatId, "❌ " + error.message);
    return tgSend(chatId, `🗑️ Deleted ${key}`);
  }

  if (cmd === "/addadmin") {
    const id = Number(args.trim());
    if (!id) return tgSend(chatId, "Usage: /addadmin <chat_id>");
    const { error } = await supabase.from("bot_admins").insert({ telegram_chat_id: id, added_by: chatId });
    if (error) return tgSend(chatId, "❌ " + error.message);
    return tgSend(chatId, `✅ Added admin ${id}`);
  }

  // ---------- API Keys management ----------
  const providerMap: Record<string, { table: string; label: string }> = {
    ali: { table: "alibaba_keys", label: "Alibaba" },
    alibaba: { table: "alibaba_keys", label: "Alibaba" },
    ws: { table: "wavespeed_keys", label: "WaveSpeed" },
    wave: { table: "wavespeed_keys", label: "WaveSpeed" },
    wavespeed: { table: "wavespeed_keys", label: "WaveSpeed" },
    manus: { table: "manus_keys", label: "Manus" },
    rb: { table: "runbase_keys", label: "Runbase" },
    runbase: { table: "runbase_keys", label: "Runbase" },
  };

  if (cmd === "/keys") {
    return tgSend(
      chatId,
      `<b>Providers</b>\n• ali — Alibaba (per-model quota)\n• rb — Runbase (image + video)\n• manus — Manus API\n\nUse /addkey, /listkeys, /blockkey, /unblockkey, /delkey, /setquota`,
    );
  }

  if (cmd === "/addkey" || cmd === "/addapikey" || cmd === "/newkey") {
    const parts = args.trim().split(/\s+/).filter(Boolean);
    // Zero args → open the button wizard (same flow as the menu)
    if (parts.length === 0) {
      return tgSendKeyboard(chatId, "➕ <b>اختر نوع المفتاح</b>", [
        [{ text: "Alibaba", callback_data: "m:keys_add_ali" }],
        [{ text: "Runbase", callback_data: "m:keys_add_rb" }],
        [{ text: "Manus", callback_data: "m:keys_add_manus" }],
      ]);
    }
    // One arg → treat as provider, ask for the key in next message
    if (parts.length === 1) {
      const prov0 = providerMap[parts[0].toLowerCase()];
      if (!prov0) return tgSend(chatId, "❌ مزوّد غير معروف. استخدم ali|ws|rb|manus");
      const lower = parts[0].toLowerCase();
      const slug = lower.startsWith("ali") ? "ali"
        : lower.startsWith("w") ? "ws"
        : lower === "rb" || lower.startsWith("run") ? "rb"
        : "manus";
      await setPendingAction(chatId, "add_key", { provider: slug });
      return tgSend(chatId, `📩 ابعت دلوقتي مفتاح <b>${prov0.label}</b> في رساله واحده.\nلو عايز تلغي اكتب /cancel`);
    }
    const prov = providerMap[(parts[0] || "").toLowerCase()];
    const key = (parts[1] || "").trim();
    const label = parts.slice(2).join(" ") || `tg-${Date.now()}`;
    if (!prov || !key) return tgSend(chatId, "Usage: /addkey ali|ws|rb|manus <api_key> [label]");
    if (key.length < 10) return tgSend(chatId, "❌ المفتاح قصير جداً — تأكد إنك لصقت المفتاح كامل.");

    // 1) write to the provider-specific table (legacy / rotation pool)
    const { data, error } = await supabase
      .from(prov.table)
      .insert({ api_key: key, label })
      .select("id")
      .single();
    if (error) {
      const msg = String(error.message || "");
      if (msg.toLowerCase().includes("duplicate")) {
        return tgSend(chatId, "⚠️ المفتاح ده موجود بالفعل في النظام.");
      }
      return tgSend(chatId, "❌ فشل الحفظ: " + msg);
    }

    // 2) For Alibaba keys, ALSO register them in media_provider_keys —
    //    that's the table the video/image pipeline actually reads from.
    if (prov.table === "alibaba_keys") {
      const { error: mpkErr } = await supabase
        .from("media_provider_keys")
        .insert({
          provider: "alibaba",
          api_key: key,
          label: `tg:${chatId}:${label}`,
          status: "active",
        });
      if (mpkErr && !String(mpkErr.message || "").toLowerCase().includes("duplicate")) {
        return tgSend(
          chatId,
          `⚠️ اتسجّل في <code>${prov.table}</code> لكن فشل في <code>media_provider_keys</code>: ${mpkErr.message}`,
        );
      }
      return tgSend(
        chatId,
        `✅ تم إضافة مفتاح <b>${prov.label}</b> <code>${data.id}</code>\nالحالة: مفعّل وجاهز للتوليد ✨`,
      );
    }
    return tgSend(chatId, `✅ Added <b>${prov.label}</b> key <code>${data.id}</code>`);
  }

  if (cmd === "/listkeys") {
    const prov = providerMap[(args.trim() || "").toLowerCase()];
    if (!prov) return tgSend(chatId, "Usage: /listkeys ali|ws|rb|manus");
    const cols = prov.table === "wavespeed_keys"
      ? "id,label,status,balance_usd,spent_usd,failure_count,last_used_at"
      : prov.table === "runbase_keys"
      ? "id,label,status,balance_usd,spent_usd,failure_count,last_used_at"
      : "id,label,status,failure_count,last_used_at";
    const { data, error } = await supabase.from(prov.table).select(cols).order("created_at", { ascending: false }).limit(20);
    if (error) return tgSend(chatId, "❌ " + error.message);
    if (!data?.length) return tgSend(chatId, "No keys.");
    const lines = data.map((k: any) => {
      const icon = k.status === "active" ? "🟢" : "🔴";
      const extra = (prov.table === "wavespeed_keys" || prov.table === "runbase_keys")
        ? ` · $${k.balance_usd} (spent $${k.spent_usd})`
        : "";
      return `${icon} <code>${k.id}</code> ${k.label || ""} · fails ${k.failure_count}${extra}`;
    });
    return tgSend(chatId, `<b>${prov.label} keys</b>\n${lines.join("\n")}`);
  }

  if (cmd === "/blockkey" || cmd === "/unblockkey") {
    const id = args.trim();
    if (!id) return tgSend(chatId, `Usage: ${cmd} <key_id>`);
    const status = cmd === "/blockkey" ? "blocked" : "active";
    // try all three tables
    for (const t of ["alibaba_keys", "wavespeed_keys", "runbase_keys", "manus_keys"]) {
      const { data } = await supabase.from(t).update({ status, failure_count: status === "active" ? 0 : undefined }).eq("id", id).select("id").maybeSingle();
      if (data) return tgSend(chatId, `✅ ${status} key ${id} in ${t}`);
    }
    return tgSend(chatId, "Key not found.");
  }

  if (cmd === "/delkey") {
    const id = args.trim();
    if (!id) return tgSend(chatId, "Usage: /delkey <key_id>");
    for (const t of ["alibaba_keys", "wavespeed_keys", "runbase_keys", "manus_keys"]) {
      const { data } = await supabase.from(t).delete().eq("id", id).select("id").maybeSingle();
      if (data) return tgSend(chatId, `🗑️ Deleted from ${t}`);
    }
    return tgSend(chatId, "Key not found.");
  }

  if (cmd === "/setquota") {
    const [keyId, modelId, total] = args.trim().split(/\s+/);
    if (!keyId || !modelId || !total) return tgSend(chatId, "Usage: /setquota <key_id> <model_id> <total>");
    const { error } = await supabase.from("alibaba_key_model_quota").upsert(
      { key_id: keyId, model_id: modelId, quota_total: Number(total) || 0 },
      { onConflict: "key_id,model_id" },
    );
    if (error) return tgSend(chatId, "❌ " + error.message);
    return tgSend(chatId, `✅ Quota ${modelId} → ${total} on ${keyId}`);
  }

  if (cmd === "/stats") {
    const [{ count: users }, { count: subs }, rev] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("subscriptions").select("*", { count: "exact", head: true }),
      supabase.from("revenue_ledger").select("gross_amount,tax_amount,net_amount"),
    ]);
    const gross = (rev.data || []).reduce((a: number, r: any) => a + Number(r.gross_amount || 0), 0);
    const tax = (rev.data || []).reduce((a: number, r: any) => a + Number(r.tax_amount || 0), 0);
    const net = (rev.data || []).reduce((a: number, r: any) => a + Number(r.net_amount || 0), 0);
    return tgSend(
      chatId,
      `<b>📊 Stats</b>\nUsers: ${users ?? 0}\nSubscriptions: ${subs ?? 0}\n\n<b>💰 Revenue</b>\nGross: $${gross.toFixed(2)}\nTax (22%): $${tax.toFixed(2)}\nNet: $${net.toFixed(2)}`,
    );
  }

  if (cmd === "/agents") {
    const { data } = await supabase.from("ai_agents").select("slug,name,category,enabled,success_count,fail_count").order("category").order("name");
    if (!data?.length) return tgSend(chatId, "No agents.");
    const byCat: Record<string, string[]> = {};
    for (const a of data) {
      const k = String(a.category);
      (byCat[k] ||= []).push(`${a.enabled ? "✅" : "⏸"} <code>${a.slug}</code> — ${a.name} (${a.success_count}✓/${a.fail_count}✗)`);
    }
    const text = Object.entries(byCat).map(([cat, lines]) => `<b>${cat.toUpperCase()}</b>\n${lines.join("\n")}`).join("\n\n");
    return tgSend(chatId, text.slice(0, 4000));
  }

  if (cmd === "/run") {
    const slug = args.trim();
    if (!slug) return tgSend(chatId, "Usage: /run &lt;agent-slug&gt;");
    await tgSend(chatId, `▶️ Running <code>${slug}</code>...`);
    const r = await runAgent(slug, "telegram");
    if (r.error) return tgSend(chatId, `❌ ${r.error}`);
    return tgSend(chatId, `✅ Done. ${r.proposals} proposal(s) created. run=${r.runId.slice(0, 8)}`);
  }

  if (cmd === "/proposals") {
    const { data } = await supabase.from("agent_proposals").select("id,title,kind,status,created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(20);
    if (!data?.length) return tgSend(chatId, "No pending proposals.");
    const text = data.map((p: any) => `• [${p.kind}] ${p.title}\n  <code>${p.id.slice(0, 8)}</code>`).join("\n\n");
    return tgSend(chatId, `<b>📋 Pending Proposals</b>\n\n${text}`);
  }

  if (cmd === "/incidents") {
    const { data } = await supabase.from("agent_incidents").select("id,title,severity,status,opened_at").eq("status", "open").order("opened_at", { ascending: false }).limit(20);
    if (!data?.length) return tgSend(chatId, "✅ No open incidents.");
    const text = data.map((i: any) => `${i.severity === "critical" ? "🔴" : i.severity === "error" ? "🟠" : "🟡"} ${i.title}`).join("\n");
    return tgSend(chatId, `<b>🚨 Open Incidents</b>\n\n${text}`);
  }

  if (cmd === "/blog" && args.trim().startsWith("new")) {
    if (!(await isAdmin(chatId))) return tgSend(chatId, "⛔ Not authorized.");
    const customTitle = args.replace(/^new\s*/i, "").trim();
    await tgSend(chatId, customTitle
      ? `📝 Generating blog post for: "<i>${customTitle.slice(0, 120)}</i>"...`
      : "📝 Generating fresh AI-chosen blog post...");
    const { data: agent } = await supabase.from("ai_agents").select("id").eq("slug", "blog-writer").maybeSingle();
    if (!agent) return tgSend(chatId, "❌ blog-writer agent not configured");
    const { data: run } = await supabase.from("agent_runs").insert({ agent_id: agent.id, status: "running", trigger: "telegram" }).select().single();
    try {
      const result = await runBlogWriter(agent.id, customTitle || undefined);
      await supabase.from("agent_runs").update({ status: "success", ended_at: new Date().toISOString(), output_summary: result.summary }).eq("id", run!.id);
      const slug = result.postId ? (await supabase.from("blog_posts").select("slug").eq("id", result.postId).maybeSingle()).data?.slug : null;
      const url = slug ? `\n🔗 https://megsyai.com/blog/${slug}` : "";
      return tgSend(chatId, `✅ ${result.summary}${url}`);
    } catch (e: any) {
      await supabase.from("agent_runs").update({ status: "failed", ended_at: new Date().toISOString(), error: String(e?.message || e).slice(0, 500) }).eq("id", run!.id);
      return tgSend(chatId, `❌ ${String(e?.message || e).slice(0, 300)}`);
    }
  }

  // Enqueue a topic for the daily multilingual publisher.
  // Usage: /topic <topic text> | <optional angle>
  if (cmd === "/topic") {
    if (!(await isAdmin(chatId))) return tgSend(chatId, "⛔ Not authorized.");
    const raw = args.trim();
    if (!raw) return tgSend(chatId, "Usage: /topic <topic> [| angle]");
    const [topic, angle] = raw.split("|").map((s) => s.trim());
    const { error } = await supabase.from("blog_topic_queue").insert({
      topic, angle: angle || null, source: "telegram", requested_by: String(chatId), priority: 5,
    });
    if (error) return tgSend(chatId, `❌ ${error.message}`);
    return tgSend(chatId, `✅ Queued: <i>${topic.slice(0, 160)}</i>\nNext daily run will publish it in EN + 24 languages.`);
  }

  // Manually trigger the multilingual daily publisher (uses queue + AI fallback topics).
  if (cmd === "/publishnow") {
    if (!(await isAdmin(chatId))) return tgSend(chatId, "⛔ Not authorized.");
    await tgSend(chatId, "🚀 Triggering daily multilingual publisher...");
    try {
      const r = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/blog-daily-publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": Deno.env.get("SUPABASE_ANON_KEY")!,
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")!}`,
        },
        body: JSON.stringify({ trigger: "telegram" }),
      });
      const data = await r.json();
      const summary = (data?.results || []).map((x: any) =>
        x.ok ? `✅ ${x.slug} (+${x.translated || 0} langs)` : `❌ ${x.topic}: ${x.error || x.step}`
      ).join("\n");
      return tgSend(chatId, `<b>Publisher done</b>\nPicked: ${data?.picked || 0}\n${summary || "(no results)"}`);
    } catch (e: any) {
      return tgSend(chatId, `❌ ${String(e?.message || e).slice(0, 300)}`);
    }
  }

  // Manually grant a 1-month Pro subscription to an influencer by email.
  // Usage: /grantpro influencer@example.com
  if (cmd === "/grantpro" || cmd === "/grant_pro" || cmd === "/influencer") {
    if (!(await isAdmin(chatId))) return tgSend(chatId, "⛔ Not authorized.");
    const email = args.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return tgSend(chatId, "Usage: <code>/grantpro &lt;email&gt;</code>");
    }
    const { data, error } = await supabase.rpc("admin_grant_pro_monthly", { target_email: email });
    if (error) return tgSend(chatId, "❌ " + (error.message || String(error)));
    if (data && (data as any).ok) {
      const periodEnd = new Date((data as any).period_end).toISOString().slice(0, 10);
      const extended = (data as any).extended === true;
      await supabase.from("admin_notifications").insert({
        type: "influencer_grant",
        payload: { email, period_end: (data as any).period_end, extended, granted_by: chatId },
      });
      return tgSend(
        chatId,
        `${extended ? "🔁 تم <b>تمديد</b>" : "✅ تم <b>تفعيل</b>"} <b>Pro</b> للمؤثر <code>${email}</code> ` +
        `(+30 يوم، ينتهي <b>${periodEnd}</b>) — بدون تجديد تلقائي.`,
      );
    }
    const code = (data as any)?.error || "unknown";
    return tgSend(
      chatId,
      code === "user_not_found"
        ? `❌ الإيميل <code>${email}</code> مش مسجّل بالموقع.`
        : code === "invalid_email"
        ? `❌ صيغة الإيميل غلط: <code>${email}</code>.`
        : `❌ تعذّر منح الاشتراك (${code}).`,
    );
  }

  return tgSend(chatId, "Unknown command. /help");
}

export async function handleTasksBotRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const update = await req.json();

    // Internal action router (called from frontend / other edge functions / webhooks).
    // Keeps us under the function-count limit by reusing this function instead of
    // creating dedicated admin-notify / admin-stats endpoints.
    if (update && typeof update.action === "string") {
      // `cron_tick` is idempotent and safe to expose — it only runs scheduled
      // agents whose interval has elapsed. Everything else requires the
      // shared secret because it can expose stats/revenue or trigger arbitrary
      // agents.
      if (update.action !== "cron_tick") {
        const expected = Deno.env.get("INTERNAL_ACTIONS_SECRET") ?? "";
        const provided =
          req.headers.get("x-internal-secret") ??
          req.headers.get("X-Internal-Secret") ??
          "";
        if (!expected || provided !== expected) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      const action = update.action as string;

      const broadcast = async (text: string) => {
        const { data: admins } = await supabase.from("bot_admins").select("telegram_chat_id");
        await Promise.all((admins || []).map((a: any) => tgSend(Number(a.telegram_chat_id), text)));
      };

      if (action === "notify_admins") {
        const text = String(update.message ?? "(empty notification)");
        const type = String(update.type ?? "manual");
        await supabase.from("admin_notifications").insert({ type, payload: { message: text, ...(update.payload || {}) } });
        await broadcast(text);
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "new_subscription") {
        const email = String(update.user_email ?? "unknown");
        const amount = Number(update.amount ?? 0);
        const currency = String(update.currency ?? "USD");
        const taxRate = Number(update.tax_rate ?? 0.22);
        const taxAmount = +(amount * taxRate).toFixed(2);
        const netAmount = +(amount - taxAmount).toFixed(2);
        await supabase.from("revenue_ledger").insert({
          subscription_id: update.subscription_id ?? null,
          user_id: update.user_id ?? null,
          gross_amount: amount,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          net_amount: netAmount,
          currency,
          source: update.source ?? "subscription",
          metadata: update.metadata ?? {},
        });
        await supabase.from("admin_notifications").insert({
          type: "new_subscription",
          payload: { email, amount, currency, net: netAmount },
        });
        await broadcast(
          `🎉 <b>اشتراك جديد</b>\nالمستخدم: ${email}\nالمبلغ: ${amount} ${currency}\nالضريبة (22%): ${taxAmount}\nالصافي: ${netAmount}`,
        );
        return new Response(JSON.stringify({ ok: true, net: netAmount }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "admin_stats") {
        const [{ count: users }, { count: subs }, rev] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("subscriptions").select("*", { count: "exact", head: true }),
          supabase.from("revenue_ledger").select("gross_amount,tax_amount,net_amount"),
        ]);
        const gross = (rev.data || []).reduce((a: number, r: any) => a + Number(r.gross_amount || 0), 0);
        const tax = (rev.data || []).reduce((a: number, r: any) => a + Number(r.tax_amount || 0), 0);
        const net = (rev.data || []).reduce((a: number, r: any) => a + Number(r.net_amount || 0), 0);
        return new Response(
          JSON.stringify({ users: users ?? 0, subscriptions: subs ?? 0, gross, tax, net }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (action === "run_agent") {
        const slug = String(update.slug || "");
        const r = await runAgent(slug, String(update.trigger || "api"));
        return new Response(JSON.stringify(r), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Set / verify / delete the Telegram webhook.
      // Body: { action: "setup_webhook", url?: string }
      if (action === "setup_webhook") {
        if (!TG_TOKEN) {
          return new Response(JSON.stringify({ error: "TELEGRAM_BOT_TOKEN missing" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const projectRef = (SUPABASE_URL.match(/^https?:\/\/([^.]+)\./) || [])[1];
        const target =
          String(update.url || "") ||
          `https://${projectRef}.functions.supabase.co/telegram-tasks-bot`;
        const setRes = await fetch(
          `https://api.telegram.org/bot${TG_TOKEN}/setWebhook`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: target,
              allowed_updates: ["message", "edited_message", "callback_query"],
              drop_pending_updates: false,
            }),
          },
        );
        const setJson = await setRes.json().catch(() => ({}));
        const infoRes = await fetch(
          `https://api.telegram.org/bot${TG_TOKEN}/getWebhookInfo`,
        );
        const infoJson = await infoRes.json().catch(() => ({}));
        // Also (re)publish the slash-commands menu so they appear instantly.
        await setMyCommands();
        return new Response(
          JSON.stringify({ ok: setJson.ok === true, target, set: setJson, info: infoJson }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (action === "set_commands") {
        if (!TG_TOKEN) {
          return new Response(JSON.stringify({ error: "TELEGRAM_BOT_TOKEN missing" }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        await setMyCommands();
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "webhook_info") {
        if (!TG_TOKEN) {
          return new Response(JSON.stringify({ error: "TELEGRAM_BOT_TOKEN missing" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const r = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/getWebhookInfo`);
        const j = await r.json().catch(() => ({}));
        return new Response(JSON.stringify(j), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "cron_tick") {
        const r = await cronTick();
        return new Response(JSON.stringify(r), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "agent_decide") {
        const id = String(update.proposal_id || "");
        const decision = String(update.decision || "");
        const { data: prop } = await supabase.from("agent_proposals").select("*").eq("id", id).maybeSingle();
        if (!prop) return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (decision === "approve") {
          const r = await executeProposal(prop);
          return new Response(JSON.stringify(r), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        } else {
          await supabase.from("agent_proposals").update({ status: "rejected", executed_at: new Date().toISOString() }).eq("id", id);
          return new Response(JSON.stringify({ ok: true, status: "rejected" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      }

      return new Response(JSON.stringify({ error: "unknown_action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Telegram callback queries (inline button approvals)
    if (update?.callback_query) {
      const cq = update.callback_query;
      const chatId = cq.message?.chat?.id;
      const data = String(cq.data || "");
      await tgAnswerCallback(cq.id);
      if (!chatId || !(await isAdmin(chatId))) {
        await tgSend(chatId, "⛔ Not authorized.");
        return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // --- Menu callbacks (m:*) ---
      if (data.startsWith("m:")) {
        const key = data.slice(2);
        try {
          if (key === "main")        await tgSendKeyboard(chatId, "📱 <b>لوحة التحكم</b>", mainMenu());
          else if (key === "help")   await handleCommand(chatId, "/help");
          else if (key === "stats")  await handleCommand(chatId, "/stats");
          else if (key === "revenue")await handleCommand(chatId, "/stats");
          else if (key === "tasks")  await tgSendKeyboard(chatId, "🎯 <b>إدارة المهام</b>", tasksMenu());
          else if (key === "tasks_list")        await handleCommand(chatId, "/list");
          else if (key === "tasks_toggle_hint") await tgSend(chatId, "🟢 لتفعيل/تعطيل مهمة:\n<code>/toggle &lt;task_key&gt;</code>");
          else if (key === "tasks_add_hint")    await tgSend(chatId, "➕ <b>إضافة مهمة</b>\n<code>/add key|title|reward|type|url|target</code>\n\nمثال:\n<code>/add follow_x|تابعنا على X|50|follow_x|https://x.com/megsy|1</code>");
          else if (key === "tasks_del_hint")    await tgSend(chatId, "🗑️ لحذف مهمة:\n<code>/delete &lt;task_key&gt;</code>");
          else if (key === "agents") await tgSendKeyboard(chatId, "🤖 <b>الوكلاء</b>", agentsMenu());
          else if (key === "agents_list")       await handleCommand(chatId, "/agents");
          else if (key === "agents_run_hint")   await tgSend(chatId, "▶️ لتشغيل وكيل:\n<code>/run &lt;agent-slug&gt;</code>");
          else if (key === "proposals")         await handleCommand(chatId, "/proposals");
          else if (key === "incidents")         await handleCommand(chatId, "/incidents");
          else if (key === "blog_new")          await handleCommand(chatId, "/blog new");
          else if (key === "keys")   await tgSendKeyboard(chatId, "🔑 <b>مفاتيح API</b>", keysMenu());
          else if (key === "keys_ali")          await handleCommand(chatId, "/listkeys ali");
          else if (key === "keys_ws")           await handleCommand(chatId, "/listkeys ws");
          else if (key === "keys_rb")           await handleCommand(chatId, "/listkeys rb");
          else if (key === "keys_manus")        await handleCommand(chatId, "/listkeys manus");
          else if (key === "keys_add_hint")     await tgSend(chatId, "➕ <b>إضافة مفتاح</b>\n<code>/addkey ali|ws|rb|manus &lt;api_key&gt; [label]</code>");
          else if (key === "keys_add_ali" || key === "keys_add_ws" || key === "keys_add_rb" || key === "keys_add_manus") {
            const slug = key.replace("keys_add_", "");
            const label = slug === "ali" ? "Alibaba"
              : slug === "ws" ? "WaveSpeed"
              : slug === "rb" ? "Runbase"
              : "Manus";
            await setPendingAction(chatId, "add_key", { provider: slug });
            await tgSend(chatId, `📩 ابعت دلوقتي مفتاح <b>${label}</b> في رساله واحده.\nلو عايز تلغي اكتب /cancel`);
          }
          else if (key === "grant_pro") {
            await setPendingAction(chatId, "grant_pro", {});
            await tgSend(
              chatId,
              "🎁 <b>منح اشتراك Pro لمؤثر (شهر واحد)</b>\n\n" +
              "ابعت الإيميل المسجّل بحساب المؤثر دلوقتي في رساله واحده.\n" +
              "هيتم تفعيل خطة <b>Pro</b> لمدة <b>30 يوم فقط</b> ومش هتتجدد تلقائياً.\n\n" +
              "لو عايز تلغي اكتب /cancel"
            );
          }
          else await tgSend(chatId, "غير معروف.");
        } catch (e) {
          await tgSend(chatId, "❌ " + String(e));
        }
        return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // --- Proposal approve/reject (legacy approve:<id> / reject:<id>) ---
      const [action, propId] = data.split(":");
      const { data: prop } = await supabase.from("agent_proposals").select("*").eq("id", propId).maybeSingle();
      if (!prop) {
        await tgSend(chatId, "Proposal not found.");
      } else if (action === "approve") {
        const r = await executeProposal(prop);
        await tgSend(chatId, r.ok ? `✅ Executed: ${prop.title}` : `❌ Failed: ${r.error}`);
      } else if (action === "reject") {
        await supabase.from("agent_proposals").update({ status: "rejected", executed_at: new Date().toISOString(), decided_by: null }).eq("id", propId);
        await tgSend(chatId, `❌ Rejected: ${prop.title}`);
      }
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const msg = update.message ?? update.edited_message;
    const chatId = msg?.chat?.id;
    const text = msg?.text;
    if (chatId && typeof text === "string") {
      const trimmed = text.trim();
      // /cancel always clears any pending wizard
      if (trimmed === "/cancel" || trimmed === "/الغاء" || trimmed === "/إلغاء") {
        await clearPendingAction(chatId);
        await tgSend(chatId, "✅ تم الإلغاء.");
      } else if (!trimmed.startsWith("/") && await isAdmin(chatId)) {
        // Fulfill pending wizards (e.g. "send me the key")
        const pending = await getPendingAction(chatId);
        if (pending?.action === "add_key" && pending.payload?.provider) {
          const res = await insertProviderKey(chatId, pending.payload.provider, trimmed);
          await clearPendingAction(chatId);
          await tgSend(chatId, res.message);
        } else if (pending?.action === "grant_pro") {
          await clearPendingAction(chatId);
          const email = trimmed.toLowerCase();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            await tgSend(chatId, "❌ إيميل غير صالح. حاول تاني من زر «🎁 منح Pro لمؤثر».");
          } else {
            const { data, error } = await supabase.rpc("admin_grant_pro_monthly", { target_email: email });
            if (error) {
              await tgSend(chatId, "❌ فشل المنح: " + (error.message || String(error)));
            } else if (data && (data as any).ok) {
              const periodEnd = new Date((data as any).period_end).toISOString().slice(0, 10);
              const extended = (data as any).extended === true;
              await tgSend(
                chatId,
                `${extended ? "🔁 تم <b>تمديد</b>" : "✅ تم <b>تفعيل</b>"} اشتراك <b>Pro</b> للمؤثر <code>${email}</code>\n` +
                `⏳ المدة: <b>+30 يوم</b> (ينتهي يوم <b>${periodEnd}</b>)\n` +
                `🚫 بدون تجديد تلقائي — هدية يدوية لمرة واحدة.`,
              );
              await supabase.from("admin_notifications").insert({
                type: "influencer_grant",
                payload: { email, period_end: (data as any).period_end, extended, granted_by: chatId },
              });
            } else {
              const code = (data as any)?.error || "unknown";
              const detail = (data as any)?.detail ? `\n<code>${(data as any).detail}</code>` : "";
              const human =
                code === "user_not_found"
                  ? `❌ الإيميل <code>${email}</code> مش مسجّل بالموقع.\n• تأكد إنه مكتوب صح.\n• المؤثر لازم يعمل حساب الأول على Megsy، وبعدين ابعتلي الإيميل اللي سجّل بيه.`
                  : code === "invalid_email"
                  ? `❌ الإيميل اللي بعتّه شكله مش صح: <code>${email}</code>.`
                  : code === "exception"
                  ? `❌ خطأ داخلي في قاعدة البيانات.${detail}`
                  : `❌ تعذّر منح الاشتراك (${code}).${detail}`;
              await tgSend(chatId, human);
            }
          }
        } else {
          await handleCommand(chatId, text);
        }
      } else {
        await handleCommand(chatId, text);
      }
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

/** @doc Extracts durable long-term memory facts from the latest chat turn
 *  and persists them into `user_memory_entries`. Called fire-and-forget from
 *  the client after every assistant reply. Silent on failure — never blocks
 *  chat. Uses qwen-turbo (cheapest tier) for JSON extraction.
 *
 *  Input body:
 *    { user_message: string, assistant_reply: string,
 *      conversation_id?: string, message_id?: string }
 *
 *  Auth: requires Bearer of the end user's Supabase JWT (chat client already
 *  attaches it via supabase.functions.invoke). Anonymous callers are ignored.
 *
 *  Extraction rules — capture ONLY durable, high-signal facts:
 *    • name / nickname / how to be called
 *    • profession, role, company, city
 *    • ongoing projects, goals, deadlines
 *    • persistent preferences (language, tone, tools, dietary, hobbies)
 *    • important dates (birthday, anniversaries)
 *  DROP: greetings, one-off questions, model output, transient state.
 */
import { corsHeaders } from "../_shared/cors.ts";
import { alibabaChatJSON, hasAlibabaKey } from "../_shared/alibabaClient.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

interface Fact {
  slot_type: "name" | "profession" | "project" | "preference" | "key_date" | "fact";
  slot_key?: string;
  title: string;
  summary: string;
  slot_value?: unknown;
}

const SYSTEM = `You extract DURABLE personal facts about the user from a chat turn.

Return STRICT JSON: {"facts": [{"slot_type": "...", "slot_key": "...", "title": "...", "summary": "...", "slot_value": "..."}]}

slot_type MUST be one of: name | profession | project | preference | key_date | fact

RULES:
- Extract ONLY facts the USER stated about themselves. Never facts about the AI, the topic, or third parties.
- Extract ONLY durable facts (true next week, next month). Ignore greetings, one-off questions, tasks, requests.
- If the user asked a question but revealed nothing durable about themselves, return {"facts": []}.
- Write title/summary in the SAME LANGUAGE the user used.
- Keep each fact atomic — one fact per entry.
- Max 5 facts per turn.
- slot_key: short kebab-case identifier (e.g. "full-name", "birth-city", "favorite-language").
- summary: one clean sentence, no meta-talk, no "the user said…".

Examples:
User: "انا اسمي احمد وبشتغل مهندس في القاهرة" →
{"facts":[
 {"slot_type":"name","slot_key":"full-name","title":"الاسم","summary":"اسم المستخدم أحمد","slot_value":"أحمد"},
 {"slot_type":"profession","slot_key":"role","title":"المهنة","summary":"يعمل مهندساً في القاهرة","slot_value":"مهندس"}
]}

User: "what's 2+2?" → {"facts":[]}
User: "I love React and hate PHP" →
{"facts":[{"slot_type":"preference","slot_key":"tech-stack","title":"Tech preferences","summary":"Loves React, dislikes PHP","slot_value":{"loves":"React","hates":"PHP"}}]}`;

async function resolveUserId(req: Request): Promise<string | null> {
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  const anon = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY") || "";
  if (!token || token === anon) return null;
  try {
    const r = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/user`, {
      headers: { apikey: anon, Authorization: `Bearer ${token}` },
    });
    if (!r.ok) return null;
    const u = await r.json();
    return u?.id || null;
  } catch {
    return null;
  }
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[\p{P}\p{S}\s]+/gu, " ").trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const user_id = await resolveUserId(req);
  if (!user_id) {
    return new Response(JSON.stringify({ ok: true, skipped: "no_auth" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userMsg = String(body?.user_message || "").trim().slice(0, 4000);
  const asstMsg = String(body?.assistant_reply || "").trim().slice(0, 2000);
  if (!userMsg || userMsg.length < 6) {
    return new Response(JSON.stringify({ ok: true, skipped: "too_short" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Respect the "memory paused" toggle on user_memory_profiles.preferences.
  try {
    const { data: prof } = await admin
      .from("user_memory_profiles")
      .select("preferences")
      .eq("user_id", user_id)
      .maybeSingle();
    const enabled = (prof as any)?.preferences?.enabled;
    if (enabled === false) {
      return new Response(JSON.stringify({ ok: true, skipped: "memory_disabled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch { /* non-fatal */ }

  if (!(await hasAlibabaKey())) {
    return new Response(JSON.stringify({ ok: false, error: "no_llm_key" }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Extract via qwen-turbo (cheapest & fastest tier).
  let parsed: { facts?: Fact[] } = {};
  try {
    const resp = await alibabaChatJSON({
      model: "qwen-turbo",
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `USER MESSAGE:\n${userMsg}\n\nASSISTANT REPLY (context only, do not extract from this):\n${asstMsg}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
      max_tokens: 500,
    });
    const raw = resp?.choices?.[0]?.message?.content;
    parsed = typeof raw === "string" ? JSON.parse(raw) : (raw ?? {});
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: "extract_failed", detail: String(e).slice(0, 200) }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const facts: Fact[] = Array.isArray(parsed?.facts) ? parsed.facts.slice(0, 5) : [];
  if (!facts.length) {
    return new Response(JSON.stringify({ ok: true, saved: 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Load existing memories to dedupe / update instead of blindly appending.
  const { data: existing } = await admin
    .from("user_memory_entries")
    .select("id, slot_type, slot_key, summary")
    .eq("user_id", user_id)
    .limit(300);
  const existingByKey = new Map<string, { id: string; summary: string }>();
  const existingBySummary = new Set<string>();
  for (const e of existing || []) {
    if ((e as any).slot_type && (e as any).slot_key) {
      existingByKey.set(`${(e as any).slot_type}::${(e as any).slot_key}`, { id: (e as any).id, summary: (e as any).summary || "" });
    }
    if ((e as any).summary) existingBySummary.add(normalize((e as any).summary));
  }

  let saved = 0;
  const savedTitles: string[] = [];
  for (const f of facts) {
    const title = String(f.title || "").trim().slice(0, 200);
    const summary = String(f.summary || "").trim().slice(0, 1000);
    if (!title || !summary) continue;
    const slot_type = f.slot_type;
    const slot_key = f.slot_key ? String(f.slot_key).trim().slice(0, 80) : null;

    // Dedupe by (slot_type, slot_key): update in place.
    if (slot_key) {
      const key = `${slot_type}::${slot_key}`;
      const prior = existingByKey.get(key);
      if (prior) {
        if (normalize(prior.summary) === normalize(summary)) continue; // no change
        await admin.from("user_memory_entries").update({
          title,
          summary,
          slot_value: f.slot_value ?? null,
        } as any).eq("id", prior.id);
        saved++;
        savedTitles.push(title);
        continue;
      }
    }

    // Otherwise dedupe by summary similarity.
    if (existingBySummary.has(normalize(summary))) continue;

    const { error } = await admin.from("user_memory_entries").insert({
      user_id,
      title,
      summary,
      slot_type,
      slot_key,
      slot_value: f.slot_value ?? null,
      scope: "auto",
    } as any);
    if (!error) {
      saved++;
      savedTitles.push(title);
      existingBySummary.add(normalize(summary));
    }
  }

  return new Response(JSON.stringify({ ok: true, saved, titles: savedTitles }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

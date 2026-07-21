/** @doc Creates a scheduled_user_messages row for the authenticated user.
 *  Called by the client when it detects a <SCHEDULE .../> tag in the assistant reply. */
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const auth = req.headers.get("Authorization") || "";
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: auth } } },
  );
  const { data: userData, error: uErr } = await supabase.auth.getUser();
  if (uErr || !userData.user) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  try {
    const { prompt, cron, title, timezone } = await req.json();
    if (!prompt) throw new Error("prompt required");
    const row = {
      user_id: userData.user.id,
      prompt: String(prompt).slice(0, 2000),
      schedule_cron: String(cron || "0 10 * * *").slice(0, 100),
      title: title ? String(title).slice(0, 200) : null,
      timezone: timezone || "UTC",
      enabled: true,
    };
    const { data, error } = await supabase
      .from("scheduled_user_messages")
      .insert(row)
      .select("id")
      .single();
    if (error) throw error;
    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

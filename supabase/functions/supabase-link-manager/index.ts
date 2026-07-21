/** @doc Supabase OAuth connection manager: status, disconnect, and project listing. */
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { getAuthUser } from "../_shared/auth.ts";
import { adminClient, readJson } from "../_shared/integrationHelpers.ts";

function currentProjectRef() {
  const explicit = Deno.env.get("SUPABASE_PROJECT_ID")?.trim();
  if (explicit) return explicit;
  try {
    return new URL(Deno.env.get("SUPABASE_URL") ?? "").hostname.split(".")[0] || "current";
  } catch {
    return "current";
  }
}

function isLocalProjectConnection(connection: { scope?: string | null; access_token?: string | null }) {
  return connection.scope === "local_project" || String(connection.access_token ?? "").startsWith("local_project:");
}

async function getConnection(userId: string) {
  const { data, error } = await adminClient()
    .from("user_supabase_connections")
    .select("access_token,refresh_token,account_email,expires_at,scope,updated_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const user = await getAuthUser(req);
  if (!user) return jsonResponse({ error: "unauthorized" }, 401);
  try {
    const body = await readJson(req);
    const action = String(body.action ?? "status");
    if (action === "disconnect") {
      const { error } = await adminClient().from("user_supabase_connections").delete().eq("user_id", user.id);
      if (error) throw error;
      return jsonResponse({ ok: true, connected: false });
    }
    const connection = await getConnection(user.id);
    if (!connection) return jsonResponse({ connected: false });
    if (isLocalProjectConnection(connection)) {
      const projectRef = currentProjectRef();
      if (action === "list_projects") {
        return jsonResponse({
          connected: true,
          projects: [{ id: projectRef, ref: projectRef, name: connection.account_email ?? `Project ${projectRef}` }],
        });
      }
      return jsonResponse({
        connected: true,
        account_name: connection.account_email ?? `Project ${projectRef}`,
        account: {
          account_email: connection.account_email ?? `Project ${projectRef}`,
          expires_at: connection.expires_at,
          scope: connection.scope,
          updated_at: connection.updated_at,
          project_ref: projectRef,
        },
      });
    }
    if (action === "list_projects") {
      const res = await fetch("https://api.supabase.com/v1/projects", {
        headers: { Authorization: `Bearer ${connection.access_token}`, Accept: "application/json" },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) return jsonResponse({ error: data?.message || data?.error || "Supabase projects lookup failed" }, res.status);
      return jsonResponse({ connected: true, projects: data });
    }
    return jsonResponse({
      connected: true,
      account_name: connection.account_email,
      account: {
        account_email: connection.account_email,
        expires_at: connection.expires_at,
        scope: connection.scope,
        updated_at: connection.updated_at,
      },
    });
  } catch (error) {
    console.error("[supabase-link-manager]", error);
    return jsonResponse({ error: error instanceof Error ? error.message : "supabase_manager_failed" }, 500);
  }
});
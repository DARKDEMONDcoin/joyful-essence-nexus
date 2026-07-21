/** @doc GitHub account manager used by the app: status, disconnect, and lightweight repo listing. */
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { getAuthUser } from "../_shared/auth.ts";
import { adminClient, readJson } from "../_shared/integrationHelpers.ts";

async function getConnection(userId: string) {
  const { data, error } = await adminClient()
    .from("user_github_connections")
    .select("access_token,github_login,github_id,avatar_url,scope,updated_at")
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
      const { error } = await adminClient().from("user_github_connections").delete().eq("user_id", user.id);
      if (error) throw error;
      return jsonResponse({ ok: true, connected: false });
    }
    const connection = await getConnection(user.id);
    if (!connection) return jsonResponse({ connected: false });
    if (action === "list_repos") {
      const res = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
        headers: { Authorization: `Bearer ${connection.access_token}`, Accept: "application/vnd.github+json", "User-Agent": "Megsy" },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) return jsonResponse({ error: data?.message || "GitHub repositories lookup failed" }, res.status);
      return jsonResponse({ connected: true, repos: data });
    }
    return jsonResponse({
      connected: true,
      account_name: connection.github_login,
      account: {
        github_login: connection.github_login,
        github_id: connection.github_id,
        avatar_url: connection.avatar_url,
        scope: connection.scope,
        updated_at: connection.updated_at,
      },
    });
  } catch (error) {
    console.error("[github-push]", error);
    return jsonResponse({ error: error instanceof Error ? error.message : "github_manager_failed" }, 500);
  }
});
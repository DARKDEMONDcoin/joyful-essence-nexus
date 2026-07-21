// Stub helpers for E2B-dependent functions.
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

export function serviceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

export async function getUserId(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: auth } } },
  );
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function uploadFiles(
  _supabase: SupabaseClient,
  _userId: string,
  _files: Array<{ path: string; data: Uint8Array }>,
): Promise<Array<{ path: string; url: string }>> {
  return [];
}

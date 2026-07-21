/** @doc Shared skill resolver: matches user input triggers against built-in (system_skills) + user-defined (skills) and returns merged instructions. Inlined to avoid a separate edge function. */
import { createClient } from "npm:@supabase/supabase-js@2";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

export interface ResolvedSkills {
  skills: Array<{ id: string; name: string; score: number }>;
  system_prompt_addition: string;
  preferred_model: string | null;
}

export async function resolveSkills(opts: {
  user_input: string;
  user_id?: string | null;
  explicit_skill_ids?: string[];
  max_skills?: number;
}): Promise<ResolvedSkills> {
  const input = (opts.user_input || "").toLowerCase();
  const max = opts.max_skills ?? 3;

  const [{ data: sys }, { data: user }] = await Promise.all([
    admin.from("system_skills").select("id, name, instructions, body, triggers, preferred_model").eq("is_active", true),
    opts.user_id
      ? admin.from("skills").select("id, name, instructions, triggers").eq("user_id", opts.user_id)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const all = [...(sys || []), ...(user || [])];
  const explicit = new Set(opts.explicit_skill_ids || []);

  const scored = all
    .map((s: any) => {
      if (explicit.has(s.id)) return { s, score: 999 };
      const triggers: string[] = s.triggers || [];
      const score = triggers.reduce((n: number, t: string) => n + (input.includes(String(t).toLowerCase()) ? 1 : 0), 0);
      return { s, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max);

  const merged = scored
    .map(({ s }) => `## Skill: ${s.name}\n${s.instructions || ""}\n${s.body || ""}`.trim())
    .join("\n\n---\n\n");

  return {
    skills: scored.map(({ s, score }) => ({ id: s.id, name: s.name, score })),
    system_prompt_addition: merged,
    preferred_model: scored[0]?.s?.preferred_model || null,
  };
}

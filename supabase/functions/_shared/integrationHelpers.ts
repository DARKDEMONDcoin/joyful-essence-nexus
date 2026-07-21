import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function adminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

export function getEnv(...names: string[]) {
  for (const name of names) {
    const value = Deno.env.get(name)?.trim();
    if (value) return value;
  }
  return "";
}

function normalizeEnvName(name: string) {
  return name.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
}

export function getEnvByTokens(
  allTokens: string[],
  preferTokens: string[] = [],
  forbiddenTokens: string[] = [],
) {
  const all = allTokens.map((token) => token.toUpperCase());
  const preferred = preferTokens.map((token) => token.toUpperCase());
  const forbidden = forbiddenTokens.map((token) => token.toUpperCase());
  const entries = Object.entries(Deno.env.toObject())
    .map(([name, value]) => ({
      name,
      normalized: normalizeEnvName(name),
      value: String(value ?? "").trim(),
    }))
    .filter(({ normalized, value }) => {
      if (!value) return false;
      if (!all.every((token) => normalized.includes(token))) return false;
      return !forbidden.some((token) => normalized.includes(token));
    })
    .sort((a, b) => {
      const score = (item: { normalized: string }) =>
        preferred.reduce(
          (total, token) => total + (item.normalized.includes(token) ? 1 : 0),
          0,
        );
      return score(b) - score(a) || a.normalized.localeCompare(b.normalized);
    });
  return entries[0]?.value ?? "";
}

async function getVaultSecretByExactName(names: string[]) {
  try {
    const { data, error } = await adminClient()
      .schema("vault")
      .from("decrypted_secrets")
      .select("name,decrypted_secret")
      .in("name", names)
      .limit(20);
    if (error || !Array.isArray(data)) return "";
    for (const name of names) {
      const row = data.find((item: any) => item?.name === name);
      const value = String(row?.decrypted_secret ?? "").trim();
      if (value) return value;
    }
  } catch {
    return "";
  }
  return "";
}

async function getDatabaseIntegrationSecret(names: string[], tokenFallback?: {
  all: string[];
  prefer?: string[];
  forbidden?: string[];
}) {
  try {
    const { data, error } = await adminClient().rpc("get_integration_secret", {
      _names: names,
      _all_tokens: tokenFallback?.all ?? [],
      _prefer_tokens: tokenFallback?.prefer ?? [],
      _forbidden_tokens: tokenFallback?.forbidden ?? [],
    });
    if (error) return "";
    return String(data ?? "").trim();
  } catch {
    return "";
  }
}

export async function describeConfiguredSecretSources(
  names: string[],
  tokenFallback?: {
    all: string[];
    prefer?: string[];
    forbidden?: string[];
  },
) {
  const envExactName =
    names.find((name) => Boolean(Deno.env.get(name)?.trim())) ?? null;
  const envTokenName = tokenFallback
    ? Object.entries(Deno.env.toObject())
      .map(([name, value]) => ({
        name,
        normalized: normalizeEnvName(name),
        value: String(value ?? "").trim(),
      }))
      .find(({ normalized, value }) => {
        if (!value) return false;
        const all = tokenFallback.all.map((token) => token.toUpperCase());
        const forbidden = (tokenFallback.forbidden ?? []).map((token) =>
          token.toUpperCase()
        );
        return all.every((token) => normalized.includes(token)) &&
          !forbidden.some((token) => normalized.includes(token));
      })?.name ?? null
    : null;
  let rpcHasValue = false;
  let rpcError: string | null = null;
  try {
    const { data, error } = await adminClient().rpc("get_integration_secret", {
      _names: names,
      _all_tokens: tokenFallback?.all ?? [],
      _prefer_tokens: tokenFallback?.prefer ?? [],
      _forbidden_tokens: tokenFallback?.forbidden ?? [],
    });
    rpcHasValue = Boolean(String(data ?? "").trim());
    rpcError = error?.message ?? null;
  } catch (error) {
    rpcError = error instanceof Error ? error.message : String(error);
  }
  return {
    envExactName,
    envTokenName,
    rpcHasValue,
    rpcError,
    serviceRoleAvailable: Boolean(
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim(),
    ),
    supabaseUrlAvailable: Boolean(Deno.env.get("SUPABASE_URL")?.trim()),
  };
}

async function getVaultSecretByTokens(
  allTokens: string[],
  preferTokens: string[] = [],
  forbiddenTokens: string[] = [],
) {
  try {
    const all = allTokens.map((token) => token.toUpperCase());
    const preferred = preferTokens.map((token) => token.toUpperCase());
    const forbidden = forbiddenTokens.map((token) => token.toUpperCase());
    const { data, error } = await adminClient()
      .schema("vault")
      .from("decrypted_secrets")
      .select("name,decrypted_secret")
      .limit(200);
    if (error || !Array.isArray(data)) return "";
    const matches = data
      .map((item: any) => ({
        name: String(item?.name ?? ""),
        normalized: normalizeEnvName(String(item?.name ?? "")),
        value: String(item?.decrypted_secret ?? "").trim(),
      }))
      .filter(({ normalized, value }) => {
        if (!value) return false;
        if (!all.every((token) => normalized.includes(token))) return false;
        return !forbidden.some((token) => normalized.includes(token));
      })
      .sort((a, b) => {
        const score = (item: { normalized: string }) =>
          preferred.reduce(
            (total, token) => total + (item.normalized.includes(token) ? 1 : 0),
            0,
          );
        return score(b) - score(a) || a.normalized.localeCompare(b.normalized);
      });
    return matches[0]?.value ?? "";
  } catch {
    return "";
  }
}

async function getAppConfigSecretByExactName(names: string[]) {
  try {
    const keys = names.flatMap((
      name,
    ) => [name, name.toLowerCase(), name.replace(/_/g, ".").toLowerCase()]);
    const { data, error } = await adminClient()
      .from("app_kv")
      .select("key,value")
      .in("key", keys)
      .limit(50);
    if (error || !Array.isArray(data)) return "";
    for (const name of keys) {
      const row = data.find((item: any) => item?.key === name);
      const raw = row?.value;
      const value = typeof raw === "string"
        ? raw
        : raw?.value ?? raw?.secret ?? raw?.key ?? raw?.client_secret ??
          raw?.client_id;
      if (String(value ?? "").trim()) return String(value).trim();
    }
  } catch {
    return "";
  }
  return "";
}

export async function getConfiguredSecret(names: string[], tokenFallback?: {
  all: string[];
  prefer?: string[];
  forbidden?: string[];
}) {
  const envExact = getEnv(...names);
  if (envExact) return envExact;
  if (tokenFallback) {
    const envToken = getEnvByTokens(
      tokenFallback.all,
      tokenFallback.prefer ?? [],
      tokenFallback.forbidden ?? [],
    );
    if (envToken) return envToken;
  }
  const databaseSecret = await getDatabaseIntegrationSecret(
    names,
    tokenFallback,
  );
  if (databaseSecret) return databaseSecret;
  const vaultExact = await getVaultSecretByExactName(names);
  if (vaultExact) return vaultExact;
  if (tokenFallback) {
    const vaultToken = await getVaultSecretByTokens(
      tokenFallback.all,
      tokenFallback.prefer ?? [],
      tokenFallback.forbidden ?? [],
    );
    if (vaultToken) return vaultToken;
  }
  return await getAppConfigSecretByExactName(names);
}

const DEFAULT_PUBLIC_APP_ORIGIN = "https://megsyai.com";

const GENERIC_APP_ORIGIN_NAMES = [
  "APP_ORIGIN",
  "APP_URL",
  "PUBLIC_APP_URL",
  "PUBLIC_SITE_URL",
  "SITE_URL",
  "MEGSY_APP_URL",
  "MEGSY_SITE_URL",
  "FRONTEND_URL",
  "WEB_APP_URL",
  "VITE_APP_URL",
  "VITE_SITE_URL",
  "NEXT_PUBLIC_SITE_URL",
];

const PROVIDER_CALLBACK_NAMES: Record<string, string[]> = {
  github: [
    "GITHUB_OAUTH_REDIRECT_URI",
    "GITHUB_OAUTH_CALLBACK_URL",
    "GITHUB_REDIRECT_URI",
    "GITHUB_CALLBACK_URL",
    "GITHUB_APP_CALLBACK_URL",
    "GITHUB_CONNECT_CALLBACK_URL",
  ],
  supabase: [
    "SUPABASE_OAUTH_REDIRECT_URI",
    "SUPABASE_OAUTH_CALLBACK_URL",
    "SUPABASE_REDIRECT_URI",
    "SUPABASE_CALLBACK_URL",
    "SUPABASE_CONNECT_CALLBACK_URL",
    "SUPABASE_MANAGEMENT_CALLBACK_URL",
  ],
};

function originFromUrl(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
}

export async function configuredOAuthOrigin(
  provider: "github" | "supabase",
  fallbackOrigin: string,
) {
  const providerValue = await getConfiguredSecret([
    ...(PROVIDER_CALLBACK_NAMES[provider] ?? []),
    ...GENERIC_APP_ORIGIN_NAMES,
  ], {
    all: [provider, "CALLBACK"],
    prefer: ["OAUTH", "REDIRECT", "URL", "URI"],
    forbidden: ["SECRET", "CLIENT", "TOKEN", "KEY"],
  });
  const configuredProviderOrigin = originFromUrl(providerValue);
  if (configuredProviderOrigin) return configuredProviderOrigin;

  const appValue = await getConfiguredSecret(GENERIC_APP_ORIGIN_NAMES, {
    all: ["APP", "URL"],
    prefer: ["PUBLIC", "SITE", "MEGSY", "FRONTEND", "WEB"],
    forbidden: ["SECRET", "CLIENT", "TOKEN", "KEY", "SUPABASE", "PIPEDREAM", "GITHUB"],
  });
  const configuredAppOrigin = originFromUrl(appValue);
  if (configuredAppOrigin) return configuredAppOrigin;

  const fallback = originFromUrl(fallbackOrigin) || fallbackOrigin;
  return fallback || DEFAULT_PUBLIC_APP_ORIGIN;
}

export const SUPABASE_OAUTH_CLIENT_ID_NAMES = [
  "SUPABASE_OAUTH_CLIENT_ID",
  "SUPABASE_OAUTH_APP_CLIENT_ID",
  "SUPABASE_OAUTH_CLIENTID",
  "SUPABASE_OAUTH_ID",
  "SUPABASE_CLIENT_ID",
  "SUPABASE_CLIENTID",
  "SUPABASE_APP_CLIENT_ID",
  "SUPABASE_PLATFORM_CLIENT_ID",
  "SUPABASE_PLATFORM_OAUTH_CLIENT_ID",
  "SUPABASE_CONNECT_CLIENT_ID",
  "SUPABASE_CONNECT_CLIENTID",
  "SUPABASE_CONNECT_APP_CLIENT_ID",
  "SUPABASE_CONNECT_OAUTH_CLIENT_ID",
  "SUPABASE_MANAGEMENT_CLIENT_ID",
  "SUPABASE_MANAGEMENT_API_CLIENT_ID",
  "SUPABASE_MANAGEMENT_OAUTH_CLIENT_ID",
  "SUPABASE_MANAGEMENT_API_OAUTH_CLIENT_ID",
  "SUPABASE_INTEGRATION_CLIENT_ID",
  "SB_OAUTH_CLIENT_ID",
  "SB_CONNECT_CLIENT_ID",
  "SUPA_CONNECT_CLIENT_ID",
  "SUPA_CLIENT_ID",
];

export const SUPABASE_OAUTH_CLIENT_SECRET_NAMES = [
  "SUPABASE_OAUTH_CLIENT_SECRET",
  "SUPABASE_OAUTH_APP_CLIENT_SECRET",
  "SUPABASE_OAUTH_SECRET",
  "SUPABASE_CLIENT_SECRET",
  "SUPABASE_APP_CLIENT_SECRET",
  "SUPABASE_PLATFORM_CLIENT_SECRET",
  "SUPABASE_PLATFORM_OAUTH_CLIENT_SECRET",
  "SUPABASE_CONNECT_CLIENT_SECRET",
  "SUPABASE_CONNECT_APP_CLIENT_SECRET",
  "SUPABASE_CONNECT_OAUTH_CLIENT_SECRET",
  "SUPABASE_MANAGEMENT_CLIENT_SECRET",
  "SUPABASE_MANAGEMENT_API_CLIENT_SECRET",
  "SUPABASE_MANAGEMENT_OAUTH_CLIENT_SECRET",
  "SUPABASE_MANAGEMENT_API_OAUTH_CLIENT_SECRET",
  "SUPABASE_INTEGRATION_CLIENT_SECRET",
  "SB_OAUTH_CLIENT_SECRET",
  "SB_CONNECT_CLIENT_SECRET",
  "SUPA_CONNECT_CLIENT_SECRET",
  "SUPA_CLIENT_SECRET",
];

export const SUPABASE_MANAGEMENT_TOKEN_NAMES = [
  "SUPABASE_ACCESS_TOKEN",
  "SUPABASE_MANAGEMENT_TOKEN",
  "SUPABASE_MANAGEMENT_API_TOKEN",
  "SUPABASE_PERSONAL_ACCESS_TOKEN",
  "SUPABASE_PAT",
  "SB_MANAGEMENT_TOKEN",
  "SB_ACCESS_TOKEN",
  "SUPA_MANAGEMENT_TOKEN",
  "SUPA_ACCESS_TOKEN",
];

export function supabaseOAuthClientId() {
  return getEnv(...SUPABASE_OAUTH_CLIENT_ID_NAMES) ||
    getEnvByTokens(
      ["SUPABASE", "CLIENT", "ID"],
      ["OAUTH", "CONNECT", "MANAGEMENT", "PLATFORM", "INTEGRATION"],
      [
        "SECRET",
        "KEY",
        "URL",
        "PROJECT",
        "PUBLISHABLE",
        "ANON",
        "SERVICE",
        "JWT",
      ],
    );
}

export function supabaseOAuthClientSecret() {
  return getEnv(...SUPABASE_OAUTH_CLIENT_SECRET_NAMES) ||
    getEnvByTokens(
      ["SUPABASE", "CLIENT", "SECRET"],
      ["OAUTH", "CONNECT", "MANAGEMENT", "PLATFORM", "INTEGRATION"],
      ["SERVICE", "ROLE", "JWT", "ANON", "PUBLISHABLE", "URL", "PROJECT"],
    );
}

export async function supabaseOAuthCredentials() {
  const clientId = await getConfiguredSecret(SUPABASE_OAUTH_CLIENT_ID_NAMES, {
    all: ["SUPABASE", "CLIENT", "ID"],
    prefer: ["OAUTH", "CONNECT", "MANAGEMENT", "PLATFORM", "INTEGRATION"],
    forbidden: [
      "SECRET",
      "KEY",
      "URL",
      "PROJECT",
      "PUBLISHABLE",
      "ANON",
      "SERVICE",
      "JWT",
    ],
  });
  const clientSecret = await getConfiguredSecret(
    SUPABASE_OAUTH_CLIENT_SECRET_NAMES,
    {
      all: ["SUPABASE", "CLIENT", "SECRET"],
      prefer: ["OAUTH", "CONNECT", "MANAGEMENT", "PLATFORM", "INTEGRATION"],
      forbidden: [
        "SERVICE",
        "ROLE",
        "JWT",
        "ANON",
        "PUBLISHABLE",
        "URL",
        "PROJECT",
      ],
    },
  );
  return { clientId, clientSecret };
}

export async function supabaseManagementToken() {
  return await getConfiguredSecret(SUPABASE_MANAGEMENT_TOKEN_NAMES, {
    all: ["SUPABASE", "TOKEN"],
    prefer: ["MANAGEMENT", "ACCESS", "API", "PERSONAL", "PAT"],
    forbidden: [
      "REFRESH",
      "JWT",
      "ANON",
      "PUBLISHABLE",
      "SERVICE",
      "ROLE",
      "TELEGRAM",
      "BOT",
      "WEBHOOK",
    ],
  });
}

export async function supabaseOAuthDiagnostics() {
  const clientId = await describeConfiguredSecretSources(
    SUPABASE_OAUTH_CLIENT_ID_NAMES,
    {
      all: ["SUPABASE", "CLIENT", "ID"],
      prefer: ["OAUTH", "CONNECT", "MANAGEMENT", "PLATFORM", "INTEGRATION"],
      forbidden: [
        "SECRET",
        "KEY",
        "URL",
        "PROJECT",
        "PUBLISHABLE",
        "ANON",
        "SERVICE",
        "JWT",
      ],
    },
  );
  const clientSecret = await describeConfiguredSecretSources(
    SUPABASE_OAUTH_CLIENT_SECRET_NAMES,
    {
      all: ["SUPABASE", "CLIENT", "SECRET"],
      prefer: ["OAUTH", "CONNECT", "MANAGEMENT", "PLATFORM", "INTEGRATION"],
      forbidden: [
        "SERVICE",
        "ROLE",
        "JWT",
        "ANON",
        "PUBLISHABLE",
        "URL",
        "PROJECT",
      ],
    },
  );
  return { clientId, clientSecret };
}

export function supabaseOAuthMissingMessage(needsSecret = false) {
  const idNames = SUPABASE_OAUTH_CLIENT_ID_NAMES.join(", ");
  const secretNames = SUPABASE_OAUTH_CLIENT_SECRET_NAMES.join(", ");
  return needsSecret
    ? `Supabase OAuth backend keys are missing. Expected client id in one of: ${idNames}. Expected client secret in one of: ${secretNames}.`
    : `Supabase OAuth client id is missing. Expected one of: ${idNames}.`;
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function callbackOrigin(req: Request, body: Record<string, unknown>) {
  const raw = String(
    body.redirect_origin ?? body.origin ?? body.redirect_to ??
      req.headers.get("origin") ?? "",
  );
  try {
    return new URL(raw).origin;
  } catch {
    return req.headers.get("origin") || "";
  }
}

export function base64Url(bytes: Uint8Array | string) {
  const input = typeof bytes === "string"
    ? new TextEncoder().encode(bytes)
    : bytes;
  let binary = "";
  for (const byte of input) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export async function sha256Base64Url(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return base64Url(new Uint8Array(digest));
}

export function oauthState() {
  return crypto.randomUUID().replace(/-/g, "") +
    crypto.randomUUID().replace(/-/g, "");
}

export function providerError(
  prefix: string,
  response: Response,
  text: string,
) {
  return `${prefix} failed [${response.status}]: ${
    text || response.statusText
  }`;
}

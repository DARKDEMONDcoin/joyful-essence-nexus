/** @doc Test page: Integration.app catalog via SDK. Real Connect popup + integrations list. */
import { useEffect, useMemo, useState } from "react";
import {
  IntegrationAppProvider,
  useIntegrationApp,
  useIntegrations,
} from "@integration-app/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getIntegrationAppToken } from "@/lib/integrationApp.functions";

function IntegrationsGrid() {
  const [q, setQ] = useState("");
  const { integrations, loading, error, refresh } = useIntegrations();
  const client = useIntegrationApp();

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const list = integrations ?? [];
    if (!t) return list;
    return list.filter(
      (i: any) =>
        i.name?.toLowerCase().includes(t) ||
        i.key?.toLowerCase().includes(t)
    );
  }, [integrations, q]);

  const handleConnect = async (key: string) => {
    try {
      const conn = await client.integration(key).openNewConnection();
      console.log("connected:", conn);
      await refresh();
    } catch (e) {
      console.error("connect failed", e);
    }
  };

  return (
    <div>
      <Input
        placeholder="Search… (name / key)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="mb-4"
      />

      {loading && (
        <div className="py-6 text-sm text-muted-foreground">Loading…</div>
      )}
      {error && (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {String((error as any)?.message ?? error)}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map((i: any) => {
          const connected = !!i.connection;
          return (
            <div
              key={i.key}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3"
            >
              {i.logoUri ? (
                <img
                  src={i.logoUri}
                  alt={i.name}
                  className="h-10 w-10 rounded-md object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="h-10 w-10 rounded-md bg-muted" />
              )}
              <div className="min-w-0 text-center">
                <div className="truncate text-sm font-medium">{i.name}</div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {i.key}
                </div>
              </div>
              <Button
                size="sm"
                variant={connected ? "secondary" : "default"}
                className="w-full"
                onClick={() => handleConnect(i.key)}
              >
                {connected ? "Reconnect" : "Connect"}
              </Button>
            </div>
          );
        })}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="py-10 text-center text-sm text-muted-foreground">
          No results
        </div>
      )}
    </div>
  );
}

export default function IntegrationAppTest() {
  const [token, setToken] = useState<string | null>(null);
  const [tokenErr, setTokenErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getIntegrationAppToken()
      .then((r) => !cancelled && setToken(r.token))
      .catch((e) => !cancelled && setTokenErr(e?.message ?? "token failed"));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold">Integration.app</h1>
          <p className="text-sm text-muted-foreground">
            Integrations catalog — click Connect to launch the real OAuth flow
          </p>
        </div>

        {tokenErr && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {tokenErr}
          </div>
        )}

        {!token && !tokenErr && (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Preparing session…
          </div>
        )}

        {token && (
          <IntegrationAppProvider token={token}>
            <IntegrationsGrid />
          </IntegrationAppProvider>
        )}
      </div>
    </div>
  );
}

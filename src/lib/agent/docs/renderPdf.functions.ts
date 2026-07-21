/** @doc Renders an HTML doc to PDF via Transactional (Gotenberg). Returns a signed PDF URL. */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const BASE = "https://api.transactional.dev/v1";

const InputSchema = z.object({
  html: z.string().min(20).max(2_000_000),
  title: z.string().max(180).optional(),
});

async function td(path: string, method: string, token: string, body?: unknown) {
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: { "x-api-token": token, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(`Transactional ${method} ${path} (${r.status}): ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : null;
}

export const renderDocPdf = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const token = process.env.TRANSACTIONAL_API_KEY;
    if (!token) throw new Error("TRANSACTIONAL_API_KEY missing");

    const name = (data.title || "document").slice(0, 180);
    const created = await td("/documents", "POST", token, { name });
    const id = created.id as number;
    const uuid = created.uuid as string;

    await td(`/documents/${id}`, "PATCH", token, {
      body: data.html,
      framework: "TAILWIND",
      format: "A4",
    });

    const gen = await td("/generate", "POST", token, {
      documentId: uuid,
      variables: {},
    });
    const url = gen?.url as string | undefined;
    if (!url) throw new Error("Transactional did not return a url");

    return { url, documentId: uuid };
  });

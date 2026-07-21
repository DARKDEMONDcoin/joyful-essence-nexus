/** @doc API endpoint: generates a Customer Access Token for Integration.app without exposing workspace secrets to the browser. */
import { createHmac } from "crypto";

function base64Url(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function createToken() {
  const workspaceKey = process.env.INTEGRATION_APP_WORKSPACE_KEY ?? process.env.MEMBRANE_WORKSPACE_KEY;
  const workspaceSecret = process.env.INTEGRATION_APP_WORKSPACE_SECRET ?? process.env.MEMBRANE_WORKSPACE_SECRET;

  if (!workspaceKey || !workspaceSecret) {
    throw new Error("Integration.app workspace credentials missing");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      id: "demo-user",
      name: "Demo User",
      fields: {},
      iss: workspaceKey,
      iat: now,
      exp: now + 60 * 60,
    }),
  );
  const body = `${header}.${payload}`;
  const signature = createHmac("sha256", workspaceSecret).update(body).digest();
  return `${body}.${base64Url(signature)}`;
}

export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  try {
    res.status(200).json({ token: createToken() });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "token_generation_failed" });
  }
}
/** @doc Client helper: requests a Customer Access Token for Integration.app from the app API. */

export async function getIntegrationAppToken() {
  const response = await fetch("/api/integration-app-token", { method: "POST" });
  const data = await response.json().catch(() => null) as { token?: string; error?: string } | null;

  if (!response.ok) throw new Error(data?.error ?? "Integration.app token failed");
  if (!data?.token) throw new Error("Integration.app token missing");
  return data;
}

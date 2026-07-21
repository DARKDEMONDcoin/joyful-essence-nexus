// Stub: real E2B sandbox integration not yet ported.
// Functions that depend on this will return a clear error until implemented.
export interface SandboxResult {
  stdout: string;
  stderr: string;
  files?: Array<{ path: string; data: Uint8Array }>;
  artifacts?: unknown[];
}

export async function runInSandbox(_args: unknown): Promise<SandboxResult> {
  throw new Error(
    "E2B sandbox integration is not configured in this deployment. " +
    "Set E2B_API_KEY and implement supabase/functions/_shared/e2b.ts.",
  );
}

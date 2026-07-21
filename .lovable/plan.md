# MCP Tool Execution via Kimi K2 (Sprint 2 — Final)

## Why

The current `chat-alibaba` route runs Qwen models that don't support native function-calling on the DashScope OpenAI-compatible path. Injecting MCP tool names as text made Qwen hallucinate `<|use_tool|>` tags. We removed the injection — chat works, but MCP tools can't be invoked from chat.

Good news: **Kimi K2** (Moonshot) is already hosted on Alibaba Bailian marketplace and is wired in the `KIMI_CHAIN`. Kimi K2 supports native OpenAI-style `tools` / `tool_calls`. Route MCP-enabled turns through Kimi.

## Scope

1. **Auto-route to Kimi when MCP tools are enabled**
   - Check user's `mcp_connections` (state=ready, enabled=true) at request start.
   - If any enabled server has tools → override chain to `KIMI_CHAIN`.
   - Otherwise keep the existing model selection.

2. **Pass tools as OpenAI `tools` parameter**
   - Fetch each ready+enabled MCP server's `tool_names` + input schemas (need to store schemas — extend `mcp_probe` to save `tool_schemas jsonb`).
   - Build `tools: [{type:"function", function:{name, description, parameters}}]`.
   - Namespace tool names as `<server_slug>__<tool_name>` to avoid collisions.

3. **Tool-call execution loop (non-streaming inner turns)**
   - Send first request with `stream:true` + `tools`.
   - When Kimi emits `finish_reason:"tool_calls"`, buffer the deltas, execute each tool call by invoking `crawl-url` with `action=mcp_call_tool`, append `tool` role messages with results, and re-request.
   - Loop up to 4 iterations. Final iteration streams the assistant's natural-language answer to the client.
   - Emit intermediate SSE status frames (`{"status":"Calling tool: <name>"}`) so the UI can show tool activity.

4. **DB migration**
   - Add `tool_schemas jsonb` column to `mcp_connections`.
   - Update `crawl-url` `mcp_probe` to save each tool's `inputSchema` from `tools/list` response alongside `tool_names`.

5. **Verify**
   - Manual test: add a public MCP server (e.g. the Wikipedia one from earlier screenshot), send "اقرأ مقال ام كلثوم من ويكيبيديا" in chat, confirm real content returns (not hallucinated tags).
   - Test with MCP disabled: chat still uses Qwen chain and works.

## Out of scope

- Streaming tool arguments token-by-token in the UI (buffer per turn is fine).
- Parallel tool-call execution (run sequentially first).
- Auto-approval prompts for destructive tools (later Sprint).

## Files touched

- `supabase/migrations/…_add_mcp_tool_schemas.sql` (new)
- `supabase/functions/crawl-url/index.ts` (save schemas on probe)
- `supabase/functions/chat-alibaba/index.ts` (tools param + tool_call loop + Kimi routing)
- `src/pages/settings/McpSettingsPage.tsx` (small badge: "Available in chat via Kimi")

## Risks

- Kimi K2 on Bailian may have rate-limits stricter than Qwen — keep the fallback chain and surface 429 clearly.
- Tool schemas can be huge; cap total `tools` payload size (~32 tools, drop overflow with a warning).
- Kimi may still not perfectly follow multi-turn tool loops; add a hard 4-iteration cap to prevent infinite spend.

Approve to start? I'll implement in one pass and test with a real MCP call end-to-end.

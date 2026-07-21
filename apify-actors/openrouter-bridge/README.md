# OpenRouter Bridge (Apify Standby Actor)

This is a tiny Apify Standby actor that lives **inside your Apify account**.
It accepts HTTP requests from your Supabase Edge Function and forwards them
to `openrouter.apify.actor` from inside the Apify platform — which is the
only place the official `apify/openrouter` proxy accepts calls from.

It supports:

- `POST /api/v1/chat/completions` → text + image generation (OpenRouter)
- `POST /api/v1/videos` → submit a video generation job (OpenRouter)
- `GET  /api/v1/videos/:jobId` → poll a video job
- `GET  /api/v1/videos/:jobId/content?index=0` → download finished video
- `GET  /api/v1/models` (and any other OpenRouter GET) → passthrough

## 1. Create the actor in Apify Console

1. Open https://console.apify.com/actors and click **Create new**.
2. Name it `openrouter-bridge` (or anything; remember the slug).
3. Switch to the **Source** tab → **Single JavaScript file** template.
4. Replace the contents of `main.js` with `src/main.js` from this folder.
5. Replace `package.json` with the one in this folder.
6. Open the **Settings** tab:
   - **Standby mode**: ON
   - **Standby port**: `4321`
   - **Standby URL**: copy it (looks like `https://<slug>.apify.actor`).
7. Click **Build**, then **Start in Standby**.

## 2. Wire it into Supabase

Add a single Supabase secret named `APIFY_BRIDGE_URL` and set it to the
Standby URL from step 6 (no trailing slash). The existing `APIFY_TOKEN`
secret is reused as the bearer.

That's it — the `openrouter-media` edge function will detect
`APIFY_BRIDGE_URL` and route every request through your bridge actor.

## Local dev (optional)

```bash
cd apify-actors/openrouter-bridge
npm install
APIFY_TOKEN=... node src/main.js
# Standby HTTP server listens on http://localhost:4321
```
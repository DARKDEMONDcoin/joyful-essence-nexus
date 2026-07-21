import { defineConfig } from "vite";
import type { Plugin, ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { createHmac } from "crypto";
import { visualizer } from "rollup-plugin-visualizer";
import { compression } from "vite-plugin-compression2";
import { VitePWA } from "vite-plugin-pwa";

function createIntegrationAppToken() {
  const workspaceKey = process.env.INTEGRATION_APP_WORKSPACE_KEY ?? process.env.MEMBRANE_WORKSPACE_KEY;
  const workspaceSecret = process.env.INTEGRATION_APP_WORKSPACE_SECRET ?? process.env.MEMBRANE_WORKSPACE_SECRET;

  if (!workspaceKey || !workspaceSecret) {
    throw new Error("Integration.app workspace credentials missing");
  }

  const base64Url = (input: string | Buffer) =>
    Buffer.from(input)
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
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

function integrationAppTokenDevPlugin(): Plugin {
  return {
    name: "integration-app-token-dev",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/integration-app-token", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "method_not_allowed" }));
          return;
        }

        try {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ token: createIntegrationAppToken() }));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : "token_generation_failed" }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          // React Compiler — auto-memoizes every component and hook across
          // the site. Eliminates unnecessary re-renders without hand-written
          // React.memo / useMemo / useCallback everywhere. Runs at build time.
          ["babel-plugin-react-compiler", { target: "19" }],
        ],
      },
    }),
    integrationAppTokenDevPlugin(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null,
      filename: "sw.js",
      devOptions: { enabled: false },
      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png",
        "pwa-192.png",
        "pwa-512.png",
      ],
      manifestFilename: "site.webmanifest",
      manifest: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
        globIgnores: ["**/megsy-push-sw.js", "**/service-worker.js"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/~oauth/, /^\/api\//, /^\/auth\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "html-nav",
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 40, maxAgeSeconds: 24 * 60 * 60 },
            },
          },
          {
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin && /\.(?:png|jpe?g|webp|avif|svg|gif|ico)$/i.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "img-assets",
              expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin && /\.(?:woff2?|ttf|otf)$/i.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "fonts",
              expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
    // Pre-compress build assets with Brotli and Gzip so hosting (Cloudflare /
    // Vercel / static edge) can serve the smallest possible payload without
    // recompressing per request. Skips small and already-compressed assets.
    compression({
      algorithms: ["brotliCompress", "gzip"],
      exclude: [/\.(br|gz|png|jpe?g|webp|avif|woff2?|mp4|webm)$/i],
      threshold: 1024,
    }),
    // Enable with `ANALYZE=1 bun run build` — writes dist/stats.html.
    ...(process.env.ANALYZE
      ? [
          visualizer({
            filename: "dist/stats.html",
            gzipSize: true,
            brotliSize: true,
            template: "treemap",
          }) as Plugin,
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    // Static HTML templates under public/templates/* import 3D libs from CDNs
    // (three/addons, stats-gl, etc.) directly in the browser. Vite's dep
    // scanner tries to resolve them from node_modules and warns on every boot.
    // They are not part of the app bundle — exclude them from scanning.
    entries: ["index.html", "src/**/*.{ts,tsx}"],
    include: ["use-sync-external-store/shim/with-selector", "@integration-app/react"],
    exclude: ["msw", "@mswjs/interceptors", "@tanstack/react-start", "@tanstack/start-server-core"],
  },

  server: {
    host: "::",
    port: 8080,
    strictPort: true,
    allowedHosts: true,
  },
  // Drop console.* and debugger from production JS via esbuild — no terser install needed.
  esbuild: {
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
    legalComments: "none",
  },
  // Workers must be single-file bundles — disable manualChunks/external for
  // the worker build so `new Worker(new URL(...))` compiles cleanly.
  worker: {
    format: "es",
    rollupOptions: {
      output: { manualChunks: undefined, inlineDynamicImports: true },
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    assetsInlineLimit: 2048,
    chunkSizeWarningLimit: 1200,
    minify: "esbuild",
    // Fully disable modulepreload. Vite's default behavior preloads the
    // transitive graph of every async chunk from the entry, which meant the
    // landing page eagerly fetched ~1MB of markdown/syntax/icons/chat code
    // even though those chunks are only used inside authenticated routes.
    // Each lazy route now fetches its own chunks strictly on demand.
    modulePreload: false,
    rollupOptions: {
      external: [/^npm:/, /^https?:\/\//, /^jsr:/, /^node:/],
      output: {
        // Keep only the truly universal runtime packages in a shared vendor
        // chunk. Everything else is left to Rollup's default splitter so that
        // route-specific dependencies (markdown, syntax highlighting, lobehub
        // brand icons, radix widgets, framer-motion, etc.) travel with the
        // async chunk that actually uses them instead of being force-hoisted
        // into the entry graph. This is the fix for the "landing page loads
        // 3.9 MB of JS" regression.
        manualChunks(id) {
          // Lazy-loaded 1 MB exact-text i18n dictionary — keep it in its own
          // chunk so it never gets hoisted into the entry graph.
          if (id.includes("authI18n.exactText")) return "i18n-exact";
          if (!id.includes("node_modules")) return;
          // Truly universal — only the React runtime + router live in the
          // entry chunk. Everything else must travel with the route/component
          // that first imports it, Facebook-style.
          if (
            /[\\/]node_modules[\\/]react-dom[\\/]/.test(id) ||
            /[\\/]node_modules[\\/]react[\\/]/.test(id) ||
            id.includes("scheduler") ||
            id.includes("react-router") ||
            // Radix depends heavily on React and has internal circular deps.
            // Splitting it into its own chunk caused a production race where
            // `radix` executed before `react-vendor` finished initializing,
            // throwing "Cannot read properties of undefined (reading
            // 'forwardRef')" and leaving the app on a black splash. Keep
            // Radix bundled with React so imports resolve in-file, top-down.
            id.includes("@radix-ui")
          ) {
            return "react-vendor";
          }
          // Keep Integration.app out of react-vendor. Its package path is
          // `@integration-app/react`, so a broad `/react/` substring match
          // accidentally bundled the SDK into the React runtime chunk. The SDK
          // imports SWR/client helpers that also live in other async chunks,
          // creating a production circular import and crashing before mount
          // with "Cannot access '<var>' before initialization".
          if (id.includes("@integration-app")) return "integration-app";
          if (id.includes("@supabase")) return "supabase";

          // Motion must stay in one chunk. Splitting Framer Motion internals
          // across `motion-core` / `motion-features` can break its circular
          // initialization order in production builds and crash before React
          // mounts, leaving the app on a blank black screen.
          if (id.includes("framer-motion")) {
            return "motion";
          }

          // @lobehub icons: split per provider so a page that only shows OpenAI
          // doesn't fetch Anthropic + Google + Grok + 50 more SVG chunks.
          if (id.includes("@lobehub")) {
            // Real path shape is `@lobehub/icons/es/<IconName>/index.js` and
            // shared internals live under `@lobehub/icons/es/features|utils|...`.
            const m = id.match(/@lobehub\/icons\/(?:es|dist|lib)\/([^/]+)/i);
            if (m) {
              const seg = m[1].toLowerCase();
              // Keep shared runtime in a single small chunk; each brand icon
              // gets its own chunk so pages only pay for what they render.
              if (["features", "utils", "type", "types", "style", "hooks"].includes(seg)) {
                return "lobehub-runtime";
              }
              return `lobehub-${seg}`;
            }
            return "lobehub-core";
          }

          // lucide-react must stay in a shared "icons" chunk. Removing this
          // rule causes routes with many icons (e.g. chat messages) to inline
          // ~500 KB of icons into their own chunk. Shared chunk = downloaded
          // once, cached across routes.
          if (id.includes("lucide-react")) return "icons";


          if (
            id.includes("react-markdown") ||
            id.includes("remark-") ||
            id.includes("rehype-") ||
            id.includes("micromark") ||
            id.includes("mdast-") ||
            id.includes("hast-") ||
            id.includes("unified") ||
            id.includes("unist-")
          ) {
            return "markdown";
          }
          // Bundle only the highlighter runtime here — leave per-language
          // grammars (prism/{lang} + refractor/lang/{lang}) as separate
          // dynamic chunks so `CodeBlockHighlighter` can fetch them per
          // fenced block instead of shipping every language up-front.
          if (
            (id.includes("react-syntax-highlighter") ||
              id.includes("refractor") ||
              id.includes("prismjs") ||
              id.includes("highlight.js")) &&
            !/[\\/](languages|lang)[\\/]prism[\\/]/.test(id) &&
            !/react-syntax-highlighter[\\/]dist[\\/](esm|cjs)[\\/]languages[\\/]/.test(id) &&
            !/refractor[\\/]lang[\\/]/.test(id) &&
            !/prismjs[\\/]components[\\/]/.test(id)
          ) {
            return "syntax";
          }
          // Keep @tanstack/react-start + start-server-core out of the entry
          // chunk. They pull in `node:async_hooks` (Node-only) and are only
          // reachable through dynamic imports (renderPdf.functions,
          // fxRate.functions). Grouping them with react-query put node:
          // imports in the entry bundle and blocked the app from booting
          // in the browser.
          if (id.includes("@tanstack/react-start") || id.includes("@tanstack/start-")) {
            return "tanstack-start";
          }
          if (id.includes("@tanstack")) return "tanstack";
          if (id.includes("date-fns") || id.includes("dayjs")) return "date";
          if (id.includes("recharts") || id.includes("d3-")) return "charts";
          if (id.includes("hls.js")) return "hls";
          if (id.includes("lenis")) return "lenis";
        },
      },
    },

  },
});

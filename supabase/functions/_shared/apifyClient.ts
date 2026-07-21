/** @doc Shared Apify actor runner: invokes any Apify actor synchronously and returns dataset items. Used for web crawling, website cloning, and content extraction. */
const APIFY_TOKEN = Deno.env.get("APIFY_TOKEN");

export interface ApifyRunOpts {
  actorId: string; // e.g. "apify~website-content-crawler"
  input: Record<string, unknown>;
  timeoutSecs?: number;
  maxItems?: number;
}

export async function runApifyActor<T = any>(opts: ApifyRunOpts): Promise<T[]> {
  if (!APIFY_TOKEN) throw new Error("APIFY_TOKEN not configured");
  const url = `https://api.apify.com/v2/acts/${opts.actorId}/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=${opts.timeoutSecs ?? 60}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts.input),
  });
  if (!res.ok) throw new Error(`Apify ${opts.actorId} failed: ${res.status} ${await res.text()}`);
  const items = (await res.json()) as T[];
  return opts.maxItems ? items.slice(0, opts.maxItems) : items;
}

// === High-level helpers ===

export async function crawlWebsite(url: string, maxPages = 5) {
  return runApifyActor({
    actorId: "apify~website-content-crawler",
    input: { startUrls: [{ url }], maxCrawlPages: maxPages, crawlerType: "playwright:adaptive" },
    maxItems: maxPages,
  });
}

export async function cloneWebsiteAssets(url: string) {
  // Uses cheerio-scraper for fast HTML+CSS extraction
  return runApifyActor({
    actorId: "apify~cheerio-scraper",
    input: {
      startUrls: [{ url }],
      pageFunction: `async function pageFunction(context) {
        const { $, request } = context;
        return {
          url: request.url,
          title: $('title').text(),
          html: $.html(),
          stylesheets: $('link[rel="stylesheet"]').map((_, el) => $(el).attr('href')).get(),
          fonts: $('link[href*="fonts.googleapis"], link[href*="fonts.gstatic"]').map((_, el) => $(el).attr('href')).get(),
          images: $('img').map((_, el) => $(el).attr('src')).get().slice(0, 50),
        };
      }`,
    },
    maxItems: 1,
  });
}

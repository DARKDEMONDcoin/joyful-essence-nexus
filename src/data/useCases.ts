/** @doc Programmatic SEO use-case data: 50+ "AI for X" landing pages at /solutions/<slug>. */

export type UseCase = {
  slug: string;
  title: string;
  intent: string; // search intent / one-liner
  description: string;
  emoji: string;
  category: "build" | "design" | "write" | "image" | "video" | "code" | "marketing" | "ecommerce";
  benefits: string[];
  steps: { title: string; description: string }[];
  faqs: { q: string; a: string }[];
  related?: string[];
};

// Helper to keep entries compact
const u = (
  slug: string,
  emoji: string,
  category: UseCase["category"],
  title: string,
  intent: string,
  description: string,
  benefits: string[],
  steps: [string, string][],
  faqs: [string, string][],
): UseCase => ({
  slug,
  emoji,
  category,
  title,
  intent,
  description,
  benefits,
  steps: steps.map(([title, description]) => ({ title, description })),
  faqs: faqs.map(([q, a]) => ({ q, a })),
});

export const USE_CASES: UseCase[] = [
  // ── BUILD ──────────────────────────────────────────
  u(
    "ai-website-builder",
    "🌐",
    "build",
    "AI Website Builder",
    "Build any website from a single prompt",
    "Describe your idea in plain English or Arabic and get a deployable, multi-page site with real React code in under five minutes.",
    [
      "Generates a full multi-page site from one prompt",
      "Live preview while you iterate",
      "Export production-ready code anytime",
    ],
    [
      ["Describe your idea", "Tell Megsy what you want — restaurant, SaaS, portfolio, anything."],
      ["Refine in chat", "Tweak copy, colors, sections by chatting."],
      ["Publish or export", "One click to publish or download the React code."],
    ],
    [
      ["Do I need to code?", "No. Everything happens in natural language."],
      ["Can I export the code?", "Yes — full React + Tailwind source is yours."],
    ],
  ),

  u(
    "ai-landing-page-generator",
    "🚀",
    "build",
    "AI Landing Page Generator",
    "Create high-converting landing pages with AI",
    "Generate Lighthouse-95+ landing pages with hero, features, social proof, pricing, and CTA blocks tuned for conversion.",
    ["A/B-ready section variants", "Built-in form capture", "Mobile-first by default"],
    [
      ["Pick a goal", "Newsletter, demo, waitlist, app install."],
      ["Generate", "AI writes copy and lays out sections."],
      ["Connect forms", "Pipe leads to email or your CRM."],
    ],
    [
      ["Can I A/B test?", "Yes, duplicate a page and swap copy in seconds."],
      ["Does it integrate with email tools?", "Resend, Mailchimp, ConvertKit, and webhooks."],
    ],
  ),

  u(
    "ai-portfolio-builder",
    "🎨",
    "build",
    "AI Portfolio Builder",
    "Build a stunning portfolio in minutes",
    "Designers, devs, photographers, writers — upload your work, pick a style, and ship a portfolio that wins clients.",
    ["Auto image optimization", "Custom domain", "Case-study templates"],
    [
      ["Upload work", "Drag in images, links, or repos."],
      ["Pick a style", "Editorial, minimal, brutalist, more."],
      ["Publish", "Connect your domain and share."],
    ],
    [
      ["Custom domain?", "Yes, included."],
      ["SEO?", "Per-page meta and sitemap built in."],
    ],
  ),

  u(
    "ai-blog-builder",
    "📝",
    "build",
    "AI Blog Builder",
    "Launch an SEO-optimized blog",
    "A real CMS with rich editor, image generation, scheduling, and per-post SEO meta.",
    ["Markdown + WYSIWYG", "AI draft assist", "RSS + sitemap"],
    [
      ["Pick a layout", "Magazine, personal, tech, newsletter."],
      ["Write or import", "Paste, type, or migrate from Substack/Medium."],
      ["Publish on a schedule", "Future-dated posts go live automatically."],
    ],
    [
      ["Import from Substack?", "Yes via RSS or CSV."],
      ["Newsletter?", "Built-in Resend integration."],
    ],
  ),

  u(
    "ai-saas-website-builder",
    "⚡",
    "build",
    "AI SaaS Website Builder",
    "Build SaaS marketing sites with AI",
    "Hero, pricing, docs, changelog, and integrations — everything a SaaS marketing site needs.",
    ["Pricing tier generator", "Docs with sidebar nav", "Changelog with RSS"],
    [
      ["Describe your product", "Megsy proposes a sitemap."],
      ["Tune sections", "Edit copy and structure in chat."],
      ["Connect Stripe", "Wire up checkout in one click."],
    ],
    [
      ["Stripe ready?", "Yes, with hosted checkout."],
      ["Docs included?", "Yes, with full-text search."],
    ],
  ),

  u(
    "ai-ecommerce-builder",
    "🛒",
    "ecommerce",
    "AI E-commerce Builder",
    "Build an online store with AI",
    "Generate a Shopify-quality storefront with AI product copy, generated lifestyle photos, multi-currency checkout, and abandoned-cart emails.",
    ["AI product descriptions", "Stripe + crypto payments", "Multi-currency"],
    [
      ["Import products", "CSV, Shopify, or manual."],
      ["Generate copy", "AI rewrites every description."],
      ["Launch", "Go live with checkout in minutes."],
    ],
    [
      ["Shopify migration?", "Yes, CSV-based."],
      ["POD providers?", "Printful, Printify supported."],
    ],
  ),

  // ── DESIGN ─────────────────────────────────────────
  u(
    "ai-logo-generator",
    "🔷",
    "design",
    "AI Logo Generator",
    "Generate logos with AI in seconds",
    "Type your brand name and style — get unlimited logo variations powered by FLUX, Imagen, and GPT Image 2.",
    ["Vector-ready exports", "Brand palette suggestions", "Free unlimited variations"],
    [
      ["Type brand name", "And add a vibe word: modern, retro, playful…"],
      ["Generate", "Get 4-12 variations per pass."],
      ["Export", "PNG, SVG, or full brand kit."],
    ],
    [
      ["SVG export?", "Yes, vector-clean."],
      ["Commercial use?", "Yes, on paid plans."],
    ],
  ),

  u(
    "ai-favicon-generator",
    "🟦",
    "design",
    "AI Favicon Generator",
    "Generate favicons with AI",
    "Tiny, sharp favicons that look right at 16px and 512px. Every common format covered.",
    ["16px through 512px", ".ico, .png, .svg", "iOS + Android sizes"],
    [
      ["Type your brand", "Or upload a logo."],
      ["Generate", "AI optimizes for tiny sizes."],
      ["Download bundle", "Plug into any framework."],
    ],
    [
      ["Apple touch icons?", "Yes, included."],
      ["Multiple themes?", "Yes — dark + light variants."],
    ],
  ),

  u(
    "ai-color-palette-generator",
    "🎨",
    "design",
    "AI Color Palette Generator",
    "Generate accessible color palettes",
    "Brand-coherent palettes with contrast checks and HSL tokens ready for Tailwind.",
    ["WCAG AA contrast", "Tailwind-ready", "Light/dark variants"],
    [
      ["Describe vibe", "Cozy, futuristic, luxe, kawaii…"],
      ["Generate", "Get full semantic palette."],
      ["Copy tokens", "HSL, hex, or CSS variables."],
    ],
    [
      ["Accessibility?", "Yes, AA contrast verified."],
      ["Tailwind config?", "Yes, exportable."],
    ],
  ),

  u(
    "ai-mockup-generator",
    "📱",
    "design",
    "AI Mockup Generator",
    "Generate device mockups instantly",
    "Drop a screenshot, get a perfect mockup in any device — iPhone, MacBook, Pixel, Galaxy, browser.",
    ["20+ devices", "Custom backgrounds", "Transparent PNGs"],
    [
      ["Upload screenshot", "Or paste from clipboard."],
      ["Pick a device", "Or let AI pick best fit."],
      ["Download", "PNG ready for marketing."],
    ],
    [
      ["Multi-device scenes?", "Yes, compose multiple devices."],
      ["Hi-res?", "Up to 4K."],
    ],
  ),

  // ── WRITE ──────────────────────────────────────────
  u(
    "ai-copywriter",
    "✍️",
    "write",
    "AI Copywriter",
    "AI copywriting for marketing teams",
    "Conversion-tested headlines, subheads, CTAs, and body copy across 60+ frameworks (AIDA, PAS, 4Us...).",
    ["60+ frameworks", "Tone presets", "Per-page brand voice"],
    [
      ["Paste context", "Brand, product, audience."],
      ["Pick framework", "AIDA, PAS, PASTOR, more."],
      ["Generate variants", "10 versions per request."],
    ],
    [
      ["Brand voice?", "Yes, train it on your past copy."],
      ["Plagiarism?", "Original generation each time."],
    ],
  ),

  u(
    "ai-headline-generator",
    "📰",
    "write",
    "AI Headline Generator",
    "Generate scroll-stopping headlines",
    "Punchy headlines for landing pages, ads, emails, and blog posts — scored for clarity, emotion, and SEO.",
    ["Headline scoring", "Emotion + power-word analysis", "SEO keyword target"],
    [
      ["Topic + audience", "Plus a tone."],
      ["Generate", "12 scored headlines."],
      ["Pick & ship", "Copy with one click."],
    ],
    [
      ["Bulk?", "Yes, paste a list of topics."],
      ["Multilingual?", "28 languages."],
    ],
  ),

  u(
    "ai-product-description-generator",
    "🛍️",
    "write",
    "AI Product Description Generator",
    "Generate SEO product descriptions",
    "Generate hundreds of unique product descriptions at once — perfect for Shopify, WooCommerce, and Amazon listings.",
    ["Bulk CSV", "SEO keyword targeting", "Brand voice"],
    [
      ["Upload CSV", "Or import from Shopify."],
      ["Set tone", "Luxury, fun, technical…"],
      ["Export", "CSV back to your store."],
    ],
    [
      ["Amazon-compliant?", "Yes, character-limit aware."],
      ["Unique per SKU?", "Yes, no duplicates."],
    ],
  ),

  u(
    "ai-email-writer",
    "✉️",
    "write",
    "AI Email Writer",
    "Write better emails faster",
    "Cold outreach, newsletters, transactional, drip — generate emails tuned to your audience.",
    ["Sequence builder", "Subject-line A/B helper", "Spam-trigger checker"],
    [
      ["Pick email type", "Cold, newsletter, drip…"],
      ["Brief", "Audience and goal."],
      ["Generate", "Subject + body, scored."],
    ],
    [
      ["Sequences?", "Yes, multi-step drips."],
      ["CRM export?", "HubSpot, Pipedrive, CSV."],
    ],
  ),

  u(
    "ai-resume-builder",
    "📄",
    "write",
    "AI Resume Builder",
    "Build a hireable resume with AI",
    "ATS-friendly resumes tuned to a specific job description in minutes.",
    ["ATS-safe templates", "JD-targeted bullets", "Cover-letter pair"],
    [
      ["Paste current resume", "Or start from scratch."],
      ["Paste job description", "AI tunes accordingly."],
      ["Export PDF + DOCX", "Plus matching cover letter."],
    ],
    [
      ["ATS-safe?", "Yes, parser-tested."],
      ["Cover letter included?", "Yes, auto-paired."],
    ],
  ),

  u(
    "ai-cover-letter-generator",
    "📑",
    "write",
    "AI Cover Letter Generator",
    "Generate personalized cover letters",
    "One-click cover letters tuned to your resume + the job description.",
    ["Resume-aware", "Tone control", "Multi-language"],
    [
      ["Paste JD", "And upload resume."],
      ["Generate", "AI writes a tailored letter."],
      ["Polish + export", "PDF and DOCX."],
    ],
    [
      ["Length control?", "Short, standard, detailed."],
      ["Multiple variants?", "Yes."],
    ],
  ),

  // ── IMAGE ──────────────────────────────────────────
  u(
    "ai-image-generator",
    "🖼️",
    "image",
    "AI Image Generator",
    "Generate stunning images with AI",
    "Access FLUX 2 Pro/Max, Imagen 4, GPT Image 2, Nano Banana, Seedream, and 20+ image models in one place.",
    ["20+ image models", "Side-by-side compare", "Up to 4K"],
    [
      ["Type a prompt", "Or use a preset."],
      ["Pick a model", "Or let Megsy auto-pick."],
      ["Generate", "1-12 variants per pass."],
    ],
    [
      ["Commercial use?", "Yes on paid plans."],
      ["NSFW?", "Blocked per provider policy."],
    ],
  ),

  u(
    "ai-background-remover",
    "✂️",
    "image",
    "AI Background Remover",
    "Remove image backgrounds instantly",
    "One-click cutouts with hair-perfect edges. Bulk-process up to 100 images.",
    ["Hair-perfect edges", "Bulk mode", "Replace background with AI"],
    [
      ["Upload image(s)", "Single or batch."],
      ["Auto-remove", "Done in seconds."],
      ["Download PNG", "Or replace background."],
    ],
    [
      ["Bulk limit?", "100 images per batch."],
      ["Re-add background?", "Yes, AI-generated or solid."],
    ],
  ),

  u(
    "ai-image-upscaler",
    "🔍",
    "image",
    "AI Image Upscaler",
    "Upscale images up to 4x with AI",
    "Restore detail in low-res images — perfect for old photos, screenshots, and AI generations.",
    ["2x, 4x, 8x", "Face restoration", "No artifacts"],
    [
      ["Upload image", "Up to 50MB."],
      ["Pick scale", "2x to 8x."],
      ["Download", "Sharp HD result."],
    ],
    [
      ["Faces blurry?", "Face restore mode fixes them."],
      ["Limit?", "8x max."],
    ],
  ),

  u(
    "ai-photo-editor",
    "🪄",
    "image",
    "AI Photo Editor",
    "Edit photos with natural language",
    "Type what you want changed — 'make sky sunset', 'remove person on left' — and the AI does it.",
    ["Inpainting", "Object removal", "Style transfer"],
    [
      ["Upload photo", "Or paste URL."],
      ["Type edit", "Plain English/Arabic."],
      ["Generate", "Compare before/after."],
    ],
    [
      ["Inpainting?", "Yes, brush + prompt."],
      ["Free?", "Free tier included."],
    ],
  ),

  u(
    "ai-headshot-generator",
    "👤",
    "image",
    "AI Headshot Generator",
    "Generate professional headshots",
    "Upload 10-20 selfies and get 100+ studio-quality headshots in different styles.",
    ["100+ variants", "Multiple styles", "LinkedIn-ready"],
    [
      ["Upload selfies", "10-20 photos."],
      ["Pick styles", "Corporate, casual, creative…"],
      ["Get headshots", "Ready in 20 minutes."],
    ],
    [
      ["Photo count?", "10-20 minimum for best results."],
      ["Training time?", "About 20 minutes."],
    ],
  ),

  u(
    "ai-thumbnail-maker",
    "🎬",
    "image",
    "AI YouTube Thumbnail Maker",
    "Generate eye-catching YouTube thumbnails",
    "Click-worthy thumbnails with face expressions, bold text, and high contrast — proven CTR boosters.",
    ["Click-tested templates", "Face emotion control", "Brand consistency"],
    [
      ["Title + style", "Genre and vibe."],
      ["Upload face", "Or use stock."],
      ["Generate", "10 thumbnail variants."],
    ],
    [
      ["A/B testing?", "Export multiple to test."],
      ["Channel branding?", "Save brand kit."],
    ],
  ),

  // ── VIDEO ──────────────────────────────────────────
  u(
    "ai-video-generator",
    "🎥",
    "video",
    "AI Video Generator",
    "Generate videos with AI",
    "Veo 3, Kling 2, Sora, Pika, Luma — top text-to-video models in one chat.",
    ["7+ video models", "Up to 10s", "Image-to-video"],
    [
      ["Type prompt", "Or upload reference image."],
      ["Pick model", "Quality vs speed tradeoff."],
      ["Generate", "Wait 30-120 seconds."],
    ],
    [
      ["Audio?", "Veo 3 and Kling 2 include audio."],
      ["Length?", "Up to 10s per clip."],
    ],
  ),

  u(
    "ai-talking-avatar",
    "🗣️",
    "video",
    "AI Talking Avatar Generator",
    "Create talking avatars with AI",
    "Upload a photo + script and get a realistic talking head — perfect for explainers, courses, and ads.",
    ["Lip-sync accuracy", "Voice clone optional", "Multi-language"],
    [
      ["Upload photo", "Or pick a stock avatar."],
      ["Add script", "Or paste audio."],
      ["Render", "MP4 in minutes."],
    ],
    [
      ["Voice clone?", "Yes, ethical consent flow."],
      ["Length cap?", "60s per render."],
    ],
  ),

  u(
    "ai-text-to-speech",
    "🔊",
    "video",
    "AI Text to Speech",
    "Convert text to natural voice",
    "Studio-quality voices in 28 languages — from celebrities-style to brand-trained voices.",
    ["28 languages", "Voice cloning", "SSML control"],
    [
      ["Paste text", "Up to 50k chars."],
      ["Pick a voice", "Or clone yours."],
      ["Download MP3", "Or stream."],
    ],
    [
      ["Voice cloning?", "Yes with consent."],
      ["Commercial use?", "Yes."],
    ],
  ),

  // ── CODE ───────────────────────────────────────────
  u(
    "ai-code-generator",
    "💻",
    "code",
    "AI Code Generator",
    "Generate production-ready code with AI",
    "Claude 4.5, GPT-5, Gemini 2.5 Pro — premier coding models in one chat with file editing.",
    ["Multi-file edits", "Run + test in browser", "Export to GitHub"],
    [
      ["Describe feature", "Plain English."],
      ["AI edits files", "See diff in real time."],
      ["Commit", "Push to GitHub."],
    ],
    [
      ["Frameworks?", "Any — React, Vue, Svelte, Next, Nuxt."],
      ["Git?", "Yes, GitHub integration."],
    ],
  ),

  u(
    "ai-react-component-generator",
    "⚛️",
    "code",
    "AI React Component Generator",
    "Generate React components with AI",
    "Tailwind + shadcn components from a description — drop into any React project.",
    ["TypeScript", "shadcn/ui ready", "Accessible by default"],
    [
      ["Describe component", "Card, form, modal…"],
      ["Generate", "TSX + Tailwind."],
      ["Copy or export", "Drop into your repo."],
    ],
    [
      ["Types?", "Full TypeScript."],
      ["Storybook?", "Optional export."],
    ],
  ),

  u(
    "ai-sql-generator",
    "🗄️",
    "code",
    "AI SQL Generator",
    "Generate SQL queries with AI",
    "Describe what data you need — get the exact query for Postgres, MySQL, BigQuery, or SQLite.",
    ["Schema-aware", "Multi-dialect", "Query optimization"],
    [
      ["Upload schema", "Or paste DDL."],
      ["Describe query", "Plain English."],
      ["Run + optimize", "AI explains the plan."],
    ],
    [
      ["Dialects?", "Postgres, MySQL, SQLite, BigQuery, Snowflake."],
      ["Optimize?", "Yes, explain + suggest indexes."],
    ],
  ),

  u(
    "ai-regex-generator",
    "🔣",
    "code",
    "AI Regex Generator",
    "Generate regular expressions",
    "Describe what to match — get tested, commented regex you can drop into any language.",
    ["Tested examples", "Multi-flavor", "Plain-English explanations"],
    [
      ["Describe match", "What should/shouldn't match."],
      ["Generate", "With test cases."],
      ["Copy", "PCRE, JS, Python flavors."],
    ],
    [
      ["Test cases?", "Yes, included."],
      ["Languages?", "PCRE, JS, Python, Go."],
    ],
  ),

  // ── MARKETING ──────────────────────────────────────
  u(
    "ai-social-media-post-generator",
    "📣",
    "marketing",
    "AI Social Media Post Generator",
    "Generate social posts across all platforms",
    "Twitter, LinkedIn, Instagram, TikTok scripts, threads — generate platform-native posts in one click.",
    ["Per-platform tone", "Hashtag suggestions", "Thread builder"],
    [
      ["Topic + platform", "Pick one or multi."],
      ["Generate", "Per-platform variants."],
      ["Schedule", "Via integrations."],
    ],
    [
      ["Scheduling?", "Via Buffer/Hootsuite integration."],
      ["Hashtags?", "Auto-suggested."],
    ],
  ),

  u(
    "ai-seo-content-writer",
    "📈",
    "marketing",
    "AI SEO Content Writer",
    "Write SEO-optimized articles with AI",
    "Long-form articles with keyword targeting, internal linking, and on-page SEO baked in.",
    ["Keyword targeting", "Outline → draft", "Internal linking"],
    [
      ["Target keyword", "Plus secondary terms."],
      ["Outline", "Edit headings."],
      ["Draft + polish", "AI writes, you edit."],
    ],
    [
      ["Word count?", "Up to 5000 words."],
      ["Plagiarism?", "Originally generated."],
    ],
  ),

  u(
    "ai-meta-description-generator",
    "🔍",
    "marketing",
    "AI Meta Description Generator",
    "Generate meta descriptions in bulk",
    "150-char meta descriptions for every URL — bulk-process sitemaps.",
    ["155-char limit aware", "Bulk CSV", "Multilingual"],
    [
      ["Paste URL or sitemap", "We crawl + extract."],
      ["Generate", "Per-URL meta."],
      ["Export", "CSV ready."],
    ],
    [
      ["Sitemap import?", "Yes."],
      ["Character limits?", "Title 60, meta 155."],
    ],
  ),

  u(
    "ai-ad-copy-generator",
    "💸",
    "marketing",
    "AI Ad Copy Generator",
    "Generate ad copy for Google, Meta, TikTok",
    "Channel-native ad copy: headlines, descriptions, hooks — all within character limits.",
    ["Platform-specific limits", "10+ variants per ad", "Compliance-aware"],
    [
      ["Product + audience", "Pick channels."],
      ["Generate", "Per-channel sets."],
      ["Export", "CSV for Google Ads / Meta Ads."],
    ],
    [
      ["Google Ads compliance?", "Yes, character limits enforced."],
      ["A/B variants?", "10+ per ad."],
    ],
  ),

  u(
    "ai-newsletter-generator",
    "📬",
    "marketing",
    "AI Newsletter Generator",
    "Generate newsletters that get opened",
    "Subject lines, intros, sections, CTAs — pull from any source: blog, RSS, custom briefs.",
    ["RSS-to-newsletter", "Subject-line scoring", "Resend integration"],
    [
      ["Connect source", "Blog or RSS."],
      ["Pick template", "Roundup, deep-dive, news."],
      ["Schedule", "Send via Resend."],
    ],
    [
      ["Resend?", "Yes, one-click."],
      ["Substack import?", "Yes."],
    ],
  ),

  u(
    "ai-press-release-generator",
    "📰",
    "marketing",
    "AI Press Release Generator",
    "Write press releases with AI",
    "AP-style press releases with embargo formatting, quotes, and boilerplate.",
    ["AP style", "Quote integration", "Distribution-ready"],
    [
      ["Announcement details", "What's new and why."],
      ["Generate", "AP-style draft."],
      ["Distribute", "Via PRNewswire or email."],
    ],
    [
      ["AP style?", "Yes, enforced."],
      ["Multiple languages?", "Yes."],
    ],
  ),

  u(
    "ai-instagram-caption-generator",
    "📷",
    "marketing",
    "AI Instagram Caption Generator",
    "Generate Instagram captions that convert",
    "Captions optimized per niche — fitness, food, fashion, travel — with hashtag clusters.",
    ["Niche-aware", "Hashtag clusters", "Emoji intelligence"],
    [
      ["Photo + vibe", "Or just describe it."],
      ["Generate", "5 caption variants."],
      ["Copy + post", "With hashtag block."],
    ],
    [
      ["Hashtag research?", "Yes, niche-tuned."],
      ["Multi-language?", "28 languages."],
    ],
  ),

  u(
    "ai-tweet-generator",
    "🐦",
    "marketing",
    "AI Tweet Generator",
    "Write viral tweets with AI",
    "Hooks, threads, and replies tuned to your niche and voice. With analytics-backed timing.",
    ["Thread builder", "Hook frameworks", "Schedule-ready"],
    [
      ["Topic + voice", "Train on your tweets."],
      ["Generate", "Hooks + threads."],
      ["Schedule", "Via Typefully/Buffer."],
    ],
    [
      ["Voice training?", "Yes, paste 20 tweets."],
      ["Threads?", "Yes, 5-20 tweet threads."],
    ],
  ),

  u(
    "ai-linkedin-post-generator",
    "💼",
    "marketing",
    "AI LinkedIn Post Generator",
    "Write engagement-optimized LinkedIn posts",
    "Storytelling hooks, line breaks, and CTAs tuned for LinkedIn's algorithm.",
    ["Hook frameworks", "Carousel scripts", "Comment-bait CTAs"],
    [
      ["Topic + role", "Founder, marketer, designer…"],
      ["Generate", "5 post variants."],
      ["Schedule", "Via Buffer/Shield."],
    ],
    [
      ["Carousels?", "Yes, with slide scripts."],
      ["Hashtag count?", "3-5 recommended."],
    ],
  ),

  u(
    "ai-tiktok-script-generator",
    "🎵",
    "marketing",
    "AI TikTok Script Generator",
    "Generate viral TikTok scripts",
    "Hook → body → CTA scripts with B-roll directions and trending sound suggestions.",
    ["Hook frameworks", "B-roll cues", "Sound suggestions"],
    [
      ["Niche + topic", "Plus video length."],
      ["Generate", "Scripted scene-by-scene."],
      ["Shoot", "With direction cues."],
    ],
    [
      ["B-roll cues?", "Yes, per scene."],
      ["Sound trends?", "Updated weekly."],
    ],
  ),

  // ── ECOMMERCE extra ────────────────────────────────
  u(
    "ai-shopify-builder",
    "🛍️",
    "ecommerce",
    "AI Shopify Alternative",
    "Build an online store without Shopify",
    "Own your store, your data, your code — at a fraction of Shopify's cost.",
    ["No transaction fees", "Own the code", "Multi-currency Stripe"],
    [
      ["Import products", "Or generate with AI."],
      ["Pick theme", "AI-customized."],
      ["Launch", "Connect domain + payments."],
    ],
    [
      ["Migrate from Shopify?", "Yes, CSV import."],
      ["Apps?", "Built-in for reviews, email, analytics."],
    ],
  ),

  u(
    "ai-print-on-demand-store",
    "👕",
    "ecommerce",
    "AI Print on Demand Store",
    "Launch a print-on-demand store",
    "Connect Printful or Printify, generate designs with AI, ship from day one.",
    ["Printful + Printify", "AI design generation", "Auto-fulfillment"],
    [
      ["Connect POD", "Printful or Printify."],
      ["Generate designs", "Type a vibe."],
      ["Publish", "Auto-sync products."],
    ],
    [
      ["Bulk design?", "Yes, batch generation."],
      ["Fulfillment?", "Hands-off."],
    ],
  ),

  u(
    "ai-dropshipping-store",
    "📦",
    "ecommerce",
    "AI Dropshipping Store Builder",
    "Build a dropshipping store with AI",
    "Import AliExpress or CJ products with AI-rewritten copy and lifestyle photos.",
    ["AliExpress import", "AI rewriting", "Lifestyle photo generation"],
    [
      ["Import products", "From AliExpress/CJ."],
      ["AI rewrites", "Copy + photos."],
      ["Launch", "Connect Stripe + ship."],
    ],
    [
      ["Suppliers?", "AliExpress, CJ, Spocket."],
      ["Branding?", "AI rewrites all listings."],
    ],
  ),
];

// ─── EXTRA USE CASES (Phase 2 expansion) ─────────────
const MORE_USE_CASES: UseCase[] = [
  // BUILD extra
  u(
    "ai-app-builder",
    "📱",
    "build",
    "AI App Builder",
    "Build mobile + web apps with AI",
    "Generate full-stack apps with auth, database, payments — describe it, ship it, scale it.",
    ["Full-stack React + Supabase", "Auth + DB included", "Stripe-ready"],
    [
      ["Describe app", "User flows in plain language."],
      ["AI builds", "Live preview as it codes."],
      ["Publish", "Custom domain in one click."],
    ],
    [
      ["Mobile too?", "PWA-ready out of the box."],
      ["Native iOS/Android?", "Wrap with Capacitor."],
    ],
  ),
  u(
    "ai-form-builder",
    "📋",
    "build",
    "AI Form Builder",
    "Build forms in seconds",
    "Smart forms with validation, conditional logic, and CRM integrations — no Typeform fees.",
    ["Conditional logic", "Stripe + webhooks", "CSV export"],
    [
      ["Describe fields", "Plain text."],
      ["AI generates", "Layout + validation."],
      ["Embed", "Anywhere via iframe."],
    ],
    [
      ["File uploads?", "Yes, up to 100MB."],
      ["Payments?", "Stripe built-in."],
    ],
  ),
  u(
    "ai-quiz-maker",
    "❓",
    "build",
    "AI Quiz Maker",
    "Generate quizzes and assessments",
    "Lead-gen quizzes, personality tests, and certifications — with scoring and email capture.",
    ["Personality + scoring", "Email capture", "Embeddable"],
    [
      ["Topic", "Niche + goal."],
      ["AI generates", "Questions + outcomes."],
      ["Embed", "Share link or iframe."],
    ],
    [
      ["Lead capture?", "Yes, before results."],
      ["Conditional?", "Branching supported."],
    ],
  ),
  u(
    "ai-membership-site",
    "🔐",
    "build",
    "AI Membership Site Builder",
    "Launch a paid membership site",
    "Lock content behind Stripe subscriptions — courses, community, premium articles.",
    ["Tiered access", "Stripe subscriptions", "Drip content"],
    [
      ["Set tiers", "Free, pro, premium."],
      ["Add content", "Lock per tier."],
      ["Launch", "Stripe checkout ready."],
    ],
    [
      ["Drip content?", "Yes, schedule by signup date."],
      ["Communities?", "Discord/Circle integration."],
    ],
  ),
  u(
    "ai-link-in-bio",
    "🔗",
    "build",
    "AI Link in Bio",
    "Linktree alternative with AI",
    "Smart bio pages with built-in analytics, payments, and content monetization.",
    ["Built-in analytics", "Paid links", "Custom domains"],
    [
      ["Add links", "Or import from Linktree."],
      ["AI designs", "Auto-themed."],
      ["Share", "Custom domain ready."],
    ],
    [
      ["Custom domain?", "Yes."],
      ["Payments?", "Tip jar + paid content."],
    ],
  ),
  u(
    "ai-directory-website-builder",
    "🏢",
    "build",
    "AI Directory Website Builder",
    "Build a directory or marketplace",
    "Launch local guides, marketplaces, or niche directories with AI-generated listings.",
    ["Listings CMS", "Search + filters", "Submission forms"],
    [
      ["Pick niche", "Restaurants, SaaS, agencies…"],
      ["Seed listings", "AI generates first 50."],
      ["Open submissions", "Approve + monetize."],
    ],
    [
      ["Monetize?", "Featured listings + ads."],
      ["Search?", "Built-in full-text."],
    ],
  ),
  u(
    "ai-event-website-builder",
    "🎟️",
    "build",
    "AI Event Website Builder",
    "Launch event sites with ticketing",
    "Conferences, weddings, festivals — sites with agenda, speakers, ticketing, and RSVP.",
    ["Stripe ticketing", "RSVP forms", "Speaker pages"],
    [
      ["Event details", "Date, venue, lineup."],
      ["AI builds", "Site + ticketing."],
      ["Launch", "Sell tickets in minutes."],
    ],
    [
      ["Ticket fees?", "0% platform, Stripe only."],
      ["Seating charts?", "Yes."],
    ],
  ),
  u(
    "ai-coming-soon-page",
    "⏳",
    "build",
    "AI Coming Soon Page",
    "Generate launch waitlist pages",
    "Pre-launch waitlist pages with countdown, email capture, and referral viral loops.",
    ["Countdown timers", "Referral viral loop", "Resend integration"],
    [
      ["Product idea", "Name + pitch."],
      ["AI generates", "Hero + form."],
      ["Launch", "Capture waitlist."],
    ],
    [
      ["Referral loop?", "Yes, KickoffLabs-style."],
      ["Notify on launch?", "Auto-email via Resend."],
    ],
  ),
  u(
    "ai-restaurant-website-builder",
    "🍝",
    "build",
    "AI Restaurant Website Builder",
    "Build restaurant sites with AI",
    "Menus, reservations, delivery integrations — restaurant sites that look like Michelin-tier brands.",
    ["Live menu editor", "Reservations + Stripe deposits", "Talabat/UberEats integration"],
    [
      ["Describe restaurant", "Cuisine + vibe."],
      ["AI generates", "Menu + photos + reservations."],
      ["Publish", "Custom domain."],
    ],
    [
      ["Online ordering?", "Yes, native + integrations."],
      ["Multilingual menus?", "Yes, 28 languages."],
    ],
  ),
  u(
    "ai-real-estate-website-builder",
    "🏠",
    "build",
    "AI Real Estate Website Builder",
    "Build real estate sites with AI",
    "Listings, agent profiles, lead capture — perfect for solo agents and boutique brokerages.",
    ["Listing CMS", "Mortgage calculator", "WhatsApp leads"],
    [
      ["Import listings", "CSV or MLS."],
      ["AI builds", "Site + lead forms."],
      ["Publish", "Capture buyers + sellers."],
    ],
    [
      ["IDX support?", "CSV + major MLS feeds."],
      ["CRM?", "Built-in + HubSpot export."],
    ],
  ),

  // WRITE extra
  u(
    "ai-script-writer",
    "🎬",
    "write",
    "AI Script Writer",
    "Write scripts for YouTube, TikTok, ads",
    "Story-driven scripts with hooks, beats, and B-roll cues for any platform.",
    ["Hook-tested templates", "B-roll cues", "Per-platform length"],
    [
      ["Topic + length", "Plus tone."],
      ["Generate", "Hook → body → CTA."],
      ["Export", "Plain text or Final Draft."],
    ],
    [
      ["Final Draft?", "Yes, export ready."],
      ["Multi-language?", "28 languages."],
    ],
  ),
  u(
    "ai-book-writer",
    "📖",
    "write",
    "AI Book Writer",
    "Write a book with AI",
    "Outline, draft, and edit full-length books — fiction, non-fiction, technical, or memoir.",
    ["Chapter-by-chapter", "Style consistency", "Beta-reader mode"],
    [
      ["Concept + outline", "AI helps structure."],
      ["Draft chapters", "Co-write with AI."],
      ["Export", "EPUB, MOBI, PDF."],
    ],
    [
      ["KDP-ready?", "Yes, formatted for Amazon."],
      ["Length?", "Up to 100k words."],
    ],
  ),
  u(
    "ai-essay-writer",
    "📝",
    "write",
    "AI Essay Writer",
    "Write essays with AI assistance",
    "Co-write essays with AI — research, outline, draft, citations.",
    ["MLA/APA citations", "Research mode", "Tone control"],
    [
      ["Topic + format", "MLA, APA, Chicago."],
      ["Outline + draft", "AI assists."],
      ["Polish", "Plagiarism check."],
    ],
    [
      ["Plagiarism check?", "Built-in."],
      ["Citations?", "Auto-formatted."],
    ],
  ),
  u(
    "ai-translator",
    "🌍",
    "write",
    "AI Translator",
    "Translate text into 100+ languages",
    "Context-aware translations that preserve tone, idioms, and formatting.",
    ["100+ languages", "Tone preservation", "Document translation"],
    [
      ["Paste text or upload", "PDF, DOCX, markdown."],
      ["Pick target", "100+ langs."],
      ["Download", "Same format."],
    ],
    [
      ["Document formats?", "PDF, DOCX, MD, HTML."],
      ["Bulk?", "Yes."],
    ],
  ),
  u(
    "ai-summarizer",
    "📄",
    "write",
    "AI Summarizer",
    "Summarize articles, videos, papers",
    "TL;DRs of any document, video, or webpage in seconds.",
    ["YouTube + PDF", "Multiple lengths", "Bullet + prose"],
    [
      ["Paste link or upload", "URL, PDF, MP4."],
      ["Pick length", "Short/medium/long."],
      ["Get summary", "Bullet or prose."],
    ],
    [
      ["Video?", "YouTube + uploaded MP4."],
      ["Languages?", "28."],
    ],
  ),
  u(
    "ai-paraphrasing-tool",
    "🔄",
    "write",
    "AI Paraphrasing Tool",
    "Rewrite text with AI",
    "Rephrase any text — formal, casual, simple, academic — while keeping meaning intact.",
    ["6 tones", "Plagiarism-free", "Bulk"],
    [
      ["Paste text", "Up to 10k words."],
      ["Pick tone", "Formal, casual…"],
      ["Rewrite", "Side-by-side compare."],
    ],
    [
      ["Plagiarism?", "Originally generated."],
      ["Tone?", "6 presets + custom."],
    ],
  ),
  u(
    "ai-grammar-checker",
    "✅",
    "write",
    "AI Grammar Checker",
    "Fix grammar and spelling with AI",
    "Grammarly-quality corrections plus style and clarity suggestions — in 28 languages.",
    ["28 languages", "Style suggestions", "Bulk"],
    [
      ["Paste text", "Or upload doc."],
      ["AI checks", "Grammar + style."],
      ["Accept fixes", "Or review one by one."],
    ],
    [
      ["Languages?", "28."],
      ["Bulk docs?", "Yes."],
    ],
  ),
  u(
    "ai-content-detector",
    "🛡️",
    "write",
    "AI Content Detector",
    "Detect AI-written content",
    "Check if a text was likely written by ChatGPT, Claude, Gemini, or other LLMs.",
    ["Multi-model detection", "Document upload", "API"],
    [
      ["Paste text", "Or upload."],
      ["AI scores", "% AI likelihood."],
      ["Get report", "Per-paragraph breakdown."],
    ],
    [
      ["Accuracy?", "85%+ on long-form."],
      ["API?", "Yes for educators."],
    ],
  ),

  // IMAGE extra
  u(
    "ai-flux-image-generator",
    "🌊",
    "image",
    "FLUX 2 Image Generator",
    "Generate images with FLUX 2",
    "Access FLUX 2 Pro and Max — Black Forest Labs' flagship models — directly in chat.",
    ["FLUX 2 Pro + Max", "Up to 4MP", "Commercial license"],
    [
      ["Prompt", "Plain English/Arabic."],
      ["Pick variant", "Pro or Max."],
      ["Generate", "1-12 at a time."],
    ],
    [
      ["License?", "Commercial on paid."],
      ["API?", "Yes."],
    ],
  ),
  u(
    "ai-imagen-generator",
    "🎯",
    "image",
    "Google Imagen 4 Generator",
    "Generate images with Imagen 4",
    "Google DeepMind's Imagen 4 — best-in-class photorealism and typography.",
    ["Imagen 4 Ultra + Fast", "Accurate text rendering", "4K output"],
    [
      ["Prompt", "Detail-friendly."],
      ["Pick speed", "Ultra or Fast."],
      ["Generate", "Up to 4K."],
    ],
    [
      ["Text accuracy?", "Best in class."],
      ["Commercial?", "Yes."],
    ],
  ),
  u(
    "ai-gpt-image-generator",
    "🟢",
    "image",
    "GPT Image 2 Generator",
    "Generate images with GPT Image 2",
    "OpenAI's GPT Image 2 — strong creative control and editing.",
    ["GPT Image 2", "Image editing", "Multi-reference"],
    [
      ["Prompt or reference", "Up to 4 images."],
      ["Generate or edit", "Smart inpainting."],
      ["Download", "PNG, JPG."],
    ],
    [
      ["Editing?", "Yes, brush + prompt."],
      ["References?", "Up to 4."],
    ],
  ),
  u(
    "ai-nano-banana-generator",
    "🍌",
    "image",
    "Nano Banana Image Generator",
    "Generate images with Nano Banana",
    "Lightning-fast image generation with Google's Nano Banana model.",
    ["Sub-second generation", "Up to 2K", "Cheap credits"],
    [
      ["Prompt", "Fast iteration."],
      ["Generate", "Under 2s per image."],
      ["Refine", "Variations on the fly."],
    ],
    [
      ["Speed?", "Under 2 seconds."],
      ["Quality?", "Production-ready."],
    ],
  ),
  u(
    "ai-seedream-generator",
    "🌸",
    "image",
    "Seedream Image Generator",
    "Generate images with Seedream",
    "ByteDance's Seedream — stunning artistic style and character consistency.",
    ["Artistic style", "Character consistency", "Multi-reference"],
    [
      ["Prompt + style", "Anime, realistic, painterly."],
      ["Generate", "1-8 variants."],
      ["Refine", "Edit + remix."],
    ],
    [
      ["Character consistency?", "Yes, with reference."],
      ["Anime?", "Best-in-class."],
    ],
  ),
  u(
    "ai-image-to-image",
    "🔁",
    "image",
    "AI Image to Image",
    "Transform images with AI",
    "Restyle, edit, or remix any image — change subjects, settings, styles.",
    ["Style transfer", "Object replacement", "Inpainting"],
    [
      ["Upload image", "Plus a prompt."],
      ["AI transforms", "Compare side-by-side."],
      ["Download", "Multiple variants."],
    ],
    [
      ["Style transfer?", "Yes."],
      ["Object swap?", "Yes via prompt."],
    ],
  ),
  u(
    "ai-sticker-maker",
    "🏷️",
    "image",
    "AI Sticker Maker",
    "Generate stickers with AI",
    "WhatsApp, Telegram, and iMessage sticker packs from a prompt.",
    ["Sticker packs", "Transparent PNG", "WhatsApp-ready"],
    [
      ["Theme + style", "Cute, retro, brand."],
      ["Generate pack", "12-24 stickers."],
      ["Export", "WhatsApp pack format."],
    ],
    [
      ["WhatsApp packs?", "Yes, full format."],
      ["Custom faces?", "Yes."],
    ],
  ),
  u(
    "ai-banner-generator",
    "🖼️",
    "image",
    "AI Banner Generator",
    "Generate banners for ads and social",
    "Facebook, Instagram, LinkedIn, Twitter banners — sized perfectly per platform.",
    ["Platform sizes", "Brand kit aware", "Bulk variants"],
    [
      ["Brief + brand", "Logo + colors."],
      ["Pick platforms", "FB, IG, LI, X."],
      ["Generate", "Per-platform sets."],
    ],
    [
      ["Animated?", "Yes, MP4 export."],
      ["Bulk?", "Yes."],
    ],
  ),

  // VIDEO extra
  u(
    "ai-veo-3-generator",
    "🎞️",
    "video",
    "Veo 3 Video Generator",
    "Generate videos with Google Veo 3",
    "Google DeepMind's Veo 3 — cinematic 1080p with native audio.",
    ["Veo 3 + Veo 3 Fast", "Native audio", "Up to 8s"],
    [
      ["Prompt or image", "Optional reference."],
      ["Pick variant", "Quality or Fast."],
      ["Render", "30-90 seconds."],
    ],
    [
      ["Audio?", "Native, lip-synced."],
      ["Length?", "Up to 8s."],
    ],
  ),
  u(
    "ai-kling-generator",
    "🐉",
    "video",
    "Kling 2 Video Generator",
    "Generate videos with Kling 2.5",
    "Kling AI's flagship — 10s shots with audio, lip-sync, and camera control.",
    ["Up to 10s", "Audio + lip-sync", "Camera control"],
    [
      ["Prompt + reference", "Image-to-video supported."],
      ["Pick mode", "Standard or Pro."],
      ["Generate", "1-3 minutes."],
    ],
    [
      ["Camera moves?", "Yes."],
      ["Lip-sync?", "Yes."],
    ],
  ),
  u(
    "ai-sora-alternative",
    "🎥",
    "video",
    "AI Sora Alternative",
    "Best Sora alternatives in one place",
    "Veo 3, Kling 2, Pika, Luma, Runway — best Sora alternatives with broader availability.",
    ["7+ models", "No waitlist", "Pay per use"],
    [
      ["Prompt", "Any niche."],
      ["Pick model", "Quality vs speed."],
      ["Generate", "Compare results."],
    ],
    [
      ["Sora access?", "Limited; alternatives available now."],
      ["Quality?", "Veo 3 + Kling 2 rival Sora."],
    ],
  ),
  u(
    "ai-image-to-video",
    "🎞️",
    "video",
    "AI Image to Video",
    "Turn images into videos with AI",
    "Bring photos to life — perfect for product demos, ads, and social.",
    ["Veo 3, Kling, Luma", "Up to 10s", "Camera control"],
    [
      ["Upload image", "Plus motion prompt."],
      ["Pick model", "By quality/speed."],
      ["Render", "MP4 download."],
    ],
    [
      ["Resolution?", "Up to 1080p."],
      ["Length?", "Up to 10s."],
    ],
  ),
  u(
    "ai-video-editor",
    "✂️",
    "video",
    "AI Video Editor",
    "Edit videos with AI",
    "Auto-cut filler words, generate captions, remove backgrounds — Descript-style editing.",
    ["Auto-captions", "Filler removal", "Background swap"],
    [
      ["Upload video", "MP4, MOV up to 2GB."],
      ["AI edits", "Captions + cuts."],
      ["Export", "MP4 + SRT."],
    ],
    [
      ["Captions?", "Auto, 28 languages."],
      ["Filler words?", "Auto-removed."],
    ],
  ),

  // CODE extra
  u(
    "ai-app-from-figma",
    "🎨",
    "code",
    "Figma to React with AI",
    "Convert Figma designs to React",
    "Upload a Figma file URL — get production-ready React + Tailwind.",
    ["Pixel-perfect output", "Tailwind + shadcn", "Component reuse"],
    [
      ["Paste Figma URL", "Public or shared."],
      ["AI converts", "Per-frame components."],
      ["Export", "React + Tailwind."],
    ],
    [
      ["Pixel-perfect?", "95%+ fidelity."],
      ["Components?", "Auto-detected."],
    ],
  ),
  u(
    "ai-api-generator",
    "🔌",
    "code",
    "AI API Generator",
    "Generate REST + GraphQL APIs",
    "Describe data — get a Supabase-backed REST + GraphQL API with auth and RLS.",
    ["REST + GraphQL", "Auth + RLS", "Docs auto-generated"],
    [
      ["Describe schema", "Tables and relations."],
      ["AI generates", "API + auth."],
      ["Deploy", "Edge-hosted."],
    ],
    [
      ["GraphQL?", "Yes via PostgREST."],
      ["Docs?", "OpenAPI auto-generated."],
    ],
  ),
  u(
    "ai-test-generator",
    "🧪",
    "code",
    "AI Test Generator",
    "Generate unit and E2E tests",
    "Vitest, Jest, Playwright, Cypress — generate tests from source code or specs.",
    ["Vitest + Playwright", "E2E + unit", "Coverage targets"],
    [
      ["Paste source", "Or describe feature."],
      ["Generate tests", "With assertions."],
      ["Run", "In-browser or CI."],
    ],
    [
      ["Coverage?", "Target % configurable."],
      ["E2E?", "Playwright + Cypress."],
    ],
  ),
  u(
    "ai-bug-fixer",
    "🐛",
    "code",
    "AI Bug Fixer",
    "Find and fix bugs with AI",
    "Paste a stack trace — AI explains the bug and patches it.",
    ["Stack trace analysis", "Auto-patch", "Multi-language"],
    [
      ["Paste error", "Stack trace + code."],
      ["AI diagnoses", "Root cause."],
      ["Apply fix", "Diff preview."],
    ],
    [
      ["Languages?", "30+."],
      ["Frameworks?", "All major."],
    ],
  ),
  u(
    "ai-code-translator",
    "🔀",
    "code",
    "AI Code Translator",
    "Translate code between languages",
    "Python → TypeScript, Java → Kotlin, PHP → Go — accurate code translation.",
    ["30+ languages", "Idiomatic output", "Tests included"],
    [
      ["Paste code", "Source language."],
      ["Pick target", "Any language."],
      ["Translate", "With tests."],
    ],
    [
      ["Idiomatic?", "Yes, not just syntax."],
      ["Tests?", "Auto-generated."],
    ],
  ),
  u(
    "ai-docs-generator",
    "📚",
    "code",
    "AI Documentation Generator",
    "Generate API + code docs",
    "Markdown, MDX, JSDoc, OpenAPI — generate docs from your codebase.",
    ["JSDoc + TSDoc", "OpenAPI", "MDX-ready"],
    [
      ["Connect repo", "GitHub URL."],
      ["AI scans", "Functions + types."],
      ["Export docs", "MDX, Markdown, HTML."],
    ],
    [
      ["Repo size?", "Up to 100k LOC."],
      ["Languages?", "All major."],
    ],
  ),

  // MARKETING extra
  u(
    "ai-blog-post-generator",
    "📝",
    "marketing",
    "AI Blog Post Generator",
    "Write SEO blog posts with AI",
    "Long-form blog posts with keyword targeting, internal linking, and schema markup.",
    ["Keyword research", "Internal linking", "Schema markup"],
    [
      ["Topic + keyword", "Plus tone."],
      ["Outline", "Edit headings."],
      ["Draft", "Up to 5000 words."],
    ],
    [
      ["Length?", "Up to 5000 words."],
      ["Schema?", "Auto-generated."],
    ],
  ),
  u(
    "ai-youtube-description-generator",
    "📺",
    "marketing",
    "AI YouTube Description Generator",
    "Write YouTube descriptions with AI",
    "SEO-optimized descriptions with timestamps, links, and hashtags.",
    ["Timestamp auto-detect", "SEO keywords", "Hashtag suggestions"],
    [
      ["Paste transcript", "Or upload video."],
      ["AI generates", "Description + chapters."],
      ["Copy", "Ready to paste."],
    ],
    [
      ["Chapters?", "Auto-detected."],
      ["Length?", "Optimized per niche."],
    ],
  ),
  u(
    "ai-content-calendar",
    "📅",
    "marketing",
    "AI Content Calendar Generator",
    "Generate content calendars",
    "Monthly content calendars for blogs, social, email — keyword-targeted and theme-balanced.",
    ["Per-channel", "Keyword-aligned", "Drag-to-schedule"],
    [
      ["Niche + channels", "Blog, X, IG, LinkedIn."],
      ["Generate", "30/60/90 day plan."],
      ["Export", "CSV or Notion."],
    ],
    [
      ["Notion export?", "Yes."],
      ["Reschedule?", "Drag and drop."],
    ],
  ),
  u(
    "ai-cold-email-generator",
    "❄️",
    "marketing",
    "AI Cold Email Generator",
    "Generate cold outreach emails",
    "Personalized cold emails that pass spam filters and book meetings.",
    ["Spam-trigger avoidance", "Personalization", "Sequence builder"],
    [
      ["Audience + offer", "ICP + value prop."],
      ["Generate", "Subject + 5-step sequence."],
      ["Export", "To Apollo/Lemlist."],
    ],
    [
      ["Personalization?", "Per-lead via CSV."],
      ["Deliverability?", "Spam-checked."],
    ],
  ),
  u(
    "ai-google-ads-generator",
    "🎯",
    "marketing",
    "AI Google Ads Generator",
    "Generate Google Ads copy",
    "Responsive Search Ads with all headline + description variants, within character limits.",
    ["RSA-compliant", "Bulk export", "Negative keyword suggestions"],
    [
      ["Product + keywords", "Plus brand voice."],
      ["Generate RSA", "15 headlines + 4 desc."],
      ["Export", "CSV for Editor."],
    ],
    [
      ["Editor format?", "Yes."],
      ["Keyword pinning?", "Configurable."],
    ],
  ),
  u(
    "ai-facebook-ads-generator",
    "👍",
    "marketing",
    "AI Facebook Ads Generator",
    "Generate Meta ads copy",
    "Facebook + Instagram ad copy with hook frameworks, body, CTA.",
    ["FB + IG copy", "10+ variants", "Compliance-aware"],
    [
      ["Product + audience", "Pixel data optional."],
      ["Generate", "Hook + body + CTA."],
      ["Export", "CSV for Ads Manager."],
    ],
    [
      ["Compliance?", "Meta-policy aware."],
      ["Image specs?", "Auto-checked."],
    ],
  ),
  u(
    "ai-seo-keyword-research",
    "🔑",
    "marketing",
    "AI SEO Keyword Research",
    "Find SEO keywords with AI",
    "Long-tail keyword discovery with volume, difficulty, and intent classification.",
    ["Volume + KD", "Intent classification", "Cluster suggestions"],
    [
      ["Seed keyword", "Plus market."],
      ["AI expands", "100+ long-tail."],
      ["Export", "CSV + clusters."],
    ],
    [
      ["Volume data?", "Yes."],
      ["Clusters?", "Topic clusters built-in."],
    ],
  ),

  // ECOMMERCE extra
  u(
    "ai-amazon-listing-optimizer",
    "📦",
    "ecommerce",
    "AI Amazon Listing Optimizer",
    "Optimize Amazon listings",
    "Title, bullets, A+ content — SEO-optimized for Amazon search and conversions.",
    ["A9 algorithm tuned", "A+ content blocks", "Bulk SKU"],
    [
      ["Paste ASIN or CSV", "Existing or new."],
      ["AI rewrites", "Title + bullets + desc."],
      ["Export", "CSV ready."],
    ],
    [
      ["A+ content?", "Yes, block layouts."],
      ["Multi-marketplace?", "Yes."],
    ],
  ),
  u(
    "ai-etsy-shop-builder",
    "🧶",
    "ecommerce",
    "AI Etsy Shop Optimizer",
    "Optimize Etsy listings with AI",
    "Etsy-tuned titles, tags, and descriptions — proven to boost visibility.",
    ["Etsy SEO", "Tag optimization", "Bulk"],
    [
      ["Connect Etsy", "Or paste listings."],
      ["AI rewrites", "Titles + tags + desc."],
      ["Sync back", "Auto-update Etsy."],
    ],
    [
      ["Etsy API?", "Yes, OAuth."],
      ["Bulk?", "Yes."],
    ],
  ),
  u(
    "ai-product-photo-generator",
    "📸",
    "ecommerce",
    "AI Product Photo Generator",
    "Generate product photos with AI",
    "Lifestyle and studio product shots — no photographer needed.",
    ["Lifestyle scenes", "Pure studio shots", "Bulk variants"],
    [
      ["Upload product", "Single photo."],
      ["Describe scene", "Beach, kitchen, studio…"],
      ["Generate", "10+ variants."],
    ],
    [
      ["Models holding product?", "Yes."],
      ["Multiple angles?", "Yes."],
    ],
  ),
  u(
    "ai-review-generator",
    "⭐",
    "ecommerce",
    "AI Review Response Generator",
    "Reply to reviews with AI",
    "On-brand, empathetic replies to Amazon, Google, Trustpilot, Yelp reviews in seconds.",
    ["Tone control", "Multi-platform", "Bulk replies"],
    [
      ["Connect platform", "Or paste reviews."],
      ["AI replies", "Per-review tone."],
      ["Approve + send", "Or auto-send."],
    ],
    [
      ["Negative reviews?", "Empathetic + de-escalating."],
      ["Languages?", "28."],
    ],
  ),
];

USE_CASES.push(...MORE_USE_CASES);

// Categorize
export const USE_CASE_CATEGORIES = {
  build: "Website Building",
  design: "Design",
  write: "Writing",
  image: "Images",
  video: "Video",
  code: "Code",
  marketing: "Marketing",
  ecommerce: "E-commerce",
} as const;

export const getUseCase = (slug: string) => USE_CASES.find((u) => u.slug === slug);

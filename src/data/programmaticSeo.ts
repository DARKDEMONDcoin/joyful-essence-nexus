/** @doc Programmatic SEO data: industries, competitors, template categories. Drives /for, /compare, /templates routes. */

export type Industry = {
  slug: string;
  name: string;
  nameAr: string;
  emoji: string;
  headline: string;
  subheadline: string;
  painPoints: string[];
  features: { title: string; description: string }[];
  examples: string[];
  faqs: { q: string; a: string }[];
};

export type Competitor = {
  slug: string;
  name: string;
  tagline: string;
  theirStrengths: string[];
  ourStrengths: string[];
  comparison: { feature: string; megsy: string; them: string }[];
  verdict: string;
};

export type TemplateCategory = {
  slug: string;
  name: string;
  nameAr: string;
  description: string;
  emoji: string;
  templates: { title: string; description: string; tags: string[] }[];
  useCases: string[];
};

// ──────────────────────────────────────────────────────────────────────────
// INDUSTRIES — /for/<slug>
// ──────────────────────────────────────────────────────────────────────────
export const INDUSTRIES: Industry[] = [
  {
    slug: "restaurants",
    name: "Restaurants",
    nameAr: "المطاعم",
    emoji: "🍽️",
    headline: "AI Website Builder for Restaurants",
    subheadline:
      "Launch a beautiful restaurant website with online menu, reservations, and delivery integration in minutes — no code, no designer.",
    painPoints: [
      "Outdated menu PDFs that are slow to update",
      "Paying $500+/month to web agencies for basic changes",
      "No mobile-optimized ordering page",
      "Customers can't find your hours or location easily",
    ],
    features: [
      {
        title: "Live Menu Editor",
        description: "Update prices and dishes instantly. Changes reflect in seconds.",
      },
      {
        title: "Online Reservations",
        description: "Built-in booking system with email confirmations.",
      },
      {
        title: "Delivery Integration",
        description: "Connect Uber Eats, DoorDash, and Talabat in one click.",
      },
      {
        title: "Multi-language",
        description: "Auto-translate your menu into Arabic, English, French, and 20+ languages.",
      },
    ],
    examples: ["Fine dining", "Cafés", "Food trucks", "Cloud kitchens", "Bakeries"],
    faqs: [
      {
        q: "Can I update my menu daily?",
        a: "Yes — Megsy AI lets you edit your menu in seconds. Changes go live instantly.",
      },
      {
        q: "Does it support online orders?",
        a: "Yes, you can accept orders directly or integrate with major delivery platforms.",
      },
      {
        q: "How long does it take to launch?",
        a: "Most restaurant sites are live in under 10 minutes.",
      },
    ],
  },
  {
    slug: "real-estate",
    name: "Real Estate Agents",
    nameAr: "العقارات",
    emoji: "🏘️",
    headline: "AI Website Builder for Real Estate Agents",
    subheadline:
      "Showcase listings, capture leads, and close deals faster with a website that does the selling for you.",
    painPoints: [
      "Listings scattered across Zillow, Facebook, and WhatsApp",
      "No central place to qualify leads",
      "Generic IDX sites that look identical to competitors",
    ],
    features: [
      {
        title: "Listing Pages",
        description: "Auto-generated property pages with photos, maps, and virtual tours.",
      },
      {
        title: "Lead Capture Forms",
        description: "Smart forms that route inquiries to the right agent.",
      },
      {
        title: "WhatsApp Integration",
        description: "Let buyers contact you instantly via WhatsApp Business.",
      },
      {
        title: "Mortgage Calculator",
        description: "Built-in tools that keep visitors engaged longer.",
      },
    ],
    examples: ["Independent agents", "Boutique agencies", "Property developers", "Rental managers"],
    faqs: [
      {
        q: "Can I import listings from MLS?",
        a: "Yes, Megsy AI supports CSV import and major MLS feeds.",
      },
      {
        q: "Do I get a CRM?",
        a: "Lead capture is built-in with export to Google Sheets, HubSpot, and more.",
      },
      {
        q: "Is it mobile-friendly?",
        a: "Every site is mobile-first by default — 70%+ of property searches happen on mobile.",
      },
    ],
  },
  {
    slug: "fitness-coaches",
    name: "Fitness Coaches",
    nameAr: "مدربي اللياقة",
    emoji: "💪",
    headline: "AI Website Builder for Fitness Coaches & Personal Trainers",
    subheadline:
      "Sell programs, book sessions, and grow your coaching business with a site built for conversion.",
    painPoints: [
      "Losing clients to clunky DM booking",
      "No way to sell programs at scale",
      "Looking unprofessional vs gym chains",
    ],
    features: [
      {
        title: "Program Storefront",
        description: "Sell PDFs, video courses, and coaching packages directly.",
      },
      {
        title: "Session Booking",
        description: "Clients pick a time slot — payment collected upfront.",
      },
      {
        title: "Transformation Gallery",
        description: "Before/after photos with consent management built-in.",
      },
      { title: "Stripe Payments", description: "Accept payments in 135+ currencies." },
    ],
    examples: [
      "Personal trainers",
      "Yoga instructors",
      "Nutrition coaches",
      "Online fitness brands",
    ],
    faqs: [
      {
        q: "Can I sell digital programs?",
        a: "Yes — upload PDFs or video and Megsy handles delivery, payments, and access.",
      },
      {
        q: "Does it integrate with Calendly?",
        a: "Yes, plus built-in booking if you prefer not to use Calendly.",
      },
      {
        q: "Can clients log in to see progress?",
        a: "Yes, with a client portal that includes program access and check-ins.",
      },
    ],
  },
  {
    slug: "ecommerce",
    name: "E-commerce Stores",
    nameAr: "المتاجر الإلكترونية",
    emoji: "🛒",
    headline: "AI Website Builder for E-commerce",
    subheadline:
      "Launch a high-converting store with AI-generated product copy, photos, and a checkout that doesn't lose sales.",
    painPoints: [
      "Shopify themes that look identical to competitors",
      "Slow product page load times",
      "Writing 100s of product descriptions manually",
    ],
    features: [
      {
        title: "AI Product Descriptions",
        description: "Generate compelling copy for every SKU in seconds.",
      },
      {
        title: "Smart Image Editor",
        description: "Remove backgrounds, enhance lighting, generate lifestyle shots.",
      },
      {
        title: "Multi-currency Checkout",
        description: "Sell globally with auto-converted prices.",
      },
      { title: "Stripe & PayPal", description: "Major gateways pre-integrated." },
    ],
    examples: ["DTC brands", "Print on demand", "Fashion boutiques", "Beauty stores", "Home goods"],
    faqs: [
      { q: "Can I migrate from Shopify?", a: "Yes — import products via CSV." },
      {
        q: "What about shipping?",
        a: "Configure shipping zones, rates, and carrier integrations.",
      },
      { q: "Does it handle taxes?", a: "Automatic tax calculation for major regions." },
    ],
  },
  {
    slug: "saas-startups",
    name: "SaaS Startups",
    nameAr: "شركات SaaS",
    emoji: "🚀",
    headline: "AI Website Builder for SaaS Startups",
    subheadline:
      "Ship a conversion-optimized landing page, docs site, and changelog in one afternoon.",
    painPoints: [
      "Generic Framer templates everyone uses",
      "Slow Webflow load times killing SEO",
      "Engineering time wasted on marketing pages",
    ],
    features: [
      { title: "Landing + Pricing", description: "A/B-tested page structures proven to convert." },
      { title: "Docs Generator", description: "Auto-generate documentation from your README." },
      { title: "Changelog", description: "Beautiful release notes that users actually read." },
      { title: "Blog with SEO", description: "Schema markup, sitemaps, and OG tags built-in." },
    ],
    examples: ["Pre-seed startups", "Solo founders", "Indie hackers", "B2B SaaS"],
    faqs: [
      {
        q: "Can I self-host?",
        a: "Publish to your custom domain on Lovable's CDN, or export the code.",
      },
      { q: "How fast are the sites?", a: "Lighthouse scores 95+ out of the box." },
      { q: "Does it support i18n?", a: "Yes, 28 languages built-in." },
    ],
  },
  {
    slug: "law-firms",
    name: "Law Firms",
    nameAr: "مكاتب المحاماة",
    emoji: "⚖️",
    headline: "AI Website Builder for Law Firms",
    subheadline:
      "Build credibility and capture qualified leads with a website that reflects the prestige of your practice.",
    painPoints: [
      "Stuffy templates that scream 1998",
      "No case study or testimonial system",
      "Hard to update attorney bios",
    ],
    features: [
      {
        title: "Practice Area Pages",
        description: "Dedicated pages for each service — great for SEO.",
      },
      {
        title: "Attorney Profiles",
        description: "Polished bios with credentials, cases, and contact.",
      },
      { title: "Consultation Forms", description: "Pre-qualify leads with smart intake forms." },
      { title: "Blog & Insights", description: "Publish legal articles that rank on Google." },
    ],
    examples: ["Solo attorneys", "Boutique firms", "Corporate law", "Family law", "Immigration"],
    faqs: [
      {
        q: "Is it compliant with bar advertising rules?",
        a: "Templates are designed neutrally — review with your bar association.",
      },
      { q: "Can I add multiple attorneys?", a: "Yes, unlimited team members and profiles." },
      { q: "GDPR compliant?", a: "Yes, with cookie consent and data export tools." },
    ],
  },
  {
    slug: "consultants",
    name: "Consultants",
    nameAr: "المستشارين",
    emoji: "💼",
    headline: "AI Website Builder for Consultants",
    subheadline:
      "Position yourself as the expert. Sell discovery calls, packages, and retainers from a single page.",
    painPoints: [
      "LinkedIn isn't converting",
      "No clear way to book a call",
      "Pricing pages that scare clients away",
    ],
    features: [
      {
        title: "Service Packages",
        description: "Display tiers with clear deliverables and pricing.",
      },
      { title: "Calendar Booking", description: "Embedded scheduling — no more email tag." },
      { title: "Case Studies", description: "Show your impact with before/after metrics." },
      { title: "Newsletter Signup", description: "Build a list of warm leads." },
    ],
    examples: [
      "Management consultants",
      "Marketing strategists",
      "HR advisors",
      "Tech consultants",
    ],
    faqs: [
      {
        q: "Can I integrate Stripe for retainers?",
        a: "Yes, with subscriptions and one-time payments.",
      },
      {
        q: "Does it have a client portal?",
        a: "Yes — share docs, schedules, and updates privately.",
      },
      { q: "Calendly compatible?", a: "Yes, or use the native booking system." },
    ],
  },
  {
    slug: "photographers",
    name: "Photographers",
    nameAr: "المصورين",
    emoji: "📸",
    headline: "AI Website Builder for Photographers",
    subheadline: "Stunning portfolios, client galleries, and print sales — all in one platform.",
    painPoints: [
      "Squarespace limits and price hikes",
      "Slow image loading on portfolios",
      "No private client galleries",
    ],
    features: [
      {
        title: "Portfolio Galleries",
        description: "Drag-and-drop, with automatic image optimization.",
      },
      { title: "Client Proofing", description: "Private galleries with favorites and download." },
      { title: "Print Sales", description: "Sell prints and digital files with watermarks." },
      { title: "Booking & Contracts", description: "Calendar plus PDF contract signing." },
    ],
    examples: ["Wedding photographers", "Portrait studios", "Commercial", "Wildlife", "Travel"],
    faqs: [
      { q: "How many photos can I upload?", a: "Unlimited storage on Pro plans." },
      { q: "Do you watermark?", a: "Yes, automatic watermarking on previews." },
      { q: "Mobile gallery?", a: "Yes, optimized for phone viewing." },
    ],
  },
  {
    slug: "podcasters",
    name: "Podcasters",
    nameAr: "صانعي البودكاست",
    emoji: "🎙️",
    headline: "AI Website Builder for Podcasters",
    subheadline: "A home for your show: episodes, transcripts, sponsors, and listener community.",
    painPoints: [
      "Anchor.fm pages look generic",
      "No SEO from audio-only platforms",
      "Sponsors want a real website",
    ],
    features: [
      { title: "Episode Player", description: "Embedded player with show notes and chapters." },
      { title: "Auto Transcripts", description: "AI-generated transcripts — great for SEO." },
      { title: "Sponsor Pages", description: "Dedicated landing pages for each sponsor." },
      {
        title: "Subscribe Buttons",
        description: "Apple, Spotify, Google, YouTube all in one tap.",
      },
    ],
    examples: ["Interview shows", "Solo podcasts", "Network shows", "Niche content"],
    faqs: [
      {
        q: "Does it host audio?",
        a: "Embed from your existing host (Anchor, Buzzsprout, Transistor).",
      },
      { q: "Transcript accuracy?", a: "95%+ for clear audio, editable inline." },
      { q: "RSS auto-update?", a: "Yes, new episodes appear automatically." },
    ],
  },
  {
    slug: "nonprofits",
    name: "Nonprofits",
    nameAr: "المنظمات غير الربحية",
    emoji: "❤️",
    headline: "AI Website Builder for Nonprofits & Charities",
    subheadline:
      "Tell your story, accept donations, and recruit volunteers — built for impact, not budget.",
    painPoints: [
      "Limited tech budget",
      "Volunteer-built sites that break",
      "No way to accept recurring donations",
    ],
    features: [
      {
        title: "Donation Pages",
        description: "One-time and recurring, with tax receipt automation.",
      },
      { title: "Volunteer Signup", description: "Forms with shift scheduling and reminders." },
      { title: "Impact Reports", description: "Annual reports as interactive web pages." },
      { title: "Event Pages", description: "Galas, fundraisers, awareness campaigns." },
    ],
    examples: ["Local charities", "International NGOs", "Religious organizations", "Foundations"],
    faqs: [
      { q: "Free for nonprofits?", a: "Yes — verified 501(c)(3) and equivalents get Pro free." },
      { q: "Stripe nonprofit pricing?", a: "We help you apply for Stripe's 2.2% nonprofit rate." },
      { q: "Multi-language?", a: "Yes, 28 languages." },
    ],
  },
  {
    slug: "schools",
    name: "Schools & Tutors",
    nameAr: "المدارس والمعلمين",
    emoji: "🎓",
    headline: "AI Website Builder for Schools, Academies & Tutors",
    subheadline: "Course catalogs, enrollment forms, parent portals — built for education.",
    painPoints: [
      "Outdated school websites from 2010",
      "No online enrollment",
      "Hard to communicate with parents",
    ],
    features: [
      { title: "Course Catalog", description: "Subjects, schedules, fees in one place." },
      { title: "Enrollment Forms", description: "Online applications with document upload." },
      { title: "Staff Directory", description: "Teacher profiles with photos and bios." },
      { title: "News & Events", description: "Keep parents in the loop." },
    ],
    examples: [
      "Private schools",
      "Language academies",
      "Online tutors",
      "Universities",
      "Bootcamps",
    ],
    faqs: [
      { q: "Can parents log in?", a: "Yes, with a parent portal for grades and announcements." },
      { q: "Online classes?", a: "Embed Zoom, Google Meet, or use built-in video." },
      { q: "Accept tuition payments?", a: "Stripe and bank transfer supported." },
    ],
  },
  {
    slug: "barbers-salons",
    name: "Barbers & Salons",
    nameAr: "الحلاقين والصالونات",
    emoji: "💈",
    headline: "AI Website Builder for Barbershops & Salons",
    subheadline: "Online bookings, service menus, and gallery — turn walk-ins into regulars.",
    painPoints: [
      "Lost bookings via Instagram DM chaos",
      "No-shows from forgotten appointments",
      "Hard to display price list",
    ],
    features: [
      { title: "Online Booking", description: "24/7 appointment scheduling with deposits." },
      { title: "Service Menu", description: "Prices, durations, and add-ons clearly displayed." },
      { title: "Photo Gallery", description: "Showcase haircuts, styling, and transformations." },
      { title: "SMS Reminders", description: "Cut no-shows by 60% with automated reminders." },
    ],
    examples: ["Barbershops", "Hair salons", "Nail studios", "Spa centers", "Brow bars"],
    faqs: [
      { q: "Can clients pay deposits?", a: "Yes, customize per service." },
      { q: "Multiple barbers?", a: "Yes, each with their own calendar." },
      { q: "Loyalty program?", a: "Built-in punch cards and rewards." },
    ],
  },
  {
    slug: "freelancers",
    name: "Freelancers",
    nameAr: "العاملين المستقلين",
    emoji: "💻",
    headline: "AI Website Builder for Freelancers",
    subheadline: "A portfolio that actually wins clients. Built in an hour, lasts you years.",
    painPoints: [
      "Behance/Dribbble doesn't convert to paid work",
      "Upwork takes 10%+",
      "Generic Linktree-style pages",
    ],
    features: [
      {
        title: "Project Showcase",
        description: "Case studies with results, not just screenshots.",
      },
      { title: "Service Packages", description: "Productize your offering with clear pricing." },
      { title: "Client Testimonials", description: "Video and written, with verification." },
      { title: "Inquiry Form", description: "Pre-qualify leads with budget and scope questions." },
    ],
    examples: ["Designers", "Developers", "Writers", "Marketers", "Video editors"],
    faqs: [
      { q: "Can I sell digital products?", a: "Yes, with instant delivery and Stripe." },
      { q: "Portfolio password protection?", a: "Yes, for NDA work." },
      { q: "Custom domain?", a: "Yes, on all paid plans." },
    ],
  },
  {
    slug: "events",
    name: "Event Planners",
    nameAr: "منظمي المناسبات",
    emoji: "🎉",
    headline: "AI Website Builder for Event Planners & Venues",
    subheadline:
      "Showcase past events, accept inquiries, and sell tickets — all from one stunning site.",
    painPoints: [
      "No central place to show past work",
      "Eventbrite fees eat into margins",
      "Inquiry forms get lost in inbox",
    ],
    features: [
      {
        title: "Event Gallery",
        description: "Past weddings, conferences, parties beautifully organized.",
      },
      {
        title: "Ticket Sales",
        description: "Lower fees than Eventbrite, your branding throughout.",
      },
      { title: "Venue Pages", description: "Capacity, amenities, virtual tours." },
      { title: "RSVP Forms", description: "Private RSVPs with dietary restrictions and notes." },
    ],
    examples: ["Wedding planners", "Corporate events", "Wedding venues", "Conference organizers"],
    faqs: [
      { q: "Ticket fees?", a: "0% platform fee on Pro, just Stripe's processing." },
      { q: "Seating charts?", a: "Yes, for ticketed events." },
      { q: "Vendor portal?", a: "Coming soon." },
    ],
  },
  {
    slug: "doctors-clinics",
    name: "Doctors & Clinics",
    nameAr: "الأطباء والعيادات",
    emoji: "🩺",
    headline: "AI Website Builder for Doctors, Dentists & Clinics",
    subheadline:
      "Patient-friendly appointments, service info, and trust signals that bring in new bookings.",
    painPoints: [
      "Patients can't book online",
      "Outdated info about services and insurance",
      "No way to show patient reviews",
    ],
    features: [
      {
        title: "Appointment Booking",
        description: "HIPAA-conscious forms with calendar integration.",
      },
      { title: "Doctor Bios", description: "Credentials, specialties, languages spoken." },
      { title: "Insurance Info", description: "List accepted plans clearly." },
      { title: "Patient Reviews", description: "Display Google and Healthgrades reviews." },
    ],
    examples: ["General practice", "Dental clinics", "Specialists", "Veterinary"],
    faqs: [
      {
        q: "Is it HIPAA compliant?",
        a: "Forms can be configured for compliance; consult your compliance officer.",
      },
      { q: "Multiple locations?", a: "Yes, with location-specific hours and services." },
      { q: "Multi-language?", a: "Yes — important for diverse patient populations." },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────────
// COMPETITORS — /compare/megsy-vs-<slug>
// ──────────────────────────────────────────────────────────────────────────
export const COMPETITORS: Competitor[] = [
  {
    slug: "wix",
    name: "Wix",
    tagline: "The classic drag-and-drop website builder",
    theirStrengths: ["Large template library", "Brand recognition", "Mature app marketplace"],
    ourStrengths: [
      "AI builds the entire site from a prompt — no dragging",
      "Modern, fast code output (95+ Lighthouse)",
      "Built-in i18n for 28 languages",
      "Export your code anytime — no lock-in",
    ],
    comparison: [
      { feature: "AI site generation", megsy: "Full site from prompt", them: "Wix ADI (limited)" },
      { feature: "Page speed", megsy: "95+ Lighthouse", them: "60-75 avg" },
      { feature: "Code export", megsy: "Yes, full React code", them: "No" },
      { feature: "Languages", megsy: "28 built-in", them: "Paid add-on" },
      { feature: "Starting price", megsy: "Free, then $20/mo", them: "$17/mo" },
    ],
    verdict:
      "Wix is great for non-technical users who want drag-and-drop. Megsy AI is faster, more modern, and lets you escape with your code if you ever outgrow it.",
  },
  {
    slug: "squarespace",
    name: "Squarespace",
    tagline: "Design-led website builder",
    theirStrengths: ["Beautiful default templates", "Polished editor", "Good for creatives"],
    ourStrengths: [
      "AI generation in minutes vs hours of customization",
      "Real code you can take with you",
      "Better performance scores",
      "Active development with new features weekly",
    ],
    comparison: [
      { feature: "Build time", megsy: "Minutes", them: "Hours to days" },
      {
        feature: "AI assistant",
        megsy: "Native, builds whole site",
        them: "Limited content suggestions",
      },
      { feature: "Code access", megsy: "Full export", them: "Code injection only" },
      { feature: "Starting price", megsy: "Free, then $20/mo", them: "$16/mo" },
    ],
    verdict:
      "Squarespace wins on out-of-the-box aesthetics. Megsy AI wins on speed, flexibility, and not being locked in.",
  },
  {
    slug: "webflow",
    name: "Webflow",
    tagline: "Visual development for designers",
    theirStrengths: ["Pixel-perfect control", "CMS for designers", "Strong community"],
    ourStrengths: [
      "No learning curve — describe what you want",
      "Generates production React code, not Webflow's HTML",
      "Faster builds and cheaper hosting",
      "Built-in AI for content, images, and translations",
    ],
    comparison: [
      { feature: "Learning curve", megsy: "None — chat with AI", them: "Steep (1-3 months)" },
      { feature: "Output", megsy: "React/Vite", them: "Webflow-hosted HTML" },
      { feature: "CMS", megsy: "Supabase-backed", them: "Webflow CMS (item limits)" },
      { feature: "Starting price", megsy: "Free, then $20/mo", them: "$18/mo CMS" },
    ],
    verdict:
      "Webflow is unmatched for designers who want pixel control. Megsy AI is unmatched for everyone else who just wants a great site shipped today.",
  },
  {
    slug: "framer",
    name: "Framer",
    tagline: "Design-first site builder for startups",
    theirStrengths: ["Animation tools", "Designer-friendly", "Clean templates"],
    ourStrengths: [
      "AI generates content, not just layout",
      "Real backend with auth, database, payments",
      "Better SEO setup out of the box",
      "Multilingual without paid plugins",
    ],
    comparison: [
      { feature: "Backend", megsy: "Full Supabase backend", them: "Forms only" },
      { feature: "Auth", megsy: "Built-in", them: "External tools" },
      { feature: "AI", megsy: "Builds whole pages", them: "Copy suggestions" },
      { feature: "Starting price", megsy: "Free, then $20/mo", them: "$15/mo" },
    ],
    verdict:
      "Framer is perfect for marketing sites that need animation flair. Megsy AI is the better pick when you also need backend functionality.",
  },
  {
    slug: "bubble",
    name: "Bubble",
    tagline: "No-code app builder",
    theirStrengths: ["Complex app logic", "Mature plugin ecosystem", "Big community"],
    ourStrengths: [
      "Real code output (not proprietary)",
      "Sites load 5-10x faster",
      "Modern React stack vs Bubble's legacy engine",
      "AI handles UI design, not just data",
    ],
    comparison: [
      { feature: "Output", megsy: "React + Vite", them: "Bubble runtime" },
      { feature: "Page speed", megsy: "Very fast", them: "Often slow" },
      { feature: "Code export", megsy: "Yes", them: "No" },
      { feature: "Starting price", megsy: "Free, then $20/mo", them: "$32/mo" },
    ],
    verdict:
      "Bubble suits very complex internal tools. Megsy AI is faster, cheaper, and gives you real code for everything else.",
  },
  {
    slug: "wordpress",
    name: "WordPress",
    tagline: "The world's most-used CMS",
    theirStrengths: ["Massive plugin ecosystem", "Self-hostable", "SEO plugins"],
    ourStrengths: [
      "Zero maintenance vs constant WP updates",
      "No plugin conflicts or security holes",
      "Built-in AI for content and design",
      "Modern stack instead of PHP",
    ],
    comparison: [
      { feature: "Maintenance", megsy: "Zero", them: "Weekly updates" },
      { feature: "Security", megsy: "Managed", them: "DIY hardening" },
      { feature: "Speed", megsy: "Fast out of box", them: "Needs heavy caching" },
      { feature: "Starting price", megsy: "Free, then $20/mo", them: "Hosting + plugins" },
    ],
    verdict:
      "WordPress wins if you want plugins for everything. Megsy AI wins if you want it to just work — without becoming a part-time sysadmin.",
  },
  {
    slug: "shopify",
    name: "Shopify",
    tagline: "Dedicated e-commerce platform",
    theirStrengths: ["Mature e-commerce features", "App store", "Reliable checkout"],
    ourStrengths: [
      "Cheaper for stores under 100 SKUs",
      "Custom design without paying for themes",
      "AI-generated product copy and images",
      "Integrated marketing pages and blog",
    ],
    comparison: [
      { feature: "Best for", megsy: "Small/mid stores", them: "Large stores" },
      { feature: "Design freedom", megsy: "AI-customized", them: "Theme-limited" },
      { feature: "App fees", megsy: "Mostly built-in", them: "Stacks up fast" },
      { feature: "Starting price", megsy: "Free, then $20/mo", them: "$29/mo + apps" },
    ],
    verdict:
      "Shopify is the gold standard at scale. For new stores and brands building under 100 SKUs, Megsy AI is faster and cheaper.",
  },
  {
    slug: "carrd",
    name: "Carrd",
    tagline: "Simple one-page sites",
    theirStrengths: ["Dead simple", "Very cheap", "Fast for landing pages"],
    ourStrengths: [
      "Multi-page sites, not just one",
      "AI generation instead of manual blocks",
      "Real CMS for blog/products",
      "Multilingual out of the box",
    ],
    comparison: [
      { feature: "Pages", megsy: "Unlimited", them: "Limited (Pro: more)" },
      { feature: "CMS", megsy: "Yes", them: "No" },
      { feature: "AI", megsy: "Yes", them: "No" },
      { feature: "Starting price", megsy: "Free, then $20/mo", them: "$9/yr" },
    ],
    verdict:
      "Carrd is unbeatable for a $9/yr one-pager. Megsy AI is the right step up the moment you need a real site.",
  },
  {
    slug: "v0",
    name: "v0.dev",
    tagline: "Vercel's AI UI generator",
    theirStrengths: ["Strong component generation", "Vercel ecosystem", "Great for developers"],
    ourStrengths: [
      "Builds whole apps, not just components",
      "Includes backend, auth, payments",
      "Works for non-developers too",
      "Publishable in one click",
    ],
    comparison: [
      { feature: "Scope", megsy: "Full apps + sites", them: "Components/pages" },
      { feature: "Backend", megsy: "Supabase included", them: "DIY" },
      { feature: "Audience", megsy: "Builders + non-coders", them: "Developers" },
      { feature: "Starting price", megsy: "Free, then $20/mo", them: "$20/mo" },
    ],
    verdict:
      "v0 is excellent if you're a developer wanting AI-generated React components. Megsy AI is broader — it ships the whole product.",
  },
  {
    slug: "bolt-new",
    name: "Bolt.new",
    tagline: "AI full-stack app builder",
    theirStrengths: ["In-browser dev environment", "WebContainer power", "Quick prototypes"],
    ourStrengths: [
      "Managed hosting and database — no setup",
      "Mature publishing, custom domains, SSL",
      "Built-in marketing tools (SEO, i18n, analytics)",
      "Larger model selection (Claude, Gemini, Qwen, GPT)",
    ],
    comparison: [
      { feature: "Hosting", megsy: "One-click + custom domain", them: "Bring your own" },
      { feature: "DB / Auth", megsy: "Built-in", them: "Connect manually" },
      { feature: "Models", megsy: "10+ providers", them: "Limited" },
      { feature: "Starting price", megsy: "Free, then $20/mo", them: "$20/mo" },
    ],
    verdict:
      "Bolt is great for technical prototyping in-browser. Megsy AI gets you all the way to a shipped, hosted product without the DevOps work.",
  },
  {
    slug: "lovable",
    name: "Lovable",
    tagline: "AI app builder (Megsy's platform partner)",
    theirStrengths: ["Mature AI builder", "Big community", "Strong code output"],
    ourStrengths: [
      "Same core engine, plus marketing-first templates",
      "MENA-focused localization and payment options",
      "Pre-built industry verticals",
      "Free credits for new builders",
    ],
    comparison: [
      { feature: "Core engine", megsy: "Shared Lovable platform", them: "Same" },
      { feature: "MENA focus", megsy: "Arabic-first, local payments", them: "Global generic" },
      { feature: "Templates", megsy: "Industry-specific", them: "General-purpose" },
      { feature: "Starting price", megsy: "Free, then $20/mo", them: "$20/mo" },
    ],
    verdict:
      "Megsy AI builds on Lovable's engine with a focus on MENA markets, Arabic, and industry-ready templates. Use whichever fits your audience.",
  },
  {
    slug: "cursor",
    name: "Cursor",
    tagline: "AI-first code editor",
    theirStrengths: ["IDE-level AI", "Powerful for developers", "Local file control"],
    ourStrengths: [
      "No setup — runs entirely in browser",
      "Includes hosting and database",
      "For non-developers too",
      "Visual preview as you build",
    ],
    comparison: [
      { feature: "Setup", megsy: "None", them: "Install + configure" },
      { feature: "Hosting", megsy: "Built-in", them: "DIY" },
      { feature: "Audience", megsy: "Anyone", them: "Developers" },
      { feature: "Starting price", megsy: "Free, then $20/mo", them: "$20/mo" },
    ],
    verdict:
      "Cursor is unmatched as a coding IDE. Megsy AI is the product-shipping tool for everyone who doesn't want to manage an IDE.",
  },
];

// ──────────────────────────────────────────────────────────────────────────
// TEMPLATE CATEGORIES — /templates/<slug>
// ──────────────────────────────────────────────────────────────────────────
export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    slug: "landing-pages",
    name: "Landing Page Templates",
    nameAr: "صفحات الهبوط",
    emoji: "🚀",
    description: "High-converting landing pages for product launches, lead magnets, and campaigns.",
    templates: [
      {
        title: "SaaS Hero",
        description: "Bold gradient hero with feature grid and pricing.",
        tags: ["SaaS", "Modern"],
      },
      {
        title: "App Launch",
        description: "Mobile mockups, App Store buttons, and testimonials.",
        tags: ["Mobile", "Startup"],
      },
      {
        title: "Webinar Signup",
        description: "Countdown timer, speaker bios, and registration form.",
        tags: ["Event"],
      },
      {
        title: "Newsletter",
        description: "Single-input signup with social proof.",
        tags: ["Minimal"],
      },
      {
        title: "Product Hunt Launch",
        description: "Optimized for launch day traffic spikes.",
        tags: ["Launch"],
      },
    ],
    useCases: ["Lead generation", "Product launches", "Email signups", "Webinar registration"],
  },
  {
    slug: "portfolio",
    name: "Portfolio Templates",
    nameAr: "البورتفوليو",
    emoji: "🎨",
    description:
      "Showcase your work — for designers, developers, writers, photographers, and creatives.",
    templates: [
      {
        title: "Designer Portfolio",
        description: "Image-heavy grid with case study pages.",
        tags: ["Design"],
      },
      {
        title: "Developer Portfolio",
        description: "Project cards with GitHub links and tech stack.",
        tags: ["Dev"],
      },
      {
        title: "Photographer",
        description: "Full-bleed galleries with lightbox.",
        tags: ["Photo"],
      },
      {
        title: "Writer Portfolio",
        description: "Clean typography for clips and essays.",
        tags: ["Writing"],
      },
      {
        title: "Minimal Resume",
        description: "One-page CV with sections for experience and skills.",
        tags: ["Minimal", "Resume"],
      },
    ],
    useCases: ["Freelance work", "Job applications", "Showing case studies", "Personal branding"],
  },
  {
    slug: "ecommerce",
    name: "E-commerce Templates",
    nameAr: "المتاجر الإلكترونية",
    emoji: "🛒",
    description: "Online store templates with product catalogs, cart, and checkout flows.",
    templates: [
      {
        title: "Fashion Boutique",
        description: "Editorial-style product grid with lookbook.",
        tags: ["Fashion"],
      },
      {
        title: "Tech Store",
        description: "Comparison-friendly cards for electronics.",
        tags: ["Tech"],
      },
      {
        title: "Single Product",
        description: "Long-form landing for one hero product.",
        tags: ["DTC"],
      },
      {
        title: "Subscription Box",
        description: "Plan tiers with delivery scheduling.",
        tags: ["Subscription"],
      },
      {
        title: "Print on Demand",
        description: "Catalog-style with variant pickers.",
        tags: ["POD"],
      },
    ],
    useCases: ["DTC brands", "Print on demand", "Subscription products", "Niche stores"],
  },
  {
    slug: "blogs",
    name: "Blog Templates",
    nameAr: "المدونات",
    emoji: "✍️",
    description: "Content-first templates optimized for reading and SEO.",
    templates: [
      {
        title: "Magazine Layout",
        description: "Featured story plus category grid.",
        tags: ["Magazine"],
      },
      {
        title: "Personal Blog",
        description: "Reverse-chronological with author bio.",
        tags: ["Personal"],
      },
      {
        title: "Tech Blog",
        description: "Code-friendly with syntax highlighting.",
        tags: ["Tech"],
      },
      {
        title: "Newsletter Blog",
        description: "Substack-style with signup CTA.",
        tags: ["Newsletter"],
      },
    ],
    useCases: ["Content marketing", "Personal writing", "Newsletter homes", "SEO content"],
  },
  {
    slug: "restaurants",
    name: "Restaurant Templates",
    nameAr: "المطاعم",
    emoji: "🍽️",
    description: "Menu, reservations, and delivery-ready restaurant sites.",
    templates: [
      {
        title: "Fine Dining",
        description: "Elegant typography and chef story.",
        tags: ["Premium"],
      },
      {
        title: "Café & Bakery",
        description: "Warm palette with menu and hours.",
        tags: ["Casual"],
      },
      { title: "Food Truck", description: "Location tracker plus current menu.", tags: ["Mobile"] },
      { title: "Cloud Kitchen", description: "Multi-brand ordering page.", tags: ["Delivery"] },
    ],
    useCases: ["Reservations", "Online menus", "Delivery integration", "Catering"],
  },
  {
    slug: "agency",
    name: "Agency Templates",
    nameAr: "الوكالات",
    emoji: "🏢",
    description: "Agency and consultancy sites with case studies and service offerings.",
    templates: [
      {
        title: "Creative Agency",
        description: "Big-impact hero with case studies.",
        tags: ["Creative"],
      },
      {
        title: "Marketing Agency",
        description: "Service tiers with client logos.",
        tags: ["Marketing"],
      },
      {
        title: "Dev Agency",
        description: "Tech stack badges and project showcase.",
        tags: ["Dev"],
      },
      { title: "Consulting Firm", description: "Trust-focused with team bios.", tags: ["B2B"] },
    ],
    useCases: ["Lead generation", "Client showcasing", "Service selling", "Team display"],
  },
  {
    slug: "events",
    name: "Event Templates",
    nameAr: "المناسبات",
    emoji: "🎉",
    description: "Conference, wedding, and event sites with ticketing and RSVPs.",
    templates: [
      {
        title: "Tech Conference",
        description: "Speakers, agenda, ticket tiers.",
        tags: ["Conference"],
      },
      { title: "Wedding Site", description: "Story, schedule, RSVP, registry.", tags: ["Wedding"] },
      { title: "Music Festival", description: "Lineup grid with day-by-day.", tags: ["Music"] },
      { title: "Workshop / Class", description: "Single-event signup page.", tags: ["Workshop"] },
    ],
    useCases: ["Ticket sales", "RSVPs", "Speaker showcasing", "Schedule sharing"],
  },
  {
    slug: "saas",
    name: "SaaS Templates",
    nameAr: "SaaS",
    emoji: "⚡",
    description: "Marketing sites, docs, changelogs, and pricing pages for SaaS startups.",
    templates: [
      { title: "SaaS Landing", description: "Hero + features + pricing + FAQ.", tags: ["Landing"] },
      { title: "Pricing Page", description: "3-tier with feature comparison.", tags: ["Pricing"] },
      { title: "Docs Site", description: "Sidebar navigation with search.", tags: ["Docs"] },
      { title: "Changelog", description: "Tagged updates with screenshots.", tags: ["Changelog"] },
    ],
    useCases: ["Product marketing", "Documentation", "Pricing strategy", "Release notes"],
  },
  {
    slug: "nonprofits",
    name: "Nonprofit Templates",
    nameAr: "المنظمات",
    emoji: "❤️",
    description: "Mission-driven sites with donations, volunteer signup, and impact reporting.",
    templates: [
      { title: "Charity Home", description: "Mission, impact, donate CTA.", tags: ["Charity"] },
      { title: "Campaign Page", description: "Single-cause fundraising page.", tags: ["Campaign"] },
      {
        title: "Volunteer Hub",
        description: "Opportunities and signup forms.",
        tags: ["Volunteer"],
      },
      { title: "Annual Report", description: "Interactive impact storytelling.", tags: ["Report"] },
    ],
    useCases: ["Donations", "Volunteer recruitment", "Awareness", "Reporting"],
  },
  {
    slug: "education",
    name: "Education Templates",
    nameAr: "التعليم",
    emoji: "🎓",
    description: "School, course, and tutor sites with enrollment and student portals.",
    templates: [
      { title: "Online Course", description: "Modules, instructor bio, signup.", tags: ["Course"] },
      {
        title: "Language School",
        description: "Levels, schedules, free trial.",
        tags: ["Language"],
      },
      { title: "Private School", description: "Programs, admissions, parents.", tags: ["School"] },
      { title: "Bootcamp", description: "Curriculum, outcomes, apply.", tags: ["Bootcamp"] },
    ],
    useCases: ["Course sales", "Enrollment", "Lead generation", "Parent communication"],
  },
  {
    slug: "creators",
    name: "Creator Pages",
    nameAr: "صفحات صناع المحتوى",
    emoji: "🌟",
    description: "Link-in-bio pages, drop pages, and creator storefronts that actually convert.",
    templates: [
      {
        title: "Link in Bio Pro",
        description: "Multi-link bio with monetization blocks.",
        tags: ["Bio"],
      },
      {
        title: "Creator Storefront",
        description: "Sell digital products and presets.",
        tags: ["Shop"],
      },
      {
        title: "Tour Dates",
        description: "For musicians, comedians, and speakers.",
        tags: ["Music"],
      },
      {
        title: "Newsletter Hub",
        description: "Substack-style email capture.",
        tags: ["Newsletter"],
      },
    ],
    useCases: ["Link in bio", "Digital products", "Tour announcements", "Newsletter growth"],
  },
  {
    slug: "real-estate",
    name: "Real Estate Templates",
    nameAr: "العقارات",
    emoji: "🏘️",
    description: "Listings, agent profiles, and lead-capture pages for brokers and agencies.",
    templates: [
      {
        title: "Single Listing",
        description: "Full property page with photos and map.",
        tags: ["Listing"],
      },
      { title: "Brokerage Home", description: "Multi-agent firm landing page.", tags: ["Agency"] },
      {
        title: "Luxury Portfolio",
        description: "Image-led editorial style for premium properties.",
        tags: ["Luxury"],
      },
      {
        title: "Rental Marketplace",
        description: "Browsable rentals with filters.",
        tags: ["Rental"],
      },
    ],
    useCases: ["Listings", "Lead capture", "Agent branding", "Open houses"],
  },
  {
    slug: "fitness",
    name: "Fitness & Coaching",
    nameAr: "اللياقة والكوتشينج",
    emoji: "💪",
    description: "Booking, programs, and transformation galleries for trainers and studios.",
    templates: [
      {
        title: "Personal Trainer",
        description: "Programs, sessions, transformations.",
        tags: ["Coach"],
      },
      { title: "Yoga Studio", description: "Classes, instructors, schedule.", tags: ["Yoga"] },
      {
        title: "Online Program",
        description: "Sell PDF or video coaching programs.",
        tags: ["Digital"],
      },
      {
        title: "Nutrition Coach",
        description: "Meal plans and accountability tracking.",
        tags: ["Nutrition"],
      },
    ],
    useCases: ["Session booking", "Program sales", "Client portal", "Lead capture"],
  },
  {
    slug: "podcasts",
    name: "Podcast Sites",
    nameAr: "البودكاست",
    emoji: "🎙️",
    description: "Episode pages, sponsor decks, and listener hubs for podcasters.",
    templates: [
      {
        title: "Show Homepage",
        description: "Latest episodes, subscribe buttons, about.",
        tags: ["Show"],
      },
      { title: "Episode Page", description: "Player, transcript, show notes.", tags: ["Episode"] },
      {
        title: "Sponsor Deck",
        description: "Audience stats, packages, contact.",
        tags: ["Sponsor"],
      },
      { title: "Network Hub", description: "Multi-show podcast network.", tags: ["Network"] },
    ],
    useCases: ["Discoverability", "Sponsor sales", "Transcripts", "Newsletter"],
  },
];

// Append additional industries
const EXTRA_INDUSTRIES: Industry[] = [
  {
    slug: "dentists",
    name: "Dental Clinics",
    nameAr: "عيادات الأسنان",
    emoji: "🦷",
    headline: "AI Website Builder for Dental Clinics",
    subheadline:
      "A modern dental practice site with online bookings, patient forms, and insurance info — live in an afternoon.",
    painPoints: [
      "Outdated template sites from the 2000s",
      "No online appointment booking",
      "Generic stock photos with no personality",
    ],
    features: [
      {
        title: "Online Booking",
        description: "24/7 appointment scheduling synced to your calendar.",
      },
      {
        title: "Patient Intake Forms",
        description: "HIPAA-friendly forms emailed before the visit.",
      },
      { title: "Insurance Page", description: "Clear list of accepted providers and FAQs." },
      {
        title: "Before & After Gallery",
        description: "Showcase smile transformations with consent.",
      },
    ],
    examples: [
      "General dentistry",
      "Orthodontics",
      "Cosmetic dentistry",
      "Pediatric dentists",
      "Implant clinics",
    ],
    faqs: [
      {
        q: "Is patient data secure?",
        a: "Forms use encrypted transport. For full HIPAA workflows, connect a compliant intake tool.",
      },
      {
        q: "Multi-location support?",
        a: "Yes — list every clinic with maps, hours, and direct booking.",
      },
      { q: "Multilingual?", a: "Yes, 28 languages for diverse patient bases." },
    ],
  },
  {
    slug: "travel-agencies",
    name: "Travel Agencies",
    nameAr: "وكالات السفر",
    emoji: "✈️",
    headline: "AI Website Builder for Travel Agencies & Tour Operators",
    subheadline:
      "Sell trips, tours, and packages with a site that captures wanderlust and converts visitors into bookings.",
    painPoints: [
      "Outdated brochure sites",
      "PDF itineraries that look unprofessional",
      "Losing bookings to OTAs like Booking.com",
    ],
    features: [
      {
        title: "Tour & Package Pages",
        description: "Rich itineraries with maps, photos, and pricing.",
      },
      {
        title: "Booking Requests",
        description: "Capture leads with date pickers and traveler info.",
      },
      {
        title: "Stripe Deposits",
        description: "Lock bookings with secure deposits in 135+ currencies.",
      },
      {
        title: "Multi-language Itineraries",
        description: "Auto-translate trip details into 28 languages.",
      },
    ],
    examples: [
      "Tour operators",
      "Adventure travel",
      "Luxury travel",
      "Religious tourism",
      "Honeymoon planners",
    ],
    faqs: [
      { q: "Can I accept deposits?", a: "Yes, via Stripe in 135+ currencies." },
      { q: "Calendar availability?", a: "Yes, mark sold-out dates and limit per-tour seats." },
      { q: "WhatsApp integration?", a: "Yes — most travel leads prefer WhatsApp over email." },
    ],
  },
  {
    slug: "auto-repair",
    name: "Auto Repair Shops",
    nameAr: "ورش السيارات",
    emoji: "🔧",
    headline: "AI Website Builder for Auto Repair & Mechanic Shops",
    subheadline:
      "List services, accept booking requests, and build trust with reviews — without paying a marketing agency.",
    painPoints: [
      "Word-of-mouth isn't enough anymore",
      "No way to display pricing transparently",
      "Customers can't book online",
    ],
    features: [
      {
        title: "Service Menu",
        description: "Oil change, brakes, diagnostics — with starting prices.",
      },
      { title: "Booking Requests", description: "Quote requests with vehicle make/model upfront." },
      { title: "Google Reviews Embed", description: "Pull in your best reviews automatically." },
      { title: "Quick Quote Tool", description: "Estimate cost before they call." },
    ],
    examples: ["General mechanics", "Tire shops", "Body shops", "Oil change", "EV specialists"],
    faqs: [
      { q: "Can I list multiple bays?", a: "Yes, capacity per service so you don't overbook." },
      { q: "WhatsApp booking?", a: "Yes, the preferred channel for service customers." },
      { q: "Loyalty discounts?", a: "Built-in promo codes and repeat-customer rewards." },
    ],
  },
  {
    slug: "interior-designers",
    name: "Interior Designers",
    nameAr: "مصممي الديكور",
    emoji: "🛋️",
    headline: "AI Website Builder for Interior Designers",
    subheadline:
      "Showcase rooms, sell e-design packages, and book consultations from one stunning portfolio site.",
    painPoints: [
      "Instagram-only presence limits inquiries",
      "No clear path from inspiration to booking",
      "Pricing left to email back-and-forth",
    ],
    features: [
      { title: "Project Gallery", description: "Before/after rooms with style tags and filters." },
      {
        title: "E-Design Packages",
        description: "Sell mood boards and renders as digital products.",
      },
      {
        title: "Consultation Booking",
        description: "Paid consultations via Stripe and calendar sync.",
      },
      {
        title: "Press & Awards",
        description: "Dedicated section for publications and recognition.",
      },
    ],
    examples: [
      "Residential design",
      "Commercial design",
      "Hospitality",
      "E-design only",
      "Stagers",
    ],
    faqs: [
      { q: "Can I sell mood boards?", a: "Yes, as digital downloads with instant delivery." },
      { q: "Client moodboards online?", a: "Yes, password-protected client portals." },
      { q: "Pinterest-style grid?", a: "Yes, masonry layouts with lightbox." },
    ],
  },
  {
    slug: "wedding-vendors",
    name: "Wedding Vendors",
    nameAr: "خدمات الأفراح",
    emoji: "💍",
    headline: "AI Website Builder for Wedding Vendors",
    subheadline:
      "Photographers, planners, florists, venues — build a site that wins bookings during the engagement-day rush.",
    painPoints: [
      "Instagram tagging isn't converting to inquiries",
      "No streamlined inquiry form",
      "Slow gallery loading on phones",
    ],
    features: [
      { title: "Portfolio Gallery", description: "Past weddings with category filters." },
      { title: "Inquiry Form", description: "Capture date, venue, budget upfront." },
      { title: "Package Pricing", description: "Transparent tiers reduce tire-kickers." },
      { title: "Real Wedding Stories", description: "SEO-friendly blog of past events." },
    ],
    examples: ["Photographers", "Planners", "Florists", "Venues", "DJs & musicians"],
    faqs: [
      {
        q: "Multiple service types?",
        a: "Yes, list packages per service (e.g. ceremony only vs full day).",
      },
      { q: "Vendor partner directory?", a: "Yes, link out to your trusted collaborators." },
      { q: "Wedding mood boards?", a: "Yes, embed Pinterest-style boards." },
    ],
  },
];

INDUSTRIES.push(...EXTRA_INDUSTRIES);

const EXTRA_COMPETITORS: Competitor[] = [
  {
    slug: "wordpress-elementor",
    name: "WordPress + Elementor",
    tagline: "Classic WordPress builder",
    theirStrengths: ["Plugin ecosystem", "Familiar to many designers", "Self-hosted"],
    ourStrengths: [
      "No plugin updates breaking your site",
      "Faster page speeds",
      "AI generates whole pages, not just blocks",
      "No security patching",
    ],
    comparison: [
      { feature: "Setup time", megsy: "Minutes", them: "Hours" },
      { feature: "Speed (Lighthouse)", megsy: "95+", them: "60-75 typical" },
      { feature: "Maintenance", megsy: "Zero", them: "Weekly" },
      { feature: "Starting price", megsy: "Free, then $20/mo", them: "Hosting + Elementor Pro" },
    ],
    verdict:
      "Elementor is mature and flexible. Megsy AI is simply faster to ship and far cheaper to maintain over time.",
  },
  {
    slug: "ghost",
    name: "Ghost",
    tagline: "Publishing platform for creators",
    theirStrengths: ["Excellent editor for writers", "Built-in newsletters", "Membership support"],
    ourStrengths: [
      "Full website, not just a blog",
      "AI assist for layout and copy",
      "Multi-language out of the box",
      "Includes apps + landing pages",
    ],
    comparison: [
      { feature: "Scope", megsy: "Whole product site + blog", them: "Blog/newsletter focused" },
      { feature: "AI", megsy: "Yes, native", them: "No" },
      { feature: "Apps & forms", megsy: "Yes", them: "Limited" },
      { feature: "Starting price", megsy: "Free, then $20/mo", them: "$9/mo" },
    ],
    verdict:
      "Ghost is unbeatable for pure newsletter publishing. Megsy AI fits when you need a full product website plus a blog.",
  },
  {
    slug: "weebly",
    name: "Weebly",
    tagline: "Drag-and-drop website builder",
    theirStrengths: ["Easy onboarding", "Cheap entry-level", "Square e-commerce"],
    ourStrengths: [
      "Modern design vs dated templates",
      "AI generates whole sites",
      "Real code export",
      "Better SEO",
    ],
    comparison: [
      { feature: "Design quality", megsy: "Modern, AI-customized", them: "Dated templates" },
      { feature: "AI", megsy: "Native", them: "None" },
      { feature: "Code access", megsy: "Yes", them: "No" },
      { feature: "Starting price", megsy: "Free, then $20/mo", them: "$10/mo" },
    ],
    verdict:
      "Weebly is fine if you want the simplest possible builder. Megsy AI gives you modern design and a much higher ceiling.",
  },
  {
    slug: "duda",
    name: "Duda",
    tagline: "Agency-focused website builder",
    theirStrengths: ["White-label friendly", "Client management", "Reliable"],
    ourStrengths: [
      "AI cuts production time 10x",
      "Modern React stack",
      "Built-in marketing features",
      "Lower agency cost",
    ],
    comparison: [
      { feature: "Build time per site", megsy: "Hours", them: "Days" },
      { feature: "AI", megsy: "Generates full sites", them: "Limited" },
      { feature: "Stack", megsy: "Modern React", them: "Proprietary" },
      { feature: "Starting price", megsy: "Free, then $20/mo", them: "$19/mo" },
    ],
    verdict:
      "Duda is built for agencies running many client sites. Megsy AI suits agencies that want to deliver 10x faster with modern code.",
  },
  {
    slug: "midjourney",
    name: "Midjourney",
    tagline: "Discord-based AI image generator",
    theirStrengths: ["High artistic quality", "Strong community", "Distinctive style"],
    ourStrengths: [
      "Web app instead of Discord",
      "20+ image models, not just one",
      "Edit, upscale, and remix in one place",
      "Use generated images in a real website",
    ],
    comparison: [
      { feature: "Interface", megsy: "Web app, mobile-friendly", them: "Discord required" },
      {
        feature: "Models",
        megsy: "FLUX, Imagen, GPT Image 2, Nano Banana, +20",
        them: "Midjourney only",
      },
      { feature: "Use case", megsy: "Generate + publish on a real site", them: "Generate only" },
      { feature: "Starting price", megsy: "Free, then $20/mo", them: "$10/mo" },
    ],
    verdict:
      "Midjourney has a signature aesthetic. Megsy AI gives you many model styles plus the website to publish them on.",
  },
];

COMPETITORS.push(...EXTRA_COMPETITORS);

// ─── PHASE 2: MORE INDUSTRIES, COMPETITORS, TEMPLATES ──────────────────────
const MORE_INDUSTRIES: Industry[] = [
  {
    slug: "marketing-agencies",
    name: "Marketing Agencies",
    nameAr: "وكالات التسويق",
    emoji: "📣",
    headline: "AI Website Builder for Marketing Agencies",
    subheadline:
      "Spin up agency sites, case studies, and client landing pages 10x faster than the competition.",
    painPoints: [
      "Slow turnaround losing pitches",
      "Generic agency templates everywhere",
      "Hard to white-label deliverables",
    ],
    features: [
      {
        title: "Case Study Templates",
        description: "Polished, results-led case studies in minutes.",
      },
      {
        title: "Client Landing Pages",
        description: "Spin up campaign pages per client effortlessly.",
      },
      {
        title: "White-label Mode",
        description: "Hand over codebases or hosted sites under your brand.",
      },
      { title: "Multi-brand Workspaces", description: "One login, many client workspaces." },
    ],
    examples: ["Performance agencies", "Brand studios", "PR firms", "Growth consultancies"],
    faqs: [
      { q: "White-label?", a: "Yes, hand over hosted sites or full source code." },
      { q: "Multiple clients?", a: "Unlimited workspaces on the agency plan." },
      { q: "Reports?", a: "Embed dashboards from GA4 and Meta Ads." },
    ],
  },
  {
    slug: "coworking-spaces",
    name: "Coworking Spaces",
    nameAr: "أماكن العمل المشترك",
    emoji: "🏢",
    headline: "AI Website Builder for Coworking Spaces & Studios",
    subheadline:
      "Plans, tours, day-pass booking — everything a coworking space needs to fill desks.",
    painPoints: [
      "Day-pass bookings via email",
      "No clear pricing tiers online",
      "Can't show real-time availability",
    ],
    features: [
      { title: "Plan & Pricing Pages", description: "Hot desk, dedicated, private office tiers." },
      { title: "Day-Pass Booking", description: "Stripe-powered with QR access." },
      { title: "Tour Scheduling", description: "Calendar-synced building tours." },
      { title: "Community Wall", description: "Highlight members, events, and Slack." },
    ],
    examples: ["Coworking", "Studios", "Maker spaces", "Private offices"],
    faqs: [
      { q: "Real-time availability?", a: "Yes, sync with most coworking SaaS APIs." },
      { q: "Stripe day passes?", a: "Yes, with QR access codes." },
      { q: "Events?", a: "Built-in calendar and RSVP." },
    ],
  },
  {
    slug: "gyms-studios",
    name: "Gyms & Studios",
    nameAr: "الصالات الرياضية",
    emoji: "🏋️",
    headline: "AI Website Builder for Gyms, CrossFit Boxes & Fitness Studios",
    subheadline:
      "Sell memberships, book classes, and show transformations from a site built for fitness.",
    painPoints: [
      "Lost trial signups via Instagram DMs",
      "No online class booking",
      "Can't display schedules clearly",
    ],
    features: [
      { title: "Class Schedule", description: "Live calendar with capacity per session." },
      { title: "Membership Tiers", description: "Stripe subscriptions per plan." },
      { title: "Trial Signups", description: "Capture leads with day-pass forms." },
      { title: "Coach Profiles", description: "Bios, specialties, photos." },
    ],
    examples: ["CrossFit", "Yoga studios", "Pilates", "Boxing gyms", "Pole studios"],
    faqs: [
      { q: "Class capacity?", a: "Yes, with waitlists." },
      { q: "Recurring payments?", a: "Stripe subscriptions native." },
      { q: "Mindbody migration?", a: "CSV-based import." },
    ],
  },
  {
    slug: "spas-wellness",
    name: "Spas & Wellness",
    nameAr: "السبا والعافية",
    emoji: "🧖",
    headline: "AI Website Builder for Spas & Wellness Centers",
    subheadline: "Service menus, gift cards, and bookings — a tranquil site that converts.",
    painPoints: [
      "Service menus stuck in PDFs",
      "No online gift card sales",
      "Booking via phone only",
    ],
    features: [
      { title: "Service Menu", description: "Treatments, durations, prices." },
      { title: "Gift Cards", description: "Sell + redeem digital gift cards." },
      { title: "Online Booking", description: "24/7 calendar with deposits." },
      { title: "Membership Plans", description: "Recurring revenue from monthly plans." },
    ],
    examples: ["Day spas", "Medi-spas", "Massage", "Wellness retreats"],
    faqs: [
      { q: "Gift cards?", a: "Yes, native Stripe gift cards." },
      { q: "Deposits?", a: "Yes, configurable per service." },
      { q: "Series/packages?", a: "Yes, with usage tracking." },
    ],
  },
  {
    slug: "music-bands",
    name: "Musicians & Bands",
    nameAr: "الموسيقيون والفرق",
    emoji: "🎸",
    headline: "AI Website Builder for Musicians, Bands & Labels",
    subheadline: "Tour dates, merch, music, EPK — one site for the whole project.",
    painPoints: [
      "Linktree feels amateur",
      "No central place for press kits",
      "Hard to sell merch directly",
    ],
    features: [
      { title: "Tour Dates", description: "Synced with Bandsintown." },
      { title: "Merch Store", description: "Stripe + Printful POD." },
      { title: "Music Player", description: "Embed from Spotify, Apple, Bandcamp." },
      { title: "EPK Page", description: "Press photos, bio, and contact." },
    ],
    examples: ["Indie bands", "DJs", "Labels", "Songwriters", "Producers"],
    faqs: [
      { q: "Spotify embeds?", a: "Yes, plus Apple, YouTube, Bandcamp." },
      { q: "Merch?", a: "Stripe + Printful integration." },
      { q: "Email list?", a: "Built-in Resend integration." },
    ],
  },
  {
    slug: "authors-writers",
    name: "Authors & Writers",
    nameAr: "المؤلفون والكتاب",
    emoji: "📚",
    headline: "AI Website Builder for Authors & Writers",
    subheadline: "Book launches, newsletter, blog, and direct sales — own your audience.",
    painPoints: ["Amazon owns your audience", "No central press kit", "Generic author templates"],
    features: [
      { title: "Book Pages", description: "Cover, reviews, retailer links." },
      { title: "Newsletter Hub", description: "Substack-style email capture." },
      { title: "Direct Sales", description: "Sell signed copies or PDFs." },
      { title: "Events Calendar", description: "Book signings and readings." },
    ],
    examples: ["Fiction authors", "Non-fiction", "Poets", "Self-published", "Indie press"],
    faqs: [
      { q: "Sell PDFs/EPUBs?", a: "Yes, with instant delivery." },
      { q: "Newsletter?", a: "Native Resend integration." },
      { q: "Multi-book series?", a: "Yes, with series pages." },
    ],
  },
  {
    slug: "youtubers-creators",
    name: "YouTubers & Creators",
    nameAr: "صناع المحتوى",
    emoji: "🎬",
    headline: "AI Website Builder for YouTubers & Content Creators",
    subheadline: "A home for your channel: latest videos, sponsors, merch, courses, and bookings.",
    painPoints: [
      "Linktree doesn't convert",
      "Brand deals want a real site",
      "Selling courses outside YouTube is hard",
    ],
    features: [
      { title: "Latest Videos", description: "Auto-pulled from YouTube." },
      { title: "Sponsor Page", description: "Audience data and packages." },
      { title: "Course Sales", description: "Sell digital courses with Stripe." },
      { title: "Email List", description: "Convert viewers to subscribers." },
    ],
    examples: ["Lifestyle channels", "Tech reviewers", "Gamers", "Educators", "Vloggers"],
    faqs: [
      { q: "YouTube auto-sync?", a: "Yes, RSS-based." },
      { q: "Course platform?", a: "Built-in or embed Teachable/Thinkific." },
      { q: "Sponsor inquiries?", a: "Smart form with brand qualification." },
    ],
  },
  {
    slug: "churches-religious",
    name: "Churches & Religious",
    nameAr: "الكنائس والمساجد",
    emoji: "⛪",
    headline: "AI Website Builder for Churches, Mosques & Religious Organizations",
    subheadline: "Sermons, events, donations, and volunteer signup — built for community.",
    painPoints: [
      "Outdated 2000s websites",
      "No online giving",
      "Hard for newcomers to learn the basics",
    ],
    features: [
      { title: "Sermon Library", description: "Audio/video sermons with search." },
      { title: "Online Giving", description: "Stripe with tax receipts." },
      { title: "Event Calendar", description: "Services, classes, retreats." },
      { title: "Newcomer Page", description: "Welcome flow for visitors." },
    ],
    examples: ["Churches", "Mosques", "Synagogues", "Temples", "Religious schools"],
    faqs: [
      { q: "Recurring giving?", a: "Yes, Stripe subscriptions." },
      { q: "Live streaming?", a: "Embed YouTube/Vimeo or built-in." },
      { q: "Multilingual?", a: "Yes, 28 languages." },
    ],
  },
  {
    slug: "tutors-online-teachers",
    name: "Online Tutors",
    nameAr: "المعلمين عبر الإنترنت",
    emoji: "👩‍🏫",
    headline: "AI Website Builder for Online Tutors & Course Creators",
    subheadline: "Sell 1:1 sessions, group classes, and recorded courses — all from one site.",
    painPoints: [
      "Upwork takes 10%+ in fees",
      "No way to sell recorded content",
      "Scheduling chaos via email",
    ],
    features: [
      { title: "Session Booking", description: "Calendar with timezone smarts." },
      { title: "Course Storefront", description: "Sell recorded courses with Stripe." },
      { title: "Group Classes", description: "Capped enrollment with Zoom links." },
      { title: "Student Portal", description: "Resources and progress tracking." },
    ],
    examples: ["Language tutors", "Music teachers", "Test prep", "Coding bootcamps", "K-12 tutors"],
    faqs: [
      { q: "Zoom integration?", a: "Yes, plus Google Meet." },
      { q: "Recurring sessions?", a: "Yes, with package pricing." },
      { q: "Multi-tutor?", a: "Yes, on agency plans." },
    ],
  },
  {
    slug: "ngo-charities-mena",
    name: "MENA Nonprofits",
    nameAr: "المنظمات غير الربحية",
    emoji: "🤝",
    headline: "AI Website Builder for MENA Nonprofits",
    subheadline:
      "Arabic-first sites with donations, volunteer signup, and impact reporting — built for Middle East charities.",
    painPoints: [
      "No native Arabic + English bilingual setup",
      "Limited local payment options",
      "Generic global templates",
    ],
    features: [
      { title: "Bilingual AR/EN", description: "RTL-perfect Arabic plus English." },
      { title: "Local Payments", description: "Apple Pay, mada, Tap, WhatsApp Pay." },
      { title: "Donation Pages", description: "One-time + recurring with receipts." },
      { title: "Volunteer Signup", description: "Shift scheduling and reminders." },
    ],
    examples: ["Egyptian NGOs", "Gulf charities", "Levant nonprofits", "Religious foundations"],
    faqs: [
      { q: "Arabic-first?", a: "Yes, RTL-perfect with native fonts." },
      { q: "Local payments?", a: "Tap, HyperPay, mada, Apple Pay supported." },
      { q: "Tax receipts?", a: "Configurable per region." },
    ],
  },
];
INDUSTRIES.push(...MORE_INDUSTRIES);

const MORE_COMPETITORS: Competitor[] = [
  {
    slug: "notion-sites",
    name: "Notion Sites",
    tagline: "Turn Notion pages into a website",
    theirStrengths: ["Familiar Notion editor", "Easy CMS for blogs", "Fast for non-designers"],
    ourStrengths: [
      "Real custom design, not a Notion wrapper",
      "Better SEO and Core Web Vitals",
      "Backend, auth, payments included",
      "Code export",
    ],
    comparison: [
      { feature: "Design", megsy: "Fully custom AI design", them: "Notion-styled" },
      { feature: "SEO", megsy: "Full per-page meta + JSON-LD", them: "Limited" },
      { feature: "Backend", megsy: "Auth + DB + payments", them: "None" },
      { feature: "Starting price", megsy: "Free, then $20/mo", them: "$10/mo" },
    ],
    verdict:
      "Notion Sites are great for ultra-fast blog-style sites. Megsy AI gives you a real product website.",
  },
  {
    slug: "godaddy",
    name: "GoDaddy Website Builder",
    tagline: "Cheap all-in-one builder",
    theirStrengths: ["Cheap entry-level", "Built-in domain sales", "Mass market awareness"],
    ourStrengths: [
      "AI generates real custom design",
      "Modern fast code",
      "Clear pricing without upsells",
      "Real code export",
    ],
    comparison: [
      { feature: "Design quality", megsy: "AI-customized", them: "Cookie-cutter" },
      { feature: "Speed (Lighthouse)", megsy: "95+", them: "50-70" },
      { feature: "Upsells", megsy: "Transparent pricing", them: "Heavy" },
      { feature: "Starting price", megsy: "Free, then $20/mo", them: "$10/mo + add-ons" },
    ],
    verdict:
      "GoDaddy fits the simplest sites possible. Megsy AI gives you something you'd actually want to share.",
  },
  {
    slug: "hostinger-website-builder",
    name: "Hostinger Website Builder",
    tagline: "Hostinger's AI builder",
    theirStrengths: ["Cheap hosting", "Decent templates", "Bundled with hosting"],
    ourStrengths: [
      "Better AI design quality",
      "Real React code output",
      "Stronger backend (Supabase)",
      "Multilingual without upsell",
    ],
    comparison: [
      { feature: "AI quality", megsy: "Multi-model premium", them: "Single model" },
      { feature: "Output", megsy: "React + Vite", them: "Hostinger runtime" },
      { feature: "Backend", megsy: "Supabase auth + DB", them: "Limited" },
      { feature: "Starting price", megsy: "Free, then $20/mo", them: "$3/mo bundle" },
    ],
    verdict:
      "Hostinger is a great hosting deal with a basic builder included. Megsy AI is the better builder when output quality matters.",
  },
  {
    slug: "shopify-magic",
    name: "Shopify Magic",
    tagline: "Shopify's built-in AI",
    theirStrengths: [
      "Tightly integrated with Shopify",
      "Product description AI",
      "Theme generation",
    ],
    ourStrengths: [
      "Use any payment processor",
      "Lower cost for under-100 SKUs",
      "AI builds full marketing site, not just store",
      "Custom design freedom",
    ],
    comparison: [
      { feature: "Lock-in", megsy: "None — code export", them: "Heavy" },
      { feature: "Cost (50 SKUs)", megsy: "$20/mo", them: "$29-79/mo + apps" },
      { feature: "Marketing pages", megsy: "Full AI build", them: "Theme only" },
      { feature: "Starting price", megsy: "Free, then $20/mo", them: "$29/mo" },
    ],
    verdict:
      "Shopify Magic is great inside Shopify. Megsy AI is better when you want a store plus a real brand site, without lock-in.",
  },
  {
    slug: "10web",
    name: "10Web",
    tagline: "AI WordPress builder",
    theirStrengths: ["WordPress underneath", "Plugin compatibility", "AI homepage builder"],
    ourStrengths: [
      "No WordPress security maintenance",
      "Modern React vs PHP",
      "Faster page speeds",
      "Built-in i18n and AI for all pages",
    ],
    comparison: [
      { feature: "Tech", megsy: "Modern React + Supabase", them: "WordPress + AI layer" },
      { feature: "Maintenance", megsy: "Zero", them: "Standard WP updates" },
      { feature: "Speed", megsy: "Excellent", them: "Average WP" },
      { feature: "Starting price", megsy: "Free, then $20/mo", them: "$10/mo" },
    ],
    verdict:
      "10Web is a smart bet if you already love WordPress. Megsy AI is the better path if you want to escape WordPress maintenance entirely.",
  },
  {
    slug: "durable",
    name: "Durable",
    tagline: "AI website builder for small businesses",
    theirStrengths: ["Very fast onboarding", "Small business focus", "Built-in CRM/invoicing"],
    ourStrengths: [
      "Better design quality with multiple AI models",
      "Real React code export",
      "More verticals + templates",
      "Bigger feature set (blog, docs, multi-language)",
    ],
    comparison: [
      { feature: "AI models", megsy: "Claude, GPT, Gemini, Qwen", them: "Single proprietary" },
      { feature: "Code export", megsy: "Full React", them: "No" },
      { feature: "Blog/Docs", megsy: "Built-in", them: "Limited" },
      { feature: "Starting price", megsy: "Free, then $20/mo", them: "$15/mo" },
    ],
    verdict:
      "Durable wins for ultra-fast small business sites. Megsy AI wins as soon as you need to grow beyond a basic 5-page brochure.",
  },
  {
    slug: "mixo",
    name: "Mixo",
    tagline: "AI landing page generator",
    theirStrengths: ["Very simple", "Quick for waitlist pages", "Built-in email capture"],
    ourStrengths: [
      "Full multi-page sites",
      "Real CMS for blog/products",
      "Custom domains on free tier",
      "Real code",
    ],
    comparison: [
      { feature: "Scope", megsy: "Full websites + apps", them: "Single landing pages" },
      { feature: "CMS", megsy: "Yes", them: "No" },
      { feature: "Custom code", megsy: "Yes, fully", them: "No" },
      { feature: "Starting price", megsy: "Free, then $20/mo", them: "$16/mo" },
    ],
    verdict: "Mixo is fantastic for tiny waitlist pages. Megsy AI is the path to a real product.",
  },
];
COMPETITORS.push(...MORE_COMPETITORS);

const MORE_TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    slug: "personal-brand",
    name: "Personal Brand Templates",
    nameAr: "العلامة الشخصية",
    emoji: "🌟",
    description: "Personal websites that turn followers into clients, students, and fans.",
    templates: [
      {
        title: "Consultant Personal Brand",
        description: "Authority-led with case studies and booking.",
        tags: ["B2B"],
      },
      {
        title: "Coach Personal Brand",
        description: "Programs, transformations, and testimonials.",
        tags: ["Coaching"],
      },
      {
        title: "Speaker Personal Brand",
        description: "Talks, topics, and inquiry forms.",
        tags: ["Speaker"],
      },
      {
        title: "Author Personal Brand",
        description: "Books, newsletter, and events.",
        tags: ["Author"],
      },
    ],
    useCases: ["Authority building", "Booking inquiries", "Newsletter growth", "Course sales"],
  },
  {
    slug: "memberships",
    name: "Membership Templates",
    nameAr: "العضويات",
    emoji: "🔐",
    description: "Paid community and membership site templates with Stripe-locked content.",
    templates: [
      { title: "Newsletter+", description: "Free + paid newsletter tiers." },
      { title: "Course Membership", description: "Drip-content learning platform." },
      { title: "Community Membership", description: "Members-only forums and chat." },
      { title: "Premium Articles", description: "Substack-style paywalled writing." },
    ].map((t) => ({ ...t, tags: ["Membership"] })),
    useCases: ["Paid newsletters", "Online courses", "Premium content", "Communities"],
  },
  {
    slug: "directories",
    name: "Directory Templates",
    nameAr: "الأدلة والمتاجر",
    emoji: "🗂️",
    description: "Marketplace and directory templates with submissions, search, and monetization.",
    templates: [
      { title: "Local Business Directory", description: "City-scoped business listings." },
      { title: "SaaS Directory", description: "Compare and rate SaaS tools." },
      { title: "Job Board", description: "Post + apply for jobs." },
      { title: "Agency Marketplace", description: "Find vetted agencies." },
    ].map((t) => ({ ...t, tags: ["Directory"] })),
    useCases: ["Local guides", "SaaS comparison", "Job boards", "Marketplaces"],
  },
  {
    slug: "ai-startup",
    name: "AI Startup Templates",
    nameAr: "الشركات الناشئة في الذكاء الاصطناعي",
    emoji: "🤖",
    description: "Modern landing pages and product sites tailored for AI products and startups.",
    templates: [
      { title: "AI App Landing", description: "Hero demo, models page, pricing." },
      { title: "AI Tool Directory", description: "Browseable catalog of tools." },
      { title: "AI Agency", description: "Pitch AI services with case studies." },
      { title: "AI Playground", description: "Embed live model demos." },
    ].map((t) => ({ ...t, tags: ["AI"] })),
    useCases: ["AI product launches", "AI tool catalogs", "AI agencies", "Live demos"],
  },
  {
    slug: "medical",
    name: "Medical & Clinic Templates",
    nameAr: "الطبية",
    emoji: "🏥",
    description: "Clinic, dentist, and specialist websites with booking and patient info.",
    templates: [
      { title: "General Clinic", description: "Hours, services, booking." },
      { title: "Dental Practice", description: "Smile gallery and insurance info." },
      { title: "Specialty Clinic", description: "Cardio, derm, ortho — focused layouts." },
      { title: "Tele-health Portal", description: "Online consultations with Zoom." },
    ].map((t) => ({ ...t, tags: ["Medical"] })),
    useCases: ["Appointments", "Insurance info", "Patient education", "Tele-health"],
  },
  {
    slug: "hospitality",
    name: "Hospitality Templates",
    nameAr: "الضيافة",
    emoji: "🏨",
    description: "Hotel, resort, and boutique stay websites with booking and amenity showcases.",
    templates: [
      { title: "Boutique Hotel", description: "Editorial photos, rooms, booking." },
      { title: "Resort", description: "Multi-amenity property with packages." },
      { title: "Airbnb Host", description: "Multiple listings + direct booking." },
      { title: "Restaurant + Hotel", description: "Combined dining and stay." },
    ].map((t) => ({ ...t, tags: ["Hospitality"] })),
    useCases: ["Direct bookings", "Package sales", "Multi-property", "F&B integration"],
  },
];
TEMPLATE_CATEGORIES.push(...MORE_TEMPLATE_CATEGORIES);
// Helpers ──────────────────────────────────────────────────────────────────
export const getIndustry = (slug: string) => INDUSTRIES.find((i) => i.slug === slug);
export const getCompetitor = (slug: string) => COMPETITORS.find((c) => c.slug === slug);
export const getTemplateCategory = (slug: string) =>
  TEMPLATE_CATEGORIES.find((t) => t.slug === slug);

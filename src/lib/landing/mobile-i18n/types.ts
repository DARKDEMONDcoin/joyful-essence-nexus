// Shape of the strings shown in MobileLandingHero.tsx.
// Populated per locale so /en /ar /ar-eg /es /fr all show native content.

export interface MobilePlan {
  id: "pro" | "elite" | "business";
  name: string;
  tag: string | null;
  tagline: string;
  cta: string;
  monthlyFeatures: string[];
  yearlyFeatures: string[];
}

export interface MobileServiceItem {
  iconKey:
    | "chat"
    | "writing"
    | "code"
    | "image"
    | "video"
    | "research"
    | "docs"
    | "sheets"
    | "slides"
    | "voice"
    | "translate"
    | "agents";
  title: string;
  body: string;
}

export interface MobilePersona {
  iconKey: "creators" | "marketers" | "developers" | "researchers";
  title: string;
  body: string;
}

export interface MobileContent {
  header: { menu: string };
  hero: {
    line1: string;
    line1Mute: string;
    line1Underline: string;
    subtitle: string;
    trustUsersLabel: string;
    trustRatingLabel: string;
    theirCost: string;
    megsyCost: string;
    savingsLabel: string;
    savingsAmount: string;
  };
  partnersLabel: string;
  testimonialsTitle: string;
  testimonials: Array<{ quote: string; name: string; seed: string }>;
  services: {
    title: string;
    subtitle: string;
    items: MobileServiceItem[];
  };
  pricing: {
    sectionTitle: string;
    monthly: string;
    annual: string;
    annualBadge: string;
    perMonth: string;
    perFirstMonth: string;
    billedYearly: (yearly: number) => string; // receives the raw yearly number
    billedMonthly: string;
    firstMonthBadge: string;
    thenPricePrefix: string; // text before the price, e.g. "Then " (currency added by formatPrice)
    thenPriceSuffix: string; // text after the price, e.g. "/mo"
    plans: MobilePlan[];
    /** Optional per-locale currency formatter. Defaults to `"$" + n`. */
    formatPrice?: (n: number) => string;
    /** Optional per-locale numeric price overrides (e.g. EGP instead of USD). */
    priceOverrides?: Partial<
      Record<"pro" | "elite" | "business", { monthly: number; yearly: number; firstMonth?: number }>
    >;
  };
  savings: {
    title1: string;
    title2: string;
    subtitle: string;
    cards: Array<{ title: string; body: string }>;
  };
  personas: {
    title: string;
    items: MobilePersona[];
  };
  faq: {
    title: string;
    subtitle: string;
    items: Array<{ q: string; a: string }>;
  };
  stickyCta: {
    primary: string;
    secondary: string;
    caption: string;
  };
}

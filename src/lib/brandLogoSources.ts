/**
 * @doc Shared brand-logo source chain for integration UIs.
 * Priority: real brand marks first (Clearbit / Logo.dev), then aggregators
 * (Unavatar), then favicon-only fallbacks. Each entry is tried in order on
 * <img> error so we degrade gracefully instead of showing a broken image.
 */
export const brandLogoSources = (domain: string): string[] => [
  `https://cdn.brandfetch.io/${domain}/w/256/h/256?c=1idV7Yk3g1V6iX9Kx1c`,
  `https://logo.clearbit.com/${domain}?size=256`,
  `https://unavatar.io/${domain}?fallback=false`,
  `https://icons.duckduckgo.com/ip3/${domain}.ico`,
  `https://www.google.com/s2/favicons?sz=128&domain=${domain}`,
];

/** @doc 404 page — cinematic Earth-from-space video backdrop with Megsy nav, footer, and liquid-glass CTA. */
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  ArrowRight,
  Menu,
  X,
  Facebook,
  Twitter,
  Dribbble,
  Youtube,
  Linkedin,
  Instagram,
} from "lucide-react";

const FONT_STACK = '"Helvetica Now Var", Helvetica, Arial, sans-serif';

const NAV_LINKS = [
  { label: "Chat", href: "/chat" },
  { label: "Images", href: "/images" },
  { label: "Videos", href: "/videos" },
  { label: "Build", href: "/build" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
];

const FOOTER_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "PRODUCT",
    links: [
      { label: "AI Chat", href: "/chat" },
      { label: "Image Generation", href: "/images" },
      { label: "Video Generation", href: "/videos" },
      { label: "Megsy PR", href: "/build" },
      { label: "Enterprise", href: "/enterprise" },
    ],
  },
  {
    title: "COMPANY",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "RESOURCES",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "Help Center", href: "/help" },
      { label: "API", href: "/api" },
      { label: "System Status", href: "/status" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "LEGAL",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Cookies", href: "/cookies" },
      { label: "DMCA", href: "/dmca" },
      { label: "Security", href: "/security" },
    ],
  },
];

const SOCIALS = [
  { Icon: Facebook, href: "https://facebook.com/megsyai", label: "Facebook" },
  { Icon: Twitter, href: "https://x.com/megsyai", label: "Twitter" },
  { Icon: Dribbble, href: "https://dribbble.com/megsyai", label: "Dribbble" },
  { Icon: Youtube, href: "https://youtube.com/@megsyai", label: "YouTube" },
  { Icon: Linkedin, href: "https://linkedin.com/company/megsyai", label: "LinkedIn" },
  { Icon: Instagram, href: "https://instagram.com/megsyai", label: "Instagram" },
];

const MegsyMark = () => (
  <svg viewBox="0 0 480 480" className="w-8 h-8" fill="white" aria-hidden="true">
    <path d="M480 240a240 240 0 0 0-240 240 240 240 0 0 0 240-240Z" />
    <path d="M240 0A240 240 0 0 0 0 240 240 240 0 0 0 240 0Z" />
    <path d="M480 240A240 240 0 0 0 240 0a240 240 0 0 0 240 240Z" />
    <path d="M240 480A240 240 0 0 0 0 240a240 240 0 0 0 240 240Z" />
  </svg>
);

const NotFound = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      const t = setTimeout(() => setMenuVisible(true), 10);
      return () => clearTimeout(t);
    }
  }, [mobileMenuOpen]);

  const closeMenu = () => {
    setMenuVisible(false);
    setTimeout(() => setMobileMenuOpen(false), 500);
  };

  const toggleMenu = () => {
    if (mobileMenuOpen) closeMenu();
    else setMobileMenuOpen(true);
  };

  return (
    <div
      className="relative min-h-dvh flex flex-col bg-black overflow-hidden"
      style={{ fontFamily: FONT_STACK }}
    >
      <style>{`
        .four-oh-four {
          text-shadow: 0 0 80px rgba(255,255,255,0.3), 0 0 160px rgba(255,255,255,0.1);
        }
        .liquid-glass {
          background: rgba(255, 255, 255, 0.01);
          background-blend-mode: luminosity;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: none;
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
          position: relative;
          overflow: hidden;
        }
        .liquid-glass::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.4px;
          background: linear-gradient(180deg,
            rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%,
            rgba(255,255,255,0) 40%, rgba(255,255,255,0) 60%,
            rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.45) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
      `}</style>

      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4"
          type="video/mp4"
        />
      </video>

      <div className="relative z-10 flex flex-col min-h-dvh">
        {/* NAV */}
        <nav className="flex items-center justify-between px-6 md:px-12 lg:px-16 py-5">
          <a href="/" className="flex items-center gap-2.5">
            <MegsyMark />
            <span className="text-white text-xl font-bold tracking-wider">MEGSY</span>
          </a>

          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-white/80 hover:text-white text-sm tracking-wide transition-colors duration-200"
              >
                {l.label}
              </a>
            ))}
          </div>

          <a
            href="/auth"
            className="hidden lg:inline-flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-cyan-500 text-white text-sm font-semibold px-6 py-2.5 rounded-full"
          >
            LOG IN
            <ArrowRight className="w-4 h-4" />
          </a>

          <button
            onClick={toggleMenu}
            aria-label="Toggle menu"
            className="lg:hidden relative z-[60] w-11 h-11 flex items-center justify-center text-white"
          >
            <Menu
              className={`absolute w-6 h-6 transition-all duration-300 ${
                mobileMenuOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
              }`}
            />
            <X
              className={`absolute w-6 h-6 transition-all duration-300 ${
                mobileMenuOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"
              }`}
            />
          </button>
        </nav>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <>
            <div
              onClick={closeMenu}
              className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-md transition-opacity duration-400 ${
                menuVisible ? "opacity-100" : "opacity-0"
              }`}
              style={{ transitionDuration: "400ms" }}
            />
            <div className="absolute left-0 right-0 top-[68px] z-50">
              <div className="absolute inset-0 backdrop-blur-xl rounded-b-2xl" />
              <div className="relative z-10 flex flex-col items-center gap-6 py-10 px-6">
                {NAV_LINKS.map((l, i) => (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={closeMenu}
                    className="text-white/80 hover:text-white text-lg sm:text-xl font-light tracking-[0.08em]"
                    style={{
                      opacity: menuVisible ? 1 : 0,
                      transform: menuVisible ? "translateY(0)" : "translateY(12px)",
                      transition: "opacity 400ms ease-out, transform 400ms ease-out",
                      transitionDelay: menuVisible ? `${350 + i * 50}ms` : "0ms",
                    }}
                  >
                    {l.label}
                  </a>
                ))}
                <a
                  href="/auth"
                  onClick={closeMenu}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-cyan-500 text-white text-sm font-semibold px-6 py-2.5 rounded-full"
                  style={{
                    opacity: menuVisible ? 1 : 0,
                    transform: menuVisible ? "translateY(0)" : "translateY(12px)",
                    transition: "opacity 400ms ease-out, transform 400ms ease-out",
                    transitionDelay: menuVisible ? `${350 + NAV_LINKS.length * 50}ms` : "0ms",
                  }}
                >
                  LOG IN
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </>
        )}

        {/* HERO */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-12 sm:py-16 md:py-0">
          <h1 className="text-white/80 text-lg sm:text-3xl md:text-5xl font-light leading-snug tracking-tight mb-1 sm:mb-2">
            This page seems to have
          </h1>
          <h1 className="text-white/80 text-lg sm:text-3xl md:text-5xl font-light leading-snug tracking-tight mb-8 sm:mb-12">
            slipped beyond our reach :/
          </h1>

          <div className="relative mb-8 sm:mb-12 w-full flex justify-center overflow-visible">
            <span className="four-oh-four text-[80px] sm:text-[140px] md:text-[200px] lg:text-[260px] font-black text-white leading-none tracking-tighter select-none">
              404
            </span>
          </div>

          <a
            href="/"
            className="liquid-glass text-white text-[10px] sm:text-sm tracking-[0.15em] sm:tracking-[0.2em] font-medium px-6 sm:px-8 py-3 sm:py-3.5 rounded-full uppercase"
          >
            Return to Main Page
          </a>
        </main>

        {/* FOOTER */}
        <footer className="relative z-10 px-4 sm:px-6 md:px-12 lg:px-16 pb-8 sm:pb-10 pt-10 sm:pt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8 lg:gap-6">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="text-white text-[10px] sm:text-xs font-bold tracking-[0.15em] mb-3 sm:mb-4">
                  {col.title}
                </h3>
                <ul className="space-y-2 sm:space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-white/50 hover:text-white/80 text-[10px] sm:text-xs transition-colors duration-200"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="col-span-2 lg:col-span-2">
              <h3 className="text-white text-[10px] sm:text-xs font-bold tracking-[0.15em] mb-3 sm:mb-4">
                JOIN THE MEGSY NEWSLETTER
              </h3>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex max-w-sm"
              >
                <input
                  type="email"
                  placeholder="Type your email to sign up"
                  className="flex-1 min-w-0 bg-white text-black text-xs px-3 py-2 rounded-l-md outline-none placeholder:text-black/40"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-400 to-cyan-500 text-white text-[10px] sm:text-xs font-bold tracking-wider px-4 py-2 rounded-r-md"
                >
                  SEND IT
                </button>
              </form>

              <h3 className="text-white text-[10px] sm:text-xs font-bold tracking-[0.15em] mt-5 sm:mt-6 mb-3">
                CONNECT
              </h3>
              <div className="flex gap-3">
                {SOCIALS.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/50 hover:text-white transition-colors duration-200"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default NotFound;

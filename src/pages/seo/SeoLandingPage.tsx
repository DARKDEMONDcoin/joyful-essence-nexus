/** @doc SEO landing page — marketing surface for SEO features. */
/**
 * SynapseX-inspired SEO landing template used for every /:slug page defined
 * in src/data/seoPages.ts. Preserves the exact section structure, motion
 * register, typography and dark-video aesthetic of the original spec, only
 * swapping the copy per page.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, useMotionTemplate, useScroll, useSpring, useTransform } from "framer-motion";
import { SEO_PAGES, type SeoPageContent } from "@/data/seoPages";

const SCRAMBLE_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><";

function ScrambleIn({ text, delay, triggered }: { text: string; delay: number; triggered: boolean }) {
  const [display, setDisplay] = useState(" ");
  useEffect(() => {
    if (!triggered) return;
    let cursor = 0;
    let interval: ReturnType<typeof setInterval> | null = null;
    const start = window.setTimeout(() => {
      interval = setInterval(() => {
        cursor += 0.5;
        const revealed = Math.floor(cursor);
        let out = "";
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          if (ch === " ") out += " ";
          else if (i < revealed) out += ch;
          else if (i < revealed + 3)
            out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          else out += "";
        }
        setDisplay(out);
        if (revealed >= text.length) {
          setDisplay(text);
          if (interval) clearInterval(interval);
        }
      }, 25);
    }, delay);
    return () => {
      window.clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [text, delay, triggered]);
  return <>{triggered ? display : " "}</>;
}

function ScrambleText({ text, isHovered, className }: { text: string; isHovered: boolean; className?: string }) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    if (!isHovered) {
      setDisplay(text);
      return;
    }
    let frame = 0;
    const total = text.length * 4;
    const interval = setInterval(() => {
      frame++;
      const revealed = Math.floor(frame / 4);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === " ") out += " ";
        else if (i < revealed) out += ch;
        else out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
      setDisplay(out);
      if (frame >= total) {
        setDisplay(text);
        clearInterval(interval);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [text, isHovered]);
  return <span className={className}>{display}</span>;
}

function SynapseXLogo({ size = 18, color = "#ffffff" }: { size?: number; color?: string }) {
  const d =
    "M 1.5,23 L 1.5,33 C 1.5,38.5 6,43 11.5,43 L 16.5,43 C 22,43 26.5,38.5 26.5,33 Q 28,28 33,26.5 C 38.5,26.5 43,22 43,16.5 L 43,11.5 C 43,6 38.5,1.5 33,1.5 L 23,1.5 Q 12,12 1.5,23 Z";
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100" fill={color} aria-hidden>
      {[0, 90, 180, 270].map((r) => (
        <path key={r} d={d} transform={`rotate(${r})`} />
      ))}
    </svg>
  );
}

function SquashHamburger({ open, mobile }: { open: boolean; mobile?: boolean }) {
  const w = mobile ? 15 : 18;
  const h = mobile ? 10 : 12;
  const bar = mobile ? 1.2 : 1.5;
  return (
    <span className="relative inline-block" style={{ width: w, height: h }}>
      {[0, 1, 2].map((i) => {
        const y = (h / 2) * i;
        const isTop = i === 0;
        const isMid = i === 1;
        return (
          <motion.span
            key={i}
            className="absolute left-0 bg-white"
            style={{ height: bar, width: w, top: y, borderRadius: 1 }}
            animate={{
              rotate: open ? (isTop ? 45 : isMid ? 0 : -45) : 0,
              y: open ? (isTop ? h / 2 - y : isMid ? 0 : h / 2 - y) : 0,
              opacity: open && isMid ? 0 : 1,
              scale: open && isMid ? 0 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
        );
      })}
    </span>
  );
}

const V = {
  hero: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_083515_290e5a10-0b95-41af-a5e2-32b6389baa4d.mp4",
  cinematic:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_092455_089c54f8-3b03-4966-9df1-e9746063d0ef.mp4",
  metrics:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_095810_ecea3dd2-fc5e-4e41-8696-4219290b6589.mp4",
  tech:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_095750_32a52ce0-2005-45c9-9093-41f03fde9530.mp4",
  footer:
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_080203_fd7f4f85-3a86-4837-8192-85e7bfe68e75.mp4",
};

export default function SeoLandingPage() {
  const { seoSlug } = useParams<{ seoSlug: string }>();
  const navigate = useNavigate();
  const page = useMemo(() => SEO_PAGES.find((p) => p.slug === seoSlug), [seoSlug]);

  useEffect(() => {
    if (!page) navigate("/", { replace: true });
  }, [page, navigate]);

  const [entered, setEntered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setEntered(true), 800);
    return () => window.clearTimeout(t);
  }, []);

  // Hero mouse-scrub video
  const heroRef = useRef<HTMLVideoElement | null>(null);
  const lastXRef = useRef<number | null>(null);
  const seekingRef = useRef(false);
  const pendingRef = useRef<number | null>(null);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.pause();
    try {
      el.currentTime = 0;
    } catch {}
    const onMove = (e: MouseEvent) => {
      if (!el.duration || Number.isNaN(el.duration)) return;
      if (lastXRef.current == null) {
        lastXRef.current = e.clientX;
        return;
      }
      const dx = e.clientX - lastXRef.current;
      lastXRef.current = e.clientX;
      const delta = (dx / window.innerWidth) * el.duration * 0.8;
      const next = Math.max(0, Math.min(el.duration - 0.05, el.currentTime + delta));
      if (seekingRef.current) {
        pendingRef.current = next;
      } else {
        seekingRef.current = true;
        try {
          el.currentTime = next;
        } catch {}
      }
    };
    const onSeeked = () => {
      seekingRef.current = false;
      if (pendingRef.current != null) {
        const n = pendingRef.current;
        pendingRef.current = null;
        seekingRef.current = true;
        try {
          el.currentTime = n;
        } catch {}
      }
    };
    window.addEventListener("mousemove", onMove);
    el.addEventListener("seeked", onSeeked);
    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("seeked", onSeeked);
    };
  }, [page?.slug]);

  // Cinematic section 3D scroll
  const cinematicRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: cinematicRef,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 15, damping: 32, mass: 1.8 });
  const y = useTransform(smooth, [0, 1], [60, -120]);
  const opacity = useTransform(smooth, [0.3, 0.5], [0, 1]);
  const transform = useMotionTemplate`perspective(400px) rotateX(24deg) translateY(${y}px) translateZ(15px)`;

  if (!page) return null;

  const heroVideo = page.videos?.hero ?? V.hero;
  const cinematicVideo = page.videos?.cinematic ?? V.cinematic;
  const metricsVideo = page.videos?.metrics ?? V.metrics;
  const techVideo = page.videos?.tech ?? V.tech;
  const footerVideo = page.videos?.footer ?? V.footer;

  const canonical = `https://megsyai.com/${page.slug}`;

  const ldProduct = {
    "@context": "https://schema.org",
    "@type": page.kind === "comparison" ? "WebPage" : "Product",
    name: page.name,
    description: page.meta.description,
    brand: { "@type": "Brand", name: "Megsy AI" },
    url: canonical,
  };

  return (
    <div
      className="min-h-screen bg-black text-white overflow-x-hidden"
      style={{ fontFamily: '"Space Mono", monospace' }}
    >
      <Helmet>
        <title>{page.meta.title}</title>
        <meta name="description" content={page.meta.description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={page.meta.title} />
        <meta property="og:description" content={page.meta.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(ldProduct)}</script>
      </Helmet>

      {/* NAVBAR */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-between px-4 sm:px-6 md:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: entered ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center gap-2">
          {!menuOpen && (
            <Link
              to="/"
              className="h-9 sm:h-12 px-3 sm:px-5 flex items-center gap-2 rounded-[10px] sm:rounded-[14px] backdrop-blur-md"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <SynapseXLogo size={16} />
              <span className="text-[13px] sm:text-[16px] font-medium tracking-tight text-white">
                Megsy AI
              </span>
            </Link>
          )}
          <motion.div
            className="h-9 sm:h-12 rounded-[10px] sm:rounded-[14px] backdrop-blur-md flex items-center overflow-hidden"
            style={{ background: "rgba(255,255,255,0.15)" }}
            animate={{ width: menuOpen ? 260 : 40 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
          >
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center justify-center shrink-0"
              style={{ width: menuOpen ? 36 : 40, height: menuOpen ? 36 : 40, marginLeft: menuOpen ? 6 : 0 }}
              aria-label="Toggle menu"
            >
              <SquashHamburger open={menuOpen} />
            </button>
            {menuOpen && (
              <motion.div
                className="flex items-center gap-4 pl-2 pr-4 text-[13px] sm:text-[16px] text-white/85"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35 }}
              >
                <Link
                  to="/"
                  className="hover:text-white"
                  onMouseEnter={() => setHoverKey("home")}
                  onMouseLeave={() => setHoverKey(null)}
                >
                  <ScrambleText text="Home" isHovered={hoverKey === "home"} />
                </Link>
                <Link
                  to="/pricing"
                  className="hover:text-white"
                  onMouseEnter={() => setHoverKey("pricing")}
                  onMouseLeave={() => setHoverKey(null)}
                >
                  <ScrambleText text="Pricing" isHovered={hoverKey === "pricing"} />
                </Link>
                <Link
                  to="/ai-chat"
                  className="hover:text-white"
                  onMouseEnter={() => setHoverKey("chat")}
                  onMouseLeave={() => setHoverKey(null)}
                >
                  <ScrambleText text="Chat" isHovered={hoverKey === "chat"} />
                </Link>
              </motion.div>
            )}
          </motion.div>
        </div>
        <Link
          to="/auth"
          className="h-9 sm:h-12 px-3.5 sm:px-6 bg-white text-black rounded-full flex items-center gap-2 text-[13px] sm:text-[15px] font-medium"
          onMouseEnter={() => setHoverKey("cta")}
          onMouseLeave={() => setHoverKey(null)}
        >
          <i className="bi bi-apple" />
          <ScrambleText text="Try Free" isHovered={hoverKey === "cta"} />
        </Link>
      </motion.nav>

      {/* SECTION 1 — HERO */}
      <section className="relative h-screen h-[100dvh] w-full overflow-hidden">
        <video
          ref={heroRef}
          src={heroVideo}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            opacity: 0.05,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none uppercase"
          style={{
            top: "calc(50% + 50px)",
            transform: "translateY(-50%)",
            fontFamily: '"Anton SC", sans-serif',
            fontSize: "clamp(120px, 30vw, 521px)",
            letterSpacing: "-4px",
            opacity: 0.1,
            lineHeight: 1,
            background:
              "radial-gradient(circle, rgba(142,127,148,0) 0%, #8E7F94 70%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
            whiteSpace: "nowrap",
          }}
        >
          {page.watermark}
        </div>
        <motion.div
          className="relative z-10 h-full flex flex-col px-4 sm:px-6 md:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: entered ? 1 : 0 }}
          transition={{ duration: 1 }}
        >
          <div className="flex-1" />
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-4">
              <h1
                className="text-white font-light leading-[0.95] tracking-[-0.03em]"
                style={{ fontSize: "clamp(40px, 10vw, 100px)" }}
              >
                <ScrambleIn text={page.heroLeft[0]} delay={200} triggered={entered} />
                <br />
                <ScrambleIn text={page.heroLeft[1]} delay={500} triggered={entered} />
              </h1>
              <motion.p
                className="max-w-sm text-[13px] sm:text-[15px] text-white/60 leading-relaxed"
                initial={{ y: 25, opacity: 0 }}
                animate={{ y: entered ? 0 : 25, opacity: entered ? 1 : 0 }}
                transition={{ duration: 0.9, ease: [0.215, 0.61, 0.355, 1], delay: 0.2 }}
              >
                {page.heroDescription}
              </motion.p>
            </div>
            <h2
              className="text-white font-light leading-[0.95] tracking-[-0.03em] text-left md:text-right"
              style={{ fontSize: "clamp(40px, 10vw, 100px)" }}
            >
              <ScrambleIn text={page.heroRight[0]} delay={700} triggered={entered} />
              <br />
              <ScrambleIn text={page.heroRight[1]} delay={1000} triggered={entered} />
            </h2>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2 — CINEMATIC TEXT */}
      <section ref={cinematicRef} className="relative h-screen h-[100dvh] w-full overflow-hidden">
        <video
          src={cinematicVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-x-0 top-0 z-10 pointer-events-none"
          style={{
            height: 180,
            background: "linear-gradient(180deg, #010103 0%, transparent 100%)",
          }}
        />
        <div className="relative z-20 h-full w-full flex items-center justify-center">
          <motion.p
            style={{ transform, opacity }}
            className="max-w-5xl font-normal text-white leading-[1.35] tracking-[-0.02em] select-none px-6 sm:px-12 text-center"
          >
            <span
              className="block"
              style={{
                fontSize: "clamp(22px, 3.4vw, 42px)",
              }}
            >
              {page.cinematic}
            </span>
          </motion.p>
        </div>
      </section>

      {/* SECTION 3 — METRICS */}
      <section className="relative min-h-screen w-full overflow-hidden">
        <video
          src={metricsVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-10 max-w-6xl mx-auto pt-32 pb-32 px-6 text-center">
          <motion.p
            className="text-white/40 text-[13px] sm:text-[14px] tracking-[0.2em] uppercase mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.2 }}
          >
            {page.metricsTitle}
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            {page.metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
              >
                <div
                  className="text-white font-light tracking-[-0.04em] leading-none"
                  style={{ fontSize: "clamp(48px, 10vw, 96px)" }}
                >
                  {m.value}
                </div>
                <div className="text-white/40 text-[13px] sm:text-[15px] mt-4 tracking-wide">
                  {m.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — ADAPTIVE / TECHNOLOGY */}
      <section className="relative h-screen h-[100dvh] w-full overflow-hidden">
        <video
          src={techVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-10 h-full flex flex-col px-8 sm:px-12 md:px-16 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
            <motion.h3
              className="text-white font-light leading-[0.95] tracking-[-0.03em]"
              style={{ fontSize: "clamp(36px, 8vw, 72px)" }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1 }}
            >
              {page.adaptiveTitle[0]}
              <br />
              {page.adaptiveTitle[1]}
            </motion.h3>
            <motion.p
              className="text-white/50 text-[13px] sm:text-[15px] leading-relaxed max-w-xs md:text-right md:pt-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              {page.adaptiveDesc}
            </motion.p>
          </div>
          <div className="flex-1" />
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {page.features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
              >
                <div className="text-white text-[14px] sm:text-[16px] font-normal mb-2">
                  {f.title}
                </div>
                <div className="text-white/40 text-[12px] sm:text-[14px] leading-relaxed">
                  {f.desc}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 5 — ARCHITECTURE (pure black) */}
      <section className="min-h-screen bg-black w-full flex items-center justify-center">
        <div className="max-w-3xl px-6 py-32 text-center mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1 }}
          >
            <p className="text-white/40 text-[13px] sm:text-[14px] tracking-[0.2em] uppercase mb-8">
              {page.archSubtitle}
            </p>
            <h4
              className="text-white font-light leading-[1.15] tracking-[-0.02em] mb-10"
              style={{ fontSize: "clamp(28px, 6vw, 56px)" }}
            >
              {page.archHeading}
            </h4>
            <p className="text-white/45 text-[15px] sm:text-[17px] leading-relaxed max-w-xl mx-auto">
              {page.archDescription}
            </p>
          </motion.div>
          <motion.div
            className="mt-20 flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.2, delay: 0.4 }}
          >
            {page.layers.map((l, i) => (
              <div
                key={l}
                className="w-full max-w-md h-[72px] border border-white/10 rounded-lg flex items-center justify-between px-6"
              >
                <span className="text-white/30 text-[12px] tracking-[0.15em] uppercase">
                  Layer {i + 1}
                </span>
                <span className="text-white text-[16px] sm:text-[18px] font-light">{l}</span>
              </div>
            ))}
          </motion.div>
          <div className="mt-16">
            <Link
              to="/auth"
              className="inline-block h-12 px-8 bg-white text-black rounded-full text-[15px] font-medium leading-[3rem]"
            >
              Try Megsy AI Free
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black overflow-hidden">
        <div className="flex flex-col md:flex-row min-h-[400px]">
          <div className="md:w-1/2 h-[300px] md:h-auto relative">
            <video
              src={footerVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="md:w-1/2 p-10 sm:p-16 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-8">
                <SynapseXLogo size={18} color="rgba(255,255,255,0.7)" />
                <span className="text-[15px] font-medium text-white/70 tracking-tight">
                  Megsy AI
                </span>
              </div>
              <p className="text-white/40 text-[14px] sm:text-[15px] leading-relaxed max-w-sm">
                {page.footerTagline}
              </p>
            </div>
            <div className="text-white/25 text-[12px] mt-12">
              © {new Date().getFullYear()} Megsy AI. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
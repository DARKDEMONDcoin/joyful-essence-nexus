/** @doc About Megsy — glassmorphism hero with video, founders, values and stats. */
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowUpRight, ChevronRight, Sparkles } from "lucide-react";
import SEOHead from "@/components/common/SEOHead";
import { Helmet } from "react-helmet-async";
import founderHamza from "@/assets/about-founder-hamza.webp";
import founderAbdalla from "@/assets/about-founder-abdalla.webp";

/* ---------- data ---------- */
const founders = [
  {
    name: "Hamza Hassan",
    role: "Co-Founder · Product & Design",
    img: founderAbdalla,
    bio: "Drives product, design and the obsessive details. Believes great AI should disappear into the work.",
  },
  {
    name: "Abdalla Mohamed",
    role: "Co-Founder · Engineering",
    img: founderHamza,
    bio: "Leads engineering and infrastructure. Obsessed with making complex systems feel calm.",
  },
];

const values = [
  { t: "Built for creators", d: "Every tool is designed around people who actually ship — not benchmarks." },
  { t: "Honest by default", d: "One transparent credit, clear pricing, no hidden lock-ins." },
  { t: "Made in Cairo", d: "Designed and built in Egypt. Serving creators in any language they write in." },
  { t: "Your work is yours", d: "We never train on your private projects. Delete your data any time." },
];

const stats = [
  { v: "36+", k: "AI engines unified" },
  { v: "25", k: "Languages auto-translated" },
  { v: "1", k: "Credit — one wallet" },
  { v: "24/7", k: "Human + AI support" },
];

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260428_193507_4286c423-2fd9-4efd-92bd-91a939453fc1.mp4";

const INK = "rgba(30,50,90,0.9)";
const INK_SOFT = "rgba(30,50,90,0.6)";

/* ---------- sub components ---------- */
const HeroBadge = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/40 mx-auto mb-4 w-fit"
  >
    <Sparkles className="w-3.5 h-3.5" style={{ color: INK }} />
    <span className="text-[12px] font-normal" style={{ color: INK }}>
      About Megsy AI
    </span>
  </motion.div>
);

const Navbar = ({ onCta }: { onCta: () => void }) => (
  <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 md:px-8 py-4 md:py-5">
    <div className="hidden md:block flex-1" />

    <ul className="hidden md:flex items-center gap-7 text-[13px] font-normal" style={{ color: INK }}>
      {[
        { label: "Product", dd: false },
        { label: "Pricing", dd: true },
        { label: "Docs", dd: false },
        { label: "Blog", dd: true },
      ].map((it) => (
        <li key={it.label} className="cursor-pointer hover:opacity-70 transition-opacity flex items-center gap-1 group">
          {it.label}
          {it.dd && <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />}
        </li>
      ))}
    </ul>

    <div className="md:hidden text-[18px] font-normal tracking-wide" style={{ color: INK }}>
      MEGSY
    </div>

    <div className="flex-1 flex justify-end">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onCta}
        className="flex items-center bg-[rgba(30,50,90,0.85)] text-white rounded-full pl-2 pr-4 md:pr-6 py-1.5 md:py-2 gap-2 md:gap-3 hover:bg-[rgba(30,50,90,1)] transition-colors group"
      >
        <span className="bg-white/15 rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center">
          <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-white transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
        <span className="text-xs md:text-sm font-normal">Try Megsy</span>
      </motion.button>
    </div>
  </nav>
);

const BottomLeftCard = ({ onCta }: { onCta: () => void }) => (
  <motion.div
    initial={{ x: -20, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.8, delay: 0.2 }}
    className="absolute bottom-28 right-4 left-auto md:left-6 md:right-auto md:bottom-6 lg:bottom-10 lg:left-10 p-3 md:p-4 lg:p-5 rounded-[1.2rem] md:rounded-[1.5rem] lg:rounded-[2.2rem] bg-white/30 backdrop-blur-xl border border-white/30 flex flex-col gap-2 lg:gap-3 min-w-[150px] md:min-w-[170px] lg:min-w-[200px] w-fit"
  >
    <div className="flex flex-col">
      <span className="text-2xl md:text-3xl font-normal tracking-tight" style={{ color: INK }}>
        36+
      </span>
      <span className="text-[10px] md:text-[12px] font-normal uppercase tracking-wider" style={{ color: INK_SOFT }}>
        AI Engines Unified
      </span>
    </div>
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onCta}
      className="flex items-center bg-white rounded-full pl-1.5 pr-5 py-1.5 gap-2 hover:bg-white/90 transition-colors self-start group"
    >
      <span className="bg-[rgba(30,50,90,0.08)] rounded-full w-7 h-7 flex items-center justify-center">
        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" style={{ color: INK }} />
      </span>
      <span className="text-[14px] font-normal" style={{ color: INK }}>
        Get started
      </span>
    </motion.button>
  </motion.div>
);

const BottomRightCorner = ({ onClick }: { onClick: () => void }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.8, delay: 0.4 }}
    onClick={onClick}
    className="absolute bottom-0 right-0 p-3 pt-5 pl-8 sm:p-4 sm:pt-6 sm:pl-10 md:p-6 md:pt-8 md:pl-14 bg-[#f0f0f0] rounded-tl-[1.5rem] sm:rounded-tl-[2rem] md:rounded-tl-[3.5rem] flex items-center gap-3 sm:gap-4 md:gap-6 cursor-pointer group"
  >
    {/* corner masks */}
    <div className="absolute -top-4 right-0 w-4 h-4 bg-[#f0f0f0]" style={{ clipPath: "path('M 0 16 A 16 16 0 0 0 16 0 L 16 16 Z')" }} />
    <div className="absolute bottom-0 -left-4 w-4 h-4 bg-[#f0f0f0]" style={{ clipPath: "path('M 16 0 A 16 16 0 0 1 0 16 L 16 16 Z')" }} />

    <div className="bg-[rgba(30,50,90,0.05)] w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center border border-[rgba(30,50,90,0.1)] transition-transform group-hover:scale-105">
      <ArrowUpRight className="w-4 h-4 md:w-6 md:h-6" style={{ color: "rgba(30,50,90,0.8)" }} />
    </div>
    <div className="flex flex-col">
      <span className="text-[16px] md:text-[20px] font-normal" style={{ color: "rgba(30,50,90,0.95)" }}>
        Documentation
      </span>
      <span className="flex items-center gap-1 text-[12px] md:text-[13px] font-normal" style={{ color: INK_SOFT }}>
        Read the guide
        <ChevronRight className="w-3 h-3 md:w-3.5 md:h-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </div>
  </motion.div>
);

/* ---------- page ---------- */
const AboutPage = () => {
  const navigate = useNavigate();
  const goSignup = () => navigate("/auth?mode=signup");
  const goDocs = () => navigate("/docs");
  const goContact = () => navigate("/contact");

  return (
    <div className="font-helvetica-hero min-h-screen w-full bg-[#f0f0f0]" style={{ color: INK }}>
      <SEOHead
        title="About Megsy AI — One Workspace for Chat, Image, Video & Code"
        description="Megsy AI unifies chat, image, video, code and file analysis in a single workspace, priced in one credit. Independently built in Cairo."
        path="/about"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Megsy AI",
            url: "https://megsyai.com",
            logo: "https://megsyai.com/icons/icon-512.png",
            foundingLocation: "Cairo, Egypt",
            description:
              "Megsy AI unifies chat, image, video, code and file analysis in a single workspace, priced in one credit.",
            sameAs: ["https://twitter.com/MegsyAI"],
          })}
        </script>
      </Helmet>

      {/* ============== HERO ============== */}
      <section className="p-2 sm:p-3 md:p-4">
        <div className="relative w-full h-[92vh] min-h-[560px] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden">
          {/* Video background */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-[65%] lg:object-center z-0"
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
          {/* Soft gradient overlay to keep text readable */}
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/40 via-transparent to-white/40" />

          {/* Content layer */}
          <div className="relative z-10 h-full flex flex-col">
            <Navbar onCta={goSignup} />

            <div className="flex-1 flex flex-col items-center justify-center text-center px-5 pt-16">
              <HeroBadge />

              <motion.h1
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-[80px] font-normal mb-3 tracking-tight leading-[1.05]"
                style={{ color: "#5E6470" }}
              >
                One Workspace,<br />Every AI Tool
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-sm sm:text-base md:text-lg opacity-80 leading-relaxed max-w-xl font-normal"
                style={{ color: "#5E6470" }}
              >
                Chat, image, video, code and file analysis — unified behind a single workspace and a single credit. Two founders, built in Cairo.
              </motion.p>
            </div>

            <BottomLeftCard onCta={goSignup} />
            <BottomRightCorner onClick={goDocs} />
          </div>
        </div>
      </section>

      {/* ============== STATS ============== */}
      <section className="px-4 sm:px-6 md:px-8 mt-6 md:mt-10">
        <div className="mx-auto max-w-6xl rounded-[1.5rem] md:rounded-[2rem] bg-white/60 backdrop-blur-xl border border-white/40 p-6 md:p-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.k}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-center md:text-left"
            >
              <p className="text-[36px] md:text-[52px] leading-none tracking-tight font-normal" style={{ color: INK }}>
                {s.v}
              </p>
              <p className="mt-2 text-[10px] md:text-[11px] uppercase tracking-[0.18em]" style={{ color: INK_SOFT }}>
                {s.k}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============== MISSION ============== */}
      <section className="px-4 sm:px-6 md:px-8 mt-16 md:mt-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/40 mb-5">
            <span className="text-[11px] uppercase tracking-[0.22em]" style={{ color: INK_SOFT }}>
              Why we built it
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.05]" style={{ color: "#5E6470" }}>
            Too many tabs. Too many subscriptions.
          </h2>
          <p className="mt-6 text-base md:text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: INK_SOFT }}>
            Every new AI model arrives in its own tab, with its own pricing and its own quirks. Megsy puts chat, images, video, code and files together — on the best engines available, priced in a single credit.
          </p>
        </div>
      </section>

      {/* ============== FOUNDERS ============== */}
      <section className="px-4 sm:px-6 md:px-8 mt-16 md:mt-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: INK_SOFT }}>
                The founders
              </p>
              <h2 className="mt-2 text-3xl md:text-5xl font-normal tracking-tight leading-[1.05]" style={{ color: "#5E6470" }}>
                Two builders. One workspace.
              </h2>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {founders.map((f, i) => (
              <motion.article
                key={f.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-white/60 backdrop-blur-xl border border-white/40"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={f.img}
                    alt={f.name}
                    loading="lazy"
                    width={1024}
                    height={1280}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <div className="p-5 md:p-7">
                  <p className="text-[20px] md:text-[24px] font-normal tracking-tight" style={{ color: INK }}>
                    {f.name}
                  </p>
                  <p className="mt-1 text-[10.5px] uppercase tracking-[0.2em]" style={{ color: INK_SOFT }}>
                    {f.role}
                  </p>
                  <p className="mt-4 text-[14px] leading-relaxed" style={{ color: INK_SOFT }}>
                    {f.bio}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ============== VALUES ============== */}
      <section className="px-4 sm:px-6 md:px-8 mt-16 md:mt-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <p className="text-[11px] uppercase tracking-[0.22em]" style={{ color: INK_SOFT }}>
              What we believe
            </p>
            <h2 className="mt-2 text-3xl md:text-5xl font-normal tracking-tight leading-[1.05]" style={{ color: "#5E6470" }}>
              Four quiet principles.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <motion.div
                key={v.t}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-[1.25rem] md:rounded-[1.5rem] p-5 md:p-6 bg-white/60 backdrop-blur-xl border border-white/40"
              >
                <p className="text-[16px] md:text-[18px] font-normal tracking-tight" style={{ color: INK }}>
                  {v.t}
                </p>
                <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: INK_SOFT }}>
                  {v.d}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============== CTA ============== */}
      <section className="px-4 sm:px-6 md:px-8 mt-16 md:mt-24 pb-16 md:pb-24">
        <div className="mx-auto max-w-4xl rounded-[1.5rem] md:rounded-[2.5rem] bg-white/60 backdrop-blur-xl border border-white/40 p-8 md:p-14 text-center">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.05]" style={{ color: "#5E6470" }}>
            Try Megsy for yourself.
          </h2>
          <p className="mt-4 text-base md:text-lg leading-relaxed max-w-md mx-auto" style={{ color: INK_SOFT }}>
            One workspace. One credit. Every tool. Built in Cairo, made for the world.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={goSignup}
              className="flex items-center bg-[rgba(30,50,90,0.9)] text-white rounded-full pl-2 pr-6 py-2 gap-3 hover:bg-[rgba(30,50,90,1)] transition-colors group"
            >
              <span className="bg-white/15 rounded-full w-8 h-8 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-white transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
              <span className="text-sm font-normal">Start free</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={goContact}
              className="flex items-center bg-white rounded-full pl-2 pr-6 py-2 gap-3 border border-white/60 hover:bg-white/90 transition-colors group"
            >
              <span className="bg-[rgba(30,50,90,0.08)] rounded-full w-8 h-8 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" style={{ color: INK }} />
              </span>
              <span className="text-sm font-normal" style={{ color: INK }}>Talk to us</span>
            </motion.button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

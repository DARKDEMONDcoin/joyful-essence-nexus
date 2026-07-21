/** @doc XPromoPage — /x cinematic promo landing with copy-prompt CTA → /pricing. */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const PROMPT_TEXT = `Create a highly polished, responsive Hero Section using a single HTML file. Use Tailwind CSS via CDN for styling, Google Fonts for typography, and vanilla JavaScript for interactivity.

Follow these strict structural and styling requirements exactly:

1. Global Setup & Animations (CSS in <style>):
- Body: bg-[#e5e7eb], min-h-screen, flex items-center justify-center, p-4.
- Fonts: Import 'Inter' (sans-serif) and 'Playfair Display' (serif, italic).
- Custom Animations: Create @keyframes fadeInUp (opacity 0 to 1, transform translateY 30px to 0).
- Create .stagger-item + delay classes: .delay-bg (0.2s), .delay-nav (1.0s), .delay-h1 (1.8s), .delay-p (2.6s), .delay-btn (3.4s).

2. Main Container & Background Video:
- Wrapper: relative w-full max-w-[1400px] aspect-[4/3] md:aspect-[16/9] min-h-[600px] md:min-h-[800px] rounded-[2rem] overflow-hidden shadow-2xl bg-black. .delay-bg.
- <video> autoplay loop muted playsinline object-cover opacity-90.
- Video URL: https://cdn.sceneai.art/Hero%20Section%20Video/e988037c-bf57-4b3b-8ba9-b69167028de8.mp4
- Overlay: absolute inset-0 bg-black/20.

3. Navigation (top): logo "Ratw", desktop nav (Home, Pricing, About, Insights, Contact), "Get template" button, mobile hamburger → dropdown.

4. Hero Content (bottom):
- H1: text-[58px] font-semibold, "Plan better, <br> start your day right". Word "right" in Playfair Display italic.
- P: text-white/90 18-20px, "A smarter planner for tasks<br>priorities and daily structure".
- CTA: "Create your plan" white bg rounded-full.`;

const VIDEO_URL = "https://cdn.sceneai.art/Hero%20Section%20Video/e988037c-bf57-4b3b-8ba9-b69167028de8.mp4";

export default function XPromoPage() {
  const navigate = useNavigate();
  const [copying, setCopying] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const prev = document.title;
    document.title = "عرض خاص — خصم 7% + نماذج غير محدودة | Megsy AI";
    // Load Playfair Display for the italic accent word
    const linkId = "x-playfair-font";
    if (!document.getElementById(linkId)) {
      const l = document.createElement("link");
      l.id = linkId;
      l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,500;1,600&family=Inter:wght@300;400;500;600;700&display=swap";
      document.head.appendChild(l);
    }
    return () => { document.title = prev; };
  }, []);

  const handleCopy = async () => {
    if (copying) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(PROMPT_TEXT);
      toast({
        title: "تم نسخ البرومبت الآن ✅",
        description: "هل تريد الحصول على التخفيض والعرض الخاص بنا؟ سيتم توجيهك...",
      });
      setTimeout(() => navigate("/pricing"), 1400);
    } catch {
      toast({ title: "تعذر النسخ", description: "حاول مرة أخرى", variant: "destructive" });
      setCopying(false);
    }
  };

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center bg-[#e5e7eb] p-4"
      style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}
    >
      {/* Main container */}
      <div className="stagger-item delay-bg relative aspect-[4/3] min-h-[600px] w-full max-w-[1400px] overflow-hidden rounded-[2rem] bg-black shadow-2xl md:aspect-[16/9] md:min-h-[800px]">
        {/* Background video */}
        <div className="absolute inset-0 h-full w-full">
          <video
            className="h-full w-full object-cover opacity-90"
            src={VIDEO_URL}
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />
        </div>

        {/* Nav */}
        <div className="stagger-item delay-nav absolute left-0 top-0 z-30 flex w-full items-start justify-between p-6 md:items-center md:p-10">
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-bold uppercase tracking-[0.2em] text-white"
          >
            Megsy
          </button>

          <nav className="hidden items-center space-x-8 md:flex">
            {[
              { label: "Home", to: "/" },
              { label: "Pricing", to: "/pricing" },
              { label: "About", to: "/about" },
              { label: "FAQ", to: "/features-guide" },
            ].map((l) => (
              <button
                key={l.label}
                onClick={() => navigate(l.to)}
                className="text-[14px] font-medium text-white/95 transition hover:text-white"
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => navigate("/pricing")}
              className="rounded-full bg-white px-5 py-2 text-[13px] font-semibold text-black transition hover:scale-105"
            >
              Get Offer
            </button>
          </nav>

          {/* Mobile toggle */}
          <div className="relative md:hidden">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black transition"
              aria-label="menu"
            >
              {menuOpen ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
            <div
              className={`absolute right-0 top-16 w-64 rounded-2xl bg-white p-4 shadow-2xl transition-all duration-300 ${
                menuOpen
                  ? "visible translate-y-0 scale-100 opacity-100"
                  : "invisible -translate-y-2 scale-95 opacity-0"
              }`}
            >
              {[
                { label: "Home", to: "/" },
                { label: "Pricing", to: "/pricing" },
                { label: "About", to: "/about" },
                { label: "FAQ", to: "/features-guide" },
              ].map((l) => (
                <button
                  key={l.label}
                  onClick={() => { setMenuOpen(false); navigate(l.to); }}
                  className="block w-full rounded-lg px-3 py-2 text-right text-[14px] font-medium text-black transition hover:bg-black/5"
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-end px-4 pb-12 text-center md:pb-24">
          {/* Discount badge */}
          <div className="stagger-item delay-h1 mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[12px] font-medium text-white backdrop-blur-md">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            خصم 7% على الشهر الأول • عرض محدود
          </div>

          <h1 className="stagger-item delay-h1 text-[42px] font-semibold leading-[1.05] tracking-[-0.02em] text-white md:text-[58px]">
            Unlimited Access,
            <br className="hidden md:block" /> at your{" "}
            <span
              className="italic text-white/95"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
            >
              fingertips
            </span>
          </h1>

          <p
            dir="rtl"
            className="stagger-item delay-p mt-5 max-w-[540px] text-[16px] font-medium leading-[1.6] text-white/90 md:text-[18px]"
          >
            خصم 7% على الشهر الأول
            <br />
            وجميع النماذج بلا حدود لجميع المشتركين
          </p>

          {/* Model pills */}
          <div className="stagger-item delay-p mt-5 flex flex-wrap items-center justify-center gap-2">
            {["GPT-5", "Claude", "Gemini", "DeepSeek", "Grok", "Qwen"].map((m) => (
              <span
                key={m}
                className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11.5px] font-medium text-white/95 backdrop-blur-md"
              >
                {m} • Unlimited
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="stagger-item delay-btn mt-8 flex flex-col items-center gap-3">
            <button
              onClick={handleCopy}
              disabled={copying}
              className="x-cta group relative inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-[15px] font-medium text-black transition-all hover:scale-[1.04] active:scale-[0.98] disabled:opacity-80"
            >
              {copying ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeLinecap="round" />
                  </svg>
                  جاري النسخ...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  انسخ البرومبت
                </>
              )}
            </button>
            <button
              onClick={() => navigate("/pricing")}
              className="text-[13px] font-medium text-white/80 underline-offset-4 transition hover:text-white hover:underline"
            >
              أو انتقل مباشرة إلى الأسعار
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes xFadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stagger-item { opacity: 0; animation: xFadeInUp .9s cubic-bezier(.2,.8,.2,1) forwards; }
        .delay-bg  { animation-delay: 0.2s; }
        .delay-nav { animation-delay: 1.0s; }
        .delay-h1  { animation-delay: 1.8s; }
        .delay-p   { animation-delay: 2.6s; }
        .delay-btn { animation-delay: 3.4s; }
        .x-cta { box-shadow: 0 0 0 rgba(255,255,255,0); }
        .x-cta:hover { box-shadow: 0 0 45px 4px rgba(255,255,255,0.4), 0 10px 30px -8px rgba(255,255,255,0.5); }
      `}</style>
    </div>
  );
}
